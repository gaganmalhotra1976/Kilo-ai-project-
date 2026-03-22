import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { quotes, bookings } from "@/db/schema";
import { eq } from "drizzle-orm";
// import { triggerQuoteSent } from "@/lib/webhooks";

// Stub function to prevent build errors
async function triggerQuoteSent(_data: any) { console.log("Webhook stub: triggerQuoteSent"); }

// GET /api/quotes/[id] — get quote by ID
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const [quote] = await db
      .select()
      .from(quotes)
      .where(eq(quotes.id, parseInt(id, 10)));

    if (!quote) {
      return NextResponse.json({ error: "Quote not found" }, { status: 404 });
    }

    return NextResponse.json(quote);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch quote" }, { status: 500 });
  }
}

// PATCH /api/quotes/[id] — update quote (status or full quote edit)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { status, lineItems, convenienceFee, discountType, discountValue, discountAmount, additionalChargeType, additionalChargeValue, additionalChargeDescription, additionalChargeAmount, subtotal, gstAmount, total, validUntil } = body;

    const updateData: Partial<typeof quotes.$inferInsert> = {};

    // If status is provided, update status (existing behavior)
    if (status !== undefined) {
      const validStatuses = ["draft", "sent", "approved", "rejected", "expired"];
      if (!validStatuses.includes(status)) {
        return NextResponse.json({ error: "Invalid status" }, { status: 400 });
      }
      updateData.status = status;
      if (status === "sent") updateData.sentAt = new Date();
      if (status === "approved") updateData.approvedAt = new Date();
    }

    // If lineItems is provided, update quote details (for edit functionality)
    if (lineItems !== undefined) {
      updateData.lineItems = JSON.stringify(lineItems);
      updateData.convenienceFee = convenienceFee ?? 0;
      updateData.discountType = discountType;
      updateData.discountValue = discountValue ?? 0;
      updateData.discountAmount = discountAmount ?? 0;
      updateData.additionalChargeType = additionalChargeType;
      updateData.additionalChargeValue = additionalChargeValue ?? 0;
      updateData.additionalChargeDescription = additionalChargeDescription;
      updateData.additionalChargeAmount = additionalChargeAmount ?? 0;
      updateData.subtotal = subtotal ?? 0;
      updateData.gstAmount = gstAmount ?? 0;
      updateData.total = total ?? 0;
      if (validUntil !== undefined) {
        updateData.validUntil = validUntil ? new Date(validUntil) : null as any;
      }
    }

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
    // if (status === "sent") {
    //   await triggerQuoteSent(updated[0]);
    // }

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
