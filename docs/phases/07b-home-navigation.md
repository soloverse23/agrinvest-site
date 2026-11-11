# Phase 7b: home, navigation and footer redesign

Status (2026-11-11): 7b.1–7b.4 built and verified, not committed. `apply:redesign` was rehearsed on old data, and the gate and Lighthouse passed. Next: owner review, then commit and PR (on request), the Rich Results Test on the preview, and the merge.

### 7b.4 notes

- **`npm run apply:redesign`**: `scripts/redesign/apply.ts` holds the logic and `run.ts` is the entry point. It is the last apply step in `scripts/deploy/prepare-database.sh`, after `apply:articles`. On the first deploy the old entry-point helpers still add to the old menu, then this step replaces it. On later deploys they find their links at any depth and skip.
- **What it writes.** Each part skips once its target state is there. Every page save sends `keepUrl` and `skipChildren`.
  - Menu and footer, per locale. The menu is replaced only while it has more than five items and no shop panel. The footer is replaced only while no column links the tools hub. A menu that staff trim later stays theirs.
  - Home, per locale, while the hero has no `slides`: `homeLayout`, the FAQ and `seo` from `scripts/site/home.ts`. This also drops every old block below the hero, `baseList` included.
  - Media, only with cloud storage (`canUploadPhotos`):
    - The three posters are uploaded once.
    - The five stills get their focal points, but only while they sit at Payload's default 50/50, so a point an editor moved stays.
    - Slides written before storage existed get their posters on a later deploy (`withPosters`).
  - `/cereale` and `/en/grain` lose `baseList`. `/despre/cifre` and `/en/about/figures` get `{ blockType: 'baseList', showMap: true }` right after "Baze și capacitate" (found by heading or by the `S2` key), unless they already have one.
- **Shared media code:** `uploadOnce`, the stills' focal points and the poster upload moved from `scripts/seed/index.ts` to `scripts/seed/media.ts`. The seed is an entry script, so `apply:redesign` cannot import from it.
- **Tests:** `tests/int/redesign.int.spec.ts` covers the menu and footer tests, poster filling, and moving the bases (each one once).
- **Rehearsal (2026-11-11):**
  - **Old site:** a `main` worktree built the old state on its own database, with the deploy steps from `main`: migrate, seed, `apply:products`, `apply:finance`, `apply:tools`, `apply:articles`. It had the 8-item menu, `baseList` on home and `/cereale`, and none on the figures page.
  - **New steps on that data:** the branch's full deploy sequence, run four times.
    - Runs 1 and 2 had no storage. A `0.0.0.0` database host fails the localhost test, so the step behaves as on Vercel without storage.
    - Runs 3 and 4 had storage.
  - **Every page path and status compared** (both locales, 15 pages):
    - Only home, `/cereale` and `/despre/cifre` (and their English pages) changed, as planned.
    - No path, slug or status moved.
    - Run 2 matched run 1 exactly. Run 3 only added the posters and focal points. Run 4 matched run 3.
  - **Fresh databases:**
    - Production first deploy (empty database, no storage): the seed writes everything, and `apply:redesign` writes nothing.
    - CI path (push-mode `npm run seed`): the same.
    - The applied old site matches both fresh ones on every compared field: menu, footer, CTA, home, `/cereale` and the figures page, in both locales.
  - **Migrations:** the CI drift check (`migrate:create drift-check --skip-empty`) generated nothing.
- **Gate (2026-11-11, `next start` on :3300):**
  - typecheck and build pass. lint has 0 errors (the same 4 warnings in `scripts/demo/seed.ts`). format:check flags only `o.html`.
  - test:int: 220 passed, 1 failed (the known price alert).
  - test:e2e (temporary config on :3300): 97 passed, 2 failed, both known demo-data failures (pilot-product Offer, `/ghiduri/grau` 404). The motorina lead passed this time.
  - check:seo: 44 errors, all demo data (demo guides, news and market notes, Offer on demo products). None are on home, `/cereale`, the figures page or `/unelte`.
  - check:aeo: 55/56. The miss is the known `/magazin/erbicide` intro.
  - check:tools, check:articles and check:finance: 0 errors.
  - check:budget: 0 over. Home is 152.4 KB, `/finantare/aplica` 159.2 KB.
  - The checks take the URL as an argument: `npm run check:seo -- http://localhost:3300`.
