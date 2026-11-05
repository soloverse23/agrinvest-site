import type { Access, FieldAccess, PayloadRequest } from 'payload'

/**
 * Staff are the accounts of the `users` collection, never any other signed-in account, so
 * adding customer logins later cannot open staff data. The full set of roles comes with the
 * panel (Phase 9); `admin` and `ifn` exist now because credit applications must not be readable
 * by every staff account.
 */
export const staffRequest = (req: Pick<PayloadRequest, 'user'>): boolean =>
  req.user?.collection === 'users'

export const isStaff: Access = ({ req }) => staffRequest(req)

export const isStaffField: FieldAccess = ({ req }) => staffRequest(req)

/** Public visitors see published documents only; staff also see drafts. */
export const publishedOrStaff: Access = ({ req }) =>
  staffRequest(req) ? true : { _status: { equals: 'published' } }

export const anyone: Access = () => true

export const userRoles = ['admin', 'ifn'] as const
export type UserRole = (typeof userRoles)[number]

const hasRole = (req: Pick<PayloadRequest, 'user'>, role: UserRole): boolean => {
  if (!staffRequest(req)) return false
  const roles = (req.user as { roles?: string[] | null }).roles
  return Array.isArray(roles) && roles.includes(role)
}

/** The IFN team only, not every staff account. */
export const ifnRequest = (req: Pick<PayloadRequest, 'user'>): boolean => hasRole(req, 'ifn')

export const isIfn: Access = ({ req }) => ifnRequest(req)

/** Only an admin changes roles, so nobody can give themselves access to applications. */
export const isAdminField: FieldAccess = ({ req }) => hasRole(req, 'admin')
