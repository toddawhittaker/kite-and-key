import type { CollectionConfig } from 'payload'

import { slugField } from '@/fields/slug'
import { isAuthenticated } from '@/lib/access'

export const Events: CollectionConfig = {
  slug: 'events',
  labels: {
    singular: 'Event',
    plural: 'Events',
  },
  admin: {
    group: 'Engage',
    useAsTitle: 'title',
    defaultColumns: ['title', 'eventType', 'startDate'],
    description: 'Workshops, code reviews, employer sessions, and other Engage activities.',
  },
  versions: {
    drafts: true,
  },
  access: {
    read: () => true,
    create: isAuthenticated,
    update: isAuthenticated,
    delete: isAuthenticated,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      label: 'Event title',
    },
    slugField(),
    {
      name: 'eventType',
      type: 'select',
      required: true,
      label: 'Event type',
      options: [
        { label: 'Workshop', value: 'workshop' },
        { label: 'Code Review', value: 'code-review' },
        { label: 'Employer Session', value: 'employer-session' },
        { label: 'Talk', value: 'talk' },
        { label: 'Other', value: 'other' },
      ],
      admin: {
        description:
          'Workshop, code review, employer session, or other Engage activity — pick the closest match so the Get Involved page can group these sensibly.',
      },
    },
    {
      name: 'description',
      type: 'richText',
      label: 'Description',
      admin: {
        description:
          'What happens at this event and who it\'s for — prospective attendees should know what to expect before signing up.',
      },
    },
    {
      name: 'startDate',
      type: 'date',
      required: true,
      label: 'Start date & time',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'endDate',
      type: 'date',
      label: 'End date & time',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'location',
      type: 'text',
    },
    {
      name: 'isOnline',
      type: 'checkbox',
      label: 'Online event',
      defaultValue: false,
    },
    {
      name: 'facilitators',
      type: 'relationship',
      relationTo: 'profiles',
      hasMany: true,
      label: 'Facilitators',
    },
    {
      name: 'publishedDate',
      type: 'date',
      admin: {
        position: 'sidebar',
      },
    },
  ],
}