- **Lighthouse (once, decision 0003):** 31 URLs × 3 runs, mobile, devtools throttling. Every assertion passed.
  - Home: performance 0.96–1.00, LCP 1.38–1.68 s, CLS 0.
  - Accessibility and best practices are 1.00 on every URL. CLS is 0 everywhere. The slowest LCP is 1.94 s (`/en/news`).
  - **The LCP is text, not the poster.** Chromium never counts an image that covers the whole viewport (it treats it as a background), and the hero poster is exactly the viewport. Measured LCP entries: the slide lead on phones and the H1 on desktop, both painted before the poster. The poster stays preloaded per shape, so a phone fetches only `grain-tall.webp`. Making the poster count would mean a shorter hero, with no gain in speed.
- **Manual checks (Playwright, :3300):**
  - Reduced motion (1440 and 390): posters show, no loop plays, and ▶ starts it.
  - Save-Data: posters show and no loop plays. The slides still rotate, so the control first shows ⏸. A visitor who wants video presses ⏸ and then ▶, which starts the loop. This is a possible owner point.
  - Keyboard on the slider: the arrow keys move between tabs and wrap around, and the pause control is reachable.
  - Live tabs: the arrow keys change the crop.
  - Mega menu: focus opens the shop panel. Tab goes through the search field and then the category links. Esc closes the panel. 103 panel links are in the HTML.
  - Mobile menu without JS: the five sections fold open with their links, and the poster still shows.

### 7b.1 notes

- Menu and footer live in `scripts/site/navigation.ts` (seed uses it; `apply:redesign` will in 7b.4). `scripts/site/hrefs.ts` makes the tools and guides helpers skip when a link exists at any depth. Both files are in the cache epoch.
- Mega menu panels are server components (`MenuPanels.tsx`); the client `MegaMenu` only opens and closes them, so the shop panel adds no client JS. `/finantare/aplica` script is 159.0 KB (was ~159.7).
- Shop panel data: `getShopMenu` in `src/lib/content/shop.ts` (counts from published products). Counts show beside each category and subcategory (added 2026-11-11).
- Footer brand column is `1.5fr`, so the five social icons fit on one row at 1440 px.
- Ticker: `SiteShell ticker` prop; the catch-all page hides it when the hero shows prices. Diesel via `dieselTicker` (own price, else the Oil Bulletin average); `FuelIcon` and `SearchIcon` are in `design-system/icons/server.tsx` (server components only).
- Tools hub: `/unelte`, `/en/tools`; three keyword rows added by hand; `check:seo` expects CollectionPage + ItemList + breadcrumbs there.
- Mobile menu: each section folds open with `<details>`, groups as sub-headings.
- Local-only failures, all from demo data: `check:seo` 44 errors (demo guides and news, Offer on live demo products, duplicate market notes), two e2e tests (`lamdex-extra` Offer, `/ghiduri/grau` 404) and one int test (price alert outbox). None touch the new pages; not compared against `main`.

### 7b.2 notes

- **Footage:** the WebM files in `data/raw/video` are only 640×360, too soft for a full-screen hero. `scripts/brand/clips.ts` (`npm run brand:clips [-- slide]`) reads 1080p windows of `x5wm8dXlJt4` from `data/raw/video/hd/`, downloaded once with yt-dlp; the command is at the top of the script. The other two videos are agromagazin TV segments: interviews with the channel's watermark and no product shots, so all three slides come from `x5wm8dXlJt4`.
- **Shots** (revised after the owner found the first financing clip weak, especially on phones):
  - Grain: two combines harvesting wheat.
  - Shop: Agrinvest big bags, the red Agrinvest spreader, then a seeder at work, slowed to about 0.6–0.8× speed.
  - Financing: sowing, then the harvest going onto trucks (credit at sowing, repaid after harvest). The office shot was grey and soft, and on a phone its middle was an empty wall; the "Agrinvest Credit" sign breaks into letter fragments in a portrait crop.

  The source windows hide cuts, so in and out points sit inside the shots found by ffmpeg's scene filter. The first cut flashed the next shot at some ends. Each loop's seam crossfades into its own start, and each poster is its loop's first frame.

