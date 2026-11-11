/**
 * The home hero's three slides (Phase 7b): grain, shop, financing. A draft for the owner to
 * review. The seed and `apply:redesign` write them to the home page's hero block; the
 * stories use them too, so all three show the same words.
 *
 * `{{KEY}}` is a figures-register value. Posters and loops come from scripts/brand/clips.ts.
 */
export type Locale = 'ro' | 'en'
type Link = { label: string; href: string }

export type SlideCopy = {
  /** Also the slide's tab label. */
  eyebrow: string
  title: string
  accent: string
  lead: string
  primary: Link
  secondary: Link
  /** Poster file in public/media/hero (uploaded to Media by the seed). */
  poster: string
  /** Base path of the loops. */
  clip: string
}

const media = (slide: string) => ({ poster: `${slide}.webp`, clip: `/media/hero/${slide}` })

export const heroSlides: Record<Locale, SlideCopy[]> = {
  ro: [
    {
      eyebrow: 'Cereale',
      title: 'Vinde cereale la prețul zilei',
      accent: 'prețul zilei',
      lead: 'Preț pe fiecare cultură, recepție în {{S1}} silozuri și depozite, plata {{C8}}.',
      primary: { label: 'Cere ofertă', href: '/cereale#cerere' },
      secondary: { label: 'Vezi prețurile', href: '/preturi' },
      ...media('grain'),
    },
    {
      eyebrow: 'Magazin',
      title: 'Semințe, protecție și nutriție, cu prețul pe ambalaj',
      accent: 'cu prețul pe ambalaj',
      lead: 'Comanzi online, iar un consultant îți confirmă stocul și livrarea.',
      primary: { label: 'Intră în magazin', href: '/magazin' },
      secondary: { label: 'Produse pentru grâu', href: '/magazin/cultura/grau' },
      ...media('shop'),
    },
    {
      eyebrow: 'Finanțare',
      title: 'Credit agricol cu rate după recoltă',
      accent: 'rate după recoltă',
      lead: 'Prin Agrinvest Credit IFN, cu răspuns {{F4.reply}}.',
      primary: { label: 'Vezi finanțarea', href: '/finantare' },
      secondary: { label: 'Simulează rata', href: '/finantare/simulator' },
      ...media('finance'),
    },
  ],
  en: [
    {
      eyebrow: 'Grain',
      title: 'Sell your grain at today’s price',
      accent: 'today’s price',
      lead: 'A price for every crop, reception at {{S1}} silos and warehouses, paid {{C8}}.',
      primary: { label: 'Ask for an offer', href: '/en/grain#cerere' },
      secondary: { label: 'See prices', href: '/en/prices' },
      ...media('grain'),
    },
    {
      eyebrow: 'Shop',
      title: 'Seeds, crop protection and nutrition, priced per pack',
      accent: 'priced per pack',
      lead: 'Order online and a consultant confirms stock and delivery.',
      primary: { label: 'Visit the shop', href: '/en/shop' },
      secondary: { label: 'Products for wheat', href: '/en/shop/crop/wheat' },
      ...media('shop'),
    },
    {
      eyebrow: 'Financing',
      title: 'Farm credit repaid after harvest',
      accent: 'repaid after harvest',
      lead: 'Through Agrinvest Credit IFN, with a reply {{F4.reply}}.',
      primary: { label: 'See financing', href: '/en/financing' },
      secondary: { label: 'Estimate a repayment', href: '/en/financing/simulator' },
      ...media('finance'),
    },
  ],
}

/** Alt text for the posters in the Media library (the slider shows them as decoration). */
export const posterAlt: Record<string, Record<Locale, string>> = {
  'grain.webp': {
    ro: 'Două combine recoltând grâu, văzute din dronă',
    en: 'Two combines harvesting wheat, seen from a drone',
  },
  'shop.webp': {
    ro: 'Saci big bag Agrinvest pe paleți, în depozit',
    en: 'Agrinvest big bags on pallets in a warehouse',
  },
  'finance.webp': {
    ro: 'Tractoare semănând un câmp arat',
    en: 'Tractors sowing a ploughed field',
  },
}
