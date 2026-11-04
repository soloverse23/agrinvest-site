# Agrinvest design system

Calm, precise and professional. Cinematic real footage of Agrinvest's own fields and bases, deep forest green with the lime of the logo, restrained shapes, one highly legible type family, and the numbers farmers need shown first.

Code: `design-system/` (Storybook: `npm run storybook`). Direction: `docs/decisions/0002-design-direction.md`. Craft rules and review rubric: `docs/design-review/`.

## Tokens

`design-system/tokens/tokens.css` is the only source of colour, type, radius, shadow, breakpoints and easing. Tailwind's own palette, fonts, radii and shadows are cleared, so only these exist. Components use them through utilities: `bg-paper`, `text-muted`, `rounded-lg`, `shadow-raised`, `text-h2`.

**No arbitrary values** (`text-[13px]`, `bg-[#fff]`). If a value is missing, add a token.

### Colour

| Role                      | Tokens                                                    | Rule                                                                                     |
| ------------------------- | --------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| Page, tinted areas, cards | `paper`, `surface`, `raised`                              | Cards are `raised` on `paper`; tinted panels are `surface`.                              |
| Text                      | `ink`, `muted`, `subtle`                                  | `subtle` only for captions and placeholders.                                             |
| Lines                     | `line`, `line-strong`, `field-line`                       | `field-line` for input borders (3:1).                                                    |
| Action                    | `accent`, `accent-hover`, `accent-soft`, `on-accent`      | One primary action per view.                                                             |
| Brand                     | `forest`, `forest-raised`, `on-forest`, `on-forest-muted` | Hero, finance and other brand bands.                                                     |
| Logo lime                 | `lime`, `lime-hover`, `lime-soft`                         | Fills and CTAs on forest; crop discs and dose chips as `lime-soft`. Never text on paper. |
| Price movement            | `up`, `down`, `flat` (+ `-soft`)                          | Always with ▲▼ and a sign, never colour alone.                                           |
| States                    | `warning`, `info`, `danger` (+ `-soft`)                   | States only, never decoration.                                                           |

`npm run check:contrast` checks every text/background pair the components use against WCAG AA (31 pairs). Add a pair when a component puts a new colour on a new background.

### Type

- **Onest** (variable, OFL), for headings, text and figures. The site serves one file cut to Romanian + English (`npm run brand:font`, 29 KB) with metric-matched fallbacks; Storybook uses `@fontsource-variable/onest`. Chosen for legibility: large x-height, open shapes, clear `Il1` and `0O`; checked for ș ț with comma below and tabular figures (`npm run check:fonts`).
- Scale: `display`, `h1`–`h4`, `lead`, `body` (17 px), `small`, `caption`, and `figure` for big numbers. Headings are fluid between 390 and 1440 px.
- Weights: 400 text, 500 labels, 600 headings, figures and buttons.
- `tabular-nums` on every number that is compared or updates (prices, tables, stats).
- Labels are sentence case. No uppercase mono labels.

### Shape and elevation

- Radius (restrained): `xs` 4 (tags in tables), `sm` 6 (badges, chips), `md` 8 (buttons, inputs), `lg` 12 (cards, tables), `xl` 16 (feature bands). `full` only for status dots and step markers, never for buttons.
- Shadows are soft and green-tinted: `soft` (cards at rest), `raised` (cards on hover, tables), `floating` (menus). Cards use a faint `ring-line` edge with a soft shadow, not hard borders.

### Cinematic hero

Only on the home, brand and story pages. Full-bleed footage, the height of the screen; the site header (`tone="overlay"`) sits transparent over the image. Neutral charcoal scrims (top for the header, bottom and left for the text), never a green wash. The photo settles slowly (`animate-hero-settle`, 30 s); reduced motion turns it off. Headline in `text-hero`, one accent phrase in lime. Today's prices run along the bottom of the image.

### Layout

Breakpoints `md` 768, `lg` 1024, `xl` 1440. Page width `max-w-page` (82 rem), reading width `max-w-text` (42 rem); measures `max-w-sm`, `xl`, `2xl`–`5xl` for headlines, leads and panels (the tokens clear Tailwind's defaults, so only these exist). Spacing uses Tailwind's 4 px scale.

### Motion

150–300 ms with `ease-enter` / `ease-exit` / `ease-move`. Motion shows a change of state: hover lift on cards, the arrow nudge on buttons, press scale. `prefers-reduced-motion` turns transitions off.

## Voice and formatting

`src/lib/format.ts` (tested in `tests/int/format.int.spec.ts`):

- Romanian: `1.020 lei/t`, `212,5 g/l`, `12,5%`, `2 nov. 2026`. English: `1,020 lei/t`, `2 Nov 2026`.
- A number and its unit never wrap apart (no-break space). Changes always carry a sign: `+15`, `−10` (true minus), `±0`.
- Pack sizes use a capital L (`10 L`); doses keep `l/ha`.
- Romanian text always uses ș ț with comma below.

## Components

| Layer      | Components                                                                                                                                                                                                                                                       |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Brand      | `LogoMark` (colour, mono), `Lockup`                                                                                                                                                                                                                              |
| Icons      | Crops (wheat, barley, maize, sunflower, rapeseed); UI (arrow, chevron, menu, check, phone, cart); operations (silo, truck, pin, leaf). 24 px grid, 1.75 stroke.                                                                                                  |
| Primitives | `Button` (primary, secondary, ghost, lime, on-dark; sm/md/lg), `Badge`, `Delta`, `TextField`, `SelectField`, `SegmentedControl`                                                                                                                                  |
| Patterns   | `SiteHeader` (price ticker, mega menu by need), `SiteFooter`, `Hero` (prices or entry points by need), `PriceTile`, `PriceTable`, `ProductCard`, `FigureStrip`, `FinanceBand`, `BaseMap`, `FactTable`, `LeadForm`, `VideoEmbed` (click to load), `ConsentBanner` |
| Sections   | `SectionHeading`, `Kicker`, `PageHeader`, `Breadcrumbs`, `Updated`, `KeyFacts`, `Accordion` (FAQ), `ServiceGrid`, `Steps`, `CtaBand`, `Callout`, `StorySection`, `ContactCards`, `Toc`                                                                           |
| Pages      | `Pages/Home` sketch                                                                                                                                                                                                                                              |

Server components by default. Client components: `SegmentedControl`, `LeadForm` (loaded only on pages with a form, through `LeadFormLazy`), `VideoEmbed`, `MegaMenu` (desktop navigation with hover intent: a neighbour crossed on the way to a panel does not steal it) and `BaseMap` (county hover and tap cards). The mobile menu and the FAQ use `<details>` and need no JavaScript.

Long text from the CMS uses the `prose-agr` class (tokens.css). Logo and map outlines are static SVG files (`public/brand`, `public/maps`), not inline markup, so pages stay light.

## Imagery

Real Agrinvest people, bases, trucks and fields; no stock or AI images. Photos sit in rounded frames (`rounded-xl`); text over a photo always has a forest scrim. Product packshots sit on `surface` with `mix-blend-multiply`, so white backgrounds disappear.

## Review

`npm run build-storybook && npm run review:shoot` screenshots every story at 390 / 768 / 1440 px in RO and EN, and fails on horizontal scroll or axe (WCAG 2.1 A/AA + best practice) violations. Score against `docs/design-review/rubric.md`.
