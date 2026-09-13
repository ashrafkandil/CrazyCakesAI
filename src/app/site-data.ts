export const navigation = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/about" },
  { label: "Gallery", href: "/gallery" },
  { label: "Reviews", href: "/reviews" },
  { label: "Pricing", href: "/pricing" },
  { label: "Contact", href: "/contact" },
] as const;

export const heroImages = [
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

export const galleryItems = [
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

export const categories = ["All", "Wedding", "Sculpted", "Kids", "Celebrations", "Cupcakes & more"];

export const reviews = [
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

export const prices = [
  ["Custom Cakes", "$150 & up"],
  ["Sculpted Cakes", "$300 & up"],
  ["Wedding Cakes", "$500 & up"],
  ["Cupcakes (per dozen)", "$40 & up"],
];
