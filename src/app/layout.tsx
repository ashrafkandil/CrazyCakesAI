import type { Metadata } from "next";
import type { ReactNode } from "react";

import { AvatarWidget } from "@/app/assistant/avatar-widget";
import { SiteFooter } from "@/app/site-footer";
import { SiteHeader } from "@/app/site-header";
import { versionedImageUrl } from "@/lib/image-url";

import "./globals.css";

export const metadata: Metadata = {
  title: "Marwa Crazy Cakes",
  description: "Custom cakes and edible art in Chagrin Falls, Ohio.",
  authors: [{ name: "Marwa Crazy Cakes" }],
  openGraph: {
    title: "Marwa Crazy Cakes",
    description: "Luxury cakes sculpted into unforgettable works of art.",
    type: "website",
  },
  twitter: { card: "summary_large_image" },
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Crimson+Text:ital,wght@0,400;0,600;1,400;1,600&family=Dancing+Script:wght@400;500;600&family=Inter:wght@400;500;600;700&display=swap"
        />
      </head>
      <body className="bg-background text-foreground">
        <SiteHeader logoSrc={versionedImageUrl("/assets/crazy/logo.png")} />
        <main className="overflow-x-hidden pt-[76px] sm:pt-[88px]">{children}</main>
        <SiteFooter />
        <AvatarWidget />
      </body>
    </html>
  );
}
