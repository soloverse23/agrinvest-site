# 0007 Finance section: content before confirmation, no upload

- Status: accepted (owner, 2026-11-05)
- Date: 2026-11-05

## Context

Phase 4 needs about 30 pages of finance content, but the IFN has answered none of the questions in `docs/audit/ifn.md`, and Agrinvest publishes no amounts, rates or document lists. The IFN has also not said where loan documents may be stored. The public Vercel domain is noindex but reachable by anyone.

## Decision

- **Unapproved finance pages are public on the noindex domain**, with every unconfirmed fact marked, as in the shop pilot. Each such page also says that its terms are being confirmed and are not an offer.
- **No document upload in this phase.** The online application is sent without files and never asks for a personal numeric code (CNP). The IFN collects documents after contact. Upload, private storage and status tracking move to Phase 9, where a private Blob store in an EU region is the likely route: the current store is public.
- **No Agrinvest rate or cost figure appears anywhere** until the IFN and its lawyer allow it. The simulator shows principal, plus an optional comparison at a rate the farmer types in.
- **No competitor is named on any page.**
- **No separate IFN identity global.** The Figures register already holds this data, and a second copy would break the single-source rule.
- **English parity (0005) applies to the whole section**, replacing the roadmap's overview page.

## Consequences

- `check:finance` and `check:figures` must fail once `SITE_INDEXABLE=true`, as they are all that stops unapproved claims reaching the index.
- Anyone with the link can read unapproved credit terms before launch. A real farmer could also send an application; it reaches only the admin until the owner picks a notification channel.
- Applications need an `ifn` role, because today every staff account can read every collection.

## Update: owner corrections (2026-11-05)

- The register now holds owner-confirmed company and IFN facts, and deploys apply them to the live site. A row confirmed later in the admin outranks the register.
- The main phone number is off the site, and the head office is the registered office in Buzău.
- One programme has stopped. Nothing about it is published or planned until a new one starts: its page is unpublished, not deleted, and it is gone from menus, pages and active plans. Phase records from before this date were left as written.
