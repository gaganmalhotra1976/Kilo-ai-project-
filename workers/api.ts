import { createClient } from "@libsql/client";
import { verifyJWT } from "./clerk";

const db = createClient({
  url: process.env.TURSO_DATABASE_URL || "",
  authToken: process.env.TURSO_AUTH_TOKEN || undefined,
});

export interface Env {
  TURSO_DATABASE_URL: string;
  TURSO_AUTH_TOKEN: string;
  CLERK_SECRET_KEY: string;
  KILO_WEBHOOK_URL: string;
  WHATSAPP_VERIFY_TOKEN: string;
  PAYU_MERCHANT_KEY: string;
  PAYU_SALT: string;
}

interface ParsedUrl {
  pathname: string;
  search: string;
}

function parseUrl(url: string): ParsedUrl {
  const [path, search] = url.split("?");
  return { pathname: path || "/", search: search || "" };
}

function parseBody(body: string | null): Record<string, unknown> {
  if (!body) return {};
  try {
    return JSON.parse(body);
  } catch {
    return {};
  }
}

async function verifyClerkAuth(request: Request): Promise<Response | null> {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = authHeader.split(" ")[1];
  const verified = await verifyJWT(token, process.env.CLERK_SECRET_KEY || "");
  if (!verified) {
    return Response.json({ error: "Invalid token" }, { status: 401 });
  }
  return null;
}

const worker = {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = parseUrl(new URL(request.url).pathname);
    const pathname = url.pathname;
    const method = request.method;

    // Webhook routes - no auth required
    if (pathname === "/api/webhook/whatsapp" && method === "POST") {
      return handleWhatsappWebhook(request, env);
    }
    if (pathname === "/api/webhook/payu" && method === "POST") {
      return handlePayuWebhook(request, env);
    }

    // Cron routes - no auth required
    if (pathname === "/api/cron/reminders" && method === "POST") {
      return handleRemindersCron(request, env);
    }
    if (pathname === "/api/cron/cleanup" && method === "POST") {
      return handleCleanupCron(request, env);
    }

    // All other routes require Clerk auth
    const authError = await verifyClerkAuth(request);
    if (authError) return authError;

    // GET /api/patients
    if (pathname === "/api/patients" && method === "GET") {
      return getPatients(request, env);
    }

    // GET /api/bookings
    if (pathname === "/api/bookings" && method === "GET") {
      return getBookings(request, env);
    }

    // POST /api/bookings
    if (pathname === "/api/bookings" && method === "POST") {
      return createBooking(request, env);
    }

    // PUT /api/bookings/:id
    const bookingMatch = pathname.match(/^\/api\/bookings\/(\d+)$/);
    if (bookingMatch && method === "PUT") {
      const id = parseInt(bookingMatch[1], 10);
      return updateBooking(id, request, env);
    }

    // GET /api/vaccines
    if (pathname === "/api/vaccines" && method === "GET") {
      return getVaccines(request, env);
    }

    return Response.json({ error: "Not found" }, { status: 404 });
  },
};

async function getPatients(request: Request, env: Env): Promise<Response> {
  try {
    const result = await db.execute(
      "SELECT id, name, phone, email, city, created_at FROM patients ORDER BY created_at DESC"
    );
    return Response.json({ patients: result.rows });
  } catch (error) {
    console.error("Error fetching patients:", error);
    return Response.json({ error: "Failed to fetch patients" }, { status: 500 });
  }
}

async function getBookings(request: Request, env: Env): Promise<Response> {
  try {
    const result = await db.execute(`
      SELECT 
        b.id, b.customer_name, b.customer_phone, b.vaccines_requested,
        b.preferred_date, b.status, b.payment_status, b.created_at,
        b.payment_deadline, b.expires_at, b.reminder_sent,
        p.name as patient_name
      FROM bookings b
      LEFT JOIN patients p ON b.customer_id = p.id
      ORDER BY b.preferred_date DESC, b.created_at DESC
    `);
    return Response.json({ bookings: result.rows });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return Response.json({ error: "Failed to fetch bookings" }, { status: 500 });
  }
}

