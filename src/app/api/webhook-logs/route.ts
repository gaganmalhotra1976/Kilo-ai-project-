import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { webhookLogs } from "@/db/schema";
import { desc, eq, and } from "drizzle-orm";
import { requirePermission, type AuthenticatedRequest } from "@/lib/authMiddleware";

// GET /api/webhook-logs — list all webhook logs (requires auth)
export async function GET(req: AuthenticatedRequest) {
  const authResult = await requirePermission(req, "webhooks", "read");
  
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const { searchParams } = new URL(req.url);
    const event = searchParams.get("event");
    const success = searchParams.get("success");

    if (event || success) {
      const conditions = [];
      if (event) conditions.push(eq(webhookLogs.event, event));
      if (success !== null && success !== undefined) {
        conditions.push(eq(webhookLogs.success, success === "true"));
      }
      
      const results = await db
        .select()
        .from(webhookLogs)
        .where(and(...conditions))
        .orderBy(desc(webhookLogs.createdAt));
      return NextResponse.json(results);
    }

    const results = await db
      .select()
      .from(webhookLogs)
      .orderBy(desc(webhookLogs.createdAt));
    return NextResponse.json(results);
  } catch (err) {
    console.error(err);
    return NextResponse.json([]);
  }
}
