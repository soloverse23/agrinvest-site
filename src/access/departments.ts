import type { Access, PayloadRequest } from 'payload'

import { staffRequest, type UserRole } from './index'

type Label = { ro: string; en: string }
type Department = { label: Label; hint: Label; sections: readonly string[] }

/**
 * The staff panel by department (Phase 9). Each department sees and edits only its own
 * sections: they open a page, change the text, save it and set its status. Creating new
 * documents and deleting stay with the admin, except new price rows. An admin sees everything.
 * The order of `sections` is the order of the cards on the panel's home screen.
 */
export const departments = {
  continut: {
    label: { ro: 'Conținut', en: 'Content' },
    hint: {
      ro: 'Paginile site-ului, ghidurile și articolele, bazele și echipa.',
      en: 'Site pages, guides and articles, bases and the team.',
    },
    sections: ['pages', 'guides', 'bases', 'people', 'social-posts', 'media'],
  },
  magazin: {
    label: { ro: 'Magazin', en: 'Shop' },
    hint: {
      ro: 'Produsele, categoriile, mărcile și comenzile magazinului.',
      en: 'Shop products, categories, brands and orders.',
    },
    sections: [
      'products',
      'categories',
      'brands',
      'active-ingredients',
      'documents',
      'orders',
      'shop-home',
      'media',
    ],
  },
  ifn: {
    label: { ro: 'Finanțare (IFN)', en: 'Finance (IFN)' },
    hint: {
      ro: 'Cererile de credit, produsele de finanțare și întrebările.',
      en: 'Credit applications, finance products and questions.',
    },
    sections: ['finance-applications', 'finance-products', 'finance-questions', 'media'],
  },
  preturi: {
    label: { ro: 'Prețuri', en: 'Prices' },
    hint: {
      ro: 'Prețurile de achiziție pentru cereale și prețul motorinei.',
      en: 'Grain buy prices and the diesel price.',
    },
    sections: ['buy-prices', 'diesel-prices'],
  },
  vanzari: {
    label: { ro: 'Vânzări', en: 'Sales' },
    hint: {
      ro: 'Cererile primite de pe site și comenzile.',
      en: 'Requests from the site and orders.',
    },
    sections: ['leads', 'orders'],
  },
} as const satisfies Record<string, Department>

export type DepartmentRole = keyof typeof departments
export const departmentRoles = Object.keys(departments) as DepartmentRole[]

/** Sections where a department may also add new documents (a newer price replaces the old). */
const creatable: Partial<Record<string, readonly DepartmentRole[]>> = {
  'buy-prices': ['preturi'],
  'diesel-prices': ['preturi'],
  media: ['continut', 'magazin', 'ifn'],
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

/** Admin, or a department that owns the section. */
export const editors =
  (slug: string): Access =>
  ({ req }) =>
    hasAny(req, ownersOf(slug))

/** Admin, or a department allowed to add documents to the section. */
export const creators =
  (slug: string): Access =>
  ({ req }) =>
    hasAny(req, creatable[slug] ?? [])

export const adminOnly: Access = ({ req }) => adminRequest(req)

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
  admin: { ro: 'Administrator (tot panoul)', en: 'Administrator (whole panel)' },
  ...Object.fromEntries(departmentRoles.map((r) => [r, departments[r].label])),
} as Record<UserRole, Label>
