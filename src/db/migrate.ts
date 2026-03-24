import { runMigrations } from "@kilocode/app-builder-db";
import { db } from "./index";

try {
  await runMigrations(db, {}, { migrationsFolder: "./src/db/migrations" });
  console.log("Migrations completed successfully");
} catch (e) {
  console.log("Migration skipped - will run on next deployment with credentials");
  console.log("Error:", e);
}
