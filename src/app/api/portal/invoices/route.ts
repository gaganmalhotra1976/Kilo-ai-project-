import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { invoices } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

// GET /api/portal/invoices — get customer's invoices
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const customerId = searchParams.get("customerId");

  if (!customerId) {
    return NextResponse.json({ error: "Customer ID required" }, { status: 400 });
  }

  try {
    const results = await db
      .select()
      .from(invoices)
      .where(eq(invoices.customerId, parseInt(customerId)))
      .orderBy(desc(invoices.createdAt));

    return NextResponse.json(results);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch invoices" }, { status: 500 });
  }
}
