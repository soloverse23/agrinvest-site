/**
 * Seed content for Phase 2. Values come from `docs/audit/figures-register.md` (collected
 * 2026-11-02) and stay "to confirm" until Agrinvest approves them; the status of each figure
 * is read from the register itself, not from this file.
 */
type L = { ro: string; en: string }

export type FigureSeed = {
  key: string
  label: L
  value: L
  number?: number
  unit?: L
  source: string
}

export const figures: FigureSeed[] = [
  {
    key: 'C1',
    label: { ro: 'Anul înființării', en: 'Founded' },
    value: { ro: '2003, la Buzău', en: '2003, in Buzău' },
    number: 2003,
    source: 'agrinvest.ro/despre-noi/',
  },
  {
    key: 'C3',
    label: { ro: 'Sediul central și social', en: 'Head and registered office' },
    value: { ro: 'Buzău, Tarlaua 41, Parcela 724', en: 'Buzău, Tarlaua 41, Parcela 724' },
    source: 'agrinvest.ro footer',
  },
  {
    key: 'C4',
    label: { ro: 'Județe în care suntem prezenți', en: 'Counties served' },
    value: { ro: '11', en: '11' },
    number: 11,
    source: 'despre-noi',
  },
  {
    key: 'C5',
    label: { ro: 'Capital', en: 'Capital' },
    value: { ro: '100% românesc', en: '100% Romanian' },
    number: 100,
    unit: { ro: '%', en: '%' },
    source: 'agrointel (Mar 2025)',
  },
  {
    key: 'C7',
    label: { ro: 'Cereale achiziționate', en: 'Grain we buy' },
    value: {
      ro: 'grâu, orz, rapiță, floarea-soarelui, porumb, triticale, soia, mazăre',
      en: 'wheat, barley, rapeseed, sunflower, corn, triticale, soy, peas',
    },
    source: 'trading-cereale',
  },
  {
    key: 'C8',
    label: { ro: 'Plata cerealelor', en: 'Payment for grain' },
    value: { ro: 'imediat după recepție', en: 'immediately after reception' },
    source: 'flota-proprie',
  },
  {
    key: 'C9.email',
    label: { ro: 'E-mail', en: 'Email' },
    value: { ro: 'office@agrinvest.ro', en: 'office@agrinvest.ro' },
    source: 'site header/footer',
  },
  {
    key: 'S1',
    label: { ro: 'Silozuri și depozite de cereale', en: 'Silos and grain warehouses' },
    value: { ro: '17', en: '17' },
    number: 17,
    source: 'silozuri, trading-cereale, despre-noi',
  },
  {
    key: 'S2',
    label: { ro: 'Capacitate totală de depozitare', en: 'Total storage capacity' },
    value: { ro: '275.000 t', en: '275,000 t' },
    number: 275000,
    unit: { ro: 't', en: 't' },
    source: 'silozuri',
  },
  {
    key: 'L1',
    label: { ro: 'Camioane proprii', en: 'Own trucks' },
    value: { ro: '55', en: '55' },
    number: 55,
    source: 'flota-proprie, despre-noi',
  },
  {
    key: 'L2',
    label: { ro: 'Alte vehicule', en: 'Other vehicles' },
    value: {
      ro: '1 cisternă de îngrășăminte lichide, 2 dube și 70 de alte vehicule',
      en: '1 liquid fertiliser tanker, 2 vans and 70 other vehicles',
    },
    source: 'flota-proprie',
  },
  {
    key: 'C10',
    label: { ro: 'Teren arabil', en: 'Arable land' },
    value: {
      ro: '9.000 ha, peste 50% în proprietatea directă a companiei',
      en: '9,000 ha, over 50% owned directly by the company',
    },
    number: 9000,
    unit: { ro: 'ha', en: 'ha' },
    source: 'owner, 2026-11-05',
  },
  {
    key: 'F1',
    label: { ro: 'Registrul Special BNR', en: 'BNR Special Register' },
    value: { ro: 'RS-PJR-42-040132 (07.03.2023)', en: 'RS-PJR-42-040132 (07.03.2023)' },
    source: 'agrinvest.ro/servicii-ifn/',
  },
  {
    key: 'F2.cui',
    label: { ro: 'CUI Agrinvest Credit IFN', en: 'Agrinvest Credit IFN tax ID' },
    value: { ro: '41531140', en: '41531140' },
    source: 'servicii-ifn',
  },
  {
    key: 'F2.reg',
    label: { ro: 'Nr. Registrul Comerțului IFN', en: 'IFN trade register no.' },
    value: { ro: 'J2019003620232', en: 'J2019003620232' },
    source: 'servicii-ifn',
  },
  {
    key: 'F3',
    label: { ro: 'Finanțăm din', en: 'Lending since' },
    value: { ro: '1 februarie 2020', en: '1 February 2020' },
    source: 'servicii-ifn, press',
  },
  {
    key: 'F4.reply',
    label: { ro: 'Răspuns la cerere', en: 'Reply to an application' },
    value: { ro: 'în 24 h de la dosarul complet', en: 'within 24 h of complete documents' },
    number: 24,
    unit: { ro: 'h', en: 'h' },
    source: 'servicii-ifn; agrointel 03.06.2026',
  },
  {
    key: 'F4.money',
    label: { ro: 'Banii după semnare', en: 'Money after signing' },
    value: { ro: 'în maximum 3 zile de la semnare', en: 'within 3 days of signing' },
    number: 3,
    unit: { ro: 'zile', en: 'days' },
    source: 'servicii-ifn; the 2026 statements say 24 h',
  },
  {
    key: 'F5.term',
    label: { ro: 'Durata maximă', en: 'Longest term' },
    value: {
      ro: 'până la 10 ani pentru creditele de investiții',
      en: 'up to 10 years for investment credit',
    },
    number: 10,
    unit: { ro: 'ani', en: 'years' },
    source: 'agrointel 03.06.2026; Agro TV 16.06.2026',
  },
  {
    key: 'F5.instalments',
    label: { ro: 'Rate', en: 'Instalments' },
    value: {
      ro: 'maximum 2 rate pe an, după recoltele de vară și de toamnă',
      en: 'at most 2 instalments a year, after the summer and autumn harvests',
    },
    number: 2,
    source: 'servicii-ifn',
  },
  {
    key: 'F6',
    label: { ro: 'Clienți finanțați', en: 'Clients financed' },
    value: { ro: 'peste 500', en: 'over 500' },
    number: 500,
    source: 'agrointel, Mar 2025',
  },
  {
    key: 'F7.registered',
    label: { ro: 'Sediul social IFN', en: 'IFN registered office' },
    value: {
      ro: 'Bd. Pipera nr. 1 I, et. 4, Voluntari, Ilfov',
      en: 'Bd. Pipera nr. 1 I, floor 4, Voluntari, Ilfov',
    },
    source: 'ANAF 2026-11-05; servicii-ifn',
  },
  {
    key: 'F7.office',
    label: { ro: 'Birou IFN', en: 'IFN office' },
    value: {
      ro: 'Bd. Pipera nr. 1/1, et. 5, Voluntari, Ilfov',
      en: 'Bd. Pipera nr. 1/1, floor 5, Voluntari, Ilfov',
    },
    source: 'servicii-ifn',
  },
  {
    key: 'F8.phone',
    label: { ro: 'Telefon IFN', en: 'IFN phone' },
    value: { ro: '+40 799 203 033', en: '+40 799 203 033' },
    source: 'servicii-ifn',
  },
  {
    key: 'F8.email',
    label: { ro: 'E-mail IFN', en: 'IFN email' },
    value: { ro: 'office.ifn@agrinvest.ro', en: 'office.ifn@agrinvest.ro' },
    source: 'servicii-ifn',
  },
  {
    key: 'F8.dpo',
    label: { ro: 'Protecția datelor IFN', en: 'IFN data protection' },
    value: { ro: 'dpo@agrinvest.ro', en: 'dpo@agrinvest.ro' },
    source: 'servicii-ifn',
  },
  {
    key: 'F9',
    label: { ro: 'Reducerea marjei de dobândă', en: 'Interest margin reduction' },
    value: {
      ro: 'până la 10% din marja de dobândă, dacă respecți contractul și graficul de rambursare',
      en: 'up to 10% of the interest margin, for keeping to the contract and repayment schedule',
    },
    number: 10,
    unit: { ro: '%', en: '%' },
    source: 'agrointel 03.06.2026; Agro TV 16.06.2026',
  },
  {
    key: 'F10',
    label: { ro: 'Credit pe contracte de vânzare', en: 'Credit on sale contracts' },
    value: { ro: 'până la 35% din valoarea contractului', en: 'up to 35% of the contract value' },
    number: 35,
    unit: { ro: '%', en: '%' },
    source: 'Financial Intelligence 27.01.2022',
  },
  {
    key: 'F11',
    label: { ro: 'Subvenții APIA ca garanție', en: 'APIA subsidies as collateral' },
    value: {
      ro: 'până la 200% din sumele de încasat de la APIA',
      en: 'up to 200% of the amounts due from APIA',
    },
    number: 200,
    unit: { ro: '%', en: '%' },
    source: 'press 2022',
  },
  {
    key: 'F12',
    label: { ro: 'Producție agroalimentară', en: 'Agri-food production' },
    value: {
      ro: 'din 2024: carne, lapte și lactate, panificație și patiserie, nutrețuri combinate',
      en: 'since 2024: meat, milk and dairy, bakery and pastry, compound feed',
    },
    source: 'agrointel 11.03.2025',
  },
  {
    key: 'F14',
    label: { ro: 'Plata cu produse agricole', en: 'Payment in farm produce' },
    value: {
      ro: 'o parte din achizițiile de cereale vin de la fermieri care au primit sprijin pentru înființarea culturilor și își achită datoria cu produse agricole, la recoltare',
      en: 'part of the grain bought comes from farmers who received support to establish their crops and settle the debt in farm produce at harvest',
    },
    source: 'agrinvest.ro/flota-proprie/',
  },
]

