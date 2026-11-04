import { localePath, type Locale } from './config'

/**
 * Prefixes of the collection routes (bases and crops are not CMS pages), per language.
 * Each prefix has its own route folder under `src/app/(frontend)/[locale]/`, which serves
 * only its own language.
 */
export const sections = {
  bases: { ro: '/baze', en: '/bases' },
  crops: { ro: '/cereale', en: '/grain' },
} as const satisfies Record<string, Record<Locale, string>>

export type Section = keyof typeof sections

/** Public URL of a base page: `/baze/pogoanele`, `/en/bases/pogoanele`. */
export const basePath = (slug: string, locale: Locale) =>
  localePath(`${sections.bases[locale]}/${slug}`, locale)

/** Public URL of a crop page: `/cereale/grau`, `/en/grain/wheat`. */
export const cropPath = (slug: string, locale: Locale) =>
  localePath(`${sections.crops[locale]}/${slug}`, locale)
