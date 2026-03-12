import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { bookings, quotes, payments, pipelineCards } from "@/db/schema";
import { eq, and, gte, lte, sql, desc } from "drizzle-orm";

// GET /api/reports/revenue — Revenue report with charts
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const paymentMethod = searchParams.get("paymentMethod");
    const staffMember = searchParams.get("staffMember");

    // Build date conditions
    const dateConditions = [];
    if (startDate && endDate) {
      dateConditions.push(gte(quotes.createdAt, new Date(startDate)));
      dateConditions.push(lte(quotes.createdAt, new Date(endDate)));
    }

    // 1. Daily/Weekly/Monthly revenue data
    const revenueByPeriod = await db.select({
      date: sql<string>`strftime('%Y-%m-%d', ${quotes.createdAt})`,
      total: sql<number>`SUM(${quotes.total})`
    })
    .from(quotes)
    .where(and(
      eq(quotes.status, "approved"),
      ...dateConditions
    ))
    .groupBy(sql`strftime('%Y-%m-%d', ${quotes.createdAt})`)
    .orderBy(desc(sql`strftime('%Y-%m-%d', ${quotes.createdAt})`));

    // 2. Revenue by vaccine type (from bookings)
    const revenueByVaccine = await db.select({
      vaccine: bookings.vaccinesRequested,
      count: sql<number>`count(*)`,
      total: sql<number>`COALESCE(SUM(CAST(json_extract(line_items, '$.total') as REAL)), 0)`
    })
    .from(bookings)
    .leftJoin(quotes, eq(bookings.id, quotes.bookingId))
    .where(and(
      eq(bookings.status, "confirmed"),
      ...dateConditions
    ))
    .groupBy(bookings.vaccinesRequested)
    .orderBy(desc(sql`count(*)`))
    .limit(10);

    // 3. Revenue by lead source
    const revenueBySource = await db.select({
      source: pipelineCards.source,
      count: sql<number>`count(*)`,
      total: sql<number>`COALESCE(SUM(CAST(json_extract(line_items, '$.total') as REAL)), 0)`
    })
    .from(pipelineCards)
    .leftJoin(quotes, eq(pipelineCards.quoteId, quotes.id))
    .where(and(
      eq(quotes.status, "approved"),
      ...dateConditions
    ))
    .groupBy(pipelineCards.source);

    // 4. Outstanding payments (confirmed but not fully paid)
    const outstandingPayments = await db.select({
      total: sql<number>`COALESCE(SUM(${quotes.total}), 0)`
    })
    .from(quotes)
    .where(and(
      eq(quotes.status, "sent"), // Quoted but not approved yet
      ...dateConditions
    ));

    // 5. Payment methods breakdown
    const paymentMethodsData = await db.select({
      method: payments.paymentMethod,
      total: sql<number>`COALESCE(SUM(${payments.amount}), 0)`,
      count: sql<number>`count(*)`
    })
    .from(payments)
    .where(eq(payments.status, "completed"))
    .groupBy(payments.paymentMethod);

    // 6. Staff performance (if staff member filter)
    let staffPerformance = null;
    if (staffMember) {
      staffPerformance = await db.select({
        staff: pipelineCards.assignedTo,
        converted: sql<number>`count(*)`,
        totalRevenue: sql<number>`COALESCE(SUM(CAST(json_extract(line_items, '$.total') as REAL)), 0)`
      })
      .from(pipelineCards)
      .leftJoin(quotes, eq(pipelineCards.quoteId, quotes.id))
      .where(and(
        eq(pipelineCards.assignedTo, staffMember),
        eq(quotes.status, "approved")
      ))
      .groupBy(pipelineCards.assignedTo);
    }

    return NextResponse.json({
      success: true,
      data: {
        revenueByPeriod: revenueByPeriod.slice(0, 30), // Last 30 days
        revenueByVaccine,
        revenueBySource,
        outstandingPayments: outstandingPayments[0]?.total || 0,
        paymentMethods: paymentMethodsData,
        staffPerformance
      }
    });

  } catch (error) {
    console.error("GET /api/reports/revenue error:", error);
    return NextResponse.json({ error: "Failed to fetch revenue report" }, { status: 500 });
  }
}
