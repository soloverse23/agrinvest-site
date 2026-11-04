# Agrinvest website: master roadmap

> One master document. **Each phase below is planned separately in detail when we start it.** This file sets the direction, scope, deliverables and exit criteria for every phase.
>
> Each phase's detailed plan goes in `docs/phases/NN-<name>.md`. Decisions go in `docs/decisions/`.

## Context

Agrinvest gets a **completely new website on agrinvest.ro**, built from zero in a clean new folder. Both current WordPress sites are retired:

- agrinvest.ro: Elementor/BeTheme.
- agrinvestshop.ro: WooCommerce.

The old sites are only a source of content and of URLs to redirect.

Goals, in priority order:

1. **#1 in Google for Agrinvest's product and business keywords, in Romanian and English.** The keyword research already exists in `src/data/plan.ts` (`audiences`, `topOpportunities`).
2. **A professional, formal, light-themed design** that is easy to use and doesn't look AI-generated. It is cinematic only in chosen places, using Agrinvest's own YouTube footage. It is built on a **complete, scalable design system**.
3. **A strong shop** with precise, structured technical detail for every product.
4. **Farmer tools, each also an SEO asset:** grain and input prices, diesel (buying, selling, prices), farm news, weather assistant.
5. **A full finance section for Agrinvest Credit IFN:** products, simulator, eligibility checker, online application, knowledge hub. It is linked into the shop, the grain prices and the diesel page.
6. **An article engine that wins keywords.**
7. **Two-way social integration** (the Hamid Hosseini pattern, extended) so the site and the social channels keep feeding each other.
8. **An admin panel for staff:** a later phase, but the architecture is ready for it from day one.

Quality bar: **everything clean.** Clean code, clean data model, clean URLs, clean content, documented decisions.

## Research summary (basis for decisions)

**agrinvest.ro today**

- No H1 on any page.
- Meta descriptions just repeat the page name; the IFN page's description says "Trading Cereale".
- `lang="en-US"` on Romanian content.
- 6 "lorem ipsum" posts in the sitemap.
- The homepage is marked up as an Article.
- Pages are uncached.
- About 30 product pages duplicate the shop.

**Facts to reuse (to be confirmed with management)**

- Founded in 2003 in Buzău; 22 counties.
- **17 silo bases, 238,000 t** (Pogoanele 86,000 t).
- Fleet of 55 trucks.
- Golden Relationship covers more than 6,000 ha.
- IFN: reply in 24 h, money in 3 days, loans up to 7 years.
- Diesel is a business line with no page.

**agrinvestshop.ro**

- **77 products**, readable from the public Store API (`/wp-json/wc/store/v1/products`):
  - seeds 18, foliar fertilisers 13, herbicides 10, pesticides 10, fertilisers 7, insecticides 7, fungicides 5, seed treatment 5, organic 4, adjuvants 2, growth regulators 1.
- 18 are out of stock. Prices are in RON.
- Dose, crop and active ingredient appear **only as free text**. No SKUs, no technical or safety-sheet PDFs.
- 17 theme demo pages in the sitemap.

**Social**

- LinkedIn: about 3k followers, 1–3 posts a month.
- YouTube @agrinvestromania2727: 12 videos (TV appearances and interviews), the hero footage source.
- Facebook (agrinvestromania), Instagram (agrinvest.ro) and TikTok (@agrinvest.srl) exist but are thin.

**Competitors**

- Price boards (agrointel, brm.ro, lahectar, agribursa) are plain tables.
- Input shops (agronor, semplus, varo) are filters plus prices.
- **The gap:** nobody combines an own buy price per base + a net-price calculator + history + alerts, or product pages with complete structured agronomic data.

**Free data sources (verified)**

