import type { Access } from 'payload'

/** Any signed-in staff member. Roles come with the admin panel (Phase 9). */
export const isStaff: Access = ({ req }) => Boolean(req.user)

/** Public visitors see published documents only; staff also see drafts. */
export const publishedOrStaff: Access = ({ req }) =>
  req.user ? true : { _status: { equals: 'published' } }

export const anyone: Access = () => true
