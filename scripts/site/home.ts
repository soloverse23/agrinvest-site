/**
 * The home page's FAQ and SEO text (Phase 7b), a draft for the owner to review. The seed and
 * `apply:redesign` write them to the home page; the stories show the same words.
 *
 * `{{KEY}}` is a figures-register value: the page shows it with its "to confirm" marker, and
 * FAQPage JSON-LD leaves out any answer whose values are not confirmed yet.
 */
export type Locale = 'ro' | 'en'

export const homeFaq: Record<Locale, { question: string; answer: string }[]> = {
  ro: [
    {
      question: 'Unde văd prețul cerealelor la Agrinvest?',
      answer:
        'Pe pagina Prețuri, pentru fiecare cultură. Prețul final se stabilește la recepție, după analiza calității.',
    },
    {
      question: 'Unde pot livra cerealele?',
      answer:
        'La oricare dintre cele {{S1}} silozuri și depozite Agrinvest, în {{C4}} județe, sau le ridicăm de la fermă cu flota proprie.',
    },
    {
      question: 'Când primesc banii pentru cereale?',
      answer: 'Plata se face {{C8}}, după cântărire și analiza calității.',
    },
    {
      question: 'Cum ajung la mine produsele din magazin?',
      answer:
        'Comanzi online, iar un consultant te sună să confirme stocul și livrarea. Condițiile sunt pe pagina Livrare.',
    },
    {
      question: 'Pot plăti inputurile după recoltă?',
      answer: 'Da, prin Agrinvest Credit IFN: {{F5.instalments}}. Primești răspuns {{F4.reply}}.',
    },
  ],
  en: [
    {
      question: 'Where can I see Agrinvest’s grain prices?',
      answer:
        'On the Prices page, for every crop. The final price is set at reception, after the quality check.',
    },
    {
      question: 'Where can I deliver my grain?',
      answer:
        'To any of Agrinvest’s {{S1}} silos and warehouses, in {{C4}} counties, or we collect it from the farm with our own fleet.',
    },
    {
      question: 'When am I paid for my grain?',
      answer: 'Payment is made {{C8}}, after weighing and the quality check.',
    },
    {
      question: 'How do shop orders reach me?',
      answer:
        'You order online and a consultant calls to confirm stock and delivery. The terms are on the Delivery page.',
    },
    {
      question: 'Can I pay for inputs after harvest?',
      answer:
        'Yes, through Agrinvest Credit IFN: {{F5.instalments}}. You get a reply {{F4.reply}}.',
    },
  ],
}

/** Home `seo` fields: Agrinvest, selling grain, today's wheat price, the farm shop. */
export const homeSeo: Record<Locale, { title: string; description: string }> = {
  ro: {
    title: 'Agrinvest: vinde cereale, preț grâu azi, magazin agricol',
    description:
      'Prețul zilei pentru grâu, porumb și floarea-soarelui, recepție în bazele Agrinvest, magazin agricol cu semințe și inputuri, credit cu rate după recoltă.',
  },
  en: {
    title: 'Agrinvest: sell grain, today’s wheat price, farm shop',
    description:
      'Today’s price for wheat, maize and sunflower, reception at Agrinvest’s bases, a farm shop for seeds and inputs, and credit repaid after harvest.',
  },
}
