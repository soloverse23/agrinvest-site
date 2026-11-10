# Phase 7: Social (simple version)

Branch `phase-7/social` from `phase-6/articles`. **Owner's brief (2026-11-10):** keep it very simple: social icons with links, and the important recent LinkedIn posts in one well-shown section. No API feeds, no outbound cards, no UGC.

**Not built on purpose:** YouTube, Meta and TikTok feeds, outbound cards, weekly price post, UGC form. They stay in `docs/ROADMAP.md` (Phase 7) for a later round.

## What was built

- **Icons:** `FacebookIcon`, `InstagramIcon`, `LinkedinIcon`, `TiktokIcon`, `YoutubeIcon`, `ExternalLinkIcon` in `design-system/icons/icons.tsx`, on the same line grid. `design-system/icons/social.ts` maps a profile URL to its icon.
- **Footer:** the profile links from SEO defaults (`organization.sameAs`) are now round icon buttons with an accessible name (was text links). An unknown host falls back to the text label.
- **LinkedIn posts:** collection `social-posts` (admin group Conținut / Content). Staff paste the post link, date and the start of the text, and optionally an image; a "shown" checkbox hides a post. LinkedIn has no open feed and blocks scraping, so this is manual by design.
- **Home:** `HomeSocial` after the guides slot: the 3 newest visible posts as cards (`SocialPostCard`, story in `SocialPosts.stories.tsx`) and a "Follow us on LinkedIn" button to the company page. The section is hidden while there are no posts. The card links out; no LinkedIn script or iframe loads, so performance and consent are unaffected.
- Migration `20261110_160527_phase7_social`.

## Staff guide

Admin → Postări LinkedIn → Create. On LinkedIn: ⋯ on the post → "Copy link to post". Paste it, set the date, paste the first lines of the text (max 600 characters), optionally upload the post image. Add only posts worth showing.
