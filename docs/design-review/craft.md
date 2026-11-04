# Craft rules

The working rules behind every design-system decision. The rubric (`rubric.md`) scores against them.

## Tokens

- Three layers: **primitive** (raw values: `--green-700`, `--space-4`), **semantic** (roles: `--color-surface`, `--color-text-muted`, `--color-price-up`), **component** (rare, only when a component needs a value no role covers).
- Components use semantic tokens only. Primitives never appear in components.
- Every value in a component comes from a token: colour, size, space, radius, shadow, duration, easing, font.
- One accent colour. Semantic colours (success, warning, danger, info) are for states, never decoration. Data colours are a separate set, chosen for charts and price movement, and tested for colour-blind separation.

## Type

- Two families at most, plus tabular figures for data. A third face only for a specific job (for example a mono for SKUs).
- Modular scale with ratio 1.2 (text) to 1.333 (display), fluid between 390 px and 1440 px with `clamp()`. Body text is never below 16 px.
- Line length 60–75 characters for reading text; tables and data may be denser.
- Line-height: 1.5 for body, 1.1–1.2 for display, 1.3 for UI labels.
- Romanian: ș ț with comma below in every face; test capitals (Ș Ț) at display sizes, where a cedilla substitute is most visible.
- Numbers: tabular figures in tables, prices and anything that updates; Romanian formats (`1.020 lei/t`, `12,5%`, `2 nov. 2026`).

## Space and layout

- A 4 px base, with a scale that doubles at the larger steps (4, 8, 12, 16, 24, 32, 48, 64, 96, 128).
- 12-column grid with fixed gutters; content aligns to columns, not to the centre by default.
- Section rhythm comes from the scale; no one-off margins.
- Density is a feature: farmers and buyers compare numbers. Avoid large empty cards around small content.

## Colour

- Text contrast WCAG AA at least (4.5:1 body, 3:1 for large text and UI boundaries).
- Paper is not pure white; ink is not pure black. Both are tuned to the direction.
- Price up/down is never colour alone: always ▲▼ and a sign.

## Motion

- Durations: 120 ms (micro: hover, press), 200 ms (small: menus, tooltips), 320 ms (medium: dialogs, panels), 600–900 ms (cinematic only).
- Easing: `cubic-bezier(0.2, 0, 0, 1)` for entering, `cubic-bezier(0.4, 0, 1, 1)` for leaving, `cubic-bezier(0.2, 0, 0.2, 1)` for moving.
- Motion explains a change of state; it never decorates.
- `prefers-reduced-motion`: cross-fades only, no movement, no autoplaying video.
- Where motion is allowed: hover and focus states, disclosure (menus, accordions, dialogs), count-up figures and hero video on home, brand and story pages. Not on shop, tool or finance pages beyond the UI states.

**Motion failure modes:** animating on scroll for everything; stagger longer than 400 ms in total; parallax on text; layout shift caused by entrance animations; animation that delays reading a price; looping motion beside text being read.

## Imagery

- Real Agrinvest people, bases, trucks and fields. No stock photos, no AI images.
- One photo treatment per direction (colour grade, crop logic), applied consistently.
- Video: poster frame first; plays only when it adds something; muted loop ≤ 8 MB; a 720p version for mobile.

## The anti-"AI look" rules (ROADMAP §1.6)

Reject on sight:

- gradient blobs and mesh backgrounds;
- glass cards, glow and heavy blur;
- emoji or generic icon-in-a-circle feature rows;
- the generic "hero + three cards + CTA band" page;
- centred everything, equal-weight sections, oversized rounded corners on every surface;
- invented numbers or vague claims ("leading solutions").

Aim for: real photography and real numbers; an editorial grid with deliberate asymmetry; restrained motion; dense, useful information; typography doing the hierarchy work.
