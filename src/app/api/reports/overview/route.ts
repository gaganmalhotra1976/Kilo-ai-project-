import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { bookings, quotes, pipelineCards, pipelineStages, supportTickets, payments, patients } from "@/db/schema";
import { eq, and, gte, lte, sql, desc } from "drizzle-orm";

// GET /api/reports/overview — Dashboard widgets data
export async function GET(req: NextRequest) {
  try {
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    // 1. Total Bookings (this month vs last month)
    const thisMonthBookings = await db.select({ count: sql<number>`count(*)` })
      .from(bookings)
      .where(gte(bookings.createdAt, thisMonthStart));
    
    const lastMonthBookings = await db.select({ count: sql<number>`count(*)` })
      .from(bookings)
      .where(and(
        gte(bookings.createdAt, lastMonthStart),
        lte(bookings.createdAt, lastMonthEnd)
      ));

    const thisMonthCount = thisMonthBookings[0]?.count || 0;
    const lastMonthCount = lastMonthBookings[0]?.count || 0;
    const bookingsChange = lastMonthCount > 0 
      ? Math.round(((thisMonthCount - lastMonthCount) / lastMonthCount) * 100) 
      : 0;

    // 2. Total Revenue (confirmed + paid bookings this month)
    const revenueData = await db.select({
      total: sql<number>`COALESCE(SUM(CAST(json_extract(line_items, '$.total') as REAL)), 0)`
    })
    .from(quotes)
    .where(and(
      eq(quotes.status, "approved"),
      gte(quotes.createdAt, thisMonthStart)
    ));

    const totalRevenue = revenueData[0]?.total || 0;

    // 3. Conversion Rate (leads converted / total leads)
    const totalLeads = await db.select({ count: sql<number>`count(*)` })
      .from(pipelineCards);
    
    const convertedLeads = await db.select({ count: sql<number>`count(*)` })
      .from(pipelineCards)
      .where(eq(pipelineCards.stageId, 4)); // Assuming stage 4 is "Converted"

    const conversionRate = totalLeads[0]?.count > 0 
      ? Math.round((convertedLeads[0]?.count / totalLeads[0]?.count) * 100) 
      : 0;

    // 4. Pending Bookings count
    const pendingBookings = await db.select({ count: sql<number>`count(*)` })
      .from(bookings)
      .where(eq(bookings.status, "pending"));

    // 5. Cancelled Bookings count  
    const cancelledBookings = await db.select({ count: sql<number>`count(*)` })
      .from(bookings)
      .where(eq(bookings.status, "cancelled"));

    // 6. Average Booking Value
    const avgBookingValue = totalRevenue / (thisMonthCount || 1);

    return NextResponse.json({
      success: true,
      data: {
        totalBookings: {
          thisMonth: thisMonthCount,
          lastMonth: lastMonthCount,
          change: bookingsChange
        },
        totalRevenue: Math.round(totalRevenue),
        conversionRate,
        pendingBookings: pendingBookings[0]?.count || 0,
        cancelledBookings: cancelledBookings[0]?.count || 0,
        averageBookingValue: Math.round(avgBookingValue)
      }
    });

  } catch (error) {
    console.error("GET /api/reports/overview error:", error);
    return NextResponse.json({ error: "Failed to fetch overview data" }, { status: 500 });
  }
}
