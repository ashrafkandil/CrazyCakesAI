import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="bg-footer px-5 py-12 text-footer-foreground">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-8 sm:flex-row">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            aria-label="Go to home"
            className="shrink-0 rounded-full transition-transform hover:scale-105"
          >
            <img
              src="/assets/crazy/logo.png"
              alt="Crazy Cake Art"
              className="h-20 w-20 rounded-full bg-background object-contain"
            />
          </Link>
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
  );
}