- **Two shapes:** `{slide}.webm|mp4|webp` is 16:9 (1280w, poster 1920w); `{slide}-tall.*` is 9:16 (540w, poster 608w), framed on each shot's `focus`. A 16:9 frame on an upright phone showed only its middle, and the old 720w file was blurry there. `design-system/lib/media.ts` holds the shared query (`TALL` = aspect ratio ≤ 4:5). `Photo tall=…` renders a `<picture>` with one preload link per crop, so a phone fetches only the tall poster.
- **Sizes:** wide ≤ 1.2 MB, tall ≤ 0.6 MB, in WebM and MP4. The script raises CRF until each file fits.
- **ffmpeg:** comes from `ffmpeg-static`. If npm skipped its install script, run `npm rebuild ffmpeg-static`. A shot that starts at 0.0 in a keyframe-snapped window hung ffmpeg, so the shot now starts at 0.3 and every ffmpeg call has a 10-minute timeout.
- **Components:**
  - `HeroSlider.tsx` (server) renders posters, text and the rail.
  - `HeroCarousel.tsx` (client, loaded through `Lazy.tsx`) holds the index, the timer, the loops and the controls.
  - Rotation is a JS timer. The reduced-motion rule in tokens.css cuts CSS animations to 0.01 ms, so the bars (`--animate-hero-progress`) are visual only.
  - Hover holds the slide only over the text, controls and rail, not the footage.
  - The slider headline uses `text-h1 md:text-display` (`HeroCopy size="display"`), so the rail stays above the fold at 1440×900 and 390×844.
- **Budget:** a plain import from `RenderBlocks` put the carousel in the catch-all route's shared chunk and in `/finantare/aplica`, which rose to 162.8 KB. With the lazy import it is 159.2 KB, and no page without a slider loads the carousel.
- **Model:** the hero block has an optional `slides` array (eyebrow, title, accent, lead, poster, clip, primary, secondary). Migration `20261111_065829_home_slides` only adds tables. The local database runs in push mode; start Payload once (dev server, seed or any `getPayload`) before `npm run build`.
- **Rail:** the home page now passes per-crop `href`s and diesel (`dieselTicker`) to the hero. The single `Hero` ignores them.
- **Copy:** in `scripts/site/hero.ts`, shared by the stories and later by the seed and `apply:redesign`. Changes from the plan's draft:
  - `{{S1}}` (silos and warehouses, 17) instead of `{{S2}}`, which is capacity in tonnes. Section 4's figure row has the same swap.
  - The offer link goes to `/cereale#cerere`, the lead form's real anchor.
  - The shop line no longer promises farm delivery, since the cart says "Fără livrare" and a consultant confirms: "Comanzi online, iar un consultant îți confirmă stocul și livrarea."
  - The second shop button reads "Produse pentru grâu", because it goes to the wheat hub.
- **Focal points (all cropped photos):** `Photo focus` sets `object-position` from the Media document's focal point (`focusOf` in `design-system/lib/media.ts`). The single `Hero`, story sections, article covers and cards, and LinkedIn cards pass it. The upright phone hero showed only the middle quarter of a 16:9 still. Slider posters do not use it, since phones get the framed `-tall` poster. The seed sets focal points on the five footage stills (`focus` in `scripts/seed/index.ts`). Editors move them in the admin; product photos are never cropped.
- **Seed media fix:** the seed looked up `name.webp`, but storage saves `name-N.webp` when a name is taken, so each run uploaded the five stills again (20 copies locally). It now matches `name(-N)?.webp` and reuses the oldest copy.
- **Wiring left for 7b.3/7b.4:**
  - The seed uploads the three wide posters (`public/media/hero/{grain,shop,finance}.webp`, alt text in `posterAlt`) to Media and writes `slides` into the home hero.
  - `apply:redesign` does the same on live, and sets the stills' focal points there (same values as the seed's `focus`).
  - e2e: one H1 on home, rail links.
- **Shots:** `docs/design-review/shots/2026-11-11/patterns-hero-slider--*` (reduced motion, axe passes). Playing-state shots were taken separately with video.

### 7b.3 notes

