# Figures register (draft)

Every fact or number about Agrinvest that the new site will state. Nothing goes on the site until its row is **confirmed** by management. On the site, these values come from the Payload "Figures register" global (Phase 2), never typed into pages.

Status: `to confirm` = found online, not yet confirmed · `conflict` = sources disagree · `confirmed` = approved by Agrinvest (name + date).

Collected 2026-11-02 from the live sites (crawl in `content-inventory.csv`) and press sources.

## Company

| #   | Fact                              | Value found                                                                                                                                                                | Source                         | Status       | Note                                                                                                                                                                                                                               |
| --- | --------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------ | ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| C1  | Founded                           | 2003, in Buzău                                                                                                                                                             | agrinvest.ro/despre-noi/, home | to confirm   |                                                                                                                                                                                                                                    |
| C2  | Run from                          | Bucharest (commercial office Bd Pipera 1/1, Voluntari, Ilfov)                                                                                                              | despre-noi, servicii-ifn       | to confirm   |                                                                                                                                                                                                                                    |
| C3  | Registered office (Agrinvest SRL) | Buzău, Tarlaua 41, Parcela 724, CF 50633                                                                                                                                   | agrinvest.ro footer            | to confirm   |                                                                                                                                                                                                                                    |
| C4  | Counties present                  | 22                                                                                                                                                                         | despre-noi                     | **conflict** | trading-cereale names only 11 counties for the collection points (Buzău, Ialomița, Prahova, Giurgiu, Teleorman, Dolj, Argeș, Galați, Brăila, Vaslui, Tulcea). 22 may cover sales/inputs; confirm both numbers and what each means. |
| C5  | Capital                           | 100% Romanian                                                                                                                                                              | agrointel (Mar 2025)           | to confirm   |                                                                                                                                                                                                                                    |
| C6  | Business lines                    | inputs (organic + conventional), grain trading, seeds (own production + partners), technical consulting, IFN (credit and investment), transport (own fleet), silos, diesel | despre-noi                     | to confirm   | Diesel has no page today.                                                                                                                                                                                                          |
| C7  | Grains bought                     | wheat, barley, rapeseed, sunflower, corn, triticale, soy, peas, others                                                                                                     | trading-cereale                | to confirm   |                                                                                                                                                                                                                                    |
| C8  | Payment for grain                 | "immediately after reception"                                                                                                                                              | flota-proprie                  | to confirm   | Strong selling point for /cereale.                                                                                                                                                                                                 |
| C9  | Main phone / email                | +40 786 222 238 · office@agrinvest.ro                                                                                                                                      | site header/footer             | to confirm   |                                                                                                                                                                                                                                    |

## Storage

| #   | Fact                                                                                                           | Value found                                                                                                                                                                                                                                                                                                     | Source                                | Status       | Note                                                                                                                                                       |
| --- | -------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------- | ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| S1  | Number of silo bases / collection points                                                                       | 17                                                                                                                                                                                                                                                                                                              | silozuri, trading-cereale, despre-noi | to confirm   |                                                                                                                                                            |
| S2  | Total capacity                                                                                                 | 238,000 (unit not stated; tonnes implied)                                                                                                                                                                                                                                                                       | silozuri                              | **conflict** | The 17 capacities listed on the same page add up to **252,000**. Confirm the per-base figures and the total, and the unit.                                 |
| S3  | Capacity per base                                                                                              | Balaci 10,000 · Baraitaru 6,000 · Cetate 7,000 · Crețești 20,000 · Foltești 10,000 · Fulga 13,000 · Grădiștea 13,000 · Mihăilești 13,500 · Pogoanele 86,000 · Sărățuica 18,000 · Slobozia Mândră 8,000 · Știubei 5,000 · Stolnici 8,500 · Strejnicu 8,000 · Traian 6,500 · Valea Nucarilor 2,000 · Vedea 17,500 | silozuri                              | to confirm   | Diacritics added here; the site lists names without them.                                                                                                  |
| S4  | Per base: county, address, GPS, phone, contact person, hours, services (reception, drying, cleaning, weighing) | not published                                                                                                                                                                                                                                                                                                   | —                                     | missing      | Needed for the 17 `/baze/{baza}` pages and LocalBusiness schema. The old `locations.kml` only holds the Pipera office (44.49003, 26.11932), not the bases. |

