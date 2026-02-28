import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { pipelineStages } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const body = await req.json();
    const { name, color, sortOrder } = body;
    
    try {
      const [row] = await db
        .update(pipelineStages)
        .set({ name, color, sortOrder })
        .where(eq(pipelineStages.id, Number(id)))
        .returning();
      if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
      return NextResponse.json(row);
    } catch (dbError) {
      console.error("Pipeline stages table doesn't exist:", dbError);
      return NextResponse.json({ error: "Pipeline system not available. Please apply database migration 0007." }, { status: 503 });
    }
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to update stage" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    try {
      await db.delete(pipelineStages).where(eq(pipelineStages.id, Number(id)));
      return NextResponse.json({ success: true });
    } catch (dbError) {
      console.error("Pipeline stages table doesn't exist:", dbError);
      return NextResponse.json({ error: "Pipeline system not available. Please apply database migration 0007." }, { status: 503 });
    }
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to delete stage" }, { status: 500 });
  }
}
