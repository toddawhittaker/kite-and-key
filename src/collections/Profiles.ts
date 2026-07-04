import type { CollectionConfig } from 'payload'

import { slugField } from '@/fields/slug'
import { isAuthenticated } from '@/lib/access'

/**
 * Student/team profiles — themselves visible evidence (bio, links,
 * contributions), which is why they're grouped under Publish rather than a
 * separate "People" admin group (PM reconciliation decision #5).
 */
export const Profiles: CollectionConfig = {
  slug: 'profiles',
  labels: {
    singular: 'Student Profile',
    plural: 'Student Profiles',
  },
  admin: {
    group: 'Publish',
    useAsTitle: 'name',
    defaultColumns: ['name', 'program', 'updatedAt'],
    description: 'Students, team members, faculty, and alumni featured on the public site.',
  },
  access: {
    read: () => true,
    create: isAuthenticated,
    update: isAuthenticated,
    delete: isAuthenticated,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Full name',
    },
    slugField('name'),
    {
      name: 'profileType',
      type: 'select',
      required: true,
      defaultValue: 'student',
      label: 'Profile type',
      options: [
        { label: 'Student', value: 'student' },
        { label: 'Team', value: 'team' },
        { label: 'Faculty', value: 'faculty' },
        { label: 'Alum', value: 'alum' },
      ],
    },
    {
      name: 'program',
      type: 'text',
      label: 'Program / concentration',
      admin: {
        description:
          'e.g. "B.S. Computer Science" or "M.S. Data Analytics" — helps employers read the profile in context.',
      },
    },
    {
      name: 'gradYear',
      type: 'number',
      label: 'Graduation year',
    },
    {
      name: 'bio',
      type: 'richText',
      label: 'Bio',
      admin: {
        description:
          'Two or three sentences in your own voice. Specific interests and what you\'ve worked on read better than general career-goal statements.',
      },
    },
    {
      name: 'avatar',
      type: 'upload',
      relationTo: 'media',
      label: 'Avatar',
    },
    {
      name: 'links',
      type: 'array',
      label: 'Links',
      admin: {
        description:
          'GitHub, LinkedIn, portfolio site, deployed projects — anything that lets an employer see more of your work.',
      },
      fields: [
        {
          name: 'label',
          type: 'text',
          required: true,
        },
        {
          name: 'url',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'contributions',
      type: 'richText',
      label: 'Project contributions',
      admin: {
        description: 'Narrative of involvement not already captured by linked Projects.',
      },
    },
  ],
}
