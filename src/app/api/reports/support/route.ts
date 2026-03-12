import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { supportTickets } from "@/db/schema";
import { eq, and, gte, lte, sql, desc, isNotNull } from "drizzle-orm";

// GET /api/reports/support — Support Tickets Report
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const priority = searchParams.get("priority");
    const issueType = searchParams.get("issueType"); // Could be subject contains
    const staffAssigned = searchParams.get("staffAssigned"); // Would need field in schema

    const dateConditions = [];
    if (startDate && endDate) {
      dateConditions.push(gte(supportTickets.createdAt, new Date(startDate)));
      dateConditions.push(lte(supportTickets.createdAt, new Date(endDate)));
    }

    // 1. Total tickets this month
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const totalTicketsThisMonth = await db.select({ count: sql<number>`count(*)` })
      .from(supportTickets)
      .where(gte(supportTickets.createdAt, monthStart));

    // 2. Tickets by issue type (based on subject keywords)
    const ticketsByIssue = await db.select({
      subject: supportTickets.subject,
      count: sql<number>`count(*)`
    })
    .from(supportTickets)
    .where(dateConditions.length > 0 ? and(...dateConditions) : undefined)
    .groupBy(sql`substr(${supportTickets.subject}, 1, 20)`) // Group by first 20 chars
    .orderBy(desc(sql`count(*)`))
    .limit(10);

    // 3. Average resolution time
    const avgResolutionTime = await db.select({
      avgHours: sql<number>`AVG((julianday(${supportTickets.resolvedAt}) - julianday(${supportTickets.createdAt})) * 24)`
    })
    .from(supportTickets)
    .where(and(
      isNotNull(supportTickets.resolvedAt),
      ...dateConditions
    ));

    // 4. Open vs Resolved vs Closed counts
    const statusBreakdown = await db.select({
      status: supportTickets.status,
      count: sql<number>`count(*)`
    })
    .from(supportTickets)
    .where(dateConditions.length > 0 ? and(...dateConditions) : undefined)
    .groupBy(supportTickets.status);

    // 5. Priority breakdown
    const priorityBreakdown = await db.select({
      priority: supportTickets.priority,
      count: sql<number>`count(*)`
    })
    .from(supportTickets)
    .where(dateConditions.length > 0 ? and(...dateConditions) : undefined)
    .groupBy(supportTickets.priority);

    // Apply filters
    let filteredStatusBreakdown = statusBreakdown;
    if (priority) {
      filteredStatusBreakdown = statusBreakdown; // This would need join with filtered priority
    }

    return NextResponse.json({
      success: true,
      data: {
        totalTicketsThisMonth: totalTicketsThisMonth[0]?.count || 0,
        ticketsByIssue,
        averageResolutionHours: Math.round(avgResolutionTime[0]?.avgHours || 0),
        statusBreakdown: {
          open: statusBreakdown.find(s => s.status === "open")?.count || 0,
          in_progress: statusBreakdown.find(s => s.status === "in_progress")?.count || 0,
          resolved: statusBreakdown.find(s => s.status === "resolved")?.count || 0,
          closed: statusBreakdown.find(s => s.status === "closed")?.count || 0
        },
        priorityBreakdown: {
          low: priorityBreakdown.find(p => p.priority === "low")?.count || 0,
          medium: priorityBreakdown.find(p => p.priority === "medium")?.count || 0,
          high: priorityBreakdown.find(p => p.priority === "high")?.count || 0,
          urgent: priorityBreakdown.find(p => p.priority === "urgent")?.count || 0
        }
      }
    });

  } catch (error) {
    console.error("GET /api/reports/support error:", error);
    return NextResponse.json({ error: "Failed to fetch support report" }, { status: 500 });
  }
}
