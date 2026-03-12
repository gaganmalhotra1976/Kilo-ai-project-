import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { banners } from "@/db/schema";
import { asc } from "drizzle-orm";
import { requirePermission, type AuthenticatedRequest } from "@/lib/authMiddleware";
import { logStaffAction } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

// Admin: get ALL banners (including inactive) - requires auth
export async function GET(req: AuthenticatedRequest) {
  const authResult = await requirePermission(req, "banners", "read");
  
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const rows = await db.select().from(banners).orderBy(asc(banners.sortOrder));
    await logStaffAction(authResult.id, "view", "banners");
    return NextResponse.json(rows);
  } catch (err) {
    console.error("GET /api/admin/banners error:", err);
    return NextResponse.json({ error: "Failed to fetch banners" }, { status: 500 });
  }
}

// Admin: create banner - requires auth
export async function POST(req: AuthenticatedRequest) {
  const authResult = await requirePermission(req, "banners", "create");
  
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const body = await req.json();
    const { headline, subtext, imageUrl, desktopImageUrl, mobileImageUrl, buttonText, buttonLink, sortOrder, isActive } = body;

    if (!headline) {
      return NextResponse.json({ error: "Headline is required" }, { status: 400 });
    }

    const [banner] = await db
      .insert(banners)
      .values({
        headline,
        subtext: subtext || null,
        imageUrl: imageUrl || null,
        desktopImageUrl: desktopImageUrl || null,
        mobileImageUrl: mobileImageUrl || null,
        buttonText: buttonText || null,
        buttonLink: buttonLink || null,
        sortOrder: sortOrder || 0,
        isActive: isActive ?? true,
      })
      .returning();

    await logStaffAction(authResult.id, "create", "banners", banner.id);

    return NextResponse.json(banner, { status: 201 });
  } catch (err) {
    console.error("POST /api/admin/banners error:", err);
    return NextResponse.json({ error: "Failed to create banner" }, { status: 500 });
  }
}
