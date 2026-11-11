# Phase 7d: fix the inner pages (one step)

Status (2026-11-11): planned and approved by the owner. Not started. Branch `redesign/inner`, cut from `main`. Check `git status` first: 7b.5 and 7c share `LeadForm.tsx`, `Lazy.tsx` and `scripts/site/navigation.ts`.

**Goal:** fix every problem in the list below. The phase is done only when every row in "The full mess list" is ticked and the acceptance checks at the end pass.

## Already done: finance tidy (2026-11-11, uncommitted)

A light pass on Finance only, with no new layout. Rows 9, 11, 13, 14 and 15 are mostly covered. Rows 10 and 12 are partly covered; the rest waits for the shell.

- **Hub:** the products are in three need groups (`src/lib/finance/groups.ts`). The blocks are reordered in `data/finance/hub.json`: intro, products, "Cum alegi", pay band, data, form. Links to the simulator, the application, Despre IFN and the FAQ are added.
- **Section links:** `FinanceNav` is a row of links on the product, guide, guide-index, simulator, application, about and FAQ pages.
- **Product pages:** a sticky side card (simulate, apply), a contents list, other loans in the same group, and links to the guides.
- **Guides:** ordered as a farmer meets the questions, with a closing simulate/apply band.
- **Menu and footer:** a wider finance panel and footer column. `refreshFinanceNav` (in `scripts/finance/entry-points.ts`) updates the live site only where the 7b links are untouched.

**Correction to row 16:** rich-text tables already scroll in their own box (`.prose-agr table` in `tokens.css`). The sideways scroll on phones comes only from the header ticker (row 1).

## Already done: the rest of the tidy (2026-11-11, uncommitted)

A second light pass on the other sections. It keeps the shell and the drawer for later and uses small, safe parts instead.

- **Section links on every inner page** (rows 6, 7, 27): `PageTitle` shows a row of the section's pages under the title. It comes from one map (`src/lib/sections.ts`) for Prices and selling, Company, and News and guides. It covers the CMS pages and the templates alike.
- **Next steps instead of the chip row** (row 5): `ToolLinks` now shows two or three steps chosen for the page (`src/components/ToolLinks.tsx`).
- **Long forms stay closed** (rows 3, 26): the request form in a page (`LeadFormBlock`, so every CMS `leadForm` block too) is a closed `<details>` with one button. A link to `#cerere` opens it (`OpenOnHash`). `/contact` keeps the open form, and the diesel form is unchanged.
- **Duplicate calculators removed** (row 4) from `/preturi`, `/preturi/{crop}` and `/cereale/{crop}`. The calculator stays on its own page and is one of the next steps.
- **`/stiri`** (row 29): the press feed shows 12 headlines (title, source, date) and a button for the rest. The page went from 9,171 px to 3,511 px.
- **Sell grain** (row 22): moved from the Company panel to the Prices panel, in the menu and the footer. `refreshSectionNav` updates a live site, only where the 7b links are untouched. The menu label stays "Prețuri și unelte" until the owner confirms "Prețuri și vânzare" (it is used by tests and by `scripts/tools/entry-points.ts`).

**Left for the shell and the drawer:** the tab bars, the sticky action bar, the mobile action bar, the `?pagina=2` feed page, the short guide-topic pages (rows 8, 25, 30, 32–34) and the article calculator (row 33). The phone overflow (row 1) comes from the old header ticker, which the home-redesign chat is replacing with `QuoteStrip`; re-check it after that lands.

## The fix (owner decisions, 2026-11-11)

1. **One page shell for every inner page:**
   - a title band: breadcrumb, H1, one line, up to 3 key facts, the main button;
   - a row of links to the section's other pages;
   - a sticky tab bar of the page's own sections (plain anchors, so all content stays in the HTML);
   - single-column content;
   - one action band at the end;
   - on phones, a bottom bar with the main button.
2. **One short request drawer** replaces every in-page lead form:
   - fields: name, phone, email, message, consent;
   - the crop, base, product or subject is filled in from the page;
   - without JS, the button is a link to `/contact?subiect=…`.
   - The price alert and the newsletter stay as small second actions.
   - Calculators stay only on their own pages. Elsewhere, a one-line link is enough.
