"use client";

import { Play, X } from "lucide-react";
import { useEffect, useState } from "react";

import type { GalleryVideo } from "@/lib/data";

type VideoGridLabels = { close: string; previous: string; next: string };

export function VideoGrid({ videos, labels }: { videos: GalleryVideo[]; labels: VideoGridLabels }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const active = activeIndex === null ? null : videos[activeIndex];

  useEffect(() => {
    if (activeIndex === null) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setActiveIndex(null);
      if (event.key === "ArrowRight")
        setActiveIndex((index) => (index === null ? index : (index + 1) % videos.length));
      if (event.key === "ArrowLeft")
        setActiveIndex((index) =>
          index === null ? index : (index - 1 + videos.length) % videos.length,
        );
    }
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [activeIndex, videos.length]);

  return (
    <>
      <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3">
        {videos.map((video, index) => (
          <button
            key={video.id}
            type="button"
            onClick={() => setActiveIndex(index)}
            className="group relative aspect-[4/3] overflow-hidden rounded-lg border-2 border-foreground/70 bg-muted text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 opacity-[0.08]"
              style={{
                backgroundImage: "url('/assets/crazy/logo.png')",
                backgroundPosition: "center",
                backgroundRepeat: "repeat",
                backgroundSize: "64px 64px",
              }}
            />
            <video
              src={video.src}
              aria-label={video.title}
              className="absolute inset-0 h-full w-full object-contain"
              muted
              loop
              autoPlay
              playsInline
              preload="metadata"
            />
            <span className="absolute inset-0 flex items-center justify-center bg-overlay-soft transition-colors group-hover:bg-overlay-strong">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg">
                <Play className="ml-0.5 h-5 w-5 fill-current" aria-hidden="true" />
              </span>
            </span>
            <span className="absolute inset-x-0 bottom-0 bg-overlay-soft px-3 py-2 text-xs text-primary-foreground">
              {video.title}
            </span>
          </button>
        ))}
      </div>

      {active && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={active.title}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-overlay px-4 py-10"
          onClick={() => setActiveIndex(null)}
        >
          <button
            type="button"
            aria-label={labels.close}
            onClick={() => setActiveIndex(null)}
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-overlay-soft text-primary-foreground hover:bg-overlay-strong"
          >
            <X />
          </button>
          <figure className="w-full max-w-4xl" onClick={(event) => event.stopPropagation()}>
            <video
              key={active.src}
              className="max-h-[75vh] w-full rounded-lg bg-black object-contain"
              src={active.src}
              controls
              autoPlay
              playsInline
            />
            <figcaption className="mt-4 text-center text-sm text-primary-foreground">
              {active.title} · {active.categoryTitle}
            </figcaption>
            <div className="mt-4 flex justify-center gap-3">
              <button
                type="button"
                aria-label={labels.previous}
                onClick={() =>
                  setActiveIndex((index) =>
                    index === null ? index : (index - 1 + videos.length) % videos.length,
                  )
                }
                className="h-10 w-10 rounded-full bg-overlay-soft text-primary-foreground hover:bg-overlay-strong"
              >
                ‹
              </button>
              <button
                type="button"
                aria-label={labels.next}
                onClick={() =>
                  setActiveIndex((index) => (index === null ? index : (index + 1) % videos.length))
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
