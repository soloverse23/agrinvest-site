# Phase 7g: the finance section as a guide

Status (2026-11-15): **built, all sub-phases (7g.1–7g.7), not committed.** Planned with the owner the same day; the owner then asked Claude to run every step without the 7g.1 design gate. Branch `redesign/finance` in the worktree `../site-finance` (database `agrinvest_finance`, dev server on port 3400). Decision record: `docs/decisions/0012-finance-guide.md`.

## Built: what differs from the plan below

- **No new lead type.** The drawer stores a `finantare` lead (name, phone, email, consent) through `submitLead`; `src/lib/finance/consultant.ts` puts the need, the credit page and the note in the message.
- **The drawer loads on the first click.** `ConsultantLauncher` (in `Lazy.tsx`) only listens for `[data-consultant]` clicks and `#consultant`; the dialog's code is fetched then. Finance pages went from 153 to 149.3 KB of script.
- **No drawer on `/finantare/aplica`.** That page is the request form itself and sat at its budget (159.9 KB now). Its "Sună-mă" callout, the menu and the footer link to `/finantare#consultant`, which opens the drawer on the hub.
- **The questions filter is an inline script** (`QuestionSearch`), not a React island: as an island it fell into a shared chunk on every finance page.
- **The hub's sections are code** (`FinanceHubPage`, `src/lib/finance/needs.ts`); `hub.json` keeps the title, summary and SEO, and the apply step empties the page's old blocks and FAQ.
- **The finder hands over to the simulator** (`/finantare/simulator?nevoie=…`), which names the credit above the schedule; the hub stays static.
- **Product FAQs became 51 question pages** (`data/finance/questions`, RO and EN); the `faq` field left `finance-products` (migration `20261115_100616_finance_questions`). The old FAQ page is unpublished by `apply:finance` and its URLs answer 308 to `/finantare/intrebari`.
- **`check:finance`** adds: every credit has a question; a question has at least 40 words; questions are checked for near-duplicates like the guides.

Checks on 2026-11-15: typecheck, lint (0 errors), format, `test:int` 265/265, `test:e2e` 110/110 on a fresh seed plus `seed:ci`, `check:finance` 0 errors, `check:seo` 0 errors on 550 pages, `check:budget` 31/31 within budget. Not done: Lighthouse, owner review of the shots.

**Known, not from this phase:** on phones every page is 715 px wide while the header price strip has prices (its items escape the scroll box); see 7d's mess list, row 1.

## Why

The owner's review (2026-11-15): the IFN section is messy and confusing. Credit terms differ from farmer to farmer, so the pages should not try to cover every detail on its own page. They should:

- catch as many search queries and AI-assistant questions as possible, whatever their volume;
- guide a farmer to the right credit precisely and hand them to a consultant (a lead);
- keep a library for the detail, without getting in the way of the guide.

The design must be the best version we can make, not a restyle.

## What is wrong today (audit, 1366 and 390 px, 2026-11-15)

| #   | Page    | Problem                                                                                                                                                                                                                 |
| --- | ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Hub     | It opens with a wall of text (who the IFN is, "Ce ne face diferiți", legal forms) before the first choice.                                                                                                              |
| 2   | Hub     | The products are listed twice: grouped cards, then the "Cum alegi" table with the same 12 links.                                                                                                                        |
| 3   | Hub     | Four calls to action (inline links, a dark pay band, "Vrei să te sunăm?", links after the table).                                                                                                                       |
| 4   | Hub     | A BNR register table with a "Sursă" column sits in the middle of the sales path.                                                                                                                                        |
| 5   | All     | "de confirmat" chips on facts the visitor doesn't need at that point.                                                                                                                                                   |
| 6   | Product | It reads like a wiki: 9 headed sections, a sidebar with 3 link lists, sources, FAQ, then a CTA band. Nothing at the top says "this fits you, here is the next step".                                                    |
| 7   | Product | The only action is a 19-field application, or the simulator, which leads to the same form.                                                                                                                              |
| 8   | Product | The "Documente" section only says there is no list. It is an empty section.                                                                                                                                             |
| 9   | Section | Six equal chips (`FinanceNav`): credits, simulator, application, guides, about, FAQ. The application is a destination instead of an action.                                                                             |
| 10  | Section | The questions people actually ask ("Pot lua credit ca PFA?", "Credit agricol fără garanții?", "Ce dobândă are un IFN?") are hidden in product FAQ accordions (about 110) and inside long guides. None has its own page. |
| 11  | Phone   | Hub 9,700 px, product page 8,600 px; the first choice appears after two screens of text.                                                                                                                                |