| Need                                             | Source                                                                          |
| ------------------------------------------------ | ------------------------------------------------------------------------------- |
| Weekly grain prices for RO regions and Constanța | EU Commission API `ec.europa.eu/agrifood/api/cereal/prices?memberStateCodes=RO` |
| Fertiliser price index (EU level)                | EU Commission API `…/api/fertiliser/prices`                                     |
| Weekly grain tables                              | brm.ro (also has RSS)                                                           |
| Weather (rain, ET0, soil moisture)               | Open-Meteo                                                                      |
| Weather (unofficial JSON)                        | ANM `meteoromania.ro/wp-json/meteoapi/v2/...`                                   |
| Farm news RSS                                    | revista-ferma, agrimedia, agro-tv, agrointel, brm                               |
| National diesel prices                           | EU Weekly Oil Bulletin                                                          |

**Agrinvest Credit IFN (the financing arm)**

- **Identity:**
  - Agrinvest Credit IFN SA; BNR Special Register **RS-PJR-42-040132** (07.03.2023); company number (CUI) 41531140; trade-register number J2019003620232.
  - Lending since 01.02.2020; Director General Andra Pârvan.
- **Products found:**
  - Short-term facilities for the grain production cycle.
  - Investment credit (machinery, storage, irrigation, crop or livestock farms, land).
  - Agri-food production financing since 2024 (meat, milk, bakery, feed).
  - Credit secured by grain sale contracts (up to 35% of the contract, per a 2021–22 source).
  - Grain stock financing.
  - APIA subsidy used as collateral (up to 200% of claims, per a 2022 source).
- **Terms:**
  - Lei only; up to 7 years.
  - At most **2 instalments a year, aligned with the autumn and spring harvests**.
  - Reply in 24 h after complete documents; money within 3 days of signing.
- **Accepted guarantees:** promissory notes, crops, machinery, APIA subsidies, grain purchase contracts, mortgage.
- **Eligible borrowers:** sole traders (PFA, II, IF), SRL and SA companies, agricultural companies.
- **Scale:** 500+ clients, €70M+ financed (agrointel, March 2025).
- **Bank funding lines:** ING, BRD, UniCredit.
- **Unverified:** a June 2026 headline about loans of up to 10 years and up to 10%/year off the interest rate for borrowers who pay on time.
- **Gaps on the current site:**
  - The only IFN page is `/servicii-ifn/`, and its meta description says "Trading Cereale".
  - No amounts, process, document list, simulator or online application.
  - Two different registered-office addresses are listed.
- **Competitor benchmark: Agricover Credit IFN** has named products ("Motorină cu plata la recoltă", "Card Fermier" up to 150k lei paid at harvest, "Hectar Plus", "Credit Avans Forward", irrigation credit) and a digital platform (Agricover Pay).
- **Market context:** the 2026 APIA-certificate loan scheme lends up to 90% of the subsidy, guaranteed by FGCR / FNGCIMM, at ROBOR 6M + max 2%. Lenders must have an agreement with APIA, so Agrinvest's participation needs confirming.

**HamidHosseini project, patterns to reuse**

- The fetcher → store → never-delete merge, with local copies of media.
- Overrides (pin, hide, retitle) that survive every sync.
- The schema and JSON-LD helper library (`src/lib/schema.ts`), and the SEO head in `src/layouts/Base.astro`.
- `llms.txt`, IndexNow pings, the CI SEO check (`scripts/check/seo.ts`), and the language-redirect middleware.

**Motionsites skill**

- **Use:**
  - its craft rules (`references/craft.md`: tokens, type scale, easing, motion failure modes);
  - its screenshot review loop (`scripts/shoot.py` with the `review.md` rubric);
  - selected hero techniques (poster-first video, scrims, serif accent word, count-up figures).
- **Don't use:**
  - its media shelf (hotlinked from a third-party CDN);
  - its built-in ads;
  - single-file output;
  - WebGL on commerce or tool pages.

## Architecture (decided)

