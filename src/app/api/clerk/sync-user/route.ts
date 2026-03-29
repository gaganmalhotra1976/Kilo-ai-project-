import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { patients } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";

export async function POST(req: NextRequest) {
  try {
    const { userId, email, firstName, lastName, phone } = await req.json();

    if (!userId || !email) {
      return NextResponse.json({ error: "userId and email are required" }, { status: 400 });
    }

    // Check if patient already exists by Clerk userId or email
    const existing = await db
      .select()
      .from(patients)
      .where(eq(patients.email, email));

    if (existing.length > 0) {
      // Update existing patient with Clerk userId
      await db
        .update(patients)
        .set({ 
          name: firstName ? `${firstName} ${lastName || ""}`.trim() : existing[0].name,
          phone: phone || existing[0].phone,
        })
        .where(eq(patients.email, email));
      
      return NextResponse.json({ 
        success: true, 
        message: "Patient updated",
        patientId: existing[0].id 
      });
    }

    // Create new patient from Clerk user
    const [newPatient] = await db
      .insert(patients)
      .values({
        name: firstName ? `${firstName} ${lastName || ""}`.trim() : email.split("@")[0],
        email: email,
        phone: phone || null,
        city: "Delhi",
      })
      .returning();

    return NextResponse.json({ 
      success: true, 
      message: "Patient created from Clerk user",
      patientId: newPatient.id 
    });
  } catch (error) {
    console.error("Sync Clerk user error:", error);
    return NextResponse.json({ error: "Failed to sync user" }, { status: 500 });
  }
}