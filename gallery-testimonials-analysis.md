# Current Image & Testimonial Setup — Analysis and Scaling Recommendations

Date: 2026-09-13
Scope: No code changes were made. This is an explanation of the current setup and a
recommended path for moving to a large, dynamic set of gallery images and testimonials.

## 1. How it works today

### Images + categories

All data is hardcoded in `src/app/site-data.ts`:

- `galleryItems`: an array of `{ src, alt, category }` objects. `src` is a literal
  string such as `/assets/crazy/wedding-1.jpg`. The files physically live in
  `public/assets/crazy/` (17 files, ~2.6 MB — 8 gallery shots plus hero/pricing/about extras).
- `categories`: a hardcoded array `["All", "Wedding", "Sculpted", ...]` that must be
  kept in sync with `galleryItems` by hand.
- `GalleryExplorer` (`src/app/gallery/gallery-explorer.tsx`, a `"use client"` component)
  imports both arrays, filters client-side on category click, and cycles one large
  `<img>` plus a thumbnail strip. It is a single big carousel, not a grid.
- Rendering uses raw `<img loading="lazy">` tags — **not** `next/image`
  (9 raw `<img>` tags, 0 `next/image` imports).

### Testimonials

- Also hardcoded in `src/app/site-data.ts`: a `reviews` array of
  `{ initials, name, date, quote }`.
- Rendered statically on `src/app/reviews/page.tsx`.

### Summary of the model

- "Data" is a TypeScript module compiled into the app bundle.
- Adding an image = edit code + drop the file into `/public` + redeploy.
- `category` is a single value per item (no multi-category support).

## 2. Problems if the number of images grows large

1. **Everything ships in one client bundle.** All `src` strings are sent to the browser;
   hundreds of items bloat the JS, and the entire filter list re-renders client-side.
2. **No `next/image`.** No resizing, no WebP/AVIF conversion, no CLS-safe sizing.
   Hundreds of ~300 KB JPGs means multi-MB pages.
3. **Single-carousel UX does not scale.** A thumbnail strip of 200 items is unusable;
   a paginated/masonry grid is needed instead.
4. **Manual category/item sync** breaks at volume; one category per item is too rigid.
5. **New images require a redeploy.** No way for non-developers to edit content.

## 3. Recommended target architecture

### 3.1 Data source: move from TS arrays to a real store (two options)

- **Option A — file-based but data-driven (cheapest step).** Move the JSON out of the
  bundle, derive `categories` from the items themselves (no manual list), and read it
  in a server component. Add an admin script or route to append entries.
  Works comfortably up to a few hundred items.

- **Option B — a real database (best at scale): SQLite.** SQLite is a good fit here:
  a single file, zero operational overhead, ideal for small/medium marketing sites,
  and simple to host.
  ⚠ Caveat: SQLite is **not** a good fit on Vercel's serverless/edge runtime, where
  there is no persistent disk and the file resets between invocations. It fits
  self-hosted setups, Railway, Fly.io, a VPS, or anywhere with a mounted volume.

Suggested schema:

```
categories(id, slug, title, sort)
images(id, src, alt, category_id, width, height, sort, featured)
testimonials(id, author, initials, date, quote, rating, published, sort)
```

Query it through a thin repository layer (`src/lib/data.ts`) using **better-sqlite3**
(synchronous, fast, the simplest option for this workload).

### 3.2 Fetch on the server, not the client

Make `/gallery` a server component:

```
const { items, categories } = await getGallery({ category, page });
```

Filtering and pagination should use **search params**
(`/gallery?cat=wedding&page=2`) instead of client-side `useState` filtering.
This keeps pages linkable, SEO-friendly, and light even with thousands of rows.

### 3.3 Images: `next/image` + real object storage

At scale, move files out of `/public` to **S3 / Cloudflare R2 / Cloudinary**
(or an image CDN) and serve them with `next/image` using `sizes`, remote patterns,
and fixed aspect ratios. Cloudinary/Picatic can also auto-optimize on the fly, so
sizes do not need hand management. Store alt text, width, and height in the DB.

### 3.4 Layout: grid + pagination

Use a grid (or masonry) with pagination for the full wall; keep the lightbox/carousel
only for the selected image.

### 3.5 Testimonials: same pattern

Store in SQLite with a `published` flag and `sort` order, render server-side, and add
an admin CRUD route later if non-developers must manage entries.

## 4. Suggested migration path (lowest risk first)

1. **Step 1 — data seam + server rendering (no DB yet):**
   derive categories from items, move arrays to JSON, render server-side, adopt
   `next/image`.
2. **Step 2 — swap the JSON for SQLite** behind a `getGallery()` / `getTestimonials()`
   repository seam, so components never touch the storage layer directly.
3. **Step 3 — object storage + CDN + search-param pagination** when image volume
   actually demands it.

Because the components only depend on the repository seam from Step 2 onward, going
file-based → SQLite requires no component changes.

## 5. Decision summary

| Concern              | Today                        | Recommended                          |
| -------------------- | ---------------------------- | ------------------------------------ |
| Image data           | TS array in bundle           | SQLite (or JSON first) behind a repo seam |
| Categories           | Hand-maintained array        | Derived from items / `categories` table |
| Filtering/pagination | Client `useState`            | Server + search params               |
| Image rendering      | Raw `<img>`                  | `next/image` + object storage/CDN    |
| Gallery UX           | One carousel + thumb strip   | Grid/masonry + lightbox              |
| Testimonials         | TS array, static render      | SQLite + `published`/`sort`, server-rendered |
| Editing content      | Code change + redeploy       | Admin CRUD route (later)             |
| Hosting constraint   | None                         | Persistent disk needed for SQLite (not Vercel serverless) |
