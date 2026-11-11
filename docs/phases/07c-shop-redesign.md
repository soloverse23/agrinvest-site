# Phase 7c: shop redesign and purchase funnel

Status (2026-11-11): 7c.1–7c.4 built, wired and released on the owner's request ("ship it with the sample and demo data"): the `apply:shop` deploy step and the rehearsal from 7c.6 are done. Still open: 7c.5 (cart and checkout), and from 7c.6 the label safety data, the e2e additions and Lighthouse.

## Context

The shop (Phase 3) works, but it reads like a catalogue, not a store. Owner review on 2026-11-11:

- The shop landing needs a strong, shop-like hero.
- The categories and listing pages should feel like real e-commerce.
- Product pages need fuller, more useful information, for example doses you can work with.
- The quote form is badly designed and badly placed.
- The checkout page and its form are not good enough.

Problems seen on the current pages (screenshots taken 2026-11-11 at 1440 and 390 px):

- `/magazin`: a plain title band and a search field. Category tiles are text-only boxes. Crop chips sit in a cloud. The product grid is the only "shop" element.
- Listings: the filter column is a long, flat list. There is no sort, no active-filter chips, no mobile drawer and no results toolbar. Cards are tall and have a single "Vezi produsul" button, so nothing can be bought from the list.
- Product page:
  - The buy area is a table.
  - "Cere ofertă" jumps to a long form at the bottom of the page.
  - The dose table's "Combate" column is a wall of text.
  - The imported description repeats the doses and specs as one block without diacritics.
  - Safety is a paragraph.
  - There are no key facts near the price.
- Checkout:
  - It is one long single-column form with full-width inputs.
  - Radio cards are as big as inputs.
  - The summary has no thumbnails and does not stay on screen.
  - The consents are three loose checkboxes.
  - There is no sense of progress.

## Owner decisions (2026-11-11)

1. **Shop hero: search first.** A dark green band with:
   - a large search field with live suggestions;
   - crop quick-picks under the search;
   - a seasonal promo card on the right;
   - a category rail with icons under the band.
2. **Product page: sticky buy box and dose calculator.**
   - The gallery is on the left. The buy box on the right stays on screen while the page scrolls. It has:
     - key-fact chips;
     - pack chips;
     - a quantity stepper;
     - add to cart;
     - the quick request.
   - The dose calculator works out hectares × label dose → litres or kg → the packs to buy, and adds them to the cart in one click.
   - Below the gallery and buy box, an anchored tab bar: Doze · Date tehnice · Spectru · Siguranță · Documente · Întrebări.
3. **Quote becomes a one-field quick request.** One field (phone **or** email) and one button. The visitor keeps shopping. It sits in the buy box, under add to cart, and reuses the same component wherever a quote is offered (unpriced or on-request cards, cart, empty search). It replaces the long form at the bottom of the product page. **This changes a standing rule** ("leads collect phone and email"): see decision `0010-quick-request.md`.
4. **Checkout: one page with numbered cards.**
   - A progress bar: Coș → Date → Livrare → Confirmare.
   - Compact cards with two-column fields. The buyer type is a segmented control. The CUI lookup fills in the company.
   - Delivery and base pickup are visual cards. Pickup lists the bases with their addresses.
   - The certificate card appears only when the cart needs it.
   - The order summary stays on screen, with thumbnails and editable quantities. On phones it folds into an accordion at the top.

## Standing rules for this phase

- Keep every URL, the canonical and hreflang rules, the JSON-LD types and the facet indexing rules (`hubIndexable`, noindex on filtered URLs). This is a redesign, not an IA change. `check:seo` must not get worse than the known demo-data errors (44).
- Server components by default. Client code only for:
  - the search suggestions;
  - the calculator;
  - the quick request;
  - the quantity steppers;
  - the mobile filter drawer, which must still work without JS through `<details>`.
- Islands load through `Lazy.tsx`, so the shared chunk does not grow. The 7b trap: a direct import puts the code in the shared chunk. Budget: `/finantare/aplica` stays ≤ 160 KB, and `check:budget` reports 0 over.
- Only design-system tokens. New patterns get stories.
- Every string in RO and EN, with ș ț (comma below).
- Doses are shown only from the label or register data already in the model. Never inferred. The calculator uses `doseMin`/`doseMax`/`doseUnit` (79 of 97 protection rows and all 33 fertiliser rates have them). A row without numbers shows the label text and "calculează cu consultantul".
- OUG 53/2025 checks (`orderBlock`) apply to every new add-to-cart path, including the calculator and card buttons.
- Show design shots (1440 and 390) to the owner before wiring each page, and after each step.
- Run Lighthouse once, in 7c.6.
- Commit only when asked.
- Another chat may be working in the same tree. Check `git status` and `ps` before touching shared files.

## Steps

### 7c.1 Foundations: quick request, dose maths, card, data additions

