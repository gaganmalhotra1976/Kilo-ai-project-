import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { bookings, customers, quotes, documentStorage } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requirePermission, type AuthenticatedRequest } from "@/lib/authMiddleware";
import { getSettingWithDefault } from "@/lib/adminAuth";

function generateCertificateId(): string {
  return `VP-CERT-${Date.now().toString(36).toUpperCase()}`;
}

// POST /api/vaccination-certificates — generate certificate for completed booking
export async function POST(req: AuthenticatedRequest) {
  const authResult = await requirePermission(req, "bookings", "create");
  
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const body = await req.json();
    const { bookingId, patientName, vaccineName, brand, batchNumber, dateAdministered, nurseName, nextDueDate, notes } = body;

    if (!bookingId || !patientName || !vaccineName || !dateAdministered) {
      return NextResponse.json(
        { error: "bookingId, patientName, vaccineName, and dateAdministered are required" },
        { status: 400 }
      );
    }

    const [booking] = await db.select().from(bookings).where(eq(bookings.id, bookingId));
    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    const [customer] = await db.select().from(customers).where(eq(customers.id, booking.customerId!));

    // Get company details from settings
    const companyName = await getSettingWithDefault("companyName");
    const companyPhone = await getSettingWithDefault("companyPhone");
    const companyEmail = await getSettingWithDefault("companyEmail");
    const gstin = await getSettingWithDefault("gstin");

    const certificateId = generateCertificateId();
    const certificateData = {
      certificateId,
      patientName,
      vaccineName,
      brand: brand || "N/A",
      batchNumber: batchNumber || "N/A",
      dateAdministered,
      nurseName: nurseName || "Authorized Medical Professional",
      nextDueDate: nextDueDate || null,
      notes: notes || "",
      company: {
        name: companyName || "The Vaccine Panda",
        phone: companyPhone || "9999109040",
        email: companyEmail || "info@thevaccinepanda.com",
        gstin: gstin || "07AABCU9603R1ZM",
      },
      issuedAt: new Date().toISOString(),
    };

    // Store certificate data as JSON in document storage
    const [doc] = await db.insert(documentStorage).values({
      customerId: customer?.id,
      bookingId,
      documentType: "vaccination_certificate",
      fileName: `${certificateId}.json`,
      fileUrl: `/certificates/${certificateId}.json`,
      metadata: JSON.stringify(certificateData),
    }).returning();

    return NextResponse.json({
      success: true,
      certificateId,
      certificateData,
      documentId: doc.id,
    }, { status: 201 });
  } catch (err) {
    console.error("Certificate generation error:", err);
    return NextResponse.json({ error: "Failed to generate certificate" }, { status: 500 });
  }
}

// GET /api/vaccination-certificates — list certificates
export async function GET(req: AuthenticatedRequest) {
  const { searchParams } = new URL(req.url);
  const customerId = searchParams.get("customerId");
  const bookingId = searchParams.get("bookingId");

  try {
    let query = db.select().from(documentStorage)
      .where(eq(documentStorage.documentType, "vaccination_certificate"));

    if (customerId) {
      // @ts-ignore
      query = query.where(eq(documentStorage.customerId, parseInt(customerId)));
    }
    if (bookingId) {
      // @ts-ignore
      query = query.where(eq(documentStorage.bookingId, parseInt(bookingId)));
    }

    const results = await query;
    const certificates = results.map((doc) => ({
      id: doc.id,
      bookingId: doc.bookingId,
      fileName: doc.fileName,
      metadata: doc.metadata ? JSON.parse(doc.metadata) : null,
      createdAt: doc.createdAt,
    }));

    return NextResponse.json(certificates);
  } catch (err) {
    console.error("Certificate fetch error:", err);
    return NextResponse.json({ error: "Failed to fetch certificates" }, { status: 500 });
  }
}
