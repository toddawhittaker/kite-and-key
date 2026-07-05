import fs from 'node:fs'
import path from 'node:path'

import Image from 'next/image'

// R-CREST (plan §8): public/kite-key-crest.png is PM-supplied and not yet
// vendored. Render the real crest when it lands; until then, degrade
// gracefully to a serif wordmark lockup carrying the same accessible name —
// never a broken <img>.
const CREST_PATH = path.join(process.cwd(), 'public', 'kite-key-crest.png')

function crestExists(): boolean {
  try {
    return fs.existsSync(CREST_PATH)
  } catch {
    return false
  }
}

export function Crest({
  tone = 'light',
  size = 40,
}: {
  tone?: 'light' | 'dark'
  size?: number
}) {
  if (crestExists()) {
    return (
      <Image
        src="/kite-key-crest.png"
        alt="Kite & Key IT"
        width={size}
        height={size}
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
