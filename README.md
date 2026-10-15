# Crazy Cakes — Marwa Crazy Cakes

A single-page marketing site for Marwa Crazy Cakes (custom cakes & edible art, Chagrin Falls, Ohio). Created by Ashraf Kandil, built with Next.js (App Router), React 19, Tailwind CSS 4 and shadcn/ui.

## Requirements

- Node.js 22.13+ ([install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)) and either [Bun](https://bun.sh) or npm

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
- `bun run db:seed` — fill an empty database; a no-op once it has data
- `bun run db:seed:force` — reset the database back to the seed (**wipes data**)
- `bun run db:import-images` — re-import the gallery images from `public/assets/crazy/`
- `bun run db:backup` — write a timestamped copy of the database

## Data and the database

The site reads its content from a small SQLite database (`data/crazy-cakes.db` by
default) on every server request. Edit the same database file with any SQLite tool,
commit the edit in that tool, then refresh the page to see it; no app restart,
rebuild, or reseed is needed. An already-open page does not live-update until it
makes another request.

The database is the **source of truth**; `bun run db:seed` is only its starting point.

`bun run db:seed` is **non-destructive**: once the database has content it does
nothing, so it is safe to keep in setup or deploy scripts — it will only ever
populate a fresh, empty database and never overwrite live data.

**Point the database somewhere durable.** Set `DB_PATH` (see `.env.example`) to a
path outside the deploy folder — a mounted volume in production — so a redeploy
replaces the code but not your data:

```sh
DB_PATH=/var/lib/crazy-cakes/crazy-cakes.db
```

WAL mode and a busy timeout are enabled, so the running site and an external SQLite
editor can use the same file at the same time. Use a local path for `DB_PATH` while
developing. Keep `.db`, `-wal`, and `-shm` files out of Git; back up the database
before making schema or bulk data changes.

## Local production deployment

There is no remote deployment configured yet. To build and run the production
server locally in PowerShell, point both the seed and server at the same durable
database file:

```powershell
$env:DB_PATH = "C:\data\crazy-cakes.db"
bun run db:seed             # only initializes an empty database
bun run db:backup
bun run build
bun run start
```

Keep the server running in that terminal and open <http://localhost:3000>. The
`db:seed` command preserves existing application data; `db:seed:force` is
destructive and must not be used as a deployment step. GitHub Actions runs a
production build on pushes and pull requests, but does not deploy. If the site is
hosted later, the host must provide a persistent local disk for SQLite and set
`DB_PATH` to that file; ephemeral/serverless hosting is not supported by this
single-file SQLite setup.

## GitHub Actions

The CI workflow in `.github/workflows/ci.yml` seeds a temporary database and
builds the app. It does not upload the local database or publish or deploy the
site.

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
