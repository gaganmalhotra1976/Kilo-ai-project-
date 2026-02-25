import { NextResponse } from "next/server";
import { db } from "@/db";
import { bookings } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

interface RouteParams {
  params: Promise<{ customerId: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { customerId } = await params;
    const customerIdNum = parseInt(customerId);

    if (isNaN(customerIdNum)) {
      return NextResponse.json(
        { error: "Invalid customer ID" },
        { status: 400 }
      );
    }

    const customerBookings = await db
      .select()
      .from(bookings)
      .where(eq(bookings.customerId, customerIdNum))
      .orderBy(desc(bookings.createdAt));

    return NextResponse.json(customerBookings);
  } catch (error) {
    console.error("Error fetching customer bookings:", error);
    return NextResponse.json(
      { error: "Failed to fetch bookings" },
      { status: 500 }
    );
  }
}
