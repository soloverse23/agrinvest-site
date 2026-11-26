import type { DepartmentRole } from '@/access/departments'

type Label = { ro: string; en: string }
export type NavGroup = { label: Label; items: readonly string[] }

/**
 * The sidebar of each department, in plain work categories rather than one long list. Every
 * section of `departments[role].sections` appears here exactly once per department
 * (`tests/int/panel.int.spec.ts` checks it).
 */
export const panelNav: Record<DepartmentRole, readonly NavGroup[]> = {
  cereale: [
    {
      label: { ro: 'De rezolvat', en: 'To handle' },
      items: ['buy-prices', 'leads'],
    },
    {
      label: { ro: 'Paginile de cereale', en: 'Grain pages' },
      items: ['pages', 'bases', 'crops'],
    },
    { label: { ro: 'Fișiere', en: 'Files' }, items: ['media'] },
  ],
  comercial: [
    { label: { ro: 'De rezolvat', en: 'To handle' }, items: ['orders', 'leads'] },
    {
      label: { ro: 'Catalog și prețuri', en: 'Catalogue and prices' },
      items: ['products', 'categories', 'brands', 'active-ingredients'],
    },
    {
      label: { ro: 'Paginile magazinului', en: 'Shop pages' },
      items: ['shop-home', 'pages'],
    },
    { label: { ro: 'Fișiere', en: 'Files' }, items: ['documents', 'media'] },
  ],
  ifn: [
    {
      label: { ro: 'De rezolvat', en: 'To handle' },
      items: ['finance-applications', 'leads'],
    },
    {
      label: { ro: 'Oferta de finanțare', en: 'Finance offer' },
      items: ['finance-products', 'finance-questions'],
    },
    { label: { ro: 'Ghiduri și pagini', en: 'Guides and pages' }, items: ['guides', 'pages'] },
    { label: { ro: 'Fișiere', en: 'Files' }, items: ['media'] },
  ],
  logistica: [
    { label: { ro: 'De rezolvat', en: 'To handle' }, items: ['leads'] },
    { label: { ro: 'Pagini și imagini', en: 'Pages and images' }, items: ['pages', 'media'] },
  ],
  motorina: [
    { label: { ro: 'De rezolvat', en: 'To handle' }, items: ['diesel-prices', 'leads'] },
    { label: { ro: 'Fișiere', en: 'Files' }, items: ['media'] },
  ],
  continut: [
    { label: { ro: 'Paginile site-ului', en: 'Site pages' }, items: ['pages'] },
    {
      label: { ro: 'Articole și postări', en: 'Articles and posts' },
      items: ['guides', 'social-posts'],
    },
    { label: { ro: 'Echipă și imagini', en: 'Team and images' }, items: ['people', 'media'] },
  ],
}

/** One icon per section, from `PanelIcons`. */
export const sectionIcon: Record<string, string> = {
  pages: 'page',
  bases: 'silo',
  crops: 'wheat',
  guides: 'book',
  'social-posts': 'chat',
  people: 'people',
  media: 'image',
  products: 'box',
  categories: 'grid',
  brands: 'tag',
  'active-ingredients': 'drop',
  orders: 'cart',
  'shop-home': 'shop',
  documents: 'file',
  'finance-applications': 'inbox',
  'finance-products': 'coins',
  'finance-questions': 'question',
  'buy-prices': 'wheat',
  'diesel-prices': 'fuel',
  leads: 'phone',
}
