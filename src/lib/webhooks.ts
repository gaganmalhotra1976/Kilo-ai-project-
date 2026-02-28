import { db } from "@/db";
import { settings, webhookLogs } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export type WebhookEvent = 
  | "booking.created" 
  | "booking.updated" 
  | "booking.cancelled" 
  | "quote.sent" 
  | "support.ticket.created" 
  | "support.ticket.resolved" 
  | "pipeline.stage.changed"
  | "payment.received";

export interface WebhookPayload {
  event: WebhookEvent;
  timestamp: string;
  data: Record<string, any>;
  triggered_by: string | null;
}

export async function getWebhookConfig(): Promise<{ url: string; secret: string }> {
  const webhookUrlSetting = await db.query.settings.findFirst({
    where: eq(settings.key, "webhook_url"),
  });
  
  const webhookSecretSetting = await db.query.settings.findFirst({
    where: eq(settings.key, "webhook_secret"),
  });

  return {
    url: webhookUrlSetting?.value || "",
    secret: webhookSecretSetting?.value || ""
  };
}

export async function triggerWebhook(
  event: WebhookEvent, 
  data: Record<string, any>, 
  triggeredBy: string | null = null
): Promise<void> {
  const { url, secret } = await getWebhookConfig();

  // Don't proceed if webhook URL is not configured
  if (!url) {
    console.log(`⚠️ Webhook URL not configured, skipping ${event} event`);
    return;
  }

  const payload: WebhookPayload = {
    event,
    timestamp: new Date().toISOString(),
    data,
    triggered_by: triggeredBy
  };

  const payloadString = JSON.stringify(payload);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-webhook-secret": secret,
      },
      body: payloadString,
    });

    const responseBody = await response.text();

    // Log the webhook attempt
    await db.insert(webhookLogs).values({
      event,
      payload: payloadString,
      responseCode: response.status,
      responseBody,
      success: response.ok,
      errorMessage: response.ok ? null : `HTTP ${response.status}: ${responseBody.substring(0, 500)}`,
      triggeredBy,
      retryCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    if (response.ok) {
      console.log(`✅ Webhook triggered successfully: ${event}`);
    } else {
      console.error(`❌ Webhook failed: ${event}`, response.status, responseBody);
    }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    
    // Log the failed webhook attempt
    await db.insert(webhookLogs).values({
      event,
      payload: payloadString,
      responseCode: null,
      responseBody: null,
      success: false,
      errorMessage,
      triggeredBy,
      retryCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    console.error(`❌ Webhook error: ${event}`, errorMessage);
  }
}

export async function retryWebhook(webhookLogId: number): Promise<boolean> {
  const webhookLog = await db.query.webhookLogs.findFirst({
    where: eq(webhookLogs.id, webhookLogId),
  });

  if (!webhookLog) {
    throw new Error("Webhook log not found");
  }

  const { url, secret } = await getWebhookConfig();
  
  if (!url) {
    throw new Error("Webhook URL not configured");
  }

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-webhook-secret": secret,
      },
      body: webhookLog.payload,
    });

    const responseBody = await response.text();

    // Update the webhook log with the retry result
    await db.update(webhookLogs)
      .set({
        responseCode: response.status,
        responseBody,
        success: response.ok,
        errorMessage: response.ok ? null : `HTTP ${response.status}: ${responseBody.substring(0, 500)}`,
        retryCount: webhookLog.retryCount + 1,
        updatedAt: new Date(),
      })
      .where(eq(webhookLogs.id, webhookLogId));

    return response.ok;

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    
    await db.update(webhookLogs)
      .set({
        success: false,
        errorMessage,
        retryCount: webhookLog.retryCount + 1,
        updatedAt: new Date(),
      })
      .where(eq(webhookLogs.id, webhookLogId));

    return false;
  }
}

// Helper functions for each event type
export async function triggerBookingCreated(bookingData: any, triggeredBy: string | null = null) {
  await triggerWebhook("booking.created", bookingData, triggeredBy);
}

export async function triggerBookingUpdated(bookingData: any, triggeredBy: string | null = null) {
  await triggerWebhook("booking.updated", bookingData, triggeredBy);
}

export async function triggerBookingCancelled(bookingData: any, triggeredBy: string | null = null) {
  await triggerWebhook("booking.cancelled", bookingData, triggeredBy);
}

export async function triggerQuoteSent(quoteData: any, triggeredBy: string | null = null) {
  await triggerWebhook("quote.sent", quoteData, triggeredBy);
}

export async function triggerSupportTicketCreated(ticketData: any, triggeredBy: string | null = null) {
  await triggerWebhook("support.ticket.created", ticketData, triggeredBy);
}

export async function triggerSupportTicketResolved(ticketData: any, triggeredBy: string | null = null) {
  await triggerWebhook("support.ticket.resolved", ticketData, triggeredBy);
}

export async function triggerPipelineStageChanged(cardData: any, triggeredBy: string | null = null) {
  await triggerWebhook("pipeline.stage.changed", cardData, triggeredBy);
}

export async function triggerPaymentReceived(paymentData: any, triggeredBy: string | null = null) {
  await triggerWebhook("payment.received", paymentData, triggeredBy);
}
