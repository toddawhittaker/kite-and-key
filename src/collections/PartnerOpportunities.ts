import type { CollectionConfig } from 'payload'

import { isAuthenticated } from '@/lib/access'

/**
 * Encodes the bounded, faculty-overseen framing that's load-bearing for
 * partner-facing copy (CLAUDE.md / kk-voice). No public read in the
 * scaffold — `partner/page.tsx` is a static shell + future intake form;
 * see the access-control seam note below.
 */
export const PartnerOpportunities: CollectionConfig = {
  slug: 'partner-opportunities',
  labels: {
    singular: 'Partner Opportunity',
    plural: 'Partner Opportunities',
  },
  admin: {
    // PM reconciliation decision #1: Engage (external employer/community
    // relationship work), not Build.
    group: 'Engage',
    // PM reconciliation decision #3: keep `title`, but key list views/
    // relationship pickers off `organization` for scannability.
    useAsTitle: 'organization',
    defaultColumns: ['organization', 'status', 'contactName', 'createdAt'],
    description: 'Partner-submitted project intake — reviewed and scoped by faculty.',
  },
  access: {
    // Sensitive: contact info + internal notes. No public read.
    read: isAuthenticated,
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
        description: 'Short name for the proposed project.',
      },
    },
    {
      name: 'organization',
      type: 'text',
      required: true,
      label: 'Organization name',
    },
    {
      name: 'contactName',
      type: 'text',
      required: true,
      label: 'Primary contact name',
    },
    {
      name: 'contactEmail',
      type: 'email',
      required: true,
      label: 'Primary contact email',
    },
    {
      name: 'problem',
      type: 'richText',
      required: true,
      label: 'What do you need help with?',
      admin: {
        description:
          'Describe the problem or task in plain terms. This is scoped, faculty-overseen student work, not open-ended consulting — describe something bounded enough for a student team to complete in a term.',
      },
    },
    {
      name: 'scope',
      type: 'textarea',
      required: true,
      label: 'Scope & boundaries',
      admin: {
        description:
          "Bounded scope — what's realistically deliverable by students with faculty oversight. Not open-ended consulting. What's explicitly in and out of scope?",
      },
    },
    {
      name: 'estimatedEffort',
      type: 'select',
      required: true,
      label: 'Estimated effort',
      options: [
        { label: 'Small', value: 'small' },
        { label: 'Medium', value: 'medium' },
        { label: 'Term-length', value: 'term-length' },
      ],
    },
    {
      name: 'desiredTechnologies',
      type: 'array',
      label: 'Desired technologies',
      fields: [
        {
          name: 'name',
          type: 'text',
        },
      ],
    },
    {
      name: 'facultyOverseer',
      type: 'relationship',
      relationTo: 'users',
      label: 'Faculty reviewer',
      admin: {
        description:
          'Faculty member overseeing this opportunity once it\'s matched to a student project.',
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'submitted',
      label: 'Status',
      options: [
        { label: 'Submitted', value: 'submitted' },
        { label: 'Under Review', value: 'under-review' },
        { label: 'Accepted', value: 'accepted' },
        { label: 'Declined', value: 'declined' },
        { label: 'Active', value: 'active' },
        { label: 'Complete', value: 'complete' },
      ],
      admin: {
        description: 'Tracked by faculty during intake review — not shown publicly.',
      },
    },
    {
      name: 'termAvailability',
      type: 'text',
      label: 'Term availability',
    },
    {
      name: 'internalNotes',
      type: 'textarea',
      label: 'Internal notes',
      admin: {
        description: 'Internal only — not shown publicly.',
      },
    },
  ],
}
