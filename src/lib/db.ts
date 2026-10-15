import { DatabaseSync } from "node:sqlite";
import { existsSync } from "node:fs";
import path from "node:path";

// The database is durable runtime data, not code. By default it sits in ./data
// (gitignored), but setting DB_PATH points it at a persistent location outside the
// deploy folder - a mounted volume in production, a shared file in development - so
// a redeploy never replaces it and edits made with an external SQLite tool are
// picked up on the next request, with no rebuild and no reseed. The scripts in
// scripts/ resolve the same path (scripts/db-path.mjs).
const configuredPath = process.env["DB_PATH"];
const dbPath = configuredPath
  ? path.resolve(configuredPath)
  : path.join(process.cwd(), "data", "crazy-cakes.db");

let instance: DatabaseSync | undefined;

export function getDb() {
  if (!instance) {
    if (!existsSync(dbPath)) {
      throw new Error(`Database not found at ${dbPath}. Run "npm run db:seed" first.`);
    }
    instance = new DatabaseSync(dbPath, { readOnly: true });
    // Content is read live on every request; wait (rather than throw
    // "database is locked") if a writer - the seeder or an external SQLite editor -
    // briefly holds the file. The database itself is kept in WAL mode by the
    // scripts in scripts/, so reads never block writers.
    instance.exec("PRAGMA busy_timeout = 5000");
  }
  return instance;
}
