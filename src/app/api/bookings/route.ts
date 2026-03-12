import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { bookings, customers, pipelines, pipelineStages, pipelineCards, pipelineCardHistory } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { triggerBookingCreated as sendBookingWebhook } from "@/lib/webhooks";
import { requirePermission, type AuthenticatedRequest } from "@/lib/authMiddleware";
import { logStaffAction } from "@/lib/adminAuth";

// Helper webhook function (enabled now)
async function triggerBookingCreated(bookingData: any) {
  try {
    await sendBookingWebhook(bookingData, "system");
  } catch (error) {
    console.error("Error triggering booking created webhook:", error);
  }
}

// Helper function to get or create Sales pipeline with required stages
async function getOrCreateSalesPipeline() {
  try {
    // Check if Sales pipeline already exists
    const existingPipelines = await db.select().from(pipelines).where(eq(pipelines.name, "Sales"));
    let salesPipeline = existingPipelines[0];

    if (!salesPipeline) {
      // Create Sales pipeline
      const [created] = await db.insert(pipelines).values({ 
        name: "Sales", 
        description: "Sales pipeline for managing leads and bookings" 
      }).returning();
      salesPipeline = created;

      // Create required stages
      const stages = [
        { name: "New Lead - Website", color: "#3b82f6", sortOrder: 0 },
        { name: "New Lead - Manual", color: "#8b5cf6", sortOrder: 1 },
        { name: "Quote Sent", color: "#f59e0b", sortOrder: 2 },
        { name: "Advance Received", color: "#10b981", sortOrder: 3 },
        { name: "Converted / Fully Paid", color: "#059669", sortOrder: 4 },
        { name: "Lost", color: "#ef4444", sortOrder: 5 },
      ];

      for (const stage of stages) {
        await db.insert(pipelineStages).values({
          pipelineId: salesPipeline.id,
          ...stage
        });
      }
    }

    return salesPipeline;
  } catch (error) {
    console.error("Error getting/creating Sales pipeline:", error);
    return null;
  }
}

// Helper function to create pipeline card for booking
async function createSalesPipelineCard(booking: any) {
  try {
    const salesPipeline = await getOrCreateSalesPipeline();
    if (!salesPipeline) {
      console.error("Failed to get Sales pipeline");
      return null;
    }

    // Get the "New Lead - Website" stage
    const stages = await db.select().from(pipelineStages)
      .where(eq(pipelineStages.pipelineId, salesPipeline.id));
    
    const websiteStage = stages.find(s => s.name === "New Lead - Website");
    if (!websiteStage) {
      console.error("New Lead - Website stage not found");
      return null;
    }

    // Create pipeline card
    const [card] = await db.insert(pipelineCards).values({
      pipelineId: salesPipeline.id,
      stageId: websiteStage.id,
      title: `Booking #${booking.id} - ${booking.customerName}`,
      customerId: booking.customerId,
      customerName: booking.customerName,
      bookingId: booking.id,
      source: "website",
      priority: "medium",
    }).returning();

    // Log initial stage placement
    await db.insert(pipelineCardHistory).values({
      cardId: card.id,
      fromStageId: null,
      toStageId: websiteStage.id,
      movedBy: "system",
      note: "Card created from website booking",
    });

    return card;
  } catch (error) {
    console.error("Error creating pipeline card:", error);
    return null;
  }
}

// GET /api/bookings — list all bookings (admin only)
export async function GET(req: AuthenticatedRequest) {
  const authResult = await requirePermission(req, "bookings", "read");
  
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    if (status) {
      const results = await db
        .select()
        .from(bookings)
        .where(eq(bookings.status, status))
        .orderBy(desc(bookings.createdAt));
      return NextResponse.json(results);
    }

    const results = await db
      .select()
      .from(bookings)
      .orderBy(desc(bookings.createdAt));
    
    await logStaffAction(authResult.id, "view", "bookings");
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
        paymentStatus: "unpaid",
      })
      .returning();

    // Create Sales Pipeline card for this booking
    await createSalesPipelineCard(inserted[0]);

    // Trigger webhook for new booking creation
    await triggerBookingCreated(inserted[0]);

    return NextResponse.json(inserted[0], { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to create booking" }, { status: 500 });
  }
}

// DELETE /api/bookings — soft delete a booking (admin only)
export async function DELETE(req: AuthenticatedRequest) {
  const authResult = await requirePermission(req, "bookings", "delete");
  
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const reason = searchParams.get("reason") || "Cancelled by staff";

    if (!id) {
      return NextResponse.json(
        { error: "Booking ID is required" },
        { status: 400 }
      );
    }

    const bookingId = parseInt(id, 10);
    
    const [updated] = await db
      .update(bookings)
      .set({ 
        status: "cancelled",
        adminNotes: reason,
        updatedAt: new Date()
      })
      .where(eq(bookings.id, bookingId))
      .returning();

    if (!updated) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      );
    }

    await logStaffAction(authResult.id, "delete", "bookings", bookingId, { reason });

    return NextResponse.json({ success: true, booking: updated });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to delete booking" }, { status: 500 });
  }
}
