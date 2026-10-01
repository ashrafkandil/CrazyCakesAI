"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

type HeroImage = { src: string; alt: string };

/**
 * Carousel that cycles through background images. The hero text and
 * call‑to‑action buttons are rendered on the parent page instead of
 * overlaying the carousel.
 */
export function HeroCarousel({ images }: { images: HeroImage[] }) {
  const [heroIndex, setHeroIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(
      () => setHeroIndex((current) => (current + 1) % images.length),
      6500,
    );
    return () => window.clearInterval(timer);
  }, [images.length]);

  function showSlide(step: number) {
    setHeroIndex((current) => (current + step + images.length) % images.length);
  }

  return (
    <section className="relative -mt-[76px] flex min-h-[100svh] items-center justify-center bg-muted sm:-mt-[88px] sm:min-h-[100svh]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage: "url('/assets/crazy/logo.png')",
          backgroundPosition: "center",
          backgroundRepeat: "repeat",
          backgroundSize: "80px 80px",
        }}
      />
      {images.map((image, index) => (
         <Image
          key={image.src}
          src={image.src}
          alt={image.alt}
          fill
          priority={index === 0}
          loading="eager"
          sizes="100vw"
           // Use object-cover so the image stretches to cover the entire viewport.
           className={`object-cover transition-opacity duration-1000 ${index === heroIndex ? "opacity-100" : "opacity-0"}`}
        />
      ))}
      <div className="absolute inset-0 bg-overlay" />
      <Button
        variant="ghost"
        size="icon"
        aria-label="Previous slide"
        onClick={() => showSlide(-1)}
        className="absolute left-4 z-10 rounded-full border border-primary-foreground/40 bg-overlay-soft text-primary-foreground hover:bg-overlay-strong hover:text-primary-foreground"
      >
        <ArrowLeft />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        aria-label="Next slide"
        onClick={() => showSlide(1)}
        className="absolute right-4 z-10 rounded-full border border-primary-foreground/40 bg-overlay-soft text-primary-foreground hover:bg-overlay-strong hover:text-primary-foreground"
      >
        <ArrowRight />
      </Button>
    </section>
  );
}
