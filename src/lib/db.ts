import { DatabaseSync } from "node:sqlite";
import { existsSync } from "node:fs";
import path from "node:path";

const dbPath = path.join(process.cwd(), "data", "crazy-cakes.db");

let instance: DatabaseSync | undefined;

export function getDb() {
  if (!instance) {
    if (!existsSync(dbPath)) {
      throw new Error(`Database not found at ${dbPath}. Run "npm run db:seed" first.`);
    }
    instance = new DatabaseSync(dbPath, { readOnly: true });
  }
  return instance;
}
