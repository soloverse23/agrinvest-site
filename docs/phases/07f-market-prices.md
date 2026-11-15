# Phase 7f: Prices become market data

Planned and built on 2026-11-15, uncommitted, on branch `redesign/market-prices` (cut from `main` at 0220afd). Waiting for owner review.

## Owner brief

Overhaul the Prices section. Pull Brent crude, fuel, European and world market figures that
matter to farmers from free sources, give them a proper Prices hub and one page per market, and
add TradingView-style charts on the inner pages. Remove Agrinvest's own prices for now and put
market data in their place. Keep SEO and keyword targeting in mind.

## Owner decisions (2026-11-15)

| Question               | Decision                                                                                                                                                                                                                                                             |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Chart                  | TradingView Lightweight Charts, loaded lazily on inner price pages only, never on the home page. The server renders the number, the change, a static SVG line and an HTML history table, which is what search engines read. The TradingView logo stays on the chart. |
| Data                   | Energy, grains and oilseeds, fertilisers, exchange rates. Exchange rates also get a page of their own with their history.                                                                                                                                            |
| Agrinvest's own prices | Hidden everywhere: price pages, widgets, the header ticker, the hero rail, the live panel, the newsletter, price alerts, market-note drafts, the diesel page and the fertiliser price table. The data stays in the admin; one switch brings it back.                 |
| Structure              | `/preturi` is a market dashboard, with one indexable page per market and an English twin for each.                                                                                                                                                                   |

## Sources (checked 2026-11-15)

| Source                                        | What                                                                                                                                    | Cadence                                    | Terms                                                                                 |
| --------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ | ------------------------------------------------------------------------------------- |
| U.S. EIA, through FRED (`DCOILBRENTEU`)       | Brent spot, $/bbl                                                                                                                       | Daily (business days), a few days' lag     | EIA data is public domain; cite EIA and FRED                                          |
| ECB Data Portal (`EXR`)                       | EUR/RON and EUR/USD reference rates                                                                                                     | Daily (TARGET days)                        | Free reuse with the source cited                                                      |
| World Bank, Commodity Price Data (Pink Sheet) | Brent, EU natural gas, wheat (US HRW and SRW), maize, barley, sunflower oil, rapeseed oil, soybeans, urea, DAP, TSP, potassium chloride | Monthly, published early in the next month | CC BY 4.0                                                                             |
| EU Weekly Oil Bulletin                        | Diesel and Euro-super 95 with taxes, Romania and the EU average                                                                         | Weekly                                     | CC BY 4.0 (already used since Phase 5)                                                |
| EU Agri-food data portal                      | Romanian weekly cereal prices                                                                                                           | Weekly                                     | CC BY 4.0. Down again on 2026-11-15 (HTTP 500); the pages show it when it comes back. |

Dropped:

- BNR's XML feed now redirects to its home page, so ECB rates are used instead. The pages say the rate is the ECB's and that BNR publishes its own reference rate.
- Euronext (MATIF) futures and TTF day-ahead need a paid licence, so they are not used.

## Build

