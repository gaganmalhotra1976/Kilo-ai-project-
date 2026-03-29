import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { patients, customerOtps } from "@/db/schema";
import { eq, or, and, gt } from "drizzle-orm";
import crypto from "crypto";

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, phone } = body;

    if (!email && !phone) {
      return NextResponse.json(
        { error: "Email or phone number is required" },
        { status: 400 }
      );
    }

    // Find customer
    let customer;
    if (email) {
      customer = await db
        .select()
        .from(patients)
        .where(eq(patients.email, email))
        .get();
    } else {
      customer = await db
        .select()
        .from(patients)
        .where(eq(patients.phone, phone))
        .get();
    }

    if (!customer) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      );
    }

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Create new OTP record (customer_otps uses phone field only)
    await db.insert(customerOtps).values({
      phone: phone || customer.phone,
      otp,
      expiresAt,
    });

    // Log OTP for debugging
    console.log(`Password reset OTP for ${email || phone}: ${otp}`);

    return NextResponse.json({
      success: true,
      message: "OTP sent successfully",
    });
  } catch (error) {
    console.error("Forgot password OTP send error:", error);
    return NextResponse.json(
      { error: "Failed to send OTP" },
      { status: 500 }
    );
  }
}
