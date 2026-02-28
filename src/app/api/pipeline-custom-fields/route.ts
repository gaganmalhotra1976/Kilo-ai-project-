import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { pipelineCustomFields } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const pipelineId = req.nextUrl.searchParams.get("pipelineId");
  try {
    const rows = pipelineId
      ? await db.select().from(pipelineCustomFields).where(eq(pipelineCustomFields.pipelineId, Number(pipelineId))).orderBy(pipelineCustomFields.sortOrder)
      : await db.select().from(pipelineCustomFields).orderBy(pipelineCustomFields.sortOrder);
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
    const { pipelineId, name, fieldType, options, sortOrder } = body;
    if (!pipelineId || !name) return NextResponse.json({ error: "pipelineId and name required" }, { status: 400 });
    const [row] = await db.insert(pipelineCustomFields).values({
      pipelineId, name, fieldType: fieldType ?? "text",
      options: options ? JSON.stringify(options) : null,
      sortOrder: sortOrder ?? 0,
    }).returning();
    return NextResponse.json(row, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to create custom field" }, { status: 500 });
  }
}
