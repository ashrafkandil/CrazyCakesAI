import { DatabaseSync } from "node:sqlite";
import { mkdirSync, readFileSync, existsSync, rmSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dbDir = path.join(root, "data");
const dbPath = path.join(dbDir, "crazy-cakes.db");

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

const testimonials = [
  {
    initials: "H",
    author: "Heather Vagen",
    date: "9/17/2025",
    quote:
      "We think we had the best wedding cake ever!! Your Legos looked like real Legos!!! The Lego people were so us!!! And the taste of the cake and buttercream, best ever!! We received so many compliments on our cake. You helped make our day perfect, thank you so much!",
  },
  {
    initials: "M",
    author: "Margerita Moore",
    date: "8/4/2025",
    quote:
      "Marwa Crazy Cakes came thru again. I have had several cakes and items and was never disappointed.",
  },
  {
    initials: "E",
    author: "Ed Moore",
    date: "7/30/2025",
    quote:
      "Seema made a cake that looked exactly like my house because our house is 100 years old this year. What a marvelous cake! Everyone was blown away, and the cake was so delicious as well. Just stunning!",
  },
];

const content = {
  "home.hero.title": "✨ YES, Art can be Edible! ✨",
  "home.hero.tagline":
    "Where imagination meets craftsmanship — luxury cakes sculpted into unforgettable works of art.",
  "home.hero.body":
    "At Marwa Crazy Cakes, we transform imagination into breathtaking cakes — from sculpted masterpieces to elegant wedding designs. Each creation is a blend of artistry and flavor, crafted to leave a lasting impression.",
  "home.hero.cta.gallery": "Explore Our Cakes",
  "home.hero.cta.contact": "Request a Custom Design",
  "home.teaser.title": "Explore the Studio",
  "home.teaser.eyebrow": "Every visit begins with a little wonder",
  "home.cards.link": "Visit page",
  "home.card.about.title": "About Us",
  "home.card.about.alt": "Seema Acharya, founder and cake artist at Marwa Crazy Cakes",
  "home.card.about.blurb":
    "Meet Seema Acharya, the storyteller and sugar artist behind every creation.",
  "home.card.gallery.title": "Gallery",
  "home.card.gallery.alt": "Custom architectural celebration cake",
  "home.card.gallery.blurb": "Browse sculpted showpieces, wedding cakes, cupcakes and edible art.",
  "home.card.reviews.title": "Reviews",
  "home.card.reviews.alt": "Celebrating excellence in cake artistry",
  "home.card.reviews.blurb":
    "Read what couples and families say about their Marwa Crazy Cakes experience.",
  "home.card.pricing.title": "Pricing",
  "home.card.pricing.alt": "Elegant tiered wedding cake",
  "home.card.pricing.blurb":
    "Starting prices for custom, sculpted and wedding cakes, plus cupcakes.",
  "home.cta.text": "Ready to create your own masterpiece?",
  "home.cta.label": "Start Your Custom Order",
  "about.title": "About Us",
  "about.eyebrow": "The artist, the story, the studio",
  "about.headline": "Seema Acharya — The Artist Behind the Magic",
  "about.intro":
    "Every cake begins with a story. For Seema Acharya, renowned cake artist and founder of Marwa Crazy Cakes in Chagrin Falls, OH, that story is one of artistry, imagination, and devotion to craft. Her work—spanning sculpted showpieces, towering wedding cakes, and avant-garde sugar art—has earned her recognition on Netflix's Sugar Rush, Food Network competitions, and in the pages of Cake Masters Magazine.",
  "about.introItalic":
    "Seema is not just a cake designer—she is a storyteller. Her sugar creations are celebrated for their sculptural elegance, meticulous detail, and the ability to capture the essence of every occasion.",
  "about.imageAlt": "Seema Acharya, cake designer and sugar artist, founder of Marwa Crazy Cakes",
  "about.experienceTitle": "An Experience, Not Just a Cake",
  "about.experienceP1":
    "At Marwa Crazy Cakes, the journey is as meaningful as the cake itself. For our couples, the wedding cake tasting is a cherished part of the process—a moment to pause, dream, and savor. Guests are welcomed into a warm, personalized consultation where they sample flavors, discuss inspirations, and explore designs that reflect their unique story.",
  "about.experienceP2":
    "Seema listens with care, sketches ideas, and transforms visions into edible art. The process is intimate, refined, and memorable—ensuring that by the time your wedding day arrives, the cake feels like it was created exclusively for you.",
  "about.communityTitle": "Rooted in Community, Licensed for Trust",
  "about.communityP1":
    "Marwa Crazy Cakes is proudly local and licensed, serving Chagrin Falls and the greater Cleveland community with artistry backed by professionalism. Each creation is made with the highest standards of safety, quality, and care.",
  "about.quote":
    "Marwa Crazy Cakes isn't just about cake. It's about wonder, memory, and art that you can taste.",
  "about.cta.gallery": "See Our Work",
  "about.cta.contact": "Begin Your Cake Story",
  "reviews.hero.title": "Reviews & Testimonials",
  "reviews.hero.subtitle": "Celebrating excellence in sugar artistry",
  "reviews.hero.body": "Our dedication to craft is celebrated across every platform and occasion.",
  "reviews.intro": "Founded by Seema Acharya, Marwa Crazy Cakes in Chagrin Falls, OH has been honored with national awards, television appearances, and features in leading publications. Our clients' testimonials are a testament to artistry, innovation, and dedication to crafting unforgettable cakes.",
  "reviews.sectionTitle": "Client Reviews",
  "reviews.sectionSubtitle": "Hear what our clients say about their experience with Marwa Crazy Cakes",
  "reviews.googleLinkText": "★ Read More Reviews on Google ★",
  "pricing.title": "Cake Pricing",
  "pricing.eyebrow": "Thoughtfully designed for your special event",
  "pricing.intro": "Our cakes and other goodies are thoughtfully designed for your special event and are individually priced. To give you an idea of what to expect, we have provided starting prices for each of our products.",
  "pricing.imageAlt": "Elegant wedding cake with multiple tiers and decorative elements",
  "pricing.quotePrompt": "Have something else in mind?",
  "pricing.quoteButton": "Get a quote",
  "contact.title": "Let's Create Something Beautiful",
  "contact.eyebrow": "Ready to bring your vision to life",
  "contact.intro": "Get in touch to discuss your custom cake needs. We're excited to be part of your special celebration.",
  "contact.sidebarHeading": "Get in Touch",
  "contact.followUs": "Follow Us",
  "contact.responseNote": "We'll respond to your inquiry within 24 hours. For urgent requests, please call us directly.",
  "contact.appHeading": "Get Our App",
  "contact.appBody": "Download the Maarwa Crazy Cakes app for a seamless ordering experience.",
  "contact.appStoreLabel": "App Store",
  "contact.googlePlayLabel": "Google Play",
};

function imageDimensions(srcPath) {
  const buffer = readFileSync(srcPath);
  if (buffer.subarray(0, 8).toString("hex") === "89504e470d0a1a0a") {
    return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
  }
  let offset = 2;
  while (offset < buffer.length) {
    if (buffer[offset] !== 0xff) break;
    const marker = buffer[offset + 1];
    const size = buffer.readUInt16BE(offset + 2);
    if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
      return { height: buffer.readUInt16BE(offset + 5), width: buffer.readUInt16BE(offset + 7) };
    }
    offset += 2 + size;
  }
  return { width: null, height: null };
}

