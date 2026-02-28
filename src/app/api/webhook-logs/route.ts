import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { webhookLogs } from "@/db/schema";
import { desc, eq, and } from "drizzle-orm";

// GET /api/webhook-logs — list all webhook logs
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const event = searchParams.get("event");
    const success = searchParams.get("success");

    let query = db.select().from(webhookLogs).orderBy(desc(webhookLogs.createdAt));

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

    const results = await query;
    return NextResponse.json(results);
  } catch (err) {
    console.error(err);
    // Return empty array if table doesn't exist yet
    return NextResponse.json([]);
  }
}
