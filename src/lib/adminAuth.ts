import { db } from "@/db";
import { staff, staffAuditLog, settings } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import bcrypt from "bcryptjs";

export type StaffRole = "admin" | "manager" | "sales" | "operations" | "support";

export interface StaffUser {
  id: number;
  email: string;
  name: string;
  role: StaffRole;
  isActive: boolean;
}

export interface AuthResult {
  success: boolean;
  staff?: StaffUser;
  error?: string;
}

const ROLE_PERMISSIONS: Record<StaffRole, string[]> = {
  admin: [
    "bookings:*",
    "quotes:*", 
    "customers:*",
    "vaccines:*",
    "banners:*",
    "youtube-videos:*",
    "promo-popup:*",
    "vaccine-categories:*",
    "blog-posts:*",
    "pipelines:*",
    "webhooks:*",
    "reports:*",
    "support-tickets:*",
    "consultation-vouchers:*",
    "staff:*",
    "settings:*",
  ],
  manager: [
    "bookings:*",
    "quotes:*",
    "customers:*",
    "vaccines:*",
    "pipelines:*",
    "reports:*",
    "support-tickets:*",
    "consultation-vouchers:*",
  ],
  sales: [
    "bookings:*",
    "quotes:*",
    "customers:*",
    "pipelines:*",
  ],
  operations: [
    "bookings:*",
    "customers:read",
    "pipelines:read",
    "consultation-vouchers:*",
  ],
  support: [
    "customers:read",
    "support-tickets:*",
    "bookings:read",
  ],
};

export function hasPermission(role: StaffRole, resource: string, action: string = "*"): boolean {
  const permissions = ROLE_PERMISSIONS[role];
  if (!permissions) return false;
  
  const requiredPermission = `${resource}:${action}`;
  
  return permissions.some(p => {
    if (p === requiredPermission) return true;
    if (p === `${resource}:*`) return true;
    return false;
  });
}

export async function verifyStaffCredentials(email: string, password: string): Promise<AuthResult> {
  try {
    const [staffMember] = await db
      .select()
      .from(staff)
      .where(eq(staff.email, email));

    if (!staffMember) {
      return { success: false, error: "Invalid email or password" };
    }

    if (!staffMember.isActive) {
      return { success: false, error: "Account is deactivated" };
    }

    const passwordValid = await bcrypt.compare(password, staffMember.password);
    if (!passwordValid) {
      return { success: false, error: "Invalid email or password" };
    }

    await db
      .update(staff)
      .set({ lastLoginAt: new Date() })
      .where(eq(staff.id, staffMember.id));

    await logStaffAction(staffMember.id, "login", "staff", staffMember.id);

    return {
      success: true,
      staff: {
        id: staffMember.id,
        email: staffMember.email,
        name: staffMember.name,
        role: staffMember.role as StaffRole,
        isActive: staffMember.isActive,
      },
    };
  } catch (error) {
    console.error("Auth error:", error);
    return { success: false, error: "Authentication failed" };
  }
}

export async function createStaffSession(staffId: number): Promise<string> {
  // For testing, use staffId as token for simpler debugging
  return staffId.toString();
}

export async function verifyStaffSession(token: string | null): Promise<StaffUser | null> {
  if (!token) return null;
  
  try {
    const staffId = parseInt(token, 10);
    if (isNaN(staffId)) return null;
    
    const [session] = await db
      .select()
      .from(staff)
      .where(eq(staff.id, staffId));
    
    if (!session || !session.isActive) return null;
    
    return {
      id: session.id,
      email: session.email,
      name: session.name,
      role: session.role as StaffRole,
      isActive: session.isActive,
    };
  } catch {
    return null;
  }
}

export async function logStaffAction(
  staffId: number,
  action: string,
  module?: string,
  recordId?: number,
  details?: Record<string, any>
): Promise<void> {
  try {
    await db.insert(staffAuditLog).values({
      staffId,
      staffName: null,
      action,
      module,
      recordId,
      oldValue: null,
      newValue: details ? JSON.stringify(details) : null,
    });
  } catch (error) {
    console.error("Failed to log staff action:", error);
  }
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function getSetting(key: string): Promise<string | null> {
  try {
    const [setting] = await db
      .select()
      .from(settings)
      .where(eq(settings.key, key));
    return setting?.value ?? null;
  } catch {
    return null;
  }
}

export async function getSettingsBatch(keys: string[]): Promise<Record<string, string>> {
  try {
    const allSettings = await db.select().from(settings);
    const result: Record<string, string> = {};
    for (const key of keys) {
      const setting = allSettings.find(s => s.key === key);
      if (setting) result[key] = setting.value;
    }
    return result;
  } catch {
    return {};
  }
}

export const DEFAULT_SETTINGS: Record<string, string> = {
  convenienceFee: "200",
  defaultGstRate: "12",
  gstin: "07AABCU9603R1ZM",
  companyEmail: "info@thevaccinepanda.com",
  companyPhone: "9999109040",
  companyName: "The Vaccine Panda",
};

export async function getSettingWithDefault(key: string): Promise<string> {
  const value = await getSetting(key);
  return value ?? DEFAULT_SETTINGS[key] ?? "";
}
