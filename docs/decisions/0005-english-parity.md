# 0005 English site: the same pages as the Romanian site

- Status: accepted (owner, 2026-11-03)
- Date: 2026-11-04

## Context

The Phase 2 plan made the English site "business-led, not a mirror": a smaller set of pages for buyers and partners (`/en/export/{crop}`, `/en/market`…), with hreflang pairs only where a Romanian page had a true equivalent. After 2.2 the owner saw a full Romanian site next to a thin English one and asked for both languages to be the same.

## Decision

- **Every Romanian page has an English equivalent** with the same blocks, the same FAQ structure and the same register facts, written in English for farmers, grain buyers and partners, not machine-translated. Every pair is an hreflang pair.
- **URLs:** `/en/about`, `/en/about/figures`, `/en/grain` and `/en/grain/{wheat,corn,sunflower,rapeseed,barley}`, `/en/storage`, `/en/storage/drying`, `/en/bases/{slug}` (the base slug is shared), `/en/financing`, `/en/golden-relationship`, `/en/logistics`, `/en/partners`, `/en/careers`, `/en/contact`, `/en/privacy`. The keyword map's `/en/export/{crop}` targets now point to `/en/grain/{crop}`.
- **Collection routes** (bases, crops) have one route folder per language prefix (`baze`/`bases`, `cereale`/`grain`), each a thin wrapper around a shared template (`src/components/templates/`); the prefixes live in `src/i18n/routes.ts`.
- **Per-language content model:** page layouts and every FAQ list are localized as a whole, so saving one language never replaces the other's rows (the shared-rows model had let the English crop FAQ overwrite the Romanian one).
- `/en/market` (prices and harvest data) waits for Phase 5, when the Romanian price pages exist too.

## Consequences

- Twice the copy to keep current: a page change is done in both languages, and the owner reviews both.
- `check:seo` covers 70 pages (both languages); `check:aeo` asks questions in both.
