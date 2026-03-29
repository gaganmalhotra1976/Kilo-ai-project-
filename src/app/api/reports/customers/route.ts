import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { patients, bookings, quotes } from "@/db/schema";
import { eq, and, gte, lte, sql, desc } from "drizzle-orm";

// GET /api/reports/patients — Customer Report
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const city = searchParams.get("city");

    const dateConditions = [];
    if (startDate && endDate) {
      dateConditions.push(gte(patients.createdAt, new Date(startDate)));
      dateConditions.push(lte(patients.createdAt, new Date(endDate)));
    }

    // 1. New patients this month
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const newCustomersThisMonth = await db.select({ count: sql<number>`count(*)` })
      .from(patients)
      .where(gte(patients.createdAt, monthStart));

    // 2. Repeat patients (booked more than once)
    const repeatCustomers = await db.select({
      customerId: bookings.customerId,
      customerName: bookings.customerName,
      bookingCount: sql<number>`count(*)`,
      totalSpent: sql<number>`SUM(CAST(json_extract(line_items, '$.total') as REAL))`
    })
    .from(bookings)
    .leftJoin(quotes, eq(bookings.id, quotes.bookingId))
    .where(eq(bookings.status, "completed"))
    .groupBy(bookings.customerId, bookings.customerName)
    .having(sql`count(*) > 1`)
    .orderBy(desc(sql`count(*)`))
    .limit(20);

    // 3. Customers by city
    const patientsByCity = await db.select({
      city: patients.city,
      count: sql<number>`count(*)`
    })
    .from(patients)
    .where(dateConditions.length > 0 ? and(...dateConditions) : undefined)
    .groupBy(patients.city)
    .orderBy(desc(sql`count(*)`));

    // 4. Top 10 patients by booking value
    const topCustomers = await db.select({
      customerId: bookings.customerId,
      customerName: bookings.customerName,
      customerPhone: bookings.customerPhone,
      bookingCount: sql<number>`count(*)`,
      totalSpent: sql<number>`COALESCE(SUM(CAST(json_extract(line_items, '$.total') as REAL)), 0)`
    })
    .from(bookings)
    .leftJoin(quotes, eq(bookings.id, quotes.bookingId))
    .where(and(
      eq(bookings.status, "completed"),
      ...dateConditions
    ))
    .groupBy(bookings.customerId, bookings.customerName, bookings.customerPhone)
    .orderBy(desc(sql`COALESCE(SUM(CAST(json_extract(line_items, '$.total') as REAL)), 0)`))
    .limit(10);

    // Apply city filter
    let filteredCustomersByCity = patientsByCity;
    if (city) {
      filteredCustomersByCity = patientsByCity.filter(c => c.city === city);
    }

    return NextResponse.json({
      success: true,
      data: {
        newCustomersThisMonth: newCustomersThisMonth[0]?.count || 0,
        repeatCustomers,
        patientsByCity: filteredCustomersByCity,
        topCustomers
      }
    });

  } catch (error) {
    console.error("GET /api/reports/patients error:", error);
    return NextResponse.json({ error: "Failed to fetch customer report" }, { status: 500 });
  }
}
