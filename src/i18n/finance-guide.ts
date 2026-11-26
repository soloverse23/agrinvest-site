import type { Locale } from './config'

/**
 * Interface strings of the finance section as a guide (Phase 7g): the section links, the
 * consultant action, the hub, the credit pages, the questions and the library.
 */
export const financeGuideUi = {
  ro: {
    nav: {
      label: 'În secțiunea Finanțare',
      credits: 'Credite',
      questions: 'Întrebări',
      simulator: 'Simulator',
      library: 'Bibliotecă',
    },
    consultant: 'Vorbește cu un consultant',
    consultantShort: 'Sună-mă',
    terms:
      'Condițiile se stabilesc pentru fiecare fermă, după analiză. Nu este o ofertă de credit.',
    facts: {
      reply: (n: number) => `${n} h`,
      replyLabel: 'răspuns de la dosarul complet',
      term: (n: number) => `${n} ani`,
      termLabel: 'durata maximă la investiții',
      instalments: (n: number) => `${n} rate/an`,
      instalmentsLabel: 'după recoltele de vară și toamnă',
      clients: (n: number) => `${n}+`,
      clientsLabel: 'fermieri finanțați',
    },
    hub: {
      needsTitle: 'De ce ai nevoie?',
      more: 'Mai finanțăm și',
      how: {
        title: 'Trei pași până la bani',
        steps: [
          {
            title: 'Vorbești cu un consultant',
            body: 'Lași numele și telefonul. Te sună un consultant care îți spune ce credit se potrivește și ce să pregătești.',
          },
          {
            title: 'Analizăm ferma',
            body: 'Ne uităm la ce lucrezi, cum încasezi și ce garanții ai, nu doar la un scor.',
          },
          {
            title: 'Semnezi și primești banii',
            body: 'Suma, garanțiile și graficul ratelor le stabilim împreună, după recoltele tale.',
          },
        ],
      },
      questionsAll: 'Toate întrebările',
      libraryAll: 'Toată biblioteca',
      bandTitle: 'Nu știi de unde să începi?',
      bandBody:
        'Spune-ne în două minute ce vrei să faci. Un consultant te sună și găsiți împreună varianta potrivită fermei tale.',
    },
    credit: {
      kicker: 'Agrinvest Credit IFN',
      fits: 'Se potrivește dacă',
      notFor: 'Nu se potrivește dacă',
      finances: 'Ce finanțează',
      choose: 'Alege ce finanțezi',
      specs: {
        repayment: 'Rambursare',
        repaymentHarvest: 'după recoltă, maximum 2 rate pe an',
        repaymentIncome: 'după încasările fermei',
        term: 'Durată',
        termSeason: 'de regulă un an agricol',
        termInvest: (n: number) => `până la ${n} ani`,
        guarantees: 'Garanții',
        borrowers: 'Pentru',
        currency: 'Moneda',
        lei: 'lei',
      },
      simulate: 'Vezi cum ar cădea ratele',
      tabs: {
        label: 'Pe această pagină',
        example: 'Exemplu',
        process: 'Cum decurge',
        guarantees: 'Garanții',
        questions: 'Întrebări',
        details: 'Detalii',
      },
      questionsTitle: 'Întrebări despre acest credit',
      questionsMore: 'Alte întrebări',
      detailsTitle: 'Detalii',
      detailsLead: 'Pe larg: ce finanțează, cum se rambursează, riscuri și surse.',
      detailsOpen: 'Citește detaliile',
      related: 'Fermierii care iau acest credit se uită și la',
      bandTitle: 'Vrei să afli ce sumă și ce rate ți se potrivesc?',
      bandBody:
        'Un consultant îți spune în aceeași zi dacă acest credit se potrivește fermei tale și ce trebuie pregătit.',
    },
    question: {
      kicker: 'Întrebări despre finanțare',
      short: 'Răspunsul pe scurt',
      factors: 'Ce decide la tine',
      factorsLead: 'Condițiile diferă de la o fermă la alta. Acestea schimbă răspunsul:',
      practice: 'Ce înseamnă în practică',
      credit: 'Creditul potrivit',
      creditCta: 'Vezi creditul',
      guide: 'Pe larg, în bibliotecă',
      related: 'Întrebări înrudite',
      bandTitle: 'Vrei un răspuns pentru ferma ta?',
      bandBody:
        'Răspunsul exact depinde de fermă. Un consultant te sună, te ascultă și îți spune ce se poate în cazul tău.',
    },
    questions: {
      title: 'Întrebări despre credit agricol',
      summary:
        'Răspunsuri scurte la ce întreabă fermierii despre creditul agricol: cine poate lua, cât costă, garanții, rate după recoltă, APIA și investiții.',
      seoTitle: 'Întrebări despre credit agricol, cu răspunsuri',
      search: 'Caută o întrebare',
      searchPlaceholder: 'de exemplu: PFA, garanții, tractor',
      empty: 'Nicio întrebare nu se potrivește. Întreabă direct un consultant.',
      count: (n: number) => `${n} întrebări`,
      missing: 'Nu găsești întrebarea ta?',
      missingBody: 'Întreabă direct un consultant: te sună și îți răspunde pentru ferma ta.',
    },
    library: {
      title: 'Bibliotecă de finanțare agricolă',
      summary:
        'Ghiduri pe larg despre credit agricol, subvenții APIA, garanții, leasing, fonduri europene și situații dificile, cu sursele fiecărei informații.',
      seoTitle: 'Bibliotecă de finanțare agricolă pentru fermieri',
      guides: 'Ghiduri',
      reference: 'Despre noi și termeni',
      about: 'Agrinvest Credit IFN: cine suntem, date de identificare și cum ne verifici.',
      glossaryTag: 'Glosar',
      guideTag: 'Ghid',
      aboutTag: 'Despre IFN',
    },
    applyShort: {
      title: 'Vrei doar să te sune un consultant?',
      body: 'Nu trebuie să completezi tot formularul. Lasă numele și telefonul, iar consultantul te ajută cu restul.',
    },
    simulatorMatch: {
      kicker: 'Ți se potrivește',
      for: (need: string) => `Pentru: ${need.toLowerCase()}`,
      noGrain:
        'Fără culturi de cereale, ratele se stabilesc după cum încasează ferma ta. Un consultant îți propune graficul.',
      see: 'Vezi creditul',
    },
  },
  en: {
    nav: {
      label: 'In the Financing section',
      credits: 'Loans',
      questions: 'Questions',
      simulator: 'Simulator',
      library: 'Library',
    },
    consultant: 'Talk to a consultant',
    consultantShort: 'Call me',
    terms: 'Terms are set for each farm after the review. This is not a credit offer.',
    facts: {
      reply: (n: number) => `${n} h`,
      replyLabel: 'reply after a complete file',
      term: (n: number) => `${n} years`,
      termLabel: 'longest term for investment',
      instalments: (n: number) => `${n} a year`,
      instalmentsLabel: 'instalments, after summer and autumn harvests',
      clients: (n: number) => `${n}+`,
      clientsLabel: 'farmers financed',
    },
    hub: {
      needsTitle: 'What do you need?',
      more: 'We also finance',
      how: {
        title: 'Three steps to the money',
        steps: [
          {
            title: 'You talk to a consultant',
            body: 'Leave your name and phone. A consultant calls, tells you which loan fits and what to prepare.',
          },
          {
            title: 'We review the farm',
            body: 'We look at what you farm, how you are paid and what guarantees you have, not just a score.',
          },
          {
            title: 'You sign and get the money',
            body: 'The amount, guarantees and instalment schedule are agreed together, around your harvests.',
          },
        ],
      },
      questionsAll: 'All questions',
      libraryAll: 'The whole library',
      bandTitle: 'Not sure where to start?',
      bandBody:
        'Tell us in two minutes what you want to do. A consultant calls you and together you find what suits your farm.',
    },
    credit: {
      kicker: 'Agrinvest Credit IFN',
      fits: 'It fits if',
      notFor: 'It does not fit if',
      finances: 'What it finances',
      choose: 'Choose what you finance',
      specs: {
        repayment: 'Repayment',
        repaymentHarvest: 'after harvest, at most 2 instalments a year',
        repaymentIncome: 'as the farm is paid',
        term: 'Term',
        termSeason: 'usually one farming year',
        termInvest: (n: number) => `up to ${n} years`,
        guarantees: 'Guarantees',
        borrowers: 'For',
        currency: 'Currency',
        lei: 'lei',
      },
      simulate: 'See how instalments would fall',
      tabs: {
        label: 'On this page',
        example: 'Example',
        process: 'How it works',
        guarantees: 'Guarantees',
        questions: 'Questions',
        details: 'Details',
      },
      questionsTitle: 'Questions about this loan',
      questionsMore: 'More questions',
      detailsTitle: 'Details',
      detailsLead: 'In full: what it finances, how repayment works, risks and sources.',
      detailsOpen: 'Read the details',
      related: 'Farmers taking this loan also look at',
      bandTitle: 'Want to know which amount and instalments suit you?',
      bandBody:
        'A consultant tells you the same day whether this loan suits your farm and what to prepare.',
    },
    question: {
      kicker: 'Financing questions',
      short: 'The short answer',
      factors: 'What decides it for you',
      factorsLead: 'Terms differ from one farm to another. These change the answer:',
      practice: 'What it means in practice',
      credit: 'The matching loan',
      creditCta: 'See the loan',
      guide: 'In full, in the library',
      related: 'Related questions',
      bandTitle: 'Want an answer for your farm?',
      bandBody:
        'The exact answer depends on the farm. A consultant calls you, listens and tells you what is possible in your case.',
    },
    questions: {
      title: 'Farm loan questions',
      summary:
        'Short answers to what farmers ask about farm loans: who can borrow, what it costs, guarantees, repaying after harvest, APIA and investment.',
      seoTitle: 'Farm loan questions, answered in short',
      search: 'Search the questions',
      searchPlaceholder: 'for example: PFA, guarantees, tractor',
      empty: 'No question matches. Ask a consultant directly.',
      count: (n: number) => `${n} questions`,
      missing: 'Cannot find your question?',
      missingBody: 'Ask a consultant directly: they call you and answer for your farm.',
    },
    library: {
      title: 'Farm financing library',
      summary:
        'In-depth guides to farm loans, APIA subsidies, guarantees, leasing, EU funds and difficult situations, with the source of every fact.',
      seoTitle: 'Farm financing library for Romanian farmers',
      guides: 'Guides',
      reference: 'About us and terms',
      about: 'Agrinvest Credit IFN: who we are, registration details and how to check us.',
      glossaryTag: 'Glossary',
      guideTag: 'Guide',
      aboutTag: 'About the IFN',
    },
    applyShort: {
      title: 'Only want a consultant to call?',
      body: 'You do not need to fill in the whole form. Leave your name and phone, and the consultant helps with the rest.',
    },
    simulatorMatch: {
      kicker: 'What fits',
      for: (need: string) => `For: ${need.toLowerCase()}`,
      noGrain:
        'Without grain crops, instalments follow how your farm is paid. A consultant proposes the schedule.',
      see: 'See the loan',
    },
  },
} as const satisfies Record<Locale, unknown>
