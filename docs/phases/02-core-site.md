# Phase 2: content model and core site

Status: **planned and approved 2026-11-03; 2.1 next.**

## Context

Phase 0 (scaffold, audit) and Phase 1.1–1.2 (direction B "Câmp", revised; tokens, fonts, logo, first primitives and patterns) are built. The site itself is still one placeholder page, and Payload has only `Users` and `Media`. Phase 2 (ROADMAP §Phase 2) turns this into the real brand and service site: the content model, the core pages, and the complete SEO / AEO plumbing that every later phase (shop, finance, tools, articles) builds on.

Decisions taken in this session:

- **Phase 1 gap:** the components and page templates the core pages need are built here, inside `design-system/`, with stories. The Phase 1.5 review happens on real pages instead of mock-ups. Shop, tool and article templates stay in their own phases.
- **Unconfirmed data:** the Figures register and the Bases are seeded with what the audit found, and each value keeps its status. The noindex preview shows them with a visible "to confirm" marker. A launch check (used in Phase 8) fails while any value shown on a page is unconfirmed. Missing base fields stay empty, and the base pages still look complete without them.
- **Split:** three sub-phases. Each one gets its own session and gate: **2.1 model + plumbing → 2.2 core pages → 2.3 English, analytics, full pass**.
- **Leads:** every form collects both **phone and email**. Leads are stored in Payload and routed by type to a named person, with that person's email and phone. How staff get notified is decided later. For now, notification is a single no-op function that a later phase can fill in.

## Setup

- Commit the open Phase 1 work on `phase-1/design-system`, then branch `phase-2/core-site` from it. Phase 1 merges to `main` at its own gate.
- Keep this doc updated per sub-phase. Decisions go in `docs/decisions/0003…`.
- Before writing code, read `.claude/skills/payload/SKILL.md` and the Next 16 guides in `node_modules/next/dist/docs/` (Metadata, sitemaps, `generateStaticParams`, ISR, server actions, `proxy`).

---

## 2.1 Content model and SEO plumbing (detailed)

### A. Payload content model (`src/collections/`, `src/globals/`)

User-facing text fields are `localized: true`. Pages, Bases and Crops have drafts and versions. Access rules: public read only for published content; Leads can be created through the server action only and read by staff only.

