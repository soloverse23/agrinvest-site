# 0004 Base map: server-rendered county outlines, no map tiles

- Status: accepted (owner chose the "counties outline" option, 2026-11-03)
- Date: 2026-11-03

## Context

The home page, `/depozitare`, `/cereale`, every crop page and every base page show where the bases are. The options were a counties outline (SVG), a minimal dot map, or an interactive tile map (MapLibre + OpenStreetMap). A tile map adds about 200 KB of JavaScript, over the 160 KB script budget (decision 0003). No base has a published position yet: the register's S4 (county, address, GPS) is "missing", and several base names (Crețești, Traian, Vedea) match more than one Romanian village.

## Decision

- **`BaseMap` pattern:** a server-rendered SVG of Romania's 41 counties and Bucharest, with no JavaScript. Counties where Agrinvest works are tinted (the collection-point counties, C4). A base with a position becomes a point sized by capacity; its link goes to the base page. Next to the map, a list of every base ordered by capacity carries the same information as text.
- **Position:** a base's GPS when it is entered in Payload; otherwise its county's centre (spread on a small spiral when a county has several bases); otherwise the base is listed only. Positions are never guessed from names.
- **Data:** Natural Earth admin-1 (public domain, no attribution needed), projected (equirectangular, scaled by cos 46°N) and simplified to about 1 px by `npm run brand:map`. The outlines are a static file, `public/maps/romania-counties.svg`, that pages reference with `<use href>`: it is cached once instead of repeated in every page's HTML and RSC payload, and it inherits the token colours from the page. `design-system/patterns/map/counties.ts` keeps only the codes, names and centroids (2 KB).
- **County names** carry Romanian diacritics, set in the build script (Natural Earth drops them).

## Consequences

- Until Agrinvest sends the base locations (`agrinvest-inputs.md`), the map shows the tinted counties and a "positions being confirmed" note; the list does the work.
- When the positions arrive they are data entry in Payload, with no code change.
- A tile map can still be added later as a click-to-load option on base pages, if directions turn out to be needed.
