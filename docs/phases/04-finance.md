# Phase 4

## Finance (Agrinvest Credit IFN)

Status: **4.1, 4.2, the owner's corrections and all of 4.3 are on `main`. `inputuri-plata-la-recolta` stays as written until the owner talks to the IFN. 4.1 to 4.6 are built and on `main` (2026-11-10). What remains is outside the build: the IFN's answers, the lawyer's approval and the owner's preview review.** Plan approved 2026-11-05. Sub-phases run in order: 4.1 confirmation → 4.2 model → 4.3 content → 4.4 tools → 4.5 and 4.6 cross-selling, SEO and gate. Decisions: `docs/decisions/0007-finance.md`.

## Context

`/finantare` is one short page today (about 150 words of body), with 9 finance rows in the keyword map. The roadmap wants the clearest place in Romania to understand, simulate and apply for farm credit. Banks own "credit agricol", and Tarfin and Agricover own "plata la recoltă". The way in is long-tail pages, tools and real depth, which is what "enough meaningful content" means in this plan.

The problem: most questions in `docs/audit/ifn.md` are still open, and no amounts, rates or document lists are published anywhere. The owner confirmed the main company and IFN facts on 2026-11-05 and will collect the rest before launch. So the plan separates what can be written truthfully now from what waits for the IFN, and adds a check that stops thin pages.

### Owner decisions (2026-11-05)

- **Unapproved finance pages are public on the noindex domain, with markers**, as in the shop pilot. Launch stays blocked by a check (see 4.6).
- **No document upload in this phase.** The application is sent without files and the IFN collects documents afterwards. Upload and private storage move to Phase 9.

### Assumptions to correct at review

- **English parity (decision 0005) applies to every finance page.** This replaces the roadmap's "`/en/financing` business overview".
- **The simulator shows principal only**, as Agrinvest publishes no rate. An optional field lets the farmer type their own rate for a comparison, labelled as their figure, not an offer. The lawyer can remove it.
- **No competitor is named on any page.** Comparison is by type (bank, IFN, leasing, grant).

## What the research changed

Checked 2026-11-05. These replace older notes in the roadmap, `ifn.md` and the figures register.

| Topic                     | Older note                             | Newer finding                                                                                                                      | Treatment                                                                                    |
| ------------------------- | -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| Investment term           | up to 7 years                          | **Up to 10 years**                                                                                                                 | **Confirmed by the owner**                                                                   |
| On-time discount          | "10%/year off the interest rate"       | **Up to 10% of the interest margin**, for respecting the contract and schedule. The headline overstates it                         | Always write "marjă". Ask how it works, with an example                                      |
| Reply and money           | 24 h, money in 3 days                  | **Reply in 24 h confirmed by the owner.** Time to money has three versions: 3 days (old page), 2 days (Nov 2025), 24 h (June 2026) | Still marked as a conflict; the site says "within 3 days"                                    |
| IFN address               | conflict                               | **Owner: floor 5** (Bd. Pipera 1/1). ANAF's registered office says nr. 1 I, et. 4                                                  | Working office confirmed; the registered office stays marked until the mismatch is explained |
| APIA certificate loans    | ROBOR 6M + max 2%                      | **Banks +2%, IFNs +8%** (OMADR 703/2013, as APIA states); up to 90% of the calculated amount                                       | Correct the notes. Scheme and Agrinvest's own APIA collateral stay separate                  |
| APIA scheme participation | unknown                                | Not in any list found. APIA's convention page could not be read (SSL error)                                                        | Never imply participation. Recheck `apia.org.ro`                                             |
| Funding banks             | ING, BRD, UniCredit                    | **Banca Transilvania too** (5M lei)                                                                                                | Named only with permission                                                                   |
| Agricover benchmark       | Card up to 150k lei                    | **Up to 250k lei**; working capital max 12 months, investment 84 months                                                            | Update notes. 10 years is a real strength, but CEC offers 15 for land, so no "longest" claim |
| Instalment calendar       | autumn and spring vs summer and autumn | **Summer and autumn, at most 2 a year**                                                                                            | **Confirmed by the owner**                                                                   |
| Insolvency recovery rate  | none                                   | CEO said "1 in 10" (Nov 2025) and "under 5%" (June 2026)                                                                           | Publish no number without a source                                                           |
| Pay at harvest for inputs | priority-1 keyword page                | **No source shows an IFN product.** It may be trade credit from Agrinvest SRL, a different legal entity                            | Top question for the IFN. Decides what the page sells                                        |

Also found:

- **Wrong data about the IFN:** finantist.ro shows consumer-loan terms ("up to 5,000 lei, 0%"), and it ranks for "agrinvest credit". Never a source. A strong brand page is the fix.
- **Interview captions can't be quoted unchecked:** "grupul Agricover" for Agrinvest, "80% pe an" where the speaker clearly means a much lower rate. Check every fact against the audio.
- **A new content competitor:** finantareagro.ro publishes dated, sourced guides (for example the DR-12 and DR-14 cofinancing rules). That sets the depth bar for guides.

### Legal reading, for the lawyer to confirm

OUG 50/2010 art. 7 defines a consumer as a natural person acting outside their trade. Art. 8–9 require a representative example in credit advertising. Agrinvest lends to PFA, II, IF and companies, so these rules probably don't apply, but that is the lawyer's call. Until then no page states a rate or a cost figure from Agrinvest. Misleading-advertising rules still apply between businesses, so no superlatives and no promise of approval.

## Content plan

### Pages: 29 pairs, 58 URLs, about 44,000 words per language

Natural writing comes first (owner, 2026-11-05): a page says what its sources support and stops. The word figures below are rough expectations, not limits. Quality is judged by the required sections, sources and the uniqueness rule below.

