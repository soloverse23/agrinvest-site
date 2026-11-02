# SERP notes: top 40 priority keywords

Researched 2026-11-02. Keywords come from `keyword-map.csv`, priority 1 first.

**Method and limits.**

- Romanian queries were researched with Exa semantic search, because the available web search only returns US results.
- **The pages listed are the most prominent pages for each query, not confirmed google.ro positions.** SERP features (People Also Ask, maps, Shopping, video) could not be seen; any mentioned here are expected, not observed.
- Before setting targets, confirm positions with Search Console, a rank tracker, or a manual google.ro check (Phase 0 exit / Phase 2).

## 1. Grain prices

Keywords: preț grâu azi · pret grau · preț porumb azi · preț floarea-soarelui azi · preț rapiță

- **Prominent:**
  - brm.ro/cotatii-cereale (weekly official table, by region + FOB, archive since 2017)
  - agrogo.ro/ro/preturi-cereale (multi-source: DAP Constanța, MATIF, CBOT)
  - agrointel.ro/bursa, plus daily market articles
  - lahectar.ro/preturi (EU Commission data, every Thursday, with FAQ)
  - agronet.ro/bursa, infoz.ro, agriportal.ro, BASF exchange quotes
  - news rewrites
- **Format:** weekly or daily price tables and daily news. Pages are dated and show % change, charts, lei/EUR and FAQ; some have named authors.
- **Gap:** all of them show port, MATIF or national averages. LaHectar states plainly that it is "not what the silo near you offers". Agrointel already quotes one silo's bid, which proves such data gets cited.
- **To win:** one page per crop with **Agrinvest's dated buy price at each of the 17 bases**, a FOB/MATIF comparison, a history chart, an FAQ, and Dataset/PriceSpecification schema. Update it every business day.

## 2. Seeds

Keywords: semințe porumb · hibrizi porumb · semințe floarea-soarelui · hibrizi floarea-soarelui

- **Prominent:**
  - culturiagricole.ro, verdon.ro
  - agronor.ro/seminte-de-porumb (260 products, brand/type filters)
  - fitomag.ro (category page + long guide on FAO group and density)
  - seminteplante.ro, pesticid.ro
  - breeders: pioneer.com/ro, saaten-union.ro, nuseed.com/ro, lidea-seeds.ro
- **Format:** e-shop categories with filters (brand, FAO group, bag) and VAT-inclusive prices; breeder catalogues for "hibrizi". The best pages add 500+ words of buying advice; most copy the breeder's specs. Shopping results are likely.
- **Gap:** nobody combines filters with independent advice by region (irrigated or not, Clearfield/Express) and real trial results. **The current shop has no corn or sunflower seed.**
- **To win:** filterable category pages (FAO, technology, broomrape resistance), a regional selection guide, Product/Offer schema, on the main domain.

## 3. cel mai bun hibrid de porumb

- **Prominent:**
  - agritips.ro (April 2026, south-east region, irrigated vs not, charts, FAQ)
  - lumeasatului.ro (Orezu demo-plot results, 2016)
  - gazetadeagricultura.info, agrimedia.ro (2017–2019 demo days)
  - hvhalmajan.ro (APPR/RITAC trial analysis)
- **Format:** guides and trial-result news, often old, often breeder-sponsored.
- **To win:** a yearly guide ("cel mai bun hibrid de porumb 2027, pe zone") built on Agrinvest's own demo-plot data from its bases, with tables, an author and a date.

## 4. Fertiliser prices

Keywords: îngrășăminte preț · azotat de amoniu preț

- **Prominent:**
  - archim-fertil.ro (per bag and per tonne)
  - cipcosmar.ro, monamiagro.ro, agricultorul.com (truck lots), agro.dafcochim.ro
  - stale B2B directories: bizoo.ro, unpret.ro, clubafaceri.ro, 2biz.ro
- **Format:** thin product pages and old listings. Prices are often out of date and there are no trend charts. This is a weak SERP.
- **To win:** a product page priced per bag, big-bag and truckload, with a monthly price-trend block, plus an "îngrășăminte preț" hub (ammonium nitrate, urea, NPK, DAP) on `/preturi/ingrasaminte`.

## 5. Harvest 2027

Keywords: recolta de grâu 2027 · producție grâu România 2027

- **Prominent:** agrointel.ro (EU Commission 2026/27 estimates), agrobiznes.ro, agrimedia.ro, forbes.ro, agronet.ro, agriportal.ro (Crop Tour), stirileprotv.ro; in English, ukragroconsult.com.
- **Format:** news articles. **Nothing targets the 2027 harvest yet.**
- **To win:** an evergreen "Recolta de grâu 2027 – estimări actualizate" page with a dated changelog, a source table (EC/USDA/MADR) and Agrinvest's field observations from its bases. Being first matters here.

