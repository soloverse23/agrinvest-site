# Prices and tools: what staff enter, what runs on its own

For Agrinvest staff working in the admin (`/admin`), group **Prețuri și unelte / Prices and tools**. Agrinvest's own prices appear on the site only when staff publish them. Everything else comes from public sources on a schedule.

## What staff enter

### Grain buy prices: `/admin/collections/buy-prices`

One row per crop, and per base when the price differs by base.

| Field            | What to enter                                                               |
| ---------------- | --------------------------------------------------------------------------- |
| Crop             | Wheat, corn, sunflower, rapeseed or barley                                  |
| Base             | The base. Leave it empty when the price applies at every base               |
| Price            | Lei per tonne, before VAT                                                   |
| Terms (`basis`)  | Delivered to the base, or collected at the farm                             |
| Valid from       | The day the price starts                                                    |
| Note             | Optional, shown under the price (quality terms, harvest year), in RO and EN |
| Status (sidebar) | **Draft** while you check it, **Published** to show it on the site          |

To change a price, **add a new row** with the new date; don't edit the old one. The history is the list of rows.

Where it shows: `/preturi`, `/preturi/{crop}`, the crop pages `/cereale/{crop}`, every base page, the home "Azi" row and the weekly newsletter. Without a published row the site says **"Preț la cerere"**.

Price alerts run the moment a published price changes. Each subscriber whose rule matches (any change, or crossing a threshold) gets a message in the Outbox (see "Messages" below).

### Diesel price: `/admin/collections/diesel-prices`

| Field          | What to enter                               |
| -------------- | ------------------------------------------- |
| Price          | Lei per litre                               |
| VAT            | Before VAT or VAT included                  |
| Valid from     | The day the price starts                    |
| Minimum litres | Optional                                    |
| Counties       | Delivery counties; empty means "on request" |
| Note           | Optional, in RO and EN                      |
| Status         | Draft or Published                          |

The newest published row shows on `/motorina` and in the home "Azi" row. Quote requests from `/motorina` arrive as leads of type **Motorină** (`/admin/collections/leads`), with the litres and the wanted date.

### Reception limits: `/admin/collections/crops` → each crop → "Quality"

Maximum moisture (%), maximum impurities (%) and minimum hectolitre mass (kg/hl). Once filled, the net-price calculator (`/preturi/calculator-pret-net`) uses them for that crop, and the crop page shows them. While they are empty, farmers type the limits from their own contract.

### Weekly market note: `/admin/collections/guides`, section "Nota de piață"

Every Thursday a **draft** is written from the week's market data, in RO and EN (key `piata-{week}`). Open it, check the numbers, write the section "Ce înseamnă pentru fermier" / "What it means for farmers", and publish. Nothing is published without staff.

### News headlines: `/admin/collections/news-items`

Headlines from Revista Ferma and Agrointel arrive every morning and show on `/stiri` and the home page at once. To remove one, set its status to **Ascuns** (hidden).

### Messages: `/admin/collections/outbox`

Every alert and newsletter the site would send. No email or WhatsApp service is connected yet, so each message is stored as **stubbed** and nothing is sent. Weekly newsletter drafts are in `/admin/collections/newsletters`. Setting an issue to **Approved** queues it to the Outbox once.

## What runs on its own

Vercel runs these jobs (`vercel.json`), each protected by `CRON_SECRET`:

| Job                 | When (UTC)      | What it does                                                               |
| ------------------- | --------------- | -------------------------------------------------------------------------- |
| `fetchEuCereal`     | daily 05:00     | EU weekly grain prices for Romania (CC BY 4.0). The EU API is down for now |
| `ingestNews`        | daily 06:00     | New headlines from the two allowed feeds                                   |
| `fetchOilBulletin`  | daily 07:00     | Romania's weekly diesel price, EU Weekly Oil Bulletin                      |
| `fetchEuFertiliser` | Mondays 08:00   | EU monthly fertiliser prices. The EU API is down for now                   |
| `buildNewsletter`   | Fridays 09:00   | Drafts the weekly newsletter (RO and EN) for review                        |
| `evaluateAlerts`    | daily 10:00     | Re-checks price alerts; duplicates are never written twice                 |
| `draftMarketNote`   | Thursdays 11:00 | Drafts the weekly market note                                              |

A failed job stays in `/admin/collections/payload-jobs` with its error, and the next scheduled run is the retry. The pages keep showing the last good data with its date.

On every deploy, `apply:tools` adds the "Prețuri" menu and footer column if they are missing. On the first deploy it also fills a year of diesel prices from the Oil Bulletin's history file.

## Not automatic, and why

- **Agrinvest's buy and diesel prices:** they are Agrinvest's commercial prices, so no public source has them, and the site never estimates one. A price feed from Agrinvest's own system can be connected later (see the phase doc, 5.1 "Found").
- **BRM, Agrimedia, Agro TV, ANM:** their terms forbid reuse without written consent. With a written permission, each becomes one entry in `src/lib/sources.ts`.
- **Diesel excise calculator:** it waits for the current legal rates, confirmed by the owner or an accountant.
