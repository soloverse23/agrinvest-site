# Phase 9.1: Staff panel by department

Built 2026-11-26. The Payload admin becomes a plain, light panel for people who only edit text.

## What a department account sees

- **Home screen** (`src/components/admin/panel/PanelDashboard.tsx`): a "Găsește pagina" box, the three steps (find, edit, save or publish), and one card per section of the account's department with its last changed documents and their status.
- **Finder** (`GET /api/panel/find?q=`, `src/lib/panel/find.ts`): a pasted site link (`https://agrinvest.ro/en/...`, `/magazin/...`) is matched by page path or by the last URL segment as a slug; anything else is a title search. Only the account's own sections, with its own access rules. English links open the English version.
- **Navigation**: only the department's sections (`admin.hidden`). Light theme only, brand logo, plainer Romanian on the save buttons ("Salvează ciorna", "Publică pe site", "Retrage de pe site").
- **Edit screens**: text and status. Slug, parent page, home flag and page languages are read-only outside the admin, so a text edit never moves a live URL. The API tab, column picker and bulk selection are hidden for department accounts (`PanelMode` sets `html[data-panel]`).

## Departments (`src/access/departments.ts`, the single source)

| Role       | Name            | Sections                                                                               |
| ---------- | --------------- | -------------------------------------------------------------------------------------- |
| `continut` | Conținut        | pages, guides, bases, people, social posts, media                                      |
| `magazin`  | Magazin         | products, categories, brands, active ingredients, documents, orders, shop home, media  |
| `ifn`      | Finanțare (IFN) | credit applications, finance products, finance questions, media                        |
| `preturi`  | Prețuri         | grain buy prices, diesel price                                                         |
| `vanzari`  | Vânzări         | leads, orders                                                                          |
| `admin`    | Administrator   | everything, plus the technical sections (news, outbox, menus, figures, accounts, jobs) |

Departments update and change status; only the admin creates and deletes, except new price rows (`preturi`) and media uploads. Leads and orders are readable only by their departments and the admin. An account without a role sees no section. Credit applications stay IFN-only (an admin needs the `ifn` role too).

## Accounts

`npm run apply:panel` (deploy step) adds the five department accounts from `data/panel/accounts.json` when they do not exist; it never changes an existing account. The file holds Payload PBKDF2 hashes (600 000 rounds) of long random passwords, never the passwords; those went to the owner. To rotate one, change it in the panel (Conturi) as admin.

## Checks

`tests/int/panel.int.spec.ts` (department access, self-only accounts, link parsing); `tests/e2e/admin.e2e.spec.ts` (admin still sees everything). Migration `20261126_212358_panel_departments` adds the four roles and the account name.

## Edit this page (9.2)

Built 2026-11-26. A staff account signed in to the panel sees an **"Editează pagina"** button (bottom right) on the public site, on every page its department may change; it opens that document's edit screen directly (English pages open the English version).

- **Which document**: `src/lib/panel/onPage.ts` maps a public path to what it shows, following `src/i18n/routes.ts`: CMS pages by path, shop categories, products, brands and active ingredients by slug, the shop home global, finance products, questions, guides and fixed finance pages, farmer guides, news and market notes (Guides by section and slug), authors and crops. Price pages and diesel link to their price lists ("Editează: prețuri de achiziție").
- **Who sees it**: `GET /api/panel/here?path=` (`src/lib/panel/here.ts`) answers staff only, with the same department rules as the panel; pages a department does not own show no button.
- **Visitors pay nothing**: the panel cookie is httpOnly, so the proxy keeps a readable `ag-staff=1` flag in step with it. Without the flag the page never calls the endpoint and never loads the bar's code. The flag grants nothing; the endpoint checks the real session.
- Pieces: `src/components/staff/StaffEdit.tsx` (loader in the locale layout), `design-system/patterns/StaffEditBar.tsx` (with story). Tests in `tests/int/panel.int.spec.ts`.
- **Sign-in from the site**: the footer's last bottom link, "Autentificare echipă" / "Staff sign-in", goes to `/next/staff`, which opens `/admin/login?redirect=<the page>`; after signing in the person is back on that page with the edit button. A plain, `nofollow` link (`plain` in `SiteFooter`'s `bottomLinks`), no client code.
