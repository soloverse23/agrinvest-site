import type { Locale } from './config'

/**
 * Strings of the credit application form. The page passes one language to the form, so the
 * client bundle carries no text. `{max}` and `{person}` are filled in where they are used.
 */
export const applicationUi = {
  ro: {
    required: 'Câmpurile fără „opțional” sunt obligatorii.',
    who: '1. Cine solicită',
    borrower: 'Forma de organizare',
    choose: 'Alege',
    cui: 'CUI',
    find: 'Completează din ANAF',
    finding: 'Se caută…',
    found: 'Am completat denumirea. Verific-o.',
    notFound: 'ANAF nu a găsit acest CUI. Completează denumirea manual.',
    invalid: 'Scrie un CUI valid.',
    unavailable: 'Serviciul ANAF nu răspunde acum. Completează denumirea manual.',
    company: 'Denumirea fermei sau a firmei',
    name: 'Persoana de contact',
    phone: 'Telefon',
    email: 'E-mail',
    county: 'Județul în care lucrezi',
    need: '2. De ce ai nevoie',
    product: 'Tipul de finanțare (opțional)',
    unsure: 'Nu știu încă',
    amount: 'Suma de care ai nevoie',
    term: 'Durata (opțional)',
    termHint: 'În luni, până la {max}.',
    months: 'luni',
    crops: 'Ce cultivi (opțional)',
    area: 'Suprafața lucrată (opțional)',
    guarantees: 'Ce garanții ai putea oferi (opțional)',
    guaranteesHint: 'Doar ca să pregătim discuția. Garanțiile se stabilesc după analiză.',
    message: 'Ce vrei să finanțezi? (opțional)',
    consents: '3. Acorduri',
    draft: 'Text în lucru, se confirmă cu juristul.',
    consent:
      'Sunt de acord ca Agrinvest Credit IFN să folosească aceste date ca să analizeze cererea și să mă contacteze.',
    creditBureau:
      'Sunt de acord ca, după ce vorbim, Agrinvest Credit IFN să consulte Biroul de Credit pentru analiza cererii (opțional).',
    privacy: 'Cum folosim datele',
    note: 'Trimiterea nu te obligă la nimic. Site-ul nu face nicio verificare de credit și nu ia nicio decizie: cererea ajunge la echipa Agrinvest Credit IFN, care te contactează.',
    submit: 'Trimite cererea',
    sending: 'Se trimite…',
    done: 'Mulțumim, am primit cererea.',
    reference: 'Numărul cererii',
    referenceNote: 'Spune-l când vorbești cu noi.',
    next: 'Ce urmează',
    callNamed:
      'Te contactează {person}, pentru o primă discuție despre fermă și ce vrei să finanțezi.',
    callGeneric:
      'Te contactează echipa Agrinvest Credit IFN, pentru o primă discuție despre fermă și ce vrei să finanțezi.',
    documents:
      'Îți spunem atunci ce documente sunt necesare pentru forma ta de organizare și pentru tipul de finanțare.',
    reply: 'Răspunsul la cerere:',
    notDecided:
      'Nimic nu este decis încă: cererea nu înseamnă aprobare, iar condițiile se stabilesc după analiză.',
  },
  en: {
    required: 'Fields not marked “optional” are required.',
    who: '1. Who is applying',
    borrower: 'Legal form',
    choose: 'Choose',
    cui: 'Tax ID (CUI)',
    find: 'Fill in from ANAF',
    finding: 'Searching…',
    found: 'We filled in the name. Please check it.',
    notFound: 'ANAF did not find this tax ID. Please enter the name by hand.',
    invalid: 'Please enter a valid tax ID.',
    unavailable: 'The ANAF service is not answering. Please enter the name by hand.',
    company: 'Farm or company name',
    name: 'Contact person',
    phone: 'Phone',
    email: 'Email',
    county: 'County you farm in',
    need: '2. What you need',
    product: 'Type of financing (optional)',
    unsure: 'Not sure yet',
    amount: 'Amount you need',
    term: 'Term (optional)',
    termHint: 'In months, up to {max}.',
    months: 'months',
    crops: 'What you grow (optional)',
    area: 'Area farmed (optional)',
    guarantees: 'Guarantees you could offer (optional)',
    guaranteesHint: 'Only to prepare the conversation. Guarantees are agreed after the analysis.',
    message: 'What do you want to finance? (optional)',
    consents: '3. Consent',
    draft: 'Working text, to be confirmed by the lawyer.',
    consent:
      'I agree that Agrinvest Credit IFN may use these details to review the application and contact me.',
    creditBureau:
      'I agree that, after we talk, Agrinvest Credit IFN may check the Credit Bureau to review the application (optional).',
    privacy: 'How we use your data',
    note: 'Sending this commits you to nothing. The site runs no credit check and takes no decision: the application goes to the Agrinvest Credit IFN team, who will contact you.',
    submit: 'Send application',
    sending: 'Sending…',
    done: 'Thank you, we have your application.',
    reference: 'Application number',
    referenceNote: 'Please quote it when you talk to us.',
    next: 'What happens next',
    callNamed:
      'You will be contacted by {person} for a first conversation about your farm and what you want to finance.',
    callGeneric:
      'The Agrinvest Credit IFN team will contact you for a first conversation about your farm and what you want to finance.',
    documents: 'We will then tell you which documents your legal form and type of financing need.',
    reply: 'Reply to the application:',
    notDecided:
      'Nothing is decided yet: an application is not an approval, and terms are set after the analysis.',
  },
} as const satisfies Record<Locale, Record<string, string>>

export type ApplicationLabels = (typeof applicationUi)[Locale]
