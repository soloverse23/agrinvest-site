# Review: Phase 1.1 direction boards

Date: 2026-11-03. Stories `Directions/A · Registru`, `B · Câmp`, `C · Recoltă`, `Compare`.
Screenshots: `docs/design-review/shots/2026-11-03/` (local only: they contain video frames whose rights are unconfirmed), 390 / 768 / 1440 px × RO / EN.

Automated: no horizontal scroll at any width; axe (WCAG 2.1 A/AA + best practice) finds no violations on any board; every text colour pair is AA (lowest 5,1:1).

## Scores

| #   | Criterion            | A Registru                                                  | B Câmp                                                   | C Recoltă                                                                 |
| --- | -------------------- | ----------------------------------------------------------- | -------------------------------------------------------- | ------------------------------------------------------------------------- |
| 1   | Hierarchy            | 9: headline, then today's prices; obvious reading order     | 8: hero and price tiles compete slightly at 1440         | 9: one photo, one headline, figures band                                  |
| 2   | Typography           | 9: Newsreader display with optical size; clear pairing      | 8: one family is coherent; mono labels get busy in specs | 8: Source Serif display is elegant; sans body slightly large              |
| 3   | Romanian text        | 9: comma-below ș ț in all faces; RO number and date formats | 9: same                                                  | 9: same                                                                   |
| 4   | Contrast and access  | 9: all AA; ▲▼ plus sign; 44 px targets                      | 9: same; dose chip ink-on-lime 9,3:1                     | 8: hero text relies on the scrim over a bright sky                        |
| 5   | Information density  | 8: prices beside the headline; ledger product rows          | 9: densest; tiles, sparklines, list rows                 | 7: generous space; one base at a time in the price list                   |
| 6   | Grid and rhythm      | 8: 8/4 split, hairline rules, asymmetric                    | 8: clean 6/6 split; tile grid                            | 8: full bleed, then 7/5 product and finance                               |
| 7   | Imagery              | 7: documentary band works; 2022 frames are soft             | 7: tight crops suit it; frames soft                      | 8: the film carries the page; softness hidden by the scrim                |
| 8   | Restraint (anti-AI)  | 9: no blobs, glass or icon rows; real numbers               | 9: same                                                  | 8: the full-bleed hero is a familiar pattern, kept honest by real footage |
| 9   | Brand fit            | 8: deep leaf green; formal                                  | 7: closest to a generic agritech dashboard               | 9: deep green and logo lime; most "institution"                           |
| 10  | RO/EN and responsive | 8: works at all widths; ticker trims to 3 crops on mobile   | 8: works; the base switch wraps on mobile                | 8: works; the stacked figures band is long on mobile                      |
|     | **Average**          | **8,4**                                                     | **8,2**                                                  | **8,2**                                                                   |

All three pass (8 or more, no criterion below 6).

## Fixes made during review

- Product grids overflowed at 390 px (no explicit column); fixed in A and B.
- Numbers and units wrapped apart ("212,5 / g/l"); joined by no-break spaces (voice rule for 1.2).
- "10 l" read as "101" in Newsreader; packs written "10 L".
- Link colour rule overrode button text colour (empty-looking buttons on green); made zero-specificity.
- B's hero photo carried the harvest caption; captions now come from each photo.
- C's headline left a widow ("ta."); balanced wrapping.
- Owner feedback: the cream papers were too yellow. A paper `#f6f3ec` → `#fcfbf8`, C paper `#f4efe4` → `#fbfaf6` (surfaces and rules adjusted to match). Contrast improved.

## Known limits

- The only field footage is from 2022 and soft at 1080p. A filming day at one or two bases would lift every direction.
- Prices are illustrative; base counties are unknown (figures register S4).
