import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { supportTickets } from "@/db/schema";
import { eq } from "drizzle-orm";

// GET /api/support-tickets/[id]
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await db
      .select()
      .from(supportTickets)
      .where(eq(supportTickets.id, parseInt(id, 10)));

    if (!result.length) {
      return NextResponse.json({ error: "Support ticket not found" }, { status: 404 });
    }
    return NextResponse.json(result[0]);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch support ticket" }, { status: 500 });
  }
}

// PATCH /api/support-tickets/[id] — update ticket status
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { status, priority } = body;

    const updateData: Partial<typeof supportTickets.$inferInsert> = {
      updatedAt: new Date(),
    };
    
    if (status) {
      updateData.status = status;
      if (status === "resolved") {
        updateData.resolvedAt = new Date();
      }
    }
    if (priority) updateData.priority = priority;

    const updated = await db
      .update(supportTickets)
      .set(updateData)
      .where(eq(supportTickets.id, parseInt(id, 10)))
      .returning();

    if (!updated.length) {
      return NextResponse.json({ error: "Support ticket not found" }, { status: 404 });
    }

    // Trigger webhook for resolved tickets
    if (status === "resolved") {
      const { triggerSupportTicketResolved } = await import("@/lib/webhooks");
      await triggerSupportTicketResolved(updated[0]);
    }

    return NextResponse.json(updated[0]);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to update support ticket" }, { status: 500 });
  }
}
