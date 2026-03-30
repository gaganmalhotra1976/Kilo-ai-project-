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
  "/api/bookings",               // POST — public lead capture
  "/api/auth(.*)",               // OTP / forgot-password flows
  "/api/banners(.*)",            // Public banner display
  "/api/blog-posts(.*)",         // Public blog
  "/api/promo-popup(.*)",        // Public promo popup
  "/api/vaccine-categories(.*)", // Public vaccine catalogue
  "/api/vaccine-category-items(.*)",
  "/api/vaccines/catalogue",
  "/api/youtube-videos(.*)",
  "/api/consultation-bookings/slots", // Public slot listing
  "/api/profile/setup",          // Profile setup — auth checked inside route
  "/api/debug(.*)",              // Debug endpoints (remove in production)
  "/api/seed(.*)",               // Seed endpoints (remove in production)
]);

/**
 * Routes excluded from the "profile setup required" redirect.
 * These must be accessible before a patient record exists.
 */
const isProfileSetupExcluded = createRouteMatcher([
  "/profile/setup",
  "/api/profile/setup",
  "/api/webhooks(.*)",
  "/api/cron(.*)",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/(auth)(.*)",
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

    return NextResponse.next();
  }

  // 7. Profile setup gate — for signed-in users on page routes:
  //    If the user is signed in but hasn't completed their profile
  //    (indicated by absence of the "vp_profile_set" cookie), redirect to
  //    /profile/setup.  The setup page and its API are excluded from this check.
  //
  //    We use a lightweight cookie check instead of a DB lookup so the
  //    middleware stays fast (no round-trip to Turso on every request).
  //    The /api/profile/setup route sets this cookie on success.
  if (!isProfileSetupExcluded(req)) {
    const { userId } = await auth();

    if (userId) {
      const profileCookie = req.cookies.get("vp_profile_set");
      if (!profileCookie) {
        const setupUrl = new URL("/profile/setup", req.url);
        return NextResponse.redirect(setupUrl);
      }
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
