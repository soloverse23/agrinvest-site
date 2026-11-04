# Phase 3: shop

Status: **3.1 and 3.2 built (2026-11-04), waiting for owner review; 3.3 next.** Plan approved 2026-11-04. This doc is kept updated per sub-phase. Decisions go in `docs/decisions/0006…`.

## Context

The core site is built, but the shop does not exist yet: no product collections, no `/magazin` routes, and only `ProductCard` among the commerce patterns. Phase 3 replaces agrinvestshop.ro with the best agri-input product pages in Romania, for both sales and SEO / AEO. The 77 exported products are poor data: no SKUs, 70 with the pack size in the name, doses and active ingredients as free text, and a brand on only 1 product.

Owner decisions (2026-11-04):

- **Pilot products are shown in full, with more detail and their current price.** This replaces the roadmap's "hidden or request a quote".
- **Checkout:** build the order flow now and add providers later. The customer can ask for a consultant to contact them about payment options.
- **Carts and orders use our own collections**, not the Payload ecommerce plugin (beta, Stripe only, no shipping or tax). This updates decision 0001.
- **Enrichment:** I fill each product with the best detail I can find, written to work for SEO, AEO and selling, with strong brand and category management.

Assumptions to correct at review:

- **`pilot` still means "Agrinvest has not confirmed this".** The price shows with the existing "de confirmat" marker while the site is noindex. A new check warns now and fails when `SITE_INDEXABLE=true`, so nothing launches unconfirmed by accident. The owner can change this rule before Phase 8.
- **Pilot products can be ordered, because an order is a request.** No money is taken online in this phase. A consultant confirms stock, price and payment before anything is invoiced.
- **Checkout is guest-only in this phase.** Buyers choose person or company, with no login. The roadmap's "accounts" move to Phase 9 unless the owner wants them now.
- **English parity (decision 0005) applies:** all 77 products and every listing exist in English. This replaces the roadmap's "selected product pages".

## Setup

- Branch `phase-3/shop` from the current head. The Phase 2 gate is still open (Vercel preview and owner review), so Phase 2 fixes merge in if needed.
- Before coding, read `.claude/skills/payload/SKILL.md` and the Next 16 guides in `node_modules/next/dist/docs/`.
- Four sub-phases, each with its own session and gate: **3.1 model → 3.2 import and catalogue → 3.3 enrichment → 3.4 commerce and gate.**

---

## 3.1 Product model, taxonomies and foundations

### Foundations to fix first

- **Access:** `isStaff` and `publishedOrStaff` in `src/access/index.ts` trust any `req.user`. Restrict them to `req.user.collection === 'users'`.
- **Crops:** `key` allows only 5 grains, and every crop gets a `/cereale/{crop}` page. Open the list and add `isGrain`, so grain pages, sitemaps and maps filter on it. Soy, potato, vegetables, alfalfa and others then exist for the shop only.
- **Migrations:** no production path exists, and orders are real data. Add `src/migrations`, a baseline migration and a documented deploy step. Development keeps schema push.

### Collections

Shared fields come from `src/fields/`, tags from `src/lib/revalidate.ts`, and the hook pattern from `Crops.ts`. User-facing text is localized.

