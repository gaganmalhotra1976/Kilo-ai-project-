import { NextResponse } from "next/server";
import { db } from "@/db";
import { familyMembers } from "@/db/schema";
import { eq } from "drizzle-orm";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const familyMemberId = parseInt(id);

    if (isNaN(familyMemberId)) {
      return NextResponse.json(
        { error: "Invalid family member ID" },
        { status: 400 }
      );
    }

    const familyMember = await db.query.familyMembers.findFirst({
      where: eq(familyMembers.id, familyMemberId),
    });

    if (!familyMember) {
      return NextResponse.json(
        { error: "Family member not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(familyMember);
  } catch (error) {
    console.error("Error fetching family member:", error);
    return NextResponse.json(
      { error: "Failed to fetch family member" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const familyMemberId = parseInt(id);

    if (isNaN(familyMemberId)) {
      return NextResponse.json(
        { error: "Invalid family member ID" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { name, dateOfBirth, gender, vaccineCardUrl, pictureUrl } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    const updatedFamilyMember = await db
      .update(familyMembers)
      .set({
        name,
        dateOfBirth,
        gender,
        vaccineCardUrl,
        pictureUrl,
        updatedAt: new Date(),
      })
      .where(eq(familyMembers.id, familyMemberId))
      .returning();

    if (updatedFamilyMember.length === 0) {
      return NextResponse.json(
        { error: "Family member not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedFamilyMember[0]);
  } catch (error) {
    console.error("Error updating family member:", error);
    return NextResponse.json(
      { error: "Failed to update family member" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const familyMemberId = parseInt(id);

    if (isNaN(familyMemberId)) {
      return NextResponse.json(
        { error: "Invalid family member ID" },
        { status: 400 }
      );
    }

    const deletedFamilyMember = await db
      .delete(familyMembers)
      .where(eq(familyMembers.id, familyMemberId))
      .returning();

    if (deletedFamilyMember.length === 0) {
      return NextResponse.json(
        { error: "Family member not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting family member:", error);
    return NextResponse.json(
      { error: "Failed to delete family member" },
      { status: 500 }
    );
  }
}
