import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { patients } from "@/db/schema";
import { eq } from "drizzle-orm";

// Clerk webhook endpoint to sync user data when they sign up or update profile
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, data } = body;

    // Handle different Clerk event types
    switch (type) {
      case "user.created":
      case "user.updated": {
        const { id: clerkUserId, email_addresses, first_name, last_name, phone_numbers } = data;
        const primaryEmail = email_addresses?.[0]?.email_address;
        
        if (!primaryEmail) {
          return NextResponse.json({ error: "No email found" }, { status: 400 });
        }

        const patientName = first_name 
          ? `${first_name} ${last_name || ""}`.trim()
          : primaryEmail.split("@")[0];
        
        const phone = phone_numbers?.[0]?.phone_number || null;

        // Check if patient exists
        const existing = await db
          .select()
          .from(patients)
          .where(eq(patients.email, primaryEmail));

        if (existing.length > 0) {
          // Update existing patient
          await db
            .update(patients)
            .set({ 
              name: patientName,
              phone: phone || existing[0].phone,
            })
            .where(eq(patients.email, primaryEmail));
        } else {
          // Create new patient
          await db
            .insert(patients)
            .values({
              name: patientName,
              email: primaryEmail,
              phone: phone,
              city: "Delhi",
            });
        }
        
        console.log(`Clerk user ${type}: ${primaryEmail}`);
        break;
      }

      case "user.deleted": {
        // Optionally soft delete or handle user deletion
        console.log(`Clerk user deleted: ${data.id}`);
        break;
      }

      default:
        console.log(`Unhandled Clerk event: ${type}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Clerk webhook error:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}