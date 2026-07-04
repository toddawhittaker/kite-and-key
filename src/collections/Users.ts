import type { CollectionConfig } from 'payload'

import { isAdmin, isAuthenticated } from '@/lib/access'

export const Users: CollectionConfig = {
  slug: 'users',
  labels: {
    singular: 'User',
    plural: 'Users',
  },
  admin: {
    group: 'System',
    useAsTitle: 'email',
    description: 'Admin/editor accounts for the CMS. Not visible on the public site.',
  },
  auth: true,
  access: {
    read: isAuthenticated,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    // Email added by default
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'editor',
      saveToJWT: true,
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Editor', value: 'editor' },
      ],
      admin: {
        description: 'Admins manage users and all content; editors manage content.',
      },
    },
  ],
}
