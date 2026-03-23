import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { vaccines, vaccineCategories, vaccineCategoryItems, vaccineInventory } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    // Get all active vaccines
    const allVaccines = await db
      .select()
      .from(vaccines)
      .where(eq(vaccines.isActive, true))
      .orderBy(vaccines.name);

    // Get all categories
    const categories = await db
      .select()
      .from(vaccineCategories)
      .where(eq(vaccineCategories.isActive, true))
      .orderBy(vaccineCategories.sortOrder);

    // Get inventory for each vaccine (latest batch with stock)
    const inventoryMap: Record<number, any> = {};
    const inventory = await db
      .select()
      .from(vaccineInventory)
      .where(eq(vaccineInventory.isActive, true))
      .orderBy(desc(vaccineInventory.createdAt));

    inventory.forEach(inv => {
      if (!inventoryMap[inv.vaccineId] && inv.remainingQuantity > 0) {
        inventoryMap[inv.vaccineId] = inv;
      }
    });

    // Build response with inventory data
    const vaccinesWithData = allVaccines.map(v => {
      const inv = inventoryMap[v.id];
      return {
        id: v.id,
        name: v.name,
        brand: v.brand,
        category: v.category,
        description: v.description,
        dosesRequired: v.dosesRequired,
        mrp: inv?.mrp || v.mrp || 0,
        gstRate: inv?.gstRate || v.gstRate || 5,
        inventory: inv ? {
          id: inv.id,
          batchNumber: inv.batchNumber,
          expiryDate: inv.expiryDate,
          remainingQuantity: inv.remainingQuantity,
          mrp: inv.mrp,
          gstRate: inv.gstRate,
        } : null
      };
    });

    // Group by category
    const grouped = categories.map(cat => ({
      id: cat.id,
      name: cat.name,
      icon: cat.icon,
      vaccines: vaccinesWithData.filter(v => String(v.category) === String(cat.name))
    }));

    // Add uncategorized
    const categorizedIds = new Set(categories.map(c => String(c.name)));
    const uncategorized = vaccinesWithData.filter(v => !categorizedIds.has(String(v.category)));

    return NextResponse.json({
      categories: grouped,
      uncategorized,
      allVaccines: vaccinesWithData
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch vaccines" }, { status: 500 });
  }
}
