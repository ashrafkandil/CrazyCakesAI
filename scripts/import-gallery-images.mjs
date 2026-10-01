import { DatabaseSync } from "node:sqlite";
import { readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const imageRoot = path.join(root, "public", "assets", "crazy");
const dbPath = path.join(root, "data", "crazy-cakes.db");
const imageExtensions = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"]);

const categories = readdirSync(imageRoot, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .sort((a, b) => a.name.localeCompare(b.name))
  .map((directory) => ({
    title: directory.name,
    files: readdirSync(path.join(imageRoot, directory.name), { withFileTypes: true })
      .filter((file) => file.isFile() && imageExtensions.has(path.extname(file.name).toLowerCase()))
      .sort((a, b) => a.name.localeCompare(b.name)),
  }))
  .filter((category) => category.files.length > 0);

const imageCount = categories.reduce((count, category) => count + category.files.length, 0);
if (imageCount === 0) throw new Error(`No gallery images found under ${imageRoot}`);

const db = new DatabaseSync(dbPath);
db.exec("PRAGMA busy_timeout = 10000");

try {
  db.exec("BEGIN IMMEDIATE");

  const categoryBySlug = new Map(
    db
      .prepare("SELECT id, slug FROM categories")
      .all()
      .map((row) => [row.slug, row.id]),
  );
  const insertCategory = db.prepare("INSERT INTO categories (slug, title, sort) VALUES (?, ?, ?)");
  let categorySort =
    db.prepare("SELECT COALESCE(MAX(sort), -1) AS value FROM categories").get().value + 1;

  db.exec("DELETE FROM images");

  const insertImage = db.prepare(
    "INSERT INTO images (src, alt, category_id, width, height, sort, featured) VALUES (?, ?, ?, NULL, NULL, ?, ?)",
  );
  let sort = 0;

  for (const category of categories) {
    const slug = category.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    let categoryId = categoryBySlug.get(slug);

    if (categoryId === undefined) {
      const result = insertCategory.run(slug, category.title, categorySort++);
      categoryId = Number(result.lastInsertRowid);
      categoryBySlug.set(slug, categoryId);
    }

    category.files.forEach((file, index) => {
      insertImage.run(
        `/assets/crazy/${category.title}/${file.name}`,
        category.title,
        categoryId,
        sort++,
        index === 0 ? 1 : 0,
      );
    });
  }

  db.exec("COMMIT");
  console.log(`Imported ${sort} gallery images across ${categories.length} categories.`);
} catch (error) {
  db.exec("ROLLBACK");
  throw error;
} finally {
  db.close();
}
