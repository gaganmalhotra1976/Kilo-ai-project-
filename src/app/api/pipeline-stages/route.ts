import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { pipelineStages } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const pipelineId = req.nextUrl.searchParams.get("pipelineId");
  try {
    const query = db.select().from(pipelineStages);
    const rows = pipelineId
      ? await query.where(eq(pipelineStages.pipelineId, Number(pipelineId))).orderBy(pipelineStages.sortOrder)
      : await query.orderBy(pipelineStages.sortOrder);
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
    const { pipelineId, name, color, sortOrder } = body;
    if (!pipelineId || !name) return NextResponse.json({ error: "pipelineId and name required" }, { status: 400 });
    const [row] = await db.insert(pipelineStages).values({ pipelineId, name, color: color ?? "#6366f1", sortOrder: sortOrder ?? 0 }).returning();
    return NextResponse.json(row, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to create stage" }, { status: 500 });
  }
}
