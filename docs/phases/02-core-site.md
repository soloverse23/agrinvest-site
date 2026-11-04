# Phase 2: content model and core site

Status: **2.1, 2.2 and 2.3 built (2026-11-04); waiting for the deployed preview and the owner review (the Phase 2 gate).** Plan approved 2026-11-03.

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

## 2.1 progress (2026-11-03)

**Built**

- Content model: Pages (blocks, localized paths, `languages`, drafts), Bases, Counties, Crops, People, Leads, Media (alt, credit, rights); globals Figures, Lead routing, Navigation, Footer, SEO defaults; 12 page blocks (`src/blocks/`). Shared fields in `src/fields/`, access rules in `src/access/`.
- Seed (`npm run seed`, idempotent): 23 figures with statuses read from `figures-register.md` (none confirmed; S2 and the IFN address are conflicts), 11 counties, 17 bases with S3 capacities, 5 crops, 6 people (no phone or email public), 3 lead routes, menus, SEO defaults and 13 page shells (RO, plus EN where an equivalent exists) with SEO titles and summaries.
- Rendering: catch-all route for Pages, `/baze/[slug]`, `/cereale/[crop]`; `SiteShell` (existing SiteHeader + a scaffold footer), `PageHeader`, breadcrumbs, FAQ, "updated on" date; 2.1 block renderers (`src/components/RenderBlocks.tsx`). The language switch goes to the equivalent page, or to the other language's home.
- Figures: `<Fact>` / `FactMark` tag every value (`data-fact`) and show "de confirmat" while the site is noindex; `npm run check:figures` lists 22 unconfirmed values on pages.
- SEO: `buildMetadata` (canonical, hreflang + x-default only for real pairs, OG/Twitter, noindex until `SITE_INDEXABLE`), JSON-LD builders (Organization + IFN sub-organization, WebSite, WebPage, BreadcrumbList, LocalBusiness, FAQPage, Person, VideoObject; facts appear only once confirmed), sitemap index + segments (`/sitemaps/{pages,bases,crops}.xml`) with alternates, `robots.txt`, `llms.txt`, IndexNow (key at `/indexnow.txt`, pings only when indexable), draft preview (`/next/preview`, staff only).
- Leads: `LeadForm` pattern (phone and email required, consent, honeypot, UTM, works without JavaScript) + `submitLead` server action (zod, rate limit in production) → Leads collection, routed by type with a `general` fallback; `notifyLead` is a documented no-op until the owner picks a channel. Privacy page shell for the consent link.
- Checks: `npm run check:seo` (port of the HamidHosseini checker, crawling the running site: H1, title and description lengths and uniqueness, canonical, reciprocal hreflang, html lang, JSON-LD types per template, broken links, sitemap entries, keyword-cluster links) and `check:figures`; both run in CI after a seed. 27 integration and 34 e2e tests.

**Results**

- `check:seo`: 42 pages, 0 errors; 2 keyword-cluster warnings (`/cereale` → crop pages, `/depozitare` → `/depozitare/uscare`) that the 2.2 content fixes. Keyword map: 16 of 56 target URLs built.
- Lighthouse (default mobile throttling, 6 URLs): accessibility 1,0, CLS 0, TBT ≈ 0, FCP 0,9–1,2 s, **LCP 2,45–2,6 s, over the 2,0 s budget**. See open items.
- typecheck, lint, format, `next build`, Storybook build, `test:int` (27), `test:e2e` (34) pass; axe passes on the new stories.

**Deviations from the plan**

- **No PostGIS:** coordinates are `lat`/`lng` number groups instead of `point` fields (the local Postgres image has no PostGIS; "nearest base" over a few dozen points is computed in code).
- The Pages field is `languages`, not `locales`: a field named `locales` collides with Payload's own `pages_locales` table.
- Base and crop pages render on the first request and are then cached (ISR), not at build time: their `generateStaticParams` returns the slugs but Next does not prerender them next to the optional catch-all. The layout's `dynamicParams = false` was removed because it made them 404 in production.
- Onest is served from `public/fonts/` with its own `@font-face` (Latin + Latin Extended unicode ranges) and preloaded, instead of the @fontsource import in `tokens.css` (Storybook keeps @fontsource). `next/font/local` was tried and dropped: it writes no unicode-range, so the Latin Extended file overrode basic Latin.
- Lead validation is split: `src/lib/leads/state.ts` (client-safe) and `form.ts` (zod, server). Importing the zod module into the form had put 400 KB of JavaScript on every page.
- The seed clears Next's data cache (`.next/cache/fetch-cache`) at the end, because its writes cannot revalidate cache tags.
- `lighthouserc.json` no longer uses the `perf` preset, which skipped the accessibility category, so that assertion could never pass. Without it, Lighthouse uses its default (stricter) mobile throttling.

**Open items for 2.2**

