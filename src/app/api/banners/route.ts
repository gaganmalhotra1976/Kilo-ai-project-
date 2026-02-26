import { NextResponse } from "next/server";
import { db } from "@/db";
import { banners } from "@/db/schema";
import { eq, asc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const rows = await db
      .select()
      .from(banners)
      .where(eq(banners.isActive, true))
      .orderBy(asc(banners.sortOrder));
    return NextResponse.json(rows);
  } catch (err) {
    console.error("GET /api/banners error:", err);
    return NextResponse.json({ error: "Failed to fetch banners" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { headline, subtext, imageUrl, buttonText, buttonLink, sortOrder, isActive } = body;
    if (!headline) {
      return NextResponse.json({ error: "headline is required" }, { status: 400 });
    }
    const [row] = await db
      .insert(banners)
      .values({
        headline,
        subtext: subtext ?? null,
        imageUrl: imageUrl ?? null,
        buttonText: buttonText ?? null,
        buttonLink: buttonLink ?? null,
        sortOrder: sortOrder ?? 0,
        isActive: isActive ?? true,
      })
      .returning();
    return NextResponse.json(row, { status: 201 });
  } catch (err) {
    console.error("POST /api/banners error:", err);
    return NextResponse.json({ error: "Failed to create banner" }, { status: 500 });
  }
}
