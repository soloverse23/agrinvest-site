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
  /** Second in the 1080p film. */
  at: number
  /** Keep the top of the frame: the film burns its logo into the bottom of some shots. */
  top?: boolean
  alt: { ro: string; en: string }
  focalX: number
  focalY: number
  for: string[]
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
}

/** The old generic stills: a guide that still shows one of them gets its topic cover. */
export const genericStill = /^(harvest-sunflower|combine|team|fleet|grain-reception)(-\d+)?\.webp$/

/** Romanian slug → cover name. */
export const coverBySlug = new Map(
  Object.entries(covers).flatMap(([name, c]) => c.for.map((slug) => [slug, name] as const)),
)
