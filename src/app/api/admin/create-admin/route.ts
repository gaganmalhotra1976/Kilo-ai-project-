import { NextResponse } from "next/server";
import { db } from "@/db";
import { staff } from "@/db/schema";
import { eq } from "drizzle-orm";

// GET /api/admin/create-admin - Creates or resets admin user
export async function GET() {
  try {
    // Check if admin exists
    const existing = await db
      .select()
      .from(staff)
      .where(eq(staff.email, "admin@vaccinepanda.com"));

    if (existing.length > 0) {
      // Update password
      await db
        .update(staff)
        .set({ 
          password: "admin123",
          isActive: true,
        })
        .where(eq(staff.email, "admin@vaccinepanda.com"));
      
      return NextResponse.json({
        success: true,
        message: "Admin password reset successfully",
        email: "admin@vaccinepanda.com",
        password: "admin123",
      });
    }

    // Create new admin
    const [admin] = await db
      .insert(staff)
      .values({
        email: "admin@vaccinepanda.com",
        password: "admin123",
        name: "Admin",
        role: "admin",
        isActive: true,
      })
      .returning();

    return NextResponse.json({
      success: true,
      message: "Admin user created",
      email: "admin@vaccinepanda.com",
      password: "admin123",
      id: admin.id,
    });
  } catch (error) {
    console.error("Error creating admin:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create admin" },
      { status: 500 }
    );
  }
}