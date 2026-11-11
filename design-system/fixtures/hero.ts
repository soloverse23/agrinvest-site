/** The home slider with the draft copy (scripts/site/hero.ts) for stories and shots. */
import type { Locale } from '@/i18n/config'
import { pricesUi } from '@/i18n/prices'
import { sliderUi } from '@/i18n/ui'

import { heroSlides } from '../../scripts/site/hero'
import type { HeroSliderProps } from '../patterns/HeroSlider'
import { bases, copy, crops, priceDate } from './sample'

/** Figures register values the copy refers to (all "to confirm"). */
const facts: Record<string, Record<Locale, string>> = {
  S1: { ro: '17', en: '17' },
  C8: { ro: 'imediat după recepție', en: 'immediately after reception' },
  'F4.reply': { ro: 'în 24 h de la dosarul complet', en: 'within 24 h of complete documents' },
}
const fill = (text: string, locale: Locale) =>
  text.replace(/\{\{([A-Za-z0-9.]+)\}\}/g, (_, k: string) => facts[k]?.[locale] ?? k)

export const heroSliderProps = (
  locale: Locale,
  { prices = true }: { prices?: boolean } = {},
): HeroSliderProps => ({
  locale,
  labels: sliderUi[locale],
  slides: heroSlides[locale].map((s) => ({
    eyebrow: s.eyebrow,
    title: s.title,
    accent: s.accent,
    lead: fill(s.lead, locale),
    primary: s.primary,
    secondary: s.secondary,
    poster: { src: `/media/hero/${s.poster}`, alt: '' },
    clip: s.clip,
  })),
  prices: prices
    ? {
        title: copy.prices.today[locale],
        place: bases[0],
        unit: copy.prices.unit[locale],
        date: priceDate,
        all: { href: '/preturi', label: copy.prices.all[locale] },
        rows: crops.map((c) => ({
          crop: c.key,
          name: c.name[locale],
          price: c.prices[0],
          change: c.change,
          href: `/preturi/${c.key}`,
          points: c.trend,
        })),
        fuel: {
          name: locale === 'ro' ? 'Motorină' : 'Diesel',
          price: 7.12,
          unit: 'lei/l',
          change: -0.04,
          href: '/motorina',
          points: [7.2, 7.18, 7.16, 7.16, 7.12],
        },
        nav: { prev: pricesUi[locale].rail.prev, next: pricesUi[locale].rail.next },
      }
    : undefined,
  needs: [
    {
      href: '/cereale',
      label: locale === 'ro' ? 'Vinde cereale' : 'Sell grain',
      hint: fill('{{C8}}', locale),
    },
    {
      href: '/magazin',
      label: locale === 'ro' ? 'Magazin' : 'Shop',
      hint: locale === 'ro' ? 'Semințe, protecție, nutriție' : 'Seed, crop protection, nutrition',
    },
    {
      href: '/finantare',
      label: locale === 'ro' ? 'Finanțare' : 'Financing',
      hint: locale === 'ro' ? 'Rate după recoltă' : 'Repay after harvest',
    },
    {
      href: '/unelte',
      label: locale === 'ro' ? 'Unelte' : 'Tools',
      hint: locale === 'ro' ? 'Calculatoare și prețuri' : 'Calculators and prices',
    },
  ],
})
