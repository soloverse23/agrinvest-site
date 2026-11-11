import type { Locale } from './config'

/**
 * The home page's sections below the hero (Phase 7b). Facts are `{{KEY}}` figures-register
 * values, rendered with their "to confirm" marker. Kept short on purpose: each section links
 * on to the page that explains it.
 */
export const homeUi = {
  ro: {
    live: {
      title: 'În direct din câmp',
      updated: 'Actualizat',
      crops: 'Alege prețul',
      rotate: { pause: 'Oprește schimbarea prețurilor', play: 'Pornește schimbarea prețurilor' },
      chart: {
        agrinvest: (crop: string) => `${crop}: prețul Agrinvest`,
        market: (crop: string) => `${crop}: piața europeană`,
        diesel: 'Motorină: media în România',
        dieselLink: 'Prețul motorinei la Agrinvest',
        date: 'Data',
        empty: 'Prețurile apar aici după prima publicare.',
        vs: 'față de',
        since: 'din',
        link: (crop: string) => `Prețul la ${crop.toLocaleLowerCase('ro')}, pe baze`,
      },
      feed: 'Ultimele noutăți',
      feedEmpty: 'Noutățile apar aici pe măsură ce le publicăm.',
      kinds: {
        news: 'Știri agricole',
        agrinvest: 'Agrinvest',
        guide: 'Ghid',
        note: 'Nota de piață',
        social: 'LinkedIn',
        price: 'Preț',
      },
      move: (crop: string, change: string) => `${crop}: ${change} lei/t la Agrinvest`,
      allNews: 'Toate știrile',
      allPrices: 'Toate prețurile',
    },
    shop: {
      kicker: 'Magazin Agrinvest',
      title: 'Inputuri pentru sezon, cu prețul afișat',
      // Romanian puts "de" after 20–99, 120–199, … (and round hundreds), not after 1–19 or 101–119.
      products: (n: number) =>
        n === 1
          ? '1 produs'
          : `${n} ${n >= 20 && (n % 100 === 0 || n % 100 >= 20) ? 'de ' : ''}produse`,
      crops: 'Pentru cultura ta',
      picks: 'Din magazin',
      all: 'Toate produsele',
    },
    stories: {
      kicker: 'Ghiduri și noutăți',
      title: 'Ce merită știut în fermă, sezon de sezon',
      all: 'Toate ghidurile',
      news: 'Știri Agrinvest',
      read: 'Citește',
      prev: 'Articolele anterioare',
      next: 'Articolele următoare',
    },
    finance: {
      kicker: 'Agrinvest Credit IFN',
      title: 'Rate după recoltă',
      instalments: [
        { when: 'Vara', label: 'după grâu, orz și rapiță' },
        { when: 'Toamna', label: 'după porumb și floarea-soarelui' },
      ],
      cta: 'Vezi finanțarea',
    },
    tools: {
      title: 'Unelte pentru fermă',
      netPrice: 'Calculator preț net',
      simulator: 'Simulator rate',
      fertilisers: 'Prețuri îngrășăminte',
      diesel: 'Motorină',
      all: 'Toate uneltele',
    },
    company: {
      kicker: 'Agrinvest',
      title: 'Un singur partener, de la semănat la vânzare',
      figures: {
        S2: 'capacitate de depozitare',
        S1: 'silozuri și depozite',
        C4: 'județe',
        L1: 'camioane proprii',
      },
      tiles: {
        grain: { title: 'Vinde cereale', line: 'Preț pe fiecare cultură, plata {{C8}}.' },
        storage: { title: 'Depozitare și uscare', line: 'Recepție, uscare și păstrare la bază.' },
        logistics: { title: 'Logistică', line: 'Ridicăm marfa de la fermă cu flota proprie.' },
        about: { title: 'Despre Agrinvest', line: 'Cine suntem și cum lucrăm.' },
      },
    },
  },
  en: {
    live: {
      title: 'Live from the field',
      updated: 'Updated',
      crops: 'Choose a price',
      rotate: { pause: 'Stop cycling prices', play: 'Start cycling prices' },
      chart: {
        agrinvest: (crop: string) => `${crop}: Agrinvest price`,
        market: (crop: string) => `${crop}: European market`,
        diesel: 'Diesel: Romanian average',
        dieselLink: 'Agrinvest diesel price',
        date: 'Date',
        empty: 'Prices show here once the first one is published.',
        vs: 'vs',
        since: 'since',
        link: (crop: string) => `${crop} prices by base`,
      },
      feed: 'Latest updates',
      feedEmpty: 'Updates show here as we publish them.',
      kinds: {
        news: 'Farm news',
        agrinvest: 'Agrinvest',
        guide: 'Guide',
        note: 'Market note',
        social: 'LinkedIn',
        price: 'Price',
      },
      move: (crop: string, change: string) => `${crop}: ${change} lei/t at Agrinvest`,
      allNews: 'All news',
      allPrices: 'All prices',
    },
    shop: {
      kicker: 'Agrinvest shop',
      title: 'Inputs for the season, with prices shown',
      products: (n: number) => (n === 1 ? '1 product' : `${n} products`),
      crops: 'For your crop',
      picks: 'From the shop',
      all: 'All products',
    },
    stories: {
      kicker: 'Guides and news',
      title: 'What is worth knowing on the farm, season by season',
      all: 'All guides',
      news: 'Agrinvest news',
      read: 'Read',
      prev: 'Previous articles',
      next: 'Next articles',
    },
    finance: {
      kicker: 'Agrinvest Credit IFN',
      title: 'Repay after harvest',
      instalments: [
        { when: 'Summer', label: 'after wheat, barley and rapeseed' },
        { when: 'Autumn', label: 'after maize and sunflower' },
      ],
      cta: 'See financing',
    },
    tools: {
      title: 'Farm tools',
      netPrice: 'Net price calculator',
      simulator: 'Repayment simulator',
      fertilisers: 'Fertiliser prices',
      diesel: 'Diesel',
      all: 'All tools',
    },
    company: {
      kicker: 'Agrinvest',
      title: 'One partner from sowing to sale',
      figures: {
        S2: 'storage capacity',
        S1: 'silos and warehouses',
        C4: 'counties',
        L1: 'own trucks',
      },
      tiles: {
        grain: { title: 'Sell grain', line: 'A price for every crop, paid {{C8}}.' },
        storage: {
          title: 'Storage and drying',
          line: 'Reception, drying and storage at the base.',
        },
        logistics: { title: 'Logistics', line: 'We collect from the farm with our own fleet.' },
        about: { title: 'About Agrinvest', line: 'Who we are and how we work.' },
      },
    },
  },
} as const satisfies Record<Locale, unknown>

export type HomeUi = (typeof homeUi)[Locale]