## 6. Selling grain

Keywords: achiziție cereale · cine cumpără cereale · vând grâu · vând porumb

- **Prominent:**
  - **agrinvest.ro/trading-cereale** (already visible for "achiziție cereale")
  - agricultorul.com/ro/achizitie-cereale (MATIF-linked pricing, logistics)
  - colectachim.ro, marsatsa.ro, cerealcom.com, ameropa.ro
  - for "vând…": olx.ro, agrogo.ro/ro/piata, anunturi-agricultura.ro, agro-market24.eu
- **Format:** thin company service pages with forms, and marketplace listings. Nobody publishes prices, intake specs per base or a map.
- **To win:** a "Vinde-ne recolta" (sell us your harvest) path with:
  - today's price per base, a quote form, intake parameters;
  - the payment promise ("paid immediately after reception"), transport;
  - 17 LocalBusiness base pages.
  - "Cine cumpără cereale" (who buys grain) needs an FAQ-style answer.

## 7. Storage

Keywords: depozitare cereale · preț depozitare cereale

- **Prominent:**
  - silobag articles: forbes.ro; revista-ferma.ro (about €8/t silobag vs €17–20/t silo)
  - silo builders: brig.ro, agroconcept.ro
  - thin operator pages: lgrey.ro, eastgrain.ro
  - agrointel.ro ("does storing pay?")
- **Format:** guides and articles. **No third party publishes a storage price list.** This is the clearest gap.
- **To win:** a storage page with indicative tariffs (lei/t/month, drying and cleaning surcharges), capacity per base, a "store now, sell later" calculator, and a link to IFN stock financing.

## 8. Agricultural credit

Keywords: credit agricol · credit fermieri

- **Prominent:** bank product pages (bancatransilvania.ro with FAQ, patriabank.ro "Credit APIA", brd.ro, cec.ro, raiffeisen.ro, unicredit.ro, bcr.ro) and fgcr.ro.
- **Format:** bank product pages centred on APIA prefinancing; strong domains, generic copy.
- **To win:** the long tail first ("credit fermieri mici", "credit fără ipotecă", "rambursare la recoltă"), with one landing page per IFN product, a repayment simulator and worked examples.

## 9. Input financing paid at harvest

Keywords: finanțare inputuri plata la recoltă · credit pentru inputuri agricole

- **Prominent:**
  - **tarfin.com/ro** (category leader)
  - agricover.ro (Creditul Agroinput, fertiliser financing)
  - resellers explaining Tarfin: semplus.ro, agrocenter.ro, seminteplante.ro (worked example at 1.4%/month)
  - raiffeisen.ro (crop financing)
- **Format:** fintech/IFN product pages plus reseller explainers.
- **To win:** Agrinvest is the only player that is shop + IFN + grain buyer in one, so it can offer **"pay with grain at harvest"**, which Tarfin cannot. That needs a product page with a cost example, eligibility, documents, FAQ, and a "buy now, pay at harvest" link from the shop.

## 10. Moisture standard and deduction

Keywords: umiditate grâu standard · cum se calculează scăzământul la umiditate

- **Prominent:**
  - legislation: legislatie.just.ro (Norma 12/06/2003), madr.ro (HG 169/2015, annex 6), lege5.ro (older acts)
  - company spec pages: anfeed.ro (wheat 14%, oilseeds 9%), trading-group.org
  - agrobiznes.md
- **Format:** raw legal PDFs and scattered specs. **No calculator and no plain-language guide.**
- **To win (easy):** `/preturi/calculator-pret-net`, using the deduction formula SG = G·(a−b)/(100−b), plus a guide with the base conditions per crop and a worked Agrinvest reception ticket, with HowTo/FAQ schema. Check the formula and base values against the current legislation before publishing.

## 11. Input distributors

Keywords: distribuitor inputuri agricole · agricultural input distributor Romania (EN) · seed distributor Romania (EN)

- **Prominent:** agricover.ro/inputuri-agricole (+ EN), alcedo.ro, ameropa.ro, naturevo.ro (+ Sumitomo acquisition news), netagro.ro, rdf-group.ro, diaplant.ro, fertiagro.ro, rojevas.ro, topseeds.ro.
- **Format:** corporate about/products pages; **very few English pages**.
- **To win:** an English "Agricultural inputs distributor in Romania" page for manufacturers: coverage map, brands carried, logistics, certifications, Organization schema.

## 12. Export (EN)

Keywords: Romanian wheat supplier · Romanian grain exporter · buy wheat from Romania · Romanian corn supplier · grain trading company Romania · non-GMO corn supplier Europe

