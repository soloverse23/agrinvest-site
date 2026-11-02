# 0001 Stack: Next.js + Payload CMS 3 + Postgres

- Status: accepted
- Date: 2026-11-02

## Context

agrinvest.ro and agrinvestshop.ro (both WordPress) are replaced by one new site. It needs: first-rank SEO in Romanian and English, a full shop with structured product data, staff-entered data (grain prices, products, finance products), farmer tools, an article engine, social-media sync, and later an admin panel that non-technical staff use every day.

## Decision

- **Next.js 16 (App Router, React Server Components)**: pages are rendered on the server and are static or ISR, so search engines get complete HTML and the client JavaScript stays small.
- **Payload CMS 3**, running inside the same Next.js app: field-level RO/EN localization, drafts and versions, role-based access, a jobs queue for scheduled syncs, and an official ecommerce plugin. Its admin is the base of the Phase 9 staff panel, so there is no later content migration.
- **Postgres** (Neon in production, Docker locally); media on S3-compatible storage (Cloudflare R2).
- **Vercel** hosting (preview per branch, region fra1); cron for scheduled jobs.
- **Tailwind v4 driven by design-system tokens**, with Storybook as the component workbench.
- **Quality gates:** TypeScript strict, ESLint, Prettier, Vitest, Playwright, Lighthouse CI budgets.

## Alternatives considered

- **Astro + git-based CMS** (used in the HamidHosseini project): the best static performance, but the staff panel and the commerce flows would need a second system and a content migration later.
- **Keeping WooCommerce headless**: rejected because the old sites are fully retired.

## Consequences

- Node 24.22+ is required (Payload 3.92 engines); pinned in `.nvmrc`.
- Next.js 16 renamed middleware to `proxy` (`src/proxy.ts`).
- Locale routing: Romanian unprefixed, English under `/en`, `/ro/*` → 308 to the unprefixed URL.
