import type { Access, PayloadRequest, Where } from 'payload'

import { staffRequest, type UserRole } from './index'

type Label = { ro: string; en: string }
type Department = { label: Label; hint: Label; sections: readonly string[] }

/**
 * The staff panel by department, following Agrinvest's organisation chart (Phase 9). Each
 * department sees and edits only its own sections, and in shared sections (pages, articles,
 * requests) only its own documents (`rowRules`). They open a page, change the text, save it and
 * set its status. Creating new documents and deleting stay with the admin, except new price
 * rows and images. The admin (Administrator general) sees everything. The order of `sections`
 * is the order of the cards on the panel's home screen.
 */
export const departments = {
  cereale: {
    label: { ro: 'Cereale', en: 'Grain' },
    hint: {
      ro: 'Prețurile de achiziție, cererile de vânzare și depozitare, paginile de cereale și bazele.',
      en: 'Grain buy prices, selling and storage requests, the grain pages and the bases.',
    },
    sections: ['buy-prices', 'leads', 'pages', 'bases', 'crops', 'media'],
  },
  comercial: {
    label: { ro: 'Comercial (magazin)', en: 'Commercial (shop)' },
    hint: {
      ro: 'Magazinul: produsele și prețurile lor, categoriile, mărcile, comenzile și cererile de inputuri.',
      en: 'The shop: products and their prices, categories, brands, orders and input requests.',
    },
    sections: [
      'orders',
      'leads',
      'products',
      'categories',
      'brands',
      'active-ingredients',
      'documents',
      'shop-home',
      'pages',
      'media',
    ],
  },
  ifn: {
    label: { ro: 'Financiar (IFN)', en: 'Finance (IFN)' },
    hint: {
      ro: 'Cererile de credit, produsele de finanțare și dobânzile lor, ghidurile și întrebările.',
      en: 'Credit applications, finance products and their rates, finance guides and questions.',
    },
    sections: [
      'finance-applications',
      'leads',
      'finance-products',
      'finance-questions',
      'guides',
      'pages',
      'media',
    ],
  },
  logistica: {
    label: { ro: 'Logistică', en: 'Logistics' },
    hint: {
      ro: 'Cererile de transport și paginile de logistică și livrare.',
      en: 'Transport requests and the logistics and delivery pages.',
    },
    sections: ['leads', 'pages', 'media'],
  },
  motorina: {
    label: { ro: 'Motorină', en: 'Diesel' },
    hint: {
      ro: 'Prețul motorinei și cererile de motorină.',
      en: 'The diesel price and diesel requests.',
    },
    sections: ['diesel-prices', 'leads', 'media'],
  },
  continut: {
    label: { ro: 'Conținut', en: 'Content' },
    hint: {
      ro: 'Pagina principală și paginile despre companie, articolele și știrile, echipa și postările.',
      en: 'The home page and company pages, articles and news, the team and social posts.',
    },
    sections: ['pages', 'guides', 'people', 'social-posts', 'media'],
  },
} as const satisfies Record<string, Department>

export type DepartmentRole = keyof typeof departments
export const departmentRoles = Object.keys(departments) as DepartmentRole[]

/**
 * Shared sections, split by document: the field that says whose a document is, and the values
 * each department owns. A document with no owner (e.g. the legal pages) is the admin's.
 */
type RowRule = { field: string; values: Partial<Record<DepartmentRole, readonly string[]>> }

export const rowRules: Record<string, RowRule> = {
  // Each page names its department in the sidebar (admin only).
  pages: {
    field: 'department',
    values: Object.fromEntries(departmentRoles.map((r) => [r, [r]])),
  },
  guides: {
    field: 'section',
    values: { ifn: ['finantare', 'pagina-finantare'], continut: ['ghid', 'stiri', 'piata'] },
  },
  // Requests from the site by lead type; partnership and careers requests stay with the admin.
  leads: {
    field: 'type',
    values: {
      cereale: ['vanzare-cereale', 'depozitare'],
      comercial: ['inputuri', 'general', 'quick'],
      ifn: ['finantare'],
      logistica: ['logistica'],
      motorina: ['motorina'],
    },
  },
}