/** Counties named for the collection points (C4). Centroid = county seat, approximate. */
export const counties = [
  { name: 'Buzău', code: 'BZ', at: [26.82, 45.15] },
  { name: 'Ialomița', code: 'IL', at: [27.36, 44.56] },
  { name: 'Prahova', code: 'PH', at: [26.02, 44.94] },
  { name: 'Giurgiu', code: 'GR', at: [25.97, 43.9] },
  { name: 'Teleorman', code: 'TR', at: [25.33, 43.97] },
  { name: 'Dolj', code: 'DJ', at: [23.8, 44.32] },
  { name: 'Argeș', code: 'AG', at: [24.87, 44.86] },
  { name: 'Galați', code: 'GL', at: [28.01, 45.43] },
  { name: 'Brăila', code: 'BR', at: [27.96, 45.27] },
  { name: 'Vaslui', code: 'VS', at: [27.73, 46.64] },
  { name: 'Tulcea', code: 'TL', at: [28.8, 45.18] },
] as const

/** Bases with their published capacities (S3). County, address and contact: not published (S4). */
export const bases = [
  ['Balaci', 10000],
  ['Baraitaru', 6000],
  ['Cetate', 7000],
  ['Crețești', 20000],
  ['Foltești', 10000],
  ['Fulga', 13000],
  ['Grădiștea', 13000],
  ['Mihăilești', 13500],
  ['Pogoanele', 86000],
  ['Sărățuica', 18000],
  ['Slobozia Mândră', 8000],
  ['Știubei', 5000],
  ['Stolnici', 8500],
  ['Strejnicu', 8000],
  ['Traian', 6500],
  ['Valea Nucarilor', 2000],
  ['Vedea', 17500],
] as const