- **Quick request (decision 0010):**
  - `Leads`: `phone`, `email` and `name` are no longer required. A collection-level validation requires at least one contact, plus `name` for every type except `quick`.
  - Add the lead type `quick`, labelled "Cerere rapidă" / "Quick request". It keeps `products`, `variant`, `quantity`, `hectares` and the source path.
  - Migration.
  - `submitQuickRequest` server action: one input, detected as a phone (`normalizePhone`) or an email; the same rate limit; `notifyLead` (still a no-op).
  - `design-system/patterns/QuickRequest.tsx`: an inline field and button. After sending it shows "Te contactăm în curând" with an "adaugă și telefonul" link. It has a no-JS form fallback.
  - The privacy notice is a line under the button with a link, not a checkbox (the legal basis is the visitor's own request, GDPR art. 6(1)(b)). This needs owner confirmation: see the open points.
- **Dose maths** (`src/lib/shop/dose.ts`, with unit tests):
  - unit conversion (l, ml, kg, g, % with a water volume);
  - total = area × dose;
  - the pack mix with the least waste, then the fewest packs, from the product's in-stock priced variants;
  - the cost of that mix.
  - Seeds: seeds per hectare → bags, only when `sowingRate` parses; otherwise the text only.
- **Product card v2** (`ProductCard`, `ShopParts`):
  - square photo on a neutral background;
  - brand, name, active ingredient or main nutrient;
  - two key chips (formulation, crops);
  - price, plus price per l or kg, plus the "de confirmat" marker;
  - stock.
  - The action depends on the product:
    - one buyable pack: quick add to cart;
    - several packs: "Alege ambalajul" → the product page;
    - no price or on request: quick request.
  - A shorter card and a denser grid (4 columns at 1440, 2 on phones).
- **Category icons:** add an `icon` select on Categories, picking from a small set in `design-system/icons` (seed, herbicide, fungicide, insecticide, foliar, fertiliser, bio, other). Seed it and add it to the apply step.
- **Shop home global** (`ShopHome`, staff-editable, localized):
  - the promo card: kicker, title, text, link (a category, crop or filter URL), image, and an end date after which it hides;
  - featured products (up to 8).
  - With no promo, the card falls back to the category with the most in-stock products for the current season (a computed default).
- **Safety data for the product page:** in `protection`, add:
  - `signalWord` (Atenție / Pericol);
  - `ghsPictograms` (a hasMany select, GHS01–09);
  - `hazardStatements` (localized text);
  - `bufferZone` (text).
  - Fill them only from labels (Bayer label PDFs work, per the 3.3 sources). Products without them keep the `safety` text.
- Stories: QuickRequest, ProductCard v2 (all action states), CategoryRail, the calculator's states.

### 7c.2 Shop landing `/magazin` and `/en/shop`

- **Hero band:**
  - The H1 stays "Magazin de inputuri agricole".
  - A short line with the live counts: the number of products and in-stock items.
  - The large search, with suggestions as you type (product, active ingredient, brand, crop) from a small JSON index of about 10 KB or less, loaded on first focus. Enter goes to `/magazin/cautare`, as now.
  - Crop quick-pick chips: the top 6 by product count, then "toate culturile".
  - The promo card on the right; on phones it moves under the search.
- **Category rail:** an icon tile for each top category, with its count and its subcategories on hover or tap (desktop) or as a horizontal scroll row (phones).
- **Sections below** (each one appears only when it has data):
  - Recomandate: featured products, or the newest in stock;
  - Pe culturi: crop tiles with a photo;
  - Producători: a brand logo or name strip linking to the brand hubs;
  - a trust row: a consultant confirms the price, pickup from the bases (`<Fact>`), financing of inputs (link), professional-use certificate;
  - the FAQ.
- The home page's shop strip and the mega-menu panel reuse the new card and rail. No change to their layout.
- SEO: the same title and description sources, CollectionPage + ItemList.

### 7c.3 Category, hub and search listings

- **Header:**
  - breadcrumbs, H1, intro (2 lines, with "mai mult" for the rest);
  - subcategory chips with counts;
  - for a top category, its subcategory tiles with icons.
- **Toolbar:**
  - the results count;
  - active filter chips, each removable, plus "Șterge filtrele";
  - sort: relevance, price ascending and descending, price per l or kg, name, newest. These are links, so they work without JS, and the sorted URLs stay noindex as now;
  - a grid or list view toggle (stored in the URL; list view shows the dose and the crops).
- **Facets:**
  - grouped and collapsible, with counts;
  - "arată toate" after 6 options;
  - price range presets;
  - stock;
  - on phones, a "Filtre (n)" button opens a full-height drawer (`<details>` + CSS; JS only for the focus trap).
- Pagination at 24 per page, with `rel` links and `?pagina=2` (noindex, canonical to page 1, as the facet rules require). Check the current largest listing first. If none goes over 24, build it but it stays dormant.
- The buying advice and FAQ move below the grid. An empty state offers the quick request: "Nu găsești? Lasă telefonul".
- The same template serves the crop, brand, active-ingredient and search listings.

### 7c.4 Product page

- **Above the fold:**
  - **Gallery** (left, 6 of 12 columns): thumbnails and zoom on click (a dialog). The badges are moved over the image: "Uz profesional" and the stock.
  - **Buy box** (right, sticky from `lg`), in order:
    - brand link, H1, the summary in 2 lines;
    - key-fact chips: active ingredients with concentration, formulation, HRAC/FRAC/IRAC group, PHI, crops (the first 3, then +n);
    - pack chips (radio, so it works without JS) with the price for each pack and the price per l or kg;
    - quantity stepper, a large "Adaugă în coș", and the line total;
    - the quick request: "Vrei ofertă pentru cantitate mare? [telefon sau e-mail] [Sună-mă]";
    - finance hint, price note, updated date;
    - the OUG 53 block notice replaces the buy controls when it applies.
  - **Phones:** a bottom sticky bar with the price and add to cart appears once the buy box scrolls out of view.
- **Dose calculator** (a card directly under the buy box on desktop, the first item in the Doze tab on phones):
  - pick the use: crop and timing, from the dose rows;
  - the dose: the label minimum to maximum, defaulting to the minimum, with a slider and an input limited to that range;
  - the area in ha;
  - the result: the total quantity, the suggested pack mix, the cost and the water volume needed;
  - "Adaugă în coș" adds the whole mix (a new action `addManyToCart`, the same checks).
  - It sends `hectares` to the quick request when used.
  - The line "Respectă întotdeauna eticheta" stays visible.
- **Anchored tab bar** (sticky under the header; links to sections, not hidden panels, so all content stays in the HTML for SEO and AEO):
  - **Doze:** one card for each use: crop, dose (large), timing with BBCH, water, PHI, maximum number of treatments, notes. The targets of a row are a short chip list, folded after 6 with "+n", in place of the wall of text.
  - **Date tehnice:** a two-column definition grid, grouped (Identificare · Formulare · Mod de acțiune · Omologare).
  - **Spectru:** the targets grouped by type (weeds, diseases, pests), each linked to its target hub when one exists.
  - **Siguranță:** the signal word, GHS pictograms, H statements, buffer zone and protective equipment. Fallback: the `safety` text.
  - **Documente:** download tiles (label, technical sheet, safety data sheet) with the type and size.
  - **Descriere:** the rich text, folded after about 12 lines with "Citește tot". It is not rewritten in this phase. Cleaning the imported texts is a separate content task (see the open points).
  - **Întrebări:** the FAQ.
- **Below:**
  - "Din aceeași categorie" (4);
  - "Folosit des împreună": the same crop, other categories, or `related` when staff set it;
  - a small band "Ai nevoie de ajutor la alegere?" with the quick request.
- Old `#cerere` links point to the quick request in the buy box. The bottom `LeadFormBlock` is removed from product pages only.
- JSON-LD stays as it is (Product, with an Offer only when `live`; BreadcrumbList; FAQPage).

### 7c.5 Cart and checkout

- **Cart `/cos`:**
  - line items with a thumbnail, name, pack, price for each pack, a quantity stepper (a form post that works without JS, enhanced with JS), remove, and the line total;
  - totals: subtotal, delivery "se confirmă", VAT note;
  - "Continuă cumpărăturile" and "Finalizează comanda";
  - the quick request, for those who prefer a call;
  - "Completează tratamentul": products for the same crops, at most 4.
- **Checkout `/comanda`:**
  - The progress bar (Coș ✓ → Date → Livrare → Confirmare). It shows position only. Everything stays on one page and in one form.
  - Card 1, **Cine comandă**:
    - a segmented control, Persoană fizică / Firmă;
    - for a company, CUI first, which fills in the name and address from the lookup (`CompanyLookupField`, restyled);
    - name, phone and email in two columns.
  - Card 2, **Livrare**:
    - two visual option cards, delivery to an address or pickup from a base;
    - delivery: county and locality side by side, then the address;
    - pickup: a list of bases with their address and county, with the nearest first when a county is chosen.
  - Card 3, **Certificat** (only when `needsCertificate`): the number and the expiry date side by side, with a line explaining why.
  - Card 4, **Plată și confirmare**:
    - the payment options as compact cards;
    - an optional message, folded;
    - the three consents grouped in one box (18+ only when `hasProtection`);
    - the submit button with the total on it ("Trimite comanda · 700 lei");
    - the line "Nu plătești acum" next to the button.
  - The summary column (sticky): thumbnails, quantities (editable, posting to the cart), subtotal and total, and the notes on what happens next. On phones it is a folded "Comanda ta · 700 lei ▾" at the top.
  - Validation: errors inline under each field, plus a summary with links at the top on submit. Focus moves to the first error.
  - The confirmation screen: the order number, "Ce urmează" as three steps (a consultant calls → a proforma or confirmation → delivery or pickup), and a link back to the shop.
- Order logic, `placeOrder` and the provider interfaces stay as they are. The only changes are in the presentation and the field layout.

### 7c.6 Apply, rehearsal and gate

- `npm run apply:shop` (`scripts/shop-redesign/{apply,run}.ts`), the last apply step in `prepare-database.sh`. Idempotent: each part skips once its target state is there. It writes:
  - category icons, only while they are empty;
  - the `ShopHome` defaults, only while the global is empty;
  - nothing on products except the new safety fields, only where staff left them empty and a source exists.
- Rehearsal ([[agrinvest-deploy-rehearsal]] method):
  - old `main` data in a worktree;
  - run the branch's deploy sequence twice, without and then with storage;
  - compare every shop path and its status in both locales;
  - a fresh-seed parity check;
  - the migration drift check.
- e2e:
  - the quick request from a product, a card and the cart;
  - the calculator adds the right mix;
  - checkout as a person and as a company with pickup, with the certificate;
  - the mobile filter drawer without JS.
- Gate: typecheck, lint, format, build, test:int, test:e2e, `check:seo` (no new errors), check:aeo, check:budget, then Lighthouse once (decision 0003): `/magazin`, one category, one hub, three product types, `/cos`, `/comanda`, in both locales.
- Update this doc and the roadmap, then do the owner review, then the PR (on request).

## 7c.1 notes (2026-11-11)

Built in a separate worktree (`../site-shop`), because another chat had uncommitted 7b.5 work, a dev server and Storybook in the main tree. The worktree has its own database (`agrinvest_shop`, copied from the local `agrinvest`), its own `node_modules` (Turbopack refuses a symlinked one) and links to the local-only `media/` and `data/raw/`.

**Quick request (decision 0010)**

- Lead type `quick` ("Cerere rapidă" / "Quick request"). `formLeadTypes` leaves it out of the full lead form and the page-builder block, so `quick` can only come from the quick request.
- `Leads`: `name`, `phone` and `email` are optional in the database. The `contactRules` hook (`leadContactErrors`) runs on every save:
  - `quick` needs a phone or an email;
  - every other type needs all three.
- New fields `variant` (SKU) and `hectares`. `quantity` now also shows for `quick` (packs).
- Routing: `quick` → its own route if set, else the `inputuri` owner, else `general`. The local seed has no `inputuri` route, so it lands on `general` here.
- `submitQuickRequest` (`src/lib/leads/actions.ts`):
  - one field, detected by `parseContact` (`normalizePhone` or an email);
  - the same rate limit, honeypot and `notifyLead` (no-op);
  - the consent version is stored as `2026-11-v1:request`.
- "Adaugă și telefonul": after an email, the success state offers a phone field in a `<details>` (works without JS). It posts again with a signed follow-up token (HMAC of the lead id with `PAYLOAD_SECRET`, valid 1 hour). It can only add a phone to a `quick` lead that has none.
- `QuickRequest` pattern, two layouts:
  - `inline` (buy box, cart, empty states): field and button side by side from `md`;
  - `compact` (cards): a "Cere preț" button that opens the field in place, so cards keep one height.
- The privacy line is a notice with a link, no checkbox. **Still needs owner confirmation** (open points).

**Dose maths** (`src/lib/shop/dose.ts`, 17 tests in `tests/int/dose.int.spec.ts`)

- Units on the labels today: l/ha, kg/ha, g/ha, % (needs the water volume), kg/t and l/t (per tonne of seed: the input is tonnes, not hectares).
- 18 of the 97 protection rows have no numbers. The calculator must show their label text and "calculează cu consultantul".
- `packMix`:
  - uses only in-stock priced packs of the same dimension;
  - minimises waste, then the number of packs;
  - is exact: the smaller packs number fewer than largest ÷ gcd, so the search is bounded;
  - caps each SKU at the cart limit (999).
- `parseSowingRate` reads `60 kg/ha` and `400.000–450.000 boabe/ha`; densities per m² return null. `parseWaterVolume` reads `200–300 l/ha`.
- The `DoseCalculator` UI and its stories move to 7c.4, where it is wired.

**Product card v2** (`ProductCard`, `QuickAdd`, `ChoosePack`)

- Square packshot, with the stock as a pill on the photo; brand, name, ingredient or nutrient line; two chips (one on phones); pack sizes; price, unit price and the "de confirmat" marker; one action.
- The action comes from `cardAction` (`src/lib/shop/catalogue.ts`):
  - exactly one in-stock priced pack → quick add (even if other packs are on request);
  - several → "Alege ambalajul";
  - otherwise the compact quick request.
- `orderBlock` (OUG 53, sale stop, missing or expired registration) wins over everything. Card data now carries `order` inputs, `nutrients` and `form`.
- `quickAddToCart`: the same checks as `addToCart`. With JS the visitor stays on the page and `CartLink` updates through the `agrinvest:cart` event. Without JS the permalink opens the cart.
- **Not on pages yet:** `ShopCard` still renders the old card (`LegacyProductCard`). `ShopCardV2` is ready; 7c.2 swaps it in and deletes the legacy file, together with its fixture and story aliases.

**Category icons**

- `icon` options are now the shop set:
  - the plan's eight: seed, herbicide, fungicide, insecticide, foliar, fertiliser, bio, other;
  - plus protection, seed-treatment, adjuvant and growth, because the top groups and subcategories need them.
- Drawn in `design-system/icons/categories.tsx` (server only, out of the shared chunk), shown with `CategoryGlyph`. `CategoryRail` pattern with stories (rail and icon set).
- Seeded in `scripts/seed/data.ts`. The home tiles use them already (HomeShop, `ShowcaseCategory.icon`).
- The migration clears the old values (leaf, drop, scale…), which have no match. `npm run apply:shop` part 1 fills empty icons by Romanian slug. Run twice locally: 12 set, then nothing to do; slugs in both languages unchanged.

**ShopHome global** (`shop-home`, Shop group). `apply:shop` part 2 writes the placeholder promo in both languages, only while the title is empty (tested; run twice locally).

- Promo card: kicker, title, text, link, image, end date (hidden after that day).
- Featured products (up to 8).
- `getShopHome` loader; `activePromo` and `seasonalCategory` for the computed default: the category with the most in-stock products among the month's product types, as listed in `seasonTypes`.

**Safety fields** (`protection`, "Eticheta de pericol")

- `signalWord` (warning/danger), `ghsPictograms` (GHS01–09), `hazardStatements`, `bufferZone`.
- Ticking GHS06 also sets the `ghs06` flag (OUG 53/2025 art. 40), so the online-sale ban cannot be missed.
- Not filled yet: 7c.6 fills them from labels only.

**Migration** `20261111_155707_shop_foundations`

- Hand-edited to clear the old category icons before the enum cast (both directions).
- Rehearsed on a copy of the local data with every earlier migration marked as run: applies cleanly.
- The full rehearsal on old `main` data is in 7c.6.

**Checks (local)**

- typecheck, lint (4 old warnings in `scripts/demo/seed.ts`), format: pass.
- test:int: 251 of 252. The failure is the known demo-data "price alert" test.
- build passes. `check:budget` against `next start -p 3300`: 0 of 31 over, `/finantare/aplica` 159.7 KB.
- Story shots at 1440 and 390 in RO and EN: no horizontal scroll, no axe violations. Saved in `docs/design-review/shots/2026-11-11-7c1/`.
- e2e, `check:seo` and Lighthouse were not run: nothing is wired into pages yet (Lighthouse waits for 7c.6).

**Traps**

- The design system has no `sm` breakpoint (only `md`, `lg`, `xl`) and no `max-w-md` or `max-w-xs`. `sm:` classes compile to nothing.
- `cx` does not merge Tailwind classes: overriding a Button's padding or wrapping needs the `!` suffix.
- A `name` prop on an icon component collides with the SVG `name` attribute: `CategoryGlyph` takes `icon`.
- `check:budget` and `check:seo` default to `localhost:3100`, which may be another chat's dev server: pass the URL.
- Before starting Payload on a database that still holds the old icons, clear them (as the migration does), or the dev schema push stops on the enum change.

## Open points for the owner

- **Quick request legal line:** a notice without a checkbox (art. 6(1)(b), pre-contractual request). Confirm, or keep a consent checkbox.
- **Response promise** shown by the quick request ("te sunăm în aceeași zi lucrătoare"?): it needs a figure in the Figures register before it can be shown. Until then the text is "în curând".
- **Promo card content:** a placeholder is in (2026-11-11, owner: "write something for now"): "Îngrășăminte pentru primăvară" linking to the fertiliser category, with no price, discount or end date. `apply:shop` writes it only while the promo is empty. The owner replaces it later in the admin (Magazin → Pagina magazinului).
- **The imported product descriptions** have no diacritics and repeat the dose and spec data. A clean-up pass (per product, from the sources) is proposed as a follow-up content task, not part of this phase.

## Critical files

- `src/components/templates/{ShopListing,ShopParts,ProductPage,CheckoutPage}.tsx`, `src/components/HomeShop.tsx`
- `design-system/patterns/{Shop,Commerce,CheckoutForm,CompanyLookupField,ProductCard,LeadForm,Lazy}.tsx`, plus the new `QuickRequest`, `DoseCalculator`, `CategoryRail`, `ShopSearch`, `FilterDrawer`, `BuyBox`
- `src/collections/{Products,Categories,Leads}.ts`, new `src/globals/ShopHome.ts`, `src/lib/shop/{catalogue,rules}.ts`, new `src/lib/shop/dose.ts`, `src/lib/commerce/{actions,cart}.ts`, `src/lib/leads/*`
- `src/i18n/{shop,commerce}.ts`

## 7c.2 notes (2026-11-11)

Landing shots (design, 1440 and 390, RO and EN): `docs/design-review/shots/2026-11-11-7c2/`. Story: `Pages/Shop landing` (seasonal promo, staff promo, suggestions open).

**Defaults taken while owner answers were pending** (change on request):

- Card v2 and the quick request were treated as approved.
- The privacy line stays a notice with a link, no checkbox.
- The promo uses the staff promo from ShopHome while it runs, otherwise the seasonal category.
- Crop tiles use the crop icons (leaf for crops without one), not photos: `Crops` has no image field.
- The FAQ is static text in `shopUi.ro/en.landing.faqItems` (three questions), with no FAQPage JSON-LD. Moving it to a ShopHome field needs a migration.

**What is built**

- Patterns (stories in `Pages/Shop landing`):
  - `ShopLanding.tsx` (server): `ShopHero`, `PromoCard`, `CropTiles`, `BrandStrip`, `TrustRow`.
  - `ShopSearch.tsx` (client island, loaded through `ShopSearchLazy`).
  - `CategoryRail` tiles are now all one height.
- `ShopHome` in `ShopListing.tsx`: hero with H1 unchanged, live counts, search, six crop chips, promo, category rail with subcategories; then Recomandate (featured products, else the newest in stock, up to 8), Pe culturi (up to 12), Producători (11, names only: no brand has a logo), the trust row, the FAQ.
  - Each section shows only when it has data.
  - The trust row's pickup line uses `<Fact k="S1">` ("silos and grain warehouses", the owner's wording). Its finance link goes through `financeLinks`, so it is left out when the page is not published.
