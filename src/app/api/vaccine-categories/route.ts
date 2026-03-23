import { NextResponse } from "next/server";
import { db } from "@/db";
import { vaccineCategories, vaccineCategoryItems } from "@/db/schema";
import { eq, asc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const categories = await db
      .select()
      .from(vaccineCategories)
      .where(eq(vaccineCategories.isActive, true))
      .orderBy(asc(vaccineCategories.sortOrder));

    // Fetch items for each category
    const items = await db
      .select()
      .from(vaccineCategoryItems)
      .where(eq(vaccineCategoryItems.isActive, true));

    const result = categories.map((cat) => ({
      ...cat,
      items: items.filter((item) => item.categoryId === cat.id),
    }));

    return NextResponse.json(result);
  } catch (err) {
    console.error("GET /api/vaccine-categories error:", err);
    return NextResponse.json({ error: "Failed to fetch vaccine categories" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, description, icon, sortOrder, isActive } = body;
    if (!name) {
      return NextResponse.json({ error: "name is required" }, { status: 400 });
    }
    const [row] = await db
      .insert(vaccineCategories)
      .values({
        name,
        description: description ?? null,
        icon: icon ?? null,
        sortOrder: sortOrder ?? 0,
        isActive: isActive ?? true,
      })
      .returning();
    return NextResponse.json(row, { status: 201 });
  } catch (err) {
    console.error("POST /api/vaccine-categories error:", err);
    return NextResponse.json({ error: "Failed to create vaccine category" }, { status: 500 });
  }
}
