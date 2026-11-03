# Screenshot review rubric

Used for every board, component sheet and template, on screenshots at 390 / 768 / 1440 px in RO and EN (`npm run review:shoot`). Rules behind each criterion are in `craft.md`.

**Pass:** an average of 8 or more, with no criterion below 6. Each score needs one line of evidence ("the price column wraps at 390 px", not "looks good").

| #   | Criterion            | 10 means                                                                                         | Fails when                                                                                |
| --- | -------------------- | ------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------- |
| 1   | Hierarchy            | One clear entry point per view; the order of reading is obvious at every width                   | Several elements compete; headings and body look alike                                    |
| 2   | Typography           | Scale, measure and line-height follow the craft rules; display and text faces are clearly paired | Lines over 80 characters; more than two families; weights used randomly                   |
| 3   | Romanian text        | ș ț with comma below in every face and size; correct number and date formats                     | Cedillas (ş ţ), missing glyphs, fallback fonts, `1,020.00 RON`-style numbers on RO pages  |
| 4   | Contrast and access  | All text AA; focus visible; touch targets ≥ 44 px; no meaning by colour alone                    | Grey-on-grey text; ▲▼ shown only by colour; tiny tap targets at 390 px                    |
| 5   | Information density  | Farmers can compare numbers at a glance; no wasted panels                                        | Big empty cards around a single number; data split across screens without reason          |
| 6   | Grid and rhythm      | Content sits on the 12-column grid; spacing comes from the scale; deliberate asymmetry           | Ad hoc margins; everything centred; uneven gaps                                           |
| 7   | Imagery              | Real Agrinvest footage with one consistent treatment; text over images stays legible             | Stock look; mixed treatments; text on busy photos without a scrim                         |
| 8   | Restraint (anti-AI)  | None of the anti-"AI look" patterns                                                              | Any gradient blob, glass card, emoji icon or "hero + 3 cards" layout                      |
| 9   | Brand fit            | Recognisably Agrinvest: the greens, the mark, a formal and trustworthy tone                      | Could be any agritech start-up; the logo greens clash with the palette                    |
| 10  | RO/EN and responsive | RO and EN both fit without breaking; layouts work at 390, 768 and 1440                           | Romanian (often longer) overflows; mobile is a squeezed desktop; horizontal scroll at 390 |

## How to record a review

In `docs/design-review/reviews/<date>-<subject>.md`: the screenshots folder, a table with the 10 scores and evidence, the average, and the fixes made before the next round.
