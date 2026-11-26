import type { Access, CollectionBeforeChangeHook, CollectionConfig } from 'payload'

import { isAdminField, userRoles } from '@/access'
import { adminOnly, adminRequest, hiddenUnlessAdmin, roleLabels } from '@/access/departments'

/** The first account on an empty site is the admin, or nobody could ever hand out a role. */
const firstUserIsAdmin: CollectionBeforeChangeHook = async ({ data, operation, req }) => {
  if (operation !== 'create') return data
  const { totalDocs } = await req.payload.count({ collection: 'users', req })
  if (totalDocs === 0) data.roles = ['admin']
  return data
}

/** The admin manages every account; anyone else reads and changes only their own. */
const adminOrSelf: Access = ({ req }) => {
  if (adminRequest(req)) return true
  if (req.user?.collection !== 'users') return false
  return { id: { equals: req.user.id } }
}

export const Users: CollectionConfig = {
  slug: 'users',
  labels: {
    singular: { ro: 'Cont', en: 'Account' },
    plural: { ro: 'Conturi', en: 'Accounts' },
  },
  admin: {
    useAsTitle: 'name',
    hidden: hiddenUnlessAdmin,
    defaultColumns: ['name', 'username', 'email', 'roles', 'updatedAt'],
  },
  // Department accounts sign in with a username (no shared mailbox needed); the owner's
  // personal accounts keep signing in with their email.
  auth: {
    loginWithUsername: { allowEmailLogin: true, requireEmail: false, requireUsername: false },
  },
  access: { read: adminOrSelf, create: adminOnly, update: adminOrSelf, delete: adminOnly },
  hooks: { beforeChange: [firstUserIsAdmin] },
  fields: [
    // Email and username added by auth
    { name: 'name', type: 'text', label: { ro: 'Nume', en: 'Name' } },
    {
      name: 'roles',
      type: 'select',
      hasMany: true,
      label: { ro: 'Departament', en: 'Department' },
      // Saved in the session token, so access rules can read it without a query.
      saveToJWT: true,
      options: userRoles.map((value) => ({ value, label: roleLabels[value] })),
      access: { create: isAdminField, update: isAdminField },
      admin: {
        position: 'sidebar',
        description: {
          ro: 'Fiecare departament vede doar secțiunile și paginile lui. Administratorul general vede tot; cererile de credit le vede doar Financiar (IFN).',
          en: 'Each department sees only its own sections and pages. The general admin sees everything; credit applications only Finance (IFN).',
        },
      },
    },
  ],
}
