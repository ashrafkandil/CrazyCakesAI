"use client";

import { X } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

import type { GalleryImage } from "@/lib/data";

export function GalleryGrid({ images }: { images: GalleryImage[] }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  useEffect(() => {
    if (activeIndex === null) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setActiveIndex(null);
      if (event.key === "ArrowRight")
        setActiveIndex((i) => (i === null ? i : (i + 1) % images.length));
      if (event.key === "ArrowLeft")
        setActiveIndex((i) => (i === null ? i : (i - 1 + images.length) % images.length));
    }
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [activeIndex, images.length]);

  const active = activeIndex === null ? null : images[activeIndex];

  return (
    <>
      <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3">
        {images.map((item, index) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setActiveIndex(index)}
            className="group relative aspect-[4/3] overflow-hidden rounded-lg bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <Image
              src={item.src}
              alt={item.alt}
              fill
              sizes="(max-width: 640px) 50vw, 33vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              loading={index < 6 ? "eager" : "lazy"}
            />
            <span className="pointer-events-none absolute inset-x-0 bottom-0 bg-overlay-soft px-3 py-2 text-left text-xs text-primary-foreground opacity-0 transition-opacity group-hover:opacity-100">
              {item.alt}
            </span>
          </button>
        ))}
      </div>

      {active && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={active.alt}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-overlay px-4 py-10"
          onClick={() => setActiveIndex(null)}
        >
          <button
            type="button"
            aria-label="Close"
            onClick={() => setActiveIndex(null)}
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-overlay-soft text-primary-foreground hover:bg-overlay-strong"
          >
            <X />
          </button>
          <figure
            className="relative w-full max-w-4xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-black/20">
              <Image
                src={active.src}
                alt={active.alt}
                fill
                sizes="90vw"
                className="object-contain"
              />
            </div>
            <figcaption className="mt-4 text-center text-sm text-primary-foreground">
              {active.alt} · {active.categoryTitle}
            </figcaption>
            <div className="mt-4 flex justify-center gap-3">
              <button
                type="button"
                aria-label="Previous image"
                onClick={() =>
                  setActiveIndex((index) =>
                    index === null ? index : (index - 1 + images.length) % images.length,
                  )
                }
                className="h-10 w-10 rounded-full bg-overlay-soft text-primary-foreground hover:bg-overlay-strong"
              >
                ‹
              </button>
              <button
                type="button"
                aria-label="Next image"
                onClick={() =>
                  setActiveIndex((index) => (index === null ? index : (index + 1) % images.length))
                }
                className="h-10 w-10 rounded-full bg-overlay-soft text-primary-foreground hover:bg-overlay-strong"
              >
                ›
              </button>
            </div>
          </figure>
        </div>
      )}
    </>
  );
}
