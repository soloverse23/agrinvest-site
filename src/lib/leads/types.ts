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
}

export const leadTypeOptions = leadTypes.map((value) => ({ value, label: leadTypeLabels[value] }))

export const isLeadType = (value: unknown): value is LeadType =>
  (leadTypes as readonly unknown[]).includes(value)
