import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Clock3,
  ExternalLink,
  Mail,
  MapPin,
  Menu,
  Phone,
  Upload,
  X,
} from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Crazy Cake Art | Custom Cakes & Desserts" },
      {
        name: "description",
        content:
          "Luxury custom cakes, sculpted cakes, wedding cakes, cupcakes and edible art handcrafted in Chagrin Falls, Ohio.",
      },
      { property: "og:title", content: "Crazy Cake Art | Custom Cakes & Desserts" },
      {
        property: "og:description",
        content:
          "Where imagination meets craftsmanship—luxury cakes sculpted into unforgettable works of art.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Index,
});

const navigation = [
  ["Home", "home"],
  ["About Us", "about"],
  ["Gallery", "gallery"],
  ["Recognitions", "recognitions"],
  ["Pricing", "pricing"],
  ["Contact", "contact"],
] as const;

const heroImages = [
  { src: "/assets/crazy/hero-1.jpg", alt: "Jaw-dropping sculpted cake masterpiece" },
  {
    src: "/assets/crazy/hero-2.jpg",
    alt: "Sophisticated multi-tiered wedding cake with edible flowers",
  },
  { src: "/assets/crazy/hero-3.jpg", alt: "Whimsical sculpted cake with playful design" },
  {
    src: "/assets/crazy/hero-4.jpg",
    alt: "Fine edible detailing with sugar flowers and gold leaf",
  },
];

const galleryItems = [
  {
    src: "/assets/crazy/celebration-1.jpg",
    alt: "Custom architectural celebration cake",
    category: "Celebrations",
  },
  { src: "/assets/crazy/wedding-1.jpg", alt: "Elegant custom wedding cake", category: "Wedding" },
  {
    src: "/assets/crazy/sculpted-1.jpg",
    alt: "Detailed sculpted novelty cake",
    category: "Sculpted",
  },
  { src: "/assets/crazy/kids-1.jpg", alt: "Colorful custom kids cake", category: "Kids" },
  {
    src: "/assets/crazy/cupcakes-1.jpg",
    alt: "Decorated cupcakes and sweet treats",
    category: "Cupcakes & more",
  },
  { src: "/assets/crazy/wedding-2.jpg", alt: "Floral tiered wedding cake", category: "Wedding" },
  { src: "/assets/crazy/sculpted-2.jpg", alt: "Handcrafted sculpted cake", category: "Sculpted" },
  { src: "/assets/crazy/kids-2.jpg", alt: "Playful birthday cake", category: "Kids" },
  {
    src: "/assets/crazy/celebration-2.jpg",
    alt: "Special occasion cake",
    category: "Celebrations",
  },
];

const categories = ["All", "Wedding", "Sculpted", "Kids", "Celebrations", "Cupcakes & more"];

const reviews = [
  {
    initials: "H",
    name: "Heather Vagen",
    date: "9/17/2025",
    quote:
      "We think we had the best wedding cake ever!! Your Legos looked like real Legos!!! The Lego people were so us!!! And the taste of the cake and buttercream, best ever!! We received so many compliments on our cake. You helped make our day perfect, thank you so much!",
  },
  {
    initials: "M",
    name: "Margerita Moore",
    date: "8/4/2025",
    quote:
      "Crazy Cake Art came thru again. I have had several cakes and items and was never disappointed.",
  },
  {
    initials: "E",
    name: "Ed Moore",
    date: "7/30/2025",
    quote:
      "Seema made a cake that looked exactly like my house because our house is 100 years old this year. What a marvelous cake! Everyone was blown away, and the cake was so delicious as well. Just stunning!",
  },
];

const prices = [
  ["Custom Cakes", "$150 & up"],
  ["Sculpted Cakes", "$300 & up"],
  ["Wedding Cakes", "$500 & up"],
  ["Cupcakes (per dozen)", "$40 & up"],
];

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
}

function SectionHeading({ title, eyebrow }: { title: string; eyebrow: string }) {
  return (
    <header className="mx-auto max-w-3xl text-center">
      <h2 className="font-script text-4xl text-primary sm:text-5xl">{title}</h2>
      <p className="mt-3 font-serif text-xs uppercase tracking-[0.26em] text-muted-foreground">
        {eyebrow}
      </p>
    </header>
  );
}