- Search index: `/shop-index.json?l=ro|en` (8.6 KB RO, 2.9 KB gzipped), `x-robots-tag: noindex`, revalidated hourly.
  - It holds path prefixes (`h`), products (`p`) and terms (`t`: category, crop, brand, ingredient) as slugs, to stay small.
  - It is fetched on the first focus. Enter with a highlighted option goes to it; otherwise the form posts to the results page, which also works without JS.
  - Suggestions fold diacritics, and every query word must start a word.
- `ShopCard` is now the v2 card. `LegacyProductCard`, its fixtures and story aliases are deleted; the home strip and the product page's related products use the v2 card.
- `ProductGrid` is 2 columns on phones, 3 at `md`, 4 at `xl` (default), 4 at `md` for the landing.
- Strings: `shopUi.*.landing` (RO counts take "de" from 20: "71 de produse"). Search labels are plain strings, because functions cannot cross to the client island.

**Checks (against `next start -p 3300`)**

- typecheck, lint, format: pass. build passes.
- test:int: 252 of 253 (the known demo-data price alert test).
- `check:budget`: 0 of 31 over; `/finantare/aplica` 159.9 KB (limit 160); `/magazin` 152.3 KB.
- `check:seo`: 49 errors after fixing one 404 I introduced (the finance link). None are on `/magazin` or `/en/shop`. They are demo content, the noindex search page (no WebPage JSON-LD) and unconfirmed offers. I did not compare with the earlier 44, so that count is not confirmed.
- Browser run on the built site: no horizontal scroll at 1440 or 390 in both languages, one H1, suggestions work, Enter opens the product. A prefetch 404 for the other language's URL comes from the existing language switcher on every page, not from this step.
- e2e and Lighthouse not run (Lighthouse waits for 7c.6).