| Layer    | Choice                                                                                                                                                                               | Why                                                                                                                                                                                                              |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| App      | **Next.js (App Router, React Server Components) + Payload CMS 3** in one repo                                                                                                        | Payload's admin becomes the phase-9 panel. It has built-in RO/EN field localization, drafts and versions, roles, a jobs queue and the official ecommerce plugin. Pages are static or ISR with minimal client JS. |
| Data     | Postgres (Neon); media on Cloudflare R2                                                                                                                                              | Scalable, managed, portable.                                                                                                                                                                                     |
| Hosting  | Vercel (preview per branch); Vercel Cron → Payload jobs                                                                                                                              |                                                                                                                                                                                                                  |
| Styling  | Tailwind v4 driven entirely by design-system CSS tokens; Storybook                                                                                                                   | One source of truth for the site and the panel.                                                                                                                                                                  |
| Quality  | TypeScript strict, ESLint/Prettier, Playwright, Lighthouse CI, the SEO checker, Storybook visual tests                                                                               |                                                                                                                                                                                                                  |
| Commerce | Payload ecommerce plugin. Payments, invoicing (SmartBill/Oblio → e-Factura) and delivery are confirmed with Agrinvest. ANAF lookup of the company registration number (CUI) for B2B. |                                                                                                                                                                                                                  |

**Folder:** a new standalone repo at **`/Users/mosiho/Projects/Agrinvest/site/`** with its own git and its own `package.json`. The existing proposal app is untouched.

```
site/
  docs/            ROADMAP.md, phases/, decisions/, audit/, keyword-map, redirect-map, content-inventory
  design-system/   tokens/, primitives/, patterns/ (+ Storybook stories)
  src/app/(frontend)/[locale]/…   public pages
  src/app/(payload)/admin          admin
  src/collections/, src/globals/   content model
  src/lib/          seo/, schema/, feeds/, prices/, weather/, social/
  scripts/          import/, crawl/, checks/
```

## Information architecture (target)

Romanian is the default language at `/`, English lives at `/en`. Slugs have no diacritics; page text always does.

**Core pages**

- `/`
- `/despre`, `/despre/cifre` (the figures register), `/cariere`, `/contact`, `/parteneri`

**Grain**

- `/cereale`
- `/cereale/{grau|porumb|floarea-soarelui|rapita|orz}`
- `/cereale/judet/{judet}`: only where a real base or collection point exists.

**Storage**

- `/depozitare`, `/depozitare/uscare`
- **`/baze/{baza}`**: 17 base pages with map, capacity, contact, today's price, local weather and LocalBusiness schema.

**Shop**

- `/magazin`, `/magazin/{categorie}`, `/magazin/{categorie}/{produs}`
- Curated, indexable facet hubs:
  - `/magazin/cultura/{cultura}`
  - `/magazin/substanta-activa/{substanta}`
  - `/magazin/producator/{brand}`

**Prices**

- `/preturi`
- `/preturi/{grau|porumb|floarea-soarelui|rapita|orz}`
- `/preturi/ingrasaminte`, `/preturi/motorina`

**Diesel**

- `/motorina`
- `/motorina/calculator-acciza`: excise-refund calculator.

**Weather**

- `/meteo`, `/meteo/{judet}`

**News**

- `/stiri`: the aggregated feed is noindex; Agrinvest's own pieces are indexed.

**Knowledge and stories**

- `/ghiduri/{pilon}/{articol}`
- `/autori/{expert}`
- `/golden-relationship`, `/logistica`
- `/video`, `/povesti`

**Finance** (its own section of the site, run by Agrinvest Credit IFN)

- `/finantare`: hub.
- `/finantare/credit-productie` (production cycle)
- `/finantare/credit-investitii` with sub-pages: `/utilaje`, `/irigatii`, `/depozitare`, `/teren-agricol`, `/ferme`
- `/finantare/credit-contracte-cereale` (secured by sale contracts)
- `/finantare/finantare-stocuri` (grain stock financing)
- `/finantare/subventii-apia` (APIA as collateral or advance, if confirmed)
- `/finantare/inputuri-plata-la-recolta` (inputs paid at harvest, linked to the shop)
- `/finantare/industrie-alimentara` (agri-food producers)
- Tools and process:
  - `/finantare/simulator`: harvest-aligned repayment simulator.
  - `/finantare/eligibilitate`: eligibility checker.
  - `/finantare/documente`: document checklist by borrower type.
  - `/finantare/aplica`: online application.
