# Crazy Cakes — Marwa Crazy Cakes

A single-page marketing site for Marwa Crazy Cakes (custom cakes & edible art, Chagrin Falls, Ohio). Created by Ashraf Kandil, built with Next.js (App Router), React 19, Tailwind CSS 4 and shadcn/ui.

## Requirements

- Node.js 20+ ([install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)) — or [Bun](https://bun.sh)

## Development

```sh
bun install        # or: npm install
bun run dev        # or: npm run dev
```

The dev server runs at http://localhost:3000.

## Production build

```sh
bun run build      # produces an optimized Next.js production build
bun run start      # serve the production build at http://localhost:3000
```

## Other scripts

- `bun run lint` — ESLint
- `bun run format` — Prettier

## Project structure

- `next.config.ts` — Next.js config
- `src/app/` — App Router: `layout.tsx` (app shell), `page.tsx` (home), `globals.css`, `not-found.tsx`, `error.tsx`
- `src/app/home-page.tsx` — client component with the single-page marketing UI
- `src/components/ui/` — shadcn/ui primitives
- `public/assets/crazy/` — site images (referenced directly as `/assets/crazy/...`)
- `roadmap.md` — feature roadmap

## AI Avatar Assistant ("Sprinkles")

A free, talking AI assistant lives in the bottom-right corner of every page. Visitors can type or
speak (English or Arabic), and it answers out loud, opens the right gallery category or page, and
pre-fills the quote form. It is powered by Google Gemini's free tier; voice and the avatar run in the browser.

1. Get a free key at <https://aistudio.google.com/apikey>.
2. `cp .env.example .env.local` and set `GEMINI_API_KEY`.
3. `bun install && bun run db:seed && bun run dev`, then open <http://localhost:3000> in Chrome or Edge.

Full details: [docs/ai-avatar.md](docs/ai-avatar.md).
