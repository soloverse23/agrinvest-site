# Phase 5

## Farmer tools, tool widgets and the new home page

Status: **Plan approved 2026-11-10. 5.0 setup and 5.1 platform done (2026-11-10); 5.2 grain prices next.** Sub-phases run in order: 5.0 setup → 5.1 platform → 5.2 grain prices → 5.3 input prices → 5.4 diesel → 5.5 weather → 5.6 news → 5.7 home and widgets → 5.8 gate. Branch: `phase-5/tools`. Decisions: `docs/decisions/0008-farmer-tools.md` (written in 5.0).

## Context

The roadmap's Phase 5 adds daily-use tools that also win searches: grain and input prices, diesel, weather and news. Today almost nothing works yet, but a lot of groundwork exists:

- The `PriceHistory` collection records shop price changes.
- `Crops.quality` holds the moisture, impurity and hectolitre limits the net-price calculator needs.
- Bases and Counties have coordinates.
- The design system already has `PriceTile`, `PriceTable`, `Sparkline`, `Delta`, a `prices` rail prop on `Hero` and a `ticker` prop on `SiteHeader`. The app uses none of them yet.
- Base and crop pages have empty slots marked "Phase 5".

There are no routes, fetchers, jobs, cron, email sender, chart library or menu items for these tools.

The user added two requirements:

1. **Place the tools as widgets wherever they help** across the site.
2. **Redesign the home page.** The full-width map and figures row become small teaser cards that link to their own pages. The layout must leave room for Phase 6 (articles) without building any of it.

**Lighthouse runs once**, at the end of the phase.

### User decisions (2026-11-10)

- **Home layout: "Today first".** A shorter hero with today's grain prices on its rail, then a "Today" row of tool widgets, compact services, the map and figures teasers, a compact finance band, news, and the contact CTA.
- **Email: build now, sending stubbed.** Subscriptions, consent records, alert rules and newsletter issues are all built. Sending goes through a single `sendMessage` interface that writes to an Outbox and sends nothing until the owner picks a provider (the same pattern as `notifyLead`).
- **Lighthouse: manual-only in CI.** The `lhci autorun` step moves from `ci.yml` to a new `.github/workflows/lighthouse.yml` that runs only when started by hand (`workflow_dispatch`). Sub-phases check script size with a light `check:budget` script instead. Lighthouse runs exactly once, in 5.8.

### Assumptions to correct at review

- **Agrinvest's buy prices come from the admin.** Until the owner enters them, price pages show public market data plus "Agrinvest price: call or send a request". No price is ever invented.
- **There is a `/baze` index page** (full map and list of all 17 bases). The home map teaser links there, because `/depozitare` is about the service, not the network. The figures teaser links to `/despre/cifre`.
- **English parity (decision 0005) applies.** The English routes are `/en/prices/*`, `/en/diesel/*`, `/en/weather/*`, `/en/news` and `/en/market` (the weekly market note, as the keyword map says).
- **Agrinvest's own news pieces are `Guides` with a new `section: 'stiri'` value.** This keeps one article model for Phase 6 to extend. It adds a select value only; no Phase 6 work.
- **Open-Meteo's free API is non-commercial only.** Agrinvest needs a paid API key, or 5.5 ships with a configurable base URL and key and waits for the owner's decision. This is an owner input.

## Cross-cutting design

### Data model (5.1)

