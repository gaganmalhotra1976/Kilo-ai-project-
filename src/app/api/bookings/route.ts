import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { bookings, customers } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { triggerBookingCreated } from "@/lib/webhooks";

// GET /api/bookings — list all bookings (admin)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    let query = db.select().from(bookings).orderBy(desc(bookings.createdAt));

    if (status) {
      const results = await db
        .select()
        .from(bookings)
        .where(eq(bookings.status, status))
        .orderBy(desc(bookings.createdAt));
      return NextResponse.json(results);
    }

    const results = await query;
    return NextResponse.json(results);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 });
  }
}

// POST /api/bookings — create a new booking request (public)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      customerName,
      customerPhone,
      customerEmail,
      address,
      city,
      vaccinesRequested,
      numberOfPeople,
      bookingType,
      preferredDate,
      preferredTime,
      patientNames,
    } = body;

    if (!customerName || !customerPhone || !address || !vaccinesRequested?.length) {
      return NextResponse.json(
        { error: "Missing required fields: name, phone, address, vaccines" },
        { status: 400 }
      );
    }

    // Upsert customer by phone
    let customerId: number | null = null;
    const existingCustomers = await db
      .select()
      .from(customers)
      .where(eq(customers.phone, customerPhone));

    if (existingCustomers.length > 0) {
      customerId = existingCustomers[0].id;
    } else {
      const inserted = await db
        .insert(customers)
        .values({
          name: customerName,
          phone: customerPhone,
          email: customerEmail || null,
          address,
          city: city || "Delhi",
        })
        .returning({ id: customers.id });
      customerId = inserted[0].id;
    }

    const inserted = await db
      .insert(bookings)
      .values({
        customerId,
        customerName,
        customerPhone,
        customerEmail: customerEmail || null,
        address,
        city: city || "Delhi",
        vaccinesRequested: JSON.stringify(vaccinesRequested),
        numberOfPeople: numberOfPeople || 1,
        bookingType: bookingType || "individual",
        preferredDate: preferredDate || null,
        preferredTime: preferredTime || null,
        patientNames: patientNames ? JSON.stringify(patientNames) : null,
        status: "pending",
      })
      .returning();

    // Trigger webhook for new booking creation
    await triggerBookingCreated(inserted[0]);

    return NextResponse.json(inserted[0], { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to create booking" }, { status: 500 });
  }
}
