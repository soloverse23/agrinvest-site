/**
 * The home page's content (Phase 7b): the hero slider is its only block, since everything
 * below the hero is drawn in code (`src/components/Home*.tsx`). Copy comes from
 * `scripts/site/hero.ts` and `scripts/site/home.ts`, shared with `apply:redesign` and the
 * stories. Posters are the Media docs the seed uploads from `public/media/hero/`.
 */
import type { Page } from '@/payload-types'

import { heroSlides, type Locale } from '../site/hero'
import { homeFaq } from '../site/home'

type Blocks = NonNullable<Page['layout']>

/** Media key of a slide's poster (`grain.webp` → `hero:grain`). */
export const posterKey = (file: string) => `hero:${file.replace(/\.webp$/, '')}`

export function homeLayout(locale: Locale, media: Record<string, number | undefined>): Blocks {
  const slides = heroSlides[locale]
  const first = slides[0]
  return [
    {
      blockType: 'hero',
      // The single-hero fields stay filled (the title is required); with slides they are unused.
      eyebrow: first.eyebrow,
      title: first.title,
      accent: first.accent,
      lead: first.lead,
      primary: first.primary,
      secondary: first.secondary,
      slides: slides.map((s) => ({
        eyebrow: s.eyebrow,
        title: s.title,
        accent: s.accent,
        lead: s.lead,
        poster: media[posterKey(s.poster)] ?? null,
        clip: s.clip,
        primary: s.primary,
        secondary: s.secondary,
      })),
    },
  ]
}

export const homeFaqFor = (locale: Locale) => homeFaq[locale].map((q) => ({ ...q }))
