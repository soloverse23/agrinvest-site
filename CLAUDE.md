# Agrinvest website

New agrinvest.ro: public site, shop, farmer tools, finance (Agrinvest Credit IFN) and articles, in Romanian and English. The roadmap is in `docs/ROADMAP.md`. Work one phase at a time: each phase has its plan in `docs/phases/NN-name.md` and its decisions in `docs/decisions/`.

## Stack

- Next.js 16 (App Router, React Server Components) with Payload CMS 3 in the same app; Postgres.
- Node 24 (`.nvmrc`). Run `nvm use` before any npm command.
- Local DB: `docker compose up -d`, then `npm run seed` (idempotent; also clears Next's data cache). Dev server: `npm run dev` on **port 3100**.
- Payload reference: `.claude/skills/payload/SKILL.md`, then `.claude/skills/payload/reference/`.

## Layout

- `src/app/(frontend)/[locale]/`: public pages. `src/app/(payload)/`: admin and API (generated, do not edit).
- `src/collections/`, `src/globals/`: content model. `src/lib/`: seo, schema, feeds, prices, weather, social.
- `src/i18n/config.ts`: locales. `src/proxy.ts`: locale routing.
- `design-system/`: tokens, primitives, patterns, with Storybook stories. App code imports it as `@ds/*`.
- `src/fields/`, `src/blocks/`, `src/access/`: shared Payload fields, page blocks, access rules. `src/lib/content/`: cached data loaders (tags in `src/lib/revalidate.ts`).
- `scripts/`: audit, import and check scripts. `docs/`: roadmap, phases, decisions, audit outputs.

## Rules

- **Locales:** Romanian is the default, served at `/` without a prefix; English at `/en`. `/ro/*` redirects to the unprefixed URL. Every user-facing string exists in both languages.
- **Romanian text:** always correct diacritics with comma below (ș ț, never ş ţ). Slugs have no diacritics.
- **Styling:** only through design-system tokens. No hard-coded colours, sizes or font stacks in components.
- **Content fields:** user-facing text fields in Payload are `localized: true`.
- **SEO on every indexable page:** exactly one H1, unique title and meta description, canonical, hreflang pair + x-default, valid JSON-LD for the page type, internal links to its keyword cluster (`docs/audit/keyword-map.csv`).
- **Performance budget (mobile):** LCP < 2.0 s, CLS < 0.05, INP < 200 ms. Server components by default; client components only for real interactivity.
- **Indexing:** the site stays `noindex` until the launch phase (Phase 8).
- **Facts and numbers** about Agrinvest come from the figures register (Payload global "Figures", rendered with `<Fact k="S1" />`), never typed ad hoc. JSON-LD states a fact only once it is confirmed.
- **Staff access** means `users` accounts only (`src/access`); never test for just `req.user`.
- **Public data reads** use `overrideAccess: false`, so drafts and unpublished contact details never reach a page.
- **Leads** collect phone and email; `notifyLead` stays a no-op until the owner chooses a channel.
- After changing collections: `npm run generate:types`, `npm run generate:importmap` and `npm run migrate:create <name>` (production changes only through `src/migrations/`).

## Definition of done

`npm run typecheck`, `npm run lint`, `npm run format:check`, `npm run build`, `npm run test:int` and `npm run test:e2e` pass; with `npm start` running, `npm run check:seo` reports 0 errors; new components have stories; the phase doc is updated.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
