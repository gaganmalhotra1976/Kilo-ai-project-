import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { consultationBookings, consultationVouchers } from "@/db/schema";
import { eq, and, count } from "drizzle-orm";

// Working hours configuration
const MAX_BOOKINGS_PER_SLOT = 6;

// POST /api/consultation-bookings/book — Book a consultation slot
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { voucherId, customerId, patientName, consultationDate, consultationTime } = body;

    // Validate required fields
    if (!voucherId || !customerId || !patientName || !consultationDate || !consultationTime) {
      return NextResponse.json({ 
        error: "Missing required fields: voucherId, customerId, patientName, consultationDate, consultationTime" 
      }, { status: 400 });
    }

    // Validate voucher exists and is active
    const voucher = await db.select()
      .from(consultationVouchers)
      .where(eq(consultationVouchers.id, voucherId));

    if (!voucher[0]) {
      return NextResponse.json({ error: "Voucher not found" }, { status: 404 });
    }

    if (voucher[0].status !== "active") {
      return NextResponse.json({ error: "Voucher is not active" }, { status: 400 });
    }

    // Check if voucher belongs to customer
    if (voucher[0].customerId !== customerId) {
      return NextResponse.json({ error: "Voucher does not belong to this customer" }, { status: 403 });
    }

    // Check if voucher is expired
    const now = new Date();
    const expiryDate = new Date(voucher[0].expiryDate);
    if (now > expiryDate) {
      return NextResponse.json({ error: "Voucher has expired" }, { status: 400 });
    }

    // Check if voucher already has a booking
    const existingBooking = await db.select()
      .from(consultationBookings)
      .where(and(
        eq(consultationBookings.voucherId, voucherId),
        eq(consultationBookings.status, "booked")
      ));

    if (existingBooking.length > 0) {
      return NextResponse.json({ error: "This voucher already has an active booking" }, { status: 400 });
    }

    // Validate date is not in the past
    const bookingDate = new Date(consultationDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (bookingDate < today) {
      return NextResponse.json({ error: "Cannot book consultations in the past" }, { status: 400 });
    }

    // Check if it's a weekend
    const dayOfWeek = bookingDate.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return NextResponse.json({ error: "Consultations are only available on weekdays" }, { status: 400 });
    }

    // Validate time slot is within working hours
    const hour = parseInt(consultationTime.split(":")[0]);
    const isValidMorning = hour >= 11 && hour < 14;
    const isValidEvening = hour >= 19 && hour < 21;
    
    if (!isValidMorning && !isValidEvening) {
      return NextResponse.json({ 
        error: "Invalid time slot. Working hours are 11 AM - 2 PM and 7 PM - 9 PM" 
      }, { status: 400 });
    }

    // Check if slot is available (max 6 bookings per slot)
    const slotBookings = await db.select({ count: count(consultationBookings.id) })
      .from(consultationBookings)
      .where(and(
        eq(consultationBookings.consultationDate, consultationDate),
        eq(consultationBookings.consultationTime, consultationTime),
        eq(consultationBookings.status, "booked")
      ));

    const currentBookings = slotBookings[0]?.count || 0;
    if (currentBookings >= MAX_BOOKINGS_PER_SLOT) {
      return NextResponse.json({ error: "This slot is fully booked" }, { status: 400 });
    }

    // Create the consultation booking
    const newBooking = await db.insert(consultationBookings).values({
      voucherId,
      customerId,
      patientName,
      consultationDate,
      consultationTime,
      status: "booked"
    }).returning();

    // Mark the voucher as redeemed
    await db.update(consultationVouchers)
      .set({
        status: "redeemed",
        redeemedDate: new Date(),
        redeemedBy: "self-booking",
        updatedAt: new Date()
      })
      .where(eq(consultationVouchers.id, voucherId));

    return NextResponse.json({
      success: true,
      data: {
        booking: newBooking[0],
        message: "Consultation booked successfully"
      }
    }, { status: 201 });

  } catch (error) {
    console.error("POST /api/consultation-bookings/book error:", error);
    return NextResponse.json({ error: "Failed to book consultation" }, { status: 500 });
  }
}

// GET /api/consultation-bookings/book — Get customer's consultation bookings
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const customerId = searchParams.get("customerId");

    if (!customerId) {
      return NextResponse.json({ error: "Customer ID required" }, { status: 400 });
    }

    const bookings = await db.select()
      .from(consultationBookings)
      .where(eq(consultationBookings.customerId, parseInt(customerId)));

    return NextResponse.json({
      success: true,
      data: bookings
    });

  } catch (error) {
    console.error("GET /api/consultation-bookings/book error:", error);
    return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 });
  }
}
