import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { staff, settings } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    // Check if staff table exists and has records
    const allStaff = await db.select().from(staff);
    const admin = await db.select().from(staff).where(eq(staff.email, "admin@vaccinepanda.com"));
    
    // Check if settings table exists
    const allSettings = await db.select().from(settings);
    
    return NextResponse.json({
      database: "SQLite",
      staffCount: allStaff.length,
      adminCount: admin.length,
      settingsCount: allSettings.length,
      admin: admin[0] ? {
        id: admin[0].id,
        email: admin[0].email,
        name: admin[0].name,
        role: admin[0].role,
        isActive: admin[0].isActive,
        hasPassword: !!admin[0].password,
        createdAt: admin[0].createdAt,
      } : null,
    });
  } catch (error) {
    console.error("Debug endpoint error:", error);
    return NextResponse.json({ 
      success: false, 
      error: "Failed to check database state",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}
