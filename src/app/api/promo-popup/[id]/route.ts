import { NextResponse } from "next/server";
import { db } from "@/db";
import { promoPopup } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const rows = await db.select().from(promoPopup).where(eq(promoPopup.id, Number(id)));
    if (!rows[0]) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(rows[0]);
  } catch (err) {
    console.error("GET /api/promo-popup/[id] error:", err);
    return NextResponse.json({ error: "Failed to fetch promo popup" }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { title, content, imageUrl, buttonText, buttonLink, expiresAt, showOnce, isActive } = body;
    const [row] = await db
      .update(promoPopup)
      .set({
        title,
        content: content ?? null,
        imageUrl: imageUrl ?? null,
        buttonText: buttonText ?? null,
        buttonLink: buttonLink ?? null,
        expiresAt: expiresAt ?? null,
        showOnce: showOnce ?? true,
        isActive: isActive ?? true,
        updatedAt: new Date(),
      })
      .where(eq(promoPopup.id, Number(id)))
      .returning();
    if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(row);
  } catch (err) {
    console.error("PUT /api/promo-popup/[id] error:", err);
    return NextResponse.json({ error: "Failed to update promo popup" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await db.delete(promoPopup).where(eq(promoPopup.id, Number(id)));
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/promo-popup/[id] error:", err);
    return NextResponse.json({ error: "Failed to delete promo popup" }, { status: 500 });
  }
}
