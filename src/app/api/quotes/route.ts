import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { quotes, bookings } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

// GET /api/quotes
export async function GET() {
  try {
    const results = await db
      .select()
      .from(quotes)
      .orderBy(desc(quotes.createdAt));
    return NextResponse.json(results);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch quotes" }, { status: 500 });
  }
}

// POST /api/quotes — admin creates a quote for a booking
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      bookingId,
      lineItems,
      convenienceFee,
      discountType,
      discountValue,
      subtotal,
      discountAmount,
      gstAmount,
      total,
      validUntil,
    } = body;

    if (!bookingId || !lineItems || total === undefined) {
      return NextResponse.json(
        { error: "Missing required fields: bookingId, lineItems, total" },
        { status: 400 }
      );
    }

    const inserted = await db
      .insert(quotes)
      .values({
        bookingId,
        lineItems: JSON.stringify(lineItems),
        convenienceFee: convenienceFee ?? 0,
        discountType: discountType || null,
        discountValue: discountValue ?? 0,
        subtotal: subtotal ?? 0,
        discountAmount: discountAmount ?? 0,
        gstAmount: gstAmount ?? 0,
        total,
        validUntil: validUntil || null,
        status: "draft",
      })
      .returning();

    // Update booking status to "quoted"
    await db
      .update(bookings)
      .set({ status: "quoted", updatedAt: new Date() })
      .where(eq(bookings.id, bookingId));

    return NextResponse.json(inserted[0], { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to create quote" }, { status: 500 });
  }
}
