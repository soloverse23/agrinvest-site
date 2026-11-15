# Phase 7e: hourly news, ranked and published automatically

Status (2026-11-15): **7e.1–7e.5 built** on `final-edits` (all work now happens on that one branch). Decision record: `docs/decisions/0011-news-automation.md`. Waiting for the owner's review and two GitHub secrets (below).

**Goal:** every hour, without anyone touching the admin, the site fetches the latest news that matters to Romanian farmers, groups stories about the same event, ranks them by importance, and publishes the news pages with a reference to every source. Staff can delete or hide anything in one click.

## Owner decisions (2026-11-15)

- **Sources:** free sources that allow reuse, plus **Reuters headlines through a Google News search feed** (headline, source, date and link only). A Reuters licence is not bought now.
- **Publishing is fully autonomous.** No staff approval step. The pipeline must catch its own errors, stay cheap to run, and make deletion easy.
- **No AI.** Ranking is rule-based. The pages are built from templates and the publishers' own headlines and allowed excerpts. No text is written by a model, so decision 0009 ("no generated article text") still holds.

### What the owner accepted with these choices

- **Google News feeds are for personal, non-commercial use** under Google's terms. Using them breaks the rule in decision 0008 for this one source. 0011 records it as an owner exception, limited to headline, source, date and link, and the source can be switched off with one line in `src/lib/sources.ts` if Google or Reuters objects.
- **No AI means no summaries.** Each story shows the publishers' headlines, the excerpt each publisher allows, and the links. "Aggregation" is grouping and ranking, not rewriting.

## Assumptions to correct at review

- **Hourly runs come from GitHub Actions**, not Vercel Cron: Vercel Hobby runs a cron at most once a day. A workflow `news-hourly.yml` calls the existing `/api/cron/ingestNews` route at minute 7 of every hour with `CRON_SECRET`. GitHub may delay scheduled runs by a few minutes; that is acceptable. Upgrading Vercel to Pro would allow a Vercel cron instead, with no code change.
- **Daily edition pages are `noindex, follow` by default.** Pages made only of other publishers' headlines are thin content, and many of them hurt the whole site in Google. `/stiri` itself stays indexed, as today. One setting (`NewsSettings.indexEditions`) turns indexing on if the owner wants to try it.
- **News is kept 90 days.** Older items and editions are deleted by the job, so the database stays small.

## Sources

Every source is one entry in `src/lib/sources.ts` with its terms URL, what we may show (`excerptMax`) and its weight in the ranking. A source not in the registry is never fetched.

| Source                                                                                                 | How                                                                                                        | Shown                       | Status                                 |
| ------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------- | --------------------------- | -------------------------------------- |
| Agrointel                                                                                              | RSS                                                                                                        | headline + 500-char excerpt | kept (0008)                            |
| Revista Ferma                                                                                          | RSS                                                                                                        | headline only               | kept (0008)                            |
| Reuters                                                                                                | Google News RSS, queries such as `site:reuters.com (wheat OR grain OR fertilizer OR Romania OR Black Sea)` | headline only               | owner exception (0011)                 |
| European Commission, agriculture news                                                                  | RSS / press corner                                                                                         | headline + summary          | CC BY 4.0, check endpoint in 7e.1      |
| MADR (Ministry of Agriculture)                                                                         | site news list or RSS                                                                                      | headline + summary          | public authority, check terms in 7e.1  |
| APIA / AFIR                                                                                            | site news list or RSS                                                                                      | headline + summary          | check terms in 7e.1                    |
| FAO, USDA (WASDE, FAS GAIN for Romania)                                                                | RSS                                                                                                        | headline + summary          | public / CC licences, check in 7e.1    |
| Major Romanian outlets: Ziarul Financiar, HotNews, Digi24, Economica.net, Profit.ro, G4Media, Mediafax | RSS, filtered to agriculture by keyword                                                                    | per terms                   | each one checked in 7e.1               |
| Agerpres                                                                                               | paid licence                                                                                               | —                           | out unless the owner licenses it       |
| Agrimedia, Agro TV, BRM                                                                                | —                                                                                                          | —                           | dropped (0008), unless written consent |

7e.1 reads each outlet's terms once, like the 5.1 check, and records the result in 0011. An outlet whose terms forbid reuse is dropped, never scraped. The owner chose Google News for Reuters only; the other outlets are not routed through it.