| Collection            | Key fields                                                                                                                                                                                                                                                          |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Products**          | name, slug, `productType` (protection, seed, fertiliser, other), `commerceStatus` (`pilot`, `live`), primary category, secondary categories, brand, crops, targets, summary (AEO answer), description, gallery, documents, FAQ, SEO, related products, source notes |
| `variants` (array)    | pack size and unit, SKU, price (RON), VAT rate, stock status, computed unit price (lei/l, lei/kg), stable ID for order lines                                                                                                                                        |
| Protection fields     | active ingredients with concentration, formulation, registration number and validity, dose table (crop, target, BBCH, dose, water volume, max treatments, waiting period), mode of action / resistance group, toxicity and safety, `professionalUse`, compatibility |
| Seed fields           | species, variety or hybrid, FAO group, maturity, sowing density, seeds or kg per ha, yield potential, resistances, recommended zones, seed treatment                                                                                                                |
| Fertiliser fields     | N-P-K-S and micronutrients, form and granule size, timing and rates by crop, storage                                                                                                                                                                                |
| **Categories**        | name, slug (reserved words blocked), parent, order, icon, intro, buying advice, FAQ, SEO, featured products, facets to show, `indexable`                                                                                                                            |
| **Brands**            | name, slug, logo, country, website, intro, FAQ, SEO, `indexable`, featured products                                                                                                                                                                                 |
| **ActiveIngredients** | name, slug, chemical group, resistance group, intro, FAQ, SEO, `indexable`                                                                                                                                                                                          |
| **Targets**           | name, slug, kind (weed, disease, pest, deficiency), crops                                                                                                                                                                                                           |
| **Documents**         | upload collection for PDFs (technical sheet, safety sheet, label), with language, version and source. `Media` stays images and video                                                                                                                                |
| **PriceHistory**      | variant, price, date, source. Written by a hook whenever a price changes                                                                                                                                                                                            |

Each data group on a product (technical, dose, price and stock) reuses `factStatus` and stores its source URL. Every value can then be traced and shows whether Agrinvest has confirmed it.

### Category tree

Top-level and leaf categories all use one-segment URLs, so `/magazin/{categorie}/{produs}` holds and the keyword-map targets stay valid.

- **Semințe** (`seminte`)
- **Protecția plantelor** (`protectia-plantelor`): erbicide, fungicide, insecticide, tratament-samanta, adjuvanti, regulatori-de-crestere
- **Nutriție** (`nutritie`): ingrasaminte, fertilizanti-foliare
- **Agricultură bio** (`agricultura-bio`): a secondary category, never a product's primary one

The old `pesticide` bucket (10 products) is retired: each product moves to its real category in 3.3. The 5 two-category products get a primary category.

### Admin management (brands and categories)

- Category tree order, product counts in the Brand, Category and Ingredient lists, and useful list columns and filters.
- A completeness view on Products: which groups are missing or unconfirmed.
- Hubs turn indexable only when `indexable` is on, they have their own intro, and they hold at least 3 products. Thin hubs stay noindex automatically.

**3.1 exit:** the model is in the admin with the tree seeded; `isGrain` leaves all grain pages unchanged; integration tests cover access, variants, price history and hub rules.

### 3.1 progress (2026-11-04)

**Built**

- **Foundations:** staff access means `users` accounts only (`staffRequest` in `src/access`). Crops are open to new entries, with `isGrain`: 5 grains plus 8 shop-only crops (soy, triticale, potato, sugar beet, alfalfa, vegetables, fruit trees, grapevine), and `listCrops`, lead options and the CropList block stay grain-only. Each crop has a `shop` group for its hub.
- **Migrations:** `src/migrations/` with a baseline, `npm run migrate` and `migrate:create`, and a CI step that fails when collections and migrations disagree. The steps are in the README.
- **Model:** Products (variants, protection, seed and fertiliser groups, verification per data group), Categories, Brands, ActiveIngredients, Targets, Documents, PriceHistory. Admin group "Magazin", Romanian and English labels.
- **Rules (`src/lib/shop/rules.ts`):** unit price, `productGaps`, `liveBlockers`, `isHubIndexable`, reserved category slugs. They are plain functions, ready for `check:products`.
- **Admin:** a "De completat" column on Products, and the products of each category, brand and ingredient on its own page.
- **Seed:** the 12-category tree and the shop crops, in both languages.

**Results**

- typecheck, lint, format, `next build`, `test:int` (51) and `test:e2e` (51) pass. `check:seo`: 70 pages, 0 errors. `check:aeo`: 32 of 32. `check:figures`: 41 unconfirmed (warning, unchanged). The crops sitemap still has 10 URLs, and `/cereale/soia` returns 404.
- The baseline migration applied cleanly to an empty database. Lighthouse was not rerun: no public page changed.

**Deviations from the plan**

