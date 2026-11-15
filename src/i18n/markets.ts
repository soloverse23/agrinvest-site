import type { MarketGroup, MarketKey, MarketPageId } from '@/lib/markets/registry'

import type { Locale } from './config'

/**
 * Words of the Phase 7f market pages. Numbers never live here: they come from `MarketPrices`.
 * Every claim about a benchmark is the source's own definition (World Bank "Description"
 * sheet, EIA, ECB, the Oil Bulletin's notes), as checked on 2026-11-15.
 */

type Faq = { q: string; a: string }

type PageCopy = {
  title: string
  seoTitle: string
  description: string
  summary: string
  /** Short paragraphs under the chart; each a plain explanation from the sources. */
  about: { title: string; body: string[] }
  faq: Faq[]
  dataset: { name: string; description: string }
}

type MarketCopy = {
  name: string
  /** What the number is, in the source's terms. */
  benchmark: string
}

type Copy = {
  section: string
  groups: Record<MarketGroup, { title: string; lead: string }>
  markets: Record<MarketKey, MarketCopy>
  hub: {
    title: string
    seoTitle: string
    description: string
    summary: string
    dataset: { name: string; description: string }
    grainLocal: string
    grainLocalLead: string
    sources: string
  }
  pages: Record<MarketPageId, PageCopy>
  ui: {
    last: string
    change: (period: string) => string
    period: Record<'daily' | 'weekly' | 'monthly', string>
    year: string
    high: string
    low: string
    range52: string
    updated: string
    approx: (value: string) => string
    noData: string
    open: string
    history: string
    historyLead: string
    monthly: string
    yearly: string
    daily30: string
    month: string
    yearCol: string
    day: string
    average: string
    value: string
    source: string
    licence: string
    faq: string
    related: string
    sellGrain: (crop: string) => string
    shopFertilisers: string
    dieselDelivery: string
    rate: (unit: string) => string
  }
  /** The header ticker and the home hero rail. */
  ticker: {
    title: string
    place: string
    names: Partial<Record<MarketKey, string>>
  }
  chart: {
    ranges: Record<'1M' | '3M' | '6M' | '1Y' | '5Y' | 'MAX', string>
    rangeLabel: string
    loading: string
    hint: string
    table: string
    date: string
    empty: string
  }
}

