import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { payments } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

// GET /api/payments — list all payments (admin)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    let query = db.select().from(payments).orderBy(desc(payments.createdAt));

    if (status) {
      const results = await db
        .select()
        .from(payments)
        .where(eq(payments.status, status))
        .orderBy(desc(payments.createdAt));
      return NextResponse.json(results);
    }

    const results = await query;
    return NextResponse.json(results);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch payments" }, { status: 500 });
  }
}

// POST /api/payments — create a new payment record
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      bookingId,
      amount,
      paymentMethod,
      transactionId,
      status,
    } = body;

    if (!amount || !paymentMethod) {
      return NextResponse.json(
        { error: "Missing required fields: amount, paymentMethod" },
        { status: 400 }
      );
    }

    const insertData: any = {
      bookingId: bookingId || null,
      amount: amount,
      paymentMethod: paymentMethod,
      transactionId: transactionId || null,
      status: status || "pending",
    };

    if (status === "received") {
      insertData.receivedAt = new Date();
    }

    const inserted = await db
      .insert(payments)
      .values(insertData)
      .returning();

    // Trigger webhook for received payments
    if (status === "received") {
      const { triggerPaymentReceived } = await import("@/lib/webhooks");
      await triggerPaymentReceived(inserted[0]);
    }

    return NextResponse.json(inserted[0], { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to create payment" }, { status: 500 });
  }
}
