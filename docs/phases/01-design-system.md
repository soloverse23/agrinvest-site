# Phase 1: design system

Status: **1.1 done; 1.2 foundations and a first set of 1.3–1.4 components built (2026-11-03), waiting for the owner review.** Plan approved on 2026-11-02.

## Context

Phase 0 is built: the Next.js 16 + Payload 3 scaffold, an empty `design-system/` (only `tokens/tokens.css`, a placeholder), Storybook 10 with the a11y addon (`test: 'error'`), Tailwind v4, CI, and the audit in `docs/audit/`. Phase 1 builds the complete design system before any page exists (ROADMAP §Phase 1). The roadmap splits it into sub-phases, each run in its own session: **1.1 direction → 1.2 foundations → 1.3–1.4 components → 1.5 templates**. This plan details **1.1** (executed now) and sets scope, deliverables and exit for 1.2–1.5 (each re-planned in detail when it starts).

Decisions taken in this session:

- **Logo:** keep the existing mark (lime "A" + darker leaf). Rebuild it as an exact vector ourselves. Directions derive calmer, formal greens from it.
- **Fonts:** free / open-source (OFL) only, self-hosted.
- **Boards:** coded pages in Storybook with real fonts, real Romanian text and audit data. The winning direction becomes the token seed.
- **Motionsites skill is not on this machine:** we write our own craft notes, rubric and screenshot script.

## Setup (start of execution)

- Branch `phase-1/design-system` in `site/`.
- Save this plan as `site/docs/phases/01-design-system.md` and keep it updated per sub-phase.
- Phase 0's owner review (keyword map, redirect map, figures register) and the Vercel link are still open. They do not block 1.1. A published Storybook preview (a Phase 1 deliverable) needs the Vercel link before the 1.5 gate.

---

## 1.1 Direction (detailed)

### A. Logo as vector

- Hand-trace `../src/assets/agrinvest-logo.png` (the only source, ~300 px) into SVG paths: the "A" body, the leaf, the leaf's light vein. Sample the exact greens from the PNG.
- Outputs in `design-system/brand/`: `logo-mark.svg` (full colour), `logo-mark-mono-dark.svg`, `logo-mark-mono-light.svg`, plus a React `LogoMark` component with a story.
- Check: `scripts/checks/logo-diff.ts` renders the SVG with `sharp` (already a dependency) at 300 px and pixel-diffs it against the PNG; target < 2% mismatch, plus a visual overlay story.
- There is no wordmark in the source. Each direction shows "AGRINVEST" set in its own display font as a **proposal**. Add "original vector logo files" to `docs/audit/agrinvest-inputs.md`; if Agrinvest sends them, they replace our trace.

### B. Review tooling (replaces Motionsites)

- `docs/design-review/craft.md`: token layering, type scale ratios, measure, easing curves and durations, motion failure modes, the anti-"AI look" rules from ROADMAP §1.6.
- `docs/design-review/rubric.md`: 10 scored criteria (0–10): hierarchy, typography, Romanian diacritics, contrast/accessibility, information density, grid and asymmetry, imagery, restraint (anti-AI rules), brand fit, RO/EN parity. A pass is an 8+ average with no criterion below 6.
- `scripts/checks/shoot.ts`: Playwright (already installed) opens Storybook story iframes (`/iframe.html?id=…&globals=locale:ro`) at 390 / 768 / 1440 and writes PNGs to `docs/design-review/shots/<date>/` (gitignored except the final set). npm script: `review:shoot`.

### C. Font shortlist

- Candidates (OFL, self-hosted via `@fontsource-variable/*` so Storybook and Next share one source):
  - Serif display/text: Newsreader, Source Serif 4, Literata, Fraunces, Spectral.
  - Sans: IBM Plex Sans, Public Sans, Instrument Sans, Libre Franklin, Schibsted Grotesk.
  - Data: IBM Plex Mono or the sans with `tnum`.
- `scripts/checks/fonts.ts` (dev dependency `opentype.js`): for each font file, assert glyphs for U+0218–U+021B (Ș ș Ț ț, comma below) and a `tnum` feature. A specimen story shows "Știri, prețuri, țară — ȘȚ" and "1.020 lei/t · 12,5%" with tabular figures at each size.
- Drop any family that fails.

### D. Three directions

Each direction is scoped CSS variables under `[data-direction="a|b|c"]` in `design-system/directions/<name>/direction.css` (temporary; only the winner survives into 1.2).

