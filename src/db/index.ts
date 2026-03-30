/**
 * PRIMARY DATABASE CLIENT — Turso (libsql) via Drizzle ORM
 *
 * Production: connects to TURSO_DATABASE_URL with TURSO_AUTH_TOKEN
 * Local dev fallback: if TURSO_DATABASE_URL is not set, falls back to
 *   the @kilocode/app-builder-db local SQLite wrapper.
 *
 * ⚠️  LOCAL DEV ONLY — the fallback path below is for development without
 *     Turso credentials.  All production traffic goes through Turso.
 */

import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "./schema";

type DrizzleDb = ReturnType<typeof drizzle<typeof schema>>;

let _db: DrizzleDb | null = null;

function getDb(): DrizzleDb {
  if (_db) return _db;

  const databaseUrl = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (databaseUrl) {
    // ── Production / staging: connect to Turso ──────────────────────────────
    const client = createClient({ url: databaseUrl, authToken });
    _db = drizzle(client, { schema });
  } else {
    // ── LOCAL DEV ONLY fallback ─────────────────────────────────────────────
    // Uses @kilocode/app-builder-db local SQLite proxy when Turso creds are
    // absent.  This branch is never reached in production.
    console.warn(
      "[db] TURSO_DATABASE_URL not set — falling back to local SQLite (LOCAL DEV ONLY)"
    );
    // Lazy require so the import doesn't fail in environments where the
    // package may not be present.
    // dynamic require so missing package doesn't break the production build
    const { createDatabase } = require("@kilocode/app-builder-db") as { createDatabase: (s: typeof schema) => DrizzleDb };
    _db = createDatabase(schema) as DrizzleDb;
  }

  return _db as DrizzleDb;
}

// Proxy so callers can do `import { db } from "@/db"` without change.
export const db = new Proxy({} as DrizzleDb, {
  get(_target, prop) {
    return (getDb() as unknown as Record<string | symbol, unknown>)[prop];
  },
});
