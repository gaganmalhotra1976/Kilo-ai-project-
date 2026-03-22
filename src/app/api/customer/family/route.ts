import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { familyMembers } from "@/db/schema";
import { eq } from "drizzle-orm";

// GET /api/customer/family?customerId=X — List family members
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const customerId = searchParams.get("customerId");

    if (!customerId) {
      return NextResponse.json({ error: "Customer ID required" }, { status: 400 });
    }

    const members = await db
      .select()
      .from(familyMembers)
      .where(eq(familyMembers.customerId, parseInt(customerId)));

    return NextResponse.json({ success: true, data: members });
  } catch (error) {
    console.error("GET /api/customer/family error:", error);
    return NextResponse.json({ error: "Failed to fetch family members" }, { status: 500 });
  }
}

// POST /api/customer/family — Add a new family member (self-service, no admin auth)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { customerId, name, dateOfBirth, gender, vaccineCardData, pictureData, registrationNumber } = body;

    if (!customerId || !name) {
      return NextResponse.json(
        { error: "Customer ID and name are required" },
        { status: 400 }
      );
    }

    const newFamilyMember = await db
      .insert(familyMembers)
      .values({
        customerId: typeof customerId === "string" ? parseInt(customerId) : customerId,
        registrationNumber: registrationNumber || null,
        name,
        dateOfBirth: dateOfBirth || null,
        gender: gender || null,
        vaccineCardData: vaccineCardData || null,
        pictureData: pictureData || null,
      })
      .returning();

    return NextResponse.json({ success: true, data: newFamilyMember[0] });
  } catch (error) {
    console.error("POST /api/customer/family error:", error);
    return NextResponse.json(
      { error: "Failed to create family member" },
      { status: 500 }
    );
  }
}
