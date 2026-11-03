# 0002 Design direction: B "Câmp" (agronomic, precise, data-first)

- Status: accepted (owner, 2026-11-03); revised the same day, see below
- Date: 2026-11-03

## Context

Phase 1.1 compared three directions on the same real content (Storybook `Directions/*`, review in `docs/design-review/reviews/2026-11-03-directions.md`): A "Registru" (editorial ledger), B "Câmp" (agronomic instrument panel), C "Recoltă" (institutional, cinematic). All three passed the rubric (A 8,4 · B 8,2 · C 8,2). The owner chose B.

## Decision

The design system (Phase 1.2 onwards) is built on direction B:

- **Type:** IBM Plex Sans (variable) for display, text and UI; IBM Plex Mono for figures, units, labels and SKUs. Plex Sans digits are tabular by default. Both pass `npm run check:fonts` (ș ț comma below, Romanian alphabet, tabular figures).
- **Colour (seed for the tokens):** paper `#fafbfa`, surface `#eef2ef`, ink `#15201b`, muted `#4f5b55`, rule `#d5ddd8`, accent `#0b7546` (the leaf green, desaturated) with white text on it, highlight `#a8cf44` (logo lime) as a fill only, never as text on the accent; up `#0b7546`, down `#b3361f`. All text pairs are AA (lowest 5,1:1).
- **Shape:** 4 px radius; hairline borders instead of shadows.
- **Photos:** documentary, tight crops, cooler grade (`saturate(0.82) contrast(1.06) brightness(1.02)`); real Agrinvest footage only.
- **Patterns carried forward:** app-style header with an active-section marker; KPI strip in mono; price tiles with ▲▼, sign and sparkline; base switch (segmented control); spec-sheet product card with mono labels and the dose highlighted in lime; dense list row for listings; data tables with zebra rows and mono numbers; financing cross-sell as a lime-edged note.
- **Logo:** the rebuilt mark in `design-system/brand/`. The wordmark "Agrinvest" set in Plex Sans 600 is a proposal until Agrinvest confirms it.

## Alternatives considered

- **A "Registru":** the highest rubric score and the most formal, but less suited to the daily tools (prices, weather, calculators) that drive return visits.
- **C "Recoltă":** the strongest brand image, but lower information density; it depends on fresh footage that does not exist yet.

## Consequences

- B scored lowest on brand fit (7): it can drift towards a generic agritech dashboard. Phase 1.2 must add character on purpose: real footage, the logo greens, careful Romanian copy, and an editorial touch on content pages (articles, stories) where density matters less.
- Plex Mono is used a lot; 1.2 sets clear rules for where mono appears (figures, units, labels) so body text stays in Plex Sans.
- `design-system/directions/` is temporary: 1.2 moves B's tokens into `design-system/tokens/` and deletes the boards and the unused font packages (Newsreader, Source Serif 4, Literata, Spectral, Public Sans, Instrument Sans, Schibsted Grotesk, Source Sans 3).

## Revision (2026-11-03, owner feedback)

The owner found the first Câmp components still looked machine-made, and asked for more legible type, rounder shapes and a warmer feel. The direction (agronomic, data-first) stays; its execution changes:

- **Type:** **Onest** replaces IBM Plex Sans and IBM Plex Mono, chosen from a side-by-side test of ten legible OFL families. No mono: figures use Onest's tabular numbers, and labels are sentence case.
- **Shape:** radii 6 / 10 / 14 / 20 / 28 px and pill buttons, chips and switches, instead of 4 px everywhere.
- **Depth:** soft green-tinted shadows with a faint ring, instead of hairline boxes.
- **Brand feel:** deep forest green (`#0f3b29`) for the hero and finance bands, with the logo lime as the CTA colour on forest; custom crop icons in lime discs.
- **Palette:** paper `#fafaf7`, surface `#f1f4ee`, accent `#12784a`, lime `#b9dc5a`. All 31 text pairs are AA (`npm run check:contrast`).

Full rules: `docs/design-system.md`. The direction boards (`design-system/directions/`) and the unused font packages have been removed.

**Second revision (2026-11-03):** the owner found the shapes too round and asked for a more cinematic hero and a more professional finish. Radii reduced to 4 / 6 / 8 / 12 / 16 px (buttons 8, cards 12; full rounding only for dots and markers). The home hero is now full-bleed with an overlay header, neutral scrims, a slow settle animation, a larger headline (`text-hero`) and a price rail on the image; hero photo: the sunflower-harvest aerial. Figures became an editorial row with dividers; the finance band shows the instalments as a timeline; product cards have a flush image and a labelled spec list.
