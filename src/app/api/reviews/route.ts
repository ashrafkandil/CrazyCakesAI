import { z } from "zod";

import { getWritableDb } from "@/lib/db";

/**
 * POST /api/reviews — save a visitor-submitted review.
 * Reviews are inserted with published = 0 and held for moderation; they are
 * never shown on the site until an administrator flips the flag.
 */
export const dynamic = "force-dynamic";

const requestSchema = z.object({
  author: z.string().trim().min(1).max(120),
  quote: z.string().trim().min(1).max(2000),
  rating: z.number().int().min(1).max(5),
});

function initialsFor(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.charAt(0).toUpperCase();
  return (parts[0]!.charAt(0) + parts[parts.length - 1]!.charAt(0)).toUpperCase();
}

function today(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "Please complete the review form." }, { status: 400 });
  }
  const { author, quote, rating } = parsed.data;

  let db;
  try {
    db = getWritableDb();
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Database unavailable." },
      { status: 503 },
    );
  }

  try {
    db.prepare(
      `INSERT INTO testimonials (author, initials, review_date, quote, rating, published, sort)
       VALUES (?, ?, ?, ?, ?, 0, 0)`,
    ).run(author, initialsFor(author), today(), quote, rating);
  } catch {
    return Response.json({ error: "Could not save your review. Please try again." }, { status: 500 });
  } finally {
    db.close();
  }

  return Response.json({ ok: true }, { status: 201 });
}