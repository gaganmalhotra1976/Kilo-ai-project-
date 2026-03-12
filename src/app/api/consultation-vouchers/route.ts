import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { consultationVouchers, bookings, quotes } from "@/db/schema";
import { eq, and, gte, lte, sql, desc } from "drizzle-orm";

// GET /api/consultation-vouchers — List vouchers with filters
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const customerId = searchParams.get("customerId");
    const status = searchParams.get("status");

    const conditions = [];
    if (customerId) {
      conditions.push(eq(consultationVouchers.customerId, parseInt(customerId)));
    }
    if (status) {
      conditions.push(eq(consultationVouchers.status, status));
    }

    const vouchers = await db.select()
      .from(consultationVouchers)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(consultationVouchers.createdAt));

    // Get summary statistics
    const stats = await db.select({
      total: sql<number>`count(*)`,
      active: sql<number>`SUM(CASE WHEN ${consultationVouchers.status} = 'active' THEN 1 ELSE 0 END)`,
      redeemed: sql<number>`SUM(CASE WHEN ${consultationVouchers.status} = 'redeemed' THEN 1 ELSE 0 END)`,
      expired: sql<number>`SUM(CASE WHEN ${consultationVouchers.status} = 'expired' THEN 1 ELSE 0 END)`,
      converted: sql<number>`SUM(CASE WHEN ${consultationVouchers.status} = 'converted' THEN 1 ELSE 0 END)`
    })
    .from(consultationVouchers);

    return NextResponse.json({
      success: true,
      data: {
        vouchers,
        summary: {
          total: stats[0]?.total || 0,
          active: stats[0]?.active || 0,
          redeemed: stats[0]?.redeemed || 0,
          expired: stats[0]?.expired || 0,
          converted: stats[0]?.converted || 0,
          totalValue: (stats[0]?.active || 0) * 500
        }
      }
    });

  } catch (error) {
    console.error("GET /api/consultation-vouchers error:", error);
    return NextResponse.json({ error: "Failed to fetch vouchers" }, { status: 500 });
  }
}

// POST /api/consultation-vouchers — Create voucher(s)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { customerId, patientName, bookingId, quoteId, numberOfVouchers } = body;

    if (!customerId || !bookingId || !numberOfVouchers) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const year = new Date().getFullYear();
    const vouchers = [];

    for (let i = 1; i <= numberOfVouchers; i++) {
      const voucherCode = `VP-CONSULT-${year}-${bookingId.toString().padStart(4, '0')}-${i.toString().padStart(2, '0')}`;
      const issueDate = new Date();
      const expiryDate = new Date();
      expiryDate.setFullYear(expiryDate.getFullYear() + 1);

      const voucher = await db.insert(consultationVouchers).values({
        voucherCode,
        customerId,
        patientName,
        bookingId,
        quoteId,
        issueDate,
        expiryDate,
        status: "active"
      }).returning();

      vouchers.push(voucher[0]);
    }

    return NextResponse.json({
      success: true,
      data: vouchers
    }, { status: 201 });

  } catch (error) {
    console.error("POST /api/consultation-vouchers error:", error);
    return NextResponse.json({ error: "Failed to create vouchers" }, { status: 500 });
  }
}

// PATCH /api/consultation-vouchers — Redeem or convert voucher
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { voucherId, action, staffName, bookingId, discountAmount } = body;

    if (!voucherId || !action) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const voucher = await db.select()
      .from(consultationVouchers)
      .where(eq(consultationVouchers.id, voucherId));

    if (!voucher[0]) {
      return NextResponse.json({ error: "Voucher not found" }, { status: 404 });
    }

    if (voucher[0].status !== "active") {
      return NextResponse.json({ error: "Voucher is not active" }, { status: 400 });
    }

    if (action === "redeem") {
      await db.update(consultationVouchers)
        .set({
          status: "redeemed",
          redeemedDate: new Date(),
          redeemedBy: staffName || "admin",
          updatedAt: new Date()
        })
        .where(eq(consultationVouchers.id, voucherId));

      return NextResponse.json({ success: true, message: "Voucher redeemed successfully" });
    }

    if (action === "convert") {
      if (!bookingId) {
        return NextResponse.json({ error: "Booking ID required for conversion" }, { status: 400 });
      }

      // Check max discount per booking (₹100 = max 2 vouchers)
      const existingDiscounts = await db.select({ total: sql<number>`COALESCE(SUM(${consultationVouchers.discountAmountApplied}), 0)` })
        .from(consultationVouchers)
        .where(and(
          eq(consultationVouchers.convertedToBookingId, bookingId),
          eq(consultationVouchers.status, "converted")
        ));

      const currentDiscount = existingDiscounts[0]?.total || 0;
      const newDiscount = currentDiscount + (discountAmount || 50);

      if (newDiscount > 100) {
        return NextResponse.json({ error: "Maximum discount limit (₹100) reached for this booking" }, { status: 400 });
      }

      await db.update(consultationVouchers)
        .set({
          status: "converted",
          conversionType: "vaccine_discount",
          discountAmountApplied: discountAmount || 50,
          convertedToBookingId: bookingId,
          convertedBy: staffName || "admin",
          convertedAt: new Date(),
          updatedAt: new Date()
        })
        .where(eq(consultationVouchers.id, voucherId));

      return NextResponse.json({ success: true, message: "Voucher converted to discount" });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });

  } catch (error) {
    console.error("PATCH /api/consultation-vouchers error:", error);
    return NextResponse.json({ error: "Failed to process voucher" }, { status: 500 });
  }
}
