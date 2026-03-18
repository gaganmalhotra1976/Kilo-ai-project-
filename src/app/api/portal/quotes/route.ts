import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { quotes, bookings } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

// GET /api/portal/quotes — get customer's quotes
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const customerId = searchParams.get("customerId");

  if (!customerId) {
    return NextResponse.json({ error: "Customer ID required" }, { status: 400 });
  }

  try {
    // Get bookings for this customer
    const customerBookings = await db
      .select({ id: bookings.id })
      .from(bookings)
      .where(eq(bookings.customerId, parseInt(customerId)));

    const bookingIds = customerBookings.map((b) => b.id);

    if (bookingIds.length === 0) {
      return NextResponse.json([]);
    }

    // Get quotes for these bookings
    const results = await db
      .select()
      .from(quotes)
      .where(
        // @ts-ignore
        eq(quotes.bookingId, bookingIds[0])
      )
      .orderBy(desc(quotes.createdAt));

    return NextResponse.json(results);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch quotes" }, { status: 500 });
  }
}
