import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { staffAuditLog, staff } from "@/db/schema";
import { desc, eq, and } from "drizzle-orm";
import { requirePermission, type AuthenticatedRequest } from "@/lib/authMiddleware";

export const dynamic = "force-dynamic";

// GET /api/audit-log — list audit logs (admin only)
export async function GET(req: AuthenticatedRequest) {
  const authResult = await requirePermission(req, "settings", "read");
  
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const { searchParams } = new URL(req.url);
    const staffId = searchParams.get("staffId");
    const moduleParam = searchParams.get("module");
    const action = searchParams.get("action");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const limit = parseInt(searchParams.get("limit") || "100");
    const offset = parseInt(searchParams.get("offset") || "0");

    let conditions = [];

    if (staffId) {
      conditions.push(eq(staffAuditLog.staffId, parseInt(staffId)));
    }
    if (moduleParam) {
      conditions.push(eq(staffAuditLog.module, moduleParam));
    }
    if (action) {
      conditions.push(eq(staffAuditLog.action, action));
    }

    let query = db
      .select({
        id: staffAuditLog.id,
        staffId: staffAuditLog.staffId,
        staffName: staffAuditLog.staffName,
        action: staffAuditLog.action,
        module: staffAuditLog.module,
        recordId: staffAuditLog.recordId,
        oldValue: staffAuditLog.oldValue,
        newValue: staffAuditLog.newValue,
        ipAddress: staffAuditLog.ipAddress,
        createdAt: staffAuditLog.createdAt,
      })
      .from(staffAuditLog)
      .orderBy(desc(staffAuditLog.createdAt))
      .limit(limit)
      .offset(offset);

    if (conditions.length > 0) {
      // @ts-ignore - drizzle complex query
      query = query.where(and(...conditions));
    }

    const results = await query;
    return NextResponse.json(results);
  } catch (err) {
    console.error("Audit log fetch error:", err);
    return NextResponse.json({ error: "Failed to fetch audit logs" }, { status: 500 });
  }
}
