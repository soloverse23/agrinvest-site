# Phase 0: foundations and audit

Status: **built, waiting for the owner review gate.** Scope and checklist as approved on 2026-11-02.

All work happens in the new folder `/Users/mosiho/Projects/Agrinvest/site/`. Nothing outside it is changed; the proposal app at the Agrinvest root stays as it is.

**A. Repo scaffold**

1. Check the local tools: Node version, npm, git, Docker (for local Postgres), yt-dlp.
2. Create the app with `create-payload-app`: Next.js App Router + Payload 3, the Postgres adapter, TypeScript strict. Then `git init` in `site/` with a clean `.gitignore` (including `.env*` and raw data).
3. Local database: Postgres in Docker via `docker-compose.yml`. If Docker is missing, use a Neon connection string from you. Add `.env.example`.
4. Add Tailwind v4, an empty `design-system/` skeleton (tokens / primitives / patterns folders only, with no visual decisions, since those are Phase 1), Storybook, ESLint + Prettier, Playwright (one smoke test), the Lighthouse CI config and a GitHub Actions CI file (typecheck, lint, build, test).
5. Set up RO/EN routing: `src/app/(frontend)/[locale]/` with a placeholder home and Payload localization (`ro` default, `en`). The admin is at `/admin`.
6. Vercel: a `vercel.json` stub only. Linking the project needs your Vercel account, so I flag it rather than do it.

**B. Project docs** 7. `site/docs/ROADMAP.md`: this roadmap. 8. `site/CLAUDE.md`: conventions (stack, folders, token-only styling, RO/EN and diacritics rules, SEO checklist, definition of done, phase workflow). 9. `site/docs/decisions/0001-stack.md`; `site/README.md`.

**C. Audit and inventory** (scripts in `site/scripts/`, outputs in `site/docs/audit/`) 10. `scripts/crawl/crawl.ts`: read the sitemaps of agrinvest.ro and agrinvestshop.ro and fetch every URL, rate-limited. - Output: `content-inventory.csv` (URL, status, type, title, meta description, H1, canonical, lang, word count, notes such as junk/demo/duplicate). 11. `scripts/audit/woo-export.ts`: fetch all products from the Store API (paginated). - Output: `products-raw.json` + `products-summary.csv` (name, category, price, stock, which fields exist vs are missing). Product images are saved to `data/raw/media/` (gitignored). - No database import; that is Phase 3. 12. `social-inventory.md`: the YouTube channel's video list (via RSS / yt-dlp metadata: title, date, length, views, usable for b-roll?), plus the Facebook, Instagram, TikTok and LinkedIn handles and observations. 13. `keyword-map.csv`: generated from `../src/data/plan.ts` (`audiences`), with columns keyword, audience, cluster, intent, volume tier, difficulty, potential, priority, **new target URL** (per the new IA), and an empty column for Keyword Planner volume. 14. `serp-notes.md`: for the top 40 priority keywords, who ranks, page format, content depth, the gap. Uses Exa/web search; the regional limits of the search tools are noted. 15. `redirect-map.csv`: every crawled URL mapped to its new URL, or 410 for junk and demo pages; status `draft`. 16. `figures-register.md`: every company figure found, with its source URL, any conflicts (for example the two addresses), and status `to confirm`. 17. `ifn.md`: the IFN research (identity, products, terms, competitor benchmark, open questions). 18. `agrinvest-inputs.md`: the request list for Agrinvest (accounts, footage, product prices and stock, IFN confirmations, legal checks). Ready to send.

**Phase 0 verification**

- `npm run build`, `npm run lint` and the typecheck pass.
- `npm run dev` shows `/ro` and `/en` placeholders and the Payload admin at `/admin` (first-user creation works).
- The Playwright smoke test passes; Storybook starts.
- The crawl covers 100% of the sitemap URLs on both domains; 77 products are exported.
- Every CSV opens cleanly; every keyword in `keyword-map.csv` has a target URL.
- The exit gate is the owner's review of `keyword-map.csv`, `redirect-map.csv` and `figures-register.md`.

**Actions needed from the owner during Phase 0:** a Vercel account link; a Neon connection string if Docker isn't available; Keyword Planner access (a Google Ads account) for exact volumes.

## Result (2026-11-02)

**Built**

- The scaffold (A), the docs (B) and the audit (C) are done; the outputs and findings are summarised in `docs/audit/README.md`.
- Verified: typecheck, lint, format check, `next build`, the Vitest integration test, 6 Playwright e2e tests (locale routing + admin) and the Storybook build all pass locally.

**Deviations from the checklist**

- All audit scripts live in `scripts/audit/`, not `scripts/crawl/`.
- An extra `npm run audit:redirects` script generates the redirect map.
- The dev server runs on port 3100, because port 3000 is used by another local project.
- `keywords.ts` loads `../src/data/plan.ts` at runtime, because that file lives outside this repo.

**Open (needs the owner)**

- Vercel project link (no deploy yet, so there is no preview URL).
- Keyword Planner access for exact volumes.
- Review of `keyword-map.csv`, `redirect-map.csv` (15 REVIEW rows) and `figures-register.md`.
- Sending `agrinvest-inputs.md` to Agrinvest.
- Choosing a git remote (GitHub) so CI can run.
