import { NextResponse } from "next/server";
import { db } from "@/db";
import { promoPopup } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

// GET active promo popup (for frontend)
export async function GET() {
  try {
    const rows = await db
      .select()
      .from(promoPopup)
      .where(eq(promoPopup.isActive, true))
      .limit(1);
    const popup = rows[0] ?? null;
    // Check expiry
    if (popup && popup.expiresAt) {
      const expiry = new Date(popup.expiresAt);
      if (expiry < new Date()) {
        return NextResponse.json(null);
      }
    }
    return NextResponse.json(popup);
  } catch (err) {
    console.error("GET /api/promo-popup error:", err);
    return NextResponse.json({ error: "Failed to fetch promo popup" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, content, imageUrl, buttonText, buttonLink, expiresAt, showOnce, isActive } = body;
    if (!title) {
      return NextResponse.json({ error: "title is required" }, { status: 400 });
    }
    const [row] = await db
      .insert(promoPopup)
      .values({
        title,
        content: content ?? null,
        imageUrl: imageUrl ?? null,
        buttonText: buttonText ?? null,
        buttonLink: buttonLink ?? null,
        expiresAt: expiresAt ?? null,
        showOnce: showOnce ?? true,
        isActive: isActive ?? true,
      })
      .returning();
    return NextResponse.json(row, { status: 201 });
  } catch (err) {
    console.error("POST /api/promo-popup error:", err);
    return NextResponse.json({ error: "Failed to create promo popup" }, { status: 500 });
  }
}