3. **Finance by need, in 3 groups.** One path: Simulator → Cerere.
   - Money for the season: production, inputs at harvest, APIA, grain contract.
   - Investments: the investment credit and its 5 children.
   - Special cases: stock financing, food industry, restructuring.
4. **Grain: two roles.**
   - `/preturi/{crop}` = the numbers and the price alert.
   - `/cereale/{crop}` = how we buy.
   - Both share one "Cere prețul" button.
   - The menu item "Prețuri și unelte" becomes "Prețuri și vânzare" and takes in Sell grain from Company.

**No URL changes.** FAQ markup, JSON-LD, canonical and hreflang stay as they are.

## The full mess list

This comes from the audit of 40 inner pages at 1366 and 390 px on 2026-11-11. Every row must be fixed. RO and EN behave the same.

### Site-wide

| #   | Problem                                                                                                                                                                                                                                    | Fix                                                                                                                                                                                |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **Every page scrolls sideways on phones** (1,090 px wide on a 390 px screen). In the header price ticker, the absolutely positioned `span.sr-only` escapes the ticker's scroll container.                                                  | Make the ticker's scroll container `relative`, or move the sr-only text out of it. Test that `scrollWidth == clientWidth` on every page.                                           |
| 2   | Each template orders its sections in its own way, with wide empty margins and boxes floating in the middle.                                                                                                                                | Every inner template uses the `InnerPage` shell.                                                                                                                                   |
| 3   | The same 7–9-field lead form sits in the middle of 15 pages: `/finantare`, `/preturi/{crop}`, `/cereale`, `/cereale/{crop}`, `/motorina`, `/depozitare`, `/depozitare/uscare`, `/logistica`, `/parteneri`, `/cariere`, `/baze/*` and more. | Remove it; the page's main button opens the drawer. Only `/contact` (the full form), `/finantare/aplica`, `/finantare/simulator` and the calculator pages keep a form in the page. |
| 4   | The small net-price calculator is copied onto `/preturi`, `/preturi/{crop}`, `/cereale/{crop}` and guide articles.                                                                                                                         | Replace it with a `NextStep` link. The calculator stays only on `/preturi/calculator-pret-net`.                                                                                    |
| 5   | Most pages end with the same "Unelte" row of chips (a dead end).                                                                                                                                                                           | Replace it with `NextStep`: 2–3 links chosen per page type.                                                                                                                        |
| 6   | No section menu. The only way across pages is the top menu.                                                                                                                                                                                | A section strip on every inner page, from one map (`scripts/site/sections.ts`), which the menu also uses.                                                                          |
| 7   | Breadcrumbs differ between templates and are sometimes long; for example, `/cereale/grau` shows "Vinde cereale la Agrinvest".                                                                                                              | One breadcrumb component in the title band, with short labels from the section map.                                                                                                |
| 8   | Phone pages are 1.5–2.3× longer than desktop (for example `/ghiduri` 8,611 px, `/autori/*` 9,353 px), because grids stack card by card.                                                                                                    | On phones, card grids become compact lists or carousels, and long sections fold under the tab bar.                                                                                 |

### Finance (`/finantare/*`)

