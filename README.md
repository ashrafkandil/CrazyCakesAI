# Crazy Cakes — Crazy Cake Art

A single-page marketing site for Crazy Cake Art (custom cakes & edible art, Chagrin Falls, Ohio). Created by Ashraf Kandil, built with Next.js (App Router), React 19, Tailwind CSS 4 and shadcn/ui.

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
