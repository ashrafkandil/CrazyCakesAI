import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { HeroCarousel } from "@/app/hero-carousel";
import { SectionHeading } from "@/app/section-heading";

export const metadata: Metadata = {
  title: "Crazy Cake Art | Custom Cakes & Desserts",
  description:
    "Where imagination meets craftsmanship—luxury cakes sculpted into unforgettable works of art.",
  openGraph: {
    title: "Crazy Cake Art | Custom Cakes & Desserts",
    description:
      "Where imagination meets craftsmanship—luxury cakes sculpted into unforgettable works of art.",
    type: "website",
  },
  alternates: { canonical: "/" },
};

const destinations = [
  {
    title: "About Us",
    href: "/about",
    image: "/assets/crazy/seema.png",
    alt: "Seema Acharya, founder and cake artist at Crazy Cake Art",
    blurb: "Meet Seema Acharya, the storyteller and sugar artist behind every creation.",
  },
  {
    title: "Gallery",
    href: "/gallery",
    image: "/assets/crazy/celebration-1.jpg",
    alt: "Custom architectural celebration cake",
    blurb: "Browse sculpted showpieces, wedding cakes, cupcakes and edible art.",
  },
  {
    title: "Reviews",
    href: "/reviews",
    image: "/assets/crazy/awards.jpg",
    alt: "Celebrating excellence in cake artistry",
    blurb: "Read what couples and families say about their Crazy Cake Art experience.",
  },
  {
    title: "Pricing",
    href: "/pricing",
    image: "/assets/crazy/pricing.jpg",
    alt: "Elegant tiered wedding cake",
    blurb: "Starting prices for custom, sculpted and wedding cakes, plus cupcakes.",
  },
];

export default function HomePage() {
  return (
    <>
      <HeroCarousel />

      <section className="bg-blush px-5 py-24 sm:py-32">
        <div className="mx-auto max-w-6xl">
          <SectionHeading
            title="Explore the Studio"
            eyebrow="Every visit begins with a little wonder"
            as="h2"
          />
          <div className="mt-14 grid gap-6 sm:grid-cols-2">
            {destinations.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group overflow-hidden rounded-lg border border-border bg-background shadow-sm transition-shadow hover:shadow-lg"
              >
                <img
                  src={item.image}
                  alt={item.alt}
                  className="aspect-[16/9] w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="p-7">
                  <h3 className="font-script text-3xl text-primary">{item.title}</h3>
                  <p className="mt-3 leading-7 text-muted-foreground">{item.blurb}</p>
                  <span className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-primary">
                    Visit page <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
          <div className="mt-16 text-center">
            <p className="text-lg text-muted-foreground">Ready to create your own masterpiece?</p>
            <Button asChild size="lg" className="mt-6 min-w-64">
              <Link href="/contact">Start Your Custom Order</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
