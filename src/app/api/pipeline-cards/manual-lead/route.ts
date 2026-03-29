import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { pipelineCards, pipelineCardHistory, pipelines, pipelineStages, patients } from "@/db/schema";
import { eq } from "drizzle-orm";

// Helper function to get or create Sales pipeline with manual lead stage
async function getOrCreateSalesPipelineWithManualStage() {
  try {
    // Check if Sales pipeline already exists
    const existingPipelines = await db.select().from(pipelines).where(eq(pipelines.name, "Sales"));
    let salesPipeline = existingPipelines[0];

    if (!salesPipeline) {
      // Create Sales pipeline
      const [created] = await db.insert(pipelines).values({ 
        name: "Sales", 
        description: "Sales pipeline for managing leads and bookings" 
      }).returning();
      salesPipeline = created;

      // Create required stages
      const stages = [
        { name: "New Lead - Website", color: "#3b82f6", sortOrder: 0 },
        { name: "New Lead - Manual", color: "#8b5cf6", sortOrder: 1 },
        { name: "Quote Sent", color: "#f59e0b", sortOrder: 2 },
        { name: "Advance Received", color: "#10b981", sortOrder: 3 },
        { name: "Converted / Fully Paid", color: "#059669", sortOrder: 4 },
        { name: "Lost", color: "#ef4444", sortOrder: 5 },
      ];

      for (const stage of stages) {
        await db.insert(pipelineStages).values({
          pipelineId: salesPipeline.id,
          ...stage
        });
      }
    }

    // Get the "New Lead - Manual" stage
    const stages = await db.select().from(pipelineStages)
      .where(eq(pipelineStages.pipelineId, salesPipeline.id));
    
    const manualStage = stages.find(s => s.name === "New Lead - Manual");
    if (!manualStage) {
      throw new Error("New Lead - Manual stage not found");
    }

    return { pipeline: salesPipeline, stage: manualStage };
  } catch (error) {
    console.error("Error getting/creating Sales pipeline:", error);
    return null;
  }
}

// POST /api/pipeline-cards/manual-lead — Create a manual lead (no booking yet)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { customerName, customerPhone, customerEmail, source, assignedTo, notes } = body;

    if (!customerName || !customerPhone || !source) {
      return NextResponse.json(
        { error: "customerName, customerPhone, and source are required" }, 
        { status: 400 }
      );
    }

    // Validate source
    const validSources = ["phone", "whatsapp", "referral", "walkin"];
    if (!validSources.includes(source)) {
      return NextResponse.json(
        { error: `Invalid source. Must be one of: ${validSources.join(", ")}` }, 
        { status: 400 }
      );
    }

    try {
      // Get or create Sales pipeline with manual stage
      const pipelineData = await getOrCreateSalesPipelineWithManualStage();
      if (!pipelineData) {
        return NextResponse.json(
          { error: "Failed to setup Sales pipeline" }, 
          { status: 500 }
        );
      }

      // Upsert customer
      let customerId: number | null = null;
      const existingCustomers = await db
        .select()
        .from(patients)
        .where(eq(patients.phone, customerPhone));

      if (existingCustomers.length > 0) {
        customerId = existingCustomers[0].id;
      } else {
        const [inserted] = await db
          .insert(patients)
          .values({
            name: customerName,
            phone: customerPhone,
            email: customerEmail || null,
          })
          .returning({ id: patients.id });
        customerId = inserted.id;
      }

      // Create pipeline card for manual lead
      const [card] = await db.insert(pipelineCards).values({
        pipelineId: pipelineData.pipeline.id,
        stageId: pipelineData.stage.id,
        title: `Lead: ${customerName} (${source})`,
        customerId,
        customerName,
        source,
        assignedTo: assignedTo || null,
        notes: notes || null,
        priority: "medium",
      }).returning();

      // Log initial stage placement
      await db.insert(pipelineCardHistory).values({
        cardId: card.id,
        fromStageId: null,
        toStageId: pipelineData.stage.id,
        movedBy: "sales staff",
        note: `Manual lead created from ${source}`,
      });

      return NextResponse.json(card, { status: 201 });
    } catch (dbError) {
      console.error("Pipeline cards table doesn't exist:", dbError);
      return NextResponse.json({ error: "Pipeline system not available. Please apply database migration 0007." }, { status: 503 });
    }
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to create manual lead" }, { status: 500 });
  }
}