| #   | Problem                                                                                                      | Fix                                                                                                                                                                                                                     |
| --- | ------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 9   | Finance has 20 pages and 11 guides, but the menu shows 4.                                                    | The menu panel shows the 3 need groups as columns, plus Simulator, Cerere, Ghiduri, Întrebări frecvente and Despre IFN.                                                                                                 |
| 10  | The hub (6,684 px) stacks 8 cards, a pay band, a 15-row "Cum alegi" table, the IFN data table and a form.    | The hub becomes: title band → the 3 need groups → Simulator and Cerere → "Nu știi ce alegi?" (the 15 rows as 3 short lists) → 4 guides → FAQ. The data table moves to `/finantare/despre-ifn`, and the form is removed. |
| 11  | Three ways to ask for a loan: the hub form, old "Cere o ofertă" links and `/finantare/aplica`.               | The only way is Simulator → Cerere. Every finance button and old link points there (`linkRewrites` covers what the CMS still holds).                                                                                    |
| 12  | Every product page has 11 sections, about 5,000 px long, with nothing to navigate them.                      | Tabs: Pentru cine · Ce finanțează · Rambursare · Garanții și documente · Cum decurge · Întrebări. "Când nu este potrivit" goes into Pentru cine, Riscuri into Rambursare, and Surse moves to the end.                   |
| 13  | The simulator does not lead clearly to Cerere, and Cerere does not show where the visitor is in the process. | The simulator result has one button that carries the amount and the product. Cerere shows a progress bar: Simulare → Cerere → Răspuns.                                                                                  |
| 14  | `/finantare/intrebari-frecvente` and `/finantare/despre-ifn` cannot be found.                                | Both are in the section strip, the menu panel and the hub.                                                                                                                                                              |
| 15  | `/finantare/ghiduri` is a flat list of 11 titles.                                                            | Group the guides by need (the 3 groups plus "Cost și alegere"), each with a short summary.                                                                                                                              |
| 16  | A comparison table in a finance guide (`ifn-sau-banca`, Lexical table) overflows on phones.                  | Rich-text tables scroll inside their own box on every page.                                                                                                                                                             |
| 17  | `/finantare/ghiduri/glosar` is one 5,700 px block.                                                           | Add an A–Z letter tab bar, with each term as an anchor.                                                                                                                                                                 |

### Prices, selling grain, diesel and tools

| #   | Problem                                                                                                       | Fix                                                                                                                                                                     |
| --- | ------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 18  | `/preturi/{crop}` has 3 forms in a row: lead, alert and calculator.                                           | Tabs: Pe baze · Piața UE · Alertă. The main button is "Cere prețul" (drawer). The alert is a small second action in its own tab section. The calculator becomes a link. |
| 19  | `/preturi/{crop}` and `/cereale/{crop}` overlap: price, calculator and form on both.                          | `/preturi` shows numbers only. `/cereale` shows how we buy (tabs: Cum cumpărăm · Recepție · Baze · Plata · Întrebări). They link to each other through `NextStep`.      |
| 20  | The price card on `/cereale/{crop}` is half empty, and the reception limits float in a box next to the title. | The limits become key facts in the title band. The price card becomes one line that links to `/preturi/{crop}`.                                                         |
| 21  | `/preturi` mixes the crop list, the market note, an embedded calculator and loose links.                      | A crop grid (Agrinvest price and EU trend), then the market note in 3 lines, then fertilisers and diesel.                                                               |
| 22  | "Sell grain" sits under the Company menu.                                                                     | The menu item becomes "Prețuri și vânzare", with columns Prețuri · Vinde cereale · Unelte. The footer follows.                                                          |
| 23  | `/motorina` has a form in the middle of the page.                                                             | Tabs: Prețul Agrinvest · Prețul în România · Livrare. Its button opens the drawer (type `diesel`).                                                                      |
| 24  | `/unelte` is 6 bare cards with 98 words.                                                                      | Group the tools as Prețuri · Calcul · Finanțare, each with one line on when to use it.                                                                                  |
| 25  | `/preturi/ingrasaminte` has no explanation and ends on the chips.                                             | Add a one-line intro in the title band, a link to the shop category in `NextStep`, and a check that the tables fit on phones.                                           |

### Company and services

| #   | Problem                                                                                                                               | Fix                                                                                                                                 |
| --- | ------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| 26  | `/depozitare`, `/depozitare/uscare`, `/logistica`, `/parteneri`, `/cariere` and `/baze/*` each have a form in the middle of the page. | Each page has one main button that opens the drawer with the right type: storage, logistics, partner, career or grain at that base. |
| 27  | `/despre`, `/despre/cifre`, services and bases are not linked to each other.                                                          | Section strip: Despre · Cifre · Depozitare · Logistică · Baze · Parteneri · Cariere.                                                |
| 28  | `/contact` is one more form among many.                                                                                               | `/contact` becomes the single full form and the no-JS fallback. It reads `?subiect=` to preselect a type.                           |

