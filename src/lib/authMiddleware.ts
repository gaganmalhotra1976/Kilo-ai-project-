import { NextRequest, NextResponse } from "next/server";
import { verifyStaffSession, hasPermission, type StaffUser } from "@/lib/adminAuth";

export interface AuthenticatedRequest extends NextRequest {
  staffUser?: StaffUser;
}

export async function requireAuth(req: AuthenticatedRequest): Promise<StaffUser | NextResponse> {
  const sessionToken = req.cookies.get("admin_session")?.value || req.headers.get("x-admin-token");
  
  if (!sessionToken) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }

  const staff = await verifyStaffSession(sessionToken);
  
  if (!staff) {
    return NextResponse.json(
      { error: "Invalid or expired session" },
      { status: 401 }
    );
  }

  if (!staff.isActive) {
    return NextResponse.json(
      { error: "Account is deactivated" },
      { status: 403 }
    );
  }

  req.staffUser = staff;
  return staff;
}

export async function requireRole(req: AuthenticatedRequest, allowedRoles: string[]): Promise<StaffUser | NextResponse> {
  const authResult = await requireAuth(req);
  
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  if (!allowedRoles.includes(authResult.role)) {
    return NextResponse.json(
      { error: "Insufficient permissions" },
      { status: 403 }
    );
  }

  return authResult;
}

export async function requirePermission(req: AuthenticatedRequest, resource: string, action: string = "*"): Promise<StaffUser | NextResponse> {
  const authResult = await requireAuth(req);
  
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  if (!hasPermission(authResult.role, resource, action)) {
    return NextResponse.json(
      { error: "Insufficient permissions" },
      { status: 403 }
    );
  }

  return authResult;
}

export function requireAuthMiddleware(handler: (req: AuthenticatedRequest) => Promise<NextResponse>) {
  return async (req: NextRequest) => {
    const authResult = await requireAuth(req as AuthenticatedRequest);
    
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    
    return handler(req as AuthenticatedRequest);
  };
}

export function requireRoleMiddleware(allowedRoles: string[], handler: (req: AuthenticatedRequest) => Promise<NextResponse>) {
  return async (req: NextRequest) => {
    const authResult = await requireRole(req as AuthenticatedRequest, allowedRoles);
    
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    
    return handler(req as AuthenticatedRequest);
  };
}
