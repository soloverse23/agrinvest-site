# 0008 Farmer tools: public sources, stubbed sending, widgets everywhere

- Status: accepted (owner, 2026-11-10); source licences are confirmed in 5.1
- Date: 2026-11-10

## Context

Phase 5 adds grain and input prices, diesel, weather and news (`docs/phases/05-farmer-tools.md`). The site has no email or WhatsApp sender, Agrinvest has not yet supplied its buy prices or diesel price, and the script budget has about 8 KB left. The owner also asked for the tools to appear as widgets across the site and for a lighter home page.

## Decision

- **Agrinvest's own prices come only from the admin** (`BuyPrices`, `DieselPrices`, published rows only). Until a row exists, pages show public market data and "price on request". No Agrinvest price is ever estimated.
- **Public data only from sources that allow reuse**, each named with its date on the page:
  - EU agri-food data portal: cereal and fertiliser prices
  - EU Weekly Oil Bulletin: the national diesel price
  - BRM weekly table
  - Open-Meteo forecasts
  - ANM warnings
  - RSS feeds: headline, source, date and link only

  A source whose terms don't allow this is dropped, never scraped.

- **Open-Meteo's free API is non-commercial.** The weather client takes a configurable base URL and API key, and the site goes live with weather only on a paid key or an approved alternative.
- **Alerts and the newsletter are built, but sending is stubbed.** Every message goes through one `sendMessage` interface into a staff-only `Outbox` with status `stubbed`. Subscriptions stay `pending` until a provider exists, because a confirmation message can't be sent yet. This is the same rule as `notifyLead`.
- **Tools are server-rendered widgets**, with client code only for the location button and inline calculator inputs, each in its own lazy chunk. Charts are server SVG, with no chart library. A `toolWidget` page block lets any block-built page, and later Phase 6 articles, embed a tool.
- **Home page: "Today first".** The full map and figures row are replaced on the home page by small teasers linking to `/baze` and `/despre/cifre`. A guides slot stays hidden until Phase 6 publishes articles.
- **Lighthouse runs once, at the end of the phase** (see 0003, update 2026-11-10).

## Consequences

- Alerts and newsletters reach no one until the owner chooses a provider. The Outbox shows what would have been sent.
- `check:tools` (5.8) must fail on stale series once `SITE_INDEXABLE=true`, because a dated price page with old data misleads.
- Between Lighthouse runs, LCP, CLS and TBT regressions are only caught at the end of the phase. Byte budgets cover the most common cause.
