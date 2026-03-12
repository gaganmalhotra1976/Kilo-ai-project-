import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { bookings } from "@/db/schema";
import { eq, and, gte, lte, sql, desc, isNotNull, isNull } from "drizzle-orm";

// GET /api/reports/operations — Operations Report
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const nurseName = searchParams.get("nurseName");
    const city = searchParams.get("city");

    const dateConditions = [];
    if (startDate && endDate) {
      dateConditions.push(gte(bookings.createdAt, new Date(startDate)));
      dateConditions.push(lte(bookings.createdAt, new Date(endDate)));
    }

    // 1. Bookings by nurse/staff assigned
    const bookingsByNurse = await db.select({
      nurse: bookings.assignedNurse,
      count: sql<number>`count(*)`,
      completed: sql<number>`SUM(CASE WHEN ${bookings.status} = 'completed' THEN 1 ELSE 0 END)`,
      confirmed: sql<number>`SUM(CASE WHEN ${bookings.status} = 'confirmed' THEN 1 ELSE 0 END)`
    })
    .from(bookings)
    .where(and(
      isNotNull(bookings.assignedNurse),
      ...dateConditions
    ))
    .groupBy(bookings.assignedNurse)
    .orderBy(desc(sql`count(*)`));

    // 2. Average time from Booking Confirmed to Visit Complete
    const avgCompletionTime = await db.select({
      avgDays: sql<number>`AVG(julianday(${bookings.updatedAt}) - julianday(${bookings.createdAt}))`
    })
    .from(bookings)
    .where(and(
      eq(bookings.status, "completed"),
      ...dateConditions
    ));

    // 3. Visits completed this week / month
    const now = new Date();
    const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const visitsThisWeek = await db.select({ count: sql<number>`count(*)` })
      .from(bookings)
      .where(and(
        eq(bookings.status, "completed"),
        gte(bookings.updatedAt, weekStart)
      ));

    const visitsThisMonth = await db.select({ count: sql<number>`count(*)` })
      .from(bookings)
      .where(and(
        eq(bookings.status, "completed"),
        gte(bookings.updatedAt, monthStart)
      ));

    // 4. Pending nurse assignments
    const pendingAssignments = await db.select({ count: sql<number>`count(*)` })
      .from(bookings)
      .where(and(
        eq(bookings.status, "confirmed"),
        isNull(bookings.assignedNurse)
      ));

    // Apply filters
    let filteredBookingsByNurse = bookingsByNurse;
    if (nurseName) {
      filteredBookingsByNurse = bookingsByNurse.filter(b => b.nurse === nurseName);
    }

    let filteredByCity = null;
    if (city) {
      filteredByCity = await db.select({
        nurse: bookings.assignedNurse,
        count: sql<number>`count(*)`
      })
      .from(bookings)
      .where(and(
        eq(bookings.city, city),
        isNotNull(bookings.assignedNurse),
        ...dateConditions
      ))
      .groupBy(bookings.assignedNurse);
    }

    return NextResponse.json({
      success: true,
      data: {
        bookingsByNurse: filteredBookingsByNurse,
        averageCompletionDays: Math.round(avgCompletionTime[0]?.avgDays || 0),
        visitsThisWeek: visitsThisWeek[0]?.count || 0,
        visitsThisMonth: visitsThisMonth[0]?.count || 0,
        pendingAssignments: pendingAssignments[0]?.count || 0,
        bookingsByCity: filteredByCity
      }
    });

  } catch (error) {
    console.error("GET /api/reports/operations error:", error);
    return NextResponse.json({ error: "Failed to fetch operations report" }, { status: 500 });
  }
}
