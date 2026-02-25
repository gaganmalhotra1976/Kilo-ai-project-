import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { customers } from "@/db/schema";
import { desc, like, or } from "drizzle-orm";

// GET /api/customers
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");

    if (search) {
      const results = await db
        .select()
        .from(customers)
        .where(
          or(
            like(customers.name, `%${search}%`),
            like(customers.phone, `%${search}%`),
            like(customers.email, `%${search}%`)
          )
        )
        .orderBy(desc(customers.createdAt));
      return NextResponse.json(results);
    }

    const results = await db
      .select()
      .from(customers)
      .orderBy(desc(customers.createdAt));
    return NextResponse.json(results);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch customers" }, { status: 500 });
  }
}
