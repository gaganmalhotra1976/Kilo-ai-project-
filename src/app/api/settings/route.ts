import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { settings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requirePermission, type AuthenticatedRequest } from "@/lib/authMiddleware";

// GET /api/settings — list all settings (requires auth)
export async function GET(req: AuthenticatedRequest) {
  const authResult = await requirePermission(req, "settings", "read");
  
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const results = await db.select().from(settings);
    return NextResponse.json(results);
  } catch (err) {
    console.error(err);
    return NextResponse.json([]);
  }
}

// PATCH /api/settings — update a setting (requires auth)
export async function PATCH(req: AuthenticatedRequest) {
  const authResult = await requirePermission(req, "settings", "update");
  
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const body = await req.json();
    const { key, value } = body;

    if (!key || value === undefined) {
      return NextResponse.json(
        { error: "Missing required fields: key, value" },
        { status: 400 }
      );
    }

    const [existing] = await db
      .select()
      .from(settings)
      .where(eq(settings.key, key))
      .limit(1);

    let updated;
    if (existing) {
      [updated] = await db
        .update(settings)
        .set({ value, updatedAt: new Date() })
        .where(eq(settings.key, key))
        .returning();
    } else {
      [updated] = await db
        .insert(settings)
        .values({ key, value, description: "" })
        .returning();
    }

    return NextResponse.json(updated);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to update setting" }, { status: 500 });
  }
}
