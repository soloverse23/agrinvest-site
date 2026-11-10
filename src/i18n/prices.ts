import type { Locale } from './config'

/**
 * Words of the grain price pages, the net-price calculator, the market notes and their
 * widgets (Phase 5.2). Numbers never live here: Agrinvest's prices come from published
 * `BuyPrices` rows and the market series from `MarketPrices`.
 */
export const pricesUi = {
  ro: {
    section: 'Prețuri',
    hub: {
      title: 'Prețuri cereale azi',
      seoTitle: 'Prețuri cereale azi: grâu, porumb, floarea-soarelui, rapiță',
      description:
        'Prețul de achiziție Agrinvest pe baze, când e publicat, și prețurile săptămânale ale Comisiei Europene pentru România, cu sursa și data fiecărui număr.',
      summary:
        'Prețul cu care cumpără Agrinvest, pe baze, și cotațiile săptămânale publicate de Comisia Europeană pentru România. Fiecare număr are sursa și data lui.',
      tableTitle: 'Pe scurt, pe culturi',
      crop: 'Cultura',
      agrinvest: 'Preț Agrinvest',
      market: 'Piața UE, România',
      week: 'Săptămâna',
      noteKicker: 'Nota de piață',
      noteTitle: 'Ce s-a mișcat săptămâna asta',
      allNotes: 'Toate notele de piață',
      tools: 'Unelte',
      calculatorTitle: 'Cât primești de fapt pe marfă',
      calculatorBody:
        'Calculatorul de preț net scade umiditatea și impuritățile peste limite și îți arată cantitatea și suma netă.',
      openCalculator: 'Deschide calculatorul',
    },
    crop: {
      title: (crop: string) => `Preț ${crop} azi`,
      seoTitle: (crop: string) => `Preț ${crop} azi: Agrinvest pe baze și piața UE`,
      description: (crop: string) =>
        `Prețul cu care Agrinvest cumpără ${crop} în fiecare bază, când e publicat, și evoluția pe 52 de săptămâni a prețului UE pentru România.`,
      summary: (crop: string) =>
        `Cât plătește Agrinvest pentru ${crop} la fiecare bază și cum s-a mișcat piața în ultimul an.`,
      agrinvestTitle: 'Prețul Agrinvest pe baze',
      agrinvestLead: 'Lei pe tonă, fără TVA. Prețul ține de calitatea mărfii la recepție.',
      base: 'Baza',
      price: 'Preț',
      basis: 'Condiție',
      validFrom: 'Valabil din',
      allBases: 'Toate bazele',
      basisLabel: { 'la-baza': 'Livrat la bază', 'la-ferma': 'Ridicat de la fermă' },
      onRequest: 'Preț la cerere',
      onRequestBody:
        'Nu am publicat încă un preț pentru această cultură. Sună reprezentantul din zona ta sau trimite cererea de mai jos și îți spunem prețul pentru baza cea mai apropiată.',
      askPrice: 'Cere prețul',
      marketTitle: 'Piața UE pentru România, 52 de săptămâni',
      marketLead:
        'Prețurile săptămânale raportate de România Comisiei Europene, în euro pe tonă. Arată direcția pieței; nu sunt prețul Agrinvest.',
      marketEmpty:
        'Nu avem încă prețuri UE pentru această cultură. Le arătăm aici imediat ce sursa le publică.',
      marketStale: (date: string) =>
        `Ultimele date sunt din ${date}. Sursa nu a publicat nimic mai nou.`,
      chart: { table: 'Arată datele', date: 'Săptămâna', empty: 'Nu sunt date.' },
      latest: 'Ultima cotație',
      change: 'față de săptămâna dinainte',
      sellTitle: (crop: string) => `Vinde ${crop} la cea mai apropiată bază`,
      sellBody:
        'Spune-ne cantitatea, unde e marfa și baza care îți convine. Reprezentantul din zona ta te sună cu prețul.',
      alertTitle: (crop: string) => `Alertă când se schimbă prețul la ${crop}`,
      alertBody:
        'Îți scriem când Agrinvest schimbă prețul publicat. Poți alege orice schimbare sau un prag.',
      cropPage: (crop: string) => `Cum cumpărăm ${crop}`,
      others: 'Prețuri pentru alte culturi',
      financeKicker: 'Nu vinzi încă?',
      financeTitle: 'Bani pe marfa din depozit sau pe contract',
    },
    calc: {
      title: 'Calculator preț net cereale',
      seoTitle: 'Calculator preț net: scăzământ la umiditate și impurități',
      description:
        'Calculează cantitatea și suma netă după scăzământul la umiditate și impurități. Fiecare regulă are sursa ei.',
      summary:
        'Scrie cantitatea, prețul și ce a ieșit la analiză. Calculatorul scade umiditatea și impuritățile peste limite și arată cantitatea și suma netă, cu regula aplicată la fiecare pas.',
      form: 'Datele mărfii',
      crop: 'Cultura',
      choose: 'Alege',
      quantity: 'Cantitate',
      price: 'Preț',
      moisture: 'Umiditate măsurată',
      impurities: 'Impurități măsurate',
      hectolitre: 'Masă hectolitrică (opțional)',
      limits: 'Limitele de bază',
      limitsHint:
        'Completate din limitele publicate de Agrinvest, când există. Altfel, scrie-le din contract.',
      baseMoisture: 'Umiditate de bază',
      baseImpurities: 'Impurități admise',
      minHectolitre: 'Masă hectolitrică minimă (opțional)',
      submit: 'Calculează',
      resultTitle: 'Rezultatul',
      intro: 'Completează datele mărfii și apasă „Calculează”.',
      rows: {
        gross: 'Cantitate brută',
        moisture: 'Scăzământ umiditate',
        impurities: 'Scăzământ impurități',
        net: 'Cantitate netă',
        grossValue: 'Valoare brută',
        netValue: 'Valoare netă',
        perTonne: 'Preț net pe tona brută',
      },
      lowHl: (min: string) =>
        `Masa hectolitrică e sub minimul de ${min} kg/hl. Cantitatea nu scade, dar prețul se poate negocia: verifică ce scrie în contract.`,
      errors: {
        cultura: 'Alege cultura.',
        cantitate: 'Scrie cantitatea în tone, de exemplu 24,5.',
        pret: 'Scrie prețul în lei pe tonă.',
        umiditate: 'Scrie umiditatea măsurată, între 0 și 60 %.',
        impuritati: 'Scrie impuritățile măsurate, între 0 și 60 %.',
        hl: 'Scrie masa hectolitrică între 30 și 100 kg/hl.',
        umiditate_baza: 'Scrie umiditatea de bază din contract.',
        impuritati_baza: 'Scrie impuritățile admise din contract.',
        hl_minim: 'Scrie masa hectolitrică minimă între 30 și 100 kg/hl.',
      },
      rulesTitle: 'Regulile aplicate',
      sources: 'Surse',
      checked: 'verificat la',
      note: 'Rezultatul e orientativ. Cantitatea și prețul final sunt cele din buletinul de analiză și din contract.',
      sell: 'Cere prețul Agrinvest',
    },
    market: {
      title: 'Nota de piață',
      seoTitle: 'Nota de piață săptămânală: prețuri cereale în România',
      description:
        'Nota săptămânală Agrinvest despre prețurile cerealelor: ce s-a mișcat pe piața UE pentru România și ce înseamnă pentru fermier.',
      summary:
        'În fiecare săptămână, pe scurt: cum s-au mișcat prețurile cerealelor și ce înseamnă pentru vânzare.',
      empty: 'Prima notă de piață apare aici în curând.',
      latest: 'Cea mai nouă',
      older: 'Note anterioare',
      prices: 'Vezi prețurile',
    },
    alert: {
      rule: 'Când îți scriem',
      rules: { any: 'La orice schimbare', above: 'Când trece peste', below: 'Când scade sub' },
      threshold: 'Prag',
      email: 'E-mail',
      submit: 'Activează alerta',
      sending: 'Se trimite…',
      done: 'Am salvat alerta.',
      doneBody:
        'Încă nu trimitem mesaje: le pornim imediat ce alegem serviciul de e-mail. Alerta ta e păstrată până atunci.',
      privacy: 'Cum folosim datele',
    },
    base: { title: (base: string) => `Prețuri azi la ${base}` },
    widget: {
      grainTitle: 'Prețuri cereale',
      grainLink: 'Toate prețurile',
      netTitle: 'Calculează prețul net',
      netLink: 'Calculator complet',
      onRequest: 'la cerere',
      agrinvest: 'Agrinvest',
      eu: 'Piața UE',
      empty: 'Nu avem încă prețuri publicate. Sună-ne pentru prețul zilei.',
    },
    dataset: {
      name: (crop: string) => `Prețuri ${crop}: Agrinvest și piața UE pentru România`,
      description: (crop: string) =>
        `Prețul de achiziție Agrinvest pentru ${crop} pe baze, în lei pe tonă fără TVA, și prețurile săptămânale raportate de România Comisiei Europene, în euro pe tonă.`,
      hubName: 'Prețuri cereale în România: Agrinvest și piața UE',
      hubDescription:
        'Prețurile de achiziție Agrinvest pe culturi și baze și prețurile săptămânale ale cerealelor raportate de România Comisiei Europene.',
    },
  },
  en: {
    section: 'Prices',
    hub: {
      title: 'Grain prices in Romania today',
      seoTitle: 'Romanian grain prices: wheat, corn, sunflower, rapeseed',
      description:
        'Agrinvest’s buying price by base, once published, and the European Commission’s weekly prices for Romania, each with its source and date.',
      summary:
        'What Agrinvest pays, by base, and the weekly prices the European Commission publishes for Romania. Every number carries its source and date.',
      tableTitle: 'At a glance, by crop',
      crop: 'Crop',
      agrinvest: 'Agrinvest price',
      market: 'EU market, Romania',
      week: 'Week',
      noteKicker: 'Market note',
      noteTitle: 'What moved this week',
      allNotes: 'All market notes',
      tools: 'Tools',
      calculatorTitle: 'What you actually get for the load',
      calculatorBody:
        'The net-price calculator takes off moisture and impurities above the limits and shows the net quantity and value.',
      openCalculator: 'Open the calculator',
    },
    crop: {
      title: (crop: string) => `${crop} price in Romania today`,
      seoTitle: (crop: string) => `${crop} price in Romania: Agrinvest and the EU market`,
      description: (crop: string) =>
        `What Agrinvest pays for ${crop.toLowerCase()} at each base, once published, and 52 weeks of the EU’s price for Romania.`,
      summary: (crop: string) =>
        `What Agrinvest pays for ${crop.toLowerCase()} at each base, and how the market moved over the last year.`,
      agrinvestTitle: 'Agrinvest’s price by base',
      agrinvestLead: 'Lei per tonne, before VAT. The price depends on quality at reception.',
      base: 'Base',
      price: 'Price',
      basis: 'Terms',
      validFrom: 'Valid from',
      allBases: 'All bases',
      basisLabel: { 'la-baza': 'Delivered to the base', 'la-ferma': 'Collected at the farm' },
      onRequest: 'Price on request',
      onRequestBody:
        'We have not published a price for this crop yet. Call the representative for your area or send the request below, and we will tell you the price at the nearest base.',
      askPrice: 'Ask for the price',
      marketTitle: 'EU market for Romania, 52 weeks',
      marketLead:
        'Weekly prices Romania reports to the European Commission, in euro per tonne. They show where the market is going; they are not Agrinvest’s price.',
      marketEmpty:
        'There are no EU prices for this crop yet. They appear here as soon as the source publishes them.',
      marketStale: (date: string) =>
        `The latest data is from ${date}. The source has published nothing newer.`,
      chart: { table: 'Show the data', date: 'Week', empty: 'No data.' },
      latest: 'Latest price',
      change: 'on the week before',
      sellTitle: (crop: string) => `Sell ${crop.toLowerCase()} at the nearest base`,
      sellBody:
        'Tell us the quantity, where the grain is and the base that suits you. The representative for your area calls you with the price.',
      alertTitle: (crop: string) => `Get an alert when the ${crop.toLowerCase()} price changes`,
      alertBody:
        'We write when Agrinvest changes its published price. Choose any change or a threshold.',
      cropPage: (crop: string) => `How we buy ${crop.toLowerCase()}`,
      others: 'Prices for other crops',
      financeKicker: 'Not selling yet?',
      financeTitle: 'Cash against stored grain or a contract',
    },
    calc: {
      title: 'Grain net price calculator',
      seoTitle: 'Grain net price calculator: moisture and impurity deductions',
      description:
        'Work out the net quantity and value after the moisture and impurity deductions. Every rule shows its source.',
      summary:
        'Enter the quantity, the price and the lab results. The calculator takes off moisture and impurities above the limits and shows the net quantity and value, with the rule used at each step.',
      form: 'Your load',
      crop: 'Crop',
      choose: 'Choose',
      quantity: 'Quantity',
      price: 'Price',
      moisture: 'Measured moisture',
      impurities: 'Measured impurities',
      hectolitre: 'Hectolitre weight (optional)',
      limits: 'Base limits',
      limitsHint:
        'Filled in from Agrinvest’s published limits when they exist. Otherwise, type them from your contract.',
      baseMoisture: 'Base moisture',
      baseImpurities: 'Allowed impurities',
      minHectolitre: 'Minimum hectolitre weight (optional)',
      submit: 'Calculate',
      resultTitle: 'Result',
      intro: 'Fill in your load and press “Calculate”.',
      rows: {
        gross: 'Gross quantity',
        moisture: 'Moisture deduction',
        impurities: 'Impurity deduction',
        net: 'Net quantity',
        grossValue: 'Gross value',
        netValue: 'Net value',
        perTonne: 'Net price per gross tonne',
      },
      lowHl: (min: string) =>
        `The hectolitre weight is below the ${min} kg/hl minimum. The quantity stays the same, but the price may be negotiated: check your contract.`,
      errors: {
        cultura: 'Choose the crop.',
        cantitate: 'Enter the quantity in tonnes, e.g. 24.5.',
        pret: 'Enter the price in lei per tonne.',
        umiditate: 'Enter the measured moisture, between 0 and 60%.',
        impuritati: 'Enter the measured impurities, between 0 and 60%.',
        hl: 'Enter a hectolitre weight between 30 and 100 kg/hl.',
        umiditate_baza: 'Enter the base moisture from your contract.',
        impuritati_baza: 'Enter the allowed impurities from your contract.',
        hl_minim: 'Enter a minimum hectolitre weight between 30 and 100 kg/hl.',
      },
      rulesTitle: 'Rules applied',
      sources: 'Sources',
      checked: 'checked on',
      note: 'The result is a guide. The final quantity and price are those on the lab report and in the contract.',
      sell: 'Ask for Agrinvest’s price',
    },
    market: {
      title: 'Market note',
      seoTitle: 'Weekly market note: grain prices in Romania',
      description:
        'Agrinvest’s weekly note on grain prices: what moved on the EU market for Romania and what it means for farmers.',
      summary: 'Each week, briefly: how grain prices moved and what it means for selling.',
      empty: 'The first market note will appear here soon.',
      latest: 'Latest',
      older: 'Earlier notes',
      prices: 'See the prices',
    },
    alert: {
      rule: 'When to write',
      rules: { any: 'On any change', above: 'When it rises above', below: 'When it falls below' },
      threshold: 'Threshold',
      email: 'Email',
      submit: 'Turn on the alert',
      sending: 'Sending…',
      done: 'Your alert is saved.',
      doneBody:
        'We do not send messages yet: they start as soon as we choose an email service. Your alert is kept until then.',
      privacy: 'How we use your data',
    },
    base: { title: (base: string) => `Prices today at ${base}` },
    widget: {
      grainTitle: 'Grain prices',
      grainLink: 'All prices',
      netTitle: 'Work out your net price',
      netLink: 'Full calculator',
      onRequest: 'on request',
      agrinvest: 'Agrinvest',
      eu: 'EU market',
      empty: 'No prices are published yet. Call us for today’s price.',
    },
    dataset: {
      name: (crop: string) => `${crop} prices: Agrinvest and the EU market for Romania`,
      description: (crop: string) =>
        `Agrinvest’s buying price for ${crop.toLowerCase()} by base, in lei per tonne before VAT, and the weekly prices Romania reports to the European Commission, in euro per tonne.`,
      hubName: 'Grain prices in Romania: Agrinvest and the EU market',
      hubDescription:
        'Agrinvest’s buying prices by crop and base, and the weekly grain prices Romania reports to the European Commission.',
    },
  },
} as const

export type PricesUi = (typeof pricesUi)[Locale]