- Trust and knowledge:
  - `/finantare/intrebari-frecvente`
  - `/finantare/ghiduri/*`: APIA advance, guarantee funds, AFIR/PNS grants vs credit, glossary.
  - `/finantare/despre-ifn`: legal identity, BNR registration, team, funding partners.
- English: `/en/financing`, a business-level overview for partners.

**English** (business-led, not a mirror)

- `/en`, `/en/export/*`, `/en/partners`, `/en/storage`, `/en/market`, `/en/about`, `/en/financing`
- Selected product pages in English.

Every indexable template maps to one primary keyword cluster in the keyword map.

---

# Phases

Each phase lists: **Goal · Scope · Deliverables · Exit criteria.** Each one is planned in detail when it starts.

## Phase 0: Foundations and audit

**Goal:** a clean repo and a complete picture before building.

**Scope**

- Scaffold `site/` with Next.js, Payload, Postgres, Tailwind, Storybook, lint, CI and Vercel previews.
- Crawl both old sites: every URL, title, status and any inbound links found.
- Export all 77 products and their media.
- Inventory every social channel; list the YouTube videos (footage rights to be confirmed).
- Get Keyword Planner volumes for the existing keyword research. Analyse the SERPs for the top 40 keywords (who ranks, page format, content depth).
- Draft the figures register.

**Deliverables** (all in `docs/`)

- `audit/`, `content-inventory.csv`, `keyword-map.csv` (keyword → page → intent → priority)
- `redirect-map.csv` (old URL → new URL, both domains)
- `serp-notes.md`, `decisions/0001-stack.md`

**Exit:** the keyword map and redirect map are reviewed; the repo builds; a preview deploy works.

## Phase 1: Design system (complete, before any page)

**Goal:** one system that scales to the site, the shop, the tools and the future panel. Light, formal, calm, data-first, and not "AI-looking".

**1.1 Direction (your choice before anything is final)**

- Two or three distinct directions shown as visual boards: type pairing, palette, photo treatment, a hero sketch, a product card, a price table.
- **I ask you; you choose or mix.**

**1.2 Foundations: design tokens (in code)**

| Area             | What it covers                                                                                                                                                                                                                                                                  |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Colour           | Neutrals (paper/ink scale); one brand accent; semantic colours (success, warning, danger, info); **data colours** for charts and price up/down; surface and border tiers. Contrast-checked to WCAG AA. Dark mode is prepared as tokens for the panel; the public site is light. |
| Typography       | Display and text families tested for **Romanian ș/ț with a comma below** and tabular figures. A fluid type scale (clamp), weights, line-heights, measure. Numeric styles for prices and units.                                                                                  |
| Space and layout | Spacing scale, 12-column grid, container widths, breakpoints (390 / 768 / 1024 / 1440), section rhythm.                                                                                                                                                                         |
| Shape and depth  | Radius scale, borders, elevation (used sparingly).                                                                                                                                                                                                                              |
| Motion           | Durations, easings (from Motionsites `craft.md`), stagger rules, a `prefers-reduced-motion` policy, and a whitelist of where motion is allowed.                                                                                                                                 |
| Iconography      | One custom line-icon set: crops, inputs, operations (silo, truck, drop, sprayer, thermometer…), UI icons.                                                                                                                                                                       |
| Imagery          | Photo direction (real people, real bases, golden-hour fields, no stock clichés), aspect-ratio system, video rules (poster-first, 720p mobile version, ≤ 8 MB loops).                                                                                                            |
| Voice            | UI copy rules for RO and EN, how numbers, units and dates are written (`1.020 lei/t`, `12,5%`), tone.                                                                                                                                                                           |

**1.3 Primitives**

- Button, Link, IconButton, Field/Input/Select/Checkbox/Radio/Switch.
- Badge/Tag, Tooltip, Tabs, Accordion, Table.
- Price, Unit, Delta (▲▼), Stat.
- Chart (line, bar, sparkline), Media (image/video), Skeleton, Toast, Dialog, Breadcrumbs, Pagination.

**1.4 Patterns**

