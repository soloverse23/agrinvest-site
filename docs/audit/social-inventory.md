# Social media inventory

Collected 2026-11-02. Basis for Phase 7 (social integration) and for the hero footage in Phase 1–2.

## Channels

| Channel   | Handle / URL                                                           | Audience              | Activity                                  | Content                                                                                                 | Integration route (Phase 7)            |
| --------- | ---------------------------------------------------------------------- | --------------------- | ----------------------------------------- | ------------------------------------------------------------------------------------------------------- | -------------------------------------- |
| YouTube   | [@agrinvestromania2727](https://www.youtube.com/@agrinvestromania2727) | 38 subscribers        | 11 public videos; last upload 23 Jun 2026 | TV appearances (Agro TV "Agricultura la Raport"), trader interview, the 2022 Golden Relationship series | YouTube Data API (official)            |
| LinkedIn  | [sc-agrinvest-srl](https://www.linkedin.com/company/sc-agrinvest-srl)  | about 3,055 followers | 1–3 posts a month                         | jobs, TV appearances, e-shop launch, StoneX hedging partnership (Oct 2025), team events                 | embeds / manual (API restricted)       |
| Facebook  | [agrinvestromania](https://www.facebook.com/agrinvestromania)          | not readable          | not readable                              | not readable                                                                                            | Meta Graph API (needs business access) |
| Instagram | [agrinvest.ro](https://www.instagram.com/agrinvest.ro)                 | not readable          | not readable                              | not readable                                                                                            | Meta Graph API (needs business access) |
| TikTok    | [@agrinvest.srl](https://www.tiktok.com/@agrinvest.srl)                | not readable          | not readable                              | not readable                                                                                            | TikTok Display API; yt-dlp fallback    |

Facebook, Instagram and TikTok block anonymous reading. Their metrics and post history come with account access (see `agrinvest-inputs.md`).

## YouTube videos

All are 1920×1080. Metadata in `data/raw/youtube.jsonl` (gitignored). One more video in the channel list (`YLmT1KrPVTI`) is private or unavailable.

| Date       | Length | Views | Title                                                            | Use                                         |
| ---------- | ------ | ----- | ---------------------------------------------------------------- | ------------------------------------------- |
| 2026-06-23 | 23:53  | 78    | AGRINVEST - Agricultura la Raport 16 06 2026                     | Expert clips; article source (transcript)   |
| 2025-11-28 | 46:42  | 118   | AGRINVEST - Agricultura la Raport                                | Expert clips; article source                |
| 2025-11-10 | 47:45  | 41    | AGRINVEST - Agricultura la Raport \| Agrovision                  | Expert clips; article source                |
| 2025-07-07 | 46:44  | 143   | Agrinvest la Agricultura la Raport – Agro TV                     | Expert clips; article source                |
| 2025-04-08 | 5:00   | 215   | Schimbari in sectorul agricol - Anahita Hamzeh, Trader Agrinvest | Market-note voice; short clips              |
| 2025-04-07 | 39:38  | 172   | Agricultura la Raport cu Ovidiu Ghinea                           | Expert clips; article source                |
| 2022-09-06 | 11:07  | 1,614 | Agrinvest Golden Relationship - Constanta #AGR                   | **Field b-roll**; farmer story              |
| 2022-07-25 | 9:12   | 1,532 | Agrinvest Golden Relationship - Mehedinti #AGR                   | **Field b-roll**; farmer story              |
| 2022-06-14 | 11:36  | 1,304 | Agrinvest Golden Relationship - Olt #AGR                         | **Field b-roll**; farmer story              |
| 2022-04-27 | 6:50   | 2,748 | AGRINVEST                                                        | **Brand film**: likely the best hero source |
| 2022-04-26 | 9:50   | 1,596 | Agrinvest Golden Relationship - Tulcea                           | **Field b-roll**; farmer story              |

## Observations

- **Footage:** the 2022 brand film and the Golden Relationship series are the only field footage (fields, farmers, silos), and the most watched videos. They are the source for the cinematic hero and the story sections. The TV studio interviews suit expert quotes and article material, not the hero.
- **Freshness:** the newest field footage is from 2022. A short filming day at one or two bases (Phase 1 plan, month 2) would give current hero material.
- **Reach:** YouTube views are low (41–2,748). The site–social loop must start the audience, not assume one.
- **Missing formats:** no regular farmer stories, price or market content, product or how-to clips, or Shorts/Reels. These are the series planned in Phase 1 of the 12-month plan and are fed from the site in Phase 7 (price cards, guides, UGC).
- **Rights:** confirm that Agrinvest owns or may reuse the Agro TV segments on its own site. The Golden Relationship and brand films appear to be Agrinvest productions.
