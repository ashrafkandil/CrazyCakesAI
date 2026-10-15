/**
 * Resolve the SQLite database path exactly the way the app does (src/lib/db.ts):
 * honor DB_PATH, otherwise use <repo>/data/crazy-cakes.db.
 *
 * Keeping this in one place means `db:seed`, `db:import-images` and `db:backup`
 * always agree with the running site, so a relocated database never gets a stray
 * copy written to the default location.
 */
import path from "node:path";
import { fileURLToPath } from "node:url";

export const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

export const dbPath = process.env.DB_PATH
  ? path.resolve(process.env.DB_PATH)
  : path.join(root, "data", "crazy-cakes.db");