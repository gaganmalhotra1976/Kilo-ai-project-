import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { bookings, paymentTransactions, quotes } from "@/db/schema";
import { eq } from "drizzle-orm";
import crypto from "crypto";
import { requirePermission, type AuthenticatedRequest } from "@/lib/authMiddleware";
import { getSettingWithDefault } from "@/lib/adminAuth";

function generateTransactionId(): string {
  return `VP${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
}

async function createPhonePePaymentLink(
  amount: number,
  transactionId: string,
  customerPhone: string,
  customerName: string,
  callbackUrl: string
): Promise<{ paymentLink: string; paymentLinkId: string } | null> {
  const merchantId = await getSettingWithDefault("phonepe_merchant_id");
  const merchantKey = await getSettingWithDefault("phonepe_merchant_key");
  const environment = await getSettingWithDefault("phonepe_environment"); // sandbox | production

  if (!merchantId || !merchantKey) {
    console.error("PhonePe credentials not configured");
    return null;
  }

  const baseUrl = environment === "production" 
    ? "https://api.phonepe.com/apis/pg" 
    : "https://api-preprod.phonepe.com/apis/pg";

  const payload = {
    merchantId,
    merchantTransactionId: transactionId,
    merchantUserId: `MUID${customerPhone}`,
    amount: Math.round(amount * 100), // PhonePe expects paise
    redirectUrl: callbackUrl,
    callbackUrl: callbackUrl,
    mobileNumber: customerPhone,
    name: customerName,
  };

  const payloadString = Buffer.from(JSON.stringify(payload)).toString("base64");
  const checksum = crypto
    .createHash("sha256")
    .update(payloadString + `/pg/v1/pay${merchantKey}`)
    .digest("hex");

  try {
    const response = await fetch(`${baseUrl}/checkout/pay`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Verify": checksum,
      },
      body: JSON.stringify({
        request: payloadString,
      }),
    });

    const data = await response.json();
    
    if (data.success && data.data?.instrumentResponse?.redirectInfo?.url) {
      return {
        paymentLink: data.data.instrumentResponse.redirectInfo.url,
        paymentLinkId: data.data.merchantTransactionId,
      };
    }
    
    console.error("PhonePe response:", data);
    return null;
  } catch (error) {
    console.error("PhonePe error:", error);
    return null;
  }
}

// POST /api/payments/link — generate payment link
export async function POST(req: AuthenticatedRequest) {
  const authResult = await requirePermission(req, "bookings", "create");
  
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const body = await req.json();
    const { bookingId, amount } = body;

    if (!bookingId || !amount) {
      return NextResponse.json(
        { error: "bookingId and amount are required" },
        { status: 400 }
      );
    }

    const [booking] = await db
      .select()
      .from(bookings)
      .where(eq(bookings.id, bookingId));

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Get approved quote for amount if not specified
    let finalAmount = amount;
    if (!finalAmount) {
      const bookingQuotes = await db
        .select()
        .from(quotes)
        .where(eq(quotes.bookingId, bookingId));
      const approvedQuote = bookingQuotes.find((q) => q.status === "approved");
      if (approvedQuote) {
        finalAmount = approvedQuote.total;
      }
    }

    const transactionId = generateTransactionId();
    const callbackUrl = `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/payments/webhook?transactionId=${transactionId}`;

    // Try to create PhonePe payment link
    const phonepeResult = await createPhonePePaymentLink(
      finalAmount,
      transactionId,
      booking.customerPhone,
      booking.customerName,
      callbackUrl
    );

    // Store transaction record
    const [transaction] = await db
      .insert(paymentTransactions)
      .values({
        bookingId,
        amount: finalAmount,
        provider: "phonepe",
        ourTransactionId: transactionId,
        status: phonepeResult ? "initiated" : "pending",
        paymentLink: phonepeResult?.paymentLink || null,
        paymentLinkId: phonepeResult?.paymentLinkId || null,
      })
      .returning();

    if (phonepeResult) {
      return NextResponse.json({
        success: true,
        paymentLink: phonepeResult.paymentLink,
        transactionId,
        transaction: transaction,
      });
    } else {
      // Fallback: return manual payment instructions
      return NextResponse.json({
        success: false,
        message: "Payment gateway not configured. Please contact us for payment.",
        transactionId,
        transaction: transaction,
      });
    }
  } catch (err) {
    console.error("Payment link error:", err);
    return NextResponse.json({ error: "Failed to create payment link" }, { status: 500 });
  }
}
