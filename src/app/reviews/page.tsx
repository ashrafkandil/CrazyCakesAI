import type { Metadata } from "next";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { text } from "@/lib/content";
import { getContent, getTestimonials } from "@/lib/data";
import { versionedImageUrl } from "@/lib/image-url";

export const metadata: Metadata = {
  title: "Reviews & Testimonials | Marwa Crazy Cakes",
  description:
    "Read client testimonials and reviews for Marwa Crazy Cakes, custom cake designers in Chagrin Falls, Ohio.",
  alternates: { canonical: "/reviews" },
};

export const revalidate = 300;

export default function ReviewsPage() {
  const content = getContent();
  const testimonials = getTestimonials();

  return (
    <>
      <section className="relative flex min-h-80 items-center justify-center overflow-hidden px-5 py-20 text-primary-foreground">
        <Image
          src={versionedImageUrl("/assets/crazy/Testimony.png")}
          alt="Celebrating excellence in cake artistry"
          fill
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-overlay" />
         <header className="relative max-w-3xl text-center">
           <h1 className="font-script text-4xl sm:text-5xl text-primary">
             {text(content, "reviews.hero.title")}
           </h1>
           <p className="mt-3 font-serif text-xs uppercase tracking-[0.24em] text-primary">
             {text(content, "reviews.hero.subtitle")}
           </p>
           <p className="mt-6 text-lg text-primary">{text(content, "reviews.hero.body")}</p>
        </header>
      </section>
      <section className="bg-transparent px-5 py-20 sm:py-28">
        <div className="mx-auto max-w-6xl">
          <p className="mx-auto max-w-4xl text-center text-lg leading-8 text-muted-foreground">
            {text(content, "reviews.intro")}
          </p>
          <h2 className="mt-14 text-center font-serif text-3xl font-semibold italic text-primary">
            {text(content, "reviews.sectionTitle")}
          </h2>
          <p className="mt-3 text-center text-lg text-muted-foreground">
            {text(content, "reviews.sectionSubtitle")}
          </p>
          <div className="mt-9 grid gap-5 md:grid-cols-3">
            {testimonials.map((review) => (
              <article
                key={review.id}
                className="rounded-lg border border-border bg-background p-6"
              >
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary font-bold text-primary-foreground">
                    {review.initials}
                  </span>
                  <div>
                    <h3 className="font-semibold text-primary">{review.author}</h3>
                    <p className="text-xs text-muted-foreground">{review.date}</p>
                  </div>
                  <span
                    className="ml-auto text-sm text-gold"
                    aria-label={`${review.rating} out of 5 stars`}
                  >
                    {"★".repeat(review.rating)}
                    <span className="sr-only">{`/ ${review.rating}`}</span>
                  </span>
                </div>
                <p className="mt-5 text-sm italic leading-7 text-muted-foreground">
                  “{review.quote}”
                </p>
              </article>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Button asChild>
              <a
                href="https://www.google.com/search?q=Marwa+Crazy+Cakes+Reviews"
                target="_blank"
                rel="noreferrer"
              >
                {text(content, "reviews.googleLinkText")}
              </a>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
