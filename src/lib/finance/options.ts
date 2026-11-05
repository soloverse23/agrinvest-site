import type { Locale } from '@/i18n/config'

/**
 * Closed lists of the finance section, shared by the collections, the reviewed files
 * (`scripts/finance/schema.ts`) and the tools.
 */
type Labels<K extends string> = Record<K, Record<Locale, string>>

export const guaranteeKinds = [
  'promissory-note',
  'crops',
  'machinery',
  'apia-subsidies',
  'grain-contracts',
  'mortgage',
] as const
export type GuaranteeKind = (typeof guaranteeKinds)[number]

export const guaranteeLabels: Labels<GuaranteeKind> = {
  'promissory-note': { ro: 'Bilet la ordin', en: 'Promissory note' },
  crops: { ro: 'Culturi', en: 'Crops' },
  machinery: { ro: 'Utilaje agricole', en: 'Farm machinery' },
  'apia-subsidies': { ro: 'Subvenții APIA', en: 'APIA subsidies' },
  'grain-contracts': { ro: 'Contracte de vânzare cereale', en: 'Grain sale contracts' },
  mortgage: { ro: 'Ipotecă imobiliară', en: 'Mortgage' },
}

export const borrowerKinds = ['pfa', 'ii', 'if', 'srl', 'sa', 'agricultural-company'] as const
export type BorrowerKind = (typeof borrowerKinds)[number]

export const borrowerLabels: Labels<BorrowerKind> = {
  pfa: { ro: 'Persoană fizică autorizată (PFA)', en: 'Authorised individual (PFA)' },
  ii: { ro: 'Întreprindere individuală (II)', en: 'Sole enterprise (II)' },
  if: { ro: 'Întreprindere familială (IF)', en: 'Family enterprise (IF)' },
  srl: { ro: 'Societate cu răspundere limitată (SRL)', en: 'Limited company (SRL)' },
  sa: { ro: 'Societate pe acțiuni (SA)', en: 'Joint-stock company (SA)' },
  'agricultural-company': { ro: 'Societate agricolă', en: 'Agricultural company' },
}

/** Who a document applies to. `individual` = PFA, II, IF; `company` = SRL, SA, agricultural. */
export const documentAudiences = ['all', 'individual', 'company'] as const
export type DocumentAudience = (typeof documentAudiences)[number]

export const documentAudienceLabels: Labels<DocumentAudience> = {
  all: { ro: 'Toți solicitanții', en: 'All applicants' },
  individual: { ro: 'PFA, II, IF', en: 'PFA, II, IF' },
  company: { ro: 'SRL, SA, societăți agricole', en: 'SRL, SA, agricultural companies' },
}

/** Only `legal-approved` may reach the index (`check:finance`). */
export const legalStatuses = ['draft', 'ifn-reviewed', 'legal-approved'] as const
export type LegalStatus = (typeof legalStatuses)[number]

export const legalStatusLabels: Labels<LegalStatus> = {
  draft: { ro: 'Ciornă', en: 'Draft' },
  'ifn-reviewed': { ro: 'Verificat de IFN', en: 'Reviewed by the IFN' },
  'legal-approved': { ro: 'Aprobat juridic', en: 'Legally approved' },
}

export const optionsOf = <K extends string>(keys: readonly K[], labels: Labels<K>) =>
  keys.map((value) => ({ value, label: labels[value] }))
