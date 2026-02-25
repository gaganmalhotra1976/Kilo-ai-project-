import { NextResponse } from "next/server";
import { db } from "@/db";
import { customers } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "vaccine-panda-dev-secret-change-in-production";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { phone, password } = body;

    if (!phone || !password) {
      return NextResponse.json(
        { error: "Phone and password are required" },
        { status: 400 }
      );
    }

    const customer = await db.query.customers.findFirst({
      where: eq(customers.phone, phone),
    });

    if (!customer) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Verify password with bcrypt
    const isValidPassword = await bcrypt.compare(password, customer.password || "");
    
    if (!isValidPassword) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        customerId: customer.id, 
        phone: customer.phone,
        name: customer.name 
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Don't return password in response
    const { password: _, ...customerWithoutPassword } = customer;

    return NextResponse.json({ 
      token,
      customer: customerWithoutPassword 
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Login failed" },
      { status: 500 }
    );
  }
}
