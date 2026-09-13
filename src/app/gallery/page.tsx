import type { Metadata } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { GalleryExplorer } from "@/app/gallery/gallery-explorer";
import { SectionHeading } from "@/app/section-heading";

export const metadata: Metadata = {
  title: "Gallery | Crazy Cake Art",
  description:
    "Explore custom sculpted cakes, wedding cakes, kids cakes, cupcakes and edible art by Crazy Cake Art.",
  alternates: { canonical: "/gallery" },
};

export default function GalleryPage() {
  return (
    <section className="px-5 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <SectionHeading title="Our Gallery" eyebrow="Portfolio of custom creations" />
        <p className="mx-auto mt-6 max-w-3xl text-center text-base leading-7">
          Explore our portfolio of custom creations, each one unique and crafted with passion. From
          intimate celebrations to grand events, see how we bring visions to life.
        </p>
        <GalleryExplorer />
        <div className="mt-14 text-center">
          <p className="text-muted-foreground">Ready to create your own masterpiece?</p>
          <Button asChild className="mt-5">
            <Link href="/contact">Start Your Custom Order</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
