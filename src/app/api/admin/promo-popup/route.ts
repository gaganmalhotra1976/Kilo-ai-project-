import { NextResponse } from "next/server";
import { db } from "@/db";
import { promoPopup } from "@/db/schema";
import { desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

// Admin: get ALL promo popups (including inactive/expired)
export async function GET() {
  try {
    const rows = await db.select().from(promoPopup).orderBy(desc(promoPopup.createdAt));
    return NextResponse.json(rows);
  } catch (err) {
    console.error("GET /api/admin/promo-popup error:", err);
    return NextResponse.json({ error: "Failed to fetch promo popups" }, { status: 500 });
  }
}
