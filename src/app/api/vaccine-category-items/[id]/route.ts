import { NextResponse } from "next/server";
import { db } from "@/db";
import { vaccineCategoryItems } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { categoryId, vaccineId, isActive } = body;
    const [row] = await db
      .update(vaccineCategoryItems)
      .set({
        categoryId: categoryId ? Number(categoryId) : undefined,
        vaccineId: vaccineId ? Number(vaccineId) : undefined,
        isActive: isActive ?? true,
      })
      .where(eq(vaccineCategoryItems.id, Number(id)))
      .returning();
    if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(row);
  } catch (err) {
    console.error("PUT /api/vaccine-category-items/[id] error:", err);
    return NextResponse.json({ error: "Failed to update vaccine item" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await db.delete(vaccineCategoryItems).where(eq(vaccineCategoryItems.id, Number(id)));
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/vaccine-category-items/[id] error:", err);
    return NextResponse.json({ error: "Failed to delete vaccine item" }, { status: 500 });
  }
}
