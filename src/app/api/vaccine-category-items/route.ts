import { NextResponse } from "next/server";
import { db } from "@/db";
import { vaccineCategoryItems } from "@/db/schema";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { categoryId, name, description, ageGroup, dosesRequired, notes, sortOrder, isActive } = body;
    if (!categoryId || !name) {
      return NextResponse.json({ error: "categoryId and name are required" }, { status: 400 });
    }
    const [row] = await db
      .insert(vaccineCategoryItems)
      .values({
        categoryId: Number(categoryId),
        name,
        description: description ?? null,
        ageGroup: ageGroup ?? null,
        dosesRequired: dosesRequired ?? 1,
        notes: notes ?? null,
        sortOrder: sortOrder ?? 0,
        isActive: isActive ?? true,
      })
      .returning();
    return NextResponse.json(row, { status: 201 });
  } catch (err) {
    console.error("POST /api/vaccine-category-items error:", err);
    return NextResponse.json({ error: "Failed to create vaccine item" }, { status: 500 });
  }
}