|             | A — "Registru" (editorial)                                  | B — "Câmp" (agronomic, technical)            | C — "Recoltă" (institutional, cinematic)                     |
| ----------- | ----------------------------------------------------------- | -------------------------------------------- | ------------------------------------------------------------ |
| Feel        | Ledger and newspaper: hairline rules, strong editorial grid | Instrument panel: dense, precise, data-first | Calm and confident: large photography, generous space        |
| Type        | Serif display + grotesk text                                | One grotesk family + mono/tabular for data   | High-contrast serif display + humanist sans                  |
| Paper / ink | Warm off-white, near-black ink                              | Cool white, graphite ink                     | Cream, charcoal                                              |
| Accent      | Deep forest green from the leaf                             | The leaf green, slightly desaturated         | Dark green, with the logo lime used sparingly as a highlight |
| Photos      | Natural, warm, documentary crops                            | Documentary, cooler, tighter crops           | Full-bleed golden hour, scrim for text                       |

Each board (one Storybook story per direction, plus a side-by-side compare story) shows:

1. Type pairing and scale specimen, palette swatches with AA contrast values, logo + wordmark proposal.
2. Photo treatment: frames from the 2022 brand film and the Golden Relationship videos (pulled with yt-dlp into `data/raw/frames/`, gitignored; for internal review only until footage rights are confirmed).
3. Hero sketch (homepage, RO and EN headline).
4. Product card: a real product from `docs/audit/products-raw.json` (e.g. a herbicide, with dose and active ingredient).
5. Price table: wheat, corn, sunflower, rapeseed, barley × 3 real bases from `figures-register.md`, with ▲▼ deltas; numbers clearly marked "sample".

- Storybook gets a locale toolbar global (RO/EN) in `.storybook/preview.ts`; all copy lives in a per-board `copy.ts` with both languages.
- Text follows the CLAUDE.md rules: ș/ț with comma below; numbers in Romanian format.

### E. Review and choice

- Run `review:shoot`, score each board with the rubric, iterate until each scores 8+.
- Present the three boards with screenshots and scores. **You choose one or a mix** (AskUserQuestion).
- Record the outcome in `docs/decisions/0002-design-direction.md`: chosen direction, fonts, accent greens, photo rules, the rejected options and why.

**1.1 exit:** you approve the direction; 0002 is written; the logo SVG passes the diff check; the fonts pass the glyph check.

---

## 1.2 Foundations (next session)

- `design-system/tokens/tokens.css` in two layers: primitives (`--green-700`, `--paper-50`…) and semantic tokens (`--color-surface`, `--color-accent`, `--color-price-up`…). Exposed to Tailwind through `@theme`, with Tailwind's default palette cleared so only tokens exist. Dark tokens under `[data-theme="dark"]` (for the panel).
- Areas as in ROADMAP §1.2: colour (with data colours), fluid type scale (`clamp`), space, 12-column grid, breakpoints 390/768/1024/1440, radius, elevation, motion (durations, easings, reduced-motion policy, where motion is allowed).
- Custom line-icon set in `design-system/icons/` (SVG source → React components): crops, inputs, operations, UI.
- Voice and formatting: `docs/design-system.md` (voice, imagery, video rules) and `src/lib/format.ts` (`ro-RO` / `en-GB` prices, units, percentages, dates) with Vitest tests.
- Governance: `scripts/checks/contrast.ts` (every text/surface pair is AA) and an ESLint rule that bans arbitrary Tailwind values and inline colours/sizes. Both run in CI. `design-system/CHANGELOG.md`.
- Wire the fonts into `src/app/(frontend)/[locale]/layout.tsx` and Storybook.
- **Exit:** token stories approved; contrast and lint checks pass in CI.

## 1.3 Primitives and 1.4 Patterns (one or two sessions)

- The component lists in ROADMAP §1.3 and §1.4, in `design-system/primitives/` and `design-system/patterns/`.
- Each component gets a story with all states, an a11y note and RO/EN examples. Server components by default; client only for real interactivity (Dialog, Tabs, Tooltip, Toast, calculators).
- Charts: server-rendered SVG with no heavy chart library (exact choice recorded as decision 0003 in that session).
- Visual regression: Playwright `toHaveScreenshot` over the stories, added to CI.
- **Exit:** every listed component has a story and passes a11y and visual tests.

## 1.5 Templates

- The 12 templates from ROADMAP §1.5, built as Storybook page stories from patterns plus fixtures in `design-system/fixtures/` (audit data, labelled as sample).
- Screenshot review at 390/768/1440 in RO and EN with the rubric.
- Storybook published as a Vercel preview (needs the Vercel link from Phase 0).
- **Exit (= Phase 1 exit):** you approve the templates; every template scores 8+ on average; `docs/design-system.md` is complete.

---

## Critical files

