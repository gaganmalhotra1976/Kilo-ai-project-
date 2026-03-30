import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "@/db";
import { patients } from "@/db/schema";
import { eq } from "drizzle-orm";

// Indian mobile: optional +91 prefix then 10 digits starting with 6-9
const INDIAN_PHONE_RE = /^(?:\+91[-\s]?)?[6-9]\d{9}$/;

// POST /api/profile/setup
// Creates or updates a patient record linked to the authenticated Clerk user.
export async function POST(req: NextRequest) {
  // ── Auth check ────────────────────────────────────────────────────────────
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ── Parse body ────────────────────────────────────────────────────────────
  let body: { fullName?: string; phone?: string; dateOfBirth?: string | null };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { fullName, phone, dateOfBirth } = body;

  // ── Validate ──────────────────────────────────────────────────────────────
  if (!fullName || typeof fullName !== "string" || !fullName.trim()) {
    return NextResponse.json({ error: "Full name is required" }, { status: 400 });
  }

  if (!phone || typeof phone !== "string") {
    return NextResponse.json({ error: "Phone number is required" }, { status: 400 });
  }

  const trimmedPhone = phone.trim();
  if (!INDIAN_PHONE_RE.test(trimmedPhone)) {
    return NextResponse.json(
      { error: "Enter a valid Indian mobile number (+91XXXXXXXXXX or 10-digit)" },
      { status: 400 }
    );
  }

  // ── Fetch Clerk user for email ────────────────────────────────────────────
  const clerkUser = await currentUser();
  const email = clerkUser?.emailAddresses?.[0]?.emailAddress ?? null;

  // ── Upsert patient record ─────────────────────────────────────────────────
  try {
    // Check if a patient record already exists for this clerk_id
    const existing = await db
      .select()
      .from(patients)
      .where(eq(patients.clerkId, userId));

    if (existing.length > 0) {
      // Update existing record
      await db
        .update(patients)
        .set({
          name: fullName.trim(),
          phone: trimmedPhone,
          dateOfBirth: dateOfBirth ?? null,
          ...(email ? { email } : {}),
        })
        .where(eq(patients.clerkId, userId));

      return profileSetupResponse({ success: true, action: "updated" });
    }

    // Check if a patient record exists by email (e.g. created via Clerk webhook)
    if (email) {
      const byEmail = await db
        .select()
        .from(patients)
        .where(eq(patients.email, email));

      if (byEmail.length > 0) {
        // Link existing email record to this clerk_id and update details
        await db
          .update(patients)
          .set({
            clerkId: userId,
            name: fullName.trim(),
            phone: trimmedPhone,
            dateOfBirth: dateOfBirth ?? null,
          })
          .where(eq(patients.email, email));

        return profileSetupResponse({ success: true, action: "linked" });
      }
    }

    // Create new patient record
    await db.insert(patients).values({
      clerkId: userId,
      name: fullName.trim(),
      phone: trimmedPhone,
      email,
      dateOfBirth: dateOfBirth ?? null,
      city: "Delhi",
    });

    return profileSetupResponse({ success: true, action: "created" }, 201);
  } catch (err) {
    console.error("[profile/setup] DB error:", err);
    return NextResponse.json(
      { error: "Failed to save profile. Please try again." },
      { status: 500 }
    );
  }
}

// ── Helper: build response and set the profile-complete cookie ────────────────
function profileSetupResponse(body: Record<string, unknown>, status = 200): NextResponse {
  const res = NextResponse.json(body, { status });
  // vp_profile_set cookie tells middleware the user has completed profile setup.
  // httpOnly so JS cannot tamper with it; SameSite=Lax for standard navigation.
  res.cookies.set("vp_profile_set", "1", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365, // 1 year
  });
  return res;
}

// GET /api/profile/setup — check if current user has a patient record
export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const existing = await db
      .select({ id: patients.id, name: patients.name, phone: patients.phone })
      .from(patients)
      .where(eq(patients.clerkId, userId));

    return NextResponse.json({
      hasProfile: existing.length > 0,
      patient: existing[0] ?? null,
    });
  } catch (err) {
    console.error("[profile/setup] GET error:", err);
    return NextResponse.json(
      { error: "Failed to check profile" },
      { status: 500 }
    );
  }
}
