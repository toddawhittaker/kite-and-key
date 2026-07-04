import { describe, expect, it } from 'vitest'

import { slugField } from '@/fields/slug'

// The field's beforeValidate hook is the whole of its behavior — grab it
// directly rather than standing up Payload to run field validation.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getHook(sourceField?: string): (args: { value?: string; data?: any }) => string | undefined {
  const field = sourceField ? slugField(sourceField) : slugField()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const hook = (field as any).hooks.beforeValidate[0]
  return hook
}

describe('slugField beforeValidate hook', () => {
  it('slugifies the source field when the slug value is empty', () => {
    const hook = getHook()
    expect(hook({ value: '', data: { title: 'Inventory Tracker!' } })).toBe('inventory-tracker')
  })

  it('normalizes a provided slug value, ignoring the source field', () => {
    const hook = getHook()
    expect(hook({ value: 'My Custom Slug', data: { title: 'Something Else' } })).toBe(
      'my-custom-slug',
    )
  })

  it('returns the empty value unchanged when there is no source field value', () => {
    const hook = getHook()
    expect(hook({ value: '', data: {} })).toBe('')
  })

  it('slugifies from a custom source field when configured', () => {
    const hook = getHook('name')
    expect(hook({ value: '', data: { name: 'Sample Profile — Student One' } })).toBe(
      'sample-profile-student-one',
    )
  })

  it('trims leading/trailing separators and collapses non-alphanumerics', () => {
    const hook = getHook()
    expect(hook({ value: '--Hi--', data: {} })).toBe('hi')
    expect(hook({ value: '', data: { title: '  Multiple   Spaces & Punctuation!!  ' } })).toBe(
      'multiple-spaces-punctuation',
    )
  })
})
