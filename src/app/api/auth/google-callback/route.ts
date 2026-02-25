import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { customers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { generateToken } from "@/lib/auth";

/**
 * After Google OAuth, NextAuth sets a session cookie.
 * This route reads that session, creates/finds the customer in our DB,
 * generates our own JWT, and redirects to a client page that sets localStorage.
 */
export async function GET(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.email) {
    return NextResponse.redirect(new URL("/login?error=google_failed", request.url));
  }

  const { email, name } = session.user;

  try {
    // Find or create customer by email
    let customer = await db
      .select()
      .from(customers)
      .where(eq(customers.email, email!))
      .get();

    if (!customer) {
      // Create new customer from Google profile
      const result = await db
        .insert(customers)
        .values({
          name: name || email!.split("@")[0],
          phone: "", // Google users don't have phone initially
          email: email!,
          password: null, // No password for OAuth users
        })
        .returning()
        .get();
      customer = result;
    }

    // Generate our JWT token
    const token = generateToken({
      customerId: customer.id,
      phone: customer.phone,
      name: customer.name,
    });

    // Get redirect URL from query params
    const redirectTo = request.nextUrl.searchParams.get("redirect") || "/profile";

    // Redirect to client-side page that sets localStorage
    const callbackUrl = new URL("/auth/google-success", request.url);
    callbackUrl.searchParams.set("token", token);
    callbackUrl.searchParams.set("customerId", customer.id.toString());
    callbackUrl.searchParams.set("customerName", customer.name);
    callbackUrl.searchParams.set("redirect", redirectTo);

    return NextResponse.redirect(callbackUrl);
  } catch (error) {
    console.error("Google callback error:", error);
    return NextResponse.redirect(new URL("/login?error=server_error", request.url));
  }
}