| Group                     | Pages                                                                                                                                                                                                                                   | Floor | Main keywords                                                                                                                                           |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Hub**                   | `/finantare`                                                                                                                                                                                                                            | 1,500 | credit agricol, credit fermieri, IFN agricol, agrinvest credit                                                                                          |
| **Products (8)**          | `credit-productie`, `credit-investitii`, `credit-contracte-cereale`, `finantare-stocuri`, `subventii-apia`, `inputuri-plata-la-recolta`, `industrie-alimentara`, plus `restructurare` (new: agrointel names personalised restructuring) | 1,300 | credit capital de lucru, credit investiții agricole, credit pe contract cereale, finanțare stocuri, credit pentru inputuri, restructurare datorii fermă |
| **Investment pages (5)**  | `/utilaje`, `/irigatii`, `/depozitare`, `/teren-agricol`, `/ferme`                                                                                                                                                                      | 1,000 | credit utilaje agricole, credit irigații, credit siloz, credit teren agricol, credit fermă zootehnică                                                   |
| **Tools and process (4)** | `simulator`, `aplica`, `intrebari-frecvente` (40 questions), `despre-ifn` (eligibility and documents deferred by the owner)                                                                                                             | 600   | simulator credit agricol, acte credit fermier                                                                                                           |
| **Guides (10)**           | see below                                                                                                                                                                                                                               | 1,800 | see below                                                                                                                                               |
| **Glossary**              | `ghiduri/glosar`, about 70 terms                                                                                                                                                                                                        | n/a   | marjă, ROBOR, bilet la ordin, gaj, adeverință APIA                                                                                                      |

**Guides** (`/finantare/ghiduri/{slug}`). Most need no IFN figures, so they can ship first:

1. `plata-subventii-apia`: payment calendar and how advances work
2. `credit-adeverinta-apia`: who lends, up to 90%, the rate caps, how to ask for the certificate
3. `fonduri-garantare`: FGCR and FNGCIMM, what a guarantee costs and covers
4. `credit-sau-grant-afir`: cofinancing and bridge loans, proof of cofinancing, current sessions
5. `ifn-sau-banca`: when each fits, using the CEO's point that they complement each other
6. `credit-sau-leasing-utilaje`: ownership, deposit, residual value, second-hand machinery
7. `costul-real-al-creditului`: interest, margin, ROBOR, fees, valuation and insurance costs
8. `cum-analizeaza-finantatorul-ferma`: debt level, solvency, cash flow, why accounts can mislead
9. `insolventa-sau-restructurare`: what insolvency doesn't stop, why to bring creditors together early
10. `cand-vinzi-recolta`: spreading sales, storing against selling, what financing stock costs

### What every product page must contain

Sections are fixed fields, so a page can't be published with one missing:

- **Direct answer** at the top (2–3 sentences, for search and AI assistants)
- **Who it fits, and who it doesn't.** Honest limits are rare in this market and build trust
- **What it finances**, in concrete farm terms
- **How repayment follows the harvest**, with a table by crop
- **Worked example:** a named farm scenario with round numbers, principal only, labelled as an example
- **Accepted guarantees** for this product, and what each involves
- **Documents:** no list until the IFN confirms it; the page says the team gives it after the first conversation
- **Process** (apply, reply, sign, money) and **risks** (a bad harvest, a price fall, what to do early)
- **FAQ** of at least 6 real questions, a named contact, **sources**, a review date, and links to the simulator, the application and related pages

### What makes each investment page different

These five are the doorway-page risk, so each needs its own substance:

| Page            | Unique content                                                                                       |
| --------------- | ---------------------------------------------------------------------------------------------------- |
| `utilaje`       | new or second-hand, ownership against leasing, timing purchases around cash flow                     |
| `irigatii`      | what to check before investing (water source, permits, area), payback questions, cofinancing         |
| `depozitare`    | storing against selling at harvest, link to Agrinvest bases and the storage page                     |
| `teren-agricol` | the CEO's warning on payback at current land prices, purchase rules, keeping the ground rent in view |
| `ferme`         | crop and livestock cash flows differ, so seasonal or monthly repayment differs                       |

### Sources, in order of trust

1. **The IFN's answers**, then its own statements: the old page and 4 Agro TV interviews (checked against audio).
2. **Official texts:** legislatie.just.ro, APIA, FGCR, FNGCIMM, AFIR, BNR.
3. **Dated press**, used only for Agrinvest facts already marked to confirm, such as 35% of the contract value and 200% of APIA claims.

**Rule:** a fact about Agrinvest comes from the register, marked until confirmed. A public fact (rate caps, deadlines) carries a source link and a date. Gaps are named, never guessed. Claims I recalled but haven't checked, such as the land sale rules, are verified while writing.

## 4.1 Research and confirmation

- **Question pack for the IFN:** rewrite `ifn.md` as a short Romanian form, with the table above pre-filled so they correct instead of write. Pay at harvest and the current product list go first.
- **Keyword map:** add about 60 rows, RO and EN, using the targets above and the long tail from `serp-notes.md` (credit fermieri mici, credit fără ipotecă, rambursare la recoltă). Volumes stay blank until there is Google Ads access.
- **Register:** split `F4`, `F5` and `F7` into part keys (`F4.reply`, `F4.money`, `F5.term`, `F5.instalments`, `F7.registered`, `F7.office`). Add the DPO email, margin discount, contract share and APIA collateral. `F7.registered` gets ANAF as its source and stays unconfirmed until the IFN says so.
- **Update** `ROADMAP.md` facts, `ifn.md` and `agrinvest-inputs.md`. Add `/facilitati-de-credit/` to the redirect map if the crawl shows it existed.

**Exit:** question pack ready to send; keyword map and register updated.

### 4.1 progress (2026-11-05)

**Built**

