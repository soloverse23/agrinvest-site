# 0006 Shop: own carts and orders, pilot products shown with their price

- Status: accepted
- Date: 2026-11-04
- Updates: `0001-stack.md` (the Payload ecommerce plugin is no longer used)

## Context

Decision 0001 counted on Payload's official ecommerce plugin. Its documentation marks it as beta, lists Stripe as the only payment adapter, and leaves shipping and taxes to the project. Agrinvest's flow needs proforma, company-number lookup, e-Factura and certificate capture, so most of it would be custom in any case. Agrinvest has not yet chosen payment methods, an invoicing system or delivery zones.

## Decision

- **Carts and Orders are our own Payload collections.** Payment, invoicing, delivery and notification sit behind small interfaces in `src/lib/commerce/`, with working defaults until providers are chosen.
- **Checkout offers consultant contact for payment options.** An order is a request: no money is taken online in this phase, and a consultant confirms stock, price and payment.
- **Pilot products are shown in full with their current price**, replacing the roadmap's "hidden or request a quote".
- `pilot` still means "not confirmed by Agrinvest": the price carries the "de confirmat" marker while the site is noindex, Product JSON-LD leaves out the Offer, and `check:products` fails on pilot products when `SITE_INDEXABLE=true`.

## Consequences

- We maintain the cart and order code ourselves, with no dependency on a beta package.
- Orders appear only in the admin until the owner picks a notification channel. This must be solved before real orders are accepted.
- The owner can change the launch rule for pilot products before Phase 8.
- OUG 53/2025 is enforced in code (`orderBlock`): a stopped, expired, unregistered or GHS06 product cannot go in the cart, and protection products need an 18+ confirmation. A missing registration number blocks ordering even for `pilot` products, which narrows "pilot products can be ordered" above; entering the number in the admin lifts it.
