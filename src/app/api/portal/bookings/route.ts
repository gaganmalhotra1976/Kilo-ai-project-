import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { bookings } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

// GET /api/portal/bookings — get customer's bookings
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const customerId = searchParams.get("customerId");

  if (!customerId) {
    return NextResponse.json({ error: "Customer ID required" }, { status: 400 });
  }

  try {
    const results = await db
      .select()
      .from(bookings)
      .where(eq(bookings.customerId, parseInt(customerId)))
      .orderBy(desc(bookings.createdAt));

    return NextResponse.json(results);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 });
  }
}
