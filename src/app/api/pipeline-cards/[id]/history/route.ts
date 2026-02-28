import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { pipelineCardHistory } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const rows = await db
      .select()
      .from(pipelineCardHistory)
      .where(eq(pipelineCardHistory.cardId, Number(id)))
      .orderBy(desc(pipelineCardHistory.movedAt));
    return NextResponse.json(rows);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to fetch history" }, { status: 500 });
  }
}
