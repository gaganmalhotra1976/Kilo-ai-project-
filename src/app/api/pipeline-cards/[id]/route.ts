import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { pipelineCards, pipelineCardHistory, pipelineStages, bookings, payments } from "@/db/schema";
import { eq } from "drizzle-orm";
import { triggerPipelineStageChanged as sendPipelineWebhook } from "@/lib/webhooks";

// Helper webhook function (enabled now)
async function triggerPipelineStageChanged(cardData: any, triggeredBy: string | null = null) {
  try {
    await sendPipelineWebhook(cardData, triggeredBy);
  } catch (error) {
    console.error("Error triggering pipeline stage webhook:", error);
  }
}

// Helper function to sync booking status when pipeline stage changes
async function syncBookingStatus(card: any, newStageName: string) {
  if (!card.bookingId) return;

  try {
    let newBookingStatus: string | null = null;
    let newPaymentStatus: string | null = null;

    switch (newStageName) {
      case "Quote Sent":
        newBookingStatus = "quoted";
        break;
      case "Advance Received":
        newBookingStatus = "confirmed";
        newPaymentStatus = "partial";
        break;
      case "Converted / Fully Paid":
        newBookingStatus = "confirmed";
        newPaymentStatus = "paid";
        break;
      case "Lost":
        newBookingStatus = "cancelled";
        break;
    }

    if (newBookingStatus) {
      const updateData: any = { 
        status: newBookingStatus,
        updatedAt: new Date() 
      };
      
      if (newPaymentStatus) {
        updateData.paymentStatus = newPaymentStatus;
      }

      await db.update(bookings)
        .set(updateData)
        .where(eq(bookings.id, card.bookingId));
    }
  } catch (error) {
    console.error("Error syncing booking status:", error);
  }
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const [row] = await db.select().from(pipelineCards).where(eq(pipelineCards.id, Number(id)));
    if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(row);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Pipeline system not available" }, { status: 503 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const body = await req.json();
    const { stageId, title, customerId, customerName, assignedTo, dueDate, priority, notes, attachments, bookingId, quoteId, isArchived, sortOrder, movedBy } = body;

    try {
      // Fetch current card to detect stage change
      const [current] = await db.select().from(pipelineCards).where(eq(pipelineCards.id, Number(id)));
      if (!current) return NextResponse.json({ error: "Not found" }, { status: 404 });

      const [row] = await db
        .update(pipelineCards)
        .set({ stageId, title, customerId, customerName, assignedTo, dueDate, priority, notes, attachments, bookingId, quoteId, isArchived, sortOrder, updatedAt: new Date() })
        .where(eq(pipelineCards.id, Number(id)))
        .returning();

      // Log stage change
      if (stageId && stageId !== current.stageId) {
        await db.insert(pipelineCardHistory).values({
          cardId: Number(id),
          fromStageId: current.stageId,
          toStageId: stageId,
          movedBy: movedBy ?? "admin",
        });

        // Get new stage name for booking status sync
        const [newStage] = await db.select().from(pipelineStages).where(eq(pipelineStages.id, stageId));
        if (newStage) {
          // Sync booking status based on pipeline stage
          await syncBookingStatus(row, newStage.name);

          // Create payment record if advance received
          if (newStage.name === "Advance Received" && body.amountReceived) {
            try {
              await db.insert(payments).values({
                bookingId: row.bookingId,
                amount: body.amountReceived,
                paymentMethod: body.paymentMethod || "Cash",
                status: "received",
                receivedAt: new Date(),
              });
            } catch (paymentError) {
              console.error("Error creating payment record:", paymentError);
            }
          }

          // Trigger webhook for stage change using unified system
          await triggerPipelineStageChanged({
            cardId: Number(id),
            stageId: stageId,
            stageName: newStage.name,
            bookingId: row.bookingId,
            cardTitle: row.title,
            previousStageId: current.stageId
          }, movedBy ?? "admin");
        }
      }

      return NextResponse.json(row);
    } catch (dbError) {
      console.error("Pipeline cards table doesn't exist:", dbError);
      return NextResponse.json({ error: "Pipeline system not available. Please apply database migration 0007." }, { status: 503 });
    }
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to update card" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    try {
      await db.delete(pipelineCards).where(eq(pipelineCards.id, Number(id)));
      return NextResponse.json({ success: true });
    } catch (dbError) {
      console.error("Pipeline cards table doesn't exist:", dbError);
      return NextResponse.json({ error: "Pipeline system not available. Please apply database migration 0007." }, { status: 503 });
    }
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to delete card" }, { status: 500 });
  }
}
