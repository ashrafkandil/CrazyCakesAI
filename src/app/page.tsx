import { ArrowRight } from "lucide-react";
import Image from "next/image";
import type { Metadata } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { HeroCarousel } from "@/app/hero-carousel";
import { SectionHeading } from "@/app/section-heading";
import { text } from "@/lib/content";
import { getContent } from "@/lib/data";

export const metadata: Metadata = {
  title: "Marwa Crazy Cakes | Custom Cakes & Desserts",
  description:
    "Where imagination meets craftsmanship—luxury cakes sculpted into unforgettable works of art.",
  openGraph: {
    title: "Marwa Crazy Cakes | Custom Cakes & Desserts",
    description:
      "Where imagination meets craftsmanship—luxury cakes sculpted into unforgettable works of art.",
    type: "website",
  },
  alternates: { canonical: "/" },
};

export const revalidate = 300;

const destinationConfig = [
  {
    id: "about",
    href: "/about",
    image: "/assets/crazy/seema.png",
  },
  {
    id: "gallery",
    href: "/gallery",
    image: "/assets/crazy/celebration-1.jpg",
  },
  {
    id: "reviews",
    href: "/reviews",
    image: "/assets/crazy/awards.jpg",
  },
  {
    id: "pricing",
    href: "/pricing",
    image: "/assets/crazy/pricing.jpg",
  },
];

export default async function HomePage() {
  const content = getContent();
  const destinations = destinationConfig.map((item) => ({
    ...item,
    title: text(content, `home.card.${item.id}.title`),
    alt: text(content, `home.card.${item.id}.alt`),
    blurb: text(content, `home.card.${item.id}.blurb`),
  }));

  return (
    <>
      <HeroCarousel content={content} />

      <section className="bg-blush px-5 py-24 sm:py-32">
        <div className="mx-auto max-w-6xl">
          <SectionHeading
            title={text(content, "home.teaser.title")}
            eyebrow={text(content, "home.teaser.eyebrow")}
            as="h2"
          />
          <div className="mt-14 grid gap-6 sm:grid-cols-2">
            {destinations.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group overflow-hidden rounded-lg border border-border bg-background shadow-sm transition-shadow hover:shadow-lg"
              >
                <div className="relative aspect-[16/9] w-full overflow-hidden">
                  <Image
                    src={item.image}
                    alt={item.alt}
                    fill
                    sizes="(max-width: 640px) 100vw, 50vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
                <div className="p-7">
                  <h3 className="font-script text-3xl text-primary">{item.title}</h3>
                  <p className="mt-3 leading-7 text-muted-foreground">{item.blurb}</p>
                  <span className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-primary">
                    {text(content, "home.cards.link")} <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
          <div className="mt-16 text-center">
            <p className="text-lg text-muted-foreground">{text(content, "home.cta.text")}</p>
            <Button asChild size="lg" className="mt-6 min-w-64">
              <Link href="/contact">{text(content, "home.cta.label")}</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
