import type { Metadata } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/app/section-heading";

export const metadata: Metadata = {
  title: "About Us | Crazy Cake Art",
  description:
    "Meet Seema Acharya, the award-featured cake artist behind Crazy Cake Art in Chagrin Falls, Ohio.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <section className="bg-blush px-5 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <SectionHeading title="About Us" eyebrow="The artist, the story, the studio" />
        <h2 className="mt-12 text-center font-script text-4xl text-primary sm:text-5xl">
          Seema Acharya — The Artist Behind the Magic
        </h2>
        <div className="mt-14 grid items-center gap-12 md:grid-cols-[1.1fr_.9fr]">
          <div className="space-y-5 text-base leading-8 text-muted-foreground">
            <p>
              Every cake begins with a story. For Seema Acharya, renowned cake artist and founder of
              Crazy Cake Art in Chagrin Falls, OH, that story is one of artistry, imagination, and
              devotion to craft. Her work—spanning sculpted showpieces, towering wedding cakes, and
              avant-garde sugar art—has earned her recognition on Netflix&apos;s Sugar Rush, Food
              Network competitions, and in the pages of Cake Masters Magazine.
            </p>
            <p className="italic">
              Seema is not just a cake designer—she is a storyteller. Her sugar creations are
              celebrated for their sculptural elegance, meticulous detail, and the ability to
              capture the essence of every occasion.
            </p>
          </div>
          <img
            src="/assets/crazy/seema.png"
            alt="Seema Acharya, cake designer and sugar artist, founder of Crazy Cake Art"
            className="mx-auto aspect-square w-full max-w-md rounded-lg border-8 border-background object-cover shadow-lg"
          />
        </div>
        <div className="mx-auto mt-16 max-w-4xl space-y-11 text-center text-base leading-8 text-muted-foreground">
          <div>
            <h3 className="font-script text-3xl text-primary">An Experience, Not Just a Cake</h3>
            <p className="mt-4">
              At Crazy Cake Art, the journey is as meaningful as the cake itself. For our couples,
              the wedding cake tasting is a cherished part of the process—a moment to pause, dream,
              and savor. Guests are welcomed into a warm, personalized consultation where they
              sample flavors, discuss inspirations, and explore designs that reflect their unique
              story.
            </p>
            <p className="mt-4">
              Seema listens with care, sketches ideas, and transforms visions into edible art. The
              process is intimate, refined, and memorable—ensuring that by the time your wedding day
              arrives, the cake feels like it was created exclusively for you.
            </p>
          </div>
          <div>
            <h3 className="font-script text-3xl text-primary">
              Rooted in Community, Licensed for Trust
            </h3>
            <p className="mt-4">
              Crazy Cake Art is proudly local and licensed, serving Chagrin Falls and the greater
              Cleveland community with artistry backed by professionalism. Each creation is made
              with the highest standards of safety, quality, and care.
            </p>
          </div>
          <p className="rounded-lg bg-background/65 px-8 py-7 font-medium italic text-primary">
            Crazy Cake Art isn&apos;t just about cake. It&apos;s about wonder, memory, and art that
            you can taste.
          </p>
        </div>
        <div className="mt-14 grid gap-4 sm:grid-cols-2">
          <Button asChild variant="outline" size="lg">
            <Link href="/gallery">See Our Work</Link>
          </Button>
          <Button asChild size="lg">
            <Link href="/contact">Begin Your Cake Story</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
