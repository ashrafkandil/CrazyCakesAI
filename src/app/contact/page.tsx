import { CalendarDays, Clock3, Mail, MapPin, Phone } from "lucide-react";
import type { Metadata } from "next";

import { ContactForm } from "@/app/contact/contact-form";
import { SectionHeading } from "@/app/section-heading";

export const metadata: Metadata = {
  title: "Contact | Crazy Cake Art",
  description:
    "Request a custom cake quote from Crazy Cake Art in Chagrin Falls, Ohio. Phone, email and order form.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <section className="bg-blush px-5 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          title="Let’s Create Something Beautiful"
          eyebrow="Ready to bring your vision to life"
        />
        <p className="mx-auto mt-6 max-w-2xl text-center leading-7 text-muted-foreground">
          Get in touch to discuss your custom cake needs. We&apos;re excited to be part of your
          special celebration.
        </p>
        <div className="mt-14 grid gap-12 lg:grid-cols-[1.3fr_.7fr]">
          <ContactForm />
          <aside>
            <h2 className="font-serif text-2xl font-semibold text-primary">Get in Touch</h2>
            <div className="mt-7 space-y-5 text-muted-foreground">
              <a
                href="mailto:fcabakery@gmail.com"
                className="flex items-center gap-3 hover:text-primary"
              >
                <Mail className="h-5 w-5 text-primary" /> fcabakery@gmail.com
              </a>
              <a href="tel:12165718440" className="flex items-center gap-3 hover:text-primary">
                <Phone className="h-5 w-5 text-primary" /> 216.571.8440
              </a>
              <p className="flex items-start gap-3">
                <MapPin className="mt-1 h-5 w-5 shrink-0 text-primary" /> Chagrin Falls, OH 44022
                <br />
                Serving Bainbridge, Solon, Pepper Pike, Twinsburg, Mayfield and nearby areas
              </p>
            </div>
            <h3 className="mt-10 flex items-center gap-3 font-serif text-xl font-semibold">
              <Clock3 className="h-5 w-5 text-primary" /> Business Hours
            </h3>
            <dl className="mt-5 space-y-3 text-sm text-muted-foreground">
              <div className="flex justify-between">
                <dt>Mon–Fri</dt>
                <dd>9:00 AM – 6:00 PM</dd>
              </div>
              <div className="flex justify-between">
                <dt>Saturday</dt>
                <dd>10:00 AM – 4:00 PM</dd>
              </div>
              <div className="flex justify-between">
                <dt>Sunday</dt>
                <dd>By Appointment Only</dd>
              </div>
            </dl>
            <p className="mt-8 flex gap-3 rounded-lg bg-background p-5 text-sm leading-6 text-muted-foreground">
              <CalendarDays className="h-5 w-5 shrink-0 text-primary" /> We&apos;ll respond to your
              inquiry within 24 hours. For urgent requests, please call us directly.
            </p>
          </aside>
        </div>
      </div>
    </section>
  );
}
