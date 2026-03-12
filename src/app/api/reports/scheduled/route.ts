import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { scheduledReports } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";

// GET /api/reports/scheduled — List all scheduled reports
export async function GET(req: NextRequest) {
  try {
    const reports = await db.select().from(scheduledReports).orderBy(desc(scheduledReports.createdAt));
    
    return NextResponse.json({
      success: true,
      data: reports
    });

  } catch (error) {
    console.error("GET /api/reports/scheduled error:", error);
    return NextResponse.json({ error: "Failed to fetch scheduled reports" }, { status: 500 });
  }
}

// POST /api/reports/scheduled — Create new scheduled report
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, reportType, schedule, recipientEmails, filters, isActive } = body;

    if (!name || !reportType || !schedule || !recipientEmails) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const newReport = await db.insert(scheduledReports).values({
      name,
      reportType,
      schedule,
      recipientEmails: JSON.stringify(recipientEmails),
      filters: filters ? JSON.stringify(filters) : null,
      isActive: isActive ?? true
    }).returning();

    return NextResponse.json({
      success: true,
      data: newReport[0]
    }, { status: 201 });

  } catch (error) {
    console.error("POST /api/reports/scheduled error:", error);
    return NextResponse.json({ error: "Failed to create scheduled report" }, { status: 500 });
  }
}

// DELETE /api/reports/scheduled — Delete scheduled report
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Report ID required" }, { status: 400 });
    }

    await db.delete(scheduledReports).where(eq(scheduledReports.id, parseInt(id)));

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("DELETE /api/reports/scheduled error:", error);
    return NextResponse.json({ error: "Failed to delete scheduled report" }, { status: 500 });
  }
}
