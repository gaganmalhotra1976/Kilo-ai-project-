import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { consultationBookings } from "@/db/schema";
import { eq, and, count } from "drizzle-orm";

// Working hours configuration
const WORKING_HOURS = {
  // Weekday slots (Monday to Friday)
  weekday: {
    morning: { start: 11, end: 14 }, // 11 AM - 2 PM (3 slots: 11, 12, 13)
    evening: { start: 19, end: 21 }, // 7 PM - 9 PM (2 slots: 19, 20)
  },
  // Max bookings per slot
  maxBookingsPerSlot: 6,
  // Slot duration in hours
  slotDuration: 1,
};

// Generate time slots for a given date
function generateTimeSlots(dateStr: string): string[] {
  const date = new Date(dateStr);
  const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday
  
  // Check if it's a weekend (Saturday or Sunday)
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    return []; // No slots on weekends
  }

  const slots: string[] = [];
  const { morning, evening } = WORKING_HOURS.weekday;

  // Generate morning slots
  for (let hour = morning.start; hour < morning.end; hour++) {
    slots.push(`${hour.toString().padStart(2, '0')}:00`);
  }

  // Generate evening slots
  for (let hour = evening.start; hour < evening.end; hour++) {
    slots.push(`${hour.toString().padStart(2, '0')}:00`);
  }

  return slots;
}

// GET /api/consultation-bookings/slots — Get available slots for a date
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date");
    const customerId = searchParams.get("customerId");

    if (!date) {
      return NextResponse.json({ error: "Date parameter required" }, { status: 400 });
    }

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return NextResponse.json({ error: "Invalid date format. Use YYYY-MM-DD" }, { status: 400 });
    }

    // Check if date is in the past
    const requestedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (requestedDate < today) {
      return NextResponse.json({ error: "Cannot book consultations in the past" }, { status: 400 });
    }

    // Generate all possible time slots for this date
    const allSlots = generateTimeSlots(date);

    // If no slots (weekend), return empty
    if (allSlots.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          date,
          slots: [],
          isWeekend: true,
          message: "Consultations are only available on weekdays (Monday to Friday)"
        }
      });
    }

    // Check how many bookings exist for each slot
    const bookedSlots = await db.select({
      time: consultationBookings.consultationTime,
      count: count(consultationBookings.id)
    })
      .from(consultationBookings)
      .where(and(
        eq(consultationBookings.consultationDate, date),
        eq(consultationBookings.status, "booked")
      ))
      .groupBy(consultationBookings.consultationTime);

    // Create a map of booked slot counts
    const bookedCountMap: Record<string, number> = {};
    for (const slot of bookedSlots) {
      bookedCountMap[slot.time] = slot.count;
    }

    // Build available slots with availability info
    const slots = allSlots.map(time => {
      const bookedCount = bookedCountMap[time] || 0;
      const available = bookedCount < WORKING_HOURS.maxBookingsPerSlot;
      const remaining = WORKING_HOURS.maxBookingsPerSlot - bookedCount;

      return {
        time,
        bookedCount,
        maxBookings: WORKING_HOURS.maxBookingsPerSlot,
        available,
        remaining,
      };
    });

    // If customer ID provided, also get their existing bookings for this date
    let customerBookings: string[] = [];
    if (customerId) {
      const customerBookingsResult = await db.select({
        time: consultationBookings.consultationTime
      })
        .from(consultationBookings)
        .where(and(
          eq(consultationBookings.consultationDate, date),
          eq(consultationBookings.customerId, parseInt(customerId)),
          eq(consultationBookings.status, "booked")
        ));
      
      customerBookings = customerBookingsResult.map(b => b.time);
    }

    return NextResponse.json({
      success: true,
      data: {
        date,
        slots,
        isWeekend: false,
        workingHours: {
          morning: `${WORKING_HOURS.weekday.morning.start}:00 - ${WORKING_HOURS.weekday.morning.end}:00`,
          evening: `${WORKING_HOURS.weekday.evening.start}:00 - ${WORKING_HOURS.weekday.evening.end}:00`,
        },
        customerBookings
      }
    });

  } catch (error) {
    console.error("GET /api/consultation-bookings/slots error:", error);
    return NextResponse.json({ error: "Failed to fetch slots" }, { status: 500 });
  }
}
