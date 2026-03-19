import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { customers, customerOtps } from "@/db/schema";
import { eq, or, and, gt, isNull } from "drizzle-orm";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, phone, otp, newPassword } = body;

    if (!newPassword) {
      return NextResponse.json(
        { error: "New password is required" },
        { status: 400 }
      );
    }

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
        .from(customers)
        .where(eq(customers.email, email))
        .get();
    } else {
      customer = await db
        .select()
        .from(customers)
        .where(eq(customers.phone, phone))
        .get();
    }

    if (!customer) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      );
    }

    // Find valid OTP (phone-based only as per schema)
    const [validOtp] = await db
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

    if (!validOtp) {
      return NextResponse.json(
        { error: "Invalid or expired OTP" },
        { status: 401 }
      );
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update customer's password
    await db.update(customers).set({
      password: hashedPassword,
    }).where(eq(customers.id, customer.id));

    // Mark OTP as used
    await db.update(customerOtps).set({
      usedAt: new Date(),
    }).where(eq(customerOtps.id, validOtp.id));

    return NextResponse.json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error("Forgot password reset error:", error);
    return NextResponse.json(
      { error: "Failed to reset password" },
      { status: 500 }
    );
  }
}
