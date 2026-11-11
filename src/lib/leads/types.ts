import type { Locale } from '@/i18n/config'

/** Lead types. Each one is routed to a named person (Lead routing global). */
export const leadTypes = [
  'vanzare-cereale',
  'depozitare',
  'inputuri',
  'finantare',
  'logistica',
  'motorina',
  'parteneri',
  'cariere',
  'general',
  'quick',
] as const

export type LeadType = (typeof leadTypes)[number]

export const leadTypeLabels: Record<LeadType, Record<Locale, string>> = {
  'vanzare-cereale': { ro: 'Vânzare cereale', en: 'Selling grain' },
  depozitare: { ro: 'Depozitare', en: 'Storage' },
  inputuri: { ro: 'Inputuri', en: 'Farm inputs' },
  finantare: { ro: 'Finanțare', en: 'Financing' },
  logistica: { ro: 'Logistică', en: 'Logistics' },
  motorina: { ro: 'Motorină', en: 'Diesel' },
  parteneri: { ro: 'Parteneriat', en: 'Partnership' },
  cariere: { ro: 'Cariere', en: 'Careers' },
  general: { ro: 'General', en: 'General' },
  quick: { ro: 'Cerere rapidă', en: 'Quick request' },
}

export const leadTypeOptions = leadTypes.map((value) => ({ value, label: leadTypeLabels[value] }))

/** Types a full lead form can have. `quick` comes only from the one-field quick request. */
export const formLeadTypes = leadTypes.filter((t): t is Exclude<LeadType, 'quick'> => t !== 'quick')
export type FormLeadType = (typeof formLeadTypes)[number]

export const formLeadTypeOptions = leadTypeOptions.filter((o) => o.value !== 'quick')

export const isLeadType = (value: unknown): value is LeadType =>
  (leadTypes as readonly unknown[]).includes(value)
