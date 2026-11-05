# Phase 4

## Finance (Agrinvest Credit IFN)

Status: **4.1, 4.2, the owner's corrections and 4.3 Batches 1 and 2 are committed on `phase-4/finance`. Batch 3 next.** Plan approved 2026-11-05. Sub-phases run in order: 4.1 confirmation → 4.2 model → 4.3 content → 4.4 tools → 4.5 and 4.6 cross-selling, SEO and gate. Decisions: `docs/decisions/0007-finance.md`.

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

**Not built yet:** Batch 3 (`credit-contracte-cereale`, `finantare-stocuri`, `subventii-apia`, `inputuri-plata-la-recolta`, `industrie-alimentara`, `restructurare`). Pages link to the lead form for now: the simulator and application come in 4.4.

**Deviations:** `despre-ifn` and the FAQ are Guides with section `pagina-finantare`, served by fixed routes, so they reuse the apply step. The FAQ has 20 questions, not 40: the rest would have repeated the product pages. Claims with no source (second-hand machinery, dryers, breeding animals) were taken out and added to the IFN form.

**Owner's changes:** the eligibility checker and the documents page are deferred, and no indicative document list is published anywhere. Product pages say the team gives the list after the first conversation. Keyword rows for `/finantare/eligibilitate` and `/finantare/documente` stay in the map as unbuilt.

**Length:** the owner dropped the word floors: a page is as long as its sources support. `check:finance` only catches near-empty pages.

**Sources:** interest in insolvency is art. 80 of Law 85/2014 (with art. 103), not art. 79 as noted earlier; guarantors are art. 75(2)(b). APIA's convention list still could not be read, so no page says whether Agrinvest takes part. Statements from Agro TV interviews are used only as general advice, unattributed, until checked against the audio and the IFN allows quoting. Guides are signed by "Agrinvest Credit IFN", with no named person, until the same permission.

**Results (Batches 1 and 2):** typecheck, lint, format, `next build`, `test:int` (126), `test:e2e` (72), `check:seo` (402 pages, 0 errors; it now fails on a raw `{{KEY}}` anywhere). Keyword map: 66 of 102 target URLs built. On an empty database: migrations, seed and apply run clean and a second apply changes nothing. A test rebuilds the page a live site has from the first seed, and the hub replaces it without a false conflict.

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