## Owner decisions (2026-11-15)

1. **Hub: need tiles + a finder.** Need tiles first. A short "Nu ești sigur?" finder below them for farmers who can't choose.
2. **Main action: the consultant drawer.** "Vorbește cu un consultant" opens a short drawer on every finance page. The full application stays, but only as an optional second step after the drawer is sent.
3. **Questions: one page per question.** `/finantare/intrebari/{slug}` and `/en/financing/questions/{slug}`, each a short, useful page on its own.
4. **Credit pages work like shop product pages.** The credit page follows the 7c product page: a summary with key specs, a "buy box" whose action is the consultant, and the details below. The section should rest less on long credit pages; the reach comes from the questions.

## The shape: three layers

```
GUIDE (converts)            ANSWERS (search + AI)              LIBRARY (detail)
/finantare                  /finantare/intrebari                /finantare/ghiduri  (renamed "Bibliotecă")
  need tiles + finder         index by topic                      11 guides, glossary
/finantare/{credit}           /finantare/intrebari/{slug}         despre IFN + register data
  shop-style credit page        direct answer                     sources, how we write
/finantare/simulator            what decides it for you
                                matching credit + consultant
        └──────────── every page: one action, "Vorbește cu un consultant" (drawer) ────────────┘
```

**Section links** (`FinanceNav`, from six chips to four): Credite · Întrebări · Simulator · Bibliotecă. The application is not a link any more; it is the action. "Despre IFN", the guides, the glossary and the old FAQ page are in the library.

### URLs

- No change for the hub, the credit pages, the simulator, `/finantare/aplica`, the guides and `despre-ifn`.
- New: `/finantare/intrebari` (index) and `/finantare/intrebari/{slug}`; EN `/financing/questions/...`.
- `/finantare/intrebari-frecvente` → 301 to `/finantare/intrebari` (its 10 questions become question pages). Add the row to `redirect-map.csv`.
- The site is still noindex, so the redirect costs nothing.

## Page by page

### Consultant drawer (every finance page)

