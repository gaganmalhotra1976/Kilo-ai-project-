import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { invoices, bookings, customers, quotes, settings } from "@/db/schema";
import { desc, eq, and } from "drizzle-orm";
import { requirePermission, type AuthenticatedRequest } from "@/lib/authMiddleware";
import { getSettingWithDefault } from "@/lib/adminAuth";

function generateInvoiceNumber(year: number, sequence: number): string {
  return `VP-INV-${year}-${String(sequence).padStart(4, "0")}`;
}

function getHSNCode(vaccineName: string): string {
  const hsnMap: Record<string, string> = {
    "influenza": "3002",
    "flu": "3002",
    "hepatitis": "3002",
    "covid": "3002",
    "covaxin": "3002",
    "covishield": "3002",
    "measles": "3002",
    "polio": "3002",
    "pneumonia": "3002",
    "meningitis": "3002",
    "typhoid": "3002",
    "yellow fever": "3002",
    "rabies": "3002",
    "chickenpox": "3002",
    "default": "3004",
  };
  const lower = vaccineName.toLowerCase();
  for (const [key, code] of Object.entries(hsnMap)) {
    if (lower.includes(key)) return code;
  }
  return hsnMap.default;
}

// Helper to get invoice sequence for year
async function getInvoiceSequence(year: number): Promise<number> {
  const prefix = `VP-INV-${year}-`;
  try {
    const allInvoices = await db.select().from(invoices);
    const thisYear = allInvoices.filter((i) => i.invoiceNumber.startsWith(prefix));
    if (thisYear.length === 0) return 1;
    const maxSeq = Math.max(...thisYear.map((i) => parseInt(i.invoiceNumber.replace(prefix, ""))));
    return maxSeq + 1;
  } catch {
    return 1;
  }
}

// POST /api/invoices — generate invoice from booking
export async function POST(req: AuthenticatedRequest) {
  const authResult = await requirePermission(req, "invoices", "create");
  
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const body = await req.json();
    const { bookingId } = body;

    if (!bookingId) {
      return NextResponse.json({ error: "bookingId is required" }, { status: 400 });
    }

    // Fetch booking with customer and quote
    const [booking] = await db.select().from(bookings).where(eq(bookings.id, bookingId));
    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    const [customer] = await db.select().from(customers).where(eq(customers.id, booking.customerId!));

    // Get approved quote for this booking
    const bookingQuotes = await db.select().from(quotes).where(eq(quotes.bookingId, bookingId));
    const approvedQuote = bookingQuotes.find((q) => q.status === "approved");
    
    if (!approvedQuote) {
      return NextResponse.json({ error: "No approved quote found for this booking" }, { status: 400 });
    }

    // Get settings
    const gstin = await getSettingWithDefault("gstin");
    const companyName = await getSettingWithDefault("companyName");
    const companyPhone = await getSettingWithDefault("companyPhone");
    const companyEmail = await getSettingWithDefault("companyEmail");

    // Parse line items from quote
    let lineItems: any[] = [];
    try {
      lineItems = JSON.parse(approvedQuote.lineItems);
    } catch {
      lineItems = [];
    }

    // Calculate tax breakdown (assume intra-state - CGST + SGST)
    // For inter-state, use IGST
    const isIntraState = true; // Could be determined by customer city/state
    const cgstRate = isIntraState ? 9 : 0;
    const sgstRate = isIntraState ? 9 : 0;
    const igstRate = isIntraState ? 0 : 18;

    const processedLineItems = lineItems.map((item: any) => {
      const taxableAmount = item.qty * item.unitPrice;
      const cgst = isIntraState ? (taxableAmount * cgstRate) / 100 : 0;
      const sgst = isIntraState ? (taxableAmount * sgstRate) / 100 : 0;
      const igst = !isIntraState ? (taxableAmount * igstRate) / 100 : 0;
      return {
        vaccine: item.vaccine,
        hsnCode: getHSNCode(item.vaccine),
        qty: item.qty,
        unitPrice: item.unitPrice,
        taxableAmount,
        cgst: cgst.toFixed(2),
        sgst: sgst.toFixed(2),
        igst: igst.toFixed(2),
        total: (taxableAmount + cgst + sgst + igst).toFixed(2),
      };
    });

    const subtotal = processedLineItems.reduce((sum: number, item: any) => sum + item.taxableAmount, 0);
    const totalCgst = processedLineItems.reduce((sum: number, item: any) => sum + parseFloat(item.cgst), 0);
    const totalSgst = processedLineItems.reduce((sum: number, item: any) => sum + parseFloat(item.sgst), 0);
    const totalIgst = processedLineItems.reduce((sum: number, item: any) => sum + parseFloat(item.igst), 0);
    const totalTax = totalCgst + totalSgst + totalIgst;

    // Generate invoice number
    const year = new Date().getFullYear();
    const sequence = await getInvoiceSequence(year);
    const invoiceNumber = generateInvoiceNumber(year, sequence);

    // Create invoice
    const [invoice] = await db
      .insert(invoices)
      .values({
        invoiceNumber,
        bookingId: booking.id,
        customerId: customer!.id,
        subtotal,
        discountType: approvedQuote.discountType,
        discountValue: approvedQuote.discountValue,
        discountAmount: approvedQuote.discountAmount,
        cgstRate: isIntraState ? cgstRate : 0,
        cgstAmount: totalCgst,
        sgstRate: isIntraState ? sgstRate : 0,
        sgstAmount: totalSgst,
        igstRate: isIntraState ? 0 : igstRate,
        igstAmount: totalIgst,
        totalTax,
        total: subtotal - (approvedQuote.discountAmount || 0) + totalTax,
        lineItems: JSON.stringify(processedLineItems),
        status: "generated",
        generatedAt: new Date(),
      })
      .returning();

    return NextResponse.json(invoice, { status: 201 });
  } catch (err) {
    console.error("Invoice generation error:", err);
    return NextResponse.json({ error: "Failed to generate invoice" }, { status: 500 });
  }
}

// GET /api/invoices — list invoices
export async function GET(req: AuthenticatedRequest) {
  const authResult = await requirePermission(req, "invoices", "read");
  
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const { searchParams } = new URL(req.url);
    const bookingId = searchParams.get("bookingId");
    const customerId = searchParams.get("customerId");

    let query = db.select().from(invoices).orderBy(desc(invoices.createdAt));

    if (bookingId) {
      // @ts-ignore
      query = query.where(eq(invoices.bookingId, parseInt(bookingId)));
    }
    if (customerId) {
      // @ts-ignore
      query = query.where(eq(invoices.customerId, parseInt(customerId)));
    }

    const results = await query;
    return NextResponse.json(results);
  } catch (err) {
    console.error("Invoice fetch error:", err);
    return NextResponse.json({ error: "Failed to fetch invoices" }, { status: 500 });
  }
}
