import { NextRequest, NextResponse } from "next/server";
import { verifyStaffCredentials, createStaffSession, logStaffAction, type StaffUser } from "@/lib/adminAuth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const result = await verifyStaffCredentials(email, password);

    if (!result.success || !result.staff) {
      return NextResponse.json(
        { error: result.error || "Authentication failed" },
        { status: 401 }
      );
    }

    const sessionToken = await createStaffSession(result.staff.id);

    const response = NextResponse.json({
      success: true,
      staff: {
        id: result.staff.id,
        email: result.staff.email,
        name: result.staff.name,
        role: result.staff.role,
      },
      token: sessionToken,
    });

    response.cookies.set("admin_session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const sessionToken = req.cookies.get("admin_session")?.value;
  
  if (sessionToken) {
    const { verifyStaffSession, logStaffAction } = await import("@/lib/adminAuth");
    const staff = await verifyStaffSession(sessionToken);
    if (staff) {
      await logStaffAction(staff.id, "logout", "staff");
    }
  }

  const response = NextResponse.json({ success: true });
  response.cookies.delete("admin_session");
  return response;
}
