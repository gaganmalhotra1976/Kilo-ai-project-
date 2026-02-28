import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { quotes, bookings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { triggerQuoteSent } from "@/lib/webhooks";

// PATCH /api/quotes/[id] — update quote status (send, approve, reject)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { status } = body;

    const validStatuses = ["draft", "sent", "approved", "rejected", "expired"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const updateData: Partial<typeof quotes.$inferInsert> = { status };
    if (status === "sent") updateData.sentAt = new Date();
    if (status === "approved") updateData.approvedAt = new Date();

    const updated = await db
      .update(quotes)
      .set(updateData)
      .where(eq(quotes.id, parseInt(id, 10)))
      .returning();

    if (!updated.length) {
      return NextResponse.json({ error: "Quote not found" }, { status: 404 });
    }

    // Sync booking status
    if (status === "approved") {
      await db
        .update(bookings)
        .set({ status: "confirmed", updatedAt: new Date() })
        .where(eq(bookings.id, updated[0].bookingId));
    }

    // Trigger webhook for quote sent
    if (status === "sent") {
      await triggerQuoteSent(updated[0]);
    }

    return NextResponse.json(updated[0]);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to update quote" }, { status: 500 });
  }
}

// DELETE /api/quotes/[id]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await db.delete(quotes).where(eq(quotes.id, parseInt(id, 10)));
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to delete quote" }, { status: 500 });
  }
}