| Collection / global                | Key fields                                                                                                                                                                                                                                                                                                                                                                             |
| ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Pages**                          | title, localized `slug` and computed localized `path` (a parent relation builds `/depozitare/uscare`), `locales` (which languages the page exists in, since EN is business-led rather than a mirror), `layout` (blocks), `seo` group (title, description, image, noindex), `summary` (the AEO answer paragraph), `faq`, `updatedAt` shown on the page                                  |
| **Counties**                       | name, slug (no diacritics), code, centroid (lat/lng), outline ref for the map                                                                                                                                                                                                                                                                                                          |
| **Bases**                          | name, slug, county →, capacity (t), services (reception, drying, cleaning, weighing), address, geo, phone, contact →, hours, photos, intro, faq, `status` per field group (`to confirm` / `confirmed`)                                                                                                                                                                                 |
| **Crops**                          | name, slug (`grau`, `porumb`, `floarea-soarelui`, `rapita`, `orz`), icon key, quality standards (moisture, hectolitre mass…), intro, faq. Reused later by the shop, prices and guides                                                                                                                                                                                                  |
| **People**                         | name, role (localized), photo, phone, email, `publishPhone` and `publishEmail` flags, and `isAuthor` with a bio, credentials and `sameAs` links (this is the ROADMAP's "Authors"; `/autori/*` pages come in Phase 6)                                                                                                                                                                   |
| **Leads**                          | type (`vanzare-cereale`, `depozitare`, `inputuri`, `finantare`, `logistica`, `parteneri`, `cariere`, `general`), name, **phone (required)**, **email (required)**, company / CUI (optional), county, base →, crop →, message, consent and consent text version, locale, source path, UTM, `assignedTo` → People (set by a hook from Lead routing), `status` (new / contacted / closed) |
| **Media** (exists)                 | add localized `alt` (required), caption, credit, `rights` status (needed because footage permission isn't confirmed yet)                                                                                                                                                                                                                                                               |
| Global **Figures**                 | rows: `key` (C1, S1… matching `docs/audit/figures-register.md`), label, value (localized), number and unit (optional), source URL, `status` (`to confirm` / `conflict` / `confirmed`), confirmedBy, confirmedAt                                                                                                                                                                        |
| Global **Lead routing**            | type → People (primary + fallback)                                                                                                                                                                                                                                                                                                                                                     |
| Globals **Navigation**, **Footer** | localized menus by need (sell grain, store, buy inputs, financing), per locale                                                                                                                                                                                                                                                                                                         |
| Global **SEO defaults**            | site name, default OG image, title template, organization data (legal names, CUI, `sameAs` socials), verification codes                                                                                                                                                                                                                                                                |

**Page blocks** (each one maps to a design-system pattern): Hero (video or image), RichText, FigureStrip, Stats / CountUp, ServiceGrid, StorySection, BaseList / BaseMap, CropList, CTA band, LeadForm (preset type), ContactCards, FAQ, VideoEmbed (click to load), Callout.

After the model changes: `npm run generate:types` and `npm run generate:importmap`.

### B. Seed (`scripts/seed/`)

- `seed-figures.ts` parses `figures-register.md` into the Figures global, keeping each row's status.
- `seed-locations.ts` creates the 17 bases (names with diacritics, S3 capacities), the counties (C4 list), and the 5 crops.
- `seed-people.ts` adds the contacts found in the register, all with `publishPhone: false` until permission is given.
- `seed-pages.ts` creates draft shells for every Phase 2 page in both locales.
- The seed scripts are idempotent (upsert by key or slug). npm script: `seed`.

### C. Figures in pages

- `src/lib/figures.ts`: `getFigure(key, locale)` (cached, tagged for revalidation).
- A `<Fact k="S1" />` server component renders the value. When the value isn't confirmed it adds a "de confirmat" marker, which shows only while the site is noindex.
- `scripts/checks/figures.ts` lists every key used on built pages whose status isn't `confirmed`. It warns now and fails when `SITE_INDEXABLE=true` (Phase 8).

### D. Routing and rendering

- `src/app/(frontend)/[locale]/[[...path]]/page.tsx` resolves Pages by localized `path`. Dedicated routes for `/baze/[slug]`, `/cereale/[crop]` (and `/en/storage` etc. through Pages).
- Static generation with `generateStaticParams`. On-demand revalidation runs from Payload `afterChange` hooks (`revalidateTag` / `revalidatePath`). Drafts are visible through Next draft mode and a Payload live preview URL.
- One localized-path helper builds alternates: it extends `localePath` in `src/i18n/config.ts` to take the per-locale path stored on a document. A page that exists in one locale only gets no hreflang pair, and a language-switch link to that locale falls back to the locale home.

### E. SEO library (`src/lib/seo/`, `src/lib/schema/`)

- `buildMetadata(doc, locale)`: title (template), description, canonical, `alternates.languages` (ro, en, x-default → RO), Open Graph and Twitter tags. The site stays noindex through the existing layout flag, which moves to an env var `SITE_INDEXABLE` (default `false`).
- JSON-LD builders, typed with `schema-dts`: Organization (Agrinvest SRL, with the IFN as a `subOrganization`), WebSite, BreadcrumbList, LocalBusiness per base (geo, opening hours and phone only when present and confirmed), FAQPage, Person, VideoObject. They render through one `<JsonLd>` component.
- `app/sitemap.ts` with `generateSitemaps` (segments: pages, bases, crops; later phases add products, articles…), `app/robots.ts` (allows search and AI crawlers and points to the sitemaps; private and API paths are disallowed), `app/llms.txt/route.ts` (built from the published Pages and Bases).
- IndexNow: a key route plus a `afterChange` hook that pings only when `SITE_INDEXABLE=true`.
- Image OG: `opengraph-image.tsx` per template (logo, title, a key figure) with `next/og`.

### F. Leads

- Server action `submitLead`: zod validation (RO phone format, email), honeypot, rate limit per IP. It creates the lead with the Local API and calls `notifyLead(lead)` in `src/lib/leads/notify.ts`, which does nothing for now and is documented as the hook for a later notification channel.
- The `LeadForm` pattern (client component): progressive enhancement, inline errors in RO and EN, the consent text, and a success state that shows the assigned person's name and role.

### G. SEO checker (port of `HamidHosseini/scripts/check/seo.ts`)

- `scripts/checks/seo.ts` crawls a running `next start` from the sitemaps and follows internal links. It checks: exactly one H1; title 30–60 and description 70–160 characters; titles and descriptions unique; canonical self-referencing and on-origin; reciprocal hreflang pairs plus x-default; JSON-LD that parses and has the expected `@type` for its template; no broken internal links; sitemap entries that are 200, canonical, and in the same index state. npm script: `check:seo`. It is added to CI after `build`.
- A keyword-cluster check reads `keyword-map.csv`: every built target URL exists and links to at least one page in its cluster (warnings at first).

**2.1 exit:** the model is in the admin with seeded data; a smoke page renders with full metadata and JSON-LD; `check:seo` runs in CI; integration tests cover routing, hreflang, figures and lead creation.

---

## 2.2 Core pages and their components

**Components folded in from Phase 1.3–1.4** (in `design-system/`, each with a story, its states, an a11y note and RO/EN examples): SiteFooter, MobileNav, LanguageSwitch, MegaMenu (by need), Breadcrumbs, Accordion and FAQ, HeroVideo (poster first, 720p mobile source, scrim, reduced-motion still), CountUp, StorySection, CTA band, ContactPersonCard, LeadForm, BaseCard, **BaseMap** (server-rendered SVG of Romania's counties with base points; county centroid when there is no GPS; decision 0003 records the map approach), VideoEmbed (click to load), Callout, TOC. Extend the existing Hero, FigureStrip, FinanceBand and SiteHeader instead of duplicating them.

**Pages** (RO; the target URLs come from the IA and `keyword-map.csv`):

| Page                                                                       | Notes                                                                                                                                                                                                                                |
| -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `/`                                                                        | Cinematic hero using frames or b-roll from the YouTube list (`social-inventory.md`), local only while footage rights are open; figures row; needs-based entry points; bases map; finance band; latest price slot (filled in Phase 5) |
| `/despre`, `/despre/cifre`                                                 | Cifre = the public figures register, one `<Fact>` per row, with sources                                                                                                                                                              |
| `/cereale`, `/cereale/{crop}` ×5                                           | Selling grain: payment after reception (C8), quality standards per crop, nearest base, lead form (`vanzare-cereale`), FAQ                                                                                                            |
| `/depozitare`, `/depozitare/uscare`                                        | Services, capacity (from Figures), map                                                                                                                                                                                               |
| `/baze/{baza}` ×17                                                         | Map, capacity, services, contact, LocalBusiness; **slots** for today's price and local weather that Phase 5 fills (hidden until then, so the layout doesn't jump)                                                                    |
| `/finantare`                                                               | Overview hub only: the IFN's identity and its product list as links. The full section is Phase 4                                                                                                                                     |
| `/golden-relationship`, `/logistica`, `/parteneri`, `/cariere`, `/contact` | Contact: people by need, the offices, a general lead form; Logistica uses the L1–L3 figures                                                                                                                                          |

Each page has a `summary` answer paragraph near the top, question-style H2s where they fit, an FAQ, a visible "updated on" date, and internal links to its keyword cluster.

The content is rewritten from the crawl (`content-inventory.csv`) rather than copied, with correct diacritics.

**2.2 exit:** every RO core page passes `check:seo`, Lighthouse mobile budgets, axe, and the screenshot rubric (8+ on average, no criterion below 6) at 390 / 768 / 1440.

---

## 2.3 English, analytics, full pass and gate

- **English business pages:** `/en`, `/en/about`, `/en/storage`, `/en/partners`, `/en/market`, `/en/export` with `/en/export/{crop}` (corn, wheat, sunflower, rapeseed, barley, per the keyword map), and `/en/financing` (overview). They are written for buyers and partners, not translated. hreflang pairs exist only where an RO page has a true equivalent.
- **Analytics:** a consent banner (GDPR; Google Consent Mode v2, denied by default), and GA4 loaded only after consent through `next/script`. Events: `generate_lead` (with the type), `call_click` (`tel:` links), `email_click`, and `order` reserved for Phase 3. Search Console and Bing verification come from SEO defaults. Plausible-style server logs are out of scope.
- **AEO review:** `docs/audit/aeo-queries.md` holds about 30 representative questions (RO and EN: "unde vând grâu în Buzău", "Agrinvest capacitate depozitare"…). Check each page that should answer one: does a direct answer exist in the server-rendered HTML, is it attributable (date, source, author) and consistent with the Figures? Re-run after launch in Phase 10.
- **Full pass:** `check:seo`, `check:figures` (warn), Lighthouse CI on every template, the screenshot review in RO and EN, the Rich Results Test on home, a base page, contact and a crop page, and Storybook visual tests for the new components.
- **Gate:** a Vercel preview, which needs the Vercel link from Phase 0. Record the owner's review in `docs/decisions/`. Phase 1 closes at the same gate (the templates are approved on real pages).

**2.3 exit = Phase 2 exit:** all core pages pass the SEO checker, the Lighthouse budgets and the screenshot review in both languages; the owner approves the preview.

---

## Out of scope (later phases)

The redirect map going live (Phase 8); prices and weather data (Phase 5); finance products and tools (Phase 4); `/autori/*`, `/ghiduri/*`, `/stiri` (Phase 6); lead notification channels (decided later); `/cereale/judet/*` (only once the base data per county is confirmed).

## Critical files

- New: `src/collections/{Pages,Bases,Counties,Crops,People,Leads}.ts`, `src/globals/{Figures,LeadRouting,Navigation,Footer,SeoDefaults}.ts`, `src/blocks/*`, `src/lib/{figures.ts,seo/,schema/,leads/}`, `src/app/(frontend)/[locale]/[[...path]]/page.tsx`, `baze/[slug]`, `cereale/[crop]`, `src/app/{sitemap,robots}.ts`, `llms.txt/route.ts`, `scripts/seed/*`, `scripts/checks/{seo,figures}.ts`, new patterns in `design-system/patterns/`.
- Changed: `src/payload.config.ts` (collections, globals, R2 storage adapter with local disk in dev), `src/collections/Media.ts`, `src/i18n/config.ts` (per-doc localized paths), `src/app/(frontend)/[locale]/layout.tsx` (header and footer, `SITE_INDEXABLE`, consent), `.github/workflows/ci.yml` (seed + `check:seo`), `lighthouserc.json` (template URLs), `package.json`.
- Reused: `src/lib/format.ts`, `design-system/patterns/*` (Hero, FigureStrip, FinanceBand, SiteHeader, PriceTile), `design-system/icons/icons.tsx`, `scripts/checks/{shoot,contrast}.ts`, `docs/audit/{figures-register.md,keyword-map.csv,content-inventory.csv,social-inventory.md,ifn.md}`, `HamidHosseini/scripts/check/seo.ts` (logic only).

## Verification

- Per sub-phase, the definition of done from `CLAUDE.md`: `typecheck`, `lint`, `format:check`, `build`, `test:int`, `test:e2e`, plus stories for the new components.
- Integration tests (Vitest + Local API): localized path resolution, hreflang for one-locale pages, a lead routed to the right person, unconfirmed-figure detection, JSON-LD shape per builder.
- e2e (Playwright): every core URL returns 200 in RO and EN; `/ro/*` returns 308; a lead form submits in both locales (with phone and email required) and the lead appears in the admin; the language switch keeps the page where an equivalent exists.
- `npm run seed && npm run build && npm start`, then `npm run check:seo`, `npm run check:figures`, LHCI, `npm run review:shoot` (RO and EN, 390 / 768 / 1440), and the Rich Results Test on the deployed preview.
