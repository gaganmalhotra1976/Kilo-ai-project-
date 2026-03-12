import { db } from "@/db";
import { staff, settings, staffAuditLog } from "@/db/schema";
import { eq } from "drizzle-orm";
import { hashPassword } from "@/lib/adminAuth";

export default async function seedStaff() {
  console.log("Seeding staff and settings...");

  // Check if admin already exists
  const existingAdmin = await db
    .select()
    .from(staff)
    .where(eq(staff.email, "admin@vaccinepanda.com"))
    .limit(1);

  if (existingAdmin.length === 0) {
    const hashedPassword = await hashPassword("admin123");
    
    await db.insert(staff).values({
      email: "admin@vaccinepanda.com",
      password: hashedPassword,
      name: "Admin",
      role: "admin",
      isActive: true,
    });
    console.log("Created admin user: admin@vaccinepanda.com / admin123");
  }

  // Seed default settings
  const defaultSettings = [
    { key: "convenienceFee", value: "200", description: "Default convenience fee for quotes" },
    { key: "defaultGstRate", value: "12", description: "Default GST rate percentage" },
    { key: "gstin", value: "07AABCU9603R1ZM", description: "GSTIN number" },
    { key: "companyEmail", value: "info@thevaccinepanda.com", description: "Company email" },
    { key: "companyPhone", value: "9999109040", description: "Primary contact number" },
    { key: "companyName", value: "The Vaccine Panda", description: "Company name" },
  ];

  for (const setting of defaultSettings) {
    const existing = await db
      .select()
      .from(settings)
      .where(eq(settings.key, setting.key))
      .limit(1);

    if (existing.length === 0) {
      await db.insert(settings).values(setting);
      console.log(`Created setting: ${setting.key}`);
    }
  }

  console.log("Seeding complete!");
}

seedStaff().catch(console.error);
