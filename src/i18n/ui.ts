import { localePath, type Locale } from './config'

/** Interface strings shared by the page templates. Content lives in Payload. */
export const ui = {
  ro: {
    home: 'Acasă',
    menu: 'Meniu',
    mainNav: 'Navigație principală',
    language: 'Limba',
    breadcrumb: 'Ești aici',
    updated: 'Actualizat la',
    faq: 'Întrebări frecvente',
    contact: 'Contact',
    privacy: 'Confidențialitate',
    capacity: 'Capacitate',
    services: 'Servicii',
    county: 'Județ',
    bases: 'Baze',
    crops: 'Culturi',
    quality: 'Condiții de recepție',
    moisture: 'Umiditate maximă',
    impurities: 'Impurități maxime',
    hectolitre: 'Masă hectolitrică minimă',
    watch: 'Vezi pe YouTube',
  },
  en: {
    home: 'Home',
    menu: 'Menu',
    mainNav: 'Main navigation',
    language: 'Language',
    breadcrumb: 'You are here',
    updated: 'Updated on',
    faq: 'Frequently asked questions',
    contact: 'Contact',
    privacy: 'Privacy',
    capacity: 'Capacity',
    services: 'Services',
    county: 'County',
    bases: 'Bases',
    crops: 'Crops',
    quality: 'Reception standards',
    moisture: 'Maximum moisture',
    impurities: 'Maximum impurities',
    hectolitre: 'Minimum hectolitre mass',
    watch: 'Watch on YouTube',
  },
} satisfies Record<Locale, Record<string, string>>

/** Locale-relative paths of fixed pages (seeded in Payload). */
export const fixedPaths = {
  privacy: { ro: '/confidentialitate', en: '/privacy' },
  contact: { ro: '/contact', en: '/contact' },
} satisfies Record<string, Record<Locale, string>>

export const fixedUrl = (page: keyof typeof fixedPaths, locale: Locale) =>
  localePath(fixedPaths[page][locale], locale)
