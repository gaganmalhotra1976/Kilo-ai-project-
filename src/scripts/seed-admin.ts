import { db } from "@/db";
import { staff } from "@/db/schema";
import { eq } from "drizzle-orm";

async function seedAdmin() {
  console.log("Creating admin user...");

  try {
    const existing = await db
      .select()
      .from(staff)
      .where(eq(staff.email, "admin@vaccinepanda.com"));

    if (existing.length > 0) {
      console.log("Admin user already exists with ID:", existing[0].id);
      
      await db
        .update(staff)
        .set({ 
          password: "admin123",
          isActive: true,
        })
        .where(eq(staff.email, "admin@vaccinepanda.com"));
      
      console.log("Updated admin password to: admin123");
      return;
    }

    const [admin] = await db
      .insert(staff)
      .values({
        email: "admin@vaccinepanda.com",
        password: "admin123",
        name: "Admin",
        role: "admin",
        isActive: true,
      })
      .returning();

    console.log("Admin user created successfully!");
    console.log("ID:", admin.id);
    console.log("Email:", admin.email);
    console.log("Password: admin123");
  } catch (error) {
    console.error("Error creating admin:", error);
  }
}

seedAdmin();