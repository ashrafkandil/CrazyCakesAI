// ArrowRight was previously used in the hero section and is no longer needed.
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import type { Metadata } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { HeroCarousel } from "@/app/hero-carousel";
import { SectionHeading } from "@/app/section-heading";
import { heroImages } from "@/app/site-data";
import { text } from "@/lib/content";
import { getContent } from "@/lib/data";
import { versionedImageUrl } from "@/lib/image-url";

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
    image: "/assets/crazy/Marwa.png",
  },
  {
    id: "gallery",
    href: "/gallery",
    image: "/assets/crazy/celebration-1.JPEG",
  },
  {
    id: "reviews",
    href: "/reviews",
    image: "/assets/crazy/Testimony.png",
  },
  {
    id: "pricing",
    href: "/pricing",
    image: "/assets/crazy/pricing.jpeg",
  },
];

export default async function HomePage() {
  const content = getContent();
  const versionedHeroImages = heroImages.map((image) => ({
    ...image,
    src: versionedImageUrl(image.src),
  }));
  const destinations = destinationConfig.map((item) => ({
    ...item,
    image: versionedImageUrl(item.image),
    title: text(content, `home.card.${item.id}.title`),
    alt: text(content, `home.card.${item.id}.alt`),
    blurb: text(content, `home.card.${item.id}.blurb`),
  }));

   return (
       <> 
       <HeroCarousel images={versionedHeroImages} />

      {/* Hero text section moved below the carousel */}
       <section className="bg-transparent px-5 py-6 sm:py-6">
          <div className="mx-auto max-w-4xl text-center text-primary">
           <h1 className="whitespace-nowrap font-script text-4xl leading-tight sm:text-6xl lg:text-7xl">
             {text(content, "home.hero.title")}
           </h1>
            <p className="mx-auto mt-6 max-w-2xl font-serif text-xs uppercase tracking-[0.21em] sm:text-sm">
             {text(content, "home.hero.tagline")}
           </p>
            <p className="mx-auto mt-5 max-w-3xl text-base leading-7 sm:text-lg">
             {text(content, "home.hero.body")}
           </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/gallery">{text(content, "home.hero.cta.gallery")}</Link>
            </Button>
             <Button
               asChild
               size="lg"
               variant="default"
             >
               <Link href="/contact">{text(content, "home.hero.cta.contact")}</Link>
             </Button>
          </div>
        </div>
      </section>
       <section className="bg-transparent px-5 py-6 sm:py-6">
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
                    className="object-fill"
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