| Collection                            | Purpose                                 | Key fields                                                                                                                                                                                                                                                                                               |
| ------------------------------------- | --------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `BuyPrices`                           | Agrinvest's buy price per crop and base | crop, base (optional = all bases), price lei/t, basis (at base / delivered), validFrom, status (draft/published), source (`manual` / `feed`), note. Staff write, public read when published. REST with an API key, ready for a future automated feed                                                     |
| `MarketPrices`                        | Public market series                    | source (`eu-agrifood`, `eu-fertiliser`, `eu-oil-bulletin`; `brm` dropped in 5.1, see 0008), series (crop or product), market (RO region, Constanța FOB, national), price, currency, unit, period (week start), fetchedAt. Unique on source + series + market + period. Append-only, written by jobs only |
| `DieselPrices`                        | Agrinvest's diesel price                | price lei/l, VAT basis, validFrom, minimum volume, status                                                                                                                                                                                                                                                |
| `NewsItems`                           | RSS ingestion and editor queue          | title, url (unique), source, publishedAt, excerpt (short, from the feed only), crops, status (`nou` / `aprobat` / `ascuns`)                                                                                                                                                                              |
| `Subscriptions`                       | Alerts and newsletter                   | email or WhatsApp number, topics (price alert per crop with a threshold or any change, weekly newsletter, frost alert per county), locale, consent text and timestamp, status (`pending` until sending exists, then `confirmed`), unsubscribe token                                                      |
| `Outbox`                              | Every message the site would send       | channel, to, template, payload, status (`stubbed` / `sent` / `failed`). Staff-only. The owner can see what would have gone out                                                                                                                                                                           |
| `MarketNotes` (or a `Guides` section) | Weekly market note                      | Uses `Guides` with `section: 'piata'` so authors, reviewers and sources come free                                                                                                                                                                                                                        |
| `Newsletters`                         | Weekly issue                            | week, locale, generated content (market note, prices, approved news, own pieces), status                                                                                                                                                                                                                 |

Other model changes:

- `Leads`: a new type `motorina`, plus `quantity` (litres) and `deliveryDate`. Uses the existing `county` field.
- `Crops`: a new `gddBase` (°C) field.

After every collection change, run `generate:types`, `generate:importmap` and `migrate:create`.

### Jobs and freshness (5.1)