- **Patterns** (server components, no client JS): `LivePanel.tsx`, `PriceChart.tsx`, `HomeSections.tsx` (`ShopShowcase`, `FinanceToolsRow`, `CompanySection`), `CountyMap.tsx`. Stories: `Patterns/Home sections` (each section plus the whole page) and `Patterns/Content` › County map.
- **Live panel** (revised after owner review 2026-11-11):
  - The tabs show only an icon and a name, one per crop plus diesel (Oil Bulletin average, €/1000 l); the owner wanted no price in the tabs. The price is the chart's lead figure. The "Prețurile de azi" chip row and the "Vezi cifrele" table were dropped; the table stays for screen readers only.
  - Tabs are radio inputs; a panel shows through `group-has-[#live-{key}:checked]`, spelled out per key in `LivePanel.tsx` (Tailwind needs literal classes).
  - `LiveRotator` (client, through `Lazy.tsx`) checks the next radio every 6 s. It holds while the pointer or focus is on the panel and stops for good when the visitor picks a tab. It starts paused under reduced motion, and its pause/play button sits in the panel header beside "Actualizat". On phones it scrolls the tab row to the active tab.
  - `PriceChart` is a market-quote layout: the latest price as the lead figure, a change pill against the reading before, a 2px line over a 10% wash, and a CSS-only hover crosshair and tooltip (per-date strips, `group-hover`). `LineChart` stays for the other pages.
- **Times are absolute** (`formatWhen`: "11 nov., 09:40", Romanian time). Pages are static and revalidated by tag, so "acum 2 h" would go stale in the cache.
- **Feed:** each source is capped (3 headlines, 2 Agrinvest news, 2 guides, 1 market note, 2 LinkedIn posts, 2 price moves), then newest 6. One busy source cannot fill it.
- **Series:** `cropSeries` / `agrinvestSeries` in `src/lib/prices/overview.ts`. Agrinvest's best price per day (shared `bestByDay` with `railRows`); with fewer than two days it falls back to the EU market line.
- **Shop:** tiles use packshots from their own category (one per subcategory first), since categories have no image field. The strip is `pickProducts` in `HomeShop.tsx`: photo and price, round-robin across top categories. `ProductCard` has no add-to-cart button (only "Vezi produsul"); a cart button would need a client form, so it is left out.
- **Company figures** (simplified after review: value and label, no rules): `{{S2}}` capacity, `{{S1}}` silos and warehouses, `{{C4}}` counties (the "11" is register C4, not typed), `{{L1}}` trucks. Finance box carries the F5.instalments marker.
- **Map:** `BaseListBlock` now renders `CountyMap` + base links (server). Ramp `lime → accent → forest` in thirds of the county totals; the base page's county gets a lime outline. The client `BaseMap.tsx` and `BaseMapLazy` are deleted; `ui.pendingMap` removed.
- **Crop pages:** no bases section; "Vezi bazele" now goes to `/depozitare`; `where`/`whereLead` copy removed.
- **Home FAQ and SEO** draft: `scripts/site/home.ts` (seed now, `apply:redesign` in 7b.4).
- **7b.2 fixes from the same review:**
  - Hero rail: the grain unit now shows once under the date, and diesel's unit sits beside its value. Before, the long "lei/t, franco bază" in every cell overflowed into the next cell on desktop.
  - Cells shrink only from `lg` up; on phones they keep their width and scroll.
  - Pressing ▶ now starts the loops even under reduced motion or Save-Data, as an explicit choice. Before, it only rotated the posters.
- **Shots:** `docs/design-review/shots/2026-11-11/patterns-home-sections--*`, `patterns-content--map*`, and `7b3/` (slider playing with video, chart hover; tabs switch without JS).

- **Wiring:**
  - `page.tsx` renders the hero, then `HomeLive`, `HomeShop`, `HomeFinanceTools` and `HomeCompany`, then the FAQ. CMS blocks after the hero are no longer rendered on home.
  - No ticker on home whenever the hero leads.
  - `TodayStrip` (the component), `HomeArticles` and `HomeSocial` are deleted; `TodayStrip.tsx` keeps the widget prop helpers `ToolWidget` uses.
- **Seed:**
  - `scripts/seed/home.ts` builds the home layout: one hero block with the 3 slides from `scripts/site/hero.ts`, plus the FAQ.
  - `seedMedia` uploads `public/media/hero/{grain,shop,finance}.webp` with `posterAlt`, under Media keys `hero:{name}`, rights pending.
  - Home `seo` comes from `scripts/site/home.ts`. The title was shortened to "Agrinvest: vinde cereale, preț grâu azi, magazin agricol" because check:seo caps titles at 60 characters.
  - `baseList` was removed from `/cereale` (RO and EN) and added under "Baze și capacitate" on `/despre/cifre` and `/en/about/figures`.