### News, market note and guides

| #   | Problem                                                                                       | Fix                                                                                                                                                                               |
| --- | --------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 29  | `/stiri` is 9,171 px on desktop and 16,058 px on phones: 50+ press items with full summaries. | Agrinvest news first (3 cards). Then the press feed as a compact list of 12 items (title, source, date) and "Mai multe" (`?pagina=2`, noindex). The newsletter moves to the side. |
| 30  | A market note (`/piata/nota-*`) is 96 words that end on the chips.                            | Shell, a link to each crop price page mentioned, previous and next note.                                                                                                          |
| 31  | `/ghiduri` and `/finantare/ghiduri` are two guide entries.                                    | `/ghiduri` is the single entry, with "Finanțare" as one of its topic tiles.                                                                                                       |
| 32  | `/ghiduri/{topic}` pages are nearly empty (81–93 words).                                      | A short intro, the guides as a list, the related tool and the related shop category. No padding: 2 guides show as 2.                                                              |
| 33  | Articles embed a calculator and end with a lone question box.                                 | A contents list made from the H2s (the tab bar). The calculator becomes a link. The ending is "Citește și" + the author + "Întreabă un agronom" (drawer).                         |
| 34  | `/autori/*` is 9,353 px on phones.                                                            | A compact list of the author's articles.                                                                                                                                          |

## The step

1. **Fix rows 1 and 16 first** (phone overflow). They are small and every page is affected.
2. **Build the parts:**
   - `InnerPage`: title band, section strip, tab bar, action band, mobile bar;
   - `RequestDrawer`: the existing lead actions in a `<dialog>`, loaded through `Lazy.tsx`;
   - `NextStep`;
   - `scripts/site/sections.ts`.

   Each part gets stories.

3. **Show shots** of `/finantare`, one finance product, `/preturi/grau`, `/cereale/grau` and `/stiri` at 1366 and 390 px. Wait for the owner's OK.
4. **Fix rows 2–34,** section by section: Finance → Prices and grain → Company → News and guides. Tick each row in this doc as you go.
5. **Update the menu and footer** in `scripts/site/navigation.ts` and `scripts/finance/entry-points.ts`. Make the old entry-point scripts aware of the new menu, so they don't add items back.
6. **Update the live database:** add a step to `apply:redesign` that applies the menu change, moves the IFN table and removes the seeded `leadForm` and embedded `toolWidget` blocks, only where they still match the seed. Run it twice on old `main` data: the second run must change nothing.
7. **Gate:** see the acceptance checks below. Then the owner review, then the PR on request.

## Acceptance checks

- **The full mess list:** all 34 rows ticked.
- **Phone width (390 px):** `scrollWidth == clientWidth` on every inner URL in both locales. Add this as an e2e test that walks the sitemap.
- **Forms:** no inner page has a lead form in the page, except `/contact`, `/finantare/aplica` and the tool pages. Add this as an e2e test that counts `form` elements per page.
- **Shell:** every inner page has a breadcrumb, a section strip and one main action.
- **e2e for the drawer:** a request from finance, prices and storage; the no-JS fallback to `/contact`; Simulator → Cerere with the amount carried over; tab anchors; the mobile action bar.
- **Standard checks:** typecheck, lint, format, build and test:int.
- **SEO and budget:** `check:seo` (no new errors beyond the known 44), `check:aeo`, `check:budget` (`/finantare/aplica` ≤ 160 KB).
- **Lighthouse,** once, at the end.

## Rules

- Design tokens only. RO and EN with ș ț.
- The leads rule stays: phone and email.
- Write natural copy and never pad.
- Commit only when asked.
- Server components by default. Client code only for the drawer, the tab bar's scroll-spy and the mobile bar.

## Open points for the owner

- Is "Prețuri și vânzare" the right menu label?
- Should the drawer promise a reply time? Until there is a figure for it, the text is "în curând".
