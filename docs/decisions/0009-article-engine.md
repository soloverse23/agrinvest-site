# 0009 Article engine: one Guides model, briefs in the admin, experts write the text

- Status: accepted (owner, 2026-11-10, for now)
- Date: 2026-11-10

## Context

Phase 6 adds the knowledge hub (pillars, guide clusters from the keyword map, expert authors, an editorial calendar and refresh rules) and asks for Agrinvest news that staff write and edit by hand. Phase 5 left the hooks: `Guides` sections `stiri` and `piata`, the `toolWidget` block and the home guides slot. The owner asked for a simple build, without over-engineering.

Before writing articles, the key facts of the first briefs were checked against public sources (2026-11-10). They do not agree: public tenders use 13–15 % moisture and different hectolitre minimums for wheat, no official source states a sowing window or seed rate that could be quoted, and two news reports give different "INS" totals for the 2025 wheat harvest (7.7 and 11.6 million t).

## Decision

- **One content model.** Farmer guides are `Guides` with `section: 'ghid'` and a `pillar`; Agrinvest news is `section: 'stiri'`. No new collection: authors, reviewers, sources, FAQ, SEO and drafts are shared with the finance guides and the market note.
- **URLs:** guides at `/ghiduri/{pillar}/{slug}` and `/en/guides/{pillar}/{slug}`, as the keyword map plans; pillars at `/ghiduri/{pillar}`; the hub at `/ghiduri`; news at `/stiri/{slug}` and `/en/news/{slug}`; authors at `/autori/{slug}` and `/en/authors/{slug}` (`People` gets a `slug`).
- **Pillars are code, not content** (`src/lib/articles/pillars.ts`): ten pillars with their slugs, intro and money links. Financing is the eleventh and stays at `/finantare/ghiduri`. A pillar page exists only once it has a published guide in that language, so no empty page is served.
- **The brief lives on the guide**, in a staff-only `brief` group: status, intent, primary and secondary keywords, SERP notes, outline, required links, FAQ ideas, expert, planned date (the editorial calendar) and a refresh date.
- **Briefs become drafts with no text.** `apply:articles` writes the 20 briefs once as draft guides without summary or body. Both fields are required, so a brief cannot be published until it is written. No article text is generated: the facts above must come from Agrinvest's own contract terms (`Crops.quality`), the INS tables and the named expert, and each published guide lists its sources.
- **Tools inside articles:** a `tools` field (up to two `toolWidget` blocks) shows a price, net-price or diesel widget beside the text.
- **Refresh rules run as a weekly job** (`editorialDigest`, Mondays). It lists published guides not updated for a year, past their refresh date, or marked "needs a refresh" by an editor (after a ranking drop in the monthly report, Phase 10), plus briefs past their planned date. The digest goes to the Outbox (decision 0008): nothing is sent until there is a provider. `EDITORIAL_EMAIL` names the editor.
- **Internal links are verified by `check:articles`** against the running site: every link in a guide or news piece answers 200, every guide links to its pillar and to a money page, every pillar lists its guides and the hub lists every live pillar.
- **English parity (0005) applies when a text is published:** a guide or news piece without an English version has no English page and no hreflang pair.

## Consequences

- The knowledge hub shows only finance guides until the first farmer guide is written and published. The Phase 6 exit ("first articles live") depends on the experts.
- Agrinvest needs to name its expert authors (`People` with "Expert author" ticked, bio and credentials) and one reviewer.
- Reception limits in guides must match the published `Crops.quality` limits; until Agrinvest enters them, guides about moisture and test weight explain the method and link the calculator without quoting a limit.