- **For 7b.4 (`apply:redesign` on live):**
  - Write the same home layout, FAQ and SEO.
  - Upload the posters to Media through cloud storage (CI has none, so the posters are null there and the slider shows no poster).
  - Remove `baseList` from home and `/cereale`, and add it to `/despre/cifre`, in both locales.
  - The navigation and footer step from section 6.
- **Checks (2026-11-11, `next start` on :3300):**
  - typecheck, lint (0 errors; 4 warnings in `scripts/demo/seed.ts`), and build all pass. format:check flags only `o.html`, which is not part of this work.
  - test:int: 217 passed, 1 failed (the known price alert).
  - e2e: 96 passed, 3 failed, all known: pilot-product Offer, `/ghiduri/grau` 404, and the motorina lead, which trips the rate limit on `next start`.
  - check:seo: 44 errors, all demo data.
  - check:aeo: 55/56. The miss is the `/magazin/erbicide` intro, edited in the local admin; the seed keeps admin edits.
  - check:tools and check:articles: 0 errors.
  - check:budget: 0 over. Home is 152.4 KB, `/finantare/aplica` 159.2 KB, storage and base pages 152.0 KB.

## Context

The owner reviewed the live test site and asked for a rethink of the home page, the hero slider, the header price ticker, the mega menu and the footer:

- **Slider:** calmer, more useful, more alive. Real video clips, smarter text and buttons, and a better way to show prices.
- **Ticker:** it repeats the hero prices on the home page. Show it everywhere else, with every price clickable.
- **Menu:** 8 top items is too many. The shop panel is weak.
- **Below the hero:** too many explanatory sections. The full map doesn't belong on the home page.
- **"Today":** three separate cards that feel static.
- **Shop:** the home page barely shows that a shop exists.
- **Bases block:** "Bases / Where wheat is received" is repeated on many pages for no reason.
- **Overall:** everything must stay SEO and AEO friendly and follow `docs/audit/keyword-map.csv`.

Owner decisions (2026-11-10):

- Menu has 5 items: Shop · Prices & tools · Financing · Agrinvest · News & guides.
- The slider has 3 slides: sell grain, shop, financing.
- The live section is called **"În direct din câmp" / "Live from the field"**.
- The home shop section sits between "categories first" and "products first": category tiles plus crop chips plus a 6-product strip, with excellent design.

Standing rules still apply:

- Commit only when asked.
- Lighthouse runs once, at the end.
- Show design shots before wiring the home page.
- Write natural copy and never pad.
- All facts come from the figures register (`{{KEY}}` / `<Fact>`).
- Write `ș ț` with the comma below.
- Rehearse every live database write before merging.

Branch: `redesign/home-nav`, from an up-to-date `main`. Phase doc: `site/docs/phases/07b-home-navigation.md` (copy this plan into it).

---

## 1. Information architecture: menu, footer, tools hub

### New navigation (5 items + Contact button)

| Item (RO / EN)                     | href         | Panel                                                                                                                                                                                        |
| ---------------------------------- | ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Magazin / Shop                     | `/magazin`   | **Shop panel built from live data** (below)                                                                                                                                                  |
| Prețuri și unelte / Prices & tools | `/preturi`   | Grain prices (per crop: grâu, porumb, floarea-soarelui, rapiță, orz → `/preturi/{crop}`) · Fertiliser prices · Diesel · Net price calculator · Repayment simulator · "All tools" → `/unelte` |
| Finanțare / Financing              | `/finantare` | existing finance children (from `financeMenu`)                                                                                                                                               |
| Agrinvest                          | `/despre`    | 3 groups. **Vinde cereale**: `/cereale`, the 5 crops. **Servicii**: Depozitare și uscare, Logistică. **Companie**: Despre, Agrinvest în cifre, Parteneri, Cariere                            |
| Știri și ghiduri / News & guides   | `/ghiduri`   | Guides for farmers · Financing guides · Agrinvest news · Farm news · Market note                                                                                                             |

**Shop panel** (4 columns plus a promo card):

- Seeds (17) · Crop protection with its subcategories and counts · Nutrition with its subcategories.
- "By crop" chips, from the crop hubs `/magazin/cultura/{slug}`.
- Top brands, from `/magazin/producator`.
- Search.
- A small promo card that links to financing. It must only hint, never imply eligibility.

Counts come from the Categories collection at render time, so they never go stale. Data from local DB: Semințe 17, Erbicide 14, Fungicide 6, Insecticide 9, Tratament sămânță 3, Adjuvanți 3, Regulatori 1, Îngrășăminte 9, Foliare 9.

