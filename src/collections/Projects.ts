import type { CollectionConfig } from 'payload'

import { slugField } from '@/fields/slug'
import { isAuthenticated, publishedOrAuth } from '@/lib/access'

/**
 * The flagship credibility model (CLAUDE.md / kk-voice): a project isn't
 * evidence unless it names the real problem, the actual tech, the students
 * who did the work, and what got shipped.
 */
export const Projects: CollectionConfig = {
  slug: 'projects',
  labels: {
    singular: 'Project',
    plural: 'Projects',
  },
  admin: {
    group: 'Build',
    useAsTitle: 'title',
    defaultColumns: ['title', 'pillars', 'contributors', 'updatedAt', '_status'],
    description: 'Applied technical work — the primary proof that students build real things.',
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
      label: 'Project title',
      admin: {
        description:
          "Specific and concrete — name the system or problem, not just the technology. e.g. \"Inventory Tracker for Mid-Ohio Food Collective\" rather than \"Web App Project.\"",
      },
    },
    slugField(),
    {
      name: 'summary',
      type: 'textarea',
      required: true,
      label: 'One-line summary',
      admin: {
        description: 'One sentence — what this project is. Shown on project list cards.',
      },
    },
    {
      name: 'problem',
      type: 'richText',
      required: true,
      label: 'Problem addressed',
      admin: {
        description:
          'What real problem or need prompted this project? Write it so someone outside the program understands why it mattered — this is what employers read first.',
      },
    },
    {
      name: 'technologies',
      type: 'array',
      required: true,
      minRows: 1,
      labels: { singular: 'Technology', plural: 'Technologies' },
      label: 'Technologies used',
      admin: {
        description:
          'Name the actual languages, frameworks, platforms, and tools — not categories. e.g. "PostgreSQL, Next.js, AWS Lambda," not "a database and cloud services."',
      },
      fields: [
        {
          name: 'name',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'contributors',
      type: 'relationship',
      relationTo: 'profiles',
      hasMany: true,
      required: true,
      label: 'Student contributors',
      admin: {
        description:
          "Every student who worked on this project. Their profile will link back here — make sure they're added before publishing.",
      },
    },
    {
      name: 'outcomes',
      type: 'richText',
      label: 'Outcomes',
      admin: {
        description:
          'What got built or shipped, and what changed as a result. Concrete outcomes, not "gained experience."',
      },
    },
    {
      name: 'artifacts',
      type: 'array',
      label: 'Artifacts',
      admin: {
        description: 'Evidence: repo links, writeups, demos, deliverables.',
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
        },
        {
          name: 'file',
          type: 'upload',
          relationTo: 'media',
        },
      ],
    },
    {
      name: 'pillars',
      type: 'select',
      hasMany: true,
      defaultValue: ['build'],
      label: 'Pillar tags',
      options: [
        { label: 'Build', value: 'build' },
        { label: 'Engage', value: 'engage' },
        { label: 'Publish', value: 'publish' },
      ],
      admin: {
        description:
          'Which of Build / Engage / Publish does this project represent? Most projects are Build; tag Engage or Publish too if mentorship or a writeup was a core part of the work.',
      },
    },
    {
      name: 'coverImage',
      type: 'upload',
      relationTo: 'media',
      label: 'Cover image',
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
