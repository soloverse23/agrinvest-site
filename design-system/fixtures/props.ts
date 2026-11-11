/** Component props built from the sample content, shared by pattern and page stories. */
import type { Locale } from '@/i18n/config'

import type { HeroProps } from '../patterns/Hero'
import type { PriceTableProps } from '../patterns/PriceTable'
import type { SiteHeaderProps } from '../patterns/SiteHeader'
import { bases, copy, crops, figures, nav, photos, priceDate } from './sample'

/** Main phone, figures register C9 (to confirm). */
const PHONE = '+40 786 222 238'

export const headerProps = (locale: Locale): SiteHeaderProps => ({
  locale,
  nav: nav.map((n) => ({ href: n.href, label: n.label[locale] })),
  current: '/preturi',
  cta: { href: '/cereale', label: copy.header.cta[locale] },
  labels: {
    menu: copy.header.menu[locale],
    main: copy.header.main[locale],
    language: copy.header.language[locale],
  },
  ticker: {
    phone: PHONE,
    crops: crops.slice(0, 4).map((c) => ({
      crop: c.key,
      name: c.name[locale],
      price: c.prices[0],
      change: c.change,
      href: `/preturi/${c.key}`,
    })),
    fuel: {
      name: locale === 'ro' ? 'Motorină' : 'Diesel',
      price: 7.12,
      unit: 'lei/l',
      href: '/motorina',
    },
  },
})

export const heroProps = (locale: Locale): HeroProps => ({
  locale,
  eyebrow: copy.hero.eyebrow[locale],
  title: copy.hero.title[locale],
  accent: copy.hero.accent[locale],
  lead: copy.hero.lead[locale],
  primary: { href: '/preturi', label: copy.hero.primary[locale] },
  secondary: { href: '/contact', label: copy.hero.secondary[locale] },
  photo: { src: photos.sunflower.src, alt: photos.sunflower.alt[locale] },
  prices: {
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
    })),
  },
})

export const priceTableProps = (locale: Locale): PriceTableProps => ({
  locale,
  title: copy.prices.title[locale],
  unit: copy.prices.unit[locale],
  places: bases,
  updated: priceDate,
  rows: crops.map((c) => ({
    crop: c.key,
    name: c.name[locale],
    prices: c.prices,
    change: c.change,
  })),
  labels: {
    crop: copy.prices.crop[locale],
    change: copy.prices.change[locale],
    updated: copy.prices.updated[locale],
    note: copy.prices.sample[locale],
  },
})

export const priceTiles = (locale: Locale) =>
  crops.map((c) => ({
    crop: c.key,
    name: c.name[locale],
    place: bases[0],
    price: c.prices[0],
    unit: 'lei/t',
    change: c.change,
    trend: c.trend,
    trendLabel: copy.prices.trend[locale],
    locale,
    href: `/preturi/${c.key}`,
  }))

export const figureItems = (locale: Locale) =>
  figures.map((f) => ({
    key: f.key,
    value: f.value,
    unit: 'unit' in f ? f.unit : undefined,
    label: f.label[locale],
  }))

export const financeProps = (locale: Locale) => ({
  kicker: copy.finance.kicker[locale],
  title: copy.finance.title[locale],
  body: copy.finance.body[locale],
  cta: { href: '/finantare/simulator', label: copy.finance.cta[locale] },
  secondary: { href: '/finantare', label: copy.finance.secondary[locale] },
  instalments:
    locale === 'ro'
      ? [
          { when: 'Rata 1 · iulie–august', label: 'după recolta de vară: grâu, orz, rapiță' },
          {
            when: 'Rata 2 · octombrie–noiembrie',
            label: 'după recolta de toamnă: porumb, floarea-soarelui',
          },
        ]
      : [
          {
            when: 'Instalment 1 · July–August',
            label: 'after the summer harvest: wheat, barley, rapeseed',
          },
          {
            when: 'Instalment 2 · October–November',
            label: 'after the autumn harvest: maize, sunflower',
          },
        ],
})