### Model and component changes

- `src/globals/Navigation.ts`:
  - On items, add a `panel` select (`links` | `shop`) and an optional `promo` group (title, text, link).
  - On children, add an optional localized `group` text, which gives the column headings.
  - Then run `generate:types`, `generate:importmap` and `migrate:create home-nav`.
- `design-system/patterns/MegaMenu.tsx` gets a new panel layout:
  - grouped columns with headings;
  - optional counts;
  - a promo card;
  - a full-width `ShopPanel`.
  - It keeps the existing hover intent, keyboard and no-JS behaviour, and all links stay in the server-rendered HTML for crawlers.
- Mobile menu (`SiteHeader.tsx` `<details>`): show the groups as sub-headings and keep it JS-free.
- `src/components/SiteShell.tsx` passes the shop data to the header: category tree with counts, crop hubs and brands, read through a cached loader in `src/lib/content/`.

### Footer

- Five columns mirror the menu: Magazin · Prețuri și unelte · Finanțare · Agrinvest · Știri și ghiduri.
- A brand column holds contact, social icons and the newsletter link.
- The legal row stays as it is.
- `design-system/patterns/SiteFooter.tsx` gets a light layout update only.

### Tools hub (new page)

- `/unelte` and `/en/tools`: a short page listing the tools as cards:
  - grain prices
  - net price calculator
  - fertiliser prices
  - diesel
  - repayment simulator
  - finance application
- Route files go in `src/app/(frontend)/[locale]/unelte` and `.../tools`, with paths in `src/i18n/routes.ts`. Reuse `ToolLinks.tsx` items.
- JSON-LD: CollectionPage + ItemList + breadcrumbs, with hreflang.
- Add keyword rows by hand to `keyword-map.csv`: "calculator agricol", "unelte fermieri", "calculator preț net cereale". Never rerun `audit:keywords`.

### One source of truth for menu and footer

- New `scripts/site/navigation.ts` exports the full RO and EN nav and footer. The seed (`scripts/seed/index.ts`) and the deploy step both use it.
- The old additive helpers would re-insert top-level items on every deploy. Make them check hrefs at any depth, so they become no-ops under the new structure:
  - `withToolsMenu` and `withToolsFooter` in `scripts/tools/entry-points.ts`
  - the articles and finance `entry-points.ts` helpers
- Add the new file to the cache epoch in `next.config.ts`, or the live menu stays stale.

---

## 2. Header price ticker

`SiteShell` gets a `ticker` prop. The catch-all page passes `false` when the page is home and the hero shows prices; every other page shows the ticker. In `SiteHeader.tsx`:

- Each crop price becomes a `Link` to `/preturi/{crop}` (`cropPricePath` in routes).
- Add **diesel as one more price** with a fuel icon, linking to `/motorina`. Data comes from `getDieselPrice` / `nationalDiesel` (`src/components/TodayStrip.tsx` `dieselCardProps`).
- The new fuel icon goes in a server-only icon module, because the shared icon bundle sits at its budget limit.

---

## 3. Hero slider (video, 3 slides)

### Clips

- New script `scripts/brand/clips.ts` with an `ffmpeg-static` devDependency (ffmpeg is not installed on the machine).
- Source: Agrinvest's own footage in `data/raw/video/*.webm`. Contact sheets are in `data/raw/frames/sheet-*.jpg`. Rights are pending, same as the photos.
- Output: silent 6–8 s loops at 1280w and 720w, in WebM (VP9) and MP4 (H.264), at most about 1.2 MB each, plus a poster WebP per slide. Files go in `public/media/hero/`.
- Candidate scenes from `x5wm8dXlJt4`:

| Slide     | Candidate scenes                                                                    |
| --------- | ----------------------------------------------------------------------------------- |
| Grain     | Truck unloading at reception (194 s) or combine and truck at harvest (62 s / 266 s) |
| Shop      | Pallets of big bags (158 s); check the other 2 videos for product shots             |
| Financing | Agrinvest Credit office (38 s / 326 s) cut with a field shot (350 s)                |

### Component