- One button, "Vorbește cu un consultant", in the title band, at the end of the page and in a bottom bar on phones.
- The drawer fields are name, phone, email and "Pentru ce?" (the need, filled in from the page), plus consent. Phone and email are both required (the leads rule; this is not the shop's one-field `quick` lead). Lead type `finance-callback`, stored like the other leads. `notifyLead` stays a no-op.
- After sending: "Te sună un consultant" plus the reply time from the figures register, and an optional link, "Vrei să grăbești analiza? Completează detaliile", to `/finantare/aplica?cerere={id}` with the known fields already filled.
- Loads lazily (`Lazy.tsx`). The button is a link to `#consultant` that works without JavaScript and falls back to `/finantare/aplica`.
- Every drawer and band says, in one line, that terms are set per farm after the analysis. No rate, no eligibility promise.

### Hub `/finantare`

1. **Title band:** H1, one line ("Credit pentru fermieri, cu rate după recoltă"), four key facts as chips (reply 24 h, up to 10 years, max 2 instalments a year after harvest, 500+ farmers), the consultant button.
2. **"De ce ai nevoie?"** Eight need tiles with an icon, a label and one line: Campanie (inputs, works) · Utilaje · Irigații · Depozitare · Teren · Bani până la APIA · Stocuri / contract de vânzare · Datorii greu de plătit. A row of small links under them: industrie alimentară, ferme zootehnice, inputuri cu plata la recoltă. Each tile goes to one credit page. The products are listed once.
3. **"Nu ești sigur? Află în 3 întrebări."** A finder: for what, roughly how much, when you sell (summer / autumn / both / not grain). Result card: the matching credit, how the instalments would fall (from the simulator logic, labelled as an example), and the consultant button with the need filled in. It works with JavaScript off, as a plain GET form that renders the result on the server.
4. **"Cum funcționează"**: three steps (talk to a consultant → analysis of the farm → contract and money), one line each.
5. **Popular questions**: six question links into the Answers layer, plus "Toate întrebările".
6. **Library teaser**: three guides and "Bibliotecă".
7. One closing action band.

Removed from the hub: the long intro, the "Cum alegi" table (the finder replaces it), the register table (moves to the library), the second form.

### Credit page `/finantare/{credit}` (shop-style)

Built from the 7c product-page parts (`BuyBox`, `keyFacts`, `SpecGroups`, `QuickRequest` pattern), restyled for credit.

- **Top, two columns on desktop, stacked on phones:**
  - left: H1, the answer (2–3 sentences), a "Se potrivește dacă…" / "Nu se potrivește dacă…" pair of short lists;
  - right, sticky: the **credit box**: 4–5 spec rows (for what, term, repayment, typical guarantees, who can apply), the consultant button, "Vezi cum ar cădea ratele" (simulator with the product preselected), and one line saying terms are set per farm.
- **Below:** a sticky tab bar with plain anchors: Exemplu · Cum decurge · Garanții · Întrebări · Detalii.
  - Exemplu: the worked example card.
  - Cum decurge: the steps.
  - Garanții: the guarantee table.
  - Întrebări: 5–8 question links (to question pages, so the answers are not written twice), then "Toate întrebările despre {credit}".
  - Detalii: a closed `<details>` holding "Ce finanțează", "Cum se rambursează", risks and sources. The text stays in the HTML.
- For a parent credit (credit-investitii), the sub-credits appear as shop-style cards ("Alege ce finanțezi") straight after the top.
- Removed: the empty "Documente" section, the three sidebar link lists, the duplicate closing CTA (one band remains).
- Related credits: one row of small cards ("Fermierii care iau acest credit întreabă și de…").

### Question page `/finantare/intrebari/{slug}`

The page that catches search and AI questions. Structure, all short:

1. H1 = the question as people type it.
2. **Răspunsul pe scurt:** 2–3 sentences that answer directly and stand alone if quoted.
3. **Ce decide la tine:** the 2–5 factors that change the answer for a given farm. This is how the page stays honest when terms vary person to person.
4. **Ce înseamnă în practică:** an example or a short table, only when the sources support one.
5. **Creditul potrivit:** one card to the matching credit page.
6. The consultant action, with the need filled in.
7. 3–5 related questions; sources; updated date.

Rules: no page without a real, distinct answer (merge near-duplicates); no word targets; no Agrinvest rate, cost or eligibility promise until the IFN and its lawyer allow it; no document lists (owner rule); nothing about Golden Relationship. Schema: `WebPage` + `Question`/`acceptedAnswer` as `mainEntity`, breadcrumbs.

**Index `/finantare/intrebari`:** a search box (client-side filter over the titles, works as a plain list without JS) and the questions grouped by topic: Cine poate lua credit · Cât costă · Garanții · Rambursare · APIA și subvenții · Utilaje și investiții · Cereale și stocuri · Greutăți · Despre Agrinvest Credit IFN.

### Library `/finantare/ghiduri` → "Bibliotecă"

Same URL, new name and layout: guides (in the current journey order), the glossary, "Despre Agrinvest Credit IFN" with the register table and the confirm markers, sources, and "Cum scriem aceste pagini". The guides keep their text; their end gets the consultant band and links to the matching question pages.

### Simulator and application

- Simulator: the same tool, preselected from `?produs=`, and the result ends with the consultant button (the drawer carries the simulation in a hidden field). The long text under the tool shrinks to "Cum se calculează" plus question links.
- Application `/finantare/aplica`: kept as the detailed step. It is reached from the drawer's thank-you step and from direct links, and is not in the section links. It is pre-filled from `?cerere=`.

## Content model

- New collection `finance-questions`, localised: `question`, `slug`, `answer` (short, plain text with `{{F…}}` facts), `factors` (array), `practice` (rich text, optional), `topic` (select), `product` (relationship), `related` (relationship, many), `sources`, `review` (same fields as products). Seeded from `data/finance/questions/*.json` through `apply:finance`, with `generateSlug: false`.
- Credit products get `specs` (for the credit box) and `fitsList` / `notForList` (short items). The existing `fits`, `notFor`, `finances`, `repayment` and `risks` text moves into Detalii and is not rewritten.
- `faq` on products and guides is replaced by relationships to questions. The old FAQ items become the first question pages, so nothing is lost.

## The question inventory (7g.5)

Built before writing, kept as `docs/audit/finance-questions.csv` (question RO/EN, topic, source, matching credit, status):

- the ~110 product FAQs, the guide FAQs and the 10 FAQ-page items;
- the finance rows of `keyword-map.csv` and `aeo-queries.md`;
- Google autocomplete and "People also ask" for the head terms (credit agricol, credit IFN, credit APIA, credit utilaje, credit fermieri…);
- the questions farmers ask AI assistants: phrased as full sentences, comparisons ("IFN sau bancă") and "pot / se poate / cât" forms.

Then merge duplicates, drop questions we can't answer from sources, and write the first batch (the most useful 40–60 per language). Grow later from Search Console. No count target.

## Sub-phases

Each sub-phase ends with screenshots at 1366 and 390 px and the checks passing. Commit only when the owner asks.

- **7g.1 Design shots (owner gate).** Static mock-ups of the hub, a credit page (`credit-productie` and `credit-investitii`), a question page, the questions index, the drawer (open, sent) and the library, on desktop and phone. Two variants for the credit box and the need tiles. Write decision 0012. Nothing is wired until the owner picks.
- **7g.2 Shared parts.** The finance shell (title band with key facts and action, four section links, sticky tab bar, closing band, phone action bar), the consultant drawer and the `finance-callback` lead, the server action and tests.
- **7g.3 Hub.** Need tiles, finder (server-rendered result), how it works, popular questions, library teaser; `data/finance/hub.json` rewritten; old blocks removed on the live DB.
- **7g.4 Credit pages.** The credit box, fit lists, tabs, Detalii, sub-credit cards, question links; `specs` and fit lists for all 13 credits in both languages.
- **7g.5 Answers.** The inventory, the `finance-questions` collection and migration, the question template and index, the first batch of pages, product/guide FAQs moved to questions, the 301, sitemap and `llms.txt` entries.
- **7g.6 Library, simulator, application.** The Bibliotecă page, despre IFN with the register, guide endings, simulator handoff to the drawer, application pre-fill.
- **7g.7 Live and checks.** `apply:finance` steps for the live CMS (menu, footer, hub blocks, redirects) rehearsed on old code and data first; `check:finance` extended to questions; e2e; the script budget; one Lighthouse pass.

## Acceptance

- Every row in the audit table above is fixed.
- On a phone, the first need tile is visible within the first screen after the title band.
- Every finance page has exactly one primary action, the consultant drawer, and it works without JavaScript (fallback to `/finantare/aplica`).
- No product is listed twice on the hub.
- Every question page has a direct answer, "ce decide la tine", one matching credit and sources; `check:finance` fails a page without them.
- No Agrinvest rate, cost, document list or eligibility promise appears anywhere; the confirm markers remain on unapproved facts.
- Credit and question pages stay under the 160 KB script budget.
- RO and EN pairs exist for every new page; hreflang and sitemap are correct.

## Traps

- Live CMS changes go through `scripts/finance/entry-points.ts` / `corrections.ts`; menu and footer caches are keyed by the deploy epoch, which hashes those files.
- Send `generateSlug: false` with every slug written by script.
- Script budget: the application page is at 159.5 KB; the drawer must load lazily and must not pull the full application form.
- React clears selects on form reset: reuse the `attempt` key pattern.
- The dev server keeps stale data after DB writes; restart it before shots.
- `check:finance` currently counts guide/product pairs; update it in the same sub-phase as the content change, or CI fails.
- Golden Relationship: publish nothing about it.

## Update 2026-11-26: a shorter hub with photos

Owner request: simplify the financing main page, with real photos found by search. The hub is now a title band (photo and four facts), the eight needs as photo tiles, three steps and the closing band. The finder, the question cards and the library cards are gone; Întrebări, Simulator and Bibliotecă stay in the section links.

The nine photos are CC0 or public domain, found through Openverse, cropped into `public/media/finance`, with credit and source in `src/lib/finance/photos.ts`. They are not Agrinvest's own farms, equipment or people, so the owner's own photos should replace them when they arrive (`docs/audit/agrinvest-inputs.md`).