## Pipeline (one run, every hour)

1. **Fetch** every enabled source in parallel, each with a 10 s timeout. Use conditional requests (`If-None-Match` / `If-Modified-Since`), so an unchanged feed costs one 304 response and no parsing.
2. **Parse** with the existing pure RSS parser, extended for Atom and for the Google News item shape (the real publisher is in `<source url="…">`; the link is Google's redirect URL and stays as given).
3. **Validate** each item before it is stored: https link on the source's allowed host, title 10–300 characters, date not in the future and not older than 7 days, no duplicate URL. Bad items are counted and dropped, never stored.
4. **Filter for agriculture.** General outlets only pass items whose title or allowed excerpt matches the agriculture lexicon (below). Farm outlets pass everything.
5. **Group** items about the same event into a `NewsStory`: normalised title words (lowercase, no diacritics, stop words out), Jaccard similarity of at least 0.5 within 48 hours, plus a shared named entity (number, place, institution). Each story keeps every source as a reference.
6. **Score** each story (below) and store the score with its parts, so staff can see why a story ranks where it does.
7. **Publish:** recompute today's edition, then revalidate the `news` tag only if something changed. A run that finds nothing new writes nothing and revalidates nothing.
8. **Clean up:** delete items and editions older than 90 days (once a day, on the 03:07 run).

## Ranking (rule-based)

`score = topic × relevance × coverage × source × freshness`, each part explained:

- **Topic weight** from a RO/EN lexicon in `src/lib/news/lexicon.ts`: prices and markets (wheat, corn, sunflower, rapeseed, Constanța, export), subsidies and payments (APIA, AFIR, PNS, CAP, advance payment), inputs (fertiliser, diesel, seeds, pesticide bans), weather damage (drought, frost, hail, flood, state of calamity), animal and plant disease (pesta porcină, gripă aviară), trade and policy (Ukraine imports, tariffs, EU–Mercosur), credit and finance for farmers. Each topic has a weight from 1 to 3.
- **Romania relevance:** ×1.5 when the item names Romania, a Romanian county or a Romanian institution; ×1.2 for the Black Sea region or the EU; ×1 otherwise.
- **Coverage:** `1 + log2(number of distinct sources)`. A story told by four outlets ranks above one told by one.
- **Source weight:** official sources and Reuters 1.3, farm press 1.1, general press 1.0.
- **Freshness:** halves every 12 hours.

Staff overrides on a story: **pin** (top of the page until unpinned or 48 hours pass), **hide**, **delete**. The weights live in a `NewsSettings` global, so they can be tuned in the admin without a deploy; the lexicon stays in code, with tests.

## Pages

- **`/stiri` (rolling, indexed):** "Important acum": the top 5 stories, each with its lead headline, the allowed excerpt, its topic, the time, and its numbered references (every source's headline, name and link). Below: the rest of the last 48 hours by topic. Then Agrinvest's own `stiri` pieces and the newsletter sign-up, as today. ItemList JSON-LD keeps working.
- **`/stiri/zi/{yyyy-mm-dd}` (daily edition, noindex by default):** the day's stories in ranked order, built hour by hour and frozen at midnight. Linked from `/stiri` as an archive (last 30 days).
- **`/stiri/subiect/{topic}`:** dropped from this phase. Thin pages; add only if the owner asks.
- **English:** `/en/news` and `/en/news/day/{date}` use the same data. Headlines stay in their original language with `lang="ro"`.
- Every reference link carries `rel="noopener"` and opens the publisher's page. No publisher text is shown beyond what its terms allow.

Design gate: build the story card and the "Important acum" band in Storybook, shoot them at 390 and 1440 px, and show the owner before wiring.

## Data model

- `NewsItems` (exists): add `story` (relation), `topics`, `lang`, `fetchedVia` (`rss` / `google-news`), and the Google News publisher name. Keep `status` (`nou` / `ascuns`).
- `NewsStories` (new): `key`, lead item, items, topics, score, score parts (JSON), `firstSeen`, `lastSeen`, `pinnedUntil`, `status` (`visible` / `hidden`).
- `NewsEditions` (new): `date`, ordered story ids, `frozen`, `updatedAt`. One row a day.
- `NewsRuns` (new, staff-only): start, end, per-source result (status code, items new / unchanged / rejected, error), and the total. Kept 30 days.
- `NewsSettings` (global): weights, `indexEditions`, enabled sources.
- `NewsSources` state lives in `NewsRuns` (last ETag, last success, failures in a row), not in a new collection.

Run `generate:types`, `generate:importmap` and `migrate:create` after the change. The migration is additive. Rehearse it on a copy of the live data before merging (the deploy rehearsal rule).

## Errors and safety

- **One bad source never stops the run.** Each source fails alone and is recorded in `NewsRuns`.
- **Circuit breaker:** after 6 failed runs in a row a source is skipped for 6 hours, then tried once.
- **Alert:** if no source has succeeded for 3 hours, or a source has failed for 24 hours, the job writes one message to the Outbox (`template: 'news-health'`, deduplicated per day), the same channel as every other site message.
- **Overlap guard:** a run that starts while another is still running exits at once (a lock row with a 10-minute expiry).
- **Bounded work:** at most 50 new items per source per run, and the route keeps its 60 s limit.
- **Never empty:** if a run fails completely, the pages keep the last good data, which already happens through the cache.
- **Bad publish undo:** staff hide or delete a story or item in the admin; the hook revalidates `news` at once.

## Easy delete

- Admin list views for stories and items with bulk **Hide** and **Delete**.
- A **"Delete this story"** button on the story's admin page, which also deletes its items and adds their URLs to a blocklist, so the next run does not fetch them back.
- A **"Remove day"** action on an edition.
- Deleted edition URLs answer 410 Gone, so Google drops them quickly.

## Efficiency

- Conditional GETs and skipping unchanged feeds keep a quiet hour to a few hundred milliseconds.
- One database transaction per run for writes; revalidation only on change.
- No new dependency: the parser, grouping and scoring are small pure modules with tests.
- Nothing runs in the visitor's browser: the pages are server-rendered and the script budget is untouched.

## Sub-phases

### 7e.1 Sources and decision

- Write decision 0011 (owner choices, the Google News exception, the hourly runner).
- Check each candidate source once: endpoint, format, terms. Save one fixture per source in `tests/fixtures/feeds/`. Record the results table in 0011.
- Add the kept sources to `src/lib/sources.ts`.

### 7e.2 Parse, group and rank

- Extend the parser (Atom, Google News). Add `lexicon.ts`, `group.ts`, `score.ts` as pure modules.
- Unit tests on the fixtures, including: the same event from three outlets becomes one story; an off-topic Digi24 item is filtered out; a future date and a foreign host are rejected.

### 7e.3 Model, job and hourly runner

- Collections, global and migration. Rewrite `ingestNews` as the pipeline above, with `NewsRuns`, the lock, the breaker and the Outbox alert.
- Add `.github/workflows/news-hourly.yml`. Keep the daily Vercel cron as a backup.
- Integration tests: a rerun adds nothing; a failing source is recorded and the others still publish.

### 7e.4 Pages and admin

- Design gate (shots to the owner), then `/stiri`, `/stiri/zi/{date}`, the English pages, and the admin actions for deletion.
- e2e: the ranked band shows, every story has at least one reference link, deleting a story removes it from the page.

### 7e.5 Gate

- `check:news` (pattern of `check:tools`): every visible story has a reference; no shown excerpt is longer than its source allows; no source outside the registry; the last successful run is under 2 hours old (only when `SITE_INDEXABLE=true`).
- `typecheck`, `lint`, `format:check`, `build`, `test:int`, `test:e2e`, `check:seo`, `check:budget`.

## Owner inputs

- `CRON_SECRET` and the site URL as GitHub Actions secrets (`CRON_SECRET`, `SITE_URL`).
- Optional: written permission from Agrimedia, Agro TV or BRM; a Reuters or Agerpres licence later.
- Optional: the topic weights, if the default order is wrong for Agrinvest.

## Progress (2026-11-15)

**Built:**

- **7e.1 Sources.** Decision 0011 with the full source check. Kept: Agrointel, Revista Ferma, Reuters (Google News, owner exception), Ziarul Financiar, Mediafax, G4Media, Profit.ro, MADR, the Commission's DG AGRI newsroom. Dropped on their terms: HotNews, Digi24, Economica.net, FAO; USDA answers 403; APIA and AFIR have no feed. Fixtures: `tests/fixtures/feeds/news-*.xml`. Registry: `src/lib/sources.ts` (kind, filter, link hosts, language, excerpt limit).
- **7e.2 Parse, group, rank.** `src/lib/news/rss.ts` (Google News items, zero-width characters, subdomain hosts, `validate`), `lexicon.ts` (8 topics, whole-word stems such as `afir$`, Romania and region relevance, an exclusion list for quote pages), `group.ts`, `score.ts`. Generic farming weighs 0.5 and the freshness half-life is 24 hours, so a real topic (prices, subsidies, weather…) leads.
- **7e.3 Model and job.** Collections `news-stories`, `news-editions`, `news-runs`, `news-blocked`; global `news-settings`; `news-items` gains `topics` and `lang`. Migration `20261115_113857_news_automation` (additive). `ingestNews` is now `src/lib/news/pipeline.ts`: lock, conditional GET, 10 s timeout, breaker, validation, 50 per source, regroup of the last 7 days, today's edition, yesterday frozen, 03:00 clean-up, Outbox alert (`news-health`). `.github/workflows/news-hourly.yml` calls the cron route at minute 7.
- **7e.4 Pages.** `src/components/templates/NewsPages.tsx`: `/stiri` and `/en/news` ("Important acum", Agrinvest's own news, the last 48 hours by topic, archive by day, market notes, newsletter), `/stiri/zi/{date}` and `/en/news/day/{date}`. Design-system pattern `NewsStories.tsx` (`TopicChip`, `StoryLead`, `StoryRow`, `ImportantNow`) with stories. **Home "În direct din câmp":** the right column is now the ranked "Important acum" list (the lead with its excerpt, every story with numbered sources), then "De la Agrinvest" for the site's own updates.
- **Deleting:** deleting a story (one or many, from the admin list) deletes its headlines, blocks their links and drops it from the editions; deleting one headline blocks it and leaves its story; hiding a story drops it from the editions at once.
- **7e.5 Gate.** `npm run check:news` (in CI): registered sources and hosts, excerpts within each publisher's limit, every visible story cites a headline, the last run under 2 hours old (an error once the site is indexable).

**Verified:** typecheck, lint (0 errors), format, build, `test:int` 298/298 (20 new in `tests/int/news.int.spec.ts`), `check:news` 0 errors. Live runs on the local database: 9 sources, about 2–4 s a run; a quiet hour answers 304 from most feeds and writes nothing. The cron route answers 401 without the secret.

**Changed from the plan:**

- Deleted edition days answer 404 (the day is `removed` and never rebuilt), not 410.
- `/stiri/subiect/{topic}` was not built (thin pages), as planned.
- MADR sends an incomplete certificate chain. Its public intermediate is pinned in `src/lib/news/certs.ts` for that source only (expires 2035); TLS checks stay on.

**Known limits:** grouping uses the headlines' words, so two outlets that word the same event very differently ("Peste 53.900 de fermieri…" and "Aproape 54.000 de fermieri…") stay two stories. English and Romanian headlines are never grouped. The general outlets usually contribute little: most of their items are not about farming and are refused.

**Owner inputs:**

- GitHub repository secrets `NEWS_SITE_URL` (the production URL) and `CRON_SECRET` (the same value as in Vercel). Until both exist the hourly workflow skips with a notice; the daily Vercel cron still runs.
- Optional: `EDITORIAL_EMAIL` for the `news-health` alert; topic weights in `News settings`.

### Later the same day (owner review)

- **Simpler news design:** headline, then the source in bold, the time and "+N surse"; no rank numbers or topic chips; topics only as section headings on `/stiri`. Guides hub: topics as one row of links, newest guides first.
- **"În direct din câmp" is news only:** no prices (the hero shows them). One row of five cards, then Agrinvest's own updates; phones swipe each row sideways.
- **Thumbnails:** publishers' feed photos where present (owner exception), else Agrinvest's topic photos (decision 0011, update "thumbnails"). New column `news_items.image` (migration `20261115_160912_news_images`); `check:news` also checks photo hosts.
- **Phones no longer scroll sideways:** the top price strip's `sr-only` text escaped its scroller (now `relative`); market tiles wrap.