- **IFN form:** `docs/audit/ifn-confirmare.md`, in Romanian, pre-filled, pay at harvest and the product list first. `ifn.md` stays as the research notes, updated, rather than being rewritten into the form.
- **Keyword map:** 63 rows added (57 RO, 6 EN). Tiers are estimates. `audit:keywords` rebuilds the file from the proposal's plan and would drop these and the Phase 3 rows, so do not rerun it without merging.
- **Register:** `F4` and `F5` split, `F7` split into `F7.registered` and `F7.office`, `F8.dpo` and `F9`–`F12` added in the seed; `F13` (funding banks) is register-only until permission is given. The seed reads a status per part key.
- **Docs:** roadmap facts, `ifn.md`, `agrinvest-inputs.md`, decision 0007.

**Choices**

- `F4.money` shows "within 3 days", the weakest promise, because it holds under all three versions. It stays marked as a conflict.
- `/facilitati-de-credit/` needs no redirect: it is not in the crawl and already returns 404.

**Must happen in 4.2**

- The live database still has `F4` and `F5` rows, and live pages use `{{F4}}` and `{{F5}}`. The seed never runs there, so the apply step must add the new rows and rewrite those references, or home and about will show raw keys.

## 4.2 Content model and pipeline

Read `.claude/skills/payload/SKILL.md` and the Next 16 guides first.

| Item                    | Key fields                                                                                                                                                                                                                                                                                                                      |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **FinanceProducts**     | title, per-language slug, `parent` (for investment pages), direct answer, the fixed sections above, guarantees, borrower types, documents by type, optional amounts and term, FAQ, advisor (People), related, sources, SEO, `factStatus`, `legalStatus` (`draft`, `ifn-reviewed`, `legal-approved`), `reviewedAt`, `reviewedBy` |
| **Guides**              | `section` (only `finantare` for now, so Phase 6 extends it instead of migrating), title, slug, summary, body, author and reviewer (People), sources with access dates, FAQ, related, SEO, `legalStatus`, `reviewedAt`                                                                                                           |
| **FinanceApplications** | reference, buyer type, company and CUI, need, amount, term, guarantees offered, county, crops and area, consents with version, status, assigned person, notes. **No files, no personal numeric code (CNP)**                                                                                                                     |
| **Users**               | a `roles` field with `ifn`, plus `isIfn` in `src/access`. Today every staff user can read everything, and applications must be IFN-only                                                                                                                                                                                         |

**Deviation from the roadmap:** no separate IFN identity global. The Figures register already holds that data, and a second copy breaks the "one source" rule. A `FinanceFooter` renders it on every finance page.

**Pipeline:**

- Content lives in `data/finance/{products,guides}/*.json` and `glossary.json`, validated like `scripts/products/schema.ts`.
- `scripts/finance/apply.ts` reuses the hash and ledger logic from `scripts/products/view.ts`, so admin edits are never overwritten.
- It also updates the existing `finantare` page, because `applyPages` only creates missing pages and the seed never runs on a live site.
- It runs from `scripts/deploy/prepare-database.sh`. `ENRICHMENT_EPOCH` already covers `data/`.

**Routes:** add `finance` to `src/i18n/routes.ts`, with twin folders `finantare/` and `financing/` as thin wrappers around `src/components/templates/`. The hub stays a CMS page with a new `financeProducts` block; the catch-all route keeps serving it.

**Watch for:** the 63-character Postgres limit on deep arrays (set `dbName`), and that Preview and Production share one Neon database, so a preview build writes to production.

**Exit:** model in the admin, migrations clean on an empty database, apply run twice with no changes, access tests passing.

### 4.2 progress (2026-11-05)

**Built**

- **Model:** `FinanceProducts` (fixed required sections), `Guides` (with `section` for Phase 6 and `terms` for the glossary) and `FinanceApplications`. Closed lists are in `src/lib/finance/options.ts`. Migration `finance_model`.
- **Roles:** `users.roles` with `admin` and `ifn`. Only `ifn` reads applications, and only `admin` changes roles. The migration makes every existing account an admin, and the first account on an empty site becomes one.
- **Pipeline:** `scripts/finance/{schema,apply,figures,run}.ts`, `npm run apply:finance`, on every deploy and at the end of the seed. A file can never set a review status.
- **Register on the live site:** `applyFigures` adds the new rows, rewrites `{{F4}}` and `{{F5}}` on pages, then retires the old rows.
- **Routes:** `sections.finance`, reserved words and path helpers in `src/i18n/routes.ts`.

**Results**

typecheck, lint, format, `next build`, `test:int` (119, of which 19 new), `test:e2e` (74), `check:seo` (362 pages, 0 errors). On an empty database: migrations, seed and apply are clean, a second apply changes nothing, no drift between schema and migrations. A user who existed before the migration became an admin.

`check:aeo` gives 38 of 39 on the local database only: question 34 needs the category intro, and repeated reseeds left the seed's older text there. A fresh database has the right text.

**Deviations from the plan**

- **Route folders move to 4.3**, with the templates they wrap. No finance page exists yet, so nothing can be served.
- **The `financeProducts` hub block moves to 4.3**, with its rendering.
- **`ENRICHMENT_EPOCH` did not cover this data, as the plan assumed.** It now hashes `data/finance` and `scripts/seed/data.ts`, and `getFigures` carries it in its cache key. Without this, new register rows would not reach the live pages.
- **Comparison keeps links and bold** (`richView`). Products compare plain text, so a corrected link alone would never deploy there. Worth porting to `scripts/products/view.ts`.

**Found**

- **Payload's slug helper overwrites a given slug** unless `generateSlug: false` is sent. It made `produs-de-test-en` from the title, so every English URL would have been wrong.
- **Generated `down` migrations can fail:** a table dropped with `CASCADE` takes its constraint with it. Fixed in `finance_model` with `IF EXISTS`. `shop_orders` has the same flaw and was left as it is.
- **Reseeding a database that already has data leaves hubs and some products looking edited.** Local only: deploys seed an empty database once.

