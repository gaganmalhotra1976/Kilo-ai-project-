import { NextResponse } from "next/server";
import { db } from "@/db";
import { customers } from "@/db/schema";
import { eq, or } from "drizzle-orm";
import { hashPassword, generateToken } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { phone, email, password, name } = body;

    // Require at least phone or email
    if ((!phone && !email) || !password) {
      return NextResponse.json(
        { error: "Phone or email, and password are required" },
        { status: 400 }
      );
    }

    // Check if customer already exists by phone or email
    const conditions = [];
    if (phone) conditions.push(eq(customers.phone, phone));
    if (email) conditions.push(eq(customers.email, email));

    const existingCustomer = conditions.length > 0
      ? await db
          .select()
          .from(customers)
          .where(conditions.length === 1 ? conditions[0] : or(...conditions))
          .get()
      : null;

    if (existingCustomer) {
      // If customer exists but has no password, allow them to set one
      if (!existingCustomer.password) {
        const hashedPassword = await hashPassword(password);
        
        await db
          .update(customers)
          .set({ 
            password: hashedPassword, 
            name: name || existingCustomer.name,
            email: email || existingCustomer.email,
          })
          .where(eq(customers.id, existingCustomer.id));

        const token = generateToken({
          customerId: existingCustomer.id,
          phone: existingCustomer.phone,
          name: name || existingCustomer.name,
        });

        return NextResponse.json({ 
          token,
          message: "Password set successfully",
          customer: { ...existingCustomer, name: name || existingCustomer.name }
        }, { status: 200 });
      }
      
      // Customer already has a password - don't allow duplicate registration
      return NextResponse.json(
        { error: "An account with this phone/email already exists" },
        { status: 409 }
      );
    }

    // Create new customer with hashed password
    const hashedPassword = await hashPassword(password);
    
    const inserted = await db
      .insert(customers)
      .values({
        name: name || "Customer",
        phone: phone || "",
        email: email || null,
        password: hashedPassword,
        city: "Delhi",
      })
      .returning();

    const newCustomer = inserted[0];
    
    const token = generateToken({
      customerId: newCustomer.id,
      phone: newCustomer.phone,
      name: newCustomer.name,
    });

    // Don't return password in response
    const { password: _, ...customerWithoutPassword } = newCustomer;

    return NextResponse.json({ 
      token,
      customer: customerWithoutPassword 
    }, { status: 201 });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Registration failed" },
      { status: 500 }
    );
  }
}
