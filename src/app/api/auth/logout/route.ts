import { NextResponse } from "next/server";

export async function POST() {
  // JWT tokens are stateless - client just needs to delete the token
  // This endpoint exists for consistency and any server-side cleanup if needed
  return NextResponse.json({ message: "Logged out successfully" });
}
