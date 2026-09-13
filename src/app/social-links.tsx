import { Instagram } from "lucide-react";
import type { ReactNode } from "react";

import { socialLinks } from "@/app/site-data";

const brandIcons: Record<string, { display: string; icon: ReactNode }> = {
  Instagram: {
    display: "Instagram",
    icon: <Instagram className="h-4 w-4" aria-hidden="true" />,
  },
  TikTok: {
    display: "TikTok",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="h-4 w-4">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
      </svg>
    ),
  },
  X: {
    display: "X (Twitter)",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="h-4 w-4">
        <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.562-6.638 7.562H.474l8.6-9.83L0 1.154h7.594l5.24 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
      </svg>
    ),
  },
};

const variants = {
  circle:
    "inline-flex h-9 w-9 items-center justify-center rounded-full border border-current/25 transition hover:scale-110 hover:border-current/60",
  pill: "inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium transition-colors hover:border-primary hover:text-primary",
};

export function SocialLinks({
  variant = "circle",
  className = "",
}: {
  variant?: keyof typeof variants;
  className?: string;
}) {
  return (
    <div className={`flex flex-wrap items-center gap-3 ${className}`}>
      {socialLinks.map((social) => {
        const brand = brandIcons[social.label];
        if (!brand) return null;
        return (
          <a
            key={social.label}
            href={social.href}
            target="_blank"
            rel="noreferrer"
            aria-label={`Marwa Crazy Cakes on ${brand.display}`}
            className={variants[variant]}
          >
            {brand.icon}
            {variant === "pill" && brand.display}
          </a>
        );
      })}
    </div>
  );
}
