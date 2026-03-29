import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { bookings, patients } from "@/db/schema";
import { eq, and, gte, lte, like, sql, desc, asc, isNotNull } from "drizzle-orm";

// GET /api/reports/bookings — Bookings report with filters
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    
    // Parse filters
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const status = searchParams.get("status");
    const city = searchParams.get("city");
    const vaccineType = searchParams.get("vaccineType");
    const staffAssigned = searchParams.get("staffAssigned");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    // Build conditions
    const conditions = [];
    
    if (startDate && endDate) {
      conditions.push(gte(bookings.createdAt, new Date(startDate)));
      conditions.push(lte(bookings.createdAt, new Date(endDate)));
    }
    
    if (status) {
      conditions.push(eq(bookings.status, status));
    }
    
    if (city) {
      conditions.push(eq(bookings.city, city));
    }
    
    if (vaccineType) {
      conditions.push(like(bookings.vaccinesRequested, `%${vaccineType}%`));
    }
    
    if (staffAssigned) {
      conditions.push(eq(bookings.assignedNurse, staffAssigned));
    }

    // Get total count
    const totalCount = await db.select({ count: sql<number>`count(*)` })
      .from(bookings)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    // Get paginated data
    const bookingsData = await db.select({
      id: bookings.id,
      customerName: bookings.customerName,
      customerPhone: bookings.customerPhone,
      vaccinesRequested: bookings.vaccinesRequested,
      preferredDate: bookings.preferredDate,
      city: bookings.city,
      status: bookings.paymentStatus,
      paymentStatus: bookings.paymentStatus,
      createdAt: bookings.createdAt,
      assignedNurse: bookings.assignedNurse,
      numberOfPeople: bookings.numberOfPeople
    })
    .from(bookings)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(bookings.createdAt))
    .limit(limit)
    .offset((page - 1) * limit);

    // Get unique cities for filter dropdown
    const citiesData = await db.selectDistinct({ city: bookings.city })
      .from(bookings);

    // Get unique staff for filter dropdown
    const staffData = await db.selectDistinct({ assignedNurse: bookings.assignedNurse })
      .from(bookings)
      .where(isNotNull(bookings.assignedNurse));

    return NextResponse.json({
      success: true,
      data: {
        bookings: bookingsData,
        pagination: {
          page,
          limit,
          total: totalCount[0]?.count || 0,
          totalPages: Math.ceil((totalCount[0]?.count || 0) / limit)
        },
        filters: {
          cities: citiesData.map(c => c.city).filter(Boolean),
          staff: staffData.map(s => s.assignedNurse).filter(Boolean)
        }
      }
    });

  } catch (error) {
    console.error("GET /api/reports/bookings error:", error);
    return NextResponse.json({ error: "Failed to fetch bookings report" }, { status: 500 });
  }
}
