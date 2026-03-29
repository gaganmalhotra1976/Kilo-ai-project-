import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { bookings, notifications, patients } from "@/db/schema";
import { eq } from "drizzle-orm";
// import { triggerBookingUpdated, triggerBookingCancelled } from "@/lib/webhooks";

// Stub functions to prevent build errors
async function triggerBookingUpdated(_data: any) { console.log("Webhook stub: triggerBookingUpdated"); }
async function triggerBookingCancelled(_data: any) { console.log("Webhook stub: triggerBookingCancelled"); }

const STATUS_MESSAGES: Record<string, string> = {
  pending: "Your booking is now pending. We will review it shortly.",
  quoted: "A quote has been created for your booking. Please check your booking details.",
  confirmed: "Your booking has been confirmed! We look forward to serving you.",
  completed: "Your vaccination booking is completed. Thank you!",
  cancelled: "Your booking has been cancelled. Contact us for more information.",
};

// GET /api/bookings/[id]
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await db
      .select()
      .from(bookings)
      .where(eq(bookings.id, parseInt(id, 10)));

    if (!result.length) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }
    return NextResponse.json(result[0]);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch booking" }, { status: 500 });
  }
}

// PATCH /api/bookings/[id] — update status or admin notes
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { status, adminNotes } = body;

    const updateData: Partial<typeof bookings.$inferInsert> = {
      updatedAt: new Date(),
    };
    if (status) updateData.status = status;
    if (adminNotes !== undefined) updateData.adminNotes = adminNotes;

    const updated = await db
      .update(bookings)
      .set(updateData)
      .where(eq(bookings.id, parseInt(id, 10)))
      .returning();

    if (!updated.length) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Create notification for customer when status changes
    if (status && updated[0].customerId) {
      try {
        const customer = await db
          .select()
          .from(patients)
          .where(eq(patients.id, updated[0].customerId))
          .then(res => res[0]);

        if (customer) {
          const message = STATUS_MESSAGES[status] || `Your booking status has been updated to: ${status}`;
          await db.insert(notifications).values({
            customerId: updated[0].customerId,
            type: "booking_status",
            title: `Booking #${id} - ${status.charAt(0).toUpperCase() + status.slice(1)}`,
            message,
            bookingId: parseInt(id, 10),
          });
          console.log("Notification created for booking", id);
        }
      } catch (notifErr) {
        console.error("Failed to create notification:", notifErr);
        // Don't fail the whole request if notification fails
      }
    }

    // Trigger webhooks based on status change
    // if (status === "cancelled") {
    //   await triggerBookingCancelled(updated[0]);
    // } else if (status) {
    //   await triggerBookingUpdated(updated[0]);
    // }

    return NextResponse.json(updated[0]);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to update booking" }, { status: 500 });
  }
}
