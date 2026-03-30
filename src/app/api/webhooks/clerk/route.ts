import { NextRequest, NextResponse } from "next/server";
import { Webhook } from "svix";
import { db } from "@/db";
import { patients } from "@/db/schema";
import { eq } from "drizzle-orm";

// ── Types ─────────────────────────────────────────────────────────────────────

interface ClerkEmailAddress {
  email_address: string;
}

interface ClerkPhoneNumber {
  phone_number: string;
}

interface ClerkUserEventData {
  id: string;
  email_addresses: ClerkEmailAddress[];
  first_name?: string;
  last_name?: string;
  phone_numbers?: ClerkPhoneNumber[];
}

interface ClerkWebhookEvent {
  type: string;
  data: ClerkUserEventData;
}

// ── Clerk webhook — verified via svix signature ───────────────────────────────
//
// Required env var: CLERK_WEBHOOK_SECRET
// Set this in the Clerk dashboard under Webhooks → endpoint → Signing Secret.

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("CLERK_WEBHOOK_SECRET is not set");
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 }
    );
  }

  // ── 1. Verify svix signature ───────────────────────────────────────────────
  const svixId = req.headers.get("svix-id");
  const svixTimestamp = req.headers.get("svix-timestamp");
  const svixSignature = req.headers.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json(
      { error: "Missing svix headers" },
      { status: 400 }
    );
  }

  const rawBody = await req.text();

  let event: ClerkWebhookEvent;
  try {
    const wh = new Webhook(webhookSecret);
    const verified = wh.verify(rawBody, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    });
    event = verified as unknown as ClerkWebhookEvent;
  } catch (err) {
    console.error("Clerk webhook signature verification failed:", err);
    return NextResponse.json(
      { error: "Invalid webhook signature" },
      { status: 401 }
    );
  }

  // ── 2. Handle event ────────────────────────────────────────────────────────
  const { type, data } = event;

  try {
    switch (type) {
      case "user.created":
      case "user.updated": {
        const { email_addresses, first_name, last_name, phone_numbers } = data;
        const primaryEmail = email_addresses?.[0]?.email_address;

        if (!primaryEmail) {
          return NextResponse.json({ error: "No email found" }, { status: 400 });
        }

        const patientName = first_name
          ? `${first_name} ${last_name || ""}`.trim()
          : primaryEmail.split("@")[0];

        const phone = phone_numbers?.[0]?.phone_number || null;

        // Upsert patient record
        const existing = await db
          .select()
          .from(patients)
          .where(eq(patients.email, primaryEmail));

        if (existing.length > 0) {
          await db
            .update(patients)
            .set({
              name: patientName,
              phone: phone || existing[0].phone,
            })
            .where(eq(patients.email, primaryEmail));
        } else {
          await db.insert(patients).values({
            name: patientName,
            email: primaryEmail,
            phone: phone ?? "", // phone is notNull in schema; Clerk may not provide it
            city: "Delhi",
          });
        }

        console.log(`[clerk-webhook] ${type}: ${primaryEmail}`);
        break;
      }

      case "user.deleted": {
        // Soft-delete or archive — no hard delete to preserve booking history
        console.log(`[clerk-webhook] user.deleted: ${data.id}`);
        break;
      }

      default:
        console.log(`[clerk-webhook] Unhandled event type: ${type}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[clerk-webhook] Handler error:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
