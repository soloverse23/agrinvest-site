# Agrinvest website

The new agrinvest.ro: site, shop, farmer tools, finance and articles, in Romanian and English. Built with Next.js 16 and Payload CMS 3 on Postgres.

## Run locally

```bash
nvm use                  # Node 24 (.nvmrc)
cp .env.example .env     # then set PAYLOAD_SECRET
docker compose up -d     # Postgres on :5432
npm install
npm run dev              # http://localhost:3100 (RO), /en (EN), /admin
```

## Scripts

| Script                                                      | What it does                                          |
| ----------------------------------------------------------- | ----------------------------------------------------- |
| `npm run dev` / `build` / `start`                           | Next.js on port 3100                                  |
| `npm run typecheck` / `lint` / `format`                     | TypeScript, ESLint, Prettier                          |
| `npm run test:int` / `test:e2e`                             | Vitest integration tests, Playwright end-to-end tests |
| `npm run storybook`                                         | Design system at http://localhost:6006                |
| `npm run generate:types` / `generate:importmap`             | Regenerate Payload types and the admin import map     |
| `npm run audit:crawl` / `audit:products` / `audit:keywords` | Phase 0 audit scripts (outputs in `docs/audit/`)      |

## Database changes

Development pushes the schema automatically. Production only changes through migrations:

```bash
npm run migrate:create <name>   # after changing collections; commit src/migrations/
npm run migrate                 # with the production DATABASE_URL, before deploying that code
```

CI fails if the collections and `src/migrations/` disagree. A local push can stop and wait for a yes on a change that may lose data (a column changing type, for example); it never runs in production.

## Deploying

The build reads the database, so every Vercel build first runs `scripts/deploy/prepare-database.sh`: it applies pending migrations and seeds the database only if it is empty.

1. In Vercel, set for Production and Preview: `DATABASE_URL` and `DATABASE_URL_UNPOOLED` (the Neon integration adds both) and `PAYLOAD_SECRET` (`openssl rand -hex 32`). For uploads and photos, connect a Vercel Blob store (`BLOB_READ_WRITE_TOKEN`), or set `R2_BUCKET`, `R2_ENDPOINT`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`. Leave `SITE_INDEXABLE` off until Phase 8.
2. Deploy. The first build with storage uploads the page stills and the old shop's product photos, marked "rights pending". Without storage, pages render without photos.

Preview and Production share one database for now, so a preview build migrates it too. Give previews their own Neon branch before real orders arrive.

## Documents

- `docs/ROADMAP.md`: all phases.
- `docs/phases/`: the detailed plan of each phase.
- `docs/decisions/`: architecture and content decisions.
- `docs/audit/`: the audit of the old sites, keyword map, redirect map, figures register.
