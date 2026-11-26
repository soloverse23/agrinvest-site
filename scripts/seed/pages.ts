import { aboutPage } from '../site/company-first'

/**
 * Core pages for Phase 2 (their blocks and FAQ are in content.ts). Each page has its SEO title
 * (30–60 characters) and a summary that doubles as the meta description (70–160).
 * `en` is present only where the English site has a true equivalent.
 */
type L = { title: string; slug: string; seoTitle: string; summary: string }

export type PageSeed = {
  key: string
  parent?: string
  isHome?: boolean
  ro: L
  en?: L
}

export const pages: PageSeed[] = [
  {
    key: 'home',
    isHome: true,
    ro: {
      title: 'Agrinvest',
      slug: 'acasa',
      seoTitle: 'Agrinvest: cereale, depozitare, inputuri și finanțare',
      summary:
        'Agrinvest cumpără cereale direct de la fermieri, le depozitează în bazele proprii, livrează inputuri și finanțează producția prin Agrinvest Credit IFN.',
    },
    en: {
      title: 'Agrinvest',
      slug: 'home',
      seoTitle: 'Agrinvest: Romanian grain, storage and farm finance',
      summary:
        'Agrinvest buys grain from Romanian farmers, stores it in its own silo bases, supplies farm inputs and finances production through Agrinvest Credit IFN.',
    },
  },
  {
    key: 'despre',
    ro: {
      title: aboutPage.ro.next.title,
      slug: 'despre',
      seoTitle: aboutPage.ro.next.seoTitle,
      summary: aboutPage.ro.next.summary,
    },
    en: {
      title: aboutPage.en.next.title,
      slug: 'about',
      seoTitle: aboutPage.en.next.seoTitle,
      summary: aboutPage.en.next.summary,
    },
  },
  {
    key: 'cifre',
    parent: 'despre',
    ro: {
      title: 'Agrinvest în cifre',
      slug: 'cifre',
      seoTitle: 'Agrinvest în cifre: baze, capacitate, flotă și finanțare',
      summary:
        'Cifrele Agrinvest într-un singur loc: baze de depozitare, capacitate, flotă, programe și finanțare, fiecare cu sursa și data verificării.',
    },
    en: {
      title: 'Agrinvest in figures',
      slug: 'figures',
      seoTitle: 'Agrinvest in figures: bases, capacity, fleet, lending',
      summary:
        "Agrinvest's figures in one place: storage bases, capacity, fleet, programmes and lending, each with its source and verification status.",
    },
  },
  {
    key: 'cereale',
    ro: {
      title: 'Vinde cereale la Agrinvest',
      slug: 'cereale',
      seoTitle: 'Vinde cereale: grâu, rapiță, floarea-soarelui, porumb',
      summary:
        'Cumpărăm orz, grâu, rapiță, floarea-soarelui și porumb direct de la fermieri, cu recepție în bazele noastre și transport cu flota proprie.',
    },
    en: {
      title: 'Grain at Agrinvest',
      slug: 'grain',
      seoTitle: 'Romanian grain: wheat, rapeseed, sunflower, corn',
      summary:
        'Agrinvest buys barley, wheat, rapeseed, sunflower and corn directly from Romanian farmers, receives it at its own bases and moves it with its own fleet.',
    },
  },
  {
    key: 'depozitare',
    ro: {
      title: 'Depozitare cereale',
      slug: 'depozitare',
      seoTitle: 'Depozitare cereale în silozuri: recepție și uscare',
      summary:
        'Depozitare de cereale în bazele Agrinvest: recepție, cântărire, precurățare și uscare, cu acces direct la vânzare și la finanțarea stocurilor.',
    },
    en: {
      title: 'Grain storage',
      slug: 'storage',
      seoTitle: 'Grain storage in Romania: silo bases and drying',
      summary:
        "Grain storage across Agrinvest's silo bases in Romania: reception, weighing, cleaning and drying, with direct access to sales and stock financing.",
    },
  },
  {
    key: 'uscare',
    parent: 'depozitare',
    ro: {
      title: 'Uscare cereale',
      slug: 'uscare',
      seoTitle: 'Uscare și precurățare cereale la recepție | Agrinvest',
      summary:
        'Uscăm și precurățăm cerealele la recepție, ca să ajungă la umiditatea standard pentru depozitare și vânzare, fără să pierzi timp în plin sezon.',
    },
    en: {
      title: 'Grain drying',
      slug: 'drying',
      seoTitle: 'Grain drying and cleaning at reception | Agrinvest',
      summary:
        'We dry and clean grain at reception, so it reaches the standard moisture for storage and sale without losing time at the height of the harvest.',
    },
  },
  {
    key: 'finantare',
    ro: {
      title: 'Finanțare agricolă',
      slug: 'finantare',
      seoTitle: 'Finanțare agricolă pentru fermieri | Agrinvest Credit IFN',
      summary:
        'Agrinvest Credit IFN finanțează producția, investițiile și stocurile fermierilor, cu rate aliniate la recoltă și răspuns rapid la cerere.',
    },
    en: {
      title: 'Farm financing',
      slug: 'financing',
      seoTitle: 'Farm financing in Romania | Agrinvest Credit IFN',
      summary:
        "Agrinvest Credit IFN is the group's non-bank lender, financing Romanian farmers' production, investments and grain stocks with harvest-aligned repayments.",
    },
  },
  {
    key: 'logistica',
    ro: {
      title: 'Logistică și transport',
      slug: 'logistica',
      seoTitle: 'Transport cereale și inputuri cu flota proprie | Agrinvest',
      summary:
        'Transportăm cereale, semințe, îngrășăminte și produse de protecția plantelor cu flota proprie de camioane, de la fermă la bază și la client.',
    },
    en: {
      title: 'Logistics and transport',
      slug: 'logistics',
      seoTitle: 'Grain and farm input transport, own fleet | Agrinvest',
      summary:
        'We move grain, seed, fertiliser and crop protection products with our own truck fleet, from the farm to the base and on to the customer.',
    },
  },
  {
    key: 'cariere',
    ro: {
      title: 'Cariere la Agrinvest',
      slug: 'cariere',
      seoTitle: 'Cariere la Agrinvest: locuri de muncă în agricultură',
      summary:
        'Locuri de muncă la Agrinvest: vânzări, agronomie, logistică, depozitare și finanțare. Trimite-ne CV-ul și spune-ne unde vrei să lucrezi.',
    },
    en: {
      title: 'Careers at Agrinvest',
      slug: 'careers',
      seoTitle: 'Careers at Agrinvest: jobs in Romanian agriculture',
      summary:
        'Jobs at Agrinvest in sales, agronomy, logistics, storage and lending. Tell us where you would like to work and what you can do.',
    },
  },
  {
    key: 'contact',
    ro: {
      title: 'Contact',
      slug: 'contact',
      seoTitle: 'Contact Agrinvest: cereale, depozitare și finanțare',
      summary:
        'Contactează Agrinvest pentru vânzare de cereale, depozitare, inputuri, logistică sau finanțare. Îți răspunde direct persoana responsabilă.',
    },
    en: {
      title: 'Contact',
      slug: 'contact',
      seoTitle: 'Contact Agrinvest: grain, storage and financing',
      summary:
        'Contact Agrinvest about grain, storage, farm inputs, logistics or financing. Your enquiry goes straight to the person responsible for it.',
    },
  },
  {
    key: 'confidentialitate',
    ro: {
      title: 'Politica de confidențialitate',
      slug: 'confidentialitate',
      seoTitle: 'Confidențialitate și protecția datelor | Agrinvest',
      summary:
        'Cum folosește Agrinvest datele pe care ni le trimiți prin formulare: ce colectăm, de ce, cât timp le păstrăm și cum îți exerciți drepturile.',
    },
    en: {
      title: 'Privacy policy',
      slug: 'privacy',
      seoTitle: 'Privacy policy and data protection | Agrinvest',
      summary:
        'How Agrinvest uses the data you send through our forms: what we collect, why, how long we keep it and how to exercise your rights.',
    },
  },
]
