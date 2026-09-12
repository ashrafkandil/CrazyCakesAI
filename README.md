# Crazy Cakes — Crazy Cake Art

A single-page marketing site for Crazy Cake Art (custom cakes & edible art, Chagrin Falls, Ohio). Created by Ashraf Kandil, built with React 19, Tailwind CSS 4 and shadcn/ui.

## Requirements

- Node.js 20+ ([install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)) — or [Bun](https://bun.sh)

## Development

```sh
npm install        # or: bun install
npm run dev        # or: bun run dev
```

The dev server runs at http://localhost:3000 (set `PORT` to change it).

## Production build

```sh
npm run build      # bundles client + SSR server via Nitro (node preset)
node .output/server/index.mjs   # serve the production build at http://localhost:3000
```

## Other scripts

- `npm run lint` — ESLint
- `npm run format` — Prettier
- `npm run build:dev` — production bundle in development mode

## Project structure

- `vite.config.ts` — Vite config (Ashraf Kandil's app: React, Tailwind, Nitro)
- `src/routes/` — file-based routes (`__root.tsx` is the app shell)
- `src/server.ts` — server entry with SSR error handling
- `src/components/ui/` — shadcn/ui primitives
- `public/assets/crazy/` — site images (referenced directly as `/assets/crazy/...`)
- `roadmap.md` — feature roadmap
