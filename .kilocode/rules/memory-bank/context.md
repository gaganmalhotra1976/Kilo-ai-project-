# Active Context: Next.js Starter Template

## Current State

**App Status**: ✅ Full Vaccine Panda app built and deployed

The Vaccine Panda home vaccination platform is fully built. The backend admin panel serves as the CRM (no separate CRM). SQLite + Drizzle ORM for data persistence.

## Recently Completed

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
| Initial | Template created with base setup |