- **Categories have a `role`** (`group`, `category`, `theme`). The primary category must be a `category`, which is how "bio is never primary" and "groups hold no products" are enforced.
- **`gaps` is a virtual field**, computed on read and staff-only. It is never stale, but the list cannot be filtered by it.
- **PriceHistory is keyed by SKU**, not the variant row, with an optional product link, so the history outlives a deleted product. It records published prices only and compares with its own last row. Rows are staff-only until Phase 5.
- **Documents default to rights `pending`**, which hides them from the public until reuse is allowed.
- **Product slugs are shared by both languages**, like bases. Category, crop and ingredient slugs are per language.
- **`Document` type:** the collection generates `ProductDocument`, so it cannot shadow the DOM type.

**Found while building**

- **Postgres cuts identifiers at 63 characters.** The default table for `activeIngredients` gave a foreign key of 88 characters, so every start saw a schema difference and rebuilt it, and parallel test workers failed at random. The array now has `dbName: 'product_ingredients'`, and a test fails on any identifier over the limit. Watch this on deep arrays in versioned collections.
- **A schema push can wait forever for a yes.** Changing `crops.key` from enum to text stopped the seed at a hidden prompt. Existing local databases need the column converted first; fresh databases (CI, production) are not affected.

**Open for 3.2**

- Check how the list column shows product counts on real data once products exist.
- `pingIndexNow` is not wired on products yet, because the routes do not exist.

---

## 3.2 Pilot import and catalogue pages

### Import (`scripts/import/woo.ts`)

- Reads `docs/audit/products-raw.json`, so it needs no network and is idempotent.
- Decodes HTML, parses active ingredients, dose prose and the 38 HTML tables into structured fields, and takes the pack size from the name.
- **Merges pack-size families** (AMINO 1L/20L, OBI, AMAZONAS) into one product with variants. The two AVENUE 800 kg products are kept apart and listed for Agrinvest.
- Sets every product to `pilot` and published, with `is_in_stock` and the current `price`. Writes a report of everything it could not parse.
- **Regenerates redirect targets** after merges and the `pesticide` retirement. `audit:redirects` is updated so old URLs have no chains.
- Generates the SKU as a stable internal code until Agrinvest supplies real ones.
- CI has no product images (23 MB, gitignored). The seed uses a small committed fixture set, and product pages must look complete without photos.

### Routes

Add `shop` to `src/i18n/routes.ts`. Twin route folders share templates in `src/components/templates/`, following `CropPage.tsx`.

| RO                                                                  | EN                                                          | Index                                   |
| ------------------------------------------------------------------- | ----------------------------------------------------------- | --------------------------------------- |
| `/magazin`, `/magazin/{categorie}`, `/magazin/{categorie}/{produs}` | `/en/shop/…`                                                | yes                                     |
| `/magazin/cultura/{x}`, `/substanta-activa/{x}`, `/producator/{x}`  | `/en/shop/crop/{x}`, `/active-ingredient/{x}`, `/brand/{x}` | when the hub rules pass                 |
| `/magazin/cautare`, any filter URL                                  | same                                                        | noindex, canonical to the clean listing |

### Components (`design-system/patterns/`, each with a story)

Extend `ProductCard`. Add FacetPanel, ProductGallery, DoseTable, SpecSheet, PackSizeSelector and DocumentList.

- Filters are plain links or GET forms, rendered on the server. Only the pack-size selector and add-to-cart need client code. The 160 KB script budget and 0 stylesheets still apply.
- Search is a server query over names, ingredients, brands and crops, which is enough for this catalogue size.

### Product page

Summary answer near the top, price with unit price and VAT note, pack sizes, stock, add to cart, consultant contact, then spec sheet, dose table, safety, documents, FAQ, related products, the "updated on" date and links to crop, ingredient and brand hubs.

**Discounts:** only the current price is shown, with no struck-through old price. The old price has no valid history behind it. Wing P 10L (720 vs 1,450 lei) goes on the list for Agrinvest.

### SEO and AEO

- Add `product`, `offer`, `aggregateOffer` and `itemList` builders to `src/lib/schema/`.
- **`pilot` products publish Product schema without Offer**, because `CLAUDE.md` says JSON-LD states a fact only once confirmed. The visible price still shows.
- Add `products`, `categories` and `hubs` to the sitemap segments, and extend `llms.txt`.
- Extend `check:seo` with the Product type and the filter canonical rule, and confirm how the crawler treats query strings.
- Add shop questions to `aeo-queries.md`, plus RO keyword rows and new EN rows to `keyword-map.csv`.
- Add shop entries to the seeded menu, the mega menu and home.

