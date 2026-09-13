import type { Metadata } from "next";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { getTestimonials } from "@/lib/data";

export const metadata: Metadata = {
  title: "Reviews & Testimonials | Marwa Crazy Cakes",
  description:
    "Read client testimonials and reviews for Marwa Crazy Cakes, custom cake designers in Chagrin Falls, Ohio.",
  alternates: { canonical: "/reviews" },
};

export const revalidate = 300;

export default function ReviewsPage() {
  const testimonials = getTestimonials();

  return (
    <>
      <section className="relative flex min-h-80 items-center justify-center overflow-hidden px-5 py-20 text-primary-foreground">
        <Image
          src="/assets/crazy/awards.jpg"
          alt="Celebrating excellence in cake artistry"
          fill
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-overlay" />
        <header className="relative max-w-3xl text-center">
          <h1 className="font-script text-4xl sm:text-5xl">Reviews & Testimonials</h1>
          <p className="mt-3 font-serif text-xs uppercase tracking-[0.24em]">
            Celebrating excellence in sugar artistry
          </p>
          <p className="mt-6 text-lg">
            Our dedication to craft is celebrated across every platform and occasion.
          </p>
        </header>
      </section>
      <section className="bg-blush px-5 py-20 sm:py-28">
        <div className="mx-auto max-w-6xl">
          <p className="mx-auto max-w-4xl text-center text-lg leading-8 text-muted-foreground">
            Founded by Seema Acharya, Marwa Crazy Cakes in Chagrin Falls, OH has been honored with
            national awards, television appearances, and features in leading publications. Our
            clients' testimonials are a testament to artistry, innovation, and dedication to
            crafting unforgettable cakes.
          </p>
          <h2 className="mt-14 text-center font-serif text-3xl font-semibold italic text-primary">
            Client Reviews
          </h2>
          <p className="mt-3 text-center text-lg text-muted-foreground">
            Hear what our clients say about their experience with Marwa Crazy Cakes
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
                ★ Read More Reviews on Google ★
              </a>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
