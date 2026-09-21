import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { prices } from "@/app/site-data";
import { SectionHeading } from "@/app/section-heading";
import { text } from "@/lib/content";
import { getContent } from "@/lib/data";

export const metadata: Metadata = {
  title: "Pricing | Marwa Crazy Cakes",
  description:
    "Starting prices for custom cakes, sculpted cakes, wedding cakes and cupcakes by Marwa Crazy Cakes.",
  alternates: { canonical: "/pricing" },
};

export const revalidate = 300;

export default function PricingPage() {
  const content = getContent();

  return (
    <section className="px-5 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          title={text(content, "pricing.title")}
          eyebrow={text(content, "pricing.eyebrow")}
        />
        <div className="mt-14 grid items-center gap-12 md:grid-cols-2">
          <div>
            <p className="leading-8 text-muted-foreground">
              {text(content, "pricing.intro")}
            </p>
            <div className="mt-8 divide-y divide-border border-y border-border">
              {prices.map(([label, price]) => (
                <div key={label} className="flex items-center justify-between py-5">
                  <span className="font-serif text-lg">{label}</span>
                  <strong className="text-primary">{price}</strong>
                </div>
              ))}
            </div>
            <div className="mt-8 flex items-center justify-between gap-5">
              <p className="text-muted-foreground">{text(content, "pricing.quotePrompt")}</p>
              <Button asChild>
                <Link href="/contact">{text(content, "pricing.quoteButton")}</Link>
              </Button>
            </div>
          </div>
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-lg shadow-lg">
            <Image
              src="/assets/crazy/pricing.jpg"
              alt={text(content, "pricing.imageAlt")}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
