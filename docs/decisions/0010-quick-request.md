# 0010 Shop: one-field quick request

- Status: accepted (the legal line needs owner confirmation)
- Date: 2026-11-11
- Updates: the rule "leads collect phone and email" (CLAUDE.md) for the new lead type `quick` only

## Context

The product page's quote form asked for a name, phone, email, county, message and consent, and it sat at the bottom of a long page. The owner wants a visitor to leave one contact and keep shopping.

## Decision

- **A new lead type, `quick`:**
  - It needs exactly one contact, a phone or an email. The field detects which one was typed.
  - It needs no name.
  - It records the product, pack, quantity, hectares (when the dose calculator was used) and the source path.
- **Every other lead type keeps its current rules:** phone and email required, and a name.
- **Privacy:** a notice line with a link under the button, with no checkbox. The legal basis is the visitor's own request for contact before a purchase (GDPR art. 6(1)(b)). Marketing consent is never inferred from it.
- **Notification:** `notifyLead` stays a no-op until the owner picks a channel. Quick requests appear in the admin like other leads.

## Consequences

- `Leads.phone`, `email` and `name` are no longer required at the database level. A collection validation enforces the rules for each type. This needs a migration.
- Consultants get some leads with only an email or only a phone. The admin list shows the lead type, so these can be told apart.
- If the owner prefers an explicit consent checkbox, the component takes one prop to add it. The layout is unchanged.