export const crops = [
  { key: 'wheat', name: { ro: 'Grâu', en: 'Wheat' }, slug: { ro: 'grau', en: 'wheat' } },
  { key: 'maize', name: { ro: 'Porumb', en: 'Corn' }, slug: { ro: 'porumb', en: 'corn' } },
  {
    key: 'sunflower',
    name: { ro: 'Floarea-soarelui', en: 'Sunflower' },
    slug: { ro: 'floarea-soarelui', en: 'sunflower' },
  },
  {
    key: 'rapeseed',
    name: { ro: 'Rapiță', en: 'Rapeseed' },
    slug: { ro: 'rapita', en: 'rapeseed' },
  },
  { key: 'barley', name: { ro: 'Orz', en: 'Barley' }, slug: { ro: 'orz', en: 'barley' } },
] as const

/** Crops the shop's products are used on, which Agrinvest does not buy: no grain pages. */
export const shopCrops = [
  { key: 'soybean', name: { ro: 'Soia', en: 'Soybean' }, slug: { ro: 'soia', en: 'soybean' } },
  {
    key: 'triticale',
    name: { ro: 'Triticale', en: 'Triticale' },
    slug: { ro: 'triticale', en: 'triticale' },
  },
  { key: 'rye', name: { ro: 'Secară', en: 'Rye' }, slug: { ro: 'secara', en: 'rye' } },
  { key: 'peas', name: { ro: 'Mazăre', en: 'Peas' }, slug: { ro: 'mazare', en: 'peas' } },
  { key: 'chickpea', name: { ro: 'Năut', en: 'Chickpea' }, slug: { ro: 'naut', en: 'chickpea' } },
  { key: 'potato', name: { ro: 'Cartof', en: 'Potato' }, slug: { ro: 'cartof', en: 'potato' } },
  {
    key: 'sugar-beet',
    name: { ro: 'Sfeclă de zahăr', en: 'Sugar beet' },
    slug: { ro: 'sfecla-de-zahar', en: 'sugar-beet' },
  },
  {
    key: 'alfalfa',
    name: { ro: 'Lucernă', en: 'Alfalfa' },
    slug: { ro: 'lucerna', en: 'alfalfa' },
  },
  {
    key: 'vegetables',
    name: { ro: 'Legume', en: 'Vegetables' },
    slug: { ro: 'legume', en: 'vegetables' },
  },
  {
    key: 'fruit-trees',
    name: { ro: 'Pomi fructiferi', en: 'Fruit trees' },
    slug: { ro: 'pomi-fructiferi', en: 'fruit-trees' },
  },
  {
    key: 'grapevine',
    name: { ro: 'Viță de vie', en: 'Grapevine' },
    slug: { ro: 'vita-de-vie', en: 'grapevine' },
  },
] as const

