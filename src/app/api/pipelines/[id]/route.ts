import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { pipelines } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const [row] = await db.select().from(pipelines).where(eq(pipelines.id, Number(id)));
    if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(row);
  } catch (e) {
    console.error(e);
    // Return empty if table doesn't exist
    return NextResponse.json({ error: "Pipeline system not available" }, { status: 503 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const body = await req.json();
    const { name, description, isArchived } = body;
    
    try {
      const [row] = await db
        .update(pipelines)
        .set({ name, description, isArchived, updatedAt: new Date() })
        .where(eq(pipelines.id, Number(id)))
        .returning();
      if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
      return NextResponse.json(row);
    } catch (dbError) {
      console.error("Pipeline table doesn't exist:", dbError);
      return NextResponse.json({ error: "Pipeline system not available. Please apply database migration 0007." }, { status: 503 });
    }
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to update pipeline" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    try {
      await db.delete(pipelines).where(eq(pipelines.id, Number(id)));
      return NextResponse.json({ success: true });
    } catch (dbError) {
      console.error("Pipeline table doesn't exist:", dbError);
      return NextResponse.json({ error: "Pipeline system not available. Please apply database migration 0007." }, { status: 503 });
    }
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to delete pipeline" }, { status: 500 });
  }
}
