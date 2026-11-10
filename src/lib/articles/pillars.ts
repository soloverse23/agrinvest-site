import type { Locale } from '@/i18n/config'
import {
  cropPath,
  cropPricePath,
  dieselPath,
  financeRoutePath,
  fertiliserPricesPath,
  hubPath,
  categoryPath,
  marketPath,
  netPricePath,
  pricesPath,
  sections,
} from '@/i18n/routes'
import { localePath } from '@/i18n/config'

/**
 * The knowledge hub's pillars (Phase 6, roadmap "Pillars"). A guide belongs to one pillar; its
 * URL is `/ghiduri/{pillar}/{slug}`. The stored value is the Romanian slug. Financing is the
 * twelfth pillar but lives in the finance section (`/finantare/ghiduri`), so it is not here.
 *
 * `links` are the money pages each pillar sends readers to (crop, price, shop, tool). They are
 * built from the route helpers, so `check:articles` catches any that stop resolving.
 */
type Link = { label: string; href: string }
type L<T> = Record<Locale, T>

export type Pillar = {
  key: string
  slug: L<string>
  name: L<string>
  intro: L<string>
  links: (locale: Locale) => Link[]
}

const crop = (ro: string, en: string, name: L<string>) => (locale: Locale) => {
  const slug = locale === 'ro' ? ro : en
  return locale === 'ro'
    ? [
        { label: `Vinde ${name.ro.toLowerCase()} la Agrinvest`, href: cropPath(slug, locale) },
        { label: `Prețul la ${name.ro.toLowerCase()}`, href: cropPricePath(slug, locale) },
        { label: `Produse pentru ${name.ro.toLowerCase()}`, href: hubPath('crop', slug, locale) },
      ]
    : [
        { label: `Sell ${name.en.toLowerCase()} to Agrinvest`, href: cropPath(slug, locale) },
        { label: `${name.en} prices`, href: cropPricePath(slug, locale) },
        { label: `Inputs for ${name.en.toLowerCase()}`, href: hubPath('crop', slug, locale) },
      ]
}

const names = {
  wheat: { ro: 'Grâu', en: 'Wheat' },
  maize: { ro: 'Porumb', en: 'Corn' },
  sunflower: { ro: 'Floarea-soarelui', en: 'Sunflower' },
  rapeseed: { ro: 'Rapiță', en: 'Rapeseed' },
  barley: { ro: 'Orz', en: 'Barley' },
} satisfies Record<string, L<string>>