/** Sections where a department may also add new documents (a newer price replaces the old). */
const creatable: Partial<Record<string, readonly DepartmentRole[]>> = {
  'buy-prices': ['cereale'],
  'diesel-prices': ['motorina'],
  media: departmentRoles,
}

type WithUser = Pick<PayloadRequest, 'user'>

export const rolesOf = (req: WithUser): string[] => {
  if (!staffRequest(req)) return []
  const roles = (req.user as { roles?: string[] | null }).roles
  return Array.isArray(roles) ? roles : []
}

export const adminRequest = (req: WithUser): boolean => rolesOf(req).includes('admin')

const hasAny = (req: WithUser, roles: readonly string[]) =>
  rolesOf(req).some((role) => role === 'admin' || roles.includes(role))

/** The departments that own a section. */
export const ownersOf = (slug: string): DepartmentRole[] =>
  departmentRoles.filter((role) => (departments[role].sections as readonly string[]).includes(slug))

/** The department's own sections, in panel order; every section for an admin. */
export const sectionsFor = (req: WithUser): DepartmentRole[] =>
  adminRequest(req) ? departmentRoles : departmentRoles.filter((r) => rolesOf(req).includes(r))

/**
 * What of a section an account may change: everything (`true`), nothing (`false`), or only
 * its own documents of a shared section (a query).
 */
export function rowsFor(req: WithUser, slug: string): boolean | Where {
  if (adminRequest(req)) return true
  const own = ownersOf(slug).filter((role) => rolesOf(req).includes(role))
  if (!own.length) return false
  const rule = rowRules[slug]
  if (!rule) return true
  const values = [...new Set(own.flatMap((role) => rule.values[role] ?? []))]
  return values.length ? { [rule.field]: { in: values } } : false
}

/** One department's documents of a shared section, or `null` for a section it owns whole. */
export function departmentRows(role: DepartmentRole, slug: string): Where | null {
  const rule = rowRules[slug]
  return rule ? { [rule.field]: { in: [...(rule.values[role] ?? [])] } } : null
}

/** Admin, or a department that owns the section (in a shared section, its own documents). */
export const editors =
  (slug: string): Access =>
  ({ req }) =>
    rowsFor(req, slug)

/** Admin, or a department allowed to add documents to the section. */
export const creators =
  (slug: string): Access =>
  ({ req }) =>
    hasAny(req, creatable[slug] ?? [])

export const adminOnly: Access = ({ req }) => adminRequest(req)

/** `admin.baseListFilter`: a department's list of a shared section shows only its documents. */
export const ownRowsOnly =
  (slug: string) =>
  ({ req }: { req: PayloadRequest }): Where | null => {
    const rows = rowsFor(req, slug)
    if (rows === false) return { id: { equals: -1 } }
    return typeof rows === 'object' ? rows : null
  }

/** `admin.hidden`: the section shows only to its departments and the admin. */
export const hiddenUnlessOwner =
  (slug: string) =>
  ({ user }: { user: unknown }): boolean =>
    !hasAny({ user: user as never }, ownersOf(slug))

/** `admin.hidden` for technical sections: the admin only. */
export const hiddenUnlessAdmin = ({ user }: { user: unknown }): boolean =>
  !adminRequest({ user: user as never })

/** Read, update and status change for the owners; create and delete for the admin. */
export const sectionAccess = (slug: string, read?: Access) => ({
  read: read ?? editors(slug),
  create: creators(slug),
  update: editors(slug),
  delete: adminOnly,
})

/** Labels of roles for the users screen. */
export const roleLabels: Record<UserRole, Label> = {
  admin: { ro: 'Administrator general (tot panoul)', en: 'General administrator (whole panel)' },
  ...Object.fromEntries(departmentRoles.map((r) => [r, departments[r].label])),
} as Record<UserRole, Label>

/** The department options of a page's sidebar field. */
export const departmentOptions = departmentRoles.map((value) => ({
  value,
  label: departments[value].label,
}))
