/**
 * Article covers (home "Ghiduri și noutăți" carousel): one still per topic from Agrinvest's
 * 2022 brand film (x5wm8dXlJt4), instead of the five generic stills every guide shared.
 * Built by `npm run brand:covers` into `scripts/seed/assets/covers/{name}.webp`; footage
 * rights are pending like the other stills (docs/audit/agrinvest-inputs.md).
 *
 * `for` lists the Romanian slugs that get the cover while they have none (or still have one of
 * the old generic stills): the 20 Phase 6 briefs, the demo guides and the demo news.
 */
export type Cover = {
  /** Second in the 1080p film. A cover without one is a photo file (see `credit`). */
  at?: number
  /** Keep the top of the frame: the film burns its logo into the bottom of some shots. */
  top?: boolean
  alt: { ro: string; en: string }
  focalX: number
  focalY: number
  for: string[]
  /** Media credit for a photo that is not from the film, with its licence. */
  credit?: string
  /** Where the photo was found, to check its licence again. */
  source?: string
}

export const covers: Record<string, Cover> = {
  'cover-moisture-meter': {
    at: 98,
    alt: {
      ro: 'Umidometru de cereale în laboratorul unei baze Agrinvest',
      en: 'A grain moisture meter in an Agrinvest base laboratory',
    },
    focalX: 55,
    focalY: 55,
    for: ['umiditate-grau-standard', 'demo-umiditate-grau'],
  },
  'cover-grain-probe': {
    at: 240,
    alt: {
      ro: 'Probă de cereale luată la recepție',
      en: 'A grain sample taken at intake',
    },
    focalX: 45,
    focalY: 55,
    for: ['greutate-hectolitrica-grau'],
  },
  'cover-wheat-ears': {
    at: 12,
    top: true,
    alt: { ro: 'Spice de grâu copt, de aproape', en: 'Ripe wheat ears, close up' },
    focalX: 50,
    focalY: 40,
    for: ['calitate-grau-panificatie'],
  },
  'cover-weighbridge': {
    at: 242,
    alt: {
      ro: 'Camion Agrinvest pe cântarul unei baze, lângă silozuri',
      en: 'An Agrinvest truck on a base weighbridge, by the silos',
    },
    focalX: 42,
    focalY: 55,
    for: ['documente-vanzare-cereale', 'demo-acte-vanzare-cereale'],
  },
  'cover-harvest-unload': {
    at: 372,
    alt: {
      ro: 'Combină care descarcă grâu din mers într-o remorcă',
      en: 'A combine unloading wheat into a trailer on the move',
    },
    focalX: 50,
    focalY: 58,
    for: ['productie-grau-la-hectar'],
  },
  'cover-spreader': {
    at: 340,
    alt: {
      ro: 'Mașină de împrăștiat îngrășăminte Agrinvest, gata de lucru',
      en: 'An Agrinvest fertiliser spreader, ready to go',
    },
    focalX: 50,
    focalY: 55,
    for: ['fertilizare-grau', 'demo-fertilizare-grau'],
  },
  'cover-trial-plots': {
    at: 290,
    alt: {
      ro: 'Parcele de culturi diferite, văzute de sus',
      en: 'Fields of different crops, seen from above',
    },
    focalX: 50,
    focalY: 45,
    for: ['cel-mai-bun-hibrid-de-porumb', 'demo-hibrid-porumb'],
  },
  'cover-sowing': {
    at: 350,
    alt: {
      ro: 'Două tractoare la semănat pe teren pregătit',
      en: 'Two tractors sowing on a prepared field',
    },
    focalX: 55,
    focalY: 52,
    for: ['densitate-semanat-porumb', 'demo-densitate-porumb'],
  },
  'cover-row-crops': {
    at: 26,
    alt: {
      ro: 'Cultură prășitoare tânără, pe rânduri, lângă drum',
      en: 'A young row crop by the road',
    },
    focalX: 50,
    focalY: 65,
    for: ['tehnologia-de-cultura-a-porumbului', 'densitate-semanat-floarea-soarelui'],
  },
  'cover-tractor-cab': {
    at: 348,
    alt: {
      ro: 'Vedere din cabina tractorului la pregătirea terenului',
      en: 'The view from a tractor cab while preparing the field',
    },
    focalX: 50,
    focalY: 50,
    for: ['cand-se-seamana-graul'],
  },
  'cover-sunflower-harvest': {
    at: 264,
    alt: {
      ro: 'Recoltare de floarea-soarelui cu combine și camioane, văzută de sus',
      en: 'Sunflower harvest with combines and trucks, seen from above',
    },
    focalX: 45,
    focalY: 60,
    for: ['recoltare-floarea-soarelui', 'demo-recoltare-floarea-soarelui'],
  },
  'cover-stubble-sowing': {
    at: 362,
    alt: {
      ro: 'Tractor care lucrează miriștea după recoltare',
      en: 'A tractor working the stubble after harvest',
    },
    focalX: 55,
    focalY: 60,
    for: ['cand-se-seamana-rapita', 'daunatori-rapita-toamna', 'demo-semanat-rapita'],
  },
  'cover-combine-front': {
    at: 86,
    alt: {
      ro: 'Combină în lanul de păioase, din față',
      en: 'A combine in a cereal field, head-on',
    },
    focalX: 52,
    focalY: 50,
    for: ['orz-de-toamna-sau-de-primavara', 'demo-orz-toamna-primavara'],
  },
  'cover-silo-up': {
    at: 110,
    alt: {
      ro: 'Siloz metalic Agrinvest, văzut de jos',
      en: 'An Agrinvest steel silo, seen from below',
    },
    focalX: 55,
    focalY: 50,
    for: ['umiditate-depozitare-cereale', 'demo-umiditate-depozitare'],
  },
  'cover-silo-row': {
    at: 24,
    alt: {
      ro: 'Șir de silozuri și uscătorul unei baze Agrinvest',
      en: 'A row of silos and the dryer at an Agrinvest base',
    },
    focalX: 50,
    focalY: 45,
    for: ['cost-uscare-porumb'],
  },
  'cover-big-bags': {
    at: 158,
    alt: {
      ro: 'Saci big-bag Agrinvest pe paleți, în depozit',
      en: 'Agrinvest big bags on pallets in the warehouse',
    },
    focalX: 50,
    focalY: 50,
    for: ['azotat-sau-uree', 'demo-azotat-sau-uree'],
  },
  'cover-green-fields': {
    at: 288,
    alt: {
      ro: 'Culturi verzi de primăvară, văzute de sus',
      en: 'Green spring crops, seen from above',
    },
    focalX: 50,
    focalY: 55,
    for: ['erbicidare-porumb', 'demo-erbicidare-porumb'],
  },
  'cover-credit-office': {
    at: 338,
    alt: {
      ro: 'Discuție la biroul Agrinvest Credit',
      en: 'A meeting at the Agrinvest Credit office',
    },
    focalX: 65,
    focalY: 50,
    for: ['calendar-apia', 'demo-calendar-apia'],
  },
  'cover-grain-close': {
    at: 14,
    top: true,
    alt: { ro: 'Boabe de grâu, de aproape', en: 'Wheat grain, close up' },
    focalX: 50,
    focalY: 45,
    for: ['demo-grau'],
  },
  'cover-fuel-tanker': {
    at: 302,
    alt: {
      ro: 'Cisternă de motorină Agrinvest la bază',
      en: 'An Agrinvest diesel tanker at the base',
    },
    focalX: 40,
    focalY: 50,
    for: ['demo-motorina'],
  },
  'cover-intake': {
    at: 196,
    alt: {
      ro: 'Camion la punctul de descărcare al unei baze Agrinvest',
      en: 'A truck at the unloading point of an Agrinvest base',
    },
    focalX: 55,
    focalY: 55,
    for: ['demo-receptie'],
  },
  // Finance guides: CC0 photos found through Openverse (2026-11-26), not film stills.
  'cover-farm-storm': {
    alt: {
      ro: 'Hambar vechi lângă un lan verde, sub cer de furtună',
      en: 'An old barn by a green field under a stormy sky',
    },
    focalX: 50,
    focalY: 50,
    for: ['insolventa-sau-restructurare'],
    credit: 'rawpixel (CC0)',
    source: 'https://www.rawpixel.com/image/6079005/old-barn-stormy-skies-green-field-oregon',
  },
  'cover-paper-review': {
    alt: {
      ro: 'Două persoane citesc un contract la masă',
      en: 'Two people reading a contract at a table',
    },
    focalX: 50,
    focalY: 50,
    for: ['ifn-sau-banca'],
    credit: 'rawpixel (CC0)',
    source: 'https://www.rawpixel.com/image/5962416/free-public-domain-cc0-photo',
  },
  'cover-notebook': {
    alt: {
      ro: 'Caiet deschis și stilou pe o masă de lemn',
      en: 'An open notebook and a fountain pen on a wooden table',
    },
    focalX: 50,
    focalY: 50,
    for: ['glosar'],
    credit: 'Lia Leslie (StockSnap, CC0)',
    source: 'https://stocksnap.io/photo/notebook-notepad-2FS8R15QYN',
  },
  'cover-fields-roads': {
    alt: {
      ro: 'Parcele agricole și drumuri de câmp, văzute de sus',
      en: 'Farm plots and field roads seen from above',
    },
    focalX: 50,
    focalY: 50,
    for: ['cum-analizeaza-finantatorul-ferma'],
    credit: 'Ricardo Gomez Angel (StockSnap, CC0)',
    source: 'https://stocksnap.io/photo/green-field-U9C7YSOCO4',
  },
  'cover-new-combine': {
    alt: {
      ro: 'Combină într-un lan de păioase recoltat',
      en: 'A combine in a harvested cereal field',
    },
    focalX: 50,
    focalY: 50,
    for: ['credit-sau-leasing-utilaje'],
    credit: 'rawpixel (CC0)',
    source: 'https://www.rawpixel.com/image/6112660/photo-image-public-domain-plant-blue',
  },
  'cover-red-barn': {
    alt: { ro: 'Hambar de fermă roșu, toamna', en: 'A red farm barn in autumn' },
    focalX: 50,
    focalY: 50,
    for: ['credit-sau-grant-afir'],
    credit: 'rawpixel (CC0)',
    source: 'https://www.rawpixel.com/image/5935396/photo-image-nature-red-construction',
  },
  'cover-calculator': {
    alt: {
      ro: 'Calcul cu calculatorul și registrul pe birou',
      en: 'Working figures with a calculator and a ledger on a desk',
    },
    focalX: 50,
    focalY: 50,
    for: ['costul-real-al-creditului'],
    credit: 'Tevarak (StockSnap, CC0)',
    source: 'https://stocksnap.io/photo/calculator-calendar-RFVHCUGML3',
  },
  'cover-combine-unload': {
    alt: {
      ro: 'Combina descarcă grâul în remorca unui tractor',
      en: 'A combine unloading wheat into a tractor trailer',
    },
    focalX: 50,
    focalY: 50,
    for: ['cand-vinzi-recolta'],
    credit: 'rawpixel (CC0)',
    source: 'https://www.rawpixel.com/image/6112940/photo-image-public-domain-plant-nature',
  },
  'cover-farmland-aerial': {
    alt: {
      ro: 'Câmpie cu parcele agricole, văzută din avion',
      en: 'A plain of farm plots seen from the air',
    },
    focalX: 50,
    focalY: 50,
    for: ['plata-subventii-apia'],
    credit: 'rawpixel (CC0)',
    source: 'https://www.rawpixel.com/image/3293778/free-photo-image-aerial-view-aircraft',
  },
  'cover-contract-sign': {
    alt: { ro: 'Semnarea unui contract', en: 'Signing a contract' },
    focalX: 50,
    focalY: 50,
    for: ['fonduri-garantare'],
    credit: 'rawpixel (CC0)',
    source: 'https://www.rawpixel.com/image/5904897/photo-image-public-domain-hand-person',
  },
  'cover-sunflower-field': {
    alt: { ro: 'Lan de floarea-soarelui în floare', en: 'A sunflower field in bloom' },
    focalX: 50,
    focalY: 50,
    for: ['credit-adeverinta-apia'],
    credit: 'Designecologist (StockSnap, CC0)',
    source: 'https://stocksnap.io/photo/sunflower-field-WLBC00ACIK',
  },
}

/** The old generic stills: a guide that still shows one of them gets its topic cover. */
export const genericStill = /^(harvest-sunflower|combine|team|fleet|grain-reception)(-\d+)?\.webp$/

/** Romanian slug → cover name. */
export const coverBySlug = new Map(
  Object.entries(covers).flatMap(([name, c]) => c.for.map((slug) => [slug, name] as const)),
)
