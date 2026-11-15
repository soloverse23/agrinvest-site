# 0012 Finance as a guide: needs, questions, one consultant action

- Status: accepted (owner, 2026-11-15)
- Date: 2026-11-15
- Updates: 0007 (finance) for the hub, the product pages and the FAQ page

## Context

The owner found the IFN section messy: the hub opened with text and listed the credits twice, product pages read like wiki articles, the only action was a 19-field application, and the questions farmers type into search engines and AI assistants were hidden in accordions. Credit terms differ from farm to farm, so the pages should guide and hand over to a consultant, not try to state every term.

## Decision

- **Three layers.** Guide pages (hub, credit pages) convert; one page per question catches search and assistant queries; a library holds the long guides, the glossary and the IFN's register data.
- **Hub:** need tiles (eight needs, each to one credit, `src/lib/finance/needs.ts`) and a three-question finder that hands over to the simulator.
- **Credit pages work like shop product pages:** a credit box with the H1, key terms and the consultant; the answer and who it fits on the left; example, steps, guarantees and questions under a tab bar; the long text closed under "Detalii".
- **Questions:** collection `finance-questions`, one page each at `/finantare/intrebari/{slug}` (`/en/financing/questions/{slug}`): a short answer, "what decides it for you", an example where the sources allow, the matching credit and sources. The FAQ page redirects there.
- **One action:** "Vorbește cu un consultant", a drawer with name, phone, email and the need (a `finantare` lead, the leads rule unchanged). The detailed application stays as an optional step and as the no-JavaScript fallback.
- **Section links:** Credite · Întrebări · Simulator · Bibliotecă.

## Consequences

- No Agrinvest rate, document list or eligibility promise on any question page (`check:finance` enforces claims and rates as for products).
- A credit with no question fails `check:finance`.
- `apply:finance` unpublishes the old FAQ page and empties the hub page's blocks; menu and footer move to the new links only where they still match an earlier generated version.
