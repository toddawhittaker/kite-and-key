import type { CollectionConfig } from 'payload'

import { slugField } from '@/fields/slug'
import { isAuthenticated, publishedOrAuth } from '@/lib/access'

export const Posts: CollectionConfig = {
  slug: 'posts',
  labels: {
    singular: 'Blog Post',
    plural: 'Blog Posts',
  },
  admin: {
    group: 'Publish',
    useAsTitle: 'title',
    defaultColumns: ['title', 'author', '_status', 'updatedAt'],
    description: 'Writeups, reflections, and case studies — the Publish pillar made visible.',
  },
  versions: {
    drafts: true,
  },
  access: {
    read: publishedOrAuth,
    create: isAuthenticated,
    update: isAuthenticated,
    delete: isAuthenticated,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      label: 'Post title',
    },
    slugField(),
    {
      name: 'author',
      type: 'relationship',
      relationTo: 'profiles',
      required: true,
      label: 'Author',
      admin: {
        description:
          'The student (or faculty moderator) writing this post. Shows on the public post and links to their profile.',
      },
    },
    {
      name: 'excerpt',
      type: 'textarea',
      label: 'Excerpt',
      admin: {
        description: 'Short summary shown on the blog list and in page metadata.',
      },
    },
    {
      name: 'body',
      type: 'richText',
      required: true,
      label: 'Post body',
    },
    {
      name: 'coverImage',
      type: 'upload',
      relationTo: 'media',
      label: 'Cover image',
    },
    {
      name: 'tags',
      type: 'array',
      label: 'Tags',
      fields: [
        {
          name: 'tag',
          type: 'text',
        },
      ],
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
