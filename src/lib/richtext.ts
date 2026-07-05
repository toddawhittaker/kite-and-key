interface LexicalNode {
  type?: string
  text?: string
  children?: LexicalNode[]
  [key: string]: unknown
}

interface LexicalDocument {
  root: LexicalNode
}

/**
 * Minimal plain-text extraction from a Payload Lexical richText document —
 * walks text nodes and joins them. Used for card excerpts (e.g. Students'
 * `bio`) where the full richText can't render inside a card — not a general
 * Lexical renderer, just enough for a truncated excerpt.
 */
export function richTextToPlainText(
  doc: LexicalDocument | null | undefined,
  maxLength = 220,
): string | undefined {
  if (!doc?.root) return undefined

  const parts: string[] = []
  function walk(node: LexicalNode) {
    if (typeof node.text === 'string' && node.text.length > 0) {
      parts.push(node.text)
    }
    if (Array.isArray(node.children)) {
      for (const child of node.children) walk(child)
    }
  }
  walk(doc.root)

  const text = parts.join(' ').replace(/\s+/g, ' ').trim()
  if (!text) return undefined
  return text.length <= maxLength ? text : `${text.slice(0, maxLength).trimEnd()}…`
}
