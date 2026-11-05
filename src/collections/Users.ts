import type { CollectionBeforeChangeHook, CollectionConfig } from 'payload'

import { isAdminField, userRoles } from '@/access'

/** The first account on an empty site is the admin, or nobody could ever hand out a role. */
const firstUserIsAdmin: CollectionBeforeChangeHook = async ({ data, operation, req }) => {
  if (operation !== 'create') return data
  const { totalDocs } = await req.payload.count({ collection: 'users', req })
  if (totalDocs === 0) data.roles = ['admin']
  return data
}

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
  },
  auth: true,
  hooks: { beforeChange: [firstUserIsAdmin] },
  fields: [
    // Email added by default
    {
      name: 'roles',
      type: 'select',
      hasMany: true,
      // Saved in the session token, so access rules can read it without a query.
      saveToJWT: true,
      options: userRoles.map((value) => ({ value, label: value })),
      access: { create: isAdminField, update: isAdminField },
      admin: {
        position: 'sidebar',
        description: 'ifn: reads credit applications. admin: changes roles.',
      },
    },
  ],
}
