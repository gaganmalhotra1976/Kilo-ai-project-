import { NextResponse } from "next/server";
import { db } from "@/db";
import { staff } from "@/db/schema";
import { eq } from "drizzle-orm";

// This is a special endpoint to create the admin user
// It's designed to be called once to set up the admin
export async function POST() {
  try {
    const existing = await db
      .select()
      .from(staff)
      .where(eq(staff.email, "admin@vaccinepanda.com"));

    if (existing.length > 0) {
      await db
        .update(staff)
        .set({ 
          password: "admin123",
          isActive: true,
          name: "Admin",
          role: "admin",
        })
        .where(eq(staff.email, "admin@vaccinepanda.com"));
      
      return NextResponse.json({
        success: true,
        message: "Admin password reset",
        email: "admin@vaccinepanda.com",
        password: "admin123",
      });
    }

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
      message: "Admin created",
      email: "admin@vaccinepanda.com",
      password: "admin123",
    });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Admin setup endpoint - POST to create admin",
    usage: "curl -X POST https://your-domain.com/setup/admin/create"
  });
}