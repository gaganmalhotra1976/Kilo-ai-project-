import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { consultationVouchers, bookings, quotes } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";

// Calculate number of free consultations based on billing amount
// < 3000 → 1 free consult
// 3000-4000 → 3 free consults
// 4000-5000 → 4 free consults
// Each worth ₹500
function calculateFreeConsultations(billingAmount: number): number {
  if (billingAmount < 3000) {
    return 1;
  } else if (billingAmount >= 3000 && billingAmount < 4000) {
    return 3;
  } else if (billingAmount >= 4000 && billingAmount < 5000) {
    return 4;
  } else if (billingAmount >= 5000) {
    // For every ₹1000 above 5000, add 1 more consultation
    // Base: 4 consultations for ₹4000-5000
    const extra = Math.floor((billingAmount - 5000) / 1000);
    return 4 + extra;
  }
  return 1; // Default
}

// POST /api/consultation-vouchers/auto-generate — Auto-generate vouchers when booking completed + paid
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { bookingId } = body;

    if (!bookingId) {
      return NextResponse.json({ error: "Booking ID required" }, { status: 400 });
    }

    // Get booking details
    const booking = await db.select()
      .from(bookings)
      .where(eq(bookings.id, bookingId));

    if (!booking[0]) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Check if booking is completed and paid
    if (booking[0].status !== "completed") {
      return NextResponse.json({ error: "Booking is not completed" }, { status: 400 });
    }

    if (booking[0].paymentStatus !== "paid") {
      return NextResponse.json({ error: "Payment is not completed" }, { status: 400 });
    }

    // Get the approved quote to find billing amount
    const quote = await db.select()
      .from(quotes)
      .where(and(
        eq(quotes.bookingId, bookingId),
        eq(quotes.status, "approved")
      ));

    if (!quote[0]) {
      return NextResponse.json({ error: "No approved quote found" }, { status: 400 });
    }

    // Check if vouchers already generated for this booking
    const existingVouchers = await db.select({ count: sql<number>`count(*)` })
      .from(consultationVouchers)
      .where(eq(consultationVouchers.bookingId, bookingId));

    if (existingVouchers[0] && existingVouchers[0].count > 0) {
      return NextResponse.json({ error: "Vouchers already generated for this booking" }, { status: 400 });
    }

    // Calculate free consultations based on billing amount
    const billingAmount = quote[0].subtotal;
    const numberOfVouchers = calculateFreeConsultations(billingAmount);
    const voucherValue = 500; // Each voucher worth ₹500

    const year = new Date().getFullYear();
    const patientNames = booking[0].patientNames ? JSON.parse(booking[0].patientNames) : [booking[0].customerName];
    const vouchers = [];

    // Generate vouchers for each patient
    for (let i = 0; i < numberOfVouchers; i++) {
      const patientName = patientNames[i % patientNames.length];
      const voucherCode = `VP-CONSULT-${year}-${bookingId.toString().padStart(4, '0')}-${(i + 1).toString().padStart(2, '0')}`;
      const issueDate = new Date();
      const expiryDate = new Date();
      expiryDate.setFullYear(expiryDate.getFullYear() + 1);

      const voucher = await db.insert(consultationVouchers).values({
        voucherCode,
        customerId: booking[0].customerId,
        patientName,
        bookingId,
        quoteId: quote[0].id,
        issueDate,
        expiryDate,
        status: "active",
        voucherValue: voucherValue
      }).returning();

      vouchers.push(voucher[0]);
    }

    // Update the quote with calculated values
    await db.update(quotes)
      .set({
        freeConsultations: numberOfVouchers,
        freeConsultationsValue: numberOfVouchers * voucherValue
      })
      .where(eq(quotes.id, quote[0].id));

    return NextResponse.json({
      success: true,
      data: {
        billingAmount,
        vouchersGenerated: numberOfVouchers,
        voucherValue,
        totalValue: numberOfVouchers * voucherValue,
        vouchers
      }
    }, { status: 201 });

  } catch (error) {
    console.error("POST /api/consultation-vouchers/auto-generate error:", error);
    return NextResponse.json({ error: "Failed to auto-generate vouchers" }, { status: 500 });
  }
}
