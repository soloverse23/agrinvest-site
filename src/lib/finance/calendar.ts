import type { Locale } from '@/i18n/config'

/**
 * When instalments fall (figures register `F5.instalments`, confirmed by the owner): at most two
 * a year, after the summer and autumn harvests. The one setting the pages and the simulator use.
 */
export const instalmentSeasons = {
  summer: {
    month: 8,
    label: { ro: 'După recolta de vară', en: 'After the summer harvest' },
    crops: { ro: 'grâu, orz, rapiță', en: 'wheat, barley, rapeseed' },
    when: { ro: 'iulie–august', en: 'July–August' },
  },
  autumn: {
    month: 11,
    label: { ro: 'După recolta de toamnă', en: 'After the autumn harvest' },
    crops: { ro: 'porumb, floarea-soarelui', en: 'maize, sunflower' },
    when: { ro: 'octombrie–noiembrie', en: 'October–November' },
  },
} as const

export const calendarRows = (locale: Locale) =>
  Object.values(instalmentSeasons).map((s) => ({
    label: s.label[locale],
    crops: s.crops[locale],
    when: s.when[locale],
  }))