/** The shop's category tree, in menu order. `pesticide` from the old shop is retired. */
export const categories = [
  {
    name: { ro: 'Semințe', en: 'Seeds' },
    slug: { ro: 'seminte', en: 'seeds' },
    role: 'category',
    icon: 'leaf',
    intro: {
      ro: 'Sămânță certificată de grâu, orz, rapiță și năut, cu soiul, clasa biologică și ambalajul fiecărui produs.',
      en: 'Certified wheat, barley, rapeseed and chickpea seed, with the variety, seed class and pack of each product.',
    },
  },
  {
    name: { ro: 'Protecția plantelor', en: 'Crop protection' },
    slug: { ro: 'protectia-plantelor', en: 'crop-protection' },
    role: 'group',
    icon: 'drop',
    intro: {
      ro: 'Erbicide, fungicide, insecticide, tratamente pentru sămânță și adjuvanți, cu substanța activă și dozele pe cultură.',
      en: 'Herbicides, fungicides, insecticides, seed treatments and adjuvants, with the active ingredient and doses by crop.',
    },
  },
  {
    name: { ro: 'Erbicide', en: 'Herbicides' },
    slug: { ro: 'erbicide', en: 'herbicides' },
    role: 'category',
    parent: 'protectia-plantelor',
    intro: {
      ro: 'Erbicide pentru cereale, porumb, floarea-soarelui și rapiță. Alege după cultură, substanța activă și momentul aplicării.',
      en: 'Herbicides for cereals, maize, sunflower and rapeseed. Choose by crop, active ingredient and application timing.',
    },
  },
  {
    name: { ro: 'Fungicide', en: 'Fungicides' },
    slug: { ro: 'fungicide', en: 'fungicides' },
    role: 'category',
    parent: 'protectia-plantelor',
    intro: {
      ro: 'Fungicide pentru combaterea bolilor din culturile de câmp, cu dozele și stadiile de aplicare pe fiecare cultură.',
      en: 'Fungicides against diseases of field crops, with doses and application stages for each crop.',
    },
  },
  {
    name: { ro: 'Insecticide', en: 'Insecticides' },
    slug: { ro: 'insecticide', en: 'insecticides' },
    role: 'category',
    parent: 'protectia-plantelor',
    intro: {
      ro: 'Insecticide pentru dăunătorii din culturile de câmp, cu substanța activă, doza și timpul de pauză al fiecărui produs.',
      en: 'Insecticides against pests of field crops, with the active ingredient, dose and waiting period of each product.',
    },
  },
  {
    name: { ro: 'Tratament sămânță', en: 'Seed treatment' },
    slug: { ro: 'tratament-samanta', en: 'seed-treatment' },
    role: 'category',
    parent: 'protectia-plantelor',
    intro: {
      ro: 'Produse pentru tratarea seminței înainte de semănat, cu doza la 100 kg de sămânță și bolile combătute.',
      en: 'Products for treating seed before sowing, with the dose per 100 kg of seed and the diseases they control.',
    },
  },
  {
    name: { ro: 'Adjuvanți', en: 'Adjuvants' },
    slug: { ro: 'adjuvanti', en: 'adjuvants' },
    role: 'category',
    parent: 'protectia-plantelor',
    intro: {
      ro: 'Adjuvanți care se aplică împreună cu tratamentele, pentru o acoperire mai bună a frunzelor și pierderi mai mici.',
      en: 'Adjuvants applied with crop protection treatments, for better leaf coverage and lower losses.',
    },
  },
  {
    name: { ro: 'Regulatori de creștere', en: 'Growth regulators' },
    slug: { ro: 'regulatori-de-crestere', en: 'growth-regulators' },
    role: 'category',
    parent: 'protectia-plantelor',
    intro: {
      ro: 'Regulatori de creștere pentru cereale, cu dozele și stadiile de aplicare recomandate pe cultură.',
      en: 'Growth regulators for cereals, with the recommended doses and application stages by crop.',
    },
  },
  {
    name: { ro: 'Nutriție', en: 'Plant nutrition' },
    slug: { ro: 'nutritie', en: 'plant-nutrition' },
    role: 'group',
    icon: 'scale',
    intro: {
      ro: 'Îngrășăminte granulate și fertilizanți foliari pentru nutriția culturilor, cu compoziția și ambalajul fiecărui produs.',
      en: 'Granular fertilisers and foliar products for crop nutrition, with the composition and pack of each product.',
    },
  },
  {
    name: { ro: 'Îngrășăminte', en: 'Fertilisers' },
    slug: { ro: 'ingrasaminte', en: 'fertilisers' },
    role: 'category',
    parent: 'nutritie',
    intro: {
      ro: 'Îngrășăminte cu azot și fosfor, în saci mari sau ambalaje mici, inclusiv produse pentru agricultura ecologică.',
      en: 'Nitrogen and phosphorus fertilisers in big bags or small packs, including products for organic farming.',
    },
  },
  {
    name: { ro: 'Fertilizanți foliari', en: 'Foliar fertilisers' },
    slug: { ro: 'fertilizanti-foliare', en: 'foliar-fertilisers' },
    role: 'category',
    parent: 'nutritie',
    intro: {
      ro: 'Fertilizanți foliari cu macro și microelemente, pentru corectarea carențelor în perioada de vegetație.',
      en: 'Foliar fertilisers with macro and micronutrients, for correcting deficiencies during the growing season.',
    },
  },
  {
    name: { ro: 'Agricultură bio', en: 'Organic farming' },
    slug: { ro: 'agricultura-bio', en: 'organic-farming' },
    role: 'theme',
    icon: 'leaf',
    intro: {
      ro: 'Produse pentru fermele ecologice: îngrășăminte biologice și roci naturale, cu compoziția și modul de folosire.',
      en: 'Products for organic farms: biological fertilisers and natural rock, with composition and how to use them.',
    },
  },
] as const