- New: `design-system/brand/*`, `design-system/directions/*`, `docs/design-review/{craft,rubric}.md`, `scripts/checks/{shoot,fonts,logo-diff}.ts`, `docs/decisions/0002-design-direction.md`, `docs/phases/01-design-system.md`.
- Changed: `.storybook/preview.ts` (locale global, fonts), `package.json` (scripts; `@fontsource-variable/*` and `opentype.js` dev dependencies), `.gitignore` (shots, frames), `docs/audit/agrinvest-inputs.md` (vector logo request).
- Reused: `docs/audit/products-raw.json`, `figures-register.md`, `social-inventory.md` (video list), `.storybook/main.ts` story glob (`design-system/**/*.stories.tsx`).

## Verification (1.1)

- `npm run typecheck`, `lint`, `format:check`, `build-storybook` pass; the Storybook a11y addon reports no errors on any board.
- `tsx scripts/checks/logo-diff.ts` is under the threshold; `tsx scripts/checks/fonts.ts` passes for the chosen families.
- `npm run review:shoot` produces 3 directions × 3 widths × 2 locales; each board scores 8+ on the rubric.
- Your choice is recorded in decision 0002.

---

## 1.1 progress (2026-11-03)

**Built**

- Logo: `design-system/brand/` (`logo-mark.svg`, mono dark/light, `LogoMark` component + stories). Shape mismatch against the source PNG: 0,18% (`npm run check:logo`).
- Review tooling: `docs/design-review/craft.md`, `rubric.md`; `npm run review:shoot` (screenshots + horizontal-scroll check + axe accessibility check).
- Fonts: `npm run check:fonts`, 10/10 candidates pass.
- Three boards + compare view: `design-system/directions/` (Storybook `Directions/*`), RO/EN via the Locale toolbar.
- Review: `docs/design-review/reviews/2026-11-03-directions.md`. A 8,4 · B 8,2 · C 8,2; no overflow, no axe violations.

**Deviations from the plan**

- Logo: built as clean geometry from measured coordinates (`scripts/brand/build-logo.ts`: straight-edged A, Catmull-Rom leaf curves, knockout halo and vein), not hand-traced paths. A potrace trace was tried first and dropped: too wobbly at 300 px.
- The diff check compares colour classes (paper / lime / leaf) and ignores the source's 1 px anti-aliased edge; a raw RGB diff measures the source's blur, not the shape.
- Fonts are checked with `fontkit` (reads WOFF2), not `opentype.js`. "Tabular" accepts a `tnum` feature or digits that are tabular by default. Fraunces and Libre Franklin were dropped (no tabular figures).
- Video frames: `scripts/brand/frames.ts` uses yt-dlp (WebM, video only) and Playwright's Chromium to grab frames; no ffmpeg needed.
- The Storybook serves `data/raw/frames` and `data/raw/media/products` only when they exist (local only).
- Owner feedback (2026-11-03): cream papers whitened (A `#fcfbf8`, C `#fbfaf6`).

**Outcome:** the owner chose **B "Câmp"** on 2026-11-03; recorded in `docs/decisions/0002-design-direction.md`. 1.1 exit met (direction approved, 0002 written, logo diff and font checks pass).

## 1.2 + first components (2026-11-03)

Started straight after 1.1 at the owner's request ("still looks AI-made; more legible fonts, rounder, warmer"), in the same session rather than a new one.

**Built**

- Tokens: `design-system/tokens/tokens.css` (Tailwind v4 `@theme`, defaults cleared). Rules: `docs/design-system.md`. Decision 0002 revised (Onest, round shapes, soft shadows, forest + lime).
- Formatting: `src/lib/format.ts` + tests.
- Icons: `design-system/icons/icons.tsx` (crops, UI, operations).
- Primitives: Button, Badge, Delta, TextField, SelectField, SegmentedControl.
- Patterns: SiteHeader, Hero, PriceTile, PriceTable, ProductCard, FigureStrip, FinanceBand. Page: `Pages/Home` sketch.
- Checks: `npm run check:contrast` (31/31 AA pairs); `review:shoot` now also runs axe and skips hidden elements; `check:fonts` now covers the shipped font only.
- Verified: typecheck, lint, format, `next build`, Vitest (6), Playwright e2e (6), Storybook build; 138 screenshots with no horizontal scroll and no axe violations.

**Not done yet (rest of 1.2–1.4)**

- Lint rule that bans arbitrary Tailwind values (the rule is followed but not enforced yet).
- Dark tokens for the panel; motion whitelist doc; `design-system/CHANGELOG.md`.
- Remaining components from ROADMAP §1.3–1.4 (Tabs, Accordion, Tooltip, Dialog, Toast, charts, DoseTable, SpecSheet, WeatherCard, BaseMap…), and visual-regression tests.