**Open for 4.3**

- `rt()` has no tables, and the guides need them.
- `npm run seed` resets the hub's ledger, so the hub file applies again afterwards.

### Owner corrections (2026-11-05)

Applied to the register, the seed, the plan and, through `apply:finance`, the live site (`scripts/finance/corrections.ts`).

- **Confirmed:** founding, 100% Romanian capital, payment after reception, 55 trucks and other vehicles, reply in 24 h, 10 years, 2 instalments a year after the summer and autumn harvests, 500+ clients.
- **Changed:** 275,000 t, 11 counties, "17 silos and grain warehouses", 9,000 ha of arable land with over 50% owned (`C10`, new).
- **Removed:** the commercial office row (head office = registered office), the main phone, the stopped programme: page unpublished, gone from home, about, figures, partners, menus and the 3 AEO questions. Its old URL now redirects to `/despre`.
- **`applyFigures` now updates existing rows**, except a row confirmed in the admin after the register's date.
- **Still open:** the per-site capacities add up to 252,000 t against the confirmed 275,000 t; ANAF's floor 4 against the owner's floor 5; whether the IFN phone stays; time to money. Phase records 01–03 and the old-site audit snapshots keep their history.

## 4.3 Pages and content

Templates first, then writing in three reviewed batches. New patterns go in `design-system/patterns/` with stories: `RepaymentCalendar`, `GuaranteeTable`, `WorkedExample`, `SourceList`, `ReviewNote`.

- **Batch 1: guides and glossary**, which depend least on the IFN.
- **Batch 2: hub, `credit-investitii` and its 5 pages, `credit-productie`, `despre-ifn`, FAQ.** The best-sourced products.
- **Batch 3: the rest.** `subventii-apia` and `inputuri-plata-la-recolta` are written around what is confirmed. If pay at harvest is not an IFN product, the page says what Agrinvest actually offers and names the right company.

Each page is written in Romanian and English together, with correct ș and ț. Tone follows the design-system voice rules: plain words, with no marketing filler.

