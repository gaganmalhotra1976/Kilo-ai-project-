import { NextResponse } from "next/server";
import { db } from "@/db";
import { quotes } from "@/db/schema";
import { eq } from "drizzle-orm";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/bookings/[id]/quote — Get the quote for a booking
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const bookingId = parseInt(id);

    if (isNaN(bookingId)) {
      return NextResponse.json(
        { error: "Invalid booking ID" },
        { status: 400 }
      );
    }

    // Find the approved quote for this booking
    const quote = await db.select()
      .from(quotes)
      .where(eq(quotes.bookingId, bookingId));

    if (!quote[0]) {
      return NextResponse.json({
        success: false,
        error: "No quote found for this booking"
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: quote[0]
    });

  } catch (error) {
    console.error("GET /api/bookings/[id]/quote error:", error);
    return NextResponse.json(
      { error: "Failed to fetch quote" },
      { status: 500 }
    );
  }
}
