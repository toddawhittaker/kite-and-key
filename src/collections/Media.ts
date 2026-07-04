import type { CollectionConfig } from 'payload'

import { isAuthenticated } from '@/lib/access'

export const Media: CollectionConfig = {
  slug: 'media',
  labels: {
    singular: 'Media',
    plural: 'Media',
  },
  admin: {
    group: 'System',
    useAsTitle: 'filename',
    description: 'Uploaded images and files referenced by other collections.',
  },
  access: {
    // Public — images are referenced by public pages.
    read: () => true,
    create: isAuthenticated,
    update: isAuthenticated,
    delete: isAuthenticated,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
      admin: {
        description: 'Alt text for accessibility — describe what the image shows.',
      },
    },
    {
      name: 'caption',
      type: 'text',
    },
  ],
  upload: {
    staticDir: 'media',
  },
}