- **Jobs:** Payload `jobs` with tasks `fetchEuCereal`, `fetchEuFertiliser`, `fetchOilBulletin`, `ingestNews`, `evaluateAlerts` and `buildNewsletter`. (`fetchBrm` was dropped in 5.1: BRM's terms forbid reuse.)
- **Cron route:** `src/app/api/cron/[task]/route.ts`, protected by a new `CRON_SECRET`, with schedules in `vercel.json`. Check the Vercel plan's cron limits first; on Hobby, crons run once a day, which is enough for weekly series.
- **Revalidation:** new tags `prices`, `diesel` and `news` in `src/lib/revalidate.ts`. Jobs revalidate their tag after writing.
- **Weather is not stored.** It is fetched with `next: { revalidate: 3600 }`. Coordinates are rounded to 0.1° so the cache is shared and the user's exact location is never kept.
- **Every fetcher is pure.** Each parser is unit-tested on saved fixtures in `tests/fixtures/feeds/`. Each fetcher fails soft: the page shows the last good data with its date, never an error.

### Widgets (5.1 contract, placed in 5.7)

- **Server components first.** Each widget lives in `design-system/patterns/widgets/`, takes plain props and has a Storybook story. Data loaders live in `src/lib/{prices,diesel,weather,news}/`.
- **Client code only where it is needed:** the location button in weather and the inputs of the inline calculators. These load through `patterns/Lazy.tsx`, one file per tool, following the 4.4 lesson.
- **Charts are server-rendered SVG.** A `LineChart` pattern extends `Sparkline` with axes, labels, a `tabular-nums` table fallback and an accessible `<table>` under `<details>`. No chart library, because the script budget has about 8 KB left.
- **A `toolWidget` Payload block** (`widget`: grainPrices, netPrice, diesel, weather, news, plus options such as crop, county or base). Any page built from blocks can embed a tool, and Phase 6 articles can reuse it later without new work.
- **Widget list:**
  - `PriceRail`, using the existing Hero `prices` prop.
  - `PriceTile` and `PriceTable`, which already exist.
  - `NetPriceMini`: a link form into the calculator.
  - `WeatherCard`: today, the next spraying window, a frost flag, and a county selector that works without JavaScript plus a "my location" island.
  - `DieselCard`: Agrinvest price or "on request", the national weekly price, and links to the quote and the excise calculator.
  - `NewsList`: 3 to 5 headlines.
  - `BaseMapMini`: a server SVG with the outlines and points, no client code.
  - `FigureTeaser`: 3 numbers and a link.
  - `GuideList`: the Phase 6 slot. It renders nothing while there are no published guides outside finance.

## 5.0 Setup

- Create branch `phase-5/tools` from `main`, then add this doc and decision `0008-farmer-tools.md` (sources, licences, Open-Meteo plan, stubbed sending, Lighthouse-once rule).
- Move Lighthouse to `.github/workflows/lighthouse.yml` (`workflow_dispatch`) and remove the step from `ci.yml`. Update decision 0003 with an "Update" section.
- Add a `check:budget` script (`scripts/checks/budget.ts`). It loads each listed URL in Playwright chromium against `npm start`, sums script and font transfer bytes, and fails above 160 KB of script or 32 KB of fonts. It runs in CI with the other checks. This replaces per-sub-phase Lighthouse runs.

### 5.0 progress (2026-11-10)

**Built:**

- Branch `phase-5/tools` and this doc.
- Decision `0008-farmer-tools.md`, and an "Update" section in 0003.
- `.github/workflows/lighthouse.yml`, which runs only when started by hand and uploads its reports. The Lighthouse step is removed from `ci.yml`.
- `scripts/checks/budget.ts` (`npm run check:budget`). It reads the URLs from `lighthouserc.json` and runs in CI after `check:finance`.

**Results:** all 20 URLs are within budget. Script ranges from 147.9 KB (`/despre`, simulator, shop lists) to 159.5 KB (`/finantare/aplica`), which matches the Phase 4 Lighthouse figures. Fonts are 30.2 KB on every page.

**Found:** the check needs a fresh browser context for each URL. With one shared context, the cache made every page after the first count close to 0 KB.

**Owner inputs to request:**

- Agrinvest's buy prices and how often they change
- The diesel price, minimum volume and delivery counties
- An Open-Meteo commercial key, or approval of an alternative
- Later: an email or WhatsApp provider
- (5.1) `CRON_SECRET` in Vercel, and optionally written permission from BRM, Agrimedia or Agro TV

## 5.1 Platform

Build the collections, jobs, cron route, `sendMessage` with the Outbox, the `Subscriptions` server action (zod, `allow()` rate limit, consent text stored in both languages), the `LineChart` pattern, the widget contract and the `toolWidget` block. Pin down every source endpoint and licence by fetching it once, and save the fixtures:

- EU agri-food API, cereal prices with `memberStateCodes=RO`
- BRM weekly table at brm.ro/cotatii-cereale
- EU fertiliser price series
- EU Weekly Oil Bulletin (Romanian diesel)
- Open-Meteo forecast with soil moisture and ET0
- ANM warnings JSON
- The RSS feeds of revista-ferma, agrimedia, agro-tv, agrointel and brm

Any source that can't be reached is recorded and dropped. It is never scraped against its terms.

### 5.1 progress (2026-11-10)

**Source check** (full table in decision 0008, "Update: source check"; registry in `src/lib/sources.ts`; fixtures in `tests/fixtures/feeds/`):

- **Kept:** EU agri-food cereal and fertiliser prices (new host `api.tech.ec.europa.eu`), the EU Weekly Oil Bulletin (stable XLSX link), Open-Meteo (configurable base URL and key), and the RSS feeds of Revista Ferma (headlines only) and Agrointel (excerpts up to 500 characters, as its terms allow). All EU data is CC BY 4.0.
- **Dropped on their terms:** BRM's table and feed, the ANM warnings feed, Agrimedia and Agro TV. All forbid reuse without written consent. The `fetchBrm` job is not built.
- **EU agri-food API:** it throttled the check (HTTP 429) and then its backend was suspended (HTTP 500, "endpoint SUSPENDED") for the rest of the session, so there is no saved cereal or fertiliser fixture yet. The parsers follow the published OpenAPI schemas and are tested on schema-shaped samples. The oilseed (sunflower, rapeseed) spec also answered 500. All three are rechecked first thing in 5.2.

**Built:**

- **Collections:** `BuyPrices`, `MarketPrices`, `DieselPrices`, `NewsItems`, `Subscriptions`, `Outbox` and `Newsletters`, in a new "Prețuri și unelte" admin group. `Leads` has the `motorina` type plus `quantity` and `deliveryDate` (also in the lead validation and action). `Crops` has `gddBase`. `Guides` has the `stiri` and `piata` sections, and `check:finance` now reviews only the finance sections. Migration `20261110_100846_phase5_platform` is additive only.
- **Access:** visitors read published `BuyPrices` and `DieselPrices` rows, approved `NewsItems` and all `MarketPrices`. Only jobs write market prices and headlines. `Subscriptions`, `Outbox` and `Newsletters` are staff-only, and the unsubscribe token is hidden.
- **Jobs and cron:** Payload jobs `fetchEuCereal`, `fetchEuFertiliser`, `fetchOilBulletin`, `ingestNews`, `evaluateAlerts` and `buildNewsletter` (`src/lib/jobs/tasks.ts`). The route `src/app/api/cron/[task]/route.ts` checks `Authorization: Bearer $CRON_SECRET` with a constant-time comparison, and refuses every call when no secret is set. Schedules in `vercel.json` are daily or weekly, because Vercel Hobby allows at most one run a day per cron; the two agri-food calls are three hours apart. Successful jobs are deleted; failed ones stay in `payload-jobs` (visible in the admin) with their error. There are no retries: the next scheduled run is the retry.
- **Upserts:** `MarketPrices.key` (`source|series|market|period`) is unique, so a rerun adds nothing. The series is append-only.
- **Revalidation:** tags `prices`, `diesel` and `news`. Jobs and the collection hooks revalidate them.
- **Messaging:** `sendMessage` (`src/lib/messaging/send.ts`) writes every message to the Outbox. With no provider, each row is `stubbed`. A `dedupeKey` stops a rerun from writing the same alert twice. While nothing can be sent, alerts and newsletters include pending subscribers, so the Outbox shows everything that would go out.
- **Subscriptions:** the `subscribe` server action (`src/lib/subscriptions/actions.ts`) validates with zod, reports every missing field at once, uses `allow()` in production and stores the consent text the visitor saw (RO or EN), its version and the time. A second sign-up from the same address adds its topic to the same row.
- **Alerts and newsletter:** `evaluateAlerts` compares each crop's latest published Agrinvest price (the highest across bases) with the one before, for the rules `any`, `above` and `below`. `buildNewsletter` drafts this week's issue in RO and EN from published prices, approved headlines and the latest `piata` note. When staff set an issue to `approved`, it goes to the Outbox once and becomes `queued`.
- **Parsers:** pure and tested on fixtures. They cover the Oil Bulletin (a built-in XLSX reader, no new dependency), RSS (headline, link and date, the excerpt clipped to the source's limit, links to other sites dropped, `content:encoded` never read), Open-Meteo (coordinates rounded to 0.1°, the key sent only to the paid host, cached for an hour, not stored) and EU agri-food.
- **Design system:** `LineChart` (server SVG, HTML axis labels, the last point marked, the second series dashed so colour is not the only cue, a data table under "Arată datele", the table alone below two points), the widget contract (`design-system/patterns/widgets/`: `types.ts`, `WidgetFrame`, `README.md`) with ready, stale and empty states, and stories for each. The `toolWidget` block (grainPrices, netPrice, diesel, weather, news; with crop, county and base) is in `pageBlocks`. Its renderer `src/components/ToolWidget.tsx` outputs nothing until each widget is built.
- **Env:** `CRON_SECRET`, `OPEN_METEO_API_KEY` and `OPEN_METEO_BASE_URL` are in `.env.example`.

**Verified:** `typecheck`, `lint`, `format:check` and `build` pass. `test:int` passes 177 of 177, including 24 new tests in `tests/int/tools.int.spec.ts`. `test:e2e` passes 81 of 81. `check:seo` reports 0 errors on 418 pages. `check:budget` puts all 20 URLs within budget, unchanged from 5.0. Storybook builds, and the widget stories were checked at 390 and 1200 px. On `npm start` with a local secret, `fetchOilBulletin`, `ingestNews`, `evaluateAlerts` and `buildNewsletter` ran through the cron route. They stored Romania's diesel price for the 2026-11-02 bulletin (2,070.93 €/1,000 l), 40 headlines (Agrointel excerpts at most 417 characters, Revista Ferma none) and two draft issues.

**Found:**

- The Oil Bulletin page lists the weekly file under an old filename date, but the document id serves the current week.
- Payload's types make required fields that have defaults mandatory in `create` calls, so tests spell out `basis` and `source`.
- `.prettierignore` now skips `tests/fixtures/feeds/`, so fixtures stay byte-for-byte as fetched.
- **`BuyPrices` over REST with an API key is not switched on yet.** It needs `auth.useAPIKey` on `Users`, which would let every staff account, IFN included, create a key with its full access. When a price feed exists, enable it for a dedicated feed account (one line and a migration). Until then the collection's access rules already allow a staff writer.

**Owner inputs added:**

- Optional: written permission from BRM, Agrimedia or Agro TV, if the owner wants their data or headlines.
- Set `CRON_SECRET` in Vercel before the first deploy with crons. Also confirm the plan: on Hobby, crons run once a day.

## 5.2 Grain prices

Routes:

- `/preturi`: the hub with a crops × markets table and the latest market note.
- `/preturi/{grau|porumb|floarea-soarelui|rapita|orz}`: Agrinvest price by base when published, the EU series for Romania (BRM dropped in 5.1), a 52-week `LineChart`, the "sell to the nearest base" CTA (a lead of type `vanzare-cereale` with the crop and base prefilled), and the alert sign-up.
- `/preturi/calculator-pret-net`: a GET form that works without JavaScript, like the 4.4 simulator.
  - Inputs: crop, quantity, price, measured moisture, impurities, hectolitre weight.
  - Output: deductions under the standard scăzământ formula using the `Crops.quality` limits, then the net quantity and value. Every rule is cited.
  - URLs with parameters are noindex and canonical to the clean page.
- `/en/prices/*` and `/en/market`: the English pages.

Also in 5.2:

- **The weekly market note:** a `Guides` `piata` entry written by staff. Its draft is generated from the week's series so staff only edit it.
- **Dataset JSON-LD** on each price page: temporal coverage, source and licence.
- **`evaluateAlerts`:** after each price write it compares the new price with each subscription's threshold and writes Outbox rows.
- **Finance hint:** price pages carry the existing `FinanceLinks` hint (finance stock and contract credit), as Phase 4 asked.

## 5.3 Input prices

- `/preturi/ingrasaminte` (and the English page): built from shop variant prices, `PriceHistory` (a dated series per product and its unit price) and the EU fertiliser index.
- Each product links to its shop page. Pilot products keep their "de confirmat" marker.
- Fertiliser product pages get a small price-history chart.

## 5.4 Diesel

- **`/motorina`** (and the English page):
  - Agrinvest's price, or "on request".
  - The national weekly price from the Oil Bulletin, with a chart.
  - A quote and order form (volume, county, date) that creates a lead of type `motorina`.
  - Consultant contact. `notifyLead` stays a no-op.
- **`/motorina/calculator-acciza`:** a GET calculator for hectares × litres per hectare × lei per litre. Litres per hectare by crop and the lei-per-litre rate come from the current legal act. Each value is checked and cited, with a "last checked" date, and stored in a data file, not hard-coded.
- **The rules guide** on the same page, with an update date.

## 5.5 Weather assistant

- **`/meteo`:** the hub, with a county list and a location island.
- **`/meteo/{judet}`:** 42 indexable county pages, plus the English pages. Each shows:
  - a 7–14 day forecast
  - spraying windows, from a documented rule set (wind, rain-free hours, temperature, humidity)
  - frost alerts (2 m and soil)
  - growing degree days per crop (`gddBase`)
  - soil moisture and ET0
  - a link to ANM's official warnings (the ANM feed's terms forbid reuse, so it is not shown on the page)
- **All the calculations are pure** functions in `src/lib/weather/` with unit tests.
- **Base pages** show their local weather, using the base coordinates or the county centroid.
- **Frost alerts** go to subscribers through `evaluateAlerts`, and land in the Outbox.

## 5.6 News and newsletter

- **`ingestNews` job:** feeds become `NewsItems` with status `nou`. Staff approve them in the admin, which is the editor queue.
- **`/stiri`:** indexed. It lists Agrinvest's own `Guides` `stiri` pieces ("what it means for the farmer"), each linked to tools and products, with approved headlines below.
- **`/stiri/flux`:** a noindex list of every approved item. It shows the title, source, date and outbound link only; no copied text beyond the short feed excerpt.
- **`buildNewsletter` job:** builds a weekly `Newsletters` issue in RO and EN for staff review. Sending is stubbed, so the issue goes to the Outbox.
- **Newsletter sign-up:** in the footer and on `/stiri`.

## 5.7 Home redesign and widget placement

**Design gate first:**

1. Build the home layout in Storybook (`design-system/pages/Home.stories.tsx`, rewritten).
2. Run `review:shoot` at 390, 768 and 1440 px in RO and EN.
3. Score it against `docs/design-review/rubric.md` and record the review in `docs/design-review/reviews/`.
4. Show the owner the shots before wiring.

**Home ("Today first")**, built as Payload blocks through the seed and a live entry-points script (pattern: `scripts/finance/entry-points.ts`):

1. **Hero:** shorter, with the `prices` rail (wheat, corn, sunflower, rapeseed with Delta). It falls back to the needs links when no price exists.
2. **"Azi" row** (a new `todayStrip` block): `WeatherCard` (county selector), `DieselCard`, `NetPriceMini`.
3. **Services:** a compact two-column list instead of the large cards.
4. **Teaser pair** (a new `teaserPair` block): `BaseMapMini` → `/baze`, and `FigureTeaser` (S1, S2, L1) → `/despre/cifre`. This replaces the full `baseList` and `figureStrip` on the home page only; `/cereale` and `/depozitare` keep their full map.
5. **Finance band:** compact variant.
6. **News list** (3 headlines) next to the `GuideList` slot for Phase 6, hidden while empty.
7. **Contact CTA and FAQ.**

**Widgets elsewhere:**

| Place                                                      | Widget                                                                                                                                 |
| ---------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Header (md and up, all pages)                              | `ticker` with 3 crop prices, server-rendered                                                                                           |
| `/baze/{baza}`                                             | Today's price at this base, `WeatherCard` for the base, spraying window                                                                |
| `/baze` (new index)                                        | Full `BaseMap`, list, each base's price                                                                                                |
| `/cereale`, `/cereale/{crop}`                              | `PriceTile` and chart for the crop, `NetPriceMini` (replaces the finance stand-in noted in `CropPage.tsx:114`; the finance hint stays) |
| Fertiliser products and categories                         | Price history chart, link to `/preturi/ingrasaminte`                                                                                   |
| Crop-protection products                                   | `WeatherCard` with the spraying window                                                                                                 |
| `/finantare/credit-contracte-cereale`, `finantare-stocuri` | `PriceTable` (grain value context)                                                                                                     |
| `/logistica`                                               | `DieselCard`                                                                                                                           |
| `/stiri` pieces                                            | Related tool via the `toolWidget` block                                                                                                |
| Footer                                                     | Newsletter sign-up                                                                                                                     |

**Navigation:** a new "Prețuri și unelte" menu item (prices, net-price calculator, diesel, weather, news) and footer column, written by the entry-points script.

## 5.8 Gate

- **`check:tools`** (pattern of `check:finance`: rules in `scripts/tools/gate.ts`, runner in `scripts/checks/tools.ts`, a unit test, a line in CI). It checks that:
  - every series has data newer than its expected cadence plus a margin
  - every price page has Dataset JSON-LD and a source line
  - calculators cite their rule sources with a "last checked" date under a year old
  - there is no Agrinvest price without a published row
  - the noindex and canonical rules hold for URLs with parameters

  Under `SITE_INDEXABLE=true`, a stale series fails.

- **Add every new URL** to `lighthouserc.json` (hub and one example of each template, RO and EN).
- **The single Lighthouse run:** start `lighthouse.yml` by hand (or `npx @lhci/cli autorun` locally with devtools throttling) across all old and new URLs. Fix and re-run only the URLs that fail. Record the results in the phase doc.
- **Rich Results Test** on a price page (Dataset), a weather county page and a base page.
- **Deploy rehearsal** of the migrations and entry-points script on a copy of live data before merge, as in Phase 4. Then the Vercel preview and the owner's review.

**Owner inputs (requested in 5.0):**

- Buy prices and how often they are updated
- Diesel price, minimum volume and delivery counties
- Open-Meteo commercial key
- Email or WhatsApp provider, later

## Out of scope

- Phase 6: the article engine, pillars, briefs, author pages and the editorial calendar. Phase 5 only leaves the `GuideList` slot, the `toolWidget` block and the `stiri` and `piata` sections.
- Real sending of alerts and the newsletter: waits for the provider.
- Online diesel payment.
- Social integration (Phase 7).

## Critical files

- **New:**
  - `src/collections/{BuyPrices,MarketPrices,DieselPrices,NewsItems,Subscriptions,Outbox,Newsletters}.ts`
  - `src/lib/{prices,diesel,weather,news,messaging}/*`
  - `src/app/api/cron/[task]/route.ts`
  - `src/app/(frontend)/[locale]/{preturi,prices,motorina,diesel,meteo,weather,stiri,news,market,baze}/…`
  - `src/components/templates/{PricePage,NetPricePage,DieselPage,ExcisePage,WeatherPage,NewsPage,BasesIndex}.tsx`
  - `design-system/patterns/widgets/*`, `design-system/patterns/LineChart.tsx`
  - `src/blocks` entries `toolWidget`, `todayStrip`, `teaserPair`
  - `scripts/tools/{entry-points,gate}.ts`, `scripts/checks/{budget,tools}.ts`
  - `.github/workflows/lighthouse.yml`
  - `docs/decisions/0008-farmer-tools.md`
- **Changed:**
  - `src/collections/{Leads,Crops,Guides}.ts`
  - `src/payload.config.ts` (jobs)
  - `vercel.json`, `.github/workflows/ci.yml`, `lighthouserc.json`
  - `src/lib/revalidate.ts`
  - `src/components/templates/{BasePage,CropPage}.tsx`
  - `src/components/RenderBlocks.tsx`
  - `scripts/seed/{content,content-en,pages}.ts`
  - `design-system/pages/Home.stories.tsx`
  - `src/i18n/ui.ts`, `.env.example`
- **Reused:**
  - `design-system/patterns/{PriceTile,PriceTable,parts,Hero,SiteHeader,Lazy,Bands,Finance}.tsx`
  - `src/lib/leads/{actions,rate-limit,form}.ts`
  - `src/lib/finance/simulator.ts` (the GET-form tool pattern)
  - `FinanceToolPage` `ToolFrame`
  - `scripts/finance/entry-points.ts` (the pattern)
  - `scripts/checks/lib/site-crawl.ts`

## Verification

- **Each sub-phase:** the definition of done from `CLAUDE.md` (`typecheck`, `lint`, `format:check`, `build`, `test:int`, `test:e2e`, and `check:seo` with 0 errors), plus `check:budget`. **No Lighthouse runs** until 5.8.
- **Integration:**
  - parsers on saved fixtures
  - scăzământ, excise, spraying-window, frost and GDD maths with fixed inputs
  - unique-period upserts
  - alert evaluation writes Outbox rows
  - subscriptions store consent
  - only published buy prices are public
- **e2e, RO and EN:**
  - every new route returns 200
  - the calculators work with JavaScript off
  - the diesel quote creates a `motorina` lead
  - a subscription creates a row
  - the home sections render, with fallbacks when data is empty
  - base and crop pages show their widgets
  - URLs with parameters are noindex
- **Run:** `seed && build && start`, then `check:seo`, `check:aeo`, `check:figures`, `check:products`, `check:finance`, `check:tools` and `check:budget`. Then `review:shoot` with a rubric review of home and widgets. **Then, once in 5.8, Lighthouse on all URLs**, and the Rich Results Test.
