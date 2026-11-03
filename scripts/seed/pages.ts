/**
 * Core page shells for Phase 2 (content is written in 2.2). Each page has its SEO title
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
  layout?: 'home' | 'contact' | 'grain'
}

export const pages: PageSeed[] = [
  {
    key: 'home',
    isHome: true,
    layout: 'home',
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
      title: 'Despre Agrinvest',
      slug: 'despre',
      seoTitle: 'Despre Agrinvest: companie agricolă cu capital românesc',
      summary:
        'Agrinvest este o companie agricolă cu capital românesc, care lucrează direct cu fermierii: comerț cu cereale, depozitare, inputuri, consultanță și finanțare.',
    },
    en: {
      title: 'About Agrinvest',
      slug: 'about',
      seoTitle: 'About Agrinvest: a Romanian-owned agribusiness',
      summary:
        'Agrinvest is a Romanian-owned agribusiness working directly with farmers: grain trading, storage, farm inputs, agronomic advice and financing.',
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
  },
  {
    key: 'cereale',
    layout: 'grain',
    ro: {
      title: 'Vinde cereale la Agrinvest',
      slug: 'cereale',
      seoTitle: 'Vinde cereale: grâu, porumb, floarea-soarelui, rapiță',
      summary:
        'Cumpărăm grâu, porumb, floarea-soarelui, rapiță și orz direct de la fermieri, cu recepție în bazele noastre și transport cu flota proprie.',
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
    key: 'golden-relationship',
    ro: {
      title: 'Golden Relationship',
      slug: 'golden-relationship',
      seoTitle: 'Golden Relationship: parteneriat pe termen lung cu fermierii',
      summary:
        'Golden Relationship este programul Agrinvest de parteneriat pe termen lung cu fermierii: tehnologie, inputuri, consultanță și preluarea recoltei.',
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
  },
  {
    key: 'parteneri',
    ro: {
      title: 'Parteneri',
      slug: 'parteneri',
      seoTitle: 'Parteneri Agrinvest: producători, procesatori, traderi',
      summary:
        'Lucrăm cu producători de inputuri, procesatori, traderi și finanțatori. Află cum devii partener Agrinvest și ce oferim fiecărui tip de parteneriat.',
    },
    en: {
      title: 'Partners',
      slug: 'partners',
      seoTitle: 'Partner with Agrinvest: inputs, processing, trade',
      summary:
        'Agrinvest works with input makers, processors, grain buyers and lenders. See how to partner with a Romanian agribusiness that works directly with farmers.',
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
  },
  {
    key: 'contact',
    layout: 'contact',
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

/** Main menu by need; only pages that exist in this phase (shop and prices come later). */
export const navigation = {
  ro: [
    ['Vinde cereale', '/cereale'],
    ['Depozitare', '/depozitare'],
    ['Finanțare', '/finantare'],
    ['Logistică', '/logistica'],
    ['Despre', '/despre'],
  ],
  en: [
    ['Storage', '/en/storage'],
    ['Financing', '/en/financing'],
    ['Partners', '/en/partners'],
    ['About', '/en/about'],
  ],
  cta: { ro: ['Contact', '/contact'], en: ['Contact', '/en/contact'] },
} as const
