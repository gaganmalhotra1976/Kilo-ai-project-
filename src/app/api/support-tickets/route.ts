import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { supportTickets } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

// GET /api/support-tickets — list all support tickets (admin)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    let query = db.select().from(supportTickets).orderBy(desc(supportTickets.createdAt));

    if (status) {
      const results = await db
        .select()
        .from(supportTickets)
        .where(eq(supportTickets.status, status))
        .orderBy(desc(supportTickets.createdAt));
      return NextResponse.json(results);
    }

    const results = await query;
    return NextResponse.json(results);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch support tickets" }, { status: 500 });
  }
}

// POST /api/support-tickets — create a new support ticket
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      customerId,
      subject,
      description,
      priority,
    } = body;

    if (!subject || !description) {
      return NextResponse.json(
        { error: "Missing required fields: subject, description" },
        { status: 400 }
      );
    }

    const inserted = await db
      .insert(supportTickets)
      .values({
        customerId: customerId || null,
        subject,
        description,
        priority: priority || "medium",
        status: "open",
      })
      .returning();

    // Trigger webhook for new support ticket
    const { triggerSupportTicketCreated } = await import("@/lib/webhooks");
    await triggerSupportTicketCreated(inserted[0]);

    return NextResponse.json(inserted[0], { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to create support ticket" }, { status: 500 });
  }
}
