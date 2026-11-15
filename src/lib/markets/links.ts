import type { Locale } from '@/i18n/config'
import { cropPricePath, fertiliserPricesPath, marketPagePath } from '@/i18n/routes'
import { listCrops } from '@/lib/content/locations'
import { isGrainKey } from '@/lib/crops'

import { cropMarkets, type MarketKey } from './registry'

/** The page a market's tile links to (crop slugs come from the CMS). */
export async function marketHrefs(locale: Locale): Promise<Partial<Record<MarketKey, string>>> {
  const crops = await listCrops(locale)
  const out: Partial<Record<MarketKey, string>> = {
    brent: marketPagePath('brent', locale),
    'diesel-ro': marketPagePath('fuel', locale),
    'petrol-ro': marketPagePath('fuel', locale),
    'diesel-eu': marketPagePath('fuel', locale),
    'petrol-eu': marketPagePath('fuel', locale),
    'gas-eu': marketPagePath('gas', locale),
    urea: fertiliserPricesPath(locale),
    dap: fertiliserPricesPath(locale),
    tsp: fertiliserPricesPath(locale),
    potash: fertiliserPricesPath(locale),
    'eur-ron': marketPagePath('fx', locale),
    'eur-usd': marketPagePath('fx', locale),
    'usd-ron': marketPagePath('fx', locale),
  }
  for (const c of crops)
    if (isGrainKey(c.key))
      for (const k of cropMarkets[c.key]) out[k] ??= cropPricePath(c.slug as string, locale)
  return out
}
