import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    // Dynamically import to avoid module load issues
    const { seedStaff } = await import("@/db/seed");
    await seedStaff();
    return NextResponse.json({ success: true, message: "Staff seed completed successfully" });
  } catch (error) {
    console.error("Staff seed error:", error);
    return NextResponse.json({ 
      success: false, 
      error: "Failed to seed staff",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}
