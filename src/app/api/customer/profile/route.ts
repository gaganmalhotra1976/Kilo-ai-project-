import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { patients } from "@/db/schema";
import { eq } from "drizzle-orm";

// GET /api/customer/profile — Get customer profile by ID (self-service)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const customerId = searchParams.get("customerId");

    if (!customerId) {
      return NextResponse.json({ error: "Customer ID required" }, { status: 400 });
    }

    const customer = await db.select()
      .from(patients)
      .where(eq(patients.id, parseInt(customerId)));

    if (!customer[0]) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    // Return customer without password
    const { password, ...customerData } = customer[0];
    return NextResponse.json({
      success: true,
      data: customerData
    });

  } catch (error) {
    console.error("GET /api/customer/profile error:", error);
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
  }
}

// PATCH /api/customer/profile — Update customer profile (self-service, no admin auth required)
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { customerId, name, email, phone, address, city, pinCode, landmark, pictureData } = body;

    if (!customerId) {
      return NextResponse.json({ error: "Customer ID required" }, { status: 400 });
    }

    // Verify customer exists
    const existingCustomer = await db.select()
      .from(patients)
      .where(eq(patients.id, customerId));

    if (!existingCustomer[0]) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    // Update customer
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (address !== undefined) updateData.address = address;
    if (city !== undefined) updateData.city = city;
    if (pinCode !== undefined) updateData.pinCode = pinCode;
    if (landmark !== undefined) updateData.landmark = landmark;
    if (pictureData !== undefined) updateData.pictureData = pictureData;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    const updated = await db.update(patients)
      .set(updateData)
      .where(eq(patients.id, customerId))
      .returning();

    if (!updated[0]) {
      return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
    }

    // Return updated customer without password
    const { password, ...customerData } = updated[0];
    return NextResponse.json({
      success: true,
      data: customerData
    });

  } catch (error) {
    console.error("PATCH /api/customer/profile error:", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
