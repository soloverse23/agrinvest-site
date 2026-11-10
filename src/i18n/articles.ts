import type { Locale } from './config'

/** Knowledge hub, farmer guides, Agrinvest news and author pages (Phase 6). */
export const articlesUi = {
  ro: {
    hub: {
      title: 'Ghiduri pentru fermieri',
      seoTitle: 'Ghiduri pentru fermieri: culturi, vânzare, depozitare',
      description:
        'Răspunsuri scurte și verificate pentru fermieri: grâu, porumb, floarea-soarelui, rapiță, vânzarea recoltei, depozitare, fertilizare și finanțare.',
      summary:
        'Întrebările pe care ni le pun fermierii, cu răspunsuri scrise și verificate de oameni care lucrează în câmp, la recepție și în finanțare.',
      kicker: 'Ghiduri',
      pillars: 'Pe teme',
      latest: 'Cele mai noi ghiduri',
      finance: {
        title: 'Finanțare',
        intro: 'Credit agricol, APIA, garanții și costul real al creditului.',
      },
      count: (n: number) => (n === 1 ? '1 ghid' : `${n} ghiduri`),
      empty: 'Primele ghiduri apar în curând.',
    },
    pillar: {
      kicker: 'Ghiduri',
      next: 'Pașii următori',
      all: 'Toate ghidurile',
      notes: 'Nota de piață',
    },
    article: {
      contents: 'Cuprins',
      by: 'Scris de',
      reviewedBy: 'Verificat de',
      updated: 'Actualizat',
      minutes: (n: number) => `${n} min de citit`,
      sources: 'Surse',
      sourcesLead: 'Cifrele și regulile din text vin din aceste surse.',
      retrieved: 'consultat',
      products: 'Produse din magazin',
      related: 'Citește și',
      next: 'Pașii următori',
      aboutAuthor: 'Despre autor',
      authorLink: 'Toate textele autorului',
      cta: {
        title: 'Ai o întrebare pentru agronomii noștri?',
        body: 'Sună la cea mai apropiată bază sau lasă-ne un mesaj. Răspundem în aceeași zi lucrătoare.',
        primary: 'Contactează-ne',
        secondary: 'Prețurile zilei',
      },
    },
    news: {
      kicker: 'Știri Agrinvest',
      own: 'De la Agrinvest',
      latest: 'Ultimele știri Agrinvest',
      more: 'Mai multe știri',
    },
    author: {
      kicker: 'Autor',
      wrote: 'Ghiduri și știri scrise',
      reviewed: 'Texte verificate',
      none: 'Încă nu a publicat texte.',
      section: 'Autori',
    },
    home: {
      kicker: 'Ghiduri și știri',
      title: 'Ce trebuie să știi săptămâna asta',
      all: 'Toate ghidurile',
    },
  },
  en: {
    hub: {
      title: 'Guides for farmers',
      seoTitle: 'Guides for farmers in Romania: crops, selling, storage',
      description:
        'Short, checked answers for farmers: wheat, corn, sunflower, rapeseed, selling the harvest, storage, fertilisation and financing.',
      summary:
        'The questions farmers ask us, answered and checked by people who work in the field, at grain intake and in financing.',
      kicker: 'Guides',
      pillars: 'By topic',
      latest: 'Latest guides',
      finance: {
        title: 'Financing',
        intro: 'Farm credit, APIA, guarantees and the real cost of credit.',
      },
      count: (n: number) => (n === 1 ? '1 guide' : `${n} guides`),
      empty: 'The first guides are coming soon.',
    },
    pillar: {
      kicker: 'Guides',
      next: 'Next steps',
      all: 'All guides',
      notes: 'Market note',
    },
    article: {
      contents: 'Contents',
      by: 'Written by',
      reviewedBy: 'Reviewed by',
      updated: 'Updated',
      minutes: (n: number) => `${n} min read`,
      sources: 'Sources',
      sourcesLead: 'The figures and rules in the text come from these sources.',
      retrieved: 'retrieved',
      products: 'Products in the shop',
      related: 'Read next',
      next: 'Next steps',
      aboutAuthor: 'About the author',
      authorLink: 'Everything by this author',
      cta: {
        title: 'A question for our agronomists?',
        body: 'Call your nearest base or send us a message. We answer the same working day.',
        primary: 'Contact us',
        secondary: 'Today’s prices',
      },
    },
    news: {
      kicker: 'Agrinvest news',
      own: 'From Agrinvest',
      latest: 'Latest Agrinvest news',
      more: 'More news',
    },
    author: {
      kicker: 'Author',
      wrote: 'Guides and news written',
      reviewed: 'Texts reviewed',
      none: 'No published texts yet.',
      section: 'Authors',
    },
    home: {
      kicker: 'Guides and news',
      title: 'What to know this week',
      all: 'All guides',
    },
  },
} satisfies Record<Locale, unknown>
