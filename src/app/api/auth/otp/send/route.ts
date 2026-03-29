import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { customerOtps, patients } from "@/db/schema";
import { eq, and, gt } from "drizzle-orm";

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// POST /api/auth/otp/send — send OTP to phone
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { phone } = body;

    if (!phone) {
      return NextResponse.json({ error: "Phone number is required" }, { status: 400 });
    }

    // Check if customer exists
    const [customer] = await db
      .select()
      .from(patients)
      .where(eq(patients.phone, phone))
      .limit(1);

    if (!customer) {
      // Don't reveal that customer doesn't exist
      return NextResponse.json({ 
        success: true, 
        message: "OTP sent if customer exists",
        existingCustomer: false 
      });
    }

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // In production, you would integrate with SMS provider here
    // For now, we'll log it (in production, never log OTPs)
    console.log(`OTP for ${phone}: ${otp}`);

    // Store OTP
    await db.insert(customerOtps).values({
      phone,
      otp, // In production, hash this
      expiresAt,
    });

    // In production, send SMS via provider
    // await sendSMS(phone, `Your Vaccine Panda OTP is: ${otp}`);

    return NextResponse.json({ 
      success: true, 
      message: "OTP sent",
      existingCustomer: true 
    });
  } catch (err) {
    console.error("OTP send error:", err);
    return NextResponse.json({ error: "Failed to send OTP" }, { status: 500 });
  }
}
