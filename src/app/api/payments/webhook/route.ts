import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { bookings, paymentTransactions, consultationVouchers } from "@/db/schema";
import { eq } from "drizzle-orm";
import crypto from "crypto";

function generateVoucherCode(): string {
  return `VOUCHER-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
}

// POST /api/payments/webhook — handle PhonePe callbacks
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const transactionId = req.nextUrl.searchParams.get("transactionId");

    console.log("Payment webhook received:", { transactionId, body });

    // Verify callback authenticity
    const merchantKey = process.env.PHONEPE_MERCHANT_KEY;
    if (merchantKey && body.response) {
      const responseString = Buffer.from(body.response).toString("utf-8");
      const expectedChecksum = crypto
        .createHash("sha256")
        .update(responseString + `/pg/v1/status${process.env.PHONEPE_MERCHANT_ID}${merchantKey}`)
        .digest("hex");
      
      if (body.checksum !== expectedChecksum) {
        console.error("Invalid webhook checksum");
        return NextResponse.json({ error: "Invalid checksum" }, { status: 400 });
      }
    }

    const responseData = body.response 
      ? JSON.parse(Buffer.from(body.response).toString("utf-8"))
      : body;

    const providerTransactionId = responseData.merchantTransactionId || transactionId;
    const paymentState = responseData.state;
    const success = paymentState === "COMPLETED";

    // Find transaction
    const [transaction] = await db
      .select()
      .from(paymentTransactions)
      .where(eq(paymentTransactions.ourTransactionId, providerTransactionId));

    if (!transaction) {
      console.error("Transaction not found:", providerTransactionId);
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }

    // Update transaction status
    const status = success ? "captured" : "failed";
    await db
      .update(paymentTransactions)
      .set({
        status,
        providerTransactionId: responseData.transactionId || null,
        callbackData: JSON.stringify(responseData),
        updatedAt: new Date(),
      })
      .where(eq(paymentTransactions.id, transaction.id));

    // If payment successful, update booking
    if (success && transaction.bookingId) {
      await db
        .update(bookings)
        .set({
          paymentStatus: "paid",
          status: "confirmed",
        })
        .where(eq(bookings.id, transaction.bookingId));

      // Generate consultation vouchers
      const [booking] = await db
        .select()
        .from(bookings)
        .where(eq(bookings.id, transaction.bookingId));

      if (booking?.customerId) {
        // Generate vouchers based on quote
        // (In production, get from quote.freeConsultations)
        const voucherCount = 1; // Default 1 voucher per paid booking
        const expiryDate = new Date();
        expiryDate.setMonth(expiryDate.getMonth() + 6); // 6 months validity

        for (let i = 0; i < voucherCount; i++) {
          await db.insert(consultationVouchers).values({
            voucherCode: generateVoucherCode(),
            customerId: booking.customerId,
            patientName: booking.customerName,
            bookingId: transaction.bookingId,
            issueDate: new Date(),
            expiryDate: expiryDate,
            status: "active",
          });
        }
      }

      console.log(`Payment successful for booking ${transaction.bookingId}, vouchers generated`);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Payment webhook error:", err);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
