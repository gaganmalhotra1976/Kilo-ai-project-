import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { pipelineCards, pipelineStages, pipelineCardHistory, bookings } from "@/db/schema";
import { eq, and, gte, lte, sql, desc, asc, isNotNull } from "drizzle-orm";

// GET /api/reports/pipeline — Sales Pipeline Report
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const staffMember = searchParams.get("staffMember");
    const leadSource = searchParams.get("leadSource");

    const dateConditions = [];
    if (startDate && endDate) {
      dateConditions.push(gte(pipelineCards.createdAt, new Date(startDate)));
      dateConditions.push(lte(pipelineCards.createdAt, new Date(endDate)));
    }

    // 1. Total leads by source this month
    const leadsBySource = await db.select({
      source: pipelineCards.source,
      count: sql<number>`count(*)`
    })
    .from(pipelineCards)
    .where(dateConditions.length > 0 ? and(...dateConditions) : undefined)
    .groupBy(pipelineCards.source);

    // 2. Leads by current stage (funnel)
    const leadsByStage = await db.select({
      stageId: pipelineCards.stageId,
      stageName: pipelineStages.name,
      stageColor: pipelineStages.color,
      count: sql<number>`count(*)`
    })
    .from(pipelineCards)
    .leftJoin(pipelineStages, eq(pipelineCards.stageId, pipelineStages.id))
    .where(dateConditions.length > 0 ? and(...dateConditions) : undefined)
    .groupBy(pipelineCards.stageId, pipelineStages.name, pipelineStages.color)
    .orderBy(asc(sql`count(*)`));

    // 3. Average time to convert (days from New Lead to Converted)
    const conversionTime = await db.select({
      avgDays: sql<number>`AVG(julianday(${pipelineCardHistory.movedAt}) - julianday(pipelineCards.createdAt))`
    })
    .from(pipelineCards)
    .innerJoin(pipelineCardHistory, eq(pipelineCards.id, pipelineCardHistory.cardId))
    .innerJoin(pipelineStages, eq(pipelineCardHistory.toStageId, pipelineStages.id))
    .where(and(
      eq(pipelineStages.name, "Converted"),
      ...dateConditions
    ));

    // 4. Conversion rate by lead source
    const conversionBySource = await db.select({
      source: pipelineCards.source,
      total: sql<number>`count(*)`,
      converted: sql<number>`SUM(CASE WHEN ${pipelineStages.name} = 'Converted' THEN 1 ELSE 0 END)`
    })
    .from(pipelineCards)
    .leftJoin(pipelineStages, eq(pipelineCards.stageId, pipelineStages.id))
    .where(dateConditions.length > 0 ? and(...dateConditions) : undefined)
    .groupBy(pipelineCards.source);

    // 5. Performance by sales staff
    const staffPerformance = await db.select({
      staff: pipelineCards.assignedTo,
      totalLeads: sql<number>`count(*)`,
      converted: sql<number>`SUM(CASE WHEN ${pipelineStages.name} = 'Converted' THEN 1 ELSE 0 END)`,
      lost: sql<number>`SUM(CASE WHEN ${pipelineStages.name} = 'Lost' THEN 1 ELSE 0 END)`
    })
    .from(pipelineCards)
    .leftJoin(pipelineStages, eq(pipelineCards.stageId, pipelineStages.id))
    .where(and(
      isNotNull(pipelineCards.assignedTo),
      ...dateConditions
    ))
    .groupBy(pipelineCards.assignedTo)
    .orderBy(desc(sql`count(*)`));

    // Apply staff filter if provided
    let filteredStaffPerformance = staffPerformance;
    if (staffMember) {
      filteredStaffPerformance = staffPerformance.filter(s => s.staff === staffMember);
    }

    // Apply source filter if provided
    let filteredLeadsBySource = leadsBySource;
    if (leadSource) {
      filteredLeadsBySource = leadsBySource.filter(l => l.source === leadSource);
    }

    return NextResponse.json({
      success: true,
      data: {
        leadsBySource: filteredLeadsBySource,
        leadsByStage,
        averageConversionDays: Math.round(conversionTime[0]?.avgDays || 0),
        conversionBySource,
        staffPerformance: filteredStaffPerformance
      }
    });

  } catch (error) {
    console.error("GET /api/reports/pipeline error:", error);
    return NextResponse.json({ error: "Failed to fetch pipeline report" }, { status: 500 });
  }
}
