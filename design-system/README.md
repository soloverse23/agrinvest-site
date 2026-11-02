# Agrinvest design system

Built in Phase 1 (see `docs/ROADMAP.md`). Shared by the public site and, later, the admin panel.

- `tokens/`: CSS custom properties (colour, type, space, shape, motion), exposed to Tailwind through `@theme`.
- `primitives/`: base components (Button, Field, Table, Price…), each with a Storybook story.
- `patterns/`: composed components (Header, ProductCard, PriceBoard, DoseTable…).

Rule: styling comes only from tokens. No hard-coded colours, sizes or font stacks in components.
