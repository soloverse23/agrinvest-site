import type { Locale } from './config'

/**
 * Words of the fertiliser prices, diesel and news pages and of the home "Today" row (Phase 5).
 * Numbers never live here: they come from the shop, `DieselPrices`, `MarketPrices` and
 * `NewsItems`.
 */
export const toolsUi = {
  ro: {
    fert: {
      title: 'Prețuri îngrășăminte',
      seoTitle: 'Prețuri îngrășăminte: azotat, uree, NPK, foliare',
      description:
        'Prețurile îngrășămintelor din magazinul Agrinvest, pe ambalaj și pe kilogram, cu legătură spre fiecare produs.',
      summary:
        'Prețul fiecărui îngrășământ din magazinul Agrinvest, pe ambalaj și pe kilogram sau litru. Fiecare rând duce la pagina produsului.',
      product: 'Produs',
      pack: 'Ambalaj',
      price: 'Preț',
      perUnit: 'Pe kg / l',
      noPrice: 'la cerere',
      updated: 'Prețuri actualizate la',
      note: 'Prețurile marcate „de confirmat” sunt orientative; un consultant confirmă prețul și stocul înainte de facturare.',
      shop: 'Toate îngrășămintele din magazin',
      empty: 'Nu avem încă îngrășăminte cu preț publicat.',
      dataset: 'Prețuri îngrășăminte în magazinul Agrinvest',
      datasetDescription:
        'Prețurile îngrășămintelor vândute de Agrinvest, pe ambalaj, în lei cu TVA, și prețul pe kilogram sau litru.',
    },
    diesel: {
      title: 'Motorină pentru fermieri',
      seoTitle: 'Motorină pentru fermieri: preț și livrare la fermă',
      description:
        'Cere o ofertă de motorină livrată la fermă. Prețul Agrinvest când e publicat și prețul național săptămânal din Weekly Oil Bulletin al Comisiei Europene.',
      summary:
        'Livrăm motorină la fermă. Vezi prețul Agrinvest, când e publicat, și prețul mediu din România pe săptămână, apoi cere o ofertă pentru cantitatea ta.',
      ownTitle: 'Prețul Agrinvest',
      ownLead: 'Lei pe litru, pentru livrare la fermă.',
      onRequest: 'Preț la cerere',
      onRequestBody:
        'Prețul depinde de cantitate, de județ și de data livrării. Trimite cererea de mai jos și te sunăm cu oferta.',
      vat: { 'fara-tva': 'fără TVA', 'cu-tva': 'cu TVA' },
      validFrom: 'Valabil din',
      minimum: (l: string) => `Comandă minimă: ${l} litri.`,
      counties: 'Livrăm în',
      nationalTitle: 'Prețul motorinei în România, pe săptămâni',
      nationalLead:
        'Prețul mediu la pompă cu taxe, raportat de România Comisiei Europene, în euro la 1.000 de litri. Arată direcția pieței; nu este prețul Agrinvest.',
      latest: 'Ultimul buletin',
      perLitre: (v: string) => `aproximativ ${v} € pe litru`,
      empty: 'Nu avem încă date din Weekly Oil Bulletin.',
      chart: { table: 'Arată datele', date: 'Săptămâna', empty: 'Nu sunt date.' },
      formTitle: 'Cere o ofertă de motorină',
      formBody: 'Spune-ne câți litri îți trebuie, în ce județ și când. Te sunăm cu prețul.',
      logistics: 'Transport și logistică Agrinvest',
      dataset: 'Prețul motorinei: Agrinvest și media națională din România',
      datasetDescription:
        'Prețul Agrinvest pentru motorină livrată la fermă, când e publicat, și prețul mediu săptămânal al motorinei în România din Weekly Oil Bulletin.',
    },
    news: {
      title: 'Știri agricole',
      seoTitle: 'Știri agricole: piață, prețuri și subvenții',
      description:
        'Știrile agricole ale săptămânii din presa de specialitate, cu sursa și data, plus notele Agrinvest despre piață.',
      summary:
        'Titlurile săptămânii din presa agricolă, fiecare cu sursa și link spre articolul original, și notele noastre despre ce înseamnă pentru fermier.',
      own: 'De la Agrinvest',
      feed: 'Din presa agricolă',
      empty: 'Nu avem încă știri.',
      readAt: (source: string) => `Citește pe ${source}`,
      newsletterTitle: 'Buletinul săptămânal Agrinvest',
      newsletterBody:
        'Prețurile, nota de piață și cele mai importante știri ale săptămânii, o dată pe săptămână.',
      newsletterSubmit: 'Mă abonez',
    },
    today: {
      kicker: 'Azi',
      title: 'Prețuri, motorină și știri',
      diesel: 'Motorină',
      news: 'Știri agricole',
      dieselLink: 'Cere o ofertă',
      newsLink: 'Toate știrile',
      agrinvest: 'Agrinvest',
      national: 'Media în România',
      onRequest: 'la cerere',
      dieselEmpty: 'Prețul se dă la cerere, după cantitate și județ.',
      newsEmpty: 'Nu avem încă știri.',
    },
  },
  en: {
    fert: {
      title: 'Fertiliser prices',
      seoTitle: 'Fertiliser prices in Romania: AN, urea, NPK, foliar',
      description:
        'Prices of the fertilisers in the Agrinvest shop, per pack and per kilogram, with a link to each product.',
      summary:
        'The price of every fertiliser in the Agrinvest shop, per pack and per kilogram or litre. Each row leads to the product page.',
      product: 'Product',
      pack: 'Pack',
      price: 'Price',
      perUnit: 'Per kg / l',
      noPrice: 'on request',
      updated: 'Prices updated on',
      note: 'Prices marked “to confirm” are a guide; a consultant confirms price and stock before invoicing.',
      shop: 'All fertilisers in the shop',
      empty: 'No fertiliser has a published price yet.',
      dataset: 'Fertiliser prices in the Agrinvest shop',
      datasetDescription:
        'Prices of the fertilisers Agrinvest sells, per pack, in lei including VAT, and the price per kilogram or litre.',
    },
    diesel: {
      title: 'Diesel for farms',
      seoTitle: 'Diesel for farms in Romania: price and delivery',
      description:
        'Ask for diesel delivered to your farm. Agrinvest’s price once published, and Romania’s weekly average from the European Commission’s Weekly Oil Bulletin.',
      summary:
        'We deliver diesel to farms. See Agrinvest’s price, once published, and Romania’s weekly average, then ask for a quote for your quantity.',
      ownTitle: 'Agrinvest’s price',
      ownLead: 'Lei per litre, delivered to the farm.',
      onRequest: 'Price on request',
      onRequestBody:
        'The price depends on quantity, county and delivery date. Send the request below and we will call you with a quote.',
      vat: { 'fara-tva': 'before VAT', 'cu-tva': 'VAT included' },
      validFrom: 'Valid from',
      minimum: (l: string) => `Minimum order: ${l} litres.`,
      counties: 'We deliver in',
      nationalTitle: 'Diesel price in Romania, by week',
      nationalLead:
        'The average pump price with taxes that Romania reports to the European Commission, in euro per 1,000 litres. It shows the market’s direction; it is not Agrinvest’s price.',
      latest: 'Latest bulletin',
      perLitre: (v: string) => `about €${v} per litre`,
      empty: 'There is no Weekly Oil Bulletin data yet.',
      chart: { table: 'Show the data', date: 'Week', empty: 'No data.' },
      formTitle: 'Ask for a diesel quote',
      formBody:
        'Tell us how many litres you need, in which county and when. We will call you with a price.',
      logistics: 'Agrinvest transport and logistics',
      dataset: 'Diesel prices: Agrinvest and Romania’s national average',
      datasetDescription:
        'Agrinvest’s price for diesel delivered to farms, once published, and Romania’s weekly average diesel price from the Weekly Oil Bulletin.',
    },
    news: {
      title: 'Farm news',
      seoTitle: 'Romanian farm news: markets, prices and subsidies',
      description:
        'This week’s farm news from the Romanian agricultural press, with source and date, and Agrinvest’s own market notes.',
      summary:
        'This week’s headlines from the Romanian farm press, each with its source and a link to the original (in Romanian), and our notes on what they mean for farmers.',
      own: 'From Agrinvest',
      feed: 'From the farm press (in Romanian)',
      empty: 'There is no news yet.',
      readAt: (source: string) => `Read on ${source}`,
      newsletterTitle: 'The Agrinvest weekly',
      newsletterBody: 'Prices, the market note and the week’s main news, once a week.',
      newsletterSubmit: 'Subscribe',
    },
    today: {
      kicker: 'Today',
      title: 'Prices, diesel and news',
      diesel: 'Diesel',
      news: 'Farm news',
      dieselLink: 'Ask for a quote',
      newsLink: 'All news',
      agrinvest: 'Agrinvest',
      national: 'Romanian average',
      onRequest: 'on request',
      dieselEmpty: 'The price is given on request, by quantity and county.',
      newsEmpty: 'There is no news yet.',
    },
  },
} as const satisfies Record<Locale, unknown>
