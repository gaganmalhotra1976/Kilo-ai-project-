import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// ── Route matchers ────────────────────────────────────────────────────────────

/** Admin UI pages — require Clerk auth + admin role */
const isAdminRoute = createRouteMatcher(["/admin(.*)"]);

/** Customer dashboard pages — require Clerk auth */
const isDashboardRoute = createRouteMatcher(["/dashboard(.*)"]);

/** Admin API routes — require Clerk auth + admin role */
const isAdminApiRoute = createRouteMatcher(["/api/admin(.*)"]);

/** Webhook routes — completely public (verified by payload signature) */
const isWebhookRoute = createRouteMatcher([
  "/api/webhooks(.*)",
  "/api/webhook(.*)", // PayU / WhatsApp via Workers proxy
]);

/** Cron routes — public (called by Cloudflare Workers cron) */
const isCronRoute = createRouteMatcher(["/api/cron(.*)"]);

/** Public API routes that do not need auth */
const isPublicApiRoute = createRouteMatcher([
  "/api/bookings",            // POST — public lead capture
  "/api/auth(.*)",            // OTP / forgot-password flows
  "/api/banners(.*)",         // Public banner display
  "/api/blog-posts(.*)",      // Public blog
  "/api/promo-popup(.*)",     // Public promo popup
  "/api/vaccine-categories(.*)", // Public vaccine catalogue
  "/api/vaccine-category-items(.*)",
  "/api/vaccines/catalogue",
  "/api/youtube-videos(.*)",
  "/api/consultation-bookings/slots", // Public slot listing
  "/api/debug(.*)",           // Debug endpoints (remove in production)
  "/api/seed(.*)",            // Seed endpoints (remove in production)
]);

// ── Middleware ────────────────────────────────────────────────────────────────

export default clerkMiddleware(async (auth, req) => {
  const { pathname } = req.nextUrl;

  // 1. Webhooks & cron — always public, skip all auth checks
  if (isWebhookRoute(req) || isCronRoute(req)) {
    return NextResponse.next();
  }

  // 2. Admin UI pages — require auth + admin role
  if (isAdminRoute(req)) {
    const { userId, sessionClaims } = await auth();

    if (!userId) {
      // Redirect to Clerk sign-in
      const signInUrl = new URL("/sign-in", req.url);
      signInUrl.searchParams.set("redirect_url", req.url);
      return NextResponse.redirect(signInUrl);
    }

    const role = (sessionClaims?.metadata as { role?: string } | undefined)?.role;
    if (role !== "admin") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    return NextResponse.next();
  }

  // 3. Admin API routes — require auth + admin role
  if (isAdminApiRoute(req)) {
    const { userId, sessionClaims } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = (sessionClaims?.metadata as { role?: string } | undefined)?.role;
    if (role !== "admin") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    return NextResponse.next();
  }

  // 4. Dashboard pages — require Clerk auth
  if (isDashboardRoute(req)) {
    const { userId } = await auth();

    if (!userId) {
      const signInUrl = new URL("/sign-in", req.url);
      signInUrl.searchParams.set("redirect_url", req.url);
      return NextResponse.redirect(signInUrl);
    }

    return NextResponse.next();
  }

  // 5. Public API routes — allow through
  if (isPublicApiRoute(req)) {
    return NextResponse.next();
  }

  // 6. All other /api/* routes — require Clerk auth
  if (pathname.startsWith("/api/")) {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