## Logistics

| #   | Fact              | Value found                                                               | Source                    | Status     | Note                                     |
| --- | ----------------- | ------------------------------------------------------------------------- | ------------------------- | ---------- | ---------------------------------------- |
| L1  | Trucks            | 55 (grain, seed, fertiliser and pesticide transport only)                 | flota-proprie, despre-noi | to confirm |                                          |
| L2  | Other vehicles    | 1 liquid-fertiliser tanker, 2 vans, 70 cars (sales and technical support) | flota-proprie             | to confirm |                                          |
| L3  | Logistics contact | Toma Ion, Director ADT – Logistică, 0741 201 056                          | flota-proprie             | to confirm | Permission to publish a personal number. |

## Programmes

| #   | Fact                            | Value found                                              | Source                         | Status     | Note                                                                  |
| --- | ------------------------------- | -------------------------------------------------------- | ------------------------------ | ---------- | --------------------------------------------------------------------- |
| P1  | Golden Relationship (#AGR) area | over 6,000 ha; target 10,000 ha "by the end of the year" | agrinvest-golden-relationships | to confirm | The year is not stated (videos are from 2022). Current figure needed. |
| P2  | #AGR coordinator                | ing. Dan N. Săvoiu, agronomist                           | same                           | to confirm | Still in the role? Candidate expert author.                           |

## Finance (Agrinvest Credit IFN SA)

Details and open questions in `ifn.md`.

| #   | Fact                      | Value found                                              | Source                     | Status                      |
| --- | ------------------------- | -------------------------------------------------------- | -------------------------- | --------------------------- |
| F1  | BNR Special Register      | RS-PJR-42-040132 (07.03.2023)                            | agrinvest.ro/servicii-ifn/ | to confirm                  |
| F2  | CUI / Trade register      | 41531140 / J2019003620232                                | servicii-ifn               | to confirm                  |
| F3  | Lending since             | 1 February 2020                                          | servicii-ifn, press        | to confirm                  |
| F4  | Reply / disbursement      | 24 h after complete documents / within 3 days of signing | servicii-ifn               | to confirm                  |
| F5  | Term / instalments        | up to 7 years / max. 2 instalments a year                | servicii-ifn               | to confirm                  |
| F6  | Clients / volume financed | 500+ / over €70M                                         | agrointel, Mar 2025        | to confirm (current values) |
| F7  | IFN office address        | Bd Pipera 1/1 (or "1i"), floor 4 or 5, Voluntari         | servicii-ifn               | **conflict**                |
| F8  | IFN phone / email         | +40 799 203 033 · office.ifn@agrinvest.ro                | servicii-ifn               | to confirm                  |

## Shop

| #   | Fact                                         | Value found                                                               | Source                | Status     | Note                                              |
| --- | -------------------------------------------- | ------------------------------------------------------------------------- | --------------------- | ---------- | ------------------------------------------------- |
| E1  | Products online                              | 77 (18 out of stock)                                                      | Store API, 2026-11-02 | snapshot   | `products-summary.csv`                            |
| E2  | Products on agrinvest.ro but not in the shop | 15 (mostly the organic range: Algavell, Amazonas Organic, Amino Organic…) | `redirect-map.csv`    | to confirm | Still sold? Candidates for the Phase 3 catalogue. |

## Content defects found (fix by not migrating)

- agrinvest.ro `/contact/` shows a "lorem ipsum" FAQ.
- 6 placeholder posts and their category on agrinvest.ro; 9 demo portfolio pages and 8 demo blog posts on agrinvestshop.ro (all marked 410 in `redirect-map.csv`).
- `lang="en-US"` on every Romanian page of agrinvest.ro; 47 of its pages have no H1.
