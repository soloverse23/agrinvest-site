/** What the finance tools may offer, read from published content (server only, not actions). */
import type { Locale } from '@/i18n/config'
import { listFinanceProducts } from '@/lib/content/finance'
import { getFigures } from '@/lib/content/globals'
import { listCounties, listCrops } from '@/lib/content/locations'

import type { ApplicationChoices } from './application'
import { harvestCrops, type HarvestCrop } from './calendar'

/** The longest term, from the register (`F5.term`, in years). */
export const maxTermMonths = async (locale: Locale) => {
  const years = (await getFigures(locale))['F5.term']?.number
  return (typeof years === 'number' && years > 0 ? years : 10) * 12
}

/** What the form may choose from: published products, counties and harvest crops only. */
export async function applicationChoices(locale: Locale): Promise<ApplicationChoices> {
  const [products, counties, crops, maxMonths] = await Promise.all([
    listFinanceProducts(locale),
    listCounties(),
    listCrops(locale),
    maxTermMonths(locale),
  ])
  const cropIds: ApplicationChoices['crops'] = {}
  for (const c of crops)
    if ((harvestCrops as string[]).includes(c.key)) cropIds[c.key as HarvestCrop] = c.id
  return {
    products: products.map((p) => p.id),
    counties: counties.map((c) => c.id),
    crops: cropIds,
    maxMonths,
  }
}
