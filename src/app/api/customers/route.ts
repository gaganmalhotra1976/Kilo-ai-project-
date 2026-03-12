import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { customers } from "@/db/schema";
import { desc, like, or, eq } from "drizzle-orm";
import { requireAuth, requirePermission, type AuthenticatedRequest } from "@/lib/authMiddleware";
import { logStaffAction } from "@/lib/adminAuth";

function sanitizeSearchInput(input: string): string {
  return input.replace(/[%_]/g, "\\$&").slice(0, 100);
}

// GET /api/customers
export async function GET(req: AuthenticatedRequest) {
  const authResult = await requirePermission(req, "customers", "read");
  
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");

    if (search) {
      const sanitized = sanitizeSearchInput(search);
      const results = await db
        .select()
        .from(customers)
        .where(
          or(
            like(customers.name, `%${sanitized}%`),
            like(customers.phone, `%${sanitized}%`),
            like(customers.email, `%${sanitized}%`)
          )
        )
        .orderBy(desc(customers.createdAt));
      return NextResponse.json(results);
    }

    const results = await db
      .select()
      .from(customers)
      .orderBy(desc(customers.createdAt));
    
    await logStaffAction(authResult.id, "view", "customers");
    return NextResponse.json(results);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch customers" }, { status: 500 });
  }
}

// POST /api/customers — Create new customer (manual creation by staff)
export async function POST(req: AuthenticatedRequest) {
  const authResult = await requirePermission(req, "customers", "create");
  
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const body = await req.json();
    const { name, phone, email, address, city } = body;

    if (!name || !phone) {
      return NextResponse.json(
        { error: "Name and phone are required" },
        { status: 400 }
      );
    }

    const existingCustomer = await db
      .select()
      .from(customers)
      .where(eq(customers.phone, phone))
      .limit(1);

    if (existingCustomer.length > 0) {
      return NextResponse.json(
        { error: "Customer with this phone number already exists" },
        { status: 409 }
      );
    }

    const [newCustomer] = await db
      .insert(customers)
      .values({
        name,
        phone,
        email: email || null,
        address: address || null,
        city: city || "Delhi",
      })
      .returning();

    await logStaffAction(authResult.id, "create", "customers", newCustomer.id, { name, phone });

    return NextResponse.json(newCustomer, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to create customer" }, { status: 500 });
  }
}
