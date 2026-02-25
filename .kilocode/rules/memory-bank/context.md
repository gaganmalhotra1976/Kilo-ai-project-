# Active Context: Next.js Starter Template

## Current State

**App Status**: ✅ Full Vaccine Panda app built and deployed

The Vaccine Panda home vaccination platform is fully built. The backend admin panel serves as the CRM (no separate CRM). SQLite + Drizzle ORM for data persistence.

## Recently Completed

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
