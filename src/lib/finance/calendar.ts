import type { Locale } from '@/i18n/config'
import { grainKeys } from '@/lib/crops'

/**
 * When instalments fall (figures register `F5.instalments`, confirmed by the owner): at most two
 * a year, after the summer and autumn harvests. The one setting the pages and the simulator use.
 * `cropKeys` are the `key` of the Crops collection, the same in every language.
 */
export const instalmentSeasons = {
  summer: {
    month: 8,
    cropKeys: ['barley', 'wheat', 'rapeseed'],
    label: { ro: 'După recolta de vară', en: 'After the summer harvest' },
    crops: { ro: 'orz, grâu, rapiță', en: 'barley, wheat, rapeseed' },
    when: { ro: 'iulie–august', en: 'July–August' },
  },
  autumn: {
    month: 11,
    cropKeys: ['sunflower', 'maize'],
    label: { ro: 'După recolta de toamnă', en: 'After the autumn harvest' },
    crops: { ro: 'floarea-soarelui, porumb', en: 'sunflower, maize' },
    when: { ro: 'octombrie–noiembrie', en: 'October–November' },
  },
} as const

export type Season = keyof typeof instalmentSeasons
export type HarvestCrop = (typeof instalmentSeasons)[Season]['cropKeys'][number]

/** The crops whose harvest an instalment can follow, in the order of harvest. */
export const harvestCrops: HarvestCrop[] = [...grainKeys]

export const harvestCropLabels: Record<HarvestCrop, Record<Locale, string>> = {
  barley: { ro: 'Orz', en: 'Barley' },
  wheat: { ro: 'Grâu', en: 'Wheat' },
  rapeseed: { ro: 'Rapiță', en: 'Rapeseed' },
  sunflower: { ro: 'Floarea-soarelui', en: 'Sunflower' },
  maize: { ro: 'Porumb', en: 'Maize' },
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
