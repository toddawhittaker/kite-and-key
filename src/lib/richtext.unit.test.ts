import { describe, expect, it } from 'vitest'

import { richTextToPlainText } from './richtext'

/**
 * `src/lib/richtext.ts` is beyond the tester's original TDD-pass contract —
 * the implementer added it (beyond the plan's explicit file list) to derive
 * plain-text excerpts from Payload Lexical richText (e.g. Students'
 * `bio` -> StudentCard's `description`). Added here post-implementation to
 * close a real `src/lib/**` coverage gap (`pnpm test:coverage` reported 0%
 * on this file) — not gold-plating, the coverage gate was actually failing.
 */
function doc(children: unknown) {
  return { root: { type: 'root', children } }
}

function textNode(text: string) {
  return { type: 'text', text }
}

function paragraph(...children: unknown[]) {
  return { type: 'paragraph', children }
}

describe('richTextToPlainText', () => {
  it('returns undefined for a null/undefined document', () => {
    expect(richTextToPlainText(null)).toBeUndefined()
    expect(richTextToPlainText(undefined)).toBeUndefined()
  })

  it('returns undefined for a document with no root', () => {
    // @ts-expect-error deliberately malformed input
    expect(richTextToPlainText({})).toBeUndefined()
  })

  it('joins text across multiple paragraphs and nodes', () => {
    const richText = doc([
      paragraph(textNode('First sentence.')),
      paragraph(textNode('Second'), textNode('sentence.')),
    ])
    expect(richTextToPlainText(richText)).toBe('First sentence. Second sentence.')
  })

  it('collapses internal whitespace/newlines and trims the result', () => {
    const richText = doc([paragraph(textNode('  Padded   \n text  '))])
    expect(richTextToPlainText(richText)).toBe('Padded text')
  })

  it('returns undefined when there is no real text content (e.g. an empty paragraph)', () => {
    const richText = doc([paragraph()])
    expect(richTextToPlainText(richText)).toBeUndefined()
  })

  it('truncates text longer than maxLength and appends an ellipsis', () => {
    const longText = 'a'.repeat(300)
    const richText = doc([paragraph(textNode(longText))])
    const result = richTextToPlainText(richText, 10)
    expect(result).toBe(`${'a'.repeat(10)}…`)
  })

  it('does not truncate text at or under maxLength', () => {
    const richText = doc([paragraph(textNode('short'))])
    expect(richTextToPlainText(richText, 10)).toBe('short')
  })
})
