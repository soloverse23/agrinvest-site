# Phase 6: Article and keyword engine

Branch `phase-6/articles` from `main` (Phase 5 merged in PR #5). Decision: `docs/decisions/0009-article-engine.md`. Staff guide: `docs/guides/articles.md`.

**Goal (roadmap):** a knowledge hub that Google and AI assistants quote. **Owner's brief (2026-11-10):** keep it simple, build the pages, flows and jobs needed to rank for our keywords, a modern desktop design, and manual writing and editing of Agrinvest news. Tests at the end.

## What was built (2026-11-10)

### Content model

- `Guides` (admin group **Conținut / Content**, renamed "Articole și ghiduri"):
  - new section `ghid` (farmer guide) next to `stiri` (Agrinvest news), `piata`, `finantare`, `pagina-finantare`;
  - `pillar` (required for guides), `publishedAt`, `cover`, `tools` (up to two `toolWidget` blocks), `shopProducts`;
  - a staff-only `brief` group: status, intent, keywords (per language), SERP notes, outline, required links, FAQ ideas, expert, planned date, refresh date;
  - the `key` fills itself from the section and slug, so editors never see it;
  - finance-only fields (glossary terms, IFN review) are hidden on other sections;
  - publishing a guide or news piece pings IndexNow (once the site is indexable).
- `People`: a `slug` for author pages. Migration `20261110_153625_phase6_articles` backfills slugs for existing people and `publishedAt` for existing guides.
- Pillars in code: `src/lib/articles/pillars.ts` (grâu, porumb, floarea-soarelui, rapiță, orz, vânzare, depozitare, fertilizare, protecția plantelor, subvenții APIA; financing stays at `/finantare/ghiduri`). Each has its money links (crop page, price page, shop hub, tools).

### Pages (RO and EN)

| Page           | RO                         | EN                           | JSON-LD                           |
| -------------- | -------------------------- | ---------------------------- | --------------------------------- |
| Knowledge hub  | `/ghiduri`                 | `/en/guides`                 | WebPage, BreadcrumbList, ItemList |
| Pillar         | `/ghiduri/{pillar}`        | `/en/guides/{pillar}`        | WebPage, BreadcrumbList, ItemList |
| Guide          | `/ghiduri/{pillar}/{slug}` | `/en/guides/{pillar}/{slug}` | Article (Person author), FAQPage  |
| Agrinvest news | `/stiri/{slug}`            | `/en/news/{slug}`            | NewsArticle, BreadcrumbList       |
| Author         | `/autori/{slug}`           | `/en/authors/{slug}`         | WebPage, Person                   |

- A pillar page exists only with a published guide in that language; an author page is indexed only in a language with a published text.
- **Design** (`design-system/patterns/Articles.tsx`, stories in `Articles.stories.tsx`): `ArticleCard` (feature, default, compact; a lead story without a photo becomes a text card), `ArticleByline` (author, reviewer, dates, reading time), `AuthorCard`, `PillarCard`, `NextSteps`. Desktop article layout: contents on the left, text in the middle, tools and next steps in a sticky right rail; FAQ, related guides and a contact band below.
- **`/stiri` redesigned:** Agrinvest's own news first (lead story and a card grid), then the farm-press feed as a dated list beside a sticky rail with the market notes and the newsletter.
- **Home:** the Phase 5 guides slot (`src/components/HomeArticles.tsx`) after the "Azi" row: the latest news piece as lead and the newest guides. Hidden while nothing is published.
- **Navigation:** a "Ghiduri / Guides" menu panel after Prices and a footer column, added by `apply:articles`.
- `sitemaps/articles.xml`: hub, live pillars, guides, news pieces, authors.

### Flows and jobs

- `npm run apply:articles` (runs on every deploy after `apply:tools`): menu and footer entries, and the 20 briefs as draft guides, once. Idempotent; staff edits are never overwritten.
- `editorialDigest` job, Mondays 09:00 (`vercel.json`): guides due for refresh and briefs behind the calendar, to the Outbox.
- `npm run check:articles` (against `npm start`): the internal-link check of the roadmap exit, plus the keyword-map guide targets still to write.
- `check:seo` knows the JSON-LD types of the new pages.

### The 20 briefs (`scripts/articles/briefs.ts`)

The ten `/ghiduri/*` targets of the keyword map, plus ten that fill the empty pillars (their volumes are still to check in Keyword Planner). Each has a planned date: the first eight between December 2026 and February 2027, the seasonal ones before their season.

**Why no article text was generated:** the facts the first guides need disagree between sources (wheat moisture 13–15 % in public tenders; no official source for a sowing window or seed rate; two "INS" totals for the 2025 wheat harvest). Each brief lists the sources to check. The text must come from Agrinvest's contract terms, the INS tables and the named expert.

## Owner inputs

- Name the expert authors and a reviewer: in **People**, tick "Expert author" and fill role, photo, bio and credentials (RO and EN).
- Agrinvest's reception limits in **Crops → quality** (the moisture and test-weight guides need them).
- An editor's address for `EDITORIAL_EMAIL` (the weekly digest).

## Exit status

- Briefs: written and approved by the owner (2026-11-10, for now); `apply:articles` writes them with status "Brief aprobat".
- First articles live: waiting for the experts.
- Internal links verified by a script: `check:articles` is built and passes.

## Out of scope

- Writing the articles (experts), Keyword Planner volumes for the ten new briefs.
- The monthly ranking report (Phase 10); until then editors mark slipping guides by hand.
- Social cards for articles (Phase 7).