- Navigation: header with mega-menu by need (sell grain, store, buy inputs, financing), mobile nav, footer, language switch.
- Commerce: ProductCard, FacetPanel, ProductGallery, **DoseTable**, SpecSheet, PackSizeSelector, Cart line, Checkout steps.
- Data: PriceBoard, PriceChart, NetPriceCalculator, WeatherCard, SprayWindow, BaseMap, BaseCard.
- Content: ArticleCard, AuthorBox, FAQ, TOC, CalloutFigure, VideoEmbed (click to load), SocialPost, UGC tile.
- Conversion: LeadForm (by type), CTA band, Contact person card, Alert subscribe.
- Cinematic: HeroVideo (poster-first, scrim, serif accent), CountUp figures, Story section. **Only for the home, brand and story pages.**

**1.5 Templates (high fidelity)**

- Home, service page, base page, product listing, product page, price tool, weather, article, author, stories/video hub, contact, cart and checkout.

**1.6 Anti-"AI look" rules (enforced in review)**

- No gradient blobs, no glass cards everywhere, no emoji icons, no generic "hero + 3 cards".
- Real photography and real numbers; an editorial grid; deliberate asymmetry; restrained motion; dense, useful information.

**1.7 Governance**

- Tokens are the only source of colour, spacing and type: lint rules ban hard-coded values.
- Every component has a story, its states, an accessibility note and RO/EN content examples.
- Versioned changelog.

**Deliverables:** `design-system/` (tokens, primitives, patterns) with Storybook published as a preview, template mock-ups, and `docs/design-system.md`.

**Exit**

- You approve the direction, foundations and templates.
- Every template passes the screenshot rubric (8+ average) at 390 / 768 / 1440 px in RO and EN.

## Phase 2: Content model and core site

**Goal:** the brand and service site, with the SEO plumbing complete.

**Scope**

_Payload collections_

- Pages (blocks, localized).
- Locations: Bases, Counties.
- Authors.
- Leads, routed by type to a named person.
- Globals: Figures register, Navigation, Footer, SEO defaults.

_Pages_

