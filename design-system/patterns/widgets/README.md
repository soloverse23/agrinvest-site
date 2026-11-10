# Tool widgets

Small views of the farmer tools (prices, diesel, weather, news) that pages place wherever they help. The plan and the placement table are in `docs/phases/05-farmer-tools.md`; the rules are in decision 0008.

## Contract

- **Server components with plain props.** A widget never fetches. A loader in `src/lib/{prices,diesel,weather,news}/` builds the props; the page decides where the widget goes.
- **Three states** (`types.ts`): `ready`, `stale` and `empty`. A stale widget shows the last good data with its date and a warning badge. An empty widget says there is no data yet and offers the next step. Neither shows a zero or an invented number.
- **Agrinvest's own prices** come only from published `BuyPrices` and `DieselPrices` rows. Without one, the widget says "price on request".
- **Every number has a source.** Pass `source` with the data's own date (the week, the bulletin), not the fetch time. `WidgetFrame` prints it.
- **One frame.** Wrap the body in `WidgetFrame`, so title, source line, stale badge and link look the same everywhere.
- **Client code only where needed:** the "my location" button and the inputs of inline calculators. Each loads through `patterns/Lazy.tsx` in its own chunk. Everything else ships no script.
- **Charts** use `LineChart` (server SVG, data table under "Show the data"), never a chart library.
- **A story for every widget**, with ready, stale and empty variants.
- **Embedding in content:** the `toolWidget` page block (`src/blocks`) renders a widget by name, so any block-built page can embed a tool. Its renderer is `src/components/ToolWidget.tsx`.

## Widgets

- `GrainPrices` (5.2): per crop, Agrinvest's published range or "on request", next to the latest EU price with its weekly change. Props from `grainPricesProps` in `src/components/templates/PricePage.tsx`.
- `NetPriceMini` (5.2): a GET form into the net-price calculator; no script.
