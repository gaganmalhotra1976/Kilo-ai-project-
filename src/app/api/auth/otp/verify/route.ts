import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { customerOtps, customers } from "@/db/schema";
import { eq, and, gt, sql } from "drizzle-orm";

// POST /api/auth/otp/verify — verify OTP and login
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { phone, otp } = body;

    if (!phone || !otp) {
      return NextResponse.json({ error: "Phone and OTP are required" }, { status: 400 });
    }

    // Find valid OTP (not expired, not used)
    const [otpRecord] = await db
      .select()
      .from(customerOtps)
      .where(
        and(
          eq(customerOtps.phone, phone),
          eq(customerOtps.otp, otp),
          gt(customerOtps.expiresAt, new Date()),
          sql`${customerOtps.usedAt} IS NULL`
        )
      )
      .limit(1);

    if (!otpRecord) {
      return NextResponse.json({ error: "Invalid or expired OTP" }, { status: 401 });
    }

    // Mark OTP as used
    await db
      .update(customerOtps)
      .set({ usedAt: new Date() })
      .where(eq(customerOtps.id, otpRecord.id));

    // Get customer
    const [customer] = await db
      .select()
      .from(customers)
      .where(eq(customers.phone, phone))
      .limit(1);

    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    // Generate a simple session token
    const token = Buffer.from(`${customer.id}:${Date.now()}`).toString("base64");

    // Set cookie
    const response = NextResponse.json({
      success: true,
      customer: {
        id: customer.id,
        name: customer.name,
        phone: customer.phone,
        email: customer.email,
      },
      token,
    });

    response.cookies.set("portal_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch (err) {
    console.error("OTP verify error:", err);
    return NextResponse.json({ error: "Failed to verify OTP" }, { status: 500 });
  }
}