- LCP budget: the remaining time is script cost under simulated throttling (182 KB gzipped on a content page, LeadForm's chunk on every CMS page). Load the form only where it renders, and check the 38 KB chunk and the fonts' effect on text LCP.
- The visual design of blocks, the footer, Accordion, Breadcrumbs and the other folded-in components (the 2.1 renderers are token-styled scaffolds).
- Base pages: price and weather slots (Phase 5), base pre-selected on its own lead form.
- Agrinvest inputs added to `docs/audit/agrinvest-inputs.md`: who receives each lead type, and the privacy policy text.

---

## 2.2 Core pages and their components

### 2.2 progress (2026-11-03)

**Owner choices (asked before building):** the base map is a server-rendered counties outline (decision `0004-base-map.md`); the desktop menu is a mega menu by need; the core pages get full Romanian draft copy.

**Performance** (the LCP open item from 2.1). Decision `0003-lighthouse-measurement.md`.

- One Onest file cut to Romanian + English with the weight axis 400–700: 29 KB, down from 63 KB in two files. `npm run brand:font` builds it from `design-system/brand/fonts-src/` and generates `src/app/(frontend)/fonts.css`: `font-display: optional` and metric-matched fallbacks (Arial / Liberation Sans, Roboto for Android). `check:fonts` checks the served file too.
- `experimental.inlineCss` (no render-blocking stylesheet); `images.qualities` [60, 75] (the hero photo at 60).
- LeadForm in its own chunk (`LeadFormLazy`), only on pages with a form. The logo and the county outlines are cached SVG files instead of inline markup, which appeared twice per page (HTML and RSC payload).
- `lighthouserc.json`: applied throttling, 9 templates, budgets for performance (≥ 0,95), accessibility and best practices (1,0), LCP, FCP, CLS, TBT, script ≤ 160 KB, fonts ≤ 32 KB, no external stylesheets, and the SEO audits one by one (the SEO category stays below 1,0 only because of `noindex`).

**Built**

- **Components** (`design-system/patterns/`, stories in `Patterns/Content`, axe clean at 390 / 768 / 1440 in RO and EN): `SiteHeader` mega menu (CSS only, opens on hover and focus; sub-pages in the mobile menu), `SiteFooter`, `Hero` needs rail (prices take its place in Phase 5) and optional photo, `BaseMap`, `FactTable`, `VideoEmbed` (click to load, youtube-nocookie), and in `Sections.tsx`: `SectionHeading`, `Kicker`, `PageHeader`, `Breadcrumbs`, `Updated`, `KeyFacts`, `Accordion`, `ServiceGrid`, `Steps`, `CtaBand`, `Callout`, `StorySection`, `ContactCards`, `Toc`. New icons: scale, drop, coins, clock, handshake, mail, document, play. `prose-agr` styles long CMS text. Fields take their layout class on the frame (the message field now spans both columns).
- **Model:** page `layout` and `faq` are per language (the English site is not a mirror, and Romanian text no longer falls back onto English pages). New blocks: Steps, FinanceBand, FigureTable; section heading fields (kicker, heading, lead) on the section blocks; hero `needs`; story `kicker` and `reverse`; ContactCards as person + need. Navigation items have a `blurb` for the menu panel.
- **Facts in text:** content fields write register facts as `{{KEY}}` (`src/components/FactText.tsx`). They render as `<Fact>` with the "to confirm" marker; FAQPage JSON-LD leaves out any answer that relies on an unconfirmed value. Lists with one shared status show one marker above the list (the rows keep their `data-fact` tags).
- **Pages:** all RO core pages with draft copy rewritten from the old site (`scripts/seed/content.ts`; the old contact page was Lorem ipsum and the careers page a 404): home (hero with the harvest still, figures, services, base map, how selling works, Golden Relationship story, finance band, contact band, FAQ), `/despre`, `/despre/cifre` (the register as tables with sources), `/cereale`, `/cereale/{crop}` ×5 (key facts, map, form with the crop pre-selected, other crops), `/depozitare`, `/depozitare/uscare`, `/baze/{baza}` ×17 (key facts, form with the base pre-selected, map with the base marked, FAQ), `/finantare` (overview hub), `/golden-relationship` (with a click-to-load video), `/logistica`, `/parteneri`, `/cariere`, `/contact`, `/confidentialitate` (marked as a draft). English pages keep short placeholders until 2.3.
- **Media:** five stills from the 2022 films are uploaded by the seed when `data/raw/frames` exists, with rights "pending"; without them (CI) pages render without photos.
- **Tests:** 31 integration (+ facts in text, FAQ filtering, the seed rich-text builder) and 38 e2e (+ menu sub-pages without JavaScript, base pre-selected on its page, all 17 bases on the map list, English pages without Romanian fallbacks).

**Results**

- `check:seo`: 42 pages, 0 errors, 0 warnings (both keyword-cluster warnings fixed). `check:figures`: unconfirmed values listed (warning until launch).
- Lighthouse, mobile, applied throttling, all 20 core URLs (RO + EN): performance 100, accessibility 100, best practices 100; LCP 1,3–1,4 s; TBT ≤ 10 ms; CLS 0.

**Open items**

- The owner review of the pages and of the draft copy (screenshots in the preview at the 2.3 gate).
- From Agrinvest (`agrinvest-inputs.md`): base locations (the map plots bases as soon as a county or GPS is entered), reception standards per crop, the IFN instalment calendar, the copy review, footage rights.
- The screenshot rubric score for the real pages is part of the 2.3 full pass, with the English pages.

**Components folded in from Phase 1.3–1.4** (in `design-system/`, each with a story, its states, an a11y note and RO/EN examples): SiteFooter, MobileNav, LanguageSwitch, MegaMenu (by need), Breadcrumbs, Accordion and FAQ, HeroVideo (poster first, 720p mobile source, scrim, reduced-motion still), CountUp, StorySection, CTA band, ContactPersonCard, LeadForm, BaseCard, **BaseMap** (server-rendered SVG of Romania's counties with base points; county centroid when there is no GPS; decision 0004 records the map approach), VideoEmbed (click to load), Callout, TOC. Extend the existing Hero, FigureStrip, FinanceBand and SiteHeader instead of duplicating them.

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

- **English pages (changed, decision `0005-english-parity.md`):** the owner asked for both languages to match, so every Romanian page has an English equivalent with the same blocks, instead of the separate business-led set first planned here.
- **Analytics:** a consent banner (GDPR; Google Consent Mode v2, denied by default), and GA4 loaded only after consent through `next/script`. Events: `generate_lead` (with the type), `call_click` (`tel:` links), `email_click`, and `order` reserved for Phase 3. Search Console and Bing verification come from SEO defaults. Plausible-style server logs are out of scope.
- **AEO review:** `docs/audit/aeo-queries.md` holds about 30 representative questions (RO and EN: "unde vând grâu în Buzău", "Agrinvest capacitate depozitare"…). Check each page that should answer one: does a direct answer exist in the server-rendered HTML, is it attributable (date, source, author) and consistent with the Figures? Re-run after launch in Phase 10.
- **Full pass:** `check:seo`, `check:figures` (warn), Lighthouse CI on every template, the screenshot review in RO and EN, the Rich Results Test on home, a base page, contact and a crop page, and Storybook visual tests for the new components.
- **Gate:** a Vercel preview, which needs the Vercel link from Phase 0. Record the owner's review in `docs/decisions/`. Phase 1 closes at the same gate (the templates are approved on real pages).

### 2.3 progress (2026-11-04)

**Owner feedback on 2.2, fixed first:** the mega menu closed on the way to a panel (now a `MegaMenu` client component with hover intent); the map was too large and the list beside it unnecessary (decision 0004, revision: counties named on the map, area and bases on hover or tap).

**Built**

- **English:** all 13 pages plus 5 crop and 17 base pages (`scripts/seed/content-en.ts`), with English menus and footer. Route prefixes per language in `src/i18n/routes.ts`; crop and base templates shared in `src/components/templates/`. Sitemaps, `llms.txt`, IndexNow and hreflang cover both languages. The keyword map's `/en/export*` targets now point to `/en/grain*`.
- **Analytics:** `ConsentBanner` and `Analytics` (Consent Mode v2, denied by default; GA4 only after acceptance; `generate_lead`, `call_click`, `email_click`; withdrawing consent removes the GA cookies; "Cookie settings" in the footer). The GA4 ID is a field in SEO defaults. While it is empty there is no banner and none of this code ships (`AnalyticsLazy`).
- **AEO:** `docs/audit/aeo-queries.md` (32 questions, RO and EN) and `npm run check:aeo` (in CI). The check caught a real bug: crop FAQ rows were shared across languages, so English had replaced Romanian. The `faq` field is now localized as a whole.
- **Tokens:** container sizes `sm`–`5xl` added; every `max-w-2xl`–`5xl` had silently produced no CSS since Phase 1.

**Results**

- `check:seo`: 70 pages, 0 errors, 0 warnings; 20 of 56 keyword-map URLs built. `check:aeo`: 32 of 32. `check:figures`: 41 unconfirmed values shown (warning until launch).
- 36 integration and 48 e2e tests pass; 39 stories pass axe with no overflow at 390 / 768 / 1440 in RO and EN.
- Lighthouse CI (mobile, applied throttling, 12 templates × 3 runs, RO and EN): performance, accessibility and best practices 100 on every template, LCP about 1,35 s, TBT ≤ 13 ms, CLS 0. That run failed only the script budget (160,6–164,2 KB against 160 KB); Analytics was then moved out of the bundle (`AnalyticsLazy`, about 4 KB less per page). The confirming run was still in progress at this commit.

**Not done (needs a deployed URL)**

- The Vercel preview (needs the owner's Vercel account), and with it the Rich Results Test and the simulated PageSpeed score.
- The screenshot rubric scores for the real pages and the owner's review, recorded in `docs/decisions/` at the gate. Phase 1 closes at the same gate.

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
