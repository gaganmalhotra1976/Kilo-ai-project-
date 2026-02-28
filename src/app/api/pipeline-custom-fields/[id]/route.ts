import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { pipelineCustomFields } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const body = await req.json();
    const { name, fieldType, options, sortOrder } = body;
    const [row] = await db
      .update(pipelineCustomFields)
      .set({ name, fieldType, options: options ? JSON.stringify(options) : null, sortOrder })
      .where(eq(pipelineCustomFields.id, Number(id)))
      .returning();
    if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(row);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to update custom field" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await db.delete(pipelineCustomFields).where(eq(pipelineCustomFields.id, Number(id)));
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to delete custom field" }, { status: 500 });
  }
}
