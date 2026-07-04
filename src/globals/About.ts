import type { GlobalConfig } from 'payload'

import { isAuthenticated } from '@/lib/access'

/**
 * Singleton — lets faculty edit the About page copy without a deploy,
 * keeping "content is the source of truth" honest instead of hardcoding
 * prose in about/page.tsx. (PM reconciliation decision #6.)
 */
export const About: GlobalConfig = {
  slug: 'about',
  label: 'About Page',
  admin: {
    group: 'Publish',
    description: 'Content for the public About page — edit without a deploy.',
  },
  access: {
    read: () => true,
    update: isAuthenticated,
  },
  fields: [
    {
      name: 'heading',
      type: 'text',
      required: true,
      defaultValue: 'About Kite & Key IT',
    },
    {
      name: 'body',
      type: 'richText',
      required: true,
      admin: {
        description: 'What Kite & Key IT is, its connection to Franklin CSM programs, and the three pillars explained in prose.',
      },
    },
    {
      name: 'facultyModeratorNote',
      type: 'richText',
      admin: {
        description:
          'Short note naming the faculty oversight model — supports the "bounded" partner framing before partners reach the Partner With Us page.',
      },
    },
  ],
}
