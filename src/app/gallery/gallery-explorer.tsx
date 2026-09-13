"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { categories, galleryItems } from "@/app/site-data";

export function GalleryExplorer() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [galleryIndex, setGalleryIndex] = useState(0);

  const visibleItems =
    activeCategory === "All"
      ? galleryItems
      : galleryItems.filter((item) => item.category === activeCategory);
  const safeGalleryIndex = galleryIndex % visibleItems.length;
  const activeGalleryItem = visibleItems[safeGalleryIndex] ?? galleryItems[0];

  function changeCategory(category: string) {
    setActiveCategory(category);
    setGalleryIndex(0);
  }

  function stepSlide(step: number) {
    setGalleryIndex((safeGalleryIndex + step + visibleItems.length) % visibleItems.length);
  }

  return (
    <>
      <div className="mt-10 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
        {categories.map((category) => (
          <Button
            key={category}
            variant={category === activeCategory ? "default" : "secondary"}
            className="h-auto min-h-11 whitespace-normal px-3"
            onClick={() => changeCategory(category)}
          >
            {category}
          </Button>
        ))}
      </div>
      <div className="relative mx-auto mt-12 max-w-4xl overflow-hidden rounded-lg bg-muted">
        <img
          src={activeGalleryItem?.src}
          alt={activeGalleryItem?.alt}
          className="aspect-[4/3] w-full object-cover"
        />
        <Button
          variant="secondary"
          size="icon"
          aria-label="Previous gallery image"
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/80"
          onClick={() => stepSlide(-1)}
        >
          <ArrowLeft />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          aria-label="Next gallery image"
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/80"
          onClick={() => stepSlide(1)}
        >
          <ArrowRight />
        </Button>
      </div>
      <div className="mt-5 flex gap-3 overflow-x-auto pb-2">
        {visibleItems.map((item, index) => (
          <button
            key={`${item.src}-${index}`}
            onClick={() => setGalleryIndex(index)}
            aria-label={`Show ${item.alt}`}
            className={`shrink-0 overflow-hidden rounded-md border-2 ${index === safeGalleryIndex ? "border-primary" : "border-transparent"}`}
          >
            <img src={item.src} alt="" className="h-20 w-24 object-cover" loading="lazy" />
          </button>
        ))}
      </div>
    </>
  );
}
