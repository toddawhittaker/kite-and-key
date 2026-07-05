import fs from 'node:fs'
import path from 'node:path'

import Image from 'next/image'

// R-CREST (plan §8): public/kite-key-crest.png is PM-supplied and not yet
// vendored. Render the real crest when it lands; until then, degrade
// gracefully to a serif wordmark lockup carrying the same accessible name —
// never a broken <img>.
const CREST_PATH = path.join(process.cwd(), 'public', 'kite-key-crest.png')

// Computed once at module load, not per-render — this component renders
// multiple times per page (header + footer + About), and the file never
// appears/disappears during a running process, so a per-request
// fs.existsSync() is wasted work.
const CREST_EXISTS = (() => {
  try {
    return fs.existsSync(CREST_PATH)
  } catch {
    return false
  }
})()

type Variant = 'crest' | 'horizontal' | 'stacked'
type Tone = 'light' | 'dark'

const DEFAULT_SIZE: Record<Variant, number> = {
  crest: 40,
  horizontal: 60,
  stacked: 68,
}

/** Presentational size -> wordmark text-size step (not unit-tested — see plan §3). */
function wordmarkTextClass(size: number): string {
  if (size >= 88) return 'text-3xl'
  if (size >= 56) return 'text-2xl'
  return 'text-xl'
}

function Wordmark({ tone, size }: { tone: Tone; size: number }) {
  return (
    <span
      className={`font-display font-bold tracking-tight ${wordmarkTextClass(size)} ${tone === 'dark' ? 'text-inverse' : 'text-brand-ink'}`}
    >
      Kite &amp; Key IT
    </span>
  )
}

function Tagline({ tone }: { tone: Tone }) {
  // Gold (#fbbc00) on the site's light surface fails WCAG AA at this size
  // (1.63:1) — the plan's 10.7:1 contrast figure is for gold-on-ink (dark
  // tone) only. On light tone, use brand-gold-ink (the same token pairing
  // as the outcome pill's gold fill, §4) instead of introducing a new color.
  return (
    <span
      className={`text-xs font-semibold tracking-widest uppercase ${tone === 'dark' ? 'text-brand-gold' : 'text-brand-gold-ink'}`}
    >
      Apply. Solve. Advance.
    </span>
  )
}

function CrestImage({ size, alt }: { size: number; alt: string }) {
  // Preserve the crest's intrinsic aspect ratio (762×691) rather than
  // forcing a square, so the mark isn't stretched. `size` sets the width.
  return (
    <Image
      src="/kite-key-crest.png"
      alt={alt}
      width={size}
      height={Math.round((size * 691) / 762)}
      className="shrink-0"
    />
  )
}

export function Crest({
  variant = 'horizontal',
  tagline = false,
  tone = 'light',
  size,
}: {
  variant?: Variant
  tagline?: boolean
  tone?: Tone
  size?: number
}) {
  const resolvedSize = size ?? DEFAULT_SIZE[variant]

  if (variant === 'crest') {
    if (!CREST_EXISTS) return <Wordmark tone={tone} size={resolvedSize} />
    return <CrestImage size={resolvedSize} alt="Kite & Key IT" />
  }

  // horizontal / stacked: the wordmark text node is always present, so the
  // crest image (when it exists) is decorative — alt="" avoids announcing
  // the name twice.
  const image = CREST_EXISTS ? <CrestImage size={resolvedSize} alt="" /> : null

  if (variant === 'stacked') {
    return (
      <div className="flex flex-col items-center gap-2.5 text-center">
        {image}
        <Wordmark tone={tone} size={resolvedSize} />
        {tagline && <Tagline tone={tone} />}
      </div>
    )
  }

  return (
    <div className={`inline-flex items-center ${resolvedSize <= 40 ? 'gap-2.5' : 'gap-4'}`}>
      {image}
      <Wordmark tone={tone} size={resolvedSize} />
      {tagline && <Tagline tone={tone} />}
    </div>
  )
}