async function createBooking(request: Request, env: Env): Promise<Response> {
  try {
    const body = parseBody(await request.text());

    const customerName = body.customerName as string;
    const customerPhone = body.customerPhone as string;
    const customerEmail = body.customerEmail as string | undefined;
    const address = body.address as string;
    const city = body.city as string || "Delhi";
    const vaccinesRequested = body.vaccinesRequested as string;
    const numberOfPeople = body.numberOfPeople as number || 1;

    const paymentDeadline = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    const preferredDate = body.preferredDate as string;
    const preferredTime = body.preferredTime as string | undefined;

    const result = await db.execute({
      sql: `
        INSERT INTO bookings (
          customer_name, customer_phone, customer_email, address, city,
          vaccines_requested, number_of_people, preferred_date, preferred_time,
          status, payment_status, payment_deadline, expires_at, reminder_sent,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', 'unpaid', ?, ?, 0, datetime('now'), datetime('now'))
      `,
      args: [
        customerName, customerPhone, customerEmail || null,
        address, city, vaccinesRequested, numberOfPeople,
        preferredDate || null, preferredTime || null,
        paymentDeadline, expiresAt
      ],
    });

    return Response.json({
      success: true,
      bookingId: result.lastInsertRowid,
      paymentDeadline,
      expiresAt
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating booking:", error);
    return Response.json({ error: "Failed to create booking" }, { status: 500 });
  }
}

async function updateBooking(id: number, request: Request, env: Env): Promise<Response> {
  try {
    const body = parseBody(await request.text());
    const status = body.status as string;

    if (!["pending", "paid", "completed", "cancelled"].includes(status)) {
      return Response.json({ error: "Invalid status" }, { status: 400 });
    }

    await db.execute({
      sql: "UPDATE bookings SET status = ?, updated_at = datetime('now') WHERE id = ?",
      args: [status, id],
    });

    return Response.json({ success: true, id, status });
  } catch (error) {
    console.error("Error updating booking:", error);
    return Response.json({ error: "Failed to update booking" }, { status: 500 });
  }
}

async function getVaccines(request: Request, env: Env): Promise<Response> {
  try {
    const result = await db.execute(`
      SELECT 
        id, name, brand, category, description,
        doses_required, interval_days, age_group,
        mrp, stock_quantity, gst_rate, is_available
      FROM vaccines
      WHERE is_active = 1
      ORDER BY name
    `);
    return Response.json({ vaccines: result.rows });
  } catch (error) {
    console.error("Error fetching vaccines:", error);
    return Response.json({ error: "Failed to fetch vaccines" }, { status: 500 });
  }
}

async function handleWhatsappWebhook(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === (env.WHATSAPP_VERIFY_TOKEN || "vaccine_panda_wa_verify")) {
    return new Response(challenge, { status: 200 });
  }

  try {
    const payload = await request.json();
    console.log("WhatsApp webhook received:", JSON.stringify(payload));

    if (env.KILO_WEBHOOK_URL) {
      await fetch(env.KILO_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    }

    return Response.json({ status: "received" });
  } catch (error) {
    console.error("WhatsApp webhook error:", error);
    return Response.json({ error: "Failed to process webhook" }, { status: 500 });
  }
}

async function handlePayuWebhook(request: Request, env: Env): Promise<Response> {
  try {
    const body = parseBody(await request.text());
    const txnid = body.txnid as string;
    const status = body.status as string;
    const mihpayid = body.mihpayid as string;

    console.log("PayU webhook received:", { txnid, status, mihpayid });

    if (status === "success" || status === "SUCCESS") {
      await db.execute({
        sql: "UPDATE bookings SET payment_status = 'paid', status = 'confirmed', updated_at = datetime('now') WHERE id = ?",
        args: [parseInt(txnid, 10) || 0],
      });
    }

    return Response.json({ status: "processed" });
  } catch (error) {
    console.error("PayU webhook error:", error);
    return Response.json({ error: "Failed to process webhook" }, { status: 500 });
  }
}

async function handleRemindersCron(request: Request, env: Env): Promise<Response> {
  try {
    const result = await db.execute({
      sql: `
        SELECT id, customer_name, customer_phone, payment_deadline
        FROM bookings
        WHERE payment_deadline < datetime('now')
          AND reminder_sent = 0
          AND payment_status = 'unpaid'
      `,
      args: [],
    });

    const bookings = result.rows;

    for (const booking of bookings) {
      await db.execute({
        sql: "UPDATE bookings SET reminder_sent = 1 WHERE id = ?",
        args: [booking.id],
      });
    }

    return Response.json({
      success: true,
      count: bookings.length,
      bookings: bookings.map((b: Record<string, unknown>) => ({
        id: b.id,
        customerName: b.customer_name,
        customerPhone: b.customer_phone,
        paymentDeadline: b.payment_deadline,
      })),
    });
  } catch (error) {
    console.error("Reminders cron error:", error);
    return Response.json({ error: "Failed to process reminders" }, { status: 500 });
  }
}

async function handleCleanupCron(request: Request, env: Env): Promise<Response> {
  try {
    const result = await db.execute({
      sql: `
        DELETE FROM temp_docs
        WHERE expires_at < datetime('now')
           OR status = 'rejected'
      `,
      args: [],
    });

    return Response.json({
      success: true,
      deletedCount: result.rowsAffected || 0,
    });
  } catch (error) {
    console.error("Cleanup cron error:", error);
    return Response.json({ error: "Failed to process cleanup" }, { status: 500 });
  }
}

export default worker;