import type { Locale } from '@/i18n/config'

/**
 * When instalments fall (figures register `F5.instalments`, confirmed by the owner): at most two
 * a year, after the summer and autumn harvests. The one setting the pages and the simulator use.
 * `cropKeys` are the `key` of the Crops collection, the same in every language.
 */
export const instalmentSeasons = {
  summer: {
    month: 8,
    cropKeys: ['wheat', 'barley', 'rapeseed'],
    label: { ro: 'După recolta de vară', en: 'After the summer harvest' },
    crops: { ro: 'grâu, orz, rapiță', en: 'wheat, barley, rapeseed' },
    when: { ro: 'iulie–august', en: 'July–August' },
  },
  autumn: {
    month: 11,
    cropKeys: ['maize', 'sunflower'],
    label: { ro: 'După recolta de toamnă', en: 'After the autumn harvest' },
    crops: { ro: 'porumb, floarea-soarelui', en: 'maize, sunflower' },
    when: { ro: 'octombrie–noiembrie', en: 'October–November' },
  },
} as const

export type Season = keyof typeof instalmentSeasons
export type HarvestCrop = (typeof instalmentSeasons)[Season]['cropKeys'][number]

/** The crops whose harvest an instalment can follow, in display order. */
export const harvestCrops: HarvestCrop[] = ['wheat', 'barley', 'rapeseed', 'maize', 'sunflower']

export const harvestCropLabels: Record<HarvestCrop, Record<Locale, string>> = {
  wheat: { ro: 'Grâu', en: 'Wheat' },
  barley: { ro: 'Orz', en: 'Barley' },
  rapeseed: { ro: 'Rapiță', en: 'Rapeseed' },
  maize: { ro: 'Porumb', en: 'Maize' },
  sunflower: { ro: 'Floarea-soarelui', en: 'Sunflower' },
}

export const seasonOf = (crop: HarvestCrop): Season =>
  (Object.keys(instalmentSeasons) as Season[]).find((s) =>
    (instalmentSeasons[s].cropKeys as readonly string[]).includes(crop),
  )!

export const calendarRows = (locale: Locale) =>
  Object.values(instalmentSeasons).map((s) => ({
    label: s.label[locale],
    crops: s.crops[locale],
    when: s.when[locale],
  }))
