import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { promoPopup } from "@/db/schema";
import { desc } from "drizzle-orm";
import { requirePermission, type AuthenticatedRequest } from "@/lib/authMiddleware";
import { logStaffAction } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

// Admin: get ALL promo popups - requires auth
export async function GET(req: AuthenticatedRequest) {
  const authResult = await requirePermission(req, "promo-popup", "read");
  
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const rows = await db.select().from(promoPopup).orderBy(desc(promoPopup.createdAt));
    await logStaffAction(authResult.id, "view", "promo-popup");
    return NextResponse.json(rows);
  } catch (err) {
    console.error("GET /api/admin/promo-popup error:", err);
    return NextResponse.json({ error: "Failed to fetch promo popups" }, { status: 500 });
  }
}

// Admin: create promo popup - requires auth
export async function POST(req: AuthenticatedRequest) {
  const authResult = await requirePermission(req, "promo-popup", "create");
  
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const body = await req.json();
    const { title, content, imageUrl, buttonText, buttonLink, expiresAt, showOnce, isActive } = body;

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const [popup] = await db
      .insert(promoPopup)
      .values({
        title,
        content: content || null,
        imageUrl: imageUrl || null,
        buttonText: buttonText || null,
        buttonLink: buttonLink || null,
        expiresAt: expiresAt || null,
        showOnce: showOnce ?? true,
        isActive: isActive ?? true,
      })
      .returning();

    await logStaffAction(authResult.id, "create", "promo-popup", popup.id);

    return NextResponse.json(popup, { status: 201 });
  } catch (err) {
    console.error("POST /api/admin/promo-popup error:", err);
    return NextResponse.json({ error: "Failed to create promo popup" }, { status: 500 });
  }
}
