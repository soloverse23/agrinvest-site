# Guides and news: how to write, edit and publish

For Agrinvest staff working in the admin (`/admin`), group **Conținut / Content**, collection **Articole și ghiduri**. One collection holds every long text; the **Section** in the right column decides where it appears.

| Section                | Where it appears                                    |
| ---------------------- | --------------------------------------------------- |
| Știri Agrinvest        | `/stiri/{slug}`, at the top of `/stiri`, home page  |
| Ghid pentru fermieri   | `/ghiduri/{pillar}/{slug}`, its pillar, the hub     |
| Nota de piață          | `/piata/{slug}` (a draft is written every Thursday) |
| Finanțare, Pagină fixă | the finance section (reviewed by the IFN)           |

## Write a news piece

1. **Create new**, set **Section: Știri Agrinvest**.
2. **Title** (Romanian), **Direct answer** (one or two sentences: what happened and what it means for the farmer), **Body**.
3. Optional: **Cover image** (a landscape photo, at least 1600 px wide, with alt text in Media), **Author**, **Publication date** (it orders the news).
4. Optional: **Tools on the page** (the grain price, net price or diesel widget beside the text) and **Shop products**.
5. **Save draft** to check it, **Publish** to put it online. The page, the `/stiri` list, the home page and the sitemap update within a minute.
6. **English:** switch the content locale selector at the top of the editor to **English** and fill the same fields. Without an English title there is no English page.

To **edit**, open the piece, change it and publish again; the date "Updated" appears on the page by itself. To **take it down**, use **Unpublish**.

## Write a farmer guide from a brief

Twenty briefs are already in the list as drafts (filter **Section: Ghid pentru fermieri**, sort by **Planned for**). Each has a **Brief editorial** tab with the keyword, outline, required links, FAQ ideas and the sources to check.

1. The expert writes the **Direct answer** first: the answer to the keyword's question in two or three sentences.
2. **Body**: one `H2` per outline line. Use the keyword in the title and in the first paragraph, naturally. No padding: the length is what the facts need.
3. Every figure comes from a source listed under **Sources** (title, link, date checked). Reception limits come from Agrinvest's contract, never from memory.
4. Add every **required link** from the brief inside the text, and one or two **FAQ** entries from the brief.
5. Set **Author** (the expert) and **Reviewed by**, set the brief status to **Publicat**, then **Publish**.
6. Add the English version (see above).

The guide joins its pillar page, the hub, the home page and the sitemap. `npm run check:articles` checks every link.

## Editorial calendar and refresh

- The **Planned for** date on each brief is the calendar: seasonal guides go out a few weeks before the question peaks (sowing guides in August, harvest guides in May–June, inputs in January–February).
- Every Monday the **editorial digest** lists, in **Outbox**: guides not updated for a year, guides past their **Refresh by** date, guides marked **De actualizat**, and briefs past their planned date.
- When a guide drops in the monthly ranking report, set its brief status to **De actualizat**. Refresh means: check every figure and source, answer what the current top results answer better, update the date. Then set the status back to **Publicat**.

## Authors

An author page (`/autori/{slug}`) exists for every person with **Expert author** ticked in **People**. Fill **role**, **photo**, **bio** and **credentials** in both languages: they appear under every text the person wrote and are what search engines read as expertise.
