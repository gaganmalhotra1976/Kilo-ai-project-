import { NextRequest, NextResponse } from "next/server";

// Simple in-memory staff storage (would be replaced with proper users table in production)
// In production, this would query a users table with role field
const staffMembers = [
  { id: 1, name: "Nurse Rajesh Kumar", role: "Nurse" },
  { id: 2, name: "Nurse Priya Singh", role: "Nurse" },
  { id: 3, name: "Nurse Amit Patel", role: "Nurse" },
  { id: 4, name: "Ops Manager Sarah Johnson", role: "Operations" },
  { id: 5, name: "Ops Coordinator Mike Chen", role: "Operations" },
  { id: 6, name: "Nurse Deepa Reddy", role: "Nurse" },
  { id: 7, name: "Ops Lead Rahul Sharma", role: "Operations" },
];

export async function GET(req: NextRequest) {
  try {
    const roleFilter = req.nextUrl.searchParams.get("role");
    
    let filteredStaff = staffMembers;
    
    // Filter by role if specified (Nurse, Operations, or both)
    if (roleFilter) {
      const roles = roleFilter.split(",").map(r => r.trim());
      filteredStaff = staffMembers.filter(s => roles.includes(s.role));
    }

    return NextResponse.json(filteredStaff);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to fetch staff" }, { status: 500 });
  }
}
