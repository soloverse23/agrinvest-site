import type { Locale } from '@/i18n/config'

/**
 * The rules the net-price calculator applies, each with its source and the day it was last
 * checked. Pages print them under the result; `check:tools` (5.8) fails when a check is more
 * than a year old. Change a rule here, never in the page.
 *
 * Checked 2026-11-10. EUR-Lex (Delegated Regulation (EU) 2016/1238, the intervention quality
 * limits) answered with empty pages that day, so no legal limit is quoted: the base limits
 * come from Agrinvest's published reception limits (`Crops.quality`) or from the farmer's
 * own contract.
 */
export type RuleSource = {
  id: string
  title: Record<Locale, string>
  url: string
  /** ISO day the source was last read. */
  checked: string
}

export type NetPriceRule = {
  id: 'moisture' | 'impurities' | 'hectolitre' | 'limits'
  title: Record<Locale, string>
  body: Record<Locale, string>
  sources: RuleSource['id'][]
}

export const netPriceSources: RuleSource[] = [
  {
    id: 'fao-drying',
    title: {
      ro: 'FAO, „Basic principles of grain drying” (Bakker-Arkema), în „Mycotoxin prevention and control in foodgrains”',
      en: 'FAO, “Basic principles of grain drying” (Bakker-Arkema), in “Mycotoxin prevention and control in foodgrains”',
    },
    url: 'https://www.fao.org/4/x5036e/x5036e10.htm',
    checked: '2026-11-10',
  },
  {
    id: 'reception-limits',
    title: {
      ro: 'Limitele de recepție Agrinvest, pe pagina fiecărei culturi, sau limitele din contractul tău',
      en: 'Agrinvest’s reception limits on each crop page, or the limits in your contract',
    },
    url: '/cereale',
    checked: '2026-11-10',
  },
]

export const netPriceRules: NetPriceRule[] = [
  {
    id: 'moisture',
    title: { ro: 'Scăzământul la umiditate', en: 'Moisture deduction' },
    body: {
      ro: 'Peste umiditatea de bază, cantitatea se reduce cât apă ar pierde marfa uscată până la bază, păstrând substanța uscată: cantitate × (100 − umiditate măsurată) / (100 − umiditate de bază). Exemplu FAO: de la 22 % la 13 % se elimină 103,5 kg de apă la tonă; formula dă 103,4 kg.',
      en: 'Above the base moisture, the quantity is reduced by the water the grain would lose drying down to the base, keeping its dry matter: quantity × (100 − measured moisture) / (100 − base moisture). FAO’s example: drying from 22% to 13% removes 103.5 kg of water per tonne; the formula gives 103.4 kg.',
    },
    sources: ['fao-drying'],
  },
  {
    id: 'impurities',
    title: { ro: 'Scăzământul la impurități', en: 'Impurities deduction' },
    body: {
      ro: 'Peste impuritățile admise, se scade partea care depășește limita, cu aceeași proporție: cantitate × (100 − impurități măsurate) / (100 − impurități admise). Se aplică după scăzământul la umiditate.',
      en: 'Above the allowed impurities, the excess is taken off in the same proportion: quantity × (100 − measured impurities) / (100 − allowed impurities). It applies after the moisture deduction.',
    },
    sources: ['reception-limits'],
  },
  {
    id: 'hectolitre',
    title: { ro: 'Masa hectolitrică', en: 'Hectolitre weight' },
    body: {
      ro: 'Masa hectolitrică nu scade din cantitate. Sub minimul din contract, prețul se negociază sau se aplică reducerea scrisă în contract; calculatorul doar te anunță.',
      en: 'Hectolitre weight does not reduce the quantity. Below the contract minimum, the price is negotiated or the contract’s own discount applies; the calculator only warns you.',
    },
    sources: ['reception-limits'],
  },
  {
    id: 'limits',
    title: { ro: 'De unde vin limitele', en: 'Where the limits come from' },
    body: {
      ro: 'Când Agrinvest a publicat limitele de recepție pentru cultură, formularul le completează. Altfel, scrie limitele din contractul tău. Calculatorul nu presupune nicio limită.',
      en: 'When Agrinvest has published the reception limits for the crop, the form fills them in. Otherwise, type the limits from your contract. The calculator never assumes a limit.',
    },
    sources: ['reception-limits'],
  },
]
