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
    // Accept either phone or email as the identifier
    const { phone, email, password } = body;
    const identifier = email || phone;

    if (!identifier || !password) {
      return NextResponse.json(
        { error: "Email/phone and password are required" },
        { status: 400 }
      );
    }

    // Look up customer by email OR phone
    let customer = null;
    
    // Try to find by phone first
    const customersByPhone = await db
      .select()
      .from(customers)
      .where(eq(customers.phone, identifier));
    
    if (customersByPhone.length > 0) {
      customer = customersByPhone[0];
    } else {
      // Try to find by email
      const customersByEmail = await db
        .select()
        .from(customers)
        .where(eq(customers.email, identifier));
      
      if (customersByEmail.length > 0) {
        customer = customersByEmail[0];
      }
    }

    if (!customer) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // If customer has no password set, they can't login with password
    if (!customer.password) {
      return NextResponse.json(
        { error: "This account doesn't have a password. Please use OTP login or create a password." },
        { status: 401 }
      );
    }

    // Verify password with bcrypt
    const isValidPassword = await bcrypt.compare(password, customer.password);
    
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
