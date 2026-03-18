import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { customerCommunications, staff } from "@/db/schema";
import { desc, eq, and } from "drizzle-orm";
import { requirePermission, type AuthenticatedRequest } from "@/lib/authMiddleware";

// GET /api/communications — list communications (filtered by customer)
export async function GET(req: AuthenticatedRequest) {
  const authResult = await requirePermission(req, "customers", "read");
  
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const { searchParams } = new URL(req.url);
    const customerId = searchParams.get("customerId");
    const bookingId = searchParams.get("bookingId");
    const type = searchParams.get("type");
    const limit = parseInt(searchParams.get("limit") || "50");

    if (!customerId && !bookingId) {
      return NextResponse.json(
        { error: "customerId or bookingId is required" },
        { status: 400 }
      );
    }

    let conditions = [];
    if (customerId) {
      conditions.push(eq(customerCommunications.customerId, parseInt(customerId)));
    }
    if (bookingId) {
      conditions.push(eq(customerCommunications.bookingId, parseInt(bookingId)));
    }
    if (type) {
      conditions.push(eq(customerCommunications.type, type));
    }

    const results = await db
      .select({
        id: customerCommunications.id,
        customerId: customerCommunications.customerId,
        bookingId: customerCommunications.bookingId,
        staffId: customerCommunications.staffId,
        type: customerCommunications.type,
        direction: customerCommunications.direction,
        content: customerCommunications.content,
        metadata: customerCommunications.metadata,
        createdAt: customerCommunications.createdAt,
      })
      .from(customerCommunications)
      // @ts-ignore
      .where(and(...conditions))
      .orderBy(desc(customerCommunications.createdAt))
      .limit(limit);

    return NextResponse.json(results);
  } catch (err) {
    console.error("Communications fetch error:", err);
    return NextResponse.json({ error: "Failed to fetch communications" }, { status: 500 });
  }
}

// POST /api/communications — create a new communication log
export async function POST(req: AuthenticatedRequest) {
  const authResult = await requirePermission(req, "customers", "create");
  
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const body = await req.json();
    const { customerId, bookingId, type, direction, content, metadata } = body;

    if (!customerId || !type || !direction || !content) {
      return NextResponse.json(
        { error: "customerId, type, direction, and content are required" },
        { status: 400 }
      );
    }

    const [comm] = await db
      .insert(customerCommunications)
      .values({
        customerId,
        bookingId: bookingId || null,
        staffId: authResult.id,
        type,
        direction,
        content,
        metadata: metadata ? JSON.stringify(metadata) : null,
      })
      .returning();

    return NextResponse.json(comm, { status: 201 });
  } catch (err) {
    console.error("Communication create error:", err);
    return NextResponse.json({ error: "Failed to create communication log" }, { status: 500 });
  }
}
