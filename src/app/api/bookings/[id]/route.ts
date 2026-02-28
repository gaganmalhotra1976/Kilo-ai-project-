import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { bookings } from "@/db/schema";
import { eq } from "drizzle-orm";
// import { triggerBookingUpdated, triggerBookingCancelled } from "@/lib/webhooks";

// Stub functions to prevent build errors
async function triggerBookingUpdated(_data: any) { console.log("Webhook stub: triggerBookingUpdated"); }
async function triggerBookingCancelled(_data: any) { console.log("Webhook stub: triggerBookingCancelled"); }

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
