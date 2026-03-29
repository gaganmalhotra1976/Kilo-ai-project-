import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { patients, customerOtps } from "@/db/schema";
import { eq, or, and, gt, isNull } from "drizzle-orm";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, phone, otp } = body;

    if (!otp) {
      return NextResponse.json(
        { error: "OTP is required" },
        { status: 400 }
      );
    }

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

    // Find valid OTP (phone-based only as per schema)
    const validOtpResult = await db
      .select()
      .from(customerOtps)
      .where(
        and(
          eq(customerOtps.phone, phone || customer.phone),
          eq(customerOtps.otp, otp),
          gt(customerOtps.expiresAt, new Date()),
          isNull(customerOtps.usedAt)
        )
      );

    if (validOtpResult.length === 0) {
      return NextResponse.json(
        { error: "Invalid or expired OTP" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "OTP verified successfully",
    });
  } catch (error) {
    console.error("Forgot password OTP verify error:", error);
    return NextResponse.json(
      { error: "Failed to verify OTP" },
      { status: 500 }
    );
  }
}
