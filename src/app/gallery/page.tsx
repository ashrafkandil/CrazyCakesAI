import type { Metadata } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { GalleryGrid } from "@/app/gallery/gallery-grid";
import { SectionHeading } from "@/app/section-heading";
import { getGallery } from "@/lib/data";

export const metadata: Metadata = {
  title: "Gallery | Marwa Crazy Cakes",
  description:
    "Explore custom sculpted cakes, wedding cakes, kids cakes, cupcakes and edible art by Marwa Crazy Cakes.",
  alternates: { canonical: "/gallery" },
};

export const revalidate = 300;

type SearchParams = Promise<{ cat?: string; page?: string }>;

function hrefFor(category: string, page: number) {
  const params = new URLSearchParams();
  if (category !== "all") params.set("cat", category);
  if (page > 1) params.set("page", String(page));
  const query = params.toString();
  return query ? `/gallery?${query}` : "/gallery";
}

function pillClass(isActive: boolean) {
  return `rounded-md px-4 py-2 text-sm transition-colors ${
    isActive
      ? "bg-primary font-medium text-primary-foreground"
      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
  }`;
}

export default async function GalleryPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const category = params.cat && params.cat !== "all" ? params.cat : "all";
  const requestedPage = Number.parseInt(params.page ?? "", 10);
  const gallery = getGallery({
    category: category === "all" ? undefined : category,
    page: Number.isFinite(requestedPage) ? requestedPage : 1,
  });

  return (
    <section className="px-5 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <SectionHeading title="Our Gallery" eyebrow="Portfolio of custom creations" />
        <p className="mx-auto mt-6 max-w-3xl text-center text-base leading-7">
          Explore our portfolio of custom creations, each one unique and crafted with passion. From
          intimate celebrations to grand events, see how we bring visions to life.
        </p>

        <nav
          aria-label="Gallery categories"
          className="mt-10 flex flex-wrap items-center justify-center gap-2"
        >
          <Link href={hrefFor("all", 1)} className={pillClass(gallery.activeCategory === "all")}>
            All
          </Link>
          {gallery.categories.map((item) => (
            <Link
              key={item.slug}
              href={hrefFor(item.slug, 1)}
              aria-current={gallery.activeCategory === item.slug ? "page" : undefined}
              className={pillClass(gallery.activeCategory === item.slug)}
            >
              {item.title}
            </Link>
          ))}
        </nav>

        {gallery.images.length === 0 ? (
          <p className="mt-16 text-center text-muted-foreground">
            No cakes in this category yet — check back soon!
          </p>
        ) : (
          <GalleryGrid images={gallery.images} />
        )}

        {gallery.pageCount > 1 && (
          <nav
            aria-label="Gallery pagination"
            className="mt-12 flex items-center justify-center gap-4 text-sm"
          >
            {gallery.page > 1 ? (
              <Link
                href={hrefFor(gallery.activeCategory, gallery.page - 1)}
                className="rounded-md bg-secondary px-4 py-2 text-secondary-foreground hover:bg-secondary/80"
              >
                ‹ Previous
              </Link>
            ) : (
              <span aria-hidden="true" className="px-4 py-2 text-muted-foreground/50">
                ‹ Previous
              </span>
            )}
            <span aria-live="polite" className="text-muted-foreground">
              Page {gallery.page} of {gallery.pageCount} · {gallery.total} cakes
            </span>
            {gallery.page < gallery.pageCount ? (
              <Link
                href={hrefFor(gallery.activeCategory, gallery.page + 1)}
                className="rounded-md bg-secondary px-4 py-2 text-secondary-foreground hover:bg-secondary/80"
              >
                Next ›
              </Link>
            ) : (
              <span aria-hidden="true" className="px-4 py-2 text-muted-foreground/50">
                Next ›
              </span>
            )}
          </nav>
        )}

        <div className="mt-14 text-center">
          <p className="text-muted-foreground">Ready to create your own masterpiece?</p>
          <Button asChild className="mt-5">
            <Link href="/contact">Start Your Custom Order</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