1. **Switch.** `src/lib/prices/visibility.ts` exports `showOwnPrices = false`. The buy-price and diesel-price loaders return nothing while it is off. The jobs that read `buy-prices` directly (alerts, newsletter, market note) check it too.
2. **Data.** New market sources `eia-brent`, `ecb` and `world-bank` go in `src/lib/sources.ts` (migration for the select enum). The Oil Bulletin parser also reads petrol and the EU average. Parsers live in `src/lib/markets/`, with unit tests on saved samples. Cron jobs: `fetchBrent` (daily), `fetchEcbRates` (daily) and `fetchWorldBank` (weekly, monthly data). `npm run apply:markets` backfills history in bulk: 5 years of daily data and monthly data from 2010.
3. **Registry.** `src/lib/markets/registry.ts` lists each market (source, series, unit, names) and each page (slugs, markets shown, copy). Pages, the hub, the sitemap, the ticker and the JSON API all read from it.
4. **Chart.** `MarketChart` is a client island loaded through `Lazy.tsx`. It renders the server SVG first. On the first user interaction (scroll, pointer, touch or key), and once the chart is in view, it imports `lightweight-charts` and fetches `/api/markets/{key}`. Range tabs: 1L 3L 6L 1A 5A Max. Colours come from design tokens. First-load JS stays inside the 160 KB budget because the library is never part of it.
5. **Pages.**
   - `/preturi`: groups (Energy, Grains and oilseeds, Fertilisers, Exchange rates). Each tile shows the latest value, the change, a 1-year line and a link.
   - New pages: `/preturi/petrol-brent`, `/preturi/carburanti`, `/preturi/gaze-naturale` and `/preturi/curs-euro-leu`. English twins: `/en/prices/brent-crude-oil`, `/fuel-prices`, `/natural-gas` and `/euro-leu-exchange-rate`.
   - Crop pages `/preturi/{crop}`: the world benchmark chart plus the Romanian weekly EU line when there is data. The Agrinvest table and the price alert are removed. "Vinde" links to `/cereale/{crop}`.
   - `/preturi/ingrasaminte`: world fertiliser charts replace the shop price table, with a link to the shop category.
   - Each page has one H1, a title and description aimed at its keyword, `Dataset` JSON-LD with source and licence, an HTML history table, and a short explanation and FAQ written from the sources.
6. **Everywhere else.** The header ticker and the hero rail show market quotes (Brent, EUR/RON, Romanian diesel, wheat, urea), still server-only. The live panel draws market lines. `/cereale/{crop}` links to the market page.
7. **Checks.** Unit tests for the parsers, the registry and the switch; e2e for the hub, one market page, the exchange-rate page and "no Agrinvest price shown". Run `check:budget` on the new URLs. Lighthouse runs once, at the end.

## Notes

- `listMarketPoints` filters by source, so daily series do not crowd the grain queries.
- World Bank monthly figures are world benchmarks (US Gulf, Black Sea and similar), not Romanian farm-gate prices. Every page says so next to the number.

## Status (2026-11-15)

Built: steps 1 to 7. Checks run against a copy of the local DB (`agrinvest_markets`) built into `.next-markets` and served on :3310:

- typecheck, lint and format are clean.
- `test:int`: 273 of 273 pass, 13 of them new in `tests/int/markets.int.spec.ts`.
- e2e: 103 pass. The 2 failures are the known demo-data ones (product "Offer" and `/ghiduri/grau`).
- `check:budget`: 0 over. The market pages use 151.2 KB of first-load script; the chart library is not part of it.
- `check:seo`: nothing from 7f. The remaining errors are the known demo pages.

Changes from the plan:

- Barley and soybeans were dropped from the World Bank set. The barley series stopped in 2020, and the sheet has no description for soybeans. `/preturi/orz` shows the EU's Romanian prices only.
- The `/preturi/{crop}` sell action is now a link to `/cereale/{crop}` instead of a form. The price alert form was removed, because alerts announce Agrinvest prices.
- `apply:markets` also adds the "Piețe" group to the Prices menu panel and Brent and the euro rate to the footer column. It does this only when the live links are exactly the previous set; a second run changes nothing.
- `NEXT_DIST_DIR` (opt-in) builds next to a running dev server. The build rewrites `tsconfig.json`; restore it with `git checkout tsconfig.json`.

Open:

- Owner review of the shots and copy.
- A deploy rehearsal of the migration and `apply:markets` on old main data, then Lighthouse once at the end.
- The home live panel draws 53-week EU lines with hover points. With the demo EU data the home HTML is 1.4 MB. This was already true whenever no Agrinvest price was published. Consider fewer points.
- `/api/markets/{key}` returns the full history, up to about 60 KB. Downsample it if the series grow.