**3.2 exit:** all 77 imported; listings, hubs, search and product pages work in RO and EN; `check:seo` has 0 errors; Lighthouse budgets pass on listing, hub and product.

### 3.2 progress (2026-11-04)

**Built**

- **Import:** `scripts/import/woo-plan.ts` is a pure planner shared by the importer (`woo.ts`, part of `npm run seed`), the redirect map and the report (`npm run audit:import` → `docs/audit/import-report.md`). 77 records became 72 products (5 pack families merged; 71 published, 1 draft), 180 dose rows on 34 products, active ingredients on 32 products. `redirect-map.csv` is regenerated from the plan: all 77 old products resolve.
- **Pages, RO and EN:** shop home, categories (with group pages), crop, brand and ingredient hubs, search, product pages. Shared templates `ShopListing`, `ProductPage`, `ShopParts`; strings in `src/i18n/shop.ts`.
- **Components:** FacetPanel, ProductGallery, PackTable, DoseTable, SpecSheet, DocumentList, ShopTile, with stories. `ProductCard` reworked (`Photo` instead of `next/image`, optional data).
- **Model:** dose rows keep the source wording (`cropText`, `targetText`, `timing`, `doseText`) next to the parsed values; a row links to several crops; `legacySlugs`. Migration `shop_catalogue`.
- **SEO and AEO:** `product` and `itemList` JSON-LD, sitemap segments `products`, `categories`, `hubs`, `llms.txt`, shop menu, category intros in both languages. `check:seo` knows the shop templates and fails on an Offer for an unconfirmed product. 7 AEO questions and 3 English keyword rows added. Pilot prices are tagged, so `check:figures` lists them.

**Results**

- typecheck, lint, format, `next build`, `test:int`, `test:e2e` pass. `check:seo`: 342 pages, 0 errors. `check:aeo`: 39 of 39. Keyword map: 31 of 59 URLs built. Both migrations apply to an empty database.
- Lighthouse on 5 shop templates, mobile, applied throttling, 2 runs each, 0 failed assertions: listing, hub and home performance 100, LCP 1,35 s, 144 KB of script; product performance 99, LCP 1,9 s, 148 KB; accessibility 100 and CLS 0 on all. The product page's LCP is the photo, and has little room under the 2,0 s budget. Recheck on the preview with real image hosting.
- Axe passes on all Patterns stories, with no overflow at 390 / 768 / 1440 in RO and EN.

**Deviations from the plan**

- **PackTable instead of PackSizeSelector:** every pack and price is in the HTML and needs no JavaScript, which is also better for search. Add to cart goes on each row in 3.4.
- **Quote leads use the existing `inputuri` form** with the product's URL as source. The `product` field on Leads stays in 3.4.
- **Brands:** only 4 products have one so far (the ones named in their own text). The rest come from enrichment, so the brand filter and hubs are thin until 3.3.
- **Targets are not linked yet:** the text stays in `targetText`, and the target filter is off. Turning free text into clean Targets belongs to 3.3.
- **No committed image fixtures:** pages are complete without photos, so CI runs without any. Product photos load on local databases only, with rights pending.
- **Categories follow the hub rule too**, so they are indexable only with an intro and 3 products. "Regulatori de creștere" has 1 product and stays out of the index.
- **Listings render per request** because filters are in the query string; their data is cached. Revisit CDN caching in Phase 8.
- **No pagination:** the largest listing has 38 products.
- **English text:** names and interface are translated. Summaries are built from the data and doses show the label's numbers. Descriptions, targets and timing stay empty until 3.3, and shop reads use no language fallback.

**Found in the old data** (`import-report.md`, 33 products to check)

