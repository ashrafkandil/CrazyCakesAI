/**
 * Snapshot the Crazy Cakes database with `VACUUM INTO`.
 *
 * The site reads a single durable SQLite file, so that file is the one thing worth
 * backing up. `VACUUM INTO` writes a consistent, compact copy while the site keeps
 * running (safe alongside WAL), so this can be cronned without downtime.
 *
 * Honors DB_PATH exactly like the app and the other scripts, otherwise uses
 * data/crazy-cakes.db. Copies land in a `backups` folder next to the database and
 * are timestamped.
 *
 * Usage: bun run db:backup   (or: npm run db:backup)
 */
import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";

import { dbPath } from "./db-path.mjs";

if (!fs.existsSync(dbPath)) {
  console.error(`No database found at ${dbPath}. (Run "bun run db:seed" first.)`);
  process.exit(1);
}

const backupDir = path.join(path.dirname(dbPath), "backups");
fs.mkdirSync(backupDir, { recursive: true });

// e.g. crazy-cakes-2026-10-12T14-30-05.db - filesystem-safe, sortable.
const stamp = new Date().toISOString().replace(/:/g, "-").replace(/\..+$/, "");
const target = path.join(backupDir, `crazy-cakes-${stamp}.db`);

// VACUUM INTO refuses to overwrite, so make sure the target does not exist.
if (fs.existsSync(target)) fs.rmSync(target);

const db = new DatabaseSync(dbPath, { readOnly: true });
try {
  db.exec(`VACUUM INTO '${target.replace(/'/g, "''")}';`);
} finally {
  db.close();
}

const { size } = fs.statSync(target);
console.log(`Backed up ${dbPath}\n        -> ${target} (${(size / 1024).toFixed(1)} KB)`);