import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { pipelineCards, pipelineCardHistory, pipelineStages } from "@/db/schema";
import { eq } from "drizzle-orm";

// Webhook configuration
const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL || "https://n8n.example.com/webhook/pipeline.stage.changed";

async function triggerN8nWebhook(cardId: number, stageName: string, bookingId: number | null, cardTitle: string) {
  try {
    const webhookPayload = {
      event: "pipeline.stage.changed",
      cardId,
      stageName,
      bookingId,
      cardTitle,
      timestamp: new Date().toISOString()
    };
    
    // Fire and forget - don't await to avoid blocking the response
    fetch(N8N_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(webhookPayload)
    }).catch(err => console.error("Webhook trigger failed:", err));
    
    console.log(`🔗 Triggered webhook for stage: ${stageName}, card: ${cardTitle}`);
  } catch (error) {
    console.error("Webhook error:", error);
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
    return NextResponse.json({ error: "Failed to fetch card" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const body = await req.json();
    const { stageId, title, customerId, customerName, assignedTo, dueDate, priority, notes, attachments, bookingId, quoteId, isArchived, sortOrder, movedBy } = body;

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

      // Check if moving to "Nurse Assigned" stage and trigger webhook
      const [newStage] = await db.select().from(pipelineStages).where(eq(pipelineStages.id, stageId));
      if (newStage && newStage.name === "Nurse Assigned") {
        await triggerN8nWebhook(Number(id), newStage.name, row.bookingId, row.title);
      }
    }

    return NextResponse.json(row);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to update card" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await db.delete(pipelineCards).where(eq(pipelineCards.id, Number(id)));
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to delete card" }, { status: 500 });
  }
}