- Texts reused on the wrong product: Listego and Uree carry the ammonium nitrate summary; Zanzibar and Su Ellen barley are described as wheat. These summaries are not used.
- Jolpolt, an oil adjuvant, lists deltamethrin as its active substance. Compositions of adjuvants and mixed products are left for hand entry.
- Principal Forte shows only part of its composition. Frontier Forte gives dimetenamid where its text says dimetenamid-P.
- Prices to check: Wing P, the two Avenue products, Corida (19.380 lei/kg).
- Old `pesticide` products were placed by their own text; Jolpolt moved from insecticides to adjuvants.

**Open for 3.3**

- All descriptions are still the old text (cedilla letters fixed, missing diacritics not). Enrichment rewrites them and the English.
- `inputuri` has no seeded route, so quote leads go to the general contact until Agrinvest names someone.

---

## 3.3 Enrichment of the 77 products

- **Output:** one reviewed file per product in `data/products/{slug}.json` (committed, RO and EN), applied by the seed. The admin can take over later.
- **Sources, in order:** the official plant-protection register, manufacturer labels and technical sheets, seed catalogues, then the old shop text. Each group stores its source URL. Sheets are stored as Documents only where reuse is allowed; otherwise the page links to the source.
- **Text:** original descriptions with no copied manufacturer text. Each product gets a primary keyword from the keyword map, a direct answer summary, and FAQs only for real questions.
- **Brands:** the real manufacturer replaces the false "Agrinvest" attribute. Brand, category, crop and ingredient hub intros are written in the same pass.
- **Safety rule:** dose, waiting period and toxicity come only from a label or the register, never inferred. If no source is found the row stays empty, and the page says to ask a consultant.
- **Registration check:** a protection product with an expired or missing registration is flagged and cannot move to `live`.
- **Known fixes:** "Samanta Orz ZANZIBAR" is described as wheat. Other conflicts go on a list for Agrinvest.
- **`check:products`:** new script reporting completeness per product, unconfirmed values and missing sources. It warns now and fails on any `pilot` product when `SITE_INDEXABLE=true`.
- **Catalogue gap:** maize and sunflower seed are priority-1 keywords with no products. This goes to Agrinvest as a question.

**3.3 exit:** all 77 pass `check:products` for completeness or carry a named gap; the Agrinvest verification list is ready, grouped by product.

---

## 3.4 Commerce

### Cart

**Carts** collection with an anonymous cookie ID and server actions. Prices are always re-read on the server. The cart page is dynamic and noindex (`/cos`, `/en/cart`), and the header count stays a tiny island.

### Checkout (`/comanda`, `/en/checkout`, noindex)

1. **Buyer:** person or company. Phone and email are required, as on leads.
2. **Company lookup:** a server route calls the ANAF public service, cached and rate limited, with manual entry as the fallback. The current endpoint version is checked at build time.
3. **Delivery:** address and county, or pickup at a base. Cost is "to be confirmed" until delivery zones arrive.
4. **Certificate:** for `professionalUse` lines, certificate number and expiry are captured. The final rule follows the legal check.
5. **Payment:** "Vreau să mă contacteze un consultant" is the default, with bank transfer with proforma beside it. Card appears only when a provider exists.
6. **Consents:** GDPR and terms.

### Orders

- **Orders** collection: reference number, snapshot of lines and prices, buyer, delivery, payment choice, status (`new`, `contacted`, `confirmed`, `paid`, `delivered`, `cancelled`), `assignedTo`, staff notes. Staff access only.
- Routing reuses Lead routing with the `inputuri` type, which has no seeded route today and falls back to `general`.
- The confirmation screen shows the reference number and the assigned consultant.
- The reserved GA4 `order` event is wired in.

### Bulk quote and quote leads

Add a `product` field to Leads (`Leads.ts`, `state.ts`, `form.ts`, `actions.ts`, `LeadForm`). Use it for "cere ofertă pentru cantități mari" on every product and in the cart.

### Provider interfaces (`src/lib/commerce/`)

Small typed interfaces, each with a working default:

| Interface  | Default now                  | Later                      |
| ---------- | ---------------------------- | -------------------------- |
| `payment`  | consultant, proforma request | card provider              |
| `invoice`  | no-op                        | SmartBill or Oblio         |
| `delivery` | "to be confirmed"            | zones, fleet, courier      |
| `notify`   | no-op, like `notifyLead`     | the owner's chosen channel |

