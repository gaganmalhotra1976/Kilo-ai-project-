import { NextResponse } from "next/server";
import { db } from "@/db";
import { banners } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { headline, subtext, imageUrl, desktopImageUrl, mobileImageUrl, buttonText, buttonLink, sortOrder, isActive } = body;
    const [row] = await db
      .update(banners)
      .set({
        headline,
        subtext: subtext ?? null,
        imageUrl: imageUrl ?? null,
        desktopImageUrl: desktopImageUrl ?? null,
        mobileImageUrl: mobileImageUrl ?? null,
        buttonText: buttonText ?? null,
        buttonLink: buttonLink ?? null,
        sortOrder: sortOrder ?? 0,
        isActive: isActive ?? true,
      })
      .where(eq(banners.id, Number(id)))
      .returning();
    if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(row);
  } catch (err) {
    console.error("PUT /api/banners/[id] error:", err);
    return NextResponse.json({ error: "Failed to update banner" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await db.delete(banners).where(eq(banners.id, Number(id)));
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/banners/[id] error:", err);
    return NextResponse.json({ error: "Failed to delete banner" }, { status: 500 });
  }
}
