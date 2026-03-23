import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { notifications } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const customerId = searchParams.get("customerId");
    const includeRead = searchParams.get("includeRead") === "true";

    if (!customerId) {
      return NextResponse.json({ error: "Customer ID required" }, { status: 400 });
    }

    const conditions = [eq(notifications.customerId, parseInt(customerId, 10))];
    if (!includeRead) {
      conditions.push(eq(notifications.isRead, false) as any);
    }

    const result = await db
      .select()
      .from(notifications)
      .where(eq(notifications.customerId, parseInt(customerId, 10)))
      .orderBy(desc(notifications.createdAt))
      .limit(20);

    return NextResponse.json(result);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { notificationId, isRead } = body;

    if (!notificationId) {
      return NextResponse.json({ error: "Notification ID required" }, { status: 400 });
    }

    await db
      .update(notifications)
      .set({ isRead })
      .where(eq(notifications.id, notificationId));

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to update notification" }, { status: 500 });
  }
}