**Staff are not alerted and customers get no email until the owner picks a channel.** Orders appear only in the admin. This must be solved before real orders are accepted, and it goes on the Phase 8 blockers list.

### Legal pages

Terms of sale, delivery and returns pages as marked drafts, with the withdrawal right and ANPC links for review by Agrinvest's lawyer.

**3.4 exit:** a test order works end to end in RO and EN, for person and company, and reaches the admin routed to a named person.

---

## Phase exit, adjusted to the decisions above

- All 77 pilot products are enriched, and every gap is named.
- Products Agrinvest has confirmed are `live`.
- Test orders work. Real payment, invoicing and delivery wait for the providers.
- Rich Results is valid on the deployed preview, using a confirmed product (Offer) and a pilot product.
- The owner approves the preview. This needs the Vercel link still open from Phase 2.

## Added to `agrinvest-inputs.md`

- Do current prices include VAT, and at what rate?
- Wing P 10L's price, and the two AVENUE 800 kg prices.
- Real SKUs.
- Maize and sunflower seed range.
- Who receives orders (`inputuri` route).
- Terms of sale.
- Existing asks stay open: stock and prices, sheets, the 15 unmatched products, payment, invoicing, delivery, and the legal check. My search found no clear rule on online sale of professional-use products, so that one needs a real legal answer.

## Out of scope

Price pages on `/preturi/ingrasaminte` (Phase 5, the history is recorded now); pay-at-harvest at checkout (Phase 4); guides and videos in relations until they exist (Phases 6–7); UGC (Phase 7); customer accounts and the order inbox (Phase 9); choosing a notification channel (owner).

## Critical files

- **New:** `src/collections/{Products,Categories,Brands,ActiveIngredients,Targets,Documents,PriceHistory,Carts,Orders}.ts`, `src/lib/commerce/*`, `src/lib/content/shop.ts`, `src/components/templates/{ProductPage,ShopListing,ShopHub}.tsx`, `src/app/(frontend)/[locale]/{magazin,shop,cos,cart,comanda,checkout}/`, `scripts/import/woo.ts`, `scripts/checks/products.ts`, `data/products/*.json`, `src/migrations/`, new patterns in `design-system/patterns/`.
- **Changed:** `src/access/index.ts`, `src/collections/{Crops,Leads}.ts`, `src/payload.config.ts`, `src/i18n/routes.ts`, `src/lib/revalidate.ts`, `src/lib/schema/index.ts`, `src/lib/seo/sitemap.ts`, `src/app/llms.txt/route.ts`, `src/lib/leads/{types,state,form,actions}.ts`, `scripts/seed/*`, `scripts/audit/redirects.ts`, `scripts/checks/seo.ts`, `lighthouserc.json`, `.github/workflows/ci.yml`, `docs/audit/{keyword-map.csv,redirect-map.csv,aeo-queries.md,agrinvest-inputs.md}`, `docs/decisions/`.
- **Reused:** `src/fields/index.ts`, `src/lib/format.ts`, `buildMetadata`, `FactMark`, `LeadForm`, `ProductCard`, `Photo`, `Accordion`, `Breadcrumbs`, Lead routing.

## Verification

- **Each sub-phase:** the `CLAUDE.md` definition of done (`typecheck`, `lint`, `format:check`, `build`, `test:int`, `test:e2e`, `check:seo` with 0 errors) and stories for new components.
- **Integration:** customer-side requests cannot reach staff data; the importer parses a sample of each text format; family merges keep every old URL redirected; price changes write history; pilot products have no Offer; server prices override tampered cart values; order routing.
- **e2e:** every shop template returns 200 in RO and EN; filters work without JavaScript and are noindex with the right canonical; add to cart through to confirmation as person and as company; ANAF failure falls back to manual entry; a certificate is required for professional-use lines.
- **Run:** `npm run seed && npm run build && npm start`, then `check:seo`, `check:products`, `check:figures`, `check:aeo`, Lighthouse CI on the new templates, `review:shoot` (RO and EN at 390 / 768 / 1440), and the Rich Results Test on the preview.