/** People named in the audit. No phone or email is public until each person agrees. */
export const people = [
  {
    key: 'office',
    name: 'Agrinvest',
    role: { ro: 'Birou comercial', en: 'Commercial office' },
    email: 'office@agrinvest.ro',
  },
  {
    key: 'ifn',
    name: 'Agrinvest Credit IFN',
    role: { ro: 'Finanțare', en: 'Financing' },
    phone: '+40 799 203 033',
    email: 'office.ifn@agrinvest.ro',
  },
  {
    key: 'logistics',
    name: 'Toma Ion',
    role: { ro: 'Director ADT – Logistică', en: 'Logistics director' },
    phone: '0741 201 056',
  },
  {
    key: 'agronomist',
    name: 'Dan N. Săvoiu',
    role: { ro: 'Inginer agronom', en: 'Agronomist' },
    author: true,
  },
  {
    key: 'ifn-ceo',
    name: 'Andra Pârvan',
    role: { ro: 'Director General, Agrinvest Credit IFN', en: 'CEO, Agrinvest Credit IFN' },
  },
  {
    key: 'ifn-cfo',
    name: 'Mădălina Fofircă',
    role: { ro: 'Director Financiar, Agrinvest Credit IFN', en: 'CFO, Agrinvest Credit IFN' },
  },
] as const

/** Lead type → person key. Everything else goes to the commercial office. */
export const routes = { finantare: 'ifn', logistica: 'logistics', general: 'office' } as const

export const sameAs = [
  'https://www.facebook.com/agrinvestromania',
  'https://www.instagram.com/agrinvest.ro',
  'https://www.linkedin.com/company/sc-agrinvest-srl',
  'https://www.tiktok.com/@agrinvest.srl',
  'https://www.youtube.com/@agrinvestromania2727',
]
