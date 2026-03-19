import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { customers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requirePermission, type AuthenticatedRequest } from "@/lib/authMiddleware";
import { logStaffAction } from "@/lib/adminAuth";
import bcrypt from "bcryptjs";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/customers/[id]
export async function GET(request: Request, { params }: RouteParams) {
  const req = request as AuthenticatedRequest;
  const authResult = await requirePermission(req, "customers", "read");
  
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const { id } = await params;
    const customerId = parseInt(id);

    if (isNaN(customerId)) {
      return NextResponse.json(
        { error: "Invalid customer ID" },
        { status: 400 }
      );
    }

    const customer = await db.query.customers.findFirst({
      where: eq(customers.id, customerId),
    });

    if (!customer) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      );
    }

    await logStaffAction(authResult.id, "view", "customers", customerId);

    const { password: _password, ...customerWithoutPassword } = customer;
    return NextResponse.json(customerWithoutPassword);
  } catch (error) {
    console.error("Error fetching customer:", error);
    return NextResponse.json(
      { error: "Failed to fetch customer" },
      { status: 500 }
    );
  }
}

// PATCH /api/customers/[id] — update customer
export async function PATCH(req: AuthenticatedRequest, { params }: RouteParams) {
  const authResult = await requirePermission(req, "customers", "update");
  
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const { id } = await params;
    const customerId = parseInt(id);

    if (isNaN(customerId)) {
      return NextResponse.json(
        { error: "Invalid customer ID" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { name, email, address, city, notes, password } = body;

    const updateData: any = {
      name: name ?? undefined,
      email: email ?? undefined,
      address: address ?? undefined,
      city: city ?? undefined,
      notes: notes ?? undefined,
    };

    if (password) {
      updateData.password = await bcrypt.hash(password, 12);
    }

    const [updated] = await db
      .update(customers)
      .set(updateData)
      .where(eq(customers.id, customerId))
      .returning();

    if (!updated) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      );
    }

    await logStaffAction(authResult.id, "update", "customers", customerId, { name, email });

    const { password: _password, ...customerWithoutPassword } = updated;
    return NextResponse.json(customerWithoutPassword);
  } catch (error) {
    console.error("Error updating customer:", error);
    return NextResponse.json(
      { error: "Failed to update customer" },
      { status: 500 }
    );
  }
}

// DELETE /api/customers/[id] — soft delete customer
export async function DELETE(req: AuthenticatedRequest, { params }: RouteParams) {
  const authResult = await requirePermission(req, "customers", "delete");
  
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const { id } = await params;
    const customerId = parseInt(id);

    if (isNaN(customerId)) {
      return NextResponse.json(
        { error: "Invalid customer ID" },
        { status: 400 }
      );
    }

    // Soft delete: add "(deleted)" to name and clear sensitive data
    const [updated] = await db
      .update(customers)
      .set({
        name: "Deleted Customer",
        phone: "0000000000",
        email: null,
        address: null,
        notes: "Customer soft-deleted by staff",
      })
      .where(eq(customers.id, customerId))
      .returning();

    if (!updated) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      );
    }

    await logStaffAction(authResult.id, "delete", "customers", customerId);

    return NextResponse.json({ success: true, message: "Customer soft-deleted" });
  } catch (error) {
    console.error("Error deleting customer:", error);
    return NextResponse.json(
      { error: "Failed to delete customer" },
      { status: 500 }
    );
  }
}
