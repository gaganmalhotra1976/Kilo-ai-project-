import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { pipelineCards, pipelineCardHistory } from "@/db/schema";
import { eq } from "drizzle-orm";

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
