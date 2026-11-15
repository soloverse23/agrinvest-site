import type { Locale } from './config'

/**
 * Words of the fertiliser prices, diesel and news pages and of the home "Today" row (Phase 5).
 * Numbers never live here: they come from the shop, `DieselPrices`, `MarketPrices` and
 * `NewsItems`.
 */
export const toolsUi = {
  ro: {
    fert: {
      title: 'Prețul îngrășămintelor',
      seoTitle: 'Preț îngrășăminte: uree, DAP, potasiu, piața UE și mondială',
      description:
        'Prețul ureei, al fosfaților și al potasiului pe piața mondială, în dolari și în lei pe tonă, și prețurile UE pentru România, cu grafic și istoric.',
      summary:
        'Cum se mișcă prețul îngrășămintelor pe piața mondială și în România, ca să știi când merită să cumperi. Fiecare cifră are sursa și data ei.',
      euTitle: 'Piața UE, România',
      euLead:
        'Prețurile lunare publicate de Comisia Europeană pentru România și media UE, în euro pe tonă.',
      euProduct: 'Îngrășământ',
      euRomania: 'România',
      euAverage: 'Media UE',
      euMonth: 'Luna',
      worldTitle: 'Piața mondială',
      worldLead:
        'Cotațiile lunare de referință publicate de Banca Mondială, în dolari pe tonă. Arată direcția pieței; prețul franco fermă din România include transportul și TVA.',
      about: {
        title: 'Ce mișcă prețul îngrășămintelor',
        body: [
          'Îngrășămintele cu azot, ca ureea și azotatul de amoniu, se fac din amoniac, iar amoniacul se face din gaz natural. De aceea prețul gazului în Europa se vede, în timp, în prețul lor.',
          'Fosfații (DAP, superfosfatul triplu) și potasiul vin din minereuri extrase în puține țări, așa că prețul lor depinde mai mult de comerțul mondial și de transport.',
        ],
      },
      faq: [
        {
          q: 'Este prețul cu care cumpăr în România?',
          a: 'Nu. Cotațiile mondiale sunt prețuri la export sau import, în porturi, fără transport până la fermă și fără TVA. Ele arată direcția pieței.',
        },
        {
          q: 'Cât de des se actualizează?',
          a: 'Lunar. Banca Mondială publică media lunii la începutul lunii următoare.',
        },
      ],
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
        'Cere o ofertă de motorină livrată la fermă și vezi prețul mediu săptămânal al motorinei în România, din Buletinul petrolier al Comisiei Europene.',
      summary:
        'Livrăm motorină la fermă. Vezi cum s-a mișcat prețul mediu din România, apoi cere o ofertă pentru cantitatea ta.',
      market: 'Prețul motorinei și benzinei, comparat cu media UE',
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
    hub: {
      title: 'Unelte pentru fermieri',
      seoTitle: 'Unelte pentru fermieri: calculatoare și prețuri',
      description:
        'Calculator de preț net la cereale, prețuri la cereale, îngrășăminte și motorină, simulator de rate și cerere de credit, într-un singur loc.',
      summary:
        'Ce poți calcula sau verifica înainte să vinzi cereale, să cumperi inputuri sau să ceri un credit.',
      list: 'Uneltele Agrinvest',
      cards: {
        prices: {
          title: 'Prețuri cereale',
          text: 'Prețul zilei pe fiecare cultură, la bazele Agrinvest și pe piața UE.',
        },
        net: {
          title: 'Calculator preț net',
          text: 'Află cât primești pe tonă după scăzământul de umiditate și impurități.',
        },
        fert: {
          title: 'Prețuri îngrășăminte',
          text: 'Ureea, fosfații și potasiul pe piața mondială și în România.',
        },
        diesel: {
          title: 'Motorină',
          text: 'Media din România pe săptămână și livrare la fermă.',
        },
        simulator: {
          title: 'Simulator de rate',
          text: 'Vezi cum se împart ratele pe recoltele tale.',
        },
        apply: {
          title: 'Cerere de credit',
          text: 'Trimite online cererea către Agrinvest Credit IFN.',
        },
      },
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
      seoTitle: 'Fertiliser prices: urea, DAP, potash, EU and world markets',
      description:
        'Urea, phosphate and potash prices on the world market, in dollars and lei per tonne, and the EU’s prices for Romania, with a chart and history.',
      summary:
        'How fertiliser prices move on the world market and in Romania, so you know when it pays to buy. Every figure carries its source and date.',
      euTitle: 'EU market, Romania',
      euLead:
        'Monthly prices the European Commission publishes for Romania and the EU average, in euro per tonne.',
      euProduct: 'Fertiliser',
      euRomania: 'Romania',
      euAverage: 'EU average',
      euMonth: 'Month',
      worldTitle: 'World market',
      worldLead:
        'The World Bank’s monthly benchmark prices, in US dollars per tonne. They show where the market is going; a delivered price in Romania adds transport and VAT.',
      about: {
        title: 'What moves fertiliser prices',
        body: [
          'Nitrogen fertilisers such as urea and ammonium nitrate are made from ammonia, and ammonia is made from natural gas. That is why the price of gas in Europe shows up, over time, in theirs.',
          'Phosphates (DAP, triple superphosphate) and potash come from ores mined in a few countries, so their price depends more on world trade and freight.',
        ],
      },
      faq: [
        {
          q: 'Is this what I pay in Romania?',
          a: 'No. World benchmarks are export or import prices at ports, without transport to the farm and without VAT. They show where the market is going.',
        },
        {
          q: 'How often is it updated?',
          a: 'Monthly. The World Bank publishes each month’s average early the following month.',
        },
      ],
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
        'Ask for diesel delivered to your farm and see Romania’s weekly average diesel price from the European Commission’s Weekly Oil Bulletin.',
      summary:
        'We deliver diesel to farms. See how Romania’s average price moved, then ask for a quote for your quantity.',
      market: 'Diesel and petrol prices, compared with the EU average',
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
    hub: {
      title: 'Tools for farmers',
      seoTitle: 'Farm tools: calculators and prices',
      description:
        'A net price calculator, grain, fertiliser and diesel prices, a repayment simulator and the loan application, in one place.',
      summary:
        'What you can calculate or check before you sell grain, buy inputs or apply for a loan.',
      list: 'Agrinvest tools',
      cards: {
        prices: {
          title: 'Grain prices',
          text: 'Today’s price for each crop, at Agrinvest bases and on the EU market.',
        },
        net: {
          title: 'Net price calculator',
          text: 'See what you get per tonne after moisture and impurity deductions.',
        },
        fert: {
          title: 'Fertiliser prices',
          text: 'Urea, phosphates and potash on the world market and in Romania.',
        },
        diesel: {
          title: 'Diesel',
          text: 'The weekly Romanian average and delivery to the farm.',
        },
        simulator: {
          title: 'Repayment simulator',
          text: 'See how the instalments split across your harvests.',
        },
        apply: {
          title: 'Loan application',
          text: 'Send your application to Agrinvest Credit IFN online.',
        },
      },
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