export const pillars: Pillar[] = [
  {
    key: 'grau',
    slug: { ro: 'grau', en: 'wheat' },
    name: names.wheat,
    intro: {
      ro: 'Semănat, fertilizare, calitate și recepție: răspunsuri scurte pentru cultura de grâu, de la toamnă până la vânzare.',
      en: 'Sowing, fertilisation, quality and intake: short answers for a wheat crop, from autumn to sale.',
    },
    links: crop('grau', 'wheat', names.wheat),
  },
  {
    key: 'porumb',
    slug: { ro: 'porumb', en: 'corn' },
    name: names.maize,
    intro: {
      ro: 'Hibrizi, densitate, tehnologie și uscare: ce contează la porumb, explicat de oameni care îl cumpără și îl depozitează.',
      en: 'Hybrids, plant density, crop technology and drying: what matters for corn, from people who buy and store it.',
    },
    links: crop('porumb', 'corn', names.maize),
  },
  {
    key: 'floarea-soarelui',
    slug: { ro: 'floarea-soarelui', en: 'sunflower' },
    name: names.sunflower,
    intro: {
      ro: 'Semănat, protecție și recoltare la floarea-soarelui, cu legătură directă spre prețuri și produse.',
      en: 'Sowing, protection and harvest for sunflower, linked to prices and inputs.',
    },
    links: crop('floarea-soarelui', 'sunflower', names.sunflower),
  },
  {
    key: 'rapita',
    slug: { ro: 'rapita', en: 'rapeseed' },
    name: names.rapeseed,
    intro: {
      ro: 'Rapița de la semănatul din august până la recoltare: răsărire, iernare, dăunători și vânzare.',
      en: 'Rapeseed from August sowing to harvest: emergence, winter survival, pests and sale.',
    },
    links: crop('rapita', 'rapeseed', names.rapeseed),
  },
  {
    key: 'orz',
    slug: { ro: 'orz', en: 'barley' },
    name: names.barley,
    intro: {
      ro: 'Orz de toamnă și de primăvară, furajer și pentru bere: tehnologie și calitate la recepție.',
      en: 'Winter and spring barley, feed and malting: crop technology and quality at intake.',
    },
    links: crop('orz', 'barley', names.barley),
  },
  {
    key: 'vanzare',
    slug: { ro: 'vanzare', en: 'selling' },
    name: { ro: 'Vânzarea recoltei', en: 'Selling the harvest' },
    intro: {
      ro: 'Acte, recepție, preț net și momentul vânzării: tot ce ține de drumul recoltei de la câmp la cumpărător.',
      en: 'Paperwork, intake, net price and timing: the harvest’s road from the field to the buyer.',
    },
    links: (locale) =>
      locale === 'ro'
        ? [
            { label: 'Prețurile zilei', href: pricesPath(locale) },
            { label: 'Calculator preț net', href: netPricePath(locale) },
            { label: 'Nota de piață', href: marketPath(locale) },
            { label: 'Vinde cereale la Agrinvest', href: localePath(sections.crops.ro, locale) },
          ]
        : [
            { label: 'Today’s prices', href: pricesPath(locale) },
            { label: 'Net price calculator', href: netPricePath(locale) },
            { label: 'Market note', href: marketPath(locale) },
            { label: 'Sell grain to Agrinvest', href: localePath(sections.crops.en, locale) },
          ],
  },
  {
    key: 'depozitare',
    slug: { ro: 'depozitare', en: 'storage' },
    name: { ro: 'Depozitare și uscare', en: 'Storage and drying' },
    intro: {
      ro: 'Umiditate, ventilare, siloz și uscare: cum păstrezi cerealele fără pierderi până la vânzare.',
      en: 'Moisture, aeration, silos and drying: how to keep grain without losses until it is sold.',
    },
    links: (locale) =>
      locale === 'ro'
        ? [
            { label: 'Depozitare la Agrinvest', href: '/depozitare' },
            { label: 'Uscare cereale', href: '/depozitare/uscare' },
            { label: 'Finanțare pe stoc', href: '/finantare/finantare-stocuri' },
          ]
        : [
            { label: 'Storage at Agrinvest', href: '/en/storage' },
            { label: 'Grain drying', href: '/en/storage/drying' },
            { label: 'Stock financing', href: '/en/financing/stock-financing' },
          ],
  },
  {
    key: 'fertilizare',
    slug: { ro: 'fertilizare', en: 'fertilisation' },
    name: { ro: 'Fertilizare', en: 'Fertilisation' },
    intro: {
      ro: 'Doze, momente de aplicare și alegerea îngrășământului, pe culturi, cu prețurile actuale la îndemână.',
      en: 'Rates, timing and fertiliser choice by crop, with current prices at hand.',
    },
    links: (locale) =>
      locale === 'ro'
        ? [
            { label: 'Prețuri îngrășăminte', href: fertiliserPricesPath(locale) },
            { label: 'Îngrășăminte în magazin', href: categoryPath('ingrasaminte', locale) },
            {
              label: 'Inputuri cu plata la recoltă',
              href: '/finantare/inputuri-plata-la-recolta',
            },
          ]
        : [
            { label: 'Fertiliser prices', href: fertiliserPricesPath(locale) },
            { label: 'Fertilisers in the shop', href: categoryPath('fertilisers', locale) },
            { label: 'Inputs paid at harvest', href: '/en/financing/inputs-paid-at-harvest' },
          ],
  },
  {
    key: 'protectia-plantelor',
    slug: { ro: 'protectia-plantelor', en: 'crop-protection' },
    name: { ro: 'Protecția plantelor', en: 'Crop protection' },
    intro: {
      ro: 'Erbicidare, boli și dăunători: când și cu ce intervii, cu produsele omologate din magazin.',
      en: 'Weeds, diseases and pests: when and how to act, with the approved products in the shop.',
    },
    links: (locale) =>
      locale === 'ro'
        ? [
            { label: 'Protecția plantelor', href: categoryPath('protectia-plantelor', locale) },
            { label: 'Erbicide', href: categoryPath('erbicide', locale) },
            { label: 'Fungicide', href: categoryPath('fungicide', locale) },
          ]
        : [
            { label: 'Crop protection', href: categoryPath('crop-protection', locale) },
            { label: 'Herbicides', href: categoryPath('herbicides', locale) },
            { label: 'Fungicides', href: categoryPath('fungicides', locale) },
          ],
  },
  {
    key: 'subventii-apia',
    slug: { ro: 'subventii-apia', en: 'apia-subsidies' },
    name: { ro: 'Subvenții APIA', en: 'APIA subsidies' },
    intro: {
      ro: 'Calendarul APIA, plata subvențiilor și cum le folosești ca garanție, explicat pe scurt.',
      en: 'The APIA calendar, subsidy payments and using them as collateral, in short.',
    },
    links: (locale) =>
      locale === 'ro'
        ? [
            { label: 'Avans pe subvenția APIA', href: '/finantare/subventii-apia' },
            { label: 'Ghiduri de finanțare', href: financeRoutePath('guides', locale) },
            { label: 'Motorină pentru fermă', href: dieselPath(locale) },
          ]
        : [
            { label: 'APIA subsidy advance', href: '/en/financing/apia-subsidies' },
            { label: 'Financing guides', href: financeRoutePath('guides', locale) },
            { label: 'Farm diesel', href: dieselPath(locale) },
          ],
  },
]

export const pillarKeys = pillars.map((p) => p.key)

export const pillarByKey = (key: string | null | undefined) => pillars.find((p) => p.key === key)

export const pillarBySlug = (slug: string, locale: Locale) =>
  pillars.find((p) => p.slug[locale] === slug)
