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
      seoTitle: 'Vinde cereale: grâu, porumb, floarea-soarelui, rapiță',
      summary:
        'Cumpărăm grâu, porumb, floarea-soarelui, rapiță și orz direct de la fermieri, cu recepție în bazele noastre și transport cu flota proprie.',
    },
    en: {
      title: 'Grain at Agrinvest',
      slug: 'grain',
      seoTitle: 'Romanian grain: wheat, corn, sunflower, rapeseed',
      summary:
        'Agrinvest buys wheat, corn, sunflower, rapeseed and barley directly from Romanian farmers, receives it at its own bases and moves it with its own fleet.',
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
    key: 'golden-relationship',
    ro: {
      title: 'Golden Relationship',
      slug: 'golden-relationship',
      seoTitle: 'Golden Relationship: redresarea fermelor în dificultate',
      summary:
        'Programul Golden Relationship ajută fermele în dificultate să își revină, cu un plan de redresare făcut împreună cu Agrinvest și sprijin pe termen lung.',
    },
    en: {
      title: 'Golden Relationship',
      slug: 'golden-relationship',
      seoTitle: 'Golden Relationship: helping farms in difficulty recover',
      summary:
        'Golden Relationship helps farms in difficulty recover, with a recovery plan built together with Agrinvest and long-term support afterwards.',
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

type Link = { label: string; href: string }
type MenuItem = Link & { blurb?: string; children?: (Link & { description?: string })[] }

/** Main menu by need; only pages that exist in this phase (shop and prices come later). */
export const navigation: Record<'ro' | 'en', MenuItem[]> & { cta: Record<'ro' | 'en', Link> } = {
  ro: [
    {
      label: 'Vinde cereale',
      href: '/cereale',
      blurb: 'Cumpărăm cereale direct de la fermieri, cu recepție în bazele noastre.',
      children: [
        { label: 'Grâu', href: '/cereale/grau', description: 'Recoltă de vară' },
        { label: 'Porumb', href: '/cereale/porumb', description: 'Recoltă de toamnă' },
        {
          label: 'Floarea-soarelui',
          href: '/cereale/floarea-soarelui',
          description: 'Recoltă de toamnă',
        },
        { label: 'Rapiță', href: '/cereale/rapita', description: 'Recoltă de vară' },
        { label: 'Orz', href: '/cereale/orz', description: 'Recoltă de vară' },
      ],
    },
    {
      label: 'Depozitare',
      href: '/depozitare',
      blurb: 'Recepție, uscare și depozitare în bazele proprii, cu vânzare direct din stoc.',
      children: [
        { label: 'Bazele noastre', href: '/depozitare', description: 'Hartă și capacitate' },
        {
          label: 'Uscare și precurățare',
          href: '/depozitare/uscare',
          description: 'Marfa adusă la umiditatea de depozitare',
        },
      ],
    },
    { label: 'Finanțare', href: '/finantare' },
    { label: 'Logistică', href: '/logistica' },
    {
      label: 'Despre',
      href: '/despre',
      blurb: 'O companie agricolă cu capital românesc, care lucrează direct cu fermierii.',
      children: [
        {
          label: 'Agrinvest în cifre',
          href: '/despre/cifre',
          description: 'Cu sursa fiecărei valori',
        },
        {
          label: 'Golden Relationship',
          href: '/golden-relationship',
          description: 'Sprijin pentru fermele în dificultate',
        },
        { label: 'Parteneri', href: '/parteneri', description: 'Inputuri, procesare, finanțare' },
        { label: 'Cariere', href: '/cariere', description: 'Lucrează cu noi' },
      ],
    },
  ],
  en: [
    {
      label: 'Grain',
      href: '/en/grain',
      blurb: 'We buy grain directly from Romanian farmers and receive it at our own bases.',
      children: [
        { label: 'Wheat', href: '/en/grain/wheat', description: 'Summer harvest' },
        { label: 'Corn', href: '/en/grain/corn', description: 'Autumn harvest' },
        { label: 'Sunflower', href: '/en/grain/sunflower', description: 'Autumn harvest' },
        { label: 'Rapeseed', href: '/en/grain/rapeseed', description: 'Summer harvest' },
        { label: 'Barley', href: '/en/grain/barley', description: 'Summer harvest' },
      ],
    },
    {
      label: 'Storage',
      href: '/en/storage',
      blurb: 'Reception, drying and storage at our own bases, with sales straight from stock.',
      children: [
        { label: 'Our bases', href: '/en/storage', description: 'Map and capacity' },
        {
          label: 'Drying and cleaning',
          href: '/en/storage/drying',
          description: 'Grain brought to storage moisture',
        },
      ],
    },
    { label: 'Financing', href: '/en/financing' },
    { label: 'Logistics', href: '/en/logistics' },
    {
      label: 'About',
      href: '/en/about',
      blurb: 'A Romanian-owned agribusiness that works directly with farmers.',
      children: [
        {
          label: 'Agrinvest in figures',
          href: '/en/about/figures',
          description: 'With the source of every value',
        },
        {
          label: 'Golden Relationship',
          href: '/en/golden-relationship',
          description: 'Support for farms in difficulty',
        },
        { label: 'Partners', href: '/en/partners', description: 'Inputs, processing, lending' },
        { label: 'Careers', href: '/en/careers', description: 'Work with us' },
      ],
    },
  ],
  cta: {
    ro: { label: 'Contact', href: '/contact' },
    en: { label: 'Contact', href: '/en/contact' },
  },
}

/** Footer columns per language. */
export const footer = {
  ro: {
    columns: [
      {
        title: 'Pentru fermieri',
        links: [
          ['Vinde cereale', '/cereale'],
          ['Depozitare', '/depozitare'],
          ['Uscare și precurățare', '/depozitare/uscare'],
          ['Finanțare', '/finantare'],
          ['Logistică', '/logistica'],
        ],
      },
      {
        title: 'Companie',
        links: [
          ['Despre Agrinvest', '/despre'],
          ['Agrinvest în cifre', '/despre/cifre'],
          ['Golden Relationship', '/golden-relationship'],
          ['Parteneri', '/parteneri'],
          ['Cariere', '/cariere'],
        ],
      },
      {
        title: 'Ajutor',
        links: [
          ['Contact', '/contact'],
          ['Confidențialitate', '/confidentialitate'],
        ],
      },
    ],
    legal: 'Agrinvest SRL și Agrinvest Credit IFN SA, companii cu capital românesc.',
  },
  en: {
    columns: [
      {
        title: 'For farmers',
        links: [
          ['Grain', '/en/grain'],
          ['Storage', '/en/storage'],
          ['Drying and cleaning', '/en/storage/drying'],
          ['Financing', '/en/financing'],
          ['Logistics', '/en/logistics'],
        ],
      },
      {
        title: 'Company',
        links: [
          ['About Agrinvest', '/en/about'],
          ['Agrinvest in figures', '/en/about/figures'],
          ['Golden Relationship', '/en/golden-relationship'],
          ['Partners', '/en/partners'],
          ['Careers', '/en/careers'],
        ],
      },
      {
        title: 'Help',
        links: [
          ['Contact', '/en/contact'],
          ['Privacy', '/en/privacy'],
        ],
      },
    ],
    legal: 'Agrinvest SRL and Agrinvest Credit IFN SA, Romanian-owned companies.',
  },
} as const
