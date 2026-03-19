import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { customers } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

export async function GET(req: NextRequest) {
  try {
    const hashedPassword = await bcrypt.hash("test123", 12);
    
    const existing = await db
      .select()
      .from(customers)
      .where(eq(customers.phone, "9876543210"));
    
    if (existing.length > 0) {
      return NextResponse.json({
        success: true,
        message: "Test customer already exists",
        customer: {
          id: existing[0].id,
          phone: existing[0].phone,
          email: existing[0].email,
          name: existing[0].name,
        },
      });
    }
    
    const [newCustomer] = await db.insert(customers).values({
      name: "Test Customer",
      phone: "9876543210",
      email: "test@example.com",
      password: hashedPassword,
      city: "Delhi",
      address: "123 Test Street, New Delhi",
    }).returning();
    
    return NextResponse.json({
      success: true,
      message: "Test customer created successfully",
      customer: {
        id: newCustomer.id,
        phone: newCustomer.phone,
        email: newCustomer.email,
        name: newCustomer.name,
      },
    });
  } catch (error) {
    console.error("Create test customer error:", error);
    return NextResponse.json({ 
      success: false, 
      error: "Failed to create test customer",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}
