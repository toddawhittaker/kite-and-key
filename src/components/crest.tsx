import fs from 'node:fs'
import path from 'node:path'

import Image from 'next/image'

// R-CREST (plan §8): public/kite-key-crest.png is PM-supplied and not yet
// vendored. Render the real crest when it lands; until then, degrade
// gracefully to a serif wordmark lockup carrying the same accessible name —
// never a broken <img>.
const CREST_PATH = path.join(process.cwd(), 'public', 'kite-key-crest.png')

// Computed once at module load, not per-render — this component renders
// twice per page (header + footer), and the file never appears/disappears
// during a running process, so a per-request fs.existsSync() is wasted work.
const CREST_EXISTS = (() => {
  try {
    return fs.existsSync(CREST_PATH)
  } catch {
    return false
  }
})()

export function Crest({
  tone = 'light',
  size = 40,
}: {
  tone?: 'light' | 'dark'
  size?: number
}) {
  if (CREST_EXISTS) {
    // Preserve the crest's intrinsic aspect ratio (762×691) rather than
    // forcing a square, so the mark isn't stretched. `size` sets the width.
    return (
      <Image
        src="/kite-key-crest.png"
        alt="Kite & Key IT"
        width={size}
        height={Math.round((size * 691) / 762)}
        className="shrink-0"
      />
    )
  }

  return (
    <span
      className={`font-display text-xl font-bold tracking-tight ${tone === 'dark' ? 'text-inverse' : 'text-brand-ink'}`}
    >
      Kite &amp; Key IT
    </span>
  )
}