export const marketsUi: Record<Locale, Copy> = {
  ro: {
    section: 'Prețuri',
    groups: {
      energy: {
        title: 'Energie și carburanți',
        lead: 'Țițeiul Brent, prețul motorinei și al benzinei în România și gazele naturale în Europa.',
      },
      grain: {
        title: 'Cereale și oleaginoase',
        lead: 'Cotațiile de referință de pe piața mondială, lunar, și prețurile UE pentru România, săptămânal.',
      },
      fertiliser: {
        title: 'Îngrășăminte',
        lead: 'Ureea, fosfații și potasiul pe piața mondială, în dolari pe tonă și în lei.',
      },
      fx: {
        title: 'Curs valutar',
        lead: 'Cursurile de referință ale Băncii Centrale Europene, în fiecare zi lucrătoare.',
      },
    },
    markets: {
      brent: {
        name: 'Petrol Brent',
        benchmark: 'Țiței Brent, preț spot FOB, în dolari pe baril (U.S. EIA).',
      },
      'diesel-ro': {
        name: 'Motorină, România',
        benchmark:
          'Prețul mediu de consum cu taxe, raportat de România pentru Buletinul petrolier al UE.',
      },
      'petrol-ro': {
        name: 'Benzină, România',
        benchmark: 'Benzină Euro-super 95, prețul mediu de consum cu taxe, raportat de România.',
      },
      'diesel-eu': {
        name: 'Motorină, media UE',
        benchmark: 'Media ponderată a celor 27 de state membre, cu taxe.',
      },
      'petrol-eu': {
        name: 'Benzină, media UE',
        benchmark: 'Euro-super 95, media ponderată a celor 27 de state membre, cu taxe.',
      },
      'gas-eu': {
        name: 'Gaze naturale, Europa',
        benchmark: 'Media lunară la hubul olandez TTF, după Banca Mondială, în dolari pe MMBtu.',
      },
      'wheat-hrw': {
        name: 'Grâu, SUA (HRW)',
        benchmark: 'Grâu roșu tare de toamnă nr. 2, preț de export la Golful Mexic (FOB).',
      },
      'wheat-srw': {
        name: 'Grâu, SUA (SRW)',
        benchmark: 'Grâu roșu moale de toamnă nr. 2, preț de export la Golful Mexic.',
      },
      maize: {
        name: 'Porumb, SUA',
        benchmark: 'Porumb galben nr. 2, FOB porturile din Golful Mexic.',
      },
      'sunflower-oil': {
        name: 'Ulei de floarea-soarelui',
        benchmark: 'Ulei de floarea-soarelui din UE, FOB Rotterdam.',
      },
      'rapeseed-oil': {
        name: 'Ulei de rapiță',
        benchmark: 'Ulei de rapiță olandez, FOB Rotterdam.',
      },
      urea: { name: 'Uree', benchmark: 'Uree perlată, spot FOB Orientul Mijlociu.' },
      dap: { name: 'DAP', benchmark: 'Fosfat diamoniacal (DAP), spot FOB Golful Mexic.' },
      tsp: {
        name: 'Superfosfat triplu (TSP)',
        benchmark: 'Superfosfat triplu, spot, import în Golful Mexic.',
      },
      potash: {
        name: 'Clorură de potasiu',
        benchmark: 'Clorură de potasiu granulată, spot CFR Brazilia.',
      },
      'eur-ron': { name: 'Euro / leu', benchmark: 'Cursul de referință BCE: lei pentru un euro.' },
      'eur-usd': {
        name: 'Euro / dolar',
        benchmark: 'Cursul de referință BCE: dolari pentru un euro.',
      },
      'usd-ron': {
        name: 'Dolar / leu',
        benchmark: 'Calculat din cele două cursuri BCE din aceeași zi: lei pentru un dolar.',
      },
    },
    hub: {
      title: 'Prețuri agricole azi',
      seoTitle: 'Prețuri agricole azi: cereale, motorină, Brent, curs euro',
      description:
        'Prețul cerealelor, al motorinei și al petrolului Brent, îngrășămintele și cursul euro-leu, din surse oficiale, cu grafic și istoric pentru fiecare.',
      summary:
        'Piețele care contează pentru fermă, într-un singur loc: energie, cereale, îngrășăminte și curs valutar. Fiecare cifră are sursa și data ei.',
      dataset: {
        name: 'Prețuri agricole și de energie pentru fermierii din România',
        description:
          'Țiței Brent zilnic, prețuri săptămânale la motorină și benzină în România și UE, prețuri lunare mondiale la cereale, uleiuri, gaze naturale și îngrășăminte, cursurile BCE euro-leu și euro-dolar.',
      },
      grainLocal: 'Cereale în România, piața UE',
      grainLocalLead:
        'Prețurile săptămânale raportate de România Comisiei Europene, în euro pe tonă: export Constanța și franco depozit.',
      sources: 'Surse',
    },
    pages: {
      brent: {
        title: 'Prețul petrolului Brent azi',
        seoTitle: 'Preț petrol Brent azi: grafic și istoric în dolari/baril',
        description:
          'Prețul țițeiului Brent pe zi, în dolari pe baril, cu grafic din 2016, minim și maxim pe 52 de săptămâni. Date U.S. EIA, actualizate zilnic.',
        summary:
          'Brentul e reperul de preț pentru țițeiul din Europa. De el depind, cu întârziere, motorina de la pompă și costul transportului.',
        about: {
          title: 'Ce înseamnă pentru fermă',
          body: [
            'Brent este țițeiul extras din Marea Nordului și reperul după care se stabilește prețul unei mari părți din petrolul vândut în lume, inclusiv în Europa. Cifra de aici este prețul spot FOB, publicat de U.S. Energy Information Administration pentru fiecare zi de tranzacționare.',
            'Prețul motorinei la pompă urmează mișcările țițeiului cu câteva săptămâni întârziere. La el se adaugă acciza, TVA și cursul leu-dolar, așa că o scădere a Brentului nu se vede integral la pompă.',
          ],
        },
        faq: [
          {
            q: 'De ce prețul diferă de cel din știri?',
            a: 'Știrile citează de obicei contractul futures pe Brent de la bursa ICE, care se schimbă în timpul zilei. Aici e prețul spot de închidere publicat de EIA, cu câteva zile întârziere.',
          },
          {
            q: 'Câți litri are un baril?',
            a: 'Un baril are 42 de galoane americane, adică aproximativ 159 de litri.',
          },
          {
            q: 'Cât de des se actualizează?',
            a: 'Zilnic. Sursa publică prețul pentru fiecare zi de tranzacționare, de obicei cu câteva zile întârziere.',
          },
        ],
        dataset: {
          name: 'Prețul zilnic al țițeiului Brent',
          description:
            'Prețul spot FOB al țițeiului Brent, în dolari pe baril, pentru fiecare zi de tranzacționare din 2016, după U.S. Energy Information Administration.',
        },
      },
      fuel: {
        title: 'Prețul motorinei și benzinei în România',
        seoTitle: 'Preț motorină azi în România: media națională și UE',
        description:
          'Prețul mediu al motorinei și benzinei în România, cu taxe, în lei pe litru și euro, comparat cu media UE. Date săptămânale din Buletinul petrolier al UE.',
        summary:
          'Media națională a prețului la pompă, săptămână de săptămână, și cum stă România față de media Uniunii Europene.',
        about: {
          title: 'De unde vin cifrele',
          body: [
            'În fiecare săptămână, statele membre raportează Comisiei Europene prețurile medii de consum ale carburanților, cu toate taxele, în vigoare lunea. Comisia le publică în Buletinul petrolier săptămânal (Weekly Oil Bulletin), în euro pentru 1.000 de litri.',
            'Prețul în lei pe litru e calculat de noi cu ultimul curs BCE, deci e aproximativ. Prețul de la o stație anume poate fi mai mare sau mai mic decât media națională.',
          ],
        },
        faq: [
          {
            q: 'Este prețul de la pompă?',
            a: 'Este media națională a prețurilor de vânzare cu amănuntul, cu acciză și TVA, raportată de România. O stație anume poate avea alt preț.',
          },
          {
            q: 'De ce sunt prețurile în euro?',
            a: 'Buletinul petrolier al UE publică toate țările în euro, ca să poată fi comparate. Le convertim în lei cu ultimul curs BCE.',
          },
          {
            q: 'Unde găsesc motorină livrată la fermă?',
            a: 'Agrinvest livrează motorină la fermă. Prețul se dă la cerere, după cantitate și județ.',
          },
        ],
        dataset: {
          name: 'Prețul săptămânal al motorinei și benzinei în România și în UE',
          description:
            'Prețurile medii de consum cu taxe pentru motorină și benzina Euro-super 95, în România și media UE-27, în euro pentru 1.000 de litri, săptămânal, din Buletinul petrolier al Comisiei Europene.',
        },
      },
      gas: {
        title: 'Prețul gazelor naturale în Europa',
        seoTitle: 'Preț gaze naturale în Europa (TTF): grafic lunar',
        description:
          'Prețul lunar al gazelor naturale în Europa, la hubul olandez TTF, în dolari pe MMBtu și aproximativ în euro pe MWh. Date Banca Mondială, din 2010.',
        summary:
          'Gazul natural e principala materie primă pentru îngrășămintele cu azot, așa că prețul lui se vede, în timp, în prețul ureei și al azotatului.',
        about: {
          title: 'De ce contează pentru fermă',
          body: [
            'Din gazul natural se produce amoniacul, din care se fac ureea, azotatul de amoniu și celelalte îngrășăminte cu azot. Când gazul se scumpește mult în Europa, fabricile de îngrășăminte își reduc producția sau își cresc prețurile.',
            'Cifra este media lunară publicată de Banca Mondială pentru Europa. Din aprilie 2015 e prețul de la Title Transfer Facility (TTF) din Țările de Jos. Valoarea în euro pe MWh e calculată de noi (1 MMBtu = 0,293071 MWh) cu ultimul curs BCE.',
          ],
        },
        faq: [
          {
            q: 'Ce este TTF?',
            a: 'Title Transfer Facility, piața virtuală de gaze a Țărilor de Jos. Este principalul reper de preț pentru gazul natural din Europa.',
          },
          {
            q: 'Este prețul pe care îl plătesc acasă?',
            a: 'Nu. Este prețul angro de pe piața europeană. Factura unui consumator include transportul, distribuția, taxele și marja furnizorului.',
          },
        ],
        dataset: {
          name: 'Prețul lunar al gazelor naturale în Europa',
          description:
            'Media lunară a prețului gazelor naturale în Europa (TTF din aprilie 2015), în dolari pe MMBtu, după Banca Mondială (Pink Sheet).',
        },
      },
      fx: {
        title: 'Cursul euro-leu azi',
        seoTitle: 'Curs euro leu azi și istoric: cursul BCE zilnic',
        description:
          'Cursul euro-leu și euro-dolar publicat zilnic de Banca Centrală Europeană, cu istoric din 2016, medii lunare și anuale și cursul dolar-leu.',
        summary:
          'Cât face un euro în lei și în dolari, în fiecare zi lucrătoare, cu istoricul complet. Cerealele și îngrășămintele se vând în euro și în dolari, așa că și cursul îți mută prețul.',
        about: {
          title: 'Despre curs',
          body: [
            'Banca Centrală Europeană publică în fiecare zi lucrătoare, în jurul orei 16:00 (ora Europei Centrale), cursurile de referință ale euro față de principalele monede. Cursul dolar-leu e calculat de noi din cele două cursuri ale aceleiași zile.',
            'Banca Națională a României publică propriul curs de referință. Pentru documentele fiscale din România se folosește, de regulă, cursul BNR. Diferența față de cursul BCE e de obicei mică, dar nu zero.',
          ],
        },
        faq: [
          {
            q: 'Este cursul BNR?',
            a: 'Nu. Este cursul de referință al Băncii Centrale Europene. Cursul BNR se stabilește separat și poate diferi puțin.',
          },
          {
            q: 'De ce lipsesc unele zile?',
            a: 'BCE nu publică cursuri în weekend și în zilele libere ale sistemului de plăți TARGET.',
          },
          {
            q: 'Cum se calculează cursul dolar-leu?',
            a: 'Împărțim cursul euro-leu la cursul euro-dolar din aceeași zi.',
          },
        ],
        dataset: {
          name: 'Cursul de schimb euro-leu și euro-dolar (BCE)',
          description:
            'Cursurile de referință zilnice ale Băncii Centrale Europene pentru RON și USD față de euro, din 2016, și cursul USD/RON calculat din ele.',
        },
      },
    },
    ui: {
      last: 'Ultima valoare',
      change: (period) => `față de ${period}`,
      period: {
        daily: 'ziua precedentă',
        weekly: 'săptămâna precedentă',
        monthly: 'luna precedentă',
      },
      year: 'Într-un an',
      high: 'Maxim 52 săpt.',
      low: 'Minim 52 săpt.',
      range52: 'Interval pe 52 de săptămâni',
      updated: 'Actualizat',
      approx: (value) => `≈ ${value}`,
      noData: 'Încă nu avem date pentru această piață. Apar aici după prima actualizare.',
      open: 'Vezi graficul',
      history: 'Istoric',
      historyLead:
        'Media fiecărei perioade, din datele zilnice, săptămânale sau lunare ale sursei.',
      monthly: 'Medii lunare',
      yearly: 'Medii anuale',
      daily30: 'Ultimele 30 de zile',
      month: 'Luna',
      yearCol: 'Anul',
      day: 'Ziua',
      average: 'Media',
      value: 'Valoare',
      source: 'Sursa',
      licence: 'Licența',
      faq: 'Întrebări frecvente',
      related: 'Alte piețe',
      sellGrain: (crop) => `Vinde ${crop} la Agrinvest`,
      shopFertilisers: 'Îngrășăminte în magazinul Agrinvest',
      dieselDelivery: 'Motorină livrată la fermă',
      rate: (unit) => `${unit}`,
    },
    ticker: {
      title: 'Piețele azi',
      place: 'Brent, curs BCE, motorină, grâu și uree',
      names: {
        brent: 'Brent',
        'eur-ron': 'EUR/RON',
        'diesel-ro': 'Motorină',
        'wheat-hrw': 'Grâu SUA',
        urea: 'Uree',
      },
    },
    chart: {
      ranges: { '1M': '1L', '3M': '3L', '6M': '6L', '1Y': '1A', '5Y': '5A', MAX: 'Tot' },
      rangeLabel: 'Perioada graficului',
      loading: 'Se încarcă graficul…',
      hint: 'Atinge sau mișcă mouse-ul pe grafic pentru valori.',
      table: 'Arată datele',
      date: 'Data',
      empty: 'Nu sunt date.',
    },
  },
  en: {
    section: 'Prices',
    groups: {
      energy: {
        title: 'Energy and fuel',
        lead: 'Brent crude, diesel and petrol prices in Romania, and natural gas in Europe.',
      },
      grain: {
        title: 'Grain and oilseeds',
        lead: 'World benchmark prices, monthly, and the EU’s weekly prices for Romania.',
      },
      fertiliser: {
        title: 'Fertilisers',
        lead: 'Urea, phosphates and potash on the world market, in dollars and lei per tonne.',
      },
      fx: {
        title: 'Exchange rates',
        lead: 'The European Central Bank’s reference rates, every working day.',
      },
    },
    markets: {
      brent: {
        name: 'Brent crude',
        benchmark: 'Brent crude, spot price FOB, in US dollars per barrel (U.S. EIA).',
      },
      'diesel-ro': {
        name: 'Diesel, Romania',
        benchmark: 'Average consumer price with taxes, reported by Romania to the EU Oil Bulletin.',
      },
      'petrol-ro': {
        name: 'Petrol, Romania',
        benchmark: 'Euro-super 95 petrol, average consumer price with taxes, reported by Romania.',
      },
      'diesel-eu': {
        name: 'Diesel, EU average',
        benchmark: 'Weighted average of the 27 member states, with taxes.',
      },
      'petrol-eu': {
        name: 'Petrol, EU average',
        benchmark: 'Euro-super 95, weighted average of the 27 member states, with taxes.',
      },
      'gas-eu': {
        name: 'Natural gas, Europe',
        benchmark: 'Monthly average at the Dutch TTF hub, per the World Bank, in $/MMBtu.',
      },
      'wheat-hrw': {
        name: 'Wheat, US (HRW)',
        benchmark: 'No. 2 hard red winter wheat, US Gulf export price (FOB).',
      },
      'wheat-srw': {
        name: 'Wheat, US (SRW)',
        benchmark: 'No. 2 soft red winter wheat, US Gulf export price.',
      },
      maize: { name: 'Corn, US', benchmark: 'No. 2 yellow maize, FOB US Gulf ports.' },
      'sunflower-oil': { name: 'Sunflower oil', benchmark: 'EU sunflower oil, FOB Rotterdam.' },
      'rapeseed-oil': { name: 'Rapeseed oil', benchmark: 'Dutch rapeseed oil, FOB Rotterdam.' },
      urea: { name: 'Urea', benchmark: 'Prilled urea, spot FOB Middle East.' },
      dap: { name: 'DAP', benchmark: 'Diammonium phosphate, spot FOB US Gulf.' },
      tsp: { name: 'Triple superphosphate (TSP)', benchmark: 'TSP, spot, import US Gulf.' },
      potash: {
        name: 'Potassium chloride',
        benchmark: 'Granular muriate of potash, spot CFR Brazil.',
      },
      'eur-ron': { name: 'EUR / RON', benchmark: 'ECB reference rate: lei per euro.' },
      'eur-usd': { name: 'EUR / USD', benchmark: 'ECB reference rate: dollars per euro.' },
      'usd-ron': {
        name: 'USD / RON',
        benchmark: 'Worked out from the two ECB rates of the same day: lei per dollar.',
      },
    },
    hub: {
      title: 'Farm market prices today',
      seoTitle: 'Farm prices today: grain, diesel, Brent, fertiliser, EUR/RON',
      description:
        'Grain, diesel and Brent crude prices, fertilisers and the euro-leu rate from official sources, each with a chart and its full history.',
      summary:
        'The markets that matter on a Romanian farm, in one place: energy, grain, fertilisers and exchange rates. Every figure carries its source and date.',
      dataset: {
        name: 'Farm and energy prices for Romanian farmers',
        description:
          'Daily Brent crude, weekly diesel and petrol prices in Romania and the EU, monthly world prices for grain, vegetable oils, natural gas and fertilisers, and the ECB’s EUR/RON and EUR/USD rates.',
      },
      grainLocal: 'Grain in Romania, EU market',
      grainLocalLead:
        'The weekly prices Romania reports to the European Commission, in euro per tonne: Constanța export and ex-works.',
      sources: 'Sources',
    },
    pages: {
      brent: {
        title: 'Brent crude oil price today',
        seoTitle: 'Brent crude oil price today: chart and history, $/bbl',
        description:
          'The daily Brent crude price in US dollars per barrel, with a chart from 2016 and the 52-week high and low. U.S. EIA data, updated daily.',
        summary:
          'Brent is the price benchmark for crude oil in Europe. Pump diesel and haulage costs follow it, with a lag.',
        about: {
          title: 'What it means for a farm',
          body: [
            'Brent is crude oil from the North Sea and the benchmark for a large share of the oil sold worldwide, Europe included. The figure here is the spot price FOB that the U.S. Energy Information Administration publishes for each trading day.',
            'Pump diesel follows crude oil with a lag of a few weeks. Excise duty, VAT and the leu-dollar rate come on top, so a fall in Brent never shows in full at the pump.',
          ],
        },
        faq: [
          {
            q: 'Why does the price differ from the news?',
            a: 'News reports usually quote the Brent futures contract on ICE, which moves during the day. This is the closing spot price published by the EIA, a few days later.',
          },
          {
            q: 'How many litres are in a barrel?',
            a: 'A barrel is 42 US gallons, about 159 litres.',
          },
          {
            q: 'How often is it updated?',
            a: 'Daily. The source publishes a price for each trading day, usually a few days later.',
          },
        ],
        dataset: {
          name: 'Daily Brent crude oil price',
          description:
            'Brent crude spot price FOB, in US dollars per barrel, for each trading day since 2016, from the U.S. Energy Information Administration.',
        },
      },
      fuel: {
        title: 'Diesel and petrol prices in Romania',
        seoTitle: 'Diesel price in Romania today: national and EU average',
        description:
          'Average diesel and petrol prices in Romania with taxes, in lei per litre and euro, compared with the EU average. Weekly data from the EU Oil Bulletin.',
        summary:
          'The national average pump price, week by week, and how Romania compares with the European Union average.',
        about: {
          title: 'Where the figures come from',
          body: [
            'Every week, member states report to the European Commission the average consumer prices of fuel, with all taxes, in force on Monday. The Commission publishes them in the Weekly Oil Bulletin, in euro per 1,000 litres.',
            'The price in lei per litre is our own conversion at the latest ECB rate, so it is approximate. A particular filling station can be above or below the national average.',
          ],
        },
        faq: [
          {
            q: 'Is this the pump price?',
            a: 'It is the national average retail price, with excise duty and VAT, as reported by Romania. A particular station may charge something else.',
          },
          {
            q: 'Why are the prices in euro?',
            a: 'The EU Oil Bulletin publishes every country in euro so they can be compared. We convert to lei at the latest ECB rate.',
          },
          {
            q: 'Where can I get diesel delivered to the farm?',
            a: 'Agrinvest delivers diesel to farms. The price is given on request, by quantity and county.',
          },
        ],
        dataset: {
          name: 'Weekly diesel and petrol prices in Romania and the EU',
          description:
            'Average consumer prices with taxes for diesel and Euro-super 95 petrol, Romania and the EU-27 average, in euro per 1,000 litres, weekly, from the European Commission’s Weekly Oil Bulletin.',
        },
      },
      gas: {
        title: 'Natural gas price in Europe',
        seoTitle: 'Natural gas price in Europe (TTF): monthly chart',
        description:
          'The monthly natural gas price in Europe at the Dutch TTF hub, in dollars per MMBtu and roughly in euro per MWh. World Bank data since 2010.',
        summary:
          'Natural gas is the main feedstock for nitrogen fertilisers, so its price shows up, over time, in the price of urea and ammonium nitrate.',
        about: {
          title: 'Why it matters on a farm',
          body: [
            'Natural gas is used to make ammonia, which goes into urea, ammonium nitrate and the other nitrogen fertilisers. When gas becomes much dearer in Europe, fertiliser plants cut output or raise their prices.',
            'The figure is the monthly average the World Bank publishes for Europe. Since April 2015 it is the price at the Title Transfer Facility (TTF) in the Netherlands. The euro per MWh figure is our own conversion (1 MMBtu = 0.293071 MWh) at the latest ECB rate.',
          ],
        },
        faq: [
          {
            q: 'What is TTF?',
            a: 'The Title Transfer Facility, the Dutch virtual gas market. It is the main price benchmark for natural gas in Europe.',
          },
          {
            q: 'Is this what households pay?',
            a: 'No. It is the wholesale price on the European market. A consumer bill adds transport, distribution, taxes and the supplier’s margin.',
          },
        ],
        dataset: {
          name: 'Monthly natural gas price in Europe',
          description:
            'Monthly average natural gas price in Europe (TTF since April 2015), in US dollars per MMBtu, from the World Bank (Pink Sheet).',
        },
      },
      fx: {
        title: 'Euro to leu exchange rate today',
        seoTitle: 'Euro to leu exchange rate today and history (ECB)',
        description:
          'The euro-leu and euro-dollar rates published daily by the European Central Bank, with history since 2016, monthly and yearly averages and the dollar-leu rate.',
        summary:
          'What a euro is worth in lei and in dollars on every working day, with the full history. Grain and fertilisers trade in euro and dollars, so the rate moves your price too.',
        about: {
          title: 'About the rate',
          body: [
            'The European Central Bank publishes the euro’s reference rates against the main currencies on every working day, at around 16:00 Central European Time. The dollar-leu rate is our own calculation from the two rates of the same day.',
            'The National Bank of Romania publishes its own reference rate. Romanian tax documents normally use the BNR rate. The difference from the ECB rate is usually small, but not zero.',
          ],
        },
        faq: [
          {
            q: 'Is this the BNR rate?',
            a: 'No. It is the European Central Bank’s reference rate. The BNR sets its own rate, which can differ slightly.',
          },
          {
            q: 'Why are some days missing?',
            a: 'The ECB publishes no rates at weekends or on TARGET payment system holidays.',
          },
          {
            q: 'How is the dollar-leu rate worked out?',
            a: 'We divide the euro-leu rate by the euro-dollar rate of the same day.',
          },
        ],
        dataset: {
          name: 'Euro to leu and euro to dollar exchange rates (ECB)',
          description:
            'The European Central Bank’s daily reference rates for RON and USD against the euro since 2016, and the USD/RON rate derived from them.',
        },
      },
    },
    ui: {
      last: 'Latest',
      change: (period) => `on the ${period}`,
      period: { daily: 'day before', weekly: 'week before', monthly: 'month before' },
      year: 'Over a year',
      high: '52-week high',
      low: '52-week low',
      range52: '52-week range',
      updated: 'Updated',
      approx: (value) => `≈ ${value}`,
      noData: 'No data for this market yet. It appears here after the first update.',
      open: 'See the chart',
      history: 'History',
      historyLead: 'The average of each period, from the source’s daily, weekly or monthly data.',
      monthly: 'Monthly averages',
      yearly: 'Yearly averages',
      daily30: 'The last 30 days',
      month: 'Month',
      yearCol: 'Year',
      day: 'Day',
      average: 'Average',
      value: 'Value',
      source: 'Source',
      licence: 'Licence',
      faq: 'Frequently asked questions',
      related: 'Other markets',
      sellGrain: (crop) => `Sell ${crop} to Agrinvest`,
      shopFertilisers: 'Fertilisers in the Agrinvest shop',
      dieselDelivery: 'Diesel delivered to the farm',
      rate: (unit) => `${unit}`,
    },
    ticker: {
      title: 'Markets today',
      place: 'Brent, ECB rate, diesel, wheat and urea',
      names: {
        brent: 'Brent',
        'eur-ron': 'EUR/RON',
        'diesel-ro': 'Diesel',
        'wheat-hrw': 'US wheat',
        urea: 'Urea',
      },
    },
    chart: {
      ranges: { '1M': '1M', '3M': '3M', '6M': '6M', '1Y': '1Y', '5Y': '5Y', MAX: 'All' },
      rangeLabel: 'Chart period',
      loading: 'Loading the chart…',
      hint: 'Touch or hover the chart for values.',
      table: 'Show the data',
      date: 'Date',
      empty: 'No data.',
    },
  },
}
