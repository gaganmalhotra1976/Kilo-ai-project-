# Active Context: The Vaccine Panda CRM

## Current State

**App Status**: ✅ Full Vaccine Panda app built with core CRM features

The Vaccine Panda home vaccination platform is a functional CRM with booking management, quotes, pipelines, and reports. Admin panel is publicly accessible (security issue - needs authentication). SQLite + Drizzle ORM for data persistence.

## Recently Completed

- [x] **Comprehensive Application Audit (March 2026)**:
  - Generated detailed audit report: `vaccine-panda-audit-2026-03-12.md`
  - Frontend: 45+ pages built, good mobile responsiveness, 5 React warnings
  - Backend: 50+ API endpoints, CRUD mostly complete
  - Database: 20 tables covering core CRM
  - Security: CRITICAL - No admin authentication, no RBAC
  - Enterprise gaps: 12+ features missing
  - Estimated completion: 65% core CRM, 30% enterprise

- [x] **Critical Security Fixes**:
  - Added staff table with role-based access (admin, manager, sales, operations, support)
  - Created admin auth middleware (`src/lib/authMiddleware.ts`) with permission system
  - Added authentication to protected API endpoints: /api/customers, /api/bookings, /api/settings, /api/admin/*
  - Fixed SQL injection in customer search (sanitizeInput function)
  - Added missing CRUD: DELETE bookings (soft delete), CREATE customers, DELETE customers (soft delete)
  - Moved hardcoded values to Settings table (convenienceFee, defaultGstRate, gstin, companyEmail)
  - Created admin login page at /admin/login
  - Added audit logging for staff actions (src/lib/adminAuth.ts logStaffAction)
  - Default admin: admin@vaccinepanda.com / admin123

- [x] **Quote Edit Functionality**:
  - Added Edit button to quotes list (`/admin/quotes`)
  - Created `/admin/quotes/[id]/edit` page with full editing
  - Added GET endpoint to `/api/quotes/[id]`
  - Expanded PATCH to support full quote updates (line items, discounts, validity)
  - Fixed type error in validUntil handling

## Recently Completed

- [x] **Reports module + Consultation Vouchers + Free Consultations**:
  - Added Reports page at `/admin/reports` with 6 tabs: Overview, Bookings, Revenue, Sales Pipeline, Operations, Support
  - Added Reports nav item to admin sidebar
  - Added 8 new API routes: `/api/reports/overview`, `/api/reports/bookings`, `/api/reports/revenue`, `/api/reports/pipeline`, `/api/reports/operations`, `/api/reports/support`, `/api/reports/customers`, `/api/reports/vaccines`
  - Added consultationVouchers table (tracks free consultation vouchers)
  - Added scheduledReports table (for scheduled report emails)
  - Added vaccines inventory fields: mrp, stockQuantity, lowStockThreshold, gstRate, isAvailable, updatedAt
  - Added assignedNurse field to bookings
  - Added freeConsultations and freeConsultationsValue to quotes
  - Added free consultations auto-calculation logic in `lib/freeConsultations.ts`
  - Added `recharts` dependency for charts visualization
  - Fixed TypeScript errors in API routes (added isNotNull, isNull imports, fixed sql type casts)
  - Fixed incomplete SupportReport component in admin page (added getStatusColor function)
  - `bun typecheck` ✅ `bun lint` ✅ (warnings only)

- [x] **CMS Features — Hero Carousel, YouTube Section, Promo Popup, Vaccine Categories**:
  - Added 5 new DB tables: `banners`, `youtube_videos`, `promo_popup`, `vaccine_categories`, `vaccine_category_items` (migration `0004_cms_tables.sql`)
  - Created API routes: `/api/banners`, `/api/youtube-videos`, `/api/promo-popup`, `/api/vaccine-categories`, `/api/vaccine-category-items` (all with CRUD)
  - Admin-only endpoints: `/api/admin/banners`, `/api/admin/promo-popup`
  - Built `HeroCarousel.tsx` — auto-scrolling carousel with arrows, dots, slide counter; falls back to static hero if no banners in DB
  - Built `YouTubeSection.tsx` — responsive grid of YouTube video thumbnails with lightbox modal player
  - Built `PromoPopup.tsx` — floating modal popup, session-based (once per session), fetches from `/api/promo-popup`, respects expiry date
  - Built `VaccineCategoriesAccordion.tsx` — smooth accordion with category icons, vaccine item cards with age group/doses/notes badges
  - Updated `src/app/page.tsx` — now a Server Component that fetches all CMS data and passes to client components; falls back gracefully when DB is empty
  - Updated `src/app/layout.tsx` — added `<PromoPopup />` (appears on all pages)
  - Updated `src/app/admin/layout.tsx` — added 4 new nav items: Hero Banners, YouTube Videos, Promo Popup, Vaccine Categories
  - Created admin pages: `/admin/banners`, `/admin/youtube-videos`, `/admin/promo-popup`, `/admin/vaccine-categories`
  - Fixed lint error: unescaped apostrophe in `page.tsx` (`Here's` → `Here&apos;s`)
  - `bun typecheck` ✅ `bun lint` ✅

- [x] **Google OAuth + email login + Book Now auth guard**: 
  - `BookingForm.tsx` now redirects to `/login?redirect=/book` if user is not logged in (auth guard on booking flow)
  - Installed `next-auth@beta` (v5); created `src/auth.ts` with Google provider; created `/api/auth/[...nextauth]/route.ts`
  - Created `/api/auth/google-callback/route.ts` — server-side handler that reads NextAuth session after Google OAuth, creates/finds customer in DB, generates our JWT, redirects to `/auth/google-success`
  - Created `/auth/google-success/page.tsx` — client page that sets localStorage (authToken, customerId, customerName) from URL params, then redirects to profile or original destination
  - Login page now accepts **email OR phone** (auto-detects by `@`), has Google sign-in button, handles `?redirect=` param
  - Register page now has email field + Google sign-in button + handles `?redirect=` param
  - `/api/auth/login` updated to accept `email` OR `phone` as identifier (uses `or()` query)
  - `/api/auth/register` updated to accept `email` field; phone is now optional (either phone or email required)
  - Google OAuth requires `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` env vars to be set in deployment

- [x] **Admin and Customer Portal Fixes**:
  - Fixed error in `/api/audit-log/route.ts` - replaced reserved keyword `module` variable with `moduleParam`
  - Fixed warnings in `src/app/portal/layout.tsx` and `src/app/portal/login/page.tsx` - replaced <a> tags with <Link> tags
  - Verified fixes with `bun typecheck` and `bun lint` commands

- [x] **Session persistence fix**: Login/register pages now check `localStorage.getItem("authToken")` on mount — if a session exists, they immediately redirect to `/profile` instead of showing the form. Shows a spinner while checking to avoid flash. `Header.tsx` now reads auth state from localStorage and shows the user's first name + "Logout" button when logged in, or "Login" when not. Logout clears all 3 localStorage keys and redirects to home. Also listens to `storage` events for cross-tab sync. Committed as `bfc4100`.

- [x] **Family member selection in booking form**: When a logged-in user visits `/book`, the form now fetches their family members and shows a "Who is this booking for?" section with checkboxes (Myself + each family member). Selected patient names are stored in a new `patientNames` JSON column on the `bookings` table. The admin booking detail page now shows a "Patients" row listing the selected names. DB migration `0003_patient_names.sql` adds the column. Non-logged-in users still see the original "Number of People" field. Committed as `9b48fca`.

- [x] **Login error fix v2**: Rewrote `ProfileClient.tsx` data loading from chained `.then()` to `async/await`. The old code redirected to `/login` on ANY fetch error (including server 500s from DB issues), creating a false login-failure loop. Now: only redirects on 401/404 from customer API (actual auth failure); server errors show error state instead; family-members and bookings fetches are independent and non-critical; logout properly clears all 3 localStorage keys. Also removed unused `err` catch variables in login and register pages. Committed as `8ed5c03`.

- [x] **Login error fix v1**: Created two missing API routes that `ProfileClient.tsx` was calling but didn't exist:
  - `src/app/api/family-members/customer/[customerId]/route.ts` — GET family members by customer ID
  - `src/app/api/bookings/customer/[customerId]/route.ts` — GET bookings by customer ID
  After login, the profile page fetched these routes and got 404s, causing it to redirect back to `/login` — appearing as a "login error". Also fixed unused `password` variable in `src/app/api/customers/[id]/route.ts` (renamed to `_password`). Committed as `ac9ebbe`.

- [x] **Critical mobile fix**: `src/app/layout.tsx` — added missing `viewport` export (`width: "device-width", initialScale: 1`). Without this, mobile browsers render the page at ~980px desktop width, making ALL Tailwind responsive breakpoints (`sm:`, `md:`, etc.) completely ineffective. This was the root cause of "not responsive on phone".

- [x] Mobile responsiveness overhaul: `src/app/page.tsx` — all sections now use responsive typography (`text-3xl sm:text-4xl md:text-5xl lg:text-6xl`), responsive spacing (`py-14 sm:py-20 md:py-24`), and responsive padding. Trust bar gap reduced on mobile. Vaccine grid cards smaller on mobile. Footer uses `grid-cols-2 md:grid-cols-4` with brand column spanning full width on mobile.

- [x] Header fix: `src/components/Header.tsx` — removed invalid `xs` breakpoint (not in Tailwind 4). Logo now uses `hidden sm:inline` / `sm:hidden` correctly. Login button is now always visible on all screen sizes (removed `hidden sm:flex`). Removed duplicate Login link from mobile menu dropdown. Mobile menu is cleaner with no Login duplication.

- [x] Footer mobile fix: `src/app/layout.tsx` — footer grid changed from `grid-cols-1 md:grid-cols-4` to `grid-cols-2 md:grid-cols-4`. Brand column spans `col-span-2 md:col-span-1` for full-width on mobile.


- [x] Layout padding fix: `src/app/layout.tsx` — changed `pt-[88px] sm:pt-[100px]` to `pt-8 sm:pt-9`. The header is `sticky` (in normal document flow), so the content wrapper only needs to account for the fixed promo banner height (32px/36px), not the header height too. The previous value was creating a huge gap below the header on the home page.

- [x] Login/Register page height fix: `src/app/login/page.tsx` and `src/app/register/page.tsx` — changed `min-h-screen` to `min-h-[calc(100vh-88px)] sm:min-h-[calc(100vh-100px)]` so the form centers correctly within the available viewport space (below the header + promo banner).

- [x] Build error fix: `src/db/index.ts` — changed `createDatabase()` from eager (module-load-time) to lazy initialization via `Proxy`. The `@kilocode/app-builder-db` `createDatabase()` throws synchronously when `DB_URL`/`DB_TOKEN` env vars are absent; this caused `next build` to fail with "Missing database configuration" when collecting page data for `/api/auth/register`. Fix defers DB creation to first actual use (request time).

- [x] Family members feature: Added customer family member management with name, DOB, gender, and vaccine card upload fields - includes database schema, migration, API routes, and admin UI
- [x] Floating CTA layer: sticky promo scroll banner, floating call buttons (9999109040, 9999771577), WhatsApp button, GPS area auto-detect, vaccine search popup — `src/components/FloatingCTA.tsx`
- [x] Footer phone numbers updated to 9999109040 / 9999771577
- [x] Floating buttons redesign: phone buttons are now icon-only (`w-12 h-12` circular) side-by-side at top; WhatsApp uses `bg-lime-400 text-gray-900` for contrast; tooltips added on phone buttons
- [x] Floating buttons v2: vertical right-side strip (`fixed top-16 right-0`), single phone icon expands on click to show 2 numbers stacked, WhatsApp lime icon, search magnifier icon — all `rounded-l-xl w-11 h-11`

- [x] Base Next.js 16 setup with App Router
- [x] TypeScript configuration with strict mode
- [x] Tailwind CSS 4 integration
- [x] ESLint configuration
- [x] Memory bank documentation
- [x] Recipe system for common features
- [x] Pricing page (`/pricing`) for The Vaccine Panda — emerald brand, 3-tier booking cards (Individual / Family / Corporate), FAQ accordion, CTA banner, GSTIN footer

## Current Structure

| File/Directory | Purpose | Status |
|----------------|---------|--------|
| `src/app/page.tsx` | Home page | ✅ Ready |
| `src/app/layout.tsx` | Root layout | ✅ Ready |
| `src/app/globals.css` | Global styles | ✅ Ready |
| `.kilocode/` | AI context & recipes | ✅ Ready |

## Current Focus

The template is ready. Next steps depend on user requirements:

1. What type of application to build
2. What features are needed
3. Design/branding preferences

## Quick Start Guide

### To add a new page:

Create a file at `src/app/[route]/page.tsx`:
```tsx
export default function NewPage() {
  return <div>New page content</div>;
}
```

### To add components:

Create `src/components/` directory and add components:
```tsx
// src/components/ui/Button.tsx
export function Button({ children }: { children: React.ReactNode }) {
  return <button className="px-4 py-2 bg-blue-600 text-white rounded">{children}</button>;
}
```

### To add a database:

Follow `.kilocode/recipes/add-database.md`

### To add API routes:

Create `src/app/api/[route]/route.ts`:
```tsx
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ message: "Hello" });
}
```

## Available Recipes

| Recipe | File | Use Case |
|--------|------|----------|
| Add Database | `.kilocode/recipes/add-database.md` | Data persistence with Drizzle + SQLite |

## Pending Improvements

- [ ] Add more recipes (auth, email, etc.)
- [ ] Add example components
- [ ] Add testing setup recipe

## Session History

| Date | Changes |
|------|---------|
| Mar 2026 | Comprehensive audit + quote edit feature |
| Initial | Template created with base setup |

- [x] **Environment variable compatibility update (Mar 2026):**
  - Updated `src/db/index.ts` to initialize database using `TURSO_DATABASE_URL` / `TURSO_AUTH_TOKEN` with fallback to `DB_URL` / `DB_TOKEN`
  - Added tracked `.env.example` placeholders for Turso and upcoming Clerk publishable key (`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`)
  - This allows direct use of Turso-style environment variable names without breaking existing deployments
