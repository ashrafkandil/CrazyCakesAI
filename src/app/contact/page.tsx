import {
  Apple,
  CalendarDays,
  Download,
  Mail,
  MapPin,
  Phone,
  Smartphone,
  Share2,
} from "lucide-react";
import type { Metadata } from "next";

import { ContactForm } from "@/app/contact/contact-form";
import { SectionHeading } from "@/app/section-heading";
import { SocialLinks } from "@/app/social-links";
import { text } from "@/lib/content";
import { getContent, getEventTypes } from "@/lib/data";

export const metadata: Metadata = {
  title: "Contact | Marwa Crazy Cakes",
  description:
    "Request a custom cake quote from Marwa Crazy Cakes in Chagrin Falls, Ohio. Phone, email and order form.",
  alternates: { canonical: "/contact" },
};

export const revalidate = 300;

export default function ContactPage() {
  const content = getContent();
  const eventTypes = getEventTypes();

  return (
    <section className="bg-transparent px-5 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          title={text(content, "contact.title")}
          eyebrow={text(content, "contact.eyebrow")}
        />
        <p className="mx-auto mt-6 max-w-2xl text-center leading-7 text-muted-foreground">
          {text(content, "contact.intro")}
        </p>
        <div className="mt-14 grid gap-12 lg:grid-cols-[1.3fr_.7fr]">
          <ContactForm eventTypes={eventTypes} email={text(content, "contact.email")} />
          <aside>
            <h2 className="font-serif text-2xl font-semibold text-primary">
              {text(content, "contact.sidebarHeading")}
            </h2>
            <div className="mt-7 space-y-5 text-muted-foreground">
              <a
                href={`mailto:${text(content, "contact.email")}`}
                className="flex items-center gap-3 hover:text-primary"
              >
                <Mail className="h-5 w-5 text-primary" /> {text(content, "contact.email")}
              </a>
              <a
                href={`tel:${text(content, "contact.phoneHref")}`}
                className="flex items-center gap-3 hover:text-primary"
              >
                <Phone className="h-5 w-5 text-primary" /> {text(content, "contact.phone")}
              </a>
              <p className="flex items-start gap-3">
                <MapPin className="mt-1 h-5 w-5 shrink-0 text-primary" />{" "}
                {text(content, "contact.address")}
                <br />
                {text(content, "contact.serviceArea")}
              </p>
            </div>
            <h3 className="mt-10 flex items-center gap-3 font-serif text-xl font-semibold">
              <Share2 className="h-5 w-5 text-primary" /> {text(content, "contact.followUs")}
            </h3>
            <SocialLinks variant="pill" className="mt-4" />
            <p className="mt-8 flex gap-3 rounded-lg bg-background p-5 text-sm leading-6 text-muted-foreground">
              <CalendarDays className="h-5 w-5 shrink-0 text-primary" />{" "}
              {text(content, "contact.responseNote")}
            </p>

            <div className="mt-10 space-y-4">
              <h3 className="flex items-center gap-3 font-serif text-xl font-semibold">
                <Download className="h-5 w-5 text-primary" /> {text(content, "contact.appHeading")}
              </h3>
              <p className="text-sm text-muted-foreground">{text(content, "contact.appBody")}</p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <a
                  href="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-md bg-black px-4 py-2 text-white hover:bg-gray-800 transition-colors"
                >
                  <Apple className="h-5 w-5" />
                  <span className="text-sm font-medium">
                    {text(content, "contact.appStoreLabel")}
                  </span>
                </a>
                <a
                  href="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700 transition-colors"
                >
                  <Smartphone className="h-5 w-5" />
                  <span className="text-sm font-medium">
                    {text(content, "contact.googlePlayLabel")}
                  </span>
                </a>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
