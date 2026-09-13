"use client";

import { Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { navigation } from "@/app/site-data";

function linkClass(isActive: boolean) {
  return `text-sm transition-colors hover:text-primary ${
    isActive ? "font-medium text-primary" : "text-foreground"
  }`;
}

export function SiteHeader() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  function isActive(href: string) {
    return href === "/" ? pathname === "/" : pathname.startsWith(href);
  }

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border/60 bg-background/95 shadow-sm backdrop-blur">
      <nav
        aria-label="Main navigation"
        className="relative mx-auto flex h-[76px] max-w-4xl items-center justify-between px-5 sm:h-[88px]"
      >
        <div className="hidden flex-1 items-center justify-end gap-8 pr-16 md:flex">
          {navigation.slice(0, 3).map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(item.href) ? "page" : undefined}
              className={linkClass(isActive(item.href))}
            >
              {item.label}
            </Link>
          ))}
        </div>
        <Link
          href="/"
          aria-label="Go to home"
          className="absolute left-1/2 top-1 -translate-x-1/2 rounded-full"
        >
          <Image
            src="/assets/crazy/logo.png"
            alt="Marwa Crazy Cakes"
            width={84}
            height={84}
            priority
            className="h-[72px] w-[72px] rounded-full bg-background object-contain sm:h-[84px] sm:w-[84px]"
          />
        </Link>
        <div className="hidden flex-1 items-center gap-8 pl-16 md:flex">
          {navigation.slice(3).map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(item.href) ? "page" : undefined}
              className={linkClass(isActive(item.href))}
            >
              {item.label}
            </Link>
          ))}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="ml-auto md:hidden"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X /> : <Menu />}
        </Button>
      </nav>
      {menuOpen && (
        <div className="grid border-t border-border bg-background px-5 py-4 md:hidden">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`border-b border-border/70 py-3 text-left text-sm ${
                isActive(item.href) ? "font-medium text-primary" : "text-foreground"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
