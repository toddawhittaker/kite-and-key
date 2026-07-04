import type { Field } from 'payload'

const slugify = (value: string): string =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')

/**
 * Reusable slug field. Slugifies `sourceField` on save when the slug is
 * empty, so editors don't have to hand-author URLs. `unique` + `index` so
 * public detail-page lookups (`where: { slug: { equals } }`) are fast.
 */
export const slugField = (sourceField = 'title'): Field => ({
  name: 'slug',
  type: 'text',
  unique: true,
  index: true,
  admin: {
    position: 'sidebar',
    description: 'Auto-generated from the title if left blank. Used in the page URL.',
  },
  hooks: {
    beforeValidate: [
      ({ value, data }) => {
        if (value) return slugify(value)
        const source = data?.[sourceField]
        if (typeof source === 'string' && source.length > 0) return slugify(source)
        return value
      },
    ],
  },
})
