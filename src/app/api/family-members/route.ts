import { NextResponse } from "next/server";
import { db } from "@/db";
import { familyMembers } from "@/db/schema";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { customerId, name, dateOfBirth, gender, vaccineCardUrl } = body;

    if (!customerId || !name) {
      return NextResponse.json(
        { error: "Customer ID and name are required" },
        { status: 400 }
      );
    }

    const customerIdNum = typeof customerId === "string" ? parseInt(customerId) : customerId;

    if (isNaN(customerIdNum)) {
      return NextResponse.json(
        { error: "Invalid customer ID" },
        { status: 400 }
      );
    }

    const newFamilyMember = await db
      .insert(familyMembers)
      .values({
        customerId: customerIdNum,
        name,
        dateOfBirth: dateOfBirth || null,
        gender: gender || null,
        vaccineCardUrl: vaccineCardUrl || null,
      })
      .returning();

    return NextResponse.json(newFamilyMember[0]);
  } catch (error) {
    console.error("Error creating family member:", error);
    return NextResponse.json(
      { error: "Failed to create family member" },
      { status: 500 }
    );
  }
}