- Home with a cinematic hero (b-roll from Agrinvest's YouTube videos).
- Despre and Cifre; Cereale and its crop pages; Depozitare plus the 17 base pages.
- Finanțare, Golden Relationship, Logistica, Parteneri, Cariere, Contact.
- The English business pages.

_SEO plumbing_

- Metadata API, hreflang + x-default.
- The JSON-LD library: Organization, LocalBusiness per base, BreadcrumbList, WebSite.
- Segmented sitemaps, robots, `llms.txt`, IndexNow.
- The SEO checker in CI.

_AEO and LLM discoverability_

- Structure key pages to answer likely questions directly, with clear headings, concise summaries and useful FAQs where appropriate.
- Publish accurate, consistent entity and product details in crawlable HTML; connect pages with descriptive internal links and validated structured data.
- Make authorship, publication or update dates, sources and claims clear so answers can be attributed and verified.
- Keep relevant public pages accessible to search and AI crawlers through robots and server-rendered content; exclude private or restricted content.
- Maintain `llms.txt` as a helpful content index, without relying on it as a substitute for crawlability, sitemaps or SEO.
- Review representative AEO/LLM queries for accurate citations and answers; keep SEO requirements and canonical URLs intact.

_Analytics_

- GA4 events (lead, call click, order), Search Console, Bing.

**Exit:** all core pages pass the SEO checker, Lighthouse budgets and the screenshot review.

## Phase 3: Shop (existing products as a pilot, then live)

**Goal:** the best agri-input product pages in Romania, both commercially and for SEO.

**3.1 Product data model**

- Variants: pack sizes, SKU, price, stock, unit price.
- Taxonomies: Crops, Problems/targets, ActiveIngredients, Brands, Categories.
- Fields by product type:

| Type            | Fields                                                                                                                                                                                                                                                                                           |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Crop protection | Active ingredients with concentration; formulation; registration number (omologare) and validity; dose table (crop · target · BBCH stage · dose · water volume · max treatments · waiting period); mode of action / resistance group; toxicity and safety; professional-use flag; compatibility. |
| Seeds           | Species and variety or hybrid; FAO group; maturity; sowing density; seeds or kg per ha; yield potential; resistances and tolerances; recommended zones; seed treatment.                                                                                                                          |
| Fertilisers     | Composition (N-P-K-S + micronutrients); form and granule size; application timing and rates by crop; storage.                                                                                                                                                                                    |

- Documents: technical-sheet and safety-sheet PDFs, labels.
- Relations: related products, guides, videos and UGC.

**3.2 Pilot import of the existing 77 products**

1. Import from the Woo Store API (`scripts/import/woo.ts`) as **drafts** with the status `pilot`.
2. Parse the free-text descriptions into structured fields.
3. Fill the gaps from manufacturer labels, the official plant-protection product register and the technical sheets.
4. Write a new, original description for every product (no copied manufacturer text), with its primary keyword from the keyword map.
5. Add an FAQ where real questions exist.
6. **Agrinvest re-confirms stock and re-prices every product.** Only then does a product move from `pilot` to `live`.
7. Until then, pilot products are hidden from the public, or shown as "request a quote" (decided in the phase plan).

**3.3 Listing and discovery**

- Server-rendered facets.
- Curated indexable hubs (by crop, active ingredient, brand); every other filter URL is canonical + noindex.
- Internal search.

**3.4 Commerce**

- Cart and checkout (person and company accounts, company-number lookup).
- Payments, invoicing / e-Factura, delivery zones and couriers, order emails.
- Bulk-quote path.
- Certificate capture for professional-use plant-protection products, after a legal check.

**3.5 SEO**

- Product / Offer / AggregateOffer schema, breadcrumbs, images optimised with alt text.
- Price history recorded for the `/preturi/ingrasaminte` pages.

**Exit**

- All 77 pilot products are fully enriched.
- The products Agrinvest has confirmed are live; test orders work end to end; Rich Results tests are valid.

## Phase 4: Finance (Agrinvest Credit IFN)

**Goal:**

- Make the finance section the clearest place in Romania for a farmer to understand, simulate and apply for agricultural credit.
- Win "credit agricol", "credit fermieri", "IFN agricol", "finanțare inputuri plata la recoltă", "credit utilaje agricole" and the APIA-advance searches.
- Connect financing to every other part of the business.

**4.1 Research and confirmation (with the IFN team)**

- The current product list and names, with min/max amounts, terms, guarantees and eligibility per product.
- Whether any interest or fee figures may be published.
- Whether Agrinvest takes part in the APIA certificate scheme.
- The 10-year term and on-time-payment discount headline.
- Which registered-office address is correct.
- Permission to name the funding partners (ING, BRD, UniCredit).
- Approved figures (500+ clients, €70M+ financed).

**4.2 Content model**

- **FinanceProducts:**
  - purpose, who it is for, amount range, term, repayment pattern, accepted guarantees, required documents by borrower type, process steps, FAQ, related products and tools;
  - localized RO/EN, with a legal-approval status field.
- **FinanceApplications:** a separate collection with strict access, so only IFN roles can read it.
- **Globals:** IFN legal identity (registrations, addresses, data-protection contact), shown automatically in the footer of every finance page.

**4.3 Pages:** the hub, one page per product, and the trust page, all as in the information-architecture section.

- Each product page has:
  - who it is for, what it finances, how repayment follows the harvest, guarantees, documents, the 4-step process (apply → reply in 24 h → sign → money in ≤ 3 days), FAQ;
  - a named advisor;
  - a call to action to the simulator and the application.

**4.4 Tools**

- **Repayment simulator:**
  - inputs: amount, term, crop and harvest season;
  - output: a schedule with at most 2 instalments a year, aligned to harvests.
  - Shows **indicative** figures only, with a clear disclaimer. Interest is shown only if the IFN approves it legally.
- **Eligibility checker:** a short questionnaire (legal form, hectares or activity, years in operation, available guarantees) → the matching products and document list.
- **Online application:**
  - multi-step: person or company (company-number lookup), need, amount, guarantees, document upload;
  - consents: GDPR and credit-bureau checks;
  - encrypted storage; sent to the IFN team with a reference number; confirmation email.
  - Status tracking comes in the panel phase.

**4.5 Cross-selling (one Agrinvest)**

| Where                       | Link to                                                                                    |
| --------------------------- | ------------------------------------------------------------------------------------------ |
| Shop product and cart pages | "Finanțează inputurile, plătești la recoltă" (finance your inputs, pay at harvest)         |
| Grain price tool            | "Nu vinde la preț mic: finanțăm stocul" (don't sell at a low price; we finance your stock) |
| Grain sale contract pages   | credit secured by the contract                                                             |
| Diesel page                 | financing                                                                                  |
| Base pages                  | the local IFN contact                                                                      |
| Golden Relationship         | farmer rescue + financing story                                                            |

- Later, an option to pay at harvest at checkout, once legal and operational setup is done.

**4.6 SEO and compliance**

- Schema: `FinancialService` + `LoanOrCredit` per product, with `parentOrganization` Agrinvest; FAQ only where it is real.
- A content cluster: the APIA advance explained, guarantee funds (FGCR/FNGCIMM), credit vs AFIR/PNS grants, a glossary.
- Every finance page carries its review date and is reviewed by the IFN.
- **Legal review before publishing:** BNR disclosure rules, credit advertising rules, GDPR for financial documents.
- Never promise approval; no misleading rate claims.

**Exit:** the IFN and its legal adviser approve all finance content; the simulator and application are tested end to end; applications reach the IFN securely.

## Phase 5: Farmer tools

**Goal:** daily-use tools that win the high-volume searches and bring farmers back.

**Prices: grains**

- Agrinvest's own buy prices per crop and base. Both modes are supported:
  - manual daily or weekly entry in the admin;
  - a data model and API ready for automated feeds later.
- Public market data: the EU API (RO regions, Constanța) and BRM.
- History charts.
- **Net-price calculator** with moisture and impurity deductions (scăzământ).
- Alert subscriptions by WhatsApp or email.
- "Sell to the nearest base" call to action.
- Dataset schema; a weekly market note.

**Prices: inputs**

- Dated pages built from shop prices plus the stored history, and the EU fertiliser index.

**Diesel (buy, sell, price)**

- Quote and order flow: volume, county, date.
- Agrinvest's price and the national weekly price.
- Excise-refund calculator: hectares × litres per hectare × lei per litre.
- A rules guide kept up to date.

**Weather assistant**

- Open-Meteo per base, county or the user's location: 7–14 day forecast, **spraying window**, frost alerts, growing degree days, soil moisture and ET0.
- ANM warnings.
- Indexable county pages; the interactive part is a small client island.

**News**

- RSS ingestion → editor queue.
- Raw items are shown with outbound links (noindex).
- Agrinvest's own "what it means for the farmer" pieces are indexed and linked to tools and products.
- Weekly newsletter.

**Exit:** every tool is live with correct data, cached, measured, and its SEO page validated.

## Phase 6: Article and keyword engine

**Goal:** a knowledge hub that Google and AI assistants quote.

**Scope**

- **Pillars:** wheat, corn, sunflower, rapeseed, barley, selling, storage, financing, fertilisation, crop protection, subsidies (APIA).
- **Clusters:** the farmers' questions from the keyword research.
- **Brief template** (stored in Payload): primary and secondary keywords, intent, SERP notes, outline, expert, internal links (product, price tool, base), FAQ.
- **Named expert authors** with author pages (E-E-A-T); a reviewer; the date each article was updated.
- A seasonal editorial calendar.
- Content refresh rules for articles that slip in the rankings.
- **First batch:** 20 briefs; the first 8–10 articles published with experts.

**Exit:** the briefs are approved, the first articles are live, and internal links are verified by a script.

## Phase 7: Social integration and the positive loop

**Goal:** the site and the social channels strengthen each other automatically.

**Inbound** (scheduled jobs)

- YouTube Data API.
- Meta Graph API for Facebook and Instagram (with business access).
- TikTok: Display API, with yt-dlp as fallback.
- LinkedIn: embeds or manual.
- Posts are stored with locally copied media and overrides: pin, hide, tag to a product, crop, base or article.
- Rendered on `/video`, on product and base pages and in guides, with VideoObject schema.
- YouTube transcripts become article drafts.

**Outbound**

- Auto-generated OG, square and story cards for every price update, article, new product and story.
- A weekly "prices of the week" post draft for human approval.
- UTM links everywhere; share actions.

**UGC**

- A farmer submission form with consent.
- Moderation in the admin.
- Shown in `/povesti` and on the matching product and base pages.
- Credited back on social.

**Exit:** feeds sync reliably, failures raise alerts, and every outbound card is generated correctly.

## Phase 8: Launch and migration

**Goal:** switch over without losing any ranking or order.

**Scope**

- Full QA: Playwright end-to-end tests, accessibility (WCAG AA), Core Web Vitals budgets, schema validation.
- **Redirect test:** every old URL returns a 301 → 200, with no chains.
- Content sign-off.
- DNS cutover; agrinvestshop.ro redirects to `/magazin`, and the old domain is kept renewed.
- Submit the sitemaps; IndexNow.
- Two weeks of daily monitoring for coverage and 404s.

**Exit**

- Stable for 2 weeks; no unresolved 404s from old URLs; orders and leads flowing.

## Phase 9: Admin panel for staff (next phase, planned later)

- A custom Payload dashboard and roles (editor, sales, prices, shop, IFN).
- A finance-application inbox with status tracking.
- A fast **daily price-entry screen**; product-enrichment workflow; UGC moderation queue; lead inbox.
- Automated price feeds; editorial approval flow; usage training.

## Phase 10: Growth (ongoing)

- Monthly ranking report against the keyword map.
- Article production from the backlog; refreshes; new tool features (alerts, forecasts).
- Link-building through the market note and press data.
- AI-assistant answer tests every quarter.

---

## Inputs needed from Agrinvest (tracked in `docs/decisions/`)

- Confirmation of the figures register.
- Stock and new prices for every pilot product.
- Online payment methods, invoicing system, delivery zones.
- Who enters grain and diesel prices, and how often.
- Permission to use the YouTube and TV footage.
- Business access to the Meta, TikTok and YouTube accounts.
- Legal check on selling professional-use plant-protection products online.
- Named experts for the guides.
- **IFN:** current products and limits, publishable figures, APIA-scheme participation, the correct address, permission to name funding partners, legal adviser for finance content.

## How we work (execution model)

1. **On approval:** Phase 0 starts. The repo `site/` is created, and this roadmap is saved as `site/docs/ROADMAP.md`. A `site/CLAUDE.md` is added with the conventions every session must follow: stack, folder rules, token-only styling, RO/EN rules, the SEO checklist, the definition of done.
2. **One phase = one fresh session in plan mode.** Prompt: _"Plan Phase N from `site/docs/ROADMAP.md`"_. That plan is saved as `site/docs/phases/NN-name.md`, then executed.
3. **Big phases are split into sub-phases**, each with its own session: Phase 1 (1.1 direction → 1.2 foundations → 1.3–1.4 components → 1.5 templates), Phase 3 (model → pilot import → enrichment → commerce), Phase 5 (one tool per sub-phase).
4. **Gates:** every phase ends on a Vercel preview URL. You review it; decisions go into `site/docs/decisions/`.
5. **Git:** one branch per phase, small commits, merged after the gate.
6. **Agrinvest inputs requested early** (the list above), especially account access, footage permission, pilot product prices and stock, and IFN confirmations, so no phase waits on them.

## Verification (applies to every phase)

- **CI:** typecheck, lint, unit tests, Playwright end-to-end tests, Storybook visual tests.
- **SEO checker** (ported from HamidHosseini `scripts/check/seo.ts`): one H1, title and meta lengths, canonical, hreflang pairs, valid JSON-LD on every template.
- **Lighthouse CI** on mobile: LCP < 2.0 s, CLS < 0.05, INP < 200 ms.
- **Screenshot review loop** at 390 / 768 / 1440 px in RO and EN, with the rubric.
- Google Rich Results Test on the product, article, base, video and dataset pages.
- **After launch:** weekly Search Console checks on positions for the priority keywords.
