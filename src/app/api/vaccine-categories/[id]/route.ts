import { NextResponse } from "next/server";
import { db } from "@/db";
import { vaccineCategories } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { name, description, icon, sortOrder, isActive } = body;
    const [row] = await db
      .update(vaccineCategories)
      .set({
        name,
        description: description ?? null,
        icon: icon ?? null,
        sortOrder: sortOrder ?? 0,
        isActive: isActive ?? true,
      })
      .where(eq(vaccineCategories.id, Number(id)))
      .returning();
    if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(row);
  } catch (err) {
    console.error("PUT /api/vaccine-categories/[id] error:", err);
    return NextResponse.json({ error: "Failed to update vaccine category" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await db.delete(vaccineCategories).where(eq(vaccineCategories.id, Number(id)));
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/vaccine-categories/[id] error:", err);
    return NextResponse.json({ error: "Failed to delete vaccine category" }, { status: 500 });
  }
}