- **Prominent:**
  - small Constanța traders: arrowseatrading.ro, lidagribroker.ro, precomagro.com
  - eastgrain.ro/en, biochemorganics.ro, biofarmcrucea.ro
  - Cerealcom's Global Grain Geneva exhibitor page
  - foreign traders: vimeksim.at, gcswiss.com, hunzea.hu
  - The big traders (Cargill, Viterra, COFCO, ADM) don't target these phrases.
- **Format:** thin B2B pages; no spec sheets, no indicative FOB price, no trust content. **Wide open.**
- **To win:** an English page per commodity under `/en/export/*`:
  - GAFTA-style specs, non-GMO status, traceability to the 17 silos;
  - FOB Constanța / DAP logistics, an RFQ form, Organization/Product schema.

## 13. largest agricultural companies in Romania (EN)

- **Prominent:** ranking sites built on ANAF data (ddm.ro/atlas, date.contapp.ro, bilant.net, bizradar.ro/en, webhunt.io), statista.com (paywalled), doingbusiness.ro (grain traders), agro-tv.ro (KeysFin 2023).
- **Format:** ranking tables; **almost no English editorial lists**.
- **To win:** an English data article ("Largest agribusiness companies in Romania 2026") citing ANAF data, with Agrinvest in context. It earns links and supports the brand.

## 14. Brand

Keywords: agrinvest · agrinvest shop · agrinvest credit · Agrinvest Romania (EN)

- **Shows now:** agrinvest.ro pages (home, about, trading, IFN, Golden Relationship); **agrinvestshop.ro as a separate domain** with indexed categories; LinkedIn. For "agrinvest credit": `/servicii-ifn/`, finantist.ro and press items. There is no separate IFN domain.
- **Name collisions:**
  - **Agrinvest Commodities, Brazil** (grain brokerage, bought by Marex in 2025; agrinvest.marex.com): the biggest risk, same topic.
  - AgrInvest NL (agrinvest.nl), AgrInvest GmbH Hamburg (agrinvest.com), Agrinvest SRL Argentina (agrinvest.com.ar).
  - FAO's AgrInvest programme, Canada's **AgriInvest** programme, agrinvest.net (Africa).
  - On google.ro the Romanian company probably dominates; for "Agrinvest Romania" in English, the Brazilian and FAO entities compete.
- **To win:**
  - Merge the shop and IFN into agrinvest.ro (planned).
  - Organization schema with `sameAs` (LinkedIn and the other channels) and the legal identifiers.
  - An English "About Agrinvest Romania" page.
  - Google Business Profiles for HQ and every base.
  - Consistent naming: "Agrinvest" / "Agrinvest Credit IFN".

## Patterns across the SERPs

1. Price searches belong to media and aggregators showing port or national averages. **No one shows a live buy price per base**; Agrinvest can.
2. Freshness decides price searches: visible date, daily or weekly updates, % change. Agrinvest's price pages must update every business day.
3. Seed and fertiliser searches go to filterable e-shop categories; Fitomag's long buying guide sets the content bar.
4. Stale B2B directories still rank for fertiliser prices, which makes that SERP weak and easy to displace.
5. Technical "how to" searches (moisture deduction, storage cost) are answered by legal PDFs and builder blogs. **There are no calculators, so tools are the fastest wins.**
6. Finance splits: banks own "credit agricol", Tarfin/Agricover own "plata la recoltă". Agrinvest's angle is inputs + credit + grain buying in one.
7. English export and distributor searches return thin pages from small brokers; spec-rich English pages can rank quickly.
8. Future-year pages ("2027") don't exist yet; evergreen pages with a dated changelog can claim them.
9. Agrinvest's assets are split across two domains and press releases; one domain, full schema and local base pages lift every cluster.
10. The "Agrinvest" name collides internationally, so English pages and entity schema are needed to own "Agrinvest Romania".

## Changes this implies for the roadmap

These are noted for the relevant phase plans, not executed now:

- **Phase 2:** an indicative storage tariff and a "store now, sell later" calculator on `/depozitare` (needs tariffs from Agrinvest).
- **Phase 3:** corn and sunflower seed are missing from the catalogue; add them if Agrinvest sells them.
- **Phase 5:**
  - `/preturi/calculator-pret-net` (moisture deduction) as the first tool;
  - a "Recolta de grâu 2027" evergreen page with changelog;
  - per-base buy prices are the core of the price pages.
- **Phase 6:** a yearly regional hybrid guide built on Agrinvest demo-plot data; the English "largest agribusiness companies" data article.
- **Phase 2/4:** Organization `sameAs` and legal identifiers to separate Agrinvest Romania from Agrinvest Commodities (Brazil) and others.
