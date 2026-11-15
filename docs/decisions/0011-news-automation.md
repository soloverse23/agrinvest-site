# 0011: Hourly news, ranked by rules and published without a staff step

Status: accepted (owner, 2026-11-15). Phase: 7e (`docs/phases/07e-news-automation.md`).

## Context

The owner asked for a news section that updates itself every hour: the news that matters to Romanian farmers from Reuters and the major Romanian outlets, ranked by importance, with references, and published with no one touching the admin. Decision 0008 already allows headlines from licence-checked feeds. Decision 0009 says no article text is generated.

## Decision

- **No AI.** Stories are grouped and ranked by rules (`src/lib/news/lexicon.ts`, `group.ts`, `score.ts`). Pages show only the publishers' headlines, the excerpt each publisher allows and the links. Decision 0009 still holds.
- **Fully autonomous.** Every run publishes; there is no approval step. Staff can hide or delete a story or headline; a deleted headline's link is blocked, so the next run does not fetch it again.
- **Hourly runs from GitHub Actions** (`.github/workflows/news-hourly.yml`, minute 7 of every hour) calling `/api/cron/ingestNews` with `CRON_SECRET`. Vercel Hobby only runs crons once a day; its daily `ingestNews` cron stays as a backup.
- **Reuters through a Google News search feed: owner exception to 0008.** Google's feeds are for personal, non-commercial use. The owner accepted this for Reuters only: headline, source, date and the Google link, no excerpt. It is one entry in `src/lib/sources.ts` and can be switched off in the admin (`News settings → Disabled sources`).
- **Daily edition pages are `noindex, follow` by default.** A page of other publishers' headlines is thin content. `/stiri` stays indexable as before. `News settings → Index daily editions` turns them on.
- **News is kept 90 days**, run logs 30 days.

## Source check (2026-11-15)

Each feed was fetched once and its terms read. Fixtures are in `tests/fixtures/feeds/news-*.xml`.

| Source                                | Feed                                                                                                                        | Terms                                                                                   | Decision                                                  |
| ------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| Agrointel                             | `agrointel.ro/feed`                                                                                                         | quotes up to 500 characters with a followed link (0008)                                 | **Kept**, excerpt 500, farm press                         |
| Revista Ferma                         | `revista-ferma.ro/feed/`                                                                                                    | silent on reuse (0008)                                                                  | **Kept**, headline only, farm press                       |
| Reuters (via Google News)             | `news.google.com/rss/search?q=site:reuters.com+(wheat OR corn OR grain OR fertilizer OR farmers OR "Black Sea" OR Romania)` | Google: personal, non-commercial use                                                    | **Owner exception**, headline only, filtered by topic     |
| Ziarul Financiar                      | `zf.ro/rss`                                                                                                                 | "Termeni și condiții" §g: free reuse up to 250 characters, the source named with a link | **Kept**, excerpt 250, filtered by topic                  |
| Mediafax                              | `mediafax.ro/rss`                                                                                                           | footer: quotes up to 250 characters; no full reproduction                               | **Kept**, excerpt 250, filtered                           |
| G4Media                               | `g4media.ro/feed`                                                                                                           | footer: quotes up to 250 characters; no full reproduction                               | **Kept**, excerpt 250, filtered                           |
| Profit.ro                             | `profit.ro/rss`                                                                                                             | no terms page found (silent)                                                            | **Kept**, headline only, filtered                         |
| MADR                                  | `madr.ro/comunicare.feed?type=rss`                                                                                          | public authority press releases                                                         | **Kept**, excerpt 300, official                           |
| European Commission, DG AGRI newsroom | `ec.europa.eu/newsroom/agri/feed?lang=en&orderby=item_date`                                                                 | CC BY 4.0 (Decision 2011/833/EU)                                                        | **Kept**, excerpt 300, official, filtered (mostly events) |
| HotNews                               | `hotnews.ro/feed`                                                                                                           | §3.3: users may not take the site's content                                             | **Dropped**                                               |
| Digi24                                | `digi24.ro/rss`                                                                                                             | §5.2: no republishing, no use that earns ad revenue                                     | **Dropped**                                               |
| Economica.net                         | `economica.net/rss`                                                                                                         | personal, non-commercial use only; links need written consent                           | **Dropped**                                               |
| FAO newsroom                          | `fao.org/feeds/fao-newsroom-rss`                                                                                            | commercial use needs FAO's permission                                                   | **Dropped**                                               |
| USDA                                  | `usda.gov/rss/*`                                                                                                            | HTTP 403 to automated clients                                                           | **Dropped**                                               |
| APIA, AFIR                            | no feed (`/feed` answers 404 or 500)                                                                                        | —                                                                                       | **Not used**; no HTML scraping                            |
| Agerpres                              | paid licence                                                                                                                | —                                                                                       | Out unless licensed                                       |
| Agrimedia, Agro TV, BRM               | —                                                                                                                           | forbid reuse (0008)                                                                     | Still dropped                                             |

"Filtered" means general outlets and the Reuters search pass only items that match the agriculture lexicon.

## Consequences

- If Google or Reuters objects, Reuters is switched off in the admin; nothing else changes.
- Stories in English (Reuters, EC) and Romanian are ranked side by side but grouped only within one language.
- A source whose terms change is removed from `src/lib/sources.ts`, and its stored items with it.
