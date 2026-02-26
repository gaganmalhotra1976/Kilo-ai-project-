import { NextResponse } from "next/server";
import { db } from "@/db";
import { banners } from "@/db/schema";
import { asc } from "drizzle-orm";

export const dynamic = "force-dynamic";

// Admin: get ALL banners (including inactive)
export async function GET() {
  try {
    const rows = await db.select().from(banners).orderBy(asc(banners.sortOrder));
    return NextResponse.json(rows);
  } catch (err) {
    console.error("GET /api/admin/banners error:", err);
    return NextResponse.json({ error: "Failed to fetch banners" }, { status: 500 });
  }
}