**Traps**

- Do not import `ShopSearch` directly: use `ShopSearchLazy`. `/finantare/aplica` is 0.1 KB from its limit.
- Do not add icons to `design-system/icons/icons.tsx` (shared with client code, at budget): server-only icons go in `icons/server.tsx`.
- A story that uses `useRouter` needs `parameters.nextjs.appDirectory: true`.
- The English finance product slug differs from the Romanian one: build links with `financeLinks`, never by typing the slug.
- The mega-menu panel has no product card, so it needed no change.

**Open points for the owner**

- Promo content for the season (the seed promo "Pregătește sezonul" shows in the local database).
- Crop photos (needs an image field on Crops and photos) and brand logos (the `Brands.logo` field exists; none are filled).
- The three FAQ answers.

## 7c.3 notes (2026-11-11, design stage)

Owner input for this step was empty (the prompt's feedback, promo and decision slots were unfilled), so the 7c.2 defaults stand: no landing changes, seasonal promo, crop photos, brand logos and FAQ answers still pending.

Design shots (stories, 390/768/1440, RO and EN; no horizontal scroll, no axe violations): `docs/design-review/shots/2026-11-11-7c3/`. Story: `Pages/Shop listing` (top category in grid view, filtered subcategory in list view, no results, phone drawer open). Approved and wired: see "7c.3 notes (wired)" below.

**What is built** (`design-system/patterns/ShopListing.tsx`, server only, no client code)

- `ListingHeader`: breadcrumbs, H1, intro split into a lead and a rest behind "mai mult" (a `<details>`, so the full text stays in the HTML), then either icon tiles (a top category's subcategories) or chips with counts (a subcategory's siblings, the current one active). Hubs and search get neither.
- `ListingToolbar`: the count (a live region), the sort menu (a `<details>` of links), the grid/list toggle (links) and the removable active-filter chips with "Șterge filtrele".
- `FacetGroups`, `FacetCard`: groups are `<details open>` with a count badge; options are single-value links shown as radios (one value per filter, as the URLs work today); "Disponibilitate" is a switch. Each group folds after 6 options; a group opens itself when its active option is folded.
- `FilterDrawer`: below `lg`, a `<details>` whose summary is the "Filtre (n)" button; when open, the panel covers the screen and the summary becomes the bottom "Vezi n produse" bar that closes it. Works without JS.
- `ProductRow` (list view): packshot, brand, name, line, dose and crops (dose only on phones), price, stock and the same action as the card.
- `Pagination`: prev/next with `rel`, numbered pages from `md`, "Pagina 2 din 3" on phones.
- `ListingEmpty`: "Nu găsești ce cauți?" with the inline quick request and "Șterge filtrele".
- Icons `GridIcon`, `ListIcon`, `FilterIcon`, `CloseIcon` in `icons/server.tsx`.
- Strings: `shopUi.*.listing`. `shopUi.ro.products` now says "36 de produse" (it said "36 produse").

**Facts checked for wiring**

- Pagination is not dormant: a crop hub has 54 products and "Protecția plantelor" has 36 (72 products in the local DB).
- The current listing uses `sm:` classes (the subcategory tiles, `SpecSheet`), which compile to nothing. The new header replaces the tiles; `SpecSheet` is 7c.4.

**Wiring plan (next)**

- URL params (per language, like the facets): sort `ordine`/`sort` (`pret`, `pret-desc`, `pret-unitar`, `nume`, `noi` / `price`, `price-desc`, `unit-price`, `name`, `newest`), view `afisare=lista`/`view=list`, page `pagina`/`page`, price `pret`/`price` (`0-100`, `100-300`, `300-1000`, `1000-`). Any of them makes the URL noindex with the clean listing as canonical (`listingMetadata`'s `filtered` must cover them, not only `readFilters`). Every link keeps the other params.
- `ProductCardData` gets a `dose` summary (from the label's `doseMin`/`doseMax`/`doseUnit` rows; none when a row has no numbers) for the list view.
- "Relevanță" keeps today's order (in stock first, then name; for search, the same).
- Drawer: add `body:has([data-filter-drawer][open]) { overflow: hidden }` below `lg`; facet links inside it end in `#filtre` only if a quick test shows the drawer reopening helps; Escape/focus trap as a tiny island through `Lazy.tsx` only if the budget allows.
- Buying advice and FAQ stay below the grid; the empty state replaces "Niciun produs…".
- After each wiring step: `check:budget` against `next start -p 3300` (`/finantare/aplica` at 159.9 KB of 160).

## 7c.3 notes (2026-11-11, wired)

Owner: the design shots are **approved as shown**. **No category filter on the crop, brand and ingredient hubs** (they keep their facets). Real-page shots (1440 and 390, with and without JS, plus the open drawer): `docs/design-review/shots/2026-11-11-7c3-wired/`.

**What is wired**

- `ListingView` in `src/components/templates/ShopListing.tsx` serves the category, crop, brand, ingredient and search pages: `ListingHeader`, `ListingToolbar`, `FacetCard` + `FacetGroups`, `FilterDrawer`, grid or list, `Pagination` and `ListingEmpty`.
  - A top category shows its subcategories as icon tiles. A subcategory shows its siblings as chips (only when it has at least one sibling). Hubs and search show neither.
  - The intro is split into a lead (whole sentences, up to about 170 characters) and the rest behind "mai mult".
  - Facet order: stock, the listing's first facet, price, then the rest. Price options keep the range order, not the count order.
  - The buying advice and FAQ stay below the results.
- URL state (`src/lib/shop/catalogue.ts`: `readListing`, `listingHref`, `toggleFilter`, `hasListingParams`):
  - Sort: `ordine` / `sort`.
  - View: `afisare=lista` / `view=list`.
  - Page: `pagina` / `page`. A page past the end shows the last page.
  - Price filter: `pret` / `price`, with values `0-100`, `100-300`, `300-1000`, `1000-`. It is a `FacetKey`, applied to the cheapest pack. The lower bound counts, the upper bound does not. An unknown range is ignored.
  - Parameters always come in a fixed order. A filter or sort change goes back to page 1; a view change keeps the page; "Șterge filtrele" keeps sort and view.
  - Any of these parameters, or any filter, makes the URL noindex, even `?pagina=1`. The canonical is the clean listing. The search query alone does not change this: search is noindex anyway.
- Sort orders:
  - "Relevanță" is the existing order: in stock first, then by name.
  - The price and unit-price sorts put products without the number last.
  - "Cele mai noi" sorts by `createdAt`, which the card data now carries.
- The CollectionPage + ItemList JSON-LD still lists every product of the listing, whatever the URL asks for. A crop hub shows 32 ListItems on page 1 and on page 2. `hubIndexable` is unchanged.
- 24 products a page. The page links carry `rel="prev"` and `rel="next"`. In the local DB, "Protecția plantelor" (36 products) and the maize hub (32 products) go to page 2.
- Search without a query now lists the whole catalogue in the same template. Before, the "Toate produsele" link opened an empty page.
- `ProductCardData.dose` comes from `doseSummary` in `src/lib/shop/dose.ts`. It takes the protection `doses` and fertiliser `rates` rows that have numbers, keeps the unit most rows use, and spans from the lowest minimum to the highest maximum. Seeds have none, because their sowing rate is free text. The products cache key is now `shop:products:v2:*`.
  - In the local DB, most doses read "0,5–1 l/ha": that is the demo seed's placeholder, not real label data.
- `ShopParts`: `ShopCard` and the new `ShopRow` share `cardProps`. `ProductList` is the list view. Cards on a listing store the listing as the quick request's source page.
- The empty state shows the inline quick request (`QuickRequestLazy`). On a search with no filters, the text speaks of the search (`emptySearchText`), not of filters.
- The drawer:
  - Below `lg`, `body:has([data-filter-drawer][open])` stops the page behind it from scrolling (`tokens.css`).
  - `DrawerKeys`, a client island loaded through `DrawerKeysLazy`, adds Escape (closes the drawer and returns focus to its button) and keeps Tab inside the open drawer.
  - Facet links do not end in `#filtre`: a tap applies the filter and closes the drawer, and the button then shows "Filtre (n)". Reopening it after each tap was not needed.
- Removed: `FacetPanel`, `ShopTile` and their stories, the old `facetHref`, the old `FilteredList`, and the `sm:` tiles. `SpecSheet`'s `sm:` classes are left for 7c.4.

**Checks (against `next start -p 3300`)**

- typecheck, lint (only the 4 old warnings in `scripts/demo/seed.ts`), format and build: all pass.
- test:int: 258 of 259. The one failure is the known demo-data price alert test. New tests cover the URL state, noindex parameters, price sort, price ranges and `doseSummary`.
- `check:budget`: 0 of 31 over. `/finantare/aplica` is at 159.5 KB (it was 159.9 KB). The listings are at 154.6 KB (153.2 KB without the drawer island).
- `check:seo`: 49 errors, the same as 7c.2. None are on a category or hub listing. Search keeps its two known gaps (no WebPage or BreadcrumbList JSON-LD on a noindex page).
- Browser run at 1440 and 390, with and without JS, on 8 listing URLs (RO and EN; top category, filtered list, crop page 2, brand, ingredient, empty search, EN search in list view):
  - no horizontal scroll and one H1 on every page;
  - the drawer opens and locks the page, Escape closes it (with JS), the bottom bar closes it (without JS), and a filter link inside it applies the filter;
  - axe at 1440 finds only `region` (12 nodes): the price strip at the top of the site shell sits outside any landmark. It shows on `/despre` and the unchanged `/magazin` too, so it is not from this step. Raise it with the home redesign (7b.6).
- e2e and Lighthouse were not run (Lighthouse waits for 7c.6).

**Traps**

- Every listing link goes through `listingHref`. Building one by hand loses the other parameters or breaks the parameter order.
- `facetParams` now includes `price`. Anything that loops over it (`readFilters`, `hasListingParams`) covers price on its own; the Categories `facets` select does not offer it, and it is added to every listing.

## 7c.4 notes (2026-11-11, design stage)

Design shots (stories, 390/768/1440, RO and EN; no horizontal scroll, no axe violations): `docs/design-review/shots/2026-11-11-7c4/`. Stories:

- `Pages/Product`: crop protection with two packs; foliar fertiliser (no hazard label); not sold online (OUG 53/2025); seed on request (no price); the phone buy bar shown, with the plain safety text; gallery zoom open.
- `Patterns/Dose calculator`: dose per hectare, a percentage dose with the water, per tonne of seed, a row without numbers, no pack in stock, and the state after "Adaugă în coș".

Doses, prices, hazard data and documents in the stories are sample data. The local database has only the demo seed's placeholder doses ("Doze demonstrative").

**Layout decision (deviates from the step text; shipped as drawn on the owner's go-ahead, 2026-11-11)**

- The step put the calculator "directly under the buy box on desktop". A buy box plus the calculator is about 1,100 px tall, so it cannot stay on screen, and the owner's decision 2 says the buy box stays on screen while the page scrolls.
- What is drawn instead:
  - From `lg`, the gallery, the tab bar and every section sit in the left 7 columns. The buy box sits in the right 5 columns and sticks to the top all the way down to the shelves.
  - The calculator is the first block of the Doze section at every width. The buy box links to it ("Calculează cantitatea pentru suprafața ta").
  - On tablets (768), the gallery and the buy box sit side by side, then the sections.
- If the owner prefers the step text (calculator under the buy box), the buy box is sticky only within the top band, and the tab bar carries a compact price and add-to-cart once it sticks.

**What is built**

- `design-system/patterns/ProductDetail.tsx` (server):
  - `ProductLayout`.
  - `ProductMedia`: a snap row of photos with the badges over it ("Uz profesional", stock) and thumbnails. A photo links to the full image and a thumbnail links to its slide, so it works without JS.
  - `BuyBox`: brand, H1, summary clamped to 2 lines, key facts, notice, form, the calculator link, then the quick request at `id="cerere"` (old `#cerere` links land there), then the notes.
  - `KeyFacts`, `PackSummary` (the packs as information only, for blocked or unpriced products) and `ProductTabs` (sticky links to sections; all content stays in the HTML).
  - `ProductSection`.
  - `DoseUseCards`: one card per label row; targets fold after 6 into a `<details>`; a dose without a number is set in body size.
  - `SpecGroups`: grouped label and value pairs; the groups are Identificare, Formulare, Mod de acțiune, Omologare (Soi și semănat, Compoziție și formă for seeds and fertilisers).
  - `Spectrum`: targets by kind, with a hub link when one exists.
  - `SafetyPanel`: signal word, GHS pictograms, H statements, buffer zone. It falls back to the `safety` text.
  - `DocumentTiles`: type and size.
  - `FoldedText`: the text stays outside the `<details>`, and the fold switches through `:has()` without JS.
  - `HelpBand` and `ProductShelf`.
- Client islands, registered in `Lazy.tsx` as `BuyFormLazy`, `DoseCalculatorLazy` and `GalleryZoomLazy`:
  - `BuyForm`: pack radios, so the choice works without JS; the quantity stepper; the line total; the phone and tablet buy bar. It reuses `quickAddToCart` unchanged (`sku` and `quantity`). Without JS it posts and opens the cart.
  - `DoseCalculator`: uses only `dose.ts`. The dose is limited to the label range, with an input and a slider. The area is in hectares, or in tonnes for `/t` doses. A `%` dose asks for the water within the label's water range. The result shows the total, the pack mix and what is left over, the cost and the spray water. A row without numbers shows the label text and "Calculează cu consultantul" (`#cerere`). `canOrder={false}` hides the add button. It posts repeated `sku`/`quantity` pairs plus `hectares`, ready for `addManyToCart`.
  - `GalleryZoom`: a native `<dialog>` with previous and next and the arrow keys. It also scrolls the slide row from the thumbnails without moving the page.
- `design-system/icons/ghs.tsx` (server only): GHS01–09 as simplified drawings, coloured with tokens.
- Strings: `shopUi.*.product`. Strings that client islands receive are plain, with `{n}` slots; the server fills them with `fillSlots`.
- `SpecSheet` and `DocumentList` in `Shop.tsx` no longer use `sm:`. They, `PackTable`, `DoseTable` and the old `ProductGallery` are deleted at wiring.
- `scripts/checks/shoot.ts` waits 300 ms after scrolling back to the top, so scroll-driven UI has settled before the screenshot.

**Checks**

- typecheck, lint (the 4 old warnings), format and build: pass.
- test:int: 258 of 259. The one failure is the known demo-data price alert test.
- `check:budget` against `next start -p 3300`: 0 of 31 over. `/finantare/aplica` is at **159.8 KB** (it was 159.5 KB). The three new `dynamic()` entries add their loader stubs to the shared `Lazy.tsx` chunk, which leaves 0.2 KB of headroom. A product page is at 157.8 KB.
- `check:seo`: 49 errors, the same as 7c.3.
- e2e and Lighthouse were not run (nothing is wired; Lighthouse waits for 7c.6).

**Traps**

- An `IntersectionObserver` cannot drive the phone bar. A jump past the form (Home, an anchor) crosses no threshold, so the bar stayed shown. `BuyForm` checks the form's position on scroll instead.
- A full-page Playwright shot draws an element parked below the first screen (`translate-y-full`). The hidden bar is also `invisible`.
- At 390 px, a single auto grid track grows to the tab bar's link row. `ProductLayout` and its sections column need `grid-cols-1` (minmax(0, 1fr)).
- Several calculators on one page with the same name fail axe `landmark-unique`. The calculator is a named `role="group"`, not a `<section>`.
- `sm:` classes remain in `CheckoutForm` (7c.5 replaces it), `Hero`, `HomeSections` and `ApplicationForm`. They are out of scope here.

**Wiring plan (after approval)**

- `ProductPage.tsx`:
  - Key facts from `card` and `doc`. PHI is the lowest to highest `waitingPeriod`. Crops show the first 3, then "+n" linking to `#doze`.
  - Calculator uses come from `protection.doses` and `fertiliser.rates`, with `doseMin`/`doseMax`/`doseUnit` and `rateMin`/`rateMax`/`rateUnit`. Seeds get one use only when `parseSowingRate` parses the rate.
  - Spectrum comes from the dose rows' `target` relations, grouped by `kind`.
  - Document sizes come from the upload's `filesize`.
  - Safety uses the hazard fields when filled, else `safety`.
  - Remove the bottom `LeadFormBlock`. The shelves: 4 from the same category, plus 4 used together (`related` first, else the same crops in other categories).
- `addManyToCart` in `src/lib/commerce/actions.ts`: the same `priceLines` and `orderBlock` checks for every line, all or nothing. A blocked product never shows the calculator's button.
- Tie `hectares` to the buy box's quick request when the calculator was used. The proposal is a small event: the calculator sends it and `QuickRequest` sets a hidden field.
- JSON-LD, URLs and metadata stay as they are.
- `check:budget` after each step.

**Open points for the owner**

- The layout decision above.
- The GHS drawings are simplified. Replace them with the official UNECE pictograms before launch (they are free to use).
- Protective equipment: no field holds it. It stays in the `safety` text unless a field is added (that needs a migration).
- The budget: 0.2 KB is left on `/finantare/aplica`. The proposal is to move the product-page islands into their own `ProductLazy.tsx`, so their stubs load only on product pages. The current rule says "only via Lazy.tsx", so this needs the owner's yes.

## 7c.4 notes (2026-11-11, wired and released)

Owner, 2026-11-11: "that is enough for now, make everything production ready with all our sample data and demo, commit and push to production". Choices made with the owner: wire the product page as drawn, then rehearse before the merge.

**What is wired**

- `ProductPage.tsx` uses the 7c.4 patterns. JSON-LD, metadata, URLs and the Offer rule are unchanged.
  - Key facts come from the card and the label rows. The PHI shows the lowest to highest `waitingPeriod`. Crops show the first 3, then "+n".
  - Calculator uses come from the protection `doses` (`doseMin`/`doseMax`/`doseUnit`) and the fertiliser `rates` (`rateMin`/`rateMax`/`rateUnit`). A seed gets one use when `parseSowingRate` reads its rate. English falls back to the Romanian label text, as the dose cards do.
  - Spectrum comes from the dose rows' `target` relations, grouped by `kind`. It is not linked: target hubs do not exist yet.
  - Safety uses the hazard fields when they are filled, else the `safety` text. Document tiles show the upload's `filesize`.
  - The shelves: 4 from the same category; then "Folosit des împreună", which is `related` when staff set it, else in-stock products for the same crops from other categories.
  - The bottom `LeadFormBlock` is gone from product pages. `#cerere` is the buy box's quick request.
- `addManyToCart` (`src/lib/commerce/actions.ts`): repeated `sku`/`quantity` pairs (at most 10). The same `priceLines` checks as add to cart, all or nothing. A blocked product never shows the calculator's button (`canOrder`).
- The old `Shop.tsx` (`PackTable`, `DoseTable`, `SpecSheet`, `DocumentList`, `ProductGallery`) and its stories are deleted.

**Changes made to stay in budget** (the first wired build had a product page at 164 KB):

- The zoom is now a `:target` overlay with previous, next and close links. It needs no JavaScript and the back button closes it. The `GalleryZoom` island is deleted.
- The shelves' cards link to their product ("Vezi produsul") instead of quick-adding (`linkOnly`), so product pages do not load the quick-add chunk.
- The result: a product page is at 159.7 KB, and `/finantare/aplica` is at 159.7 KB (the zoom stub left `Lazy.tsx`).

**Other fixes**

- In-page `#` links (key facts, the calculator's consultant link) are plain anchors. `next/link` prefetched the current page for each one.
- The calculator's "no pack" text now also covers a dose whose unit does not match the packs. The local demo data has some (Lamdex Extra: a dose in l/ha, sold in kg).
- `check:seo`: the unconfirmed-Offer rule now looks only at the page's own product. The shelves' cards carry other products' "de confirmat" markers, which made 14 false errors.
- e2e: the product test checks the pack radios, the calculator and the quick request. The order helpers accept both add-to-cart outcomes: with JavaScript the visitor stays on the page and follows "Vezi coșul"; without it the form opens the cart.

**Checks (2026-11-11, against `next start -p 3300`)**

- typecheck, lint (the 4 old warnings), format and build: pass.
- test:int: 258 of 259. The one failure is the known demo-data price alert test.
- test:e2e (temporary config on :3300): every shop test passes. Two failures are local demo data that CI does not have: Lamdex Extra is `live` in the local demo, so its Offer is expected there; the demo guides make `/ghiduri/grau` answer 200.
- `check:budget`: 0 of 31 over.
- `check:seo`: 35 errors. The drop from 49 comes from the narrowed Offer rule, not from page fixes. All 35 are known: demo titles and descriptions, duplicate market notes, and search without WebPage or BreadcrumbList.
- Browser run on 3 product types at 1440 and 390, RO and EN, with and without JavaScript:
  - Every page answers 200, with one H1 and no sideways scroll.
  - The buy box adds to the cart, the calculator adds its mix (Amino: 10 ha × 2 l/ha → 1 × 20 l), and the zoom opens.
  - The only console errors are the English pages' RSC prefetch 404s for the Romanian URL. That is the existing language-switcher issue from 7c.2.
- Shots: `docs/design-review/shots/2026-11-11-7c4-wired/`. The stories were shot again with the CSS zoom.

**Rehearsal (2026-11-11, deploy-rehearsal method)**

- **Old production state:**
  - A `main` worktree (cd5c8ac) ran its own `prepare-database.sh` on an empty database, with `VERCEL_ENV=production` and a demo password, so the demo seed ran as it did on the live test domain.
  - The result: 14 migrations, all batch 1, no dev-push marker.
  - A first attempt ran the demo seed outside the script, without `NODE_ENV=production`. Payload dev-pushed the schema, and `migrate` then stopped on its "data loss" prompt. That was a rehearsal mistake, not a branch fault: on Vercel the demo seed runs inside the script, in production mode. The database was rebuilt.
- **Branch deploy, run 1:**
  - `shop_foundations` migrated in 42 ms.
  - `apply:shop`: 12 category icons set and the placeholder promo written.
  - Category slugs (both locales), product slugs and categories, and page slugs: unchanged. Only the icons changed.
- **Run 2:** `apply:shop` had nothing to do. The full data dump differs from run 1 only in the 3 home slide media rows, which `apply:redesign` re-saves with identical focal points on every deploy. That comes from 7b; this branch does not touch `scripts/redesign`.
- **Fresh database (production first deploy):** the seed writes the icons, and `apply:shop` writes only the promo, because the seed has none. Category slugs and icons match the applied old site exactly.
- **Migrations:** the CI drift check (`migrate:create drift-check --skip-empty`) generated nothing.
- **Pages:** the branch, built on the rehearsed database, answered 200 on all 370 sitemap URLs and alternates, including all 204 shop URLs in both locales.

**Still open**

- 7c.5: cart and checkout.
- From 7c.6:
  - the label safety data (`apply:shop` part 3, from checked label sources only);
  - e2e for the quick request and the calculator on CI data;
  - Lighthouse once.
- The calculator's area is not yet sent with the buy box's quick request (the `hectares` bridge).
- The GHS drawings: replace them with the official UNECE artwork.
- The English pages' RSC prefetch 404 for the Romanian URL (language switcher, since 7c.2).
- The `sm:` classes in `CheckoutForm`, `Hero`, `HomeSections` and `ApplicationForm`.

## 7c.4 notes (2026-11-11, CI fixes before the merge)

PR #11's CI was red. Four e2e tests failed on `main` too (the 7b merge): the header ticker, the county map, the live panel and the home page. They were added in 7b and only ever ran against local data. A fresh `npm run seed` leaves out what Agrinvest has not confirmed: buy prices, the diesel price and the county of every base (S4). The pages built on that data stayed empty.

- `scripts/seed/ci-fixtures.ts` (`npm run seed:ci`, a CI step after the seed): 6 published buy prices on 3 crops, one diesel price, and Pogoanele linked to Buzău. It is idempotent and is **not** part of `prepare-database.sh`: it publishes sample prices, so it must never run on a live database.
- Further failures that only a fresh seed showed:
  - `/magazin` and `/en/shop` had no update date (my 7c.2 landing), so `check:aeo` exited 1. The hero has an `updated` slot with the latest product update.
  - The search page had no WebPage or BreadcrumbList JSON-LD, and its English description was 57 characters. It now has both types and longer descriptions in both languages.
- Verified on a fresh CI-like database (seed, fixtures, a clean `.next`, build): e2e 99 of 99, test:int 259 of 259, and `check:seo` (0 errors), `check:aeo` (56 of 56), `check:figures`, `check:products`, `check:finance`, `check:tools` and `check:budget` (0 over) all exit 0. Lint, format, Storybook and the drift check pass.
- Trap: `.next/cache` keeps the tagged data cache across builds, so after changing the database, build from a clean `.next` (CI always does).
- Trap: run the checks with `NEXT_PUBLIC_SITE_URL=http://localhost:3100`, as CI does. `.env`'s `:3200` makes every canonical an error.
- Open for 7b: its `apply:redesign` re-saves the home slide media on every deploy (identical values).
