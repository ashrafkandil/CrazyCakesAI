"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { heroImages } from "@/app/site-data";

export function HeroCarousel() {
  const [heroIndex, setHeroIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(
      () => setHeroIndex((current) => (current + 1) % heroImages.length),
      6500,
    );
    return () => window.clearInterval(timer);
  }, []);

  function showSlide(step: number) {
    setHeroIndex((current) => (current + step + heroImages.length) % heroImages.length);
  }

  return (
    <section className="relative flex min-h-[calc(100svh-76px)] items-center justify-center sm:min-h-[calc(100svh-88px)]">
      {heroImages.map((image, index) => (
        <img
          key={image.src}
          src={image.src}
          alt={image.alt}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${index === heroIndex ? "opacity-100" : "opacity-0"}`}
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
      <div className="relative z-10 mx-auto max-w-4xl px-8 py-20 text-center text-primary-foreground">
        <h1 className="font-script text-5xl leading-tight sm:text-7xl">
          ✨ YES, Art can be Edible! ✨
        </h1>
        <p className="mx-auto mt-6 max-w-2xl font-serif text-xs uppercase tracking-[0.21em] sm:text-sm">
          Where imagination meets craftsmanship — luxury cakes sculpted into unforgettable works of
          art.
        </p>
        <p className="mx-auto mt-5 max-w-3xl text-base leading-7 sm:text-lg">
          At Crazy Cake Art, we transform imagination into breathtaking cakes — from sculpted
          masterpieces to elegant wedding designs. Each creation is a blend of artistry and flavor,
          crafted to leave a lasting impression.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Button asChild size="lg">
            <Link href="/gallery">Explore Our Cakes</Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="border-primary-foreground/60 bg-transparent text-primary-foreground hover:bg-primary-foreground/15 hover:text-primary-foreground"
          >
            <Link href="/contact">Request a Custom Design</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
