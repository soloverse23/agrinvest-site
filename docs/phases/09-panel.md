# Phase 9.1: Staff panel by department

Built 2026-11-26. The Payload admin becomes a plain, light panel for people who only edit text.

## What a department account sees

- **Home screen** (`src/components/admin/panel/PanelDashboard.tsx`): a "Găsește pagina" box, the three steps (find, edit, save or publish), and one card per section of the account's department with its last changed documents and their status.
- **Finder** (`GET /api/panel/find?q=`, `src/lib/panel/find.ts`): a pasted site link (`https://agrinvest.ro/en/...`, `/magazin/...`) is matched by page path or by the last URL segment as a slug; anything else is a title search. Only the account's own sections, with its own access rules. English links open the English version.
- **Navigation**: only the department's sections (`admin.hidden`). Light theme only, brand logo, plainer Romanian on the save buttons ("Salvează ciorna", "Publică pe site", "Retrage de pe site").
- **Edit screens**: text and status. Slug, parent page, home flag and page languages are read-only outside the admin, so a text edit never moves a live URL. The API tab, column picker and bulk selection are hidden for department accounts (`PanelMode` sets `html[data-panel]`).

## Departments (`src/access/departments.ts`, the single source)

Rebuilt 2026-11-27 on Agrinvest's organisation chart. Each department has its own prices and its own requests; there is no separate prices or sales department.

| Role        | Name                  | Sections                                                                                                                                   |
| ----------- | --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `cereale`   | Cereale               | grain buy prices, grain leads, its pages, bases, crops, media                                                                              |
| `comercial` | Comercial (magazin)   | orders, input leads, products (prices are on the variants), categories, brands, active ingredients, documents, shop home, its pages, media |
| `ifn`       | Financiar (IFN)       | credit applications, finance leads, finance products (and their rates), finance questions, finance guides, its pages, media                |
| `logistica` | Logistică             | transport leads, its pages, media                                                                                                          |
| `motorina`  | Motorină              | diesel price, diesel leads, media                                                                                                          |
| `continut`  | Conținut              | its pages, articles, news and market notes, people, social posts, media                                                                    |
| `admin`     | Administrator general | everything, plus the technical sections (news, outbox, menus, figures, accounts, jobs) and pages with no department                        |

**Shared sections are split by document** (`rowRules`): a department lists, finds and edits only its own pages, guides and leads (`admin.baseListFilter` plus a query from `editors`). Leads are also read-protected per type.

- **Pages** carry a `department` field (sidebar, admin only). Grain and storage pages belong to Cereale, shop terms, returns and complaints to Comercial, `/finantare` to Financiar, logistics and delivery to Logistică, and the home and company pages to Conținut. The privacy and cookie pages have none, so only the admin edits them. A new page gets the department of its Romanian path's first segment (`defaultDepartment` in `Pages.ts`).
- **Guides** by section: `finantare` and `pagina-finantare` belong to Financiar, `ghid`, `stiri` and `piata` to Conținut. The section field is admin only.
- **Leads** by type: `vanzare-cereale` and `depozitare` go to Cereale, `inputuri`, `general` and `quick` to Comercial, `finantare` to Financiar, `logistica` to Logistică and `motorina` to Motorină. `parteneri` and `cariere` stay with the admin. The type field is admin only.

Departments update and change status; only the admin creates and deletes, except new price rows (Cereale: buy prices, Motorină: diesel) and media uploads. An account without a role sees no section. Credit applications stay IFN-only (an admin needs the `ifn` role too).

## Accounts

Department accounts sign in with a **username**, not an email (`auth.loginWithUsername`, email optional; personal accounts still sign in with their email). `npm run apply:panel` (deploy step) adds the seven accounts from `data/panel/accounts.json` (`admin`, `cereale`, `comercial`, `financiar`, `logistica`, `motorina`, `continut`) when they do not exist; it never changes an existing account. It also removes the first sample accounts (`panou.*@agrinvest.ro`). The file holds Payload PBKDF2 hashes (600 000 rounds) of long random passwords, never the passwords; those went to the owner. To rotate one, change it in the panel (Conturi) as admin.

Migration `20261126_220937_panel_org_chart` maps the old roles (`magazin` becomes `comercial`; `preturi` and `vanzari` are dropped), adds `users.username` and `pages.department`, and sets each existing page's department by path. Rehearsed on a copy of the local database: migrate and `apply:panel` twice, then each account signed in and listed only its own pages.

## Checks

`tests/int/panel.int.spec.ts` (department access, per-document split of pages, guides and leads, username accounts, self-only accounts, link parsing); `tests/e2e/admin.e2e.spec.ts` (admin still sees everything). Migration `20261126_212358_panel_departments` added the first roles and the account name.

## Edit this page (9.2)

Built 2026-11-26. A staff account signed in to the panel sees an **"Editează pagina"** button (bottom right) on the public site, on every page its department may change; it opens that document's edit screen directly (English pages open the English version).

- **Which document**: `src/lib/panel/onPage.ts` maps a public path to what it shows, following `src/i18n/routes.ts`: CMS pages by path, shop categories, products, brands and active ingredients by slug, the shop home global, finance products, questions, guides and fixed finance pages, farmer guides, news and market notes (Guides by section and slug), authors and crops. Price pages and diesel link to their price lists ("Editează: prețuri de achiziție").
- **Who sees it**: `GET /api/panel/here?path=` (`src/lib/panel/here.ts`) answers staff only, with the same department rules as the panel; pages a department does not own show no button.
- **Visitors pay nothing**: the panel cookie is httpOnly, so the proxy keeps a readable `ag-staff=1` flag in step with it. Without the flag the page never calls the endpoint and never loads the bar's code. The flag grants nothing; the endpoint checks the real session.
- Pieces: `src/components/staff/StaffEdit.tsx` (loader in the locale layout), `design-system/patterns/StaffEditBar.tsx` (with story). Tests in `tests/int/panel.int.spec.ts`.
- **Sign-in from the site**: the footer's last bottom link, "Autentificare echipă" / "Staff sign-in", goes to `/next/staff`, which opens `/admin/login?redirect=<the page>`; after signing in the person is back on that page with the edit button. A plain, `nofollow` link (`plain` in `SiteFooter`'s `bottomLinks`), no client code.

## Sidebar, login and video guides (9.4)

Built 2026-11-27.

- **Sidebar** (`src/components/admin/panel/PanelNav.tsx`, categories in `src/lib/panel/nav.ts`): Acasă and the guide on top, then each department's sections in work categories with icons; the admin also gets every other section folded under "Tehnic". Payload's own link list is hidden. The sidebar opens by itself on screens from 1024 px (Payload closed it below 1440 px).
- **Login** (`LoginParts.tsx`): the brand panel over the grain photo on the left, a heading and a help line around the form. Payload's "forgot password" link is hidden: department accounts sign in with a username and have no mailbox; the administrator resets passwords.
- **Video guide per department** on the panel home (`PanelGuide.tsx`, `GuideVideo.tsx`): one Romanian video for each department (`public/panel/ghid-<role>.mp4`, about a minute each) showing how to reach its sections, edit, save and publish, with chapters that jump in the video. The admin sees all six as tabs. The written guide (infographic, steps, tips, questions) is folded under it.
- **Recording** (`scripts/panel/record-guide.mjs`): drives the local panel as each department account, draws the captions and the cursor, and puts back every value it changed. Re-record after changing a department's sections: `PANEL_ACCOUNTS=<local passwords file> node scripts/panel/record-guide.mjs [role …]`; it rewrites `src/lib/panel/guide-videos.json` (chapters).
