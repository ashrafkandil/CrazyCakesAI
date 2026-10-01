import { getDb } from "@/lib/db";
import type { SiteContent } from "@/lib/content";
import { versionedImageUrl } from "@/lib/image-url";

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

export type GalleryVideo = {
  id: number;
  src: string;
  title: string;
  sort: number;
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

export type SocialLink = {
  id: number;
  label: string;
  href: string;
  icon: string;
  sort: number;
  active: boolean;
};

export type GalleryPage = {
  categories: GalleryCategory[];
  images: GalleryImage[];
  videos: GalleryVideo[];
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

type VideoRow = {
  id: number;
  src: string;
  title: string;
  sort: number;
  categoryTitle: string;
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

function shuffleImages<T>(items: T[], seed: string) {
  let state = 2166136261;
  for (const character of seed) {
    state = Math.imul(state ^ character.charCodeAt(0), 16777619);
  }
  const random = () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index--) {
    const swapIndex = Math.floor(random() * (index + 1));
    const item = shuffled[index]!;
    shuffled[index] = shuffled[swapIndex]!;
    shuffled[swapIndex] = item;
  }
  return shuffled;
}

export function getGallery(
  options: {
    category?: string | undefined;
    page?: number | undefined;
    pageSize?: number | undefined;
    shuffleSeed?: string | undefined;
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

  const imageQuery = `SELECT i.id, i.src, i.alt, i.width, i.height, i.sort, i.featured, c.slug, c.title
    FROM images i JOIN categories c ON c.id = i.category_id
    ${where ? `WHERE ${where}` : ""}
    ORDER BY i.sort, i.id`;
  const allRows = category
    ? (db.prepare(`${imageQuery} LIMIT ? OFFSET ?`).all(...params, pageSize, offset) as ImageRow[])
    : (db.prepare(imageQuery).all() as ImageRow[]);
  const rows = category
    ? allRows
    : shuffleImages(allRows, options.shuffleSeed ?? "gallery-default").slice(
        offset,
        offset + pageSize,
      );

  const images: GalleryImage[] = rows.map((row) => ({
    id: row.id,
    src: versionedImageUrl(row.src),
    alt: row.alt,
    width: row.width,
    height: row.height,
    sort: row.sort,
    featured: row.featured === 1,
    categorySlug: row.slug,
    categoryTitle: row.title,
  }));

  const videoRows = db
    .prepare(
      `SELECT v.id, v.src, v.title, v.sort, c.title AS categoryTitle
       FROM videos v JOIN categories c ON c.id = v.category_id
       ${where ? `WHERE ${where}` : ""}
       ORDER BY v.sort, v.id`,
    )
    .all(...params) as VideoRow[];

  const videos: GalleryVideo[] = videoRows.map((row) => ({
    id: row.id,
    src: versionedImageUrl(row.src),
    title: row.title,
    sort: row.sort,
    categoryTitle: row.categoryTitle,
  }));

  return {
    categories,
    images,
    videos,
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

export function getSocialLinks(): SocialLink[] {
  const db = getDb();
  const rows = db
    .prepare(
      "SELECT id, label, href, icon, sort, active FROM social_links WHERE active = 1 ORDER BY sort, id",
    )
    .all() as {
    id: number;
    label: string;
    href: string;
    icon: string;
    sort: number;
    active: number;
  }[];

  return rows.map((row) => ({
    id: row.id,
    label: row.label,
    href: row.href,
    icon: row.icon,
    sort: row.sort,
    active: row.active === 1,
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
