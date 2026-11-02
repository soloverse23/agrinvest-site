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

## Documents

- `docs/ROADMAP.md`: all phases.
- `docs/phases/`: the detailed plan of each phase.
- `docs/decisions/`: architecture and content decisions.
- `docs/audit/`: the audit of the old sites, keyword map, redirect map, figures register.
