import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { bookings, vaccines } from "@/db/schema";
import { eq, and, gte, lte, sql, desc } from "drizzle-orm";

// GET /api/reports/vaccines — Vaccine Popularity Report
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const city = searchParams.get("city");

    const dateConditions = [];
    if (startDate && endDate) {
      dateConditions.push(gte(bookings.createdAt, new Date(startDate)));
      dateConditions.push(lte(bookings.createdAt, new Date(endDate)));
    }

    // 1. Most booked vaccines this month
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const vaccinesThisMonth = await db.select({
      vaccine: bookings.vaccinesRequested,
      count: sql<number>`count(*)`,
      people: sql<number>`SUM(${bookings.numberOfPeople})`
    })
    .from(bookings)
    .where(and(
      gte(bookings.createdAt, monthStart),
      eq(bookings.status, "completed")
    ))
    .groupBy(bookings.vaccinesRequested)
    .orderBy(desc(sql`count(*)`))
    .limit(15);

    // 2. Vaccines by city
    const vaccinesByCity = await db.select({
      city: bookings.city,
      vaccine: bookings.vaccinesRequested,
      count: sql<number>`count(*)`
    })
    .from(bookings)
    .where(and(
      eq(bookings.status, "completed"),
      ...dateConditions
    ))
    .groupBy(bookings.city, bookings.vaccinesRequested)
    .orderBy(desc(sql`count(*)`));

    // 3. Month on month vaccine trend
    const monthlyTrend = await db.select({
      month: sql<string>`strftime('%Y-%m', ${bookings.createdAt})`,
      vaccine: bookings.vaccinesRequested,
      count: sql<number>`count(*)`
    })
    .from(bookings)
    .where(and(
      eq(bookings.status, "completed"),
      ...dateConditions
    ))
    .groupBy(sql`strftime('%Y-%m', ${bookings.createdAt})`, bookings.vaccinesRequested)
    .orderBy(desc(sql`strftime('%Y-%m', ${bookings.createdAt})`));

    // Apply city filter
    let filteredVaccinesByCity = vaccinesByCity;
    if (city) {
      filteredVaccinesByCity = vaccinesByCity.filter(v => v.city === city);
    }

    return NextResponse.json({
      success: true,
      data: {
        vaccinesThisMonth,
        vaccinesByCity: filteredVaccinesByCity,
        monthlyTrend: monthlyTrend.slice(0, 12) // Last 12 months
      }
    });

  } catch (error) {
    console.error("GET /api/reports/vaccines error:", error);
    return NextResponse.json({ error: "Failed to fetch vaccine report" }, { status: 500 });
  }
}