function Index() {
  const [heroIndex, setHeroIndex] = useState(0);
  const [activeCategory, setActiveCategory] = useState("All");
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const timer = window.setInterval(
      () => setHeroIndex((current) => (current + 1) % heroImages.length),
      6500,
    );
    return () => window.clearInterval(timer);
  }, []);

  const visibleItems =
    activeCategory === "All"
      ? galleryItems
      : galleryItems.filter((item) => item.category === activeCategory);
  const safeGalleryIndex = galleryIndex % visibleItems.length;
  const activeGalleryItem = visibleItems[safeGalleryIndex] ?? galleryItems[0];

  function changeCategory(category: string) {
    setActiveCategory(category);
    setGalleryIndex(0);
  }

  function submitForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }

  return (
    <main className="overflow-x-hidden bg-background text-foreground">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-border/60 bg-background/95 shadow-sm backdrop-blur">
        <nav
          aria-label="Main navigation"
          className="relative mx-auto flex h-[76px] max-w-4xl items-center justify-between px-5 sm:h-[88px]"
        >
          <div className="hidden flex-1 items-center justify-end gap-8 pr-16 md:flex">
            {navigation.slice(0, 3).map(([label, id]) => (
              <button
                key={id}
                onClick={() => scrollToSection(id)}
                className="text-sm text-foreground transition-colors hover:text-primary"
              >
                {label}
              </button>
            ))}
          </div>
          <button
            aria-label="Return to top"
            onClick={() => scrollToSection("home")}
            className="absolute left-1/2 top-1 -translate-x-1/2"
          >
            <img
              src="/assets/crazy/logo.png"
              alt="Crazy Cake Art"
              className="h-[72px] w-[72px] rounded-full bg-background object-contain sm:h-[84px] sm:w-[84px]"
            />
          </button>
          <div className="hidden flex-1 items-center gap-8 pl-16 md:flex">
            {navigation.slice(3).map(([label, id]) => (
              <button
                key={id}
                onClick={() => scrollToSection(id)}
                className="text-sm text-foreground transition-colors hover:text-primary"
              >
                {label}
              </button>
            ))}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto md:hidden"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X /> : <Menu />}
          </Button>
        </nav>
        {menuOpen && (
          <div className="grid border-t border-border bg-background px-5 py-4 md:hidden">
            {navigation.map(([label, id]) => (
              <button
                key={id}
                className="border-b border-border/70 py-3 text-left text-sm"
                onClick={() => {
                  scrollToSection(id);
                  setMenuOpen(false);
                }}
              >
                {label}
              </button>
            ))}
          </div>
        )}
      </header>

      <section
        id="home"
        className="relative mt-[76px] flex min-h-[calc(100svh-76px)] items-center justify-center sm:mt-[88px] sm:min-h-[calc(100svh-88px)]"
      >
        {heroImages.map((image, index) => (
          <img
            key={image.src}
            src={image.src}
            alt={image.alt}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${index === heroIndex ? "opacity-100" : "opacity-0"}`}
          />
        ))}
        <div className="absolute inset-0 bg-overlay" />
        <Button
          variant="ghost"
          size="icon"
          aria-label="Previous slide"
          onClick={() => setHeroIndex((heroIndex - 1 + heroImages.length) % heroImages.length)}
          className="absolute left-4 z-10 rounded-full border border-primary-foreground/40 bg-overlay-soft text-primary-foreground hover:bg-overlay-strong hover:text-primary-foreground"
        >
          <ArrowLeft />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Next slide"
          onClick={() => setHeroIndex((heroIndex + 1) % heroImages.length)}
          className="absolute right-4 z-10 rounded-full border border-primary-foreground/40 bg-overlay-soft text-primary-foreground hover:bg-overlay-strong hover:text-primary-foreground"
        >
          <ArrowRight />
        </Button>
        <div className="relative z-10 mx-auto max-w-4xl px-8 text-center text-primary-foreground">
          <h1 className="font-script text-5xl leading-tight sm:text-7xl">
            ✨ YES, Art can be Edible! ✨
          </h1>
          <p className="mx-auto mt-6 max-w-2xl font-serif text-xs uppercase tracking-[0.21em] sm:text-sm">
            Where imagination meets craftsmanship — luxury cakes sculpted into unforgettable works
            of art.
          </p>
          <p className="mx-auto mt-5 max-w-3xl text-base leading-7 sm:text-lg">
            At Crazy Cake Art, we transform imagination into breathtaking cakes — from sculpted
            masterpieces to elegant wedding designs. Each creation is a blend of artistry and
            flavor, crafted to leave a lasting impression.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button size="lg" onClick={() => scrollToSection("gallery")}>
              Explore Our Cakes
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => scrollToSection("contact")}
              className="border-primary-foreground/60 bg-transparent text-primary-foreground hover:bg-primary-foreground/15 hover:text-primary-foreground"
            >
              Request a Custom Design
            </Button>
          </div>
        </div>
      </section>

      <section id="about" className="scroll-mt-20 bg-blush px-5 py-24 sm:py-32">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center font-script text-4xl text-primary sm:text-5xl">
            Seema Acharya — The Artist Behind the Magic
          </h2>
          <div className="mt-14 grid items-center gap-12 md:grid-cols-[1.1fr_.9fr]">
            <div className="space-y-5 text-base leading-8 text-muted-foreground">
              <p>
                Every cake begins with a story. For Seema Acharya, renowned cake artist and founder
                of Crazy Cake Art in Chagrin Falls, OH, that story is one of artistry, imagination,
                and devotion to craft. Her work—spanning sculpted showpieces, towering wedding
                cakes, and avant-garde sugar art—has earned her recognition on Netflix&apos;s Sugar
                Rush, Food Network competitions, and in the pages of Cake Masters Magazine.
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
                the wedding cake tasting is a cherished part of the process—a moment to pause,
                dream, and savor. Guests are welcomed into a warm, personalized consultation where
                they sample flavors, discuss inspirations, and explore designs that reflect their
                unique story.
              </p>
              <p className="mt-4">
                Seema listens with care, sketches ideas, and transforms visions into edible art. The
                process is intimate, refined, and memorable—ensuring that by the time your wedding
                day arrives, the cake feels like it was created exclusively for you.
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
              Crazy Cake Art isn&apos;t just about cake. It&apos;s about wonder, memory, and art
              that you can taste.
            </p>
            <div>
              <h3 className="font-script text-3xl text-primary">Let&apos;s Create Together</h3>
              <Button className="mt-4 min-w-64" onClick={() => scrollToSection("contact")}>
                Begin Your Cake Story
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section id="gallery" className="scroll-mt-20 px-5 py-24 sm:py-32">
        <div className="mx-auto max-w-6xl">
          <SectionHeading title="Our Gallery" eyebrow="Portfolio of custom creations" />
          <p className="mx-auto mt-6 max-w-3xl text-center text-base leading-7">
            Explore our portfolio of custom creations, each one unique and crafted with passion.
            From intimate celebrations to grand events, see how we bring visions to life.
          </p>
          <div className="mt-10 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
            {categories.map((category) => (
              <Button
                key={category}
                variant={category === activeCategory ? "default" : "secondary"}
                className="h-auto min-h-11 whitespace-normal px-3"
                onClick={() => changeCategory(category)}
              >
                {category}
              </Button>
            ))}
          </div>
          <div className="relative mx-auto mt-12 max-w-4xl overflow-hidden rounded-lg bg-muted">
            <img
              src={activeGalleryItem?.src}
              alt={activeGalleryItem?.alt}
              className="aspect-[4/3] w-full object-cover"
            />
            <Button
              variant="secondary"
              size="icon"
              aria-label="Previous gallery image"
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/80"
              onClick={() =>
                setGalleryIndex((safeGalleryIndex - 1 + visibleItems.length) % visibleItems.length)
              }
            >
              <ArrowLeft />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              aria-label="Next gallery image"
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/80"
              onClick={() => setGalleryIndex((safeGalleryIndex + 1) % visibleItems.length)}
            >
              <ArrowRight />
            </Button>
          </div>
          <div className="mt-5 flex gap-3 overflow-x-auto pb-2">
            {visibleItems.map((item, index) => (
              <button
                key={`${item.src}-${index}`}
                onClick={() => setGalleryIndex(index)}
                className={`shrink-0 overflow-hidden rounded-md border-2 ${index === safeGalleryIndex ? "border-primary" : "border-transparent"}`}
              >
                <img src={item.src} alt="" className="h-20 w-24 object-cover" loading="lazy" />
              </button>
            ))}
          </div>
          <div className="mt-14 text-center">
            <p className="text-muted-foreground">Ready to create your own masterpiece?</p>
            <Button className="mt-5" onClick={() => scrollToSection("contact")}>
              Start Your Custom Order
            </Button>
          </div>
        </div>
      </section>

      <section id="recognitions" className="scroll-mt-20 bg-blush">
        <div className="relative flex min-h-80 items-center justify-center overflow-hidden px-5 py-20 text-primary-foreground">
          <img
            src="/assets/crazy/awards.jpg"
            alt="Awards and recognition display"
            className="absolute inset-0 h-full w-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-overlay" />
          <header className="relative max-w-3xl text-center">
            <h2 className="font-script text-4xl sm:text-5xl">Recognitions & Testimonials</h2>
            <p className="mt-3 font-serif text-xs uppercase tracking-[0.24em]">
              Celebrating excellence in sugar artistry
            </p>
            <p className="mt-6 text-lg">
              Our dedication to craft has been recognized across multiple platforms and
              competitions.
            </p>
          </header>
        </div>
        <div className="mx-auto max-w-6xl px-5 py-20 sm:py-28">
          <p className="mx-auto max-w-4xl text-center text-lg leading-8 text-muted-foreground">
            Founded by Seema Acharya, Crazy Cake Art in Chagrin Falls, OH has been honored with
            national awards, television appearances, and features in leading publications. Each
            recognition is a testament to artistry, innovation, and dedication to crafting
            unforgettable cakes.
          </p>
          <article className="mt-14 grid items-center gap-10 md:grid-cols-2">
            <img
              src="/assets/crazy/sculpted-1.jpg"
              alt="Award-winning sculpted cake"
              className="aspect-[4/3] w-full rounded-lg object-cover"
              loading="lazy"
            />
            <div>
              <p className="font-serif text-xs uppercase tracking-[0.22em] text-primary">
                International Cake Exploration Societé
              </p>
              <h3 className="mt-3 font-serif text-2xl font-semibold italic text-primary">
                ICES 2018 — “Mad About Hat” Cake Challenge
              </h3>
              <p className="mt-5 leading-8 text-muted-foreground">
                At ICES 2018, Seema unveiled an Alice-in-Wonderland narrative piece that moved from
                whimsical concept to engineered showpiece—caterpillar to butterfly, sketch to
                sculpture. A competition-grade build that celebrated transformation in both story
                and technique.
              </p>
              <Button asChild variant="outline" className="mt-6">
                <a
                  href="https://www.crazycakeart.com/awards-and-recognitions/"
                  target="_blank"
                  rel="noreferrer"
                >
                  <ExternalLink /> See Seema&apos;s awards page
                </a>
              </Button>
            </div>
          </article>
          <div className="mt-24">
            <h3 className="text-center font-serif text-3xl font-semibold italic text-primary">
              Client Reviews
            </h3>
            <p className="mt-3 text-center text-lg text-muted-foreground">
              Hear what our clients say about their experience with Crazy Cake Art
            </p>
            <div className="mt-9 grid gap-5 md:grid-cols-3">
              {reviews.map((review) => (
                <article
                  key={review.name}
                  className="rounded-lg border border-border bg-background p-6"
                >
                  <div className="flex items-start gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary font-bold text-primary-foreground">
                      {review.initials}
                    </span>
                    <div>
                      <h4 className="font-semibold text-primary">{review.name}</h4>
                      <p className="text-xs text-muted-foreground">{review.date}</p>
                    </div>
                    <span className="ml-auto text-sm text-gold">★★★★★</span>
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
                  href="https://www.google.com/search?q=Crazy+Cake+Art+Reviews"
                  target="_blank"
                  rel="noreferrer"
                >
                  ★ Read More Reviews on Google ★
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section id="pricing" className="scroll-mt-20 px-5 py-24 sm:py-32">
        <div className="mx-auto max-w-6xl">
          <SectionHeading
            title="Cake Pricing"
            eyebrow="Thoughtfully designed for your special event"
          />
          <div className="mt-14 grid items-center gap-12 md:grid-cols-2">
            <div>
              <p className="leading-8 text-muted-foreground">
                Our cakes and other goodies are thoughtfully designed for your special event and are
                individually priced. To give you an idea of what to expect, we have provided
                starting prices for each of our products.
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
                <p className="text-muted-foreground">Have something else in mind?</p>
                <Button onClick={() => scrollToSection("contact")}>Get a quote</Button>
              </div>
            </div>
            <img
              src="/assets/crazy/pricing.jpg"
              alt="Elegant wedding cake with multiple tiers and decorative elements"
              className="aspect-[4/5] w-full rounded-lg object-cover shadow-lg"
              loading="lazy"
            />
          </div>
        </div>
      </section>

      <section id="contact" className="scroll-mt-20 bg-blush px-5 py-24 sm:py-32">
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
            <form
              onSubmit={submitForm}
              className="rounded-lg border border-border bg-background p-6 shadow-sm sm:p-8"
            >
              <h3 className="font-serif text-2xl font-semibold text-primary">
                Request a Custom Quote
              </h3>
              {submitted ? (
                <div className="mt-8 rounded-lg bg-blush p-8 text-center">
                  <h4 className="font-script text-3xl text-primary">Thank you!</h4>
                  <p className="mt-3 text-muted-foreground">
                    Your inquiry is ready. We&apos;ll be in touch within 24 hours.
                  </p>
                </div>
              ) : (
                <div className="mt-7 grid gap-5 sm:grid-cols-2">
                  <label className="text-sm font-medium">
                    Name *<input required className="form-field mt-2" />
                  </label>
                  <label className="text-sm font-medium">
                    Email *<input type="email" required className="form-field mt-2" />
                  </label>
                  <label className="text-sm font-medium">
                    Phone *<input type="tel" required className="form-field mt-2" />
                  </label>
                  <label className="text-sm font-medium">
                    Event Type *
                    <select required className="form-field mt-2">
                      <option value="">Select event type</option>
                      <option>Wedding</option>
                      <option>Birthday</option>
                      <option>Anniversary</option>
                      <option>Corporate</option>
                      <option>Other</option>
                    </select>
                  </label>
                  <label className="text-sm font-medium">
                    Event Date *<input type="date" required className="form-field mt-2" />
                  </label>
                  <label className="text-sm font-medium">
                    Number of Servings *
                    <input type="number" min="1" required className="form-field mt-2" />
                  </label>
                  <label className="text-sm font-medium sm:col-span-2">
                    Event/Delivery Location
                    <input className="form-field mt-2" />
                  </label>
                  <label className="text-sm font-medium sm:col-span-2">
                    <span className="flex items-center gap-2">
                      <Upload className="h-4 w-4" /> Attach image/file (optional)
                    </span>
                    <input
                      type="file"
                      accept="image/*,.pdf,.txt"
                      className="form-field mt-2 file:mr-4 file:border-0 file:bg-secondary file:px-3 file:py-1"
                    />
                  </label>
                  <label className="text-sm font-medium sm:col-span-2">
                    Tell us more about your theme! *
                    <textarea required rows={5} className="form-field mt-2 resize-none" />
                  </label>
                  <Button type="submit" size="lg" className="sm:col-span-2">
                    Send Inquiry
                  </Button>
                </div>
              )}
            </form>
            <aside>
              <h3 className="font-serif text-2xl font-semibold text-primary">Get in Touch</h3>
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
              <h4 className="mt-10 flex items-center gap-3 font-serif text-xl font-semibold">
                <Clock3 className="h-5 w-5 text-primary" /> Business Hours
              </h4>
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
                <CalendarDays className="h-5 w-5 shrink-0 text-primary" /> We&apos;ll respond to
                your inquiry within 24 hours. For urgent requests, please call us directly.
              </p>
            </aside>
          </div>
        </div>
      </section>

      <footer className="bg-footer px-5 py-12 text-footer-foreground">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-8 sm:flex-row">
          <div className="flex items-center gap-4">
            <img
              src="/assets/crazy/logo.png"
              alt="Crazy Cake Art"
              className="h-20 w-20 rounded-full bg-background object-contain"
            />
            <div>
              <p className="font-script text-3xl">Crazy Cake Art</p>
              <p className="mt-1 text-xs uppercase tracking-[0.2em] opacity-70">
                Edible art. Unforgettable moments.
              </p>
            </div>
          </div>
          <div className="text-center text-sm opacity-75 sm:text-right">
            <p>Chagrin Falls, Ohio</p>
            <p className="mt-2">© 2026 Crazy Cake Art. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
