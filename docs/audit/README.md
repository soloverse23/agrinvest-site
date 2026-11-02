# Phase 0 audit

Snapshot of 2026-11-02. Regenerate the CSVs with the `npm run audit:*` scripts (see the table below).

## Files

| File                    | What it is                                                                                                                                                            | Made by                   |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------- |
| `content-inventory.csv` | Every URL in the sitemaps of agrinvest.ro and agrinvestshop.ro (167): status, type, title, meta description, H1, canonical, lang, hreflang, JSON-LD types, word count | `npm run audit:crawl`     |
| `products-raw.json`     | All 77 shop products as returned by the WooCommerce Store API (source for the Phase 3 pilot import)                                                                   | `npm run audit:products`  |
| `products-summary.csv`  | One row per product: price, stock, SKU, attributes, and which agronomic data is present                                                                               | `npm run audit:products`  |
| `redirect-map.csv`      | Every old URL → new URL (301) or retired (410); **draft, to review**                                                                                                  | `npm run audit:redirects` |
| `keyword-map.csv`       | 103 keywords from the 12-month plan → target URL in the new structure; Keyword Planner volume column still empty                                                      | `npm run audit:keywords`  |
| `serp-notes.md`         | What ranks for the top 40 keywords, and the page needed to win                                                                                                        | research                  |
| `figures-register.md`   | Every company fact and number, with source and status; **to confirm**                                                                                                 | research                  |
| `ifn.md`                | Agrinvest Credit IFN research and questions                                                                                                                           | research                  |
| `social-inventory.md`   | Social channels and the 11 YouTube videos                                                                                                                             | research + yt-dlp         |
| `agrinvest-inputs.md`   | What we need from Agrinvest, in RO and EN, ready to send                                                                                                              | —                         |

Raw data that stays out of git: `data/raw/` (product images, full crawl JSON, YouTube metadata).

## Key findings

**Old sites**

- **agrinvest.ro (56 URLs):**
  - `lang="en-US"` on every Romanian page; 47 pages have no H1.
  - Meta descriptions just repeat the page name.
  - 6 lorem-ipsum posts plus their category are indexed, and the contact page shows a lorem-ipsum FAQ.
  - 30 product pages duplicate the shop, and 15 of those products are not in the shop at all.
- **agrinvestshop.ro (111 URLs):** 77 products, 17 theme demo pages (9 portfolio, 8 blog).

**Products**

- 77 products, 59 in stock.
- **0 SKUs, 0 technical-sheet PDFs, 0 images with alt text.**
- Only 15 products have attributes. Dose information is in the free text of 69 products, and 38 have an HTML table in the description.
- Structured agronomic data has to be built in Phase 3.

**Redirect map:** 178 URLs: 151 → 301, 27 → 410. 15 rows marked REVIEW, all of them old agrinvest.ro product pages with no shop product.

**Figures:** two conflicts to resolve with management:

- The silo bases add up to 252,000 while the stated total is 238,000.
- "22 counties" versus the 11 counties with collection points.

**SERPs:**

- No competitor publishes a buy price per base, storage tariffs, a moisture-deduction calculator, or rich English export pages. These are the quickest wins.
- The brand name collides with Agrinvest Commodities (Brazil, Marex) in English.

**Social:** the best footage is the 2022 brand film and the Golden Relationship series. Channel reach is low, so the site has to build the audience.

## Exit gate (owner review)

- [ ] `keyword-map.csv` (target URLs)
- [ ] `redirect-map.csv` (especially the 15 REVIEW rows)
- [ ] `figures-register.md` (sent to Agrinvest for confirmation)
- [ ] Keyword Planner volumes added (needs Google Ads access)
