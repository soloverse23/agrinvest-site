import type { Access, FieldAccess, PayloadRequest } from 'payload'

/**
 * Staff are the accounts of the `users` collection, never any other signed-in account, so
 * adding customer logins later cannot open staff data. Roles come with the panel (Phase 9).
 */
export const staffRequest = (req: Pick<PayloadRequest, 'user'>): boolean =>
  req.user?.collection === 'users'

export const isStaff: Access = ({ req }) => staffRequest(req)

export const isStaffField: FieldAccess = ({ req }) => staffRequest(req)

/** Public visitors see published documents only; staff also see drafts. */
export const publishedOrStaff: Access = ({ req }) =>
  staffRequest(req) ? true : { _status: { equals: 'published' } }

export const anyone: Access = () => true
