import type { Metadata } from "next";
import { randomUUID } from "node:crypto";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { GalleryGrid } from "@/app/gallery/gallery-grid";
import { VideoGrid } from "@/app/gallery/video-grid";
import { SectionHeading } from "@/app/section-heading";
import { text } from "@/lib/content";
import { getContent, getGallery } from "@/lib/data";

export function generateMetadata(): Metadata {
  const content = getContent();
  return {
    title: `${text(content, "gallery.title")} | Marwa Crazy Cakes`,
    description: text(content, "gallery.description"),
    alternates: { canonical: "/gallery" },
  };
}

export const revalidate = 300;

type SearchParams = Promise<{ cat?: string; page?: string; shuffle?: string }>;

function hrefFor(category: string, page: number, shuffle?: string) {
  const params = new URLSearchParams();
  if (category !== "all") params.set("cat", category);
  if (page > 1) params.set("page", String(page));
  if (category === "all" && shuffle) params.set("shuffle", shuffle);
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
  const shuffleSeed = category === "all" ? params.shuffle || randomUUID() : undefined;
  const requestedPage = Number.parseInt(params.page ?? "", 10);
  const gallery = getGallery({
    category: category === "all" ? undefined : category,
    page: Number.isFinite(requestedPage) ? requestedPage : 1,
    shuffleSeed,
  });
  const content = getContent();
  const labels = {
    close: text(content, "gallery.closeImage"),
    previous: text(content, "gallery.previousImage"),
    next: text(content, "gallery.nextImage"),
  };
  const videoLabels = {
    close: text(content, "gallery.closeVideo"),
    previous: text(content, "gallery.previousVideo"),
    next: text(content, "gallery.nextVideo"),
  };

  return (
    <section className="px-5 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          title={text(content, "gallery.title")}
          eyebrow={text(content, "gallery.eyebrow")}
        />
        <p className="mx-auto mt-6 max-w-3xl text-center text-base leading-7">
          {text(content, "gallery.description")}
        </p>

        <nav
          aria-label={text(content, "gallery.categoriesLabel")}
          className="mt-10 flex flex-wrap items-center justify-center gap-2"
        >
          <Link href={hrefFor("all", 1)} className={pillClass(gallery.activeCategory === "all")}>
            {text(content, "gallery.allCategory")}
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
            {text(content, "gallery.empty")}
          </p>
        ) : (
          <GalleryGrid images={gallery.images} labels={labels} />
        )}

        {gallery.pageCount > 1 && (
          <nav
            aria-label={text(content, "gallery.paginationLabel")}
            className="mt-12 flex items-center justify-center gap-4 text-sm"
          >
            {gallery.page > 1 ? (
              <Link
                href={hrefFor(gallery.activeCategory, gallery.page - 1, shuffleSeed)}
                className="rounded-md bg-secondary px-4 py-2 text-secondary-foreground hover:bg-secondary/80"
              >
                {text(content, "gallery.previous")}
              </Link>
            ) : (
              <span aria-hidden="true" className="px-4 py-2 text-muted-foreground/50">
                {text(content, "gallery.previous")}
              </span>
            )}
            <span aria-live="polite" className="text-muted-foreground">
              {text(content, "gallery.pageStatus")
                .replace("{page}", String(gallery.page))
                .replace("{pageCount}", String(gallery.pageCount))
                .replace("{total}", String(gallery.total))}
            </span>
            {gallery.page < gallery.pageCount ? (
              <Link
                href={hrefFor(gallery.activeCategory, gallery.page + 1, shuffleSeed)}
                className="rounded-md bg-secondary px-4 py-2 text-secondary-foreground hover:bg-secondary/80"
              >
                {text(content, "gallery.next")}
              </Link>
            ) : (
              <span aria-hidden="true" className="px-4 py-2 text-muted-foreground/50">
                {text(content, "gallery.next")}
              </span>
            )}
          </nav>
        )}

        {gallery.videos.length > 0 && (
          <section className="mt-20 border-t border-border pt-14">
            <SectionHeading
              title={text(content, "gallery.videoTitle")}
              eyebrow={text(content, "gallery.videoEyebrow")}
            />
            <p className="mx-auto mt-6 max-w-2xl text-center text-base leading-7">
              {text(content, "gallery.videoDescription")}
            </p>
            <VideoGrid videos={gallery.videos} labels={videoLabels} />
          </section>
        )}

        <div className="mt-14 text-center">
          <p className="text-muted-foreground">{text(content, "gallery.ctaText")}</p>
          <Button asChild className="mt-5">
            <Link href="/contact">{text(content, "gallery.ctaLabel")}</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
