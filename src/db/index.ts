import { createDatabase } from "@kilocode/app-builder-db";
import type { SqliteRemoteDatabase } from "drizzle-orm/sqlite-proxy";
import * as schema from "./schema";

// Lazy initialization: defer createDatabase() until first use so that
// missing DB_URL/DB_TOKEN env vars don't throw at module load time
// (which would break Next.js build-time static analysis).
let _db: SqliteRemoteDatabase<typeof schema> | null = null;

function getDb(): SqliteRemoteDatabase<typeof schema> {
  if (!_db) {
    _db = createDatabase(schema, {
      url: process.env.TURSO_DATABASE_URL ?? process.env.DB_URL,
      token: process.env.TURSO_AUTH_TOKEN ?? process.env.DB_TOKEN,
    });
  }
  return _db;
}

export const db = new Proxy({} as SqliteRemoteDatabase<typeof schema>, {
  get(_target, prop) {
    return (getDb() as unknown as Record<string | symbol, unknown>)[prop];
  },
});