**Markers (owner's decision):** every unconfirmed fact uses the existing "de confirmat" marker, and each page with one also shows a `ReviewNote`: terms are being confirmed and don't form an offer. Figures from old press are shown only as marked facts.

### 4.3 progress (2026-11-05)

**Built**

- **Tables in text:** `rt()` reads Markdown tables, the editor has Payload's table feature, and tables scroll inside themselves on phones.
- **Patterns:** `ReviewNote`, `SourceList`, `WorkedExample`, `GuaranteeTable`, `RepaymentCalendar` (`design-system/patterns/Finance.tsx`, with stories). `DocumentMatrix` is dropped: the owner deferred the document lists.
- **Guide pages:** `/finantare/ghiduri`, `/finantare/ghiduri/{slug}` and the English twins, with contents list, sources, FAQ, Article and DefinedTerm schema, a `finance` sitemap segment and `llms.txt`.
- **Loaders and schema:** `src/lib/content/finance.ts`; `article`, `definedTermSet`, `loanOrCredit`. Interface strings in `src/i18n/finance.ts`. `src/lib/finance/calendar.ts` holds the instalment seasons.
- **Batch 1 written (RO and EN):** all 10 guides and a glossary of 45 terms (not 70: the rest would have been filler). Guides run from about 600 to 1,600 words, at their natural length.

- **Batch 2 written (RO and EN):** the product template, routes for one and two levels, the `financeProducts` hub block, hub text, `credit-productie`, `credit-investitii` and its 5 pages, `despre-ifn` and a 20-question FAQ.

- **Batch 3 written (RO and EN):** `credit-contracte-cereale`, `finantare-stocuri`, `subventii-apia`, `inputuri-plata-la-recolta`, `industrie-alimentara`, `restructurare`. `harvestCalendar` turns the calendar off where repayment does not follow harvests, and worked examples can carry marked facts.
- **`inputuri-plata-la-recolta`** names no product. It states what is sourced: a production loan, and the old site's statement that some farmers settle debts in farm produce (`F14`). It says which company does what, and that the terms come from the team.
- **`subventii-apia`** keeps Agrinvest's own financing apart from the certificate scheme and says nothing on participation. The 2022 and 2023 statements on whether it depends on the certificate disagree, so the page states neither. Both questions are on the IFN form.

**Not built yet:** pages link to the lead form for now: the simulator and application come in 4.4.

**Deviations:** `despre-ifn` and the FAQ are Guides with section `pagina-finantare`, served by fixed routes, so they reuse the apply step. The FAQ has 20 questions, not 40: the rest would have repeated the product pages. Claims with no source (second-hand machinery, dryers, breeding animals) were taken out and added to the IFN form.

**Owner's changes:** the eligibility checker and the documents page are deferred, and no indicative document list is published anywhere. Product pages say the team gives the list after the first conversation. Keyword rows for `/finantare/eligibilitate` and `/finantare/documente` stay in the map as unbuilt.

**Length:** the owner dropped the word floors: a page is as long as its sources support. `check:finance` only catches near-empty pages.

**Sources:** interest in insolvency is art. 80 of Law 85/2014 (with art. 103), not art. 79 as noted earlier; guarantors are art. 75(2)(b). APIA's convention list still could not be read, so no page says whether Agrinvest takes part. Statements from Agro TV interviews are used only as general advice, unattributed, until checked against the audio and the IFN allows quoting. Guides are signed by "Agrinvest Credit IFN", with no named person, until the same permission.

**Results (Batches 1 and 2):** typecheck, lint, format, `next build`, `test:int` (126), `test:e2e` (72), `check:seo` (402 pages, 0 errors; it now fails on a raw `{{KEY}}` anywhere). Keyword map: 66 of 102 target URLs built. On an empty database: migrations, seed and apply run clean and a second apply changes nothing. A test rebuilds the page a live site has from the first seed, and the hub replaces it without a false conflict.

### First deploy of Phase 4 (2026-11-05)

The first merge failed on Vercel: `apply:finance` crashed on live data, and CI failed too. Migrations ran; the register rows, the unpublishing and some Romanian pages were written before the crash. Every step is safe to repeat.

A rehearsal (old code and old data, then the new deploy) found what tests had not:

- **Null groups:** Payload crashes on a group set to null, and a missing key keeps the old value, because rows merge by id. An empty link is written out as `{ label: null, href: null }`.
- **Slug and path disagree on old data:** English pages had slug `farm-financing` and path `/financing`, and any save rebuilds the path from the slug. Scripts now send the slug the path uses (`keepUrl`), and the seed no longer creates the mismatch.

**Rule from now on:** any step that writes to the live database is rehearsed first: build a database with the code on `main`, run the new deploy on it, and compare every page path.

## 4.4 Tools

Plain server-rendered forms that work without JavaScript, as in the shop. Only 8 KB of the 160 KB script budget is left, so no chart library or large client code. URLs with parameters are noindex and canonical to the clean page. Logic is pure functions in `src/lib/finance/` with unit tests.

- **Simulator:** amount, term, crop or crops, start month. Output is a schedule of at most 2 instalments a year, aligned to harvests, plus the optional own-rate comparison. Instalment months come from one setting. Clear disclaimer.
- **Eligibility checker (deferred):** revisit when the IFN provides enough information to define the inputs, product-matching rules and documents. Do not invent thresholds or imply eligibility or approval.
- **Documents page (deferred):** revisit alongside the eligibility checker when document requirements by borrower type and product are confirmed. Until then, publish no indicative matrix.
- **Application (`aplica`):**
  - One page, like checkout, with reused ANAF lookup and rate limiting.
  - Needs, amount, guarantees and consents. GDPR and credit-bureau wording are marked drafts.
  - Reference number, routed to the `ifn` person, and a screen saying documents follow after contact.
  - The site runs no credit check and makes no decision.

### 4.4 plan (2026-11-09)

Branch `phase-4/tools` from `main`. Two page pairs: `/finantare/simulator` with `/en/financing/simulator`, and `/finantare/aplica` with `/en/financing/apply`. Both route words are already reserved in `financeRoutes`.

#### Simulator

**Inputs.** All are GET parameters, so the form posts back to the same URL and needs no client code:

| Parameter | Field        | Rule                                                                                               |
| --------- | ------------ | -------------------------------------------------------------------------------------------------- |
| `suma`    | amount, lei  | whole number, 1,000 to 50,000,000. Bounds only stop typing errors and are never shown as a limit   |
| `luni`    | term, months | 1 up to `F5.term` × 12. The register's `number` (10 today) is read from Figures, never typed again |
| `culturi` | crops        | one or more of the 5 harvest crops in `instalmentSeasons`, matched by the Crops slug               |
| `start`   | first month  | `YYYY-MM`, from the current month up to 12 months ahead; defaults to next month                    |
| `dobanda` | own rate, %  | optional, above 0 and up to 50. Labelled as the farmer's own figure                                |

English pages use the same parameter names, so a link works in both languages.

**Schedule** (`src/lib/finance/simulator.ts`, pure functions):

1. Each crop maps to its season in `calendar.ts`: wheat, barley and rapeseed to summer (August), maize and sunflower to autumn (November). The crops move from display strings to slugs there, so the pages and the simulator share one map.
2. An instalment falls in every chosen season month after the start month and no later than the end of the term. Two seasons at most, so never more than 2 a year.
3. The principal is split equally in whole lei, and the last instalment takes the rounding, so the instalments always add up to the amount.
4. If no harvest falls inside the term, there is no schedule. The page names the first harvest month and the term that would reach it.
5. With an own rate, interest runs on the remaining principal for the months between instalments (simple interest, rate ÷ 12 per month). The result shows interest for each instalment and in total, with a note that fees, insurance and valuation costs are left out (link to `costul-real-al-creditului`). It is never called DAE or "cost total".

**Output.** A table (harvest, month, principal, principal left, interest when a rate is given) as a new `RepaymentSchedule` in `design-system/patterns/Finance.tsx`, with a story. Above it, the inputs as plain text; below it, the disclaimer as a `ReviewNote`: an example of how instalments could fall, not an offer; the IFN sets the real schedule and cost after analysis. Then two links: change the figures, and "Trimite o cerere cu aceste cifre", which opens the application with amount, term and crops filled in.

**Page.** A `FinanceToolPage` template. The tool, then the page text: how the schedule is built, why it shows principal only, which farms it does not fit (livestock, monthly income: link to `ferme`), and a short FAQ. The text is a Guides entry with section `pagina-finantare`, like `despre-ifn`, so it goes through `apply:finance` and review status. Schema: `WebPage`, breadcrumbs and FAQ.

#### Application

**Form** (`ApplicationForm` client pattern, one page, three steps shown at once like checkout):

1. **Who applies:** legal form (the 6 `borrowerKinds`), CUI with "Completează din ANAF", company name, contact name, phone, email, county.
2. **What you need:** product (published finance products plus "Nu știu încă"), amount, term in months, crops, area in hectares, guarantees offered (the 6 `guaranteeKinds`, all optional), message.
3. **Consents:** data processing (required), credit bureau check (optional). Both texts carry a "text în lucru" marker and a consent version such as `finance-draft-2026-11`, until the lawyer replaces them.

**CUI is required for every legal form.** All six have one, and someone without a registered business would be a consumer under OUG 50/2010, which this site does not serve. The ANAF button fills the company name. If ANAF fails, the fields stay open for typing, as in checkout.

**Prefill.** `?produs=`, `suma`, `luni` and `culturi` fill the form from a product page or the simulator. With parameters the page is noindex and canonical to the clean URL.

**Server action** `submitApplication` (`src/lib/finance/actions.ts`), built like `placeOrder`:

- Honeypot, then a zod schema in `src/lib/finance/application.ts` (reusing `cleanCui` and `normalizePhone`), then `allow('apply:' + ip)` in production.
- The product is resolved from its slug with `overrideAccess: false`, so only a published product can be linked. Counties and crops are checked against their collections.
- It creates the `finance-applications` row with a `CRD-2611-7KQ2M` reference. `newReference` moves from `src/lib/commerce/actions.ts` to `src/lib/reference.ts` and takes the prefix. The collection hook assigns the person who owns `finantare`.
- `notifyApplication` is added as a no-op, like `notifyLead`, until the owner chooses a channel.
- On a stored application, a failure later on still shows the reference.

**Confirmation.** It replaces the form: the reference to quote on the phone, the assigned person's name and role when routing gives one, the reply time as `<Fact k="F4.reply" />`, and the next steps. Someone from the team calls, the documents are asked for after that call, and nothing has been decided or checked yet. No approval wording.

**Collection.** No field changes are expected: the collection already holds everything above. The admin list gets `product` and `amount` columns. If a migration does turn up, it is rehearsed under the live-database rule.

**Script budget.** The form is one client component. The company lookup moves out of `CheckoutForm` into a shared `CompanyLookupField`, so both forms reuse one chunk. The simulator ships no client code.

#### Wiring and content

- **Routes:** thin route files for both pages in `finantare/` and `financing/`.
- **Links:** product pages and the hub link to both tools, and the product link carries `?produs=`. The FAQ and guides that say "use the form" are updated. The finance footer gets both links. This also meets the `check:finance` link rule in 4.6.
- **Content:** two page pairs in `data/finance/guides/` (`simulator`, `aplica`), RO and EN, written to their natural length.
- **SEO plumbing:** both clean pages go in the `finance` sitemap segment, `llms.txt` and the `check:seo` expected types. Lighthouse adds `/finantare/simulator`, a simulator URL with a result, and `/finantare/aplica`.

#### Tests

- **Unit (`simulator.ts`):** never more than 2 instalments in a calendar year, instalments always add up to the amount, a term reaching no harvest, mixed crops, a start in December rolling into the next year, the term cap read from Figures, interest on the remaining balance, no interest without a rate, and bad parameters returning errors and not throwing.
- **Unit (`application.ts`):** CUI control digit, required fields by legal form, amount bounds, prefill parsing, the reference format.
- **Integration:** the action stores the application with its routed person; the honeypot stores nothing; a staff user without `ifn` cannot read applications; a draft product slug is not linked.
- **e2e with JavaScript off:** the simulator shows a schedule from a GET; an application goes through as SRL and as PFA and shows a reference; an ANAF failure leaves manual entry. Both pages return 200 in RO and EN. A simulator URL with parameters is noindex.
- **Run:** the definition of done, `check:finance` once it exists, Lighthouse on the three URLs above, and `review:shoot` at 390 / 768 / 1440.

**Exit:** both tools live in RO and EN, working without JavaScript; applications reach the admin with a reference, visible only to `ifn` users; product pages and the hub link to both tools.

#### Decisions (2026-11-09)

The owner left the three choices to the recommended answers:

1. Product pages end with a "Simulează / Aplică" band and one contact line. The lead form is gone from product pages; the hub keeps one, reworded as "a question before you apply".
2. The simulator result is a table only.
3. A CUI is required for every legal form. Someone without a registered business is sent to the contact page.

### 4.4 progress (2026-11-09)

Branch `phase-4/tools`, merged to `main` 2026-11-09.

**Built**

- **Simulator:** `src/lib/finance/simulator.ts` (pure functions), the crop-to-season map in `calendar.ts`, `RepaymentSchedule` in `design-system/patterns/Finance.tsx`, and `FinanceToolPage.tsx`. A GET form with no client code. The longest term is read from `F5.term` in Figures.
- **Application:** `ApplicationForm` (client), `submitApplication`, `application.ts` (zod), `choices.ts`, a no-op `notifyApplication`, and `FinanceApplicationPage.tsx`. References are `CRD-…` from `src/lib/reference.ts`, which checkout now shares (`AGR-…`).
- **Shared ANAF field:** `CompanyLookupField`, now used by checkout and the application.
- **Content:** `data/finance/guides/simulator.json` and `aplica.json` (RO and EN). The hub band and FAQ now point to both tools. The hub's lead form is reworded as "a question before you apply".
- **Plumbing:** both pages in the `finance` sitemap segment and `llms.txt`, the admin list shows product and amount, and Lighthouse covers three new URLs.

**Results**

typecheck, lint, `next build`, `test:int` (145, 16 new), `test:e2e` (77, 5 new: both tools in RO and EN, simulator and PFA application with JavaScript off, an English company application after an error, product page links), `check:seo` (418 pages, 0 errors; keyword map 75 of 102 built), and `check:figures` (warnings only). Lighthouse, mobile with devtools throttling: 100/100/100, LCP about 1.35 s, CLS 0 on the simulator (with and without a result) and the application. Scripts: simulator 148 KB, application 159.5 KB. `format:check` fails only on a stray character in `docs/ROADMAP.md`, which was already in the working tree before this work.

**Found**

- **React resets a form after an action, and a select loses its value.** After an error, the legal form and county came back empty. This affected checkout too. The actions now return an `attempt` stamp, and both forms remount on it.
- **One template file means one client bundle.** While the simulator shared a template file with the application, it loaded the form's code (161 KB). Each tool now has its own file.
- **The application form's text was in its script.** It now arrives from the server in one language, which brought the page under 160 KB. Checkout is still 160.4 KB the same way; it is not in the Lighthouse list, and the same fix would apply.

**Deploy rehearsal:** on a database built with `main`'s code, the new steps wrote the two tool pages, the FAQ and the hub once; a second run changed nothing, and all 227 existing page paths stayed the same.

**Deviations**

- **There is no `FinanceFooter`.** The 4.2 plan named one but it was never built. The footer and menu entry points go to 4.5 with the other entry points.
- **The "ANAF failure leaves manual entry" e2e test** is covered by the no-JavaScript application, where the fields are always typed by hand. A live ANAF failure is not simulated in the browser.

## 4.5 Cross-selling

Make cross-selling feel like a useful hint, not a sales push. On product pages, keep the financing mention brief and contextual. In the cart, use a prominent, polished callout to let shoppers know they can explore financing options or financial support for their inputs. Give it clear hierarchy and thoughtful visual design, with a direct link to relevant information; don't suggest that the shopper is eligible or that approval is guaranteed.

| Where                   | Link                                                                                               |
| ----------------------- | -------------------------------------------------------------------------------------------------- |
| Shop product            | A brief, contextual hint about financing inputs (wording depends on the pay-at-harvest answer)     |
| Cart                    | A prominent, well-designed callout inviting shoppers to explore financing options for their inputs |
| Crop pages `/cereale/*` | stock financing and contract credit (until the Phase 5 price tool exists)                          |
| Storage and base pages  | stock financing; the general IFN contact until regional advisors are named                         |
| Home, mega menu, footer | finance section entry points                                                                       |

The price tool and diesel links go on the Phase 5 list. Pay-at-harvest checkout functionality stays out of scope; the cart callout links to finance information or the application only.

### 4.5 progress (2026-11-10)

Branch `phase-4/cross-selling`, merged to `main` 2026-11-10.

**Built**

- **Patterns** in `design-system/patterns/Finance.tsx`, with stories:
  - `FinanceHint`: one line on shop product pages.
  - `FinanceCallout`: the cart callout.
  - `FinanceLinks`: two link cards on crop and base pages.
- **Shop product:** one line under the price note, "Cauți bani pentru inputurile sezonului?", linking to `inputuri-plata-la-recolta`, or to `credit-productie` if that page is not published. The wording names no product, so it holds whatever the IFN answers about pay at harvest.
- **Cart:** a forest callout under the order summary. It covers:
  - production credit with `{{F5.instalments}}`;
  - the farm year as three steps (now, August, November);
  - a link to how inputs are financed, and the simulator opened with the cart total;
  - a note that the order and the loan are separate and that this is not a credit offer.
- **Crop pages:** stock financing and contract credit. **Base pages:** stock financing and the IFN's general contact (`/finantare#cerere`), until regional advisors are named.
- **Links come from published products** (`financeLinks` by key), so no page links to a missing page.
- **Menu, footer and home on the live site:** `scripts/finance/entry-points.ts` runs in `apply:finance` and at the end of the seed. It does three things:
  - gives the finance menu item a panel (production, investment, simulator, guides);
  - adds the simulator and application links to the footer after the finance link;
  - changes three links: the home band's "Cere o ofertă" now goes to the application, and the storage page's financing card now goes to stock financing.

  It only adds what is missing and rewrites only the seed's exact old links, so staff edits stay. The seed has the same text.

**Found**

- **The menu and footer caches never changed between deploys** (`global:navigation`, `global:footer`). A script writes them outside Next.js, so the live menu would have stayed old. They now carry the deploy epoch, and the epoch hashes `corrections.ts` and `entry-points.ts`. The finance product list's cache key also moved to `v2`, because its shape gained `key`.

**Results**

typecheck, lint, `next build`, `test:int` (149, 4 new), `test:e2e` (81, 4 new), and `check:seo` (0 errors). Lighthouse, mobile: performance 100 on the crop, base, storage and finance pages, and 99 on home and the shop product, whose LCP of 1.9 s is the product photo, as in Phase 3. Accessibility and best practices are 100, CLS is 0, and scripts stay at or under 156 KB.

**Deploy rehearsal:** on a database built with `main`'s code, the first run added the menu panel and footer links and updated the links on home and storage, in both languages. A second run changed nothing, and all 231 page paths stayed the same.

## 4.6 SEO, compliance and the content gate

- **Schema:** add `financialService`, `loanOrCredit`, `article` and `definedTermSet` builders to `src/lib/schema/`. `LoanOrCredit` states a term or amount only once confirmed. FAQ markup only for visible, real questions.
- **Plumbing:** a `finance` sitemap segment, `llms.txt`, 20 more questions in `aeo-queries.md`, `check:seo` expected types, Lighthouse on the product, guide and simulator templates.
- **New `check:finance`** (`scripts/checks/finance.ts`), which is what makes "enough content" enforceable. `check:seo` has no depth rule today.

| Rule                                                                                    | Now  | With `SITE_INDEXABLE=true` |
| --------------------------------------------------------------------------------------- | ---- | -------------------------- |
| Body words at or above the floor; all required sections filled; FAQ count               | fail | fail                       |
| Investment pages and guides too similar to a sibling (shared phrases)                   | fail | fail                       |
| Forbidden claims: "aprobare garantată", "cel mai", "fără garanții", any Agrinvest rate  | fail | fail                       |
| Public fact without a source and date; Agrinvest number typed instead of a register key | fail | fail                       |
| Internal links: simulator, application, at least 2 related pages                        | fail | fail                       |
| Review date older than 12 months                                                        | warn | fail                       |
| `legalStatus` not `legal-approved`, or any unconfirmed fact on the page                 | warn | **fail**                   |

### 4.6 progress (2026-11-10)

Branch `phase-4/gate`, merged to `main` 2026-11-10.

- **`npm run check:finance`** (`scripts/checks/finance.ts`, rules in `scripts/finance/gate.ts`), now in CI after `check:products`. It reads the files in `data/finance` and, from the database, only review status and register facts.
  - Always fails on: under 150 words, a product with fewer than 4 FAQ, fewer than 2 internal links, a forbidden claim, an interest or margin percentage on a product or the hub (public ROBOR caps excepted), or siblings sharing over 30% of 6-word phrases (today's highest pair is 18%).
  - Warns now, and fails with `SITE_INDEXABLE=true`, on: a page not `legal-approved`, a review older than 12 months, an unconfirmed register fact. Today that is 0 errors and 46 warnings.
- **AEO:** questions 40–59 cover the finance pages, all answered in the HTML. Question 34 fails only on the local database, as noted in 4.2.

**Deviations:**

- **The FAQ floor is 4, not 6.** Every product has at least 4 real questions, and the owner asked not to pad.
- **There is no `financialService` schema yet.** The IFN's register facts are unconfirmed, so it would carry only a name and a URL; add it at launch with the confirmed facts.
- **"An Agrinvest number typed instead of a register key" is not automated.** A text rule cannot tell it apart from public figures. `check:figures` and the IFN review cover it.

## Phase exit

- All 29 page pairs live in RO and EN, passing `check:finance`, with every gap named.
- The simulator, checker and application tested end to end; applications readable only by `ifn` users.
- **The IFN and its lawyer approve the content.** This is outside our control, so the phase can finish building while approval stays a launch blocker.
- The owner approves the preview.

**Blockers before real applications:** the notification channel (applications appear only in the admin and applicants get no email, as `notifyLead` stays a no-op), the lawyer's consent wording, and a real `ifn` user account.

## Out of scope

Document upload and private storage, application status tracking (Phase 9); price tool and diesel pages (Phase 5); `/ghiduri` pillars and `/autori` pages (Phase 6); pay at harvest in checkout; choosing a notification channel (owner).

## Critical files

- **New:** `src/collections/{FinanceProducts,Guides,FinanceApplications}.ts`, `src/lib/finance/*`, `src/lib/content/finance.ts`, `src/components/templates/Finance*.tsx`, `src/app/(frontend)/[locale]/{finantare,financing}/`, `scripts/finance/*`, `scripts/checks/finance.ts`, `data/finance/`.
- **Changed:** `src/collections/Users.ts`, `src/access/index.ts`, `src/blocks/index.ts`, `src/i18n/routes.ts`, `src/lib/schema/index.ts`, `src/lib/seo/sitemap.ts`, `src/app/llms.txt/route.ts`, `src/lib/revalidate.ts`, `scripts/seed/data.ts`, `scripts/checks/seo.ts`, `scripts/deploy/prepare-database.sh`, `lighthouserc.json`, `docs/audit/{ifn.md,keyword-map.csv,figures-register.md,aeo-queries.md,agrinvest-inputs.md}`.
- **Reused:** `scripts/products/view.ts`, `src/lib/commerce/anaf.ts`, `src/lib/leads/{rate-limit,routing}.ts`, `src/fields/index.ts`, `FactMark`, `FactText`, `Faq`, `FactTable`, `buildMetadata`.

## Verification

- **Each sub-phase:** the `CLAUDE.md` definition of done (typecheck, lint, format, build, `test:int`, `test:e2e`, `check:seo` with 0 errors) and stories for new components.
- **Integration:** a non-`ifn` user can't read applications; apply leaves admin edits alone; `LoanOrCredit` omits unconfirmed values; simulator never gives more than 2 instalments a year; checker output never contains approval wording; `check:finance` fails on a thin page, a near-duplicate page and a forbidden claim.
- **e2e:** every finance template returns 200 in RO and EN; simulator and checker work with JavaScript off; application reaches the admin with a reference, as company and as PFA; ANAF failure falls back to manual entry.
- **Run:** `npm run seed && npm run build && npm start`, then `check:seo`, `check:finance`, `check:figures`, `check:aeo`, Lighthouse CI, `review:shoot` at 390 / 768 / 1440 in RO and EN, and the Rich Results Test on the preview.

## Sources

- [Agrointel, 03.06.2026: credit up to 10 years](https://agrointel.ro/351887/agrinvest-credit-ifn-sa-schimba-regulile-in-agricultura-credite-pana-la-10-ani-si-reducere-a-dobanzii-de-pana-la-10-an-pentru-cei-disciplinati)
- [Agro TV interview with the CEO, 16.06.2026](https://www.youtube.com/watch?v=fQKJGx5ZAbU)
- [Old IFN page](https://agrinvest.ro/servicii-ifn/)
- [Revista Ferma: APIA certificate rules 2026](https://revista-ferma.ro/plati-apia-2026-pentru-care-puteti-lua-bani-in-avans-cu-adeverinta-apia/)
- [OUG 50/2010](https://legislatie.just.ro/Public/DetaliiDocument/119472)
- [FGCR: Creditul Fermierului](https://fgcr.ro/produse/creditul-fermierului/)
- [Agricover credit FAQ](https://agricover.ro/finantare/agricover-credit), [Card FERMIER](https://agricover.ro/my-agricover-4)
- [CEC: land credit](https://www.cec.ro/credit-achizitie-terenuri-agricole)
- [Finanțare Agro: cofinancing guide](https://finantareagro.ro/articol/credite-cofinantare-plantatie)
- [Profit.ro: Banca Transilvania line](https://www.profit.ro/povesti-cu-profit/financiar/banci/agrinvest-credit-ifn-se-finanteaza-de-la-banca-transilvania-20746925)
- ANAF public VAT service, CUI 41531140, queried 2026-11-05