function slugify(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

mkdirSync(dbDir, { recursive: true });
for (const suffix of ["", "-wal", "-shm"]) {
  const file = dbPath + suffix;
  if (existsSync(file)) rmSync(file);
}

const db = new DatabaseSync(dbPath);

db.exec(`
  DROP TABLE IF EXISTS content;
  DROP TABLE IF EXISTS event_types;
  DROP TABLE IF EXISTS images;
  DROP TABLE IF EXISTS testimonials;
  DROP TABLE IF EXISTS categories;

  CREATE TABLE categories (
    id INTEGER PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    sort INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE images (
    id INTEGER PRIMARY KEY,
    src TEXT NOT NULL,
    alt TEXT NOT NULL,
    category_id INTEGER NOT NULL REFERENCES categories(id),
    width INTEGER,
    height INTEGER,
    sort INTEGER NOT NULL DEFAULT 0,
    featured INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE testimonials (
    id INTEGER PRIMARY KEY,
    author TEXT NOT NULL,
    initials TEXT NOT NULL,
    review_date TEXT NOT NULL,
    quote TEXT NOT NULL,
    rating INTEGER NOT NULL DEFAULT 5,
    published INTEGER NOT NULL DEFAULT 1,
    sort INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE content (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );

  CREATE TABLE event_types (
    id INTEGER PRIMARY KEY,
    label TEXT NOT NULL UNIQUE,
    sort INTEGER NOT NULL DEFAULT 0
  );

  CREATE INDEX idx_images_category ON images(category_id);
`);

const categoryOrder = [...new Set(galleryItems.map((item) => item.category))];
const insertCategory = db.prepare("INSERT INTO categories (slug, title, sort) VALUES (?, ?, ?)");
const categoryIds = new Map();
categoryOrder.forEach((title, index) => {
  const info = insertCategory.run(slugify(title), title, index);
  categoryIds.set(title, Number(info.lastInsertRowid));
});

const insertImage = db.prepare(
  "INSERT INTO images (src, alt, category_id, width, height, sort, featured) VALUES (?, ?, ?, ?, ?, ?, ?)",
);
const featuredSeen = new Set();
galleryItems.forEach((item, index) => {
  const { width, height } = imageDimensions(path.join(root, "public", item.src));
  const featured = featuredSeen.has(item.category) ? 0 : 1;
  featuredSeen.add(item.category);
  insertImage.run(
    item.src,
    item.alt,
    categoryIds.get(item.category),
    width,
    height,
    index,
    featured,
  );
});

const insertTestimonial = db.prepare(
  "INSERT INTO testimonials (author, initials, review_date, quote, rating, published, sort) VALUES (?, ?, ?, ?, ?, ?, ?)",
);
testimonials.forEach((review, index) => {
  insertTestimonial.run(review.author, review.initials, review.date, review.quote, 5, 1, index);
});

const eventTypes = ["Wedding", "Birthday", "Anniversary", "Corporate", "Other"];

const insertContent = db.prepare("INSERT INTO content (key, value) VALUES (?, ?)");
for (const [key, value] of Object.entries(content)) {
  insertContent.run(key, value);
}

const insertEventType = db.prepare("INSERT INTO event_types (label, sort) VALUES (?, ?)");
eventTypes.forEach((label, index) => insertEventType.run(label, index));

const counts = {
  categories: db.prepare("SELECT COUNT(*) AS n FROM categories").get().n,
  images: db.prepare("SELECT COUNT(*) AS n FROM images").get().n,
  testimonials: db.prepare("SELECT COUNT(*) AS n FROM testimonials").get().n,
  content: db.prepare("SELECT COUNT(*) AS n FROM content").get().n,
  eventTypes: db.prepare("SELECT COUNT(*) AS n FROM event_types").get().n,
};

db.close();
console.log(`Seeded ${dbPath}`);
console.log(
  `categories=${counts.categories} images=${counts.images} testimonials=${counts.testimonials} content=${counts.content} eventTypes=${counts.eventTypes}`,
);
