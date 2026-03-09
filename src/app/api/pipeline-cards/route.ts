import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { pipelineCards, pipelineCardHistory, pipelines, pipelineStages } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const pipelineId = req.nextUrl.searchParams.get("pipelineId");
  const stageId = req.nextUrl.searchParams.get("stageId");
  try {
    let query = db.select().from(pipelineCards).$dynamic();
    const conditions = [eq(pipelineCards.isArchived, false)];
    if (pipelineId) conditions.push(eq(pipelineCards.pipelineId, Number(pipelineId)));
    if (stageId) conditions.push(eq(pipelineCards.stageId, Number(stageId)));
    const rows = await query.where(and(...conditions)).orderBy(pipelineCards.sortOrder);
    return NextResponse.json(rows);
  } catch (e) {
    console.error(e);
    // Return empty array if table doesn't exist yet
    return NextResponse.json([]);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { pipelineId, stageId, title, customerId, customerName, assignedTo, dueDate, priority, notes, bookingId, quoteId, source } = body;
    if (!pipelineId || !stageId || !title) {
      return NextResponse.json({ error: "pipelineId, stageId, title required" }, { status: 400 });
    }
    
    try {
      const [row] = await db.insert(pipelineCards).values({
        pipelineId, stageId, title, customerId, customerName, assignedTo, dueDate,
        priority: priority ?? "medium", notes, bookingId, quoteId, source,
      }).returning();
      // Log initial stage placement
      await db.insert(pipelineCardHistory).values({
        cardId: row.id, fromStageId: null, toStageId: stageId, movedBy: "system", note: "Card created",
      });
      return NextResponse.json(row, { status: 201 });
    } catch (dbError) {
      console.error("Pipeline cards table doesn't exist:", dbError);
      return NextResponse.json({ error: "Pipeline system not available. Please apply database migration 0007." }, { status: 503 });
    }
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to create card" }, { status: 500 });
  }
}
