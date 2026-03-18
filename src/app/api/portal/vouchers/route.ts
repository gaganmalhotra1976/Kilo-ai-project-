import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { consultationVouchers, bookings } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

// GET /api/portal/vouchers — get customer's vouchers
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const customerId = searchParams.get("customerId");

  if (!customerId) {
    return NextResponse.json({ error: "Customer ID required" }, { status: 400 });
  }

  try {
    const results = await db
      .select()
      .from(consultationVouchers)
      .where(eq(consultationVouchers.customerId, parseInt(customerId)))
      .orderBy(desc(consultationVouchers.createdAt));

    return NextResponse.json(results);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch vouchers" }, { status: 500 });
  }
}
