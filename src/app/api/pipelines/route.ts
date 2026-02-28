import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { pipelines } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const rows = await db.select().from(pipelines).orderBy(pipelines.createdAt);
    return NextResponse.json(rows);
  } catch (e) {
    console.error(e);
    // Return empty array if table doesn't exist yet
    return NextResponse.json([]);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, description } = body;
    if (!name) return NextResponse.json({ error: "name is required" }, { status: 400 });
    
    try {
      const [row] = await db.insert(pipelines).values({ name, description }).returning();
      return NextResponse.json(row, { status: 201 });
    } catch (dbError) {
      // Table doesn't exist - return specific error
      console.error("Pipeline table doesn't exist:", dbError);
      return NextResponse.json({ error: "Pipeline system not available. Please apply database migration 0007." }, { status: 503 });
    }
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to create pipeline" }, { status: 500 });
  }
}
