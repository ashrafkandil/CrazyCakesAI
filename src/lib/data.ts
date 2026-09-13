import { getDb } from "@/lib/db";
import type { SiteContent } from "@/lib/content";

export type GalleryCategory = { id: number; slug: string; title: string; sort: number };

export type GalleryImage = {
  id: number;
  src: string;
  alt: string;
  width: number | null;
  height: number | null;
  sort: number;
  featured: boolean;
  categorySlug: string;
  categoryTitle: string;
};

export type Testimonial = {
  id: number;
  author: string;
  initials: string;
  date: string;
  quote: string;
  rating: number;
};

export type GalleryPage = {
  categories: GalleryCategory[];
  images: GalleryImage[];
  activeCategory: string;
  page: number;
  pageSize: number;
  total: number;
  pageCount: number;
};

type ImageRow = {
  id: number;
  src: string;
  alt: string;
  width: number | null;
  height: number | null;
  sort: number;
  featured: number;
  slug: string;
  title: string;
};

type TestimonialRow = {
  id: number;
  author: string;
  initials: string;
  review_date: string;
  quote: string;
  rating: number;
};

function clampPage(value: number | undefined, pageCount: number) {
  if (!Number.isFinite(value) || !value || value < 1) return 1;
  return Math.min(Math.floor(value), pageCount);
}

export function getGallery(
  options: {
    category?: string | undefined;
    page?: number | undefined;
    pageSize?: number | undefined;
  } = {},
): GalleryPage {
  const db = getDb();
  const pageSize = Math.max(1, options.pageSize ?? 6);
  const category = options.category && options.category !== "all" ? options.category : null;

  const categories = db
    .prepare("SELECT id, slug, title, sort FROM categories ORDER BY sort")
    .all() as GalleryCategory[];

  const where = category ? "c.slug = ?" : "";
  const params = category ? [category] : [];

  const total = (
    db
      .prepare(
        `SELECT COUNT(*) AS n FROM images i JOIN categories c ON c.id = i.category_id ${where ? `WHERE ${where}` : ""}`,
      )
      .get(...params) as { n: number }
  ).n;

  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const page = clampPage(options.page, pageCount);
  const offset = (page - 1) * pageSize;

  const rows = db
    .prepare(
      `SELECT i.id, i.src, i.alt, i.width, i.height, i.sort, i.featured, c.slug, c.title
       FROM images i JOIN categories c ON c.id = i.category_id
       ${where ? `WHERE ${where}` : ""}
       ORDER BY i.sort, i.id
       LIMIT ? OFFSET ?`,
    )
    .all(...params, pageSize, offset) as ImageRow[];

  const images: GalleryImage[] = rows.map((row) => ({
    id: row.id,
    src: row.src,
    alt: row.alt,
    width: row.width,
    height: row.height,
    sort: row.sort,
    featured: row.featured === 1,
    categorySlug: row.slug,
    categoryTitle: row.title,
  }));

  return {
    categories,
    images,
    activeCategory: category ?? "all",
    page,
    pageSize,
    total,
    pageCount,
  };
}

export function getTestimonials(): Testimonial[] {
  const db = getDb();
  const rows = db
    .prepare(
      "SELECT id, author, initials, review_date, quote, rating FROM testimonials WHERE published = 1 ORDER BY sort, id",
    )
    .all() as TestimonialRow[];

  return rows.map((row) => ({
    id: row.id,
    author: row.author,
    initials: row.initials,
    date: row.review_date,
    quote: row.quote,
    rating: row.rating,
  }));
}

export type { SiteContent };

export function getEventTypes(): string[] {
  const db = getDb();
  const rows = db.prepare("SELECT label FROM event_types ORDER BY sort, id").all() as {
    label: string;
  }[];
  return rows.map((row) => row.label);
}

export function getContent(): SiteContent {
  const db = getDb();
  const rows = db.prepare("SELECT key, value FROM content").all() as {
    key: string;
    value: string;
  }[];
  return Object.fromEntries(rows.map((row) => [row.key, row.value]));
}
