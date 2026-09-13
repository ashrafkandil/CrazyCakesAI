import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/app/section-heading";
import { text } from "@/lib/content";
import { getContent } from "@/lib/data";

export const metadata: Metadata = {
  title: "About Us | Marwa Crazy Cakes",
  description:
    "Meet Seema Acharya, the award-featured cake artist behind Marwa Crazy Cakes in Chagrin Falls, Ohio.",
  alternates: { canonical: "/about" },
};

export const revalidate = 300;

export default function AboutPage() {
  const content = getContent();

  return (
    <section className="bg-blush px-5 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          title={text(content, "about.title")}
          eyebrow={text(content, "about.eyebrow")}
        />
        <h2 className="mt-12 text-center font-script text-4xl text-primary sm:text-5xl">
          {text(content, "about.headline")}
        </h2>
        <div className="mt-14 grid items-center gap-12 md:grid-cols-[1.1fr_.9fr]">
          <div className="space-y-5 text-base leading-8 text-muted-foreground">
            <p>{text(content, "about.intro")}</p>
            <p className="italic">{text(content, "about.introItalic")}</p>
          </div>
          <div className="relative mx-auto aspect-square w-full max-w-md overflow-hidden rounded-lg border-8 border-background shadow-lg">
            <Image
              src="/assets/crazy/seema.png"
              alt={text(content, "about.imageAlt")}
              fill
              sizes="(max-width: 768px) 90vw, 40vw"
              className="object-cover"
            />
          </div>
        </div>
        <div className="mx-auto mt-16 max-w-4xl space-y-11 text-center text-base leading-8 text-muted-foreground">
          <div>
            <h3 className="font-script text-3xl text-primary">
              {text(content, "about.experienceTitle")}
            </h3>
            <p className="mt-4">{text(content, "about.experienceP1")}</p>
            <p className="mt-4">{text(content, "about.experienceP2")}</p>
          </div>
          <div>
            <h3 className="font-script text-3xl text-primary">
              {text(content, "about.communityTitle")}
            </h3>
            <p className="mt-4">{text(content, "about.communityP1")}</p>
          </div>
          <p className="rounded-lg bg-background/65 px-8 py-7 font-medium italic text-primary">
            {text(content, "about.quote")}
          </p>
        </div>
        <div className="mt-14 grid gap-4 sm:grid-cols-2">
          <Button asChild variant="outline" size="lg">
            <Link href="/gallery">{text(content, "about.cta.gallery")}</Link>
          </Button>
          <Button asChild size="lg">
            <Link href="/contact">{text(content, "about.cta.contact")}</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
