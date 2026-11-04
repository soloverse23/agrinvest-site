# Agrinvest design system

Rules and usage: `docs/design-system.md`. Direction: `docs/decisions/0002-design-direction.md`.

- `tokens/`: `tokens.css`, the single source of colour, type, radius, shadow and motion, exposed to Tailwind through `@theme`.
- `brand/`: the logo mark (rebuilt by `scripts/brand/build-logo.ts`).
- `icons/`: the line-icon set.
- `primitives/`: base components (Button, Badge, Delta, fields, SegmentedControl).
- `patterns/`: composed components (SiteHeader, Hero, PriceTile, PriceTable, ProductCard, bands).
- `pages/`: patterns composed into page sketches.
- `fixtures/`: sample RO/EN content for stories.

Rule: styling comes only from tokens. No hard-coded colours, sizes or font stacks, and no arbitrary Tailwind values.