- New `design-system/patterns/HeroSlider.tsx` as a small client island, replacing `Hero.tsx`'s single image when `slides` exist.
- The **poster is the LCP image** (`Photo priority`). The video `src` is attached only after `load` plus idle, and only for the active slide. It stays a poster under `prefers-reduced-motion` or Save-Data. `<source media>` serves 720w on small screens.
- Interaction:
  - Autoplay rotates about every 7 s, with progress bars that double as slide tabs.
  - A pause/play button (WCAG 2.2.2).
  - Pause on hover and focus; swipe; arrow keys.
  - `aria-roledescription="carousel"`.
- Text is calmer: one eyebrow, one headline (at most about 8 words), at most one short line, 2 buttons.
- All slides are server-rendered. Slide 1's headline is the page's **only H1**; the others are `h2`.

### Persistent price rail

- The rail along the bottom stays the same across slides.
- It shows Agrinvest's best price per crop, plus diesel with its fuel icon, each with its delta. **Every item links to its own page.**
- If no prices are published, it falls back to quick links.

### Draft copy

For the owner to review. `{{ }}` means a figures-register value.

| Slide     | Headline (H1 on slide 1)                                 | Line                                                                              | Buttons                                                                      |
| --------- | -------------------------------------------------------- | --------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| Grain     | **Vinde cereale la prețul zilei**                        | Prețul pe fiecare cultură, recepție în {{S2}} silozuri și depozite, plata {{C8}}. | Cere ofertă → `/cereale#oferta` · Vezi prețurile → `/preturi`                |
| Shop      | **Semințe, protecție și nutriție, cu prețul pe ambalaj** | Comanzi online, livrăm la fermă.                                                  | Intră în magazin → `/magazin` · Caută după cultură → `/magazin/cultura/grau` |
| Financing | **Credit agricol cu rate după recoltă**                  | Prin Agrinvest Credit IFN, răspuns {{F4.reply}}.                                  | Vezi finanțarea → `/finantare` · Simulează rata → `/finantare/simulator`     |

EN has parity, e.g. "Sell your grain at today's price", "Seeds, crop protection and nutrition, priced per pack", "Farm credit repaid after harvest".

### Model

- The `hero` block gets an optional `slides` array of localized fields: eyebrow, title, accent, lead, poster (media), video src (text), primary, secondary.
- When `slides` exists, `Hero` renders `HeroSlider`; other pages keep the single hero.

---

## 4. Home page below the hero

`src/app/(frontend)/[locale]/[[...path]]/page.tsx` replaces `TodayStrip`, `HomeArticles`, `HomeSocial` and the CMS blocks after the hero with code-driven sections. Copy lives in `src/i18n/home.ts`. Order:

1. **În direct din câmp / Live from the field**: one panel, not three cards. New `src/components/HomeLive.tsx` plus `design-system/patterns/LivePanel.tsx`.
   - **Header:** a pulsing live dot, the title, and "actualizat azi la 09:40" from the latest data timestamp.
   - **Left (7/12):** a price chart (`LineChart.tsx`) of Agrinvest's best price over time for each crop.
     - Crop tabs are CSS-only (radio inputs), so no extra JS.
     - The data comes from the per-day prices `railRows` already reads in `src/lib/prices/overview.ts`; add a series helper there.
     - Fallback: the EU market series.
     - Under it, a chip row: grâu, porumb, floarea-soarelui, rapiță, motorină (fuel icon), each linking to its page.
   - **Right (5/12):** one mixed **feed of the latest 6 updates**, sorted by time, each with a type icon and "acum 2 h":
     - farm news headlines (`listHeadlines`)
     - Agrinvest news and new guides (`listArticles`)
     - the market note
     - LinkedIn posts (`social-posts`)
     - price moves ("Grâu +20 lei/t")

     Footer links: "Toate știrile" and "Toate prețurile".

   - This takes over the guides and LinkedIn sections, so the page gets shorter.
2. **Magazin Agrinvest / Shop**: new `src/components/HomeShop.tsx`.
   - 3 large category tiles (Semințe · Protecția plantelor · Nutriție), each with a photo, a product count and 2–3 subcategory links.
   - A row of "Pentru cultura ta" crop chips → `/magazin/cultura/{slug}`.
   - A horizontal snap strip of 6 products using the existing `ProductCard` with price and add to cart. Selection rule: published, with a photo and a price, spread across categories. No new field.
   - One "Toate produsele" link.
   - JSON-LD: ItemList of the 3 categories.
