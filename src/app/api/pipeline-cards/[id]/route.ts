import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { pipelineCards, pipelineCardHistory, pipelineStages } from "@/db/schema";
import { eq } from "drizzle-orm";
// import { triggerPipelineStageChanged } from "@/lib/webhooks";

// Temporarily disabled - can be re-enabled after database migration
async function triggerPipelineStageChanged(_cardData: any, _triggeredBy: string | null = null) {
  console.log("Webhook disabled until migration is applied");
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

      // Trigger webhook for stage change using unified system
      const [newStage] = await db.select().from(pipelineStages).where(eq(pipelineStages.id, stageId));
      if (newStage) {
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
