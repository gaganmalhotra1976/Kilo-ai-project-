import { createClient } from "@libsql/client";
import { readdir, readFile } from "fs/promises";
import { join } from "path";

const databaseUrl = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!databaseUrl) {
  console.error("TURSO_DATABASE_URL environment variable is not set");
  process.exit(1);
}

const db = createClient({
  url: databaseUrl,
  authToken: authToken || undefined,
});

async function getCurrentVersion(): Promise<number> {
  try {
    const result = await db.execute(
      "SELECT version FROM _migrations ORDER BY version DESC LIMIT 1"
    );
    if (result.rows.length > 0) {
      return Number(result.rows[0].version);
    }
  } catch {
    // Table doesn't exist yet
  }
  return 0;
}

async function ensureMigrationsTable(): Promise<void> {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      version TEXT NOT NULL UNIQUE,
      applied_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);
}

async function runMigrations(): Promise<void> {
  console.log("Starting Turso migration runner...");

  await ensureMigrationsTable();

  const currentVersion = await getCurrentVersion();
  console.log(`Current migration version: ${currentVersion}`);

  const migrationsDir = join(process.cwd(), "src", "db", "migrations");
  const files = await readdir(migrationsDir);
  const sqlFiles = files
    .filter((f) => f.endsWith(".sql"))
    .sort()
    .filter((f) => {
      const version = parseInt(f.split("_")[0], 10);
      return !isNaN(version) && version > currentVersion;
    });

  if (sqlFiles.length === 0) {
    console.log("No pending migrations found");
    return;
  }

  console.log(`Found ${sqlFiles.length} pending migrations`);

  for (const file of sqlFiles) {
    const version = file.split("_")[0];
    console.log(`Running migration: ${file}`);

    const content = await readFile(join(migrationsDir, file), "utf-8");

    try {
      await db.execute("BEGIN TRANSACTION");
      await db.executeMultiple(content);
      await db.execute(
        "INSERT INTO _migrations (version) VALUES (?)",
        [version]
      );
      await db.execute("COMMIT");
      console.log(`Migration ${file} applied successfully`);
    } catch (error) {
      await db.execute("ROLLBACK");
      console.error(`Failed to apply migration ${file}:`, error);
      throw error;
    }
  }

  console.log("All migrations completed successfully");
}

runMigrations().catch((e) => {
  console.error("Migration failed:", e);
  process.exit(1);
});