3. **Financing and tools in one row** (finance 7/12, tools 5/12):
   - **Finance:** a striking compact box. Headline "Rate după recoltă", the 2-instalment visual from `financeBand` (summer / autumn), and one button to `/finantare`. No paragraph.
   - **Tools:** "Unelte pentru fermă" with 4 polished icon buttons: Calculator preț net, Simulator rate, Prețuri îngrășăminte, Motorină. Plus "Toate uneltele" → `/unelte`.
4. **Agrinvest**: one section that replaces the figure strip, service grid, base map, steps and CTA band.
   - Headline: "Un singur partener, de la semănat la vânzare".
   - A compact figure row: {{S1}} t, {{S2}} silos and warehouses, 11 counties, fleet {{L1}}.
   - 4 link tiles, each with one line: Vinde cereale · Depozitare și uscare · Logistică · Despre Agrinvest.
   - No map.
5. **FAQ** (kept for AEO): 4–5 direct answers covering price, where to deliver, payment, shop delivery and financing, with the FAQPage schema as now.

Home SEO: update the home `seo.title` and description to cover "agrinvest", "vinde cereale", "preț grâu azi" and "magazin agricol".

---

## 5. Bases block and map

- Remove `BaseListBlock` from `src/components/templates/CropPage.tsx`: the "Where {crop} is received" / "Unde livrezi {crop}" section, 10 pages. Drop the now-unused `where` and `whereLead` copy.
- Remove the `baseList` block from the home and `/cereale` (both locales). It stays only on `/depozitare` and `/en/storage`.
- New simplified map, `design-system/patterns/CountyMap.tsx`, replacing the detailed `BaseMap` view:
  - county outlines only;
  - counties with bases shaded light to dark by total capacity (from `Bases`);
  - no pins, labels or legend clutter, just a small 3-step scale.
  - Used on `/depozitare` and `/despre/cifre`. Base pages keep their own list.

---

## 6. Live database changes (deploy step)

New `scripts/redesign/apply.ts` → `npm run apply:redesign`, added to `scripts/deploy/prepare-database.sh`. It is safe to repeat (it skips when the target state is already there) and uses `keepUrl` for every page save. It:

1. Writes the new navigation and footer from `scripts/site/navigation.ts`, only while the old 8-item structure is present.
2. Sets the home layout to a hero with 3 `slides` (both locales) and updates the home FAQ and SEO.
3. Removes `baseList` from `/cereale` and from home.

Rehearse it per the deploy-rehearsal rule:

- a `main` worktree with old data;
- run the step twice and diff every path;
- also run the fresh-database (CI) path.

---

## 7. Design review gate (before wiring)

- Build Storybook stories for HeroSlider, MegaMenu (shop panel and grouped panel), LivePanel, HomeShop, the finance and tools row, the company section, CountyMap and the footer.
- Take desktop and mobile shots with `scripts/checks/shoot.ts` and show them to the owner.
- Wire the home page only after approval.

## 8. Order of work (one chat per step, ending with the next-chat prompt)

1. **7b.1**: navigation model, mega menu, footer, tools hub, ticker links (Opus: model and design).
2. **7b.2**: clips script, HeroSlider, hero `slides` (Opus: design and performance).
3. **7b.3**: home sections, then design-review shots, then wiring; CountyMap; bases removal (Opus).
4. **7b.4**: `apply:redesign`, rehearsal, gate (Sonnet: routine checks).

## Verification

- `npm run typecheck`, `lint`, `format:check`, `build`, `test:int`, `test:e2e`.
- Update the e2e tests:
  - home has one H1;
  - the ticker is absent on home and present on `/magazin`;
  - ticker and rail prices link to `/preturi/{crop}` and diesel to `/motorina`;
  - the mega menu shop panel has category links in the HTML;
  - the crop pages contain no bases section;
  - `/unelte` renders.
- Use a temporary Playwright config on another port (another session may hold :3100).
- With `npm start`: `check:seo` reports 0 errors, then run `check:aeo`, `check:tools`, `check:articles`, `check:finance`, and `check:budget` (script ≤ 160 KB; watch `/finantare/aplica` at about 159.7 KB, since the slider and menu must not add to shared chunks).
- Manual: reduced-motion and Save-Data show posters only; keyboard through the slider and mega menu; mobile menu without JS.
- Lighthouse **once** at the end (applied throttling, decision 0003): home LCP < 2.0 s with a poster LCP, CLS < 0.05.
- Rich Results Test on the preview; owner review; merge only when asked.
