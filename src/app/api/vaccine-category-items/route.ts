import { NextResponse } from "next/server";
import { db } from "@/db";
import { vaccineCategoryItems, vaccines } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get("categoryId");

    const conditions = [eq(vaccineCategoryItems.isActive, true)];
    if (categoryId) {
      conditions.push(eq(vaccineCategoryItems.categoryId, parseInt(categoryId, 10)) as any);
    }

    const items = await db
      .select({
        id: vaccineCategoryItems.id,
        categoryId: vaccineCategoryItems.categoryId,
        vaccineId: vaccineCategoryItems.vaccineId,
        isActive: vaccineCategoryItems.isActive,
        vaccineName: vaccines.name,
        vaccineBrand: vaccines.brand,
        vaccineMrp: vaccines.mrp,
      })
      .from(vaccineCategoryItems)
      .leftJoin(vaccines, eq(vaccineCategoryItems.vaccineId, vaccines.id))
      .where(and(...conditions));

    return NextResponse.json(items);
  } catch (err) {
    console.error("GET /api/vaccine-category-items error:", err);
    return NextResponse.json({ error: "Failed to fetch items" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { categoryId, vaccineId } = body;
    if (!categoryId || !vaccineId) {
      return NextResponse.json({ error: "categoryId and vaccineId are required" }, { status: 400 });
    }
    const [row] = await db
      .insert(vaccineCategoryItems)
      .values({
        categoryId: Number(categoryId),
        vaccineId: Number(vaccineId),
        isActive: true,
      })
      .returning();
    return NextResponse.json(row, { status: 201 });
  } catch (err) {
    console.error("POST /api/vaccine-category-items error:", err);
    return NextResponse.json({ error: "Failed to link vaccine to category" }, { status: 500 });
  }
}
