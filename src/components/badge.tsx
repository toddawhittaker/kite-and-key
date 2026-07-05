import type { ReactNode } from 'react'

export type BadgeTone = 'success' | 'info' | 'pending' | 'neutral' | 'gold' | 'glass'

/**
 * One component, two typographic variants — both pill-shaped. Status colors
 * (success/info/pending) live ONLY here: they must never be exposed as
 * ad-hoc utility combos on arbitrary elements elsewhere (docs/design/DESIGN.md).
 */
export function Badge({
  tone,
  variant = 'status',
  children,
}: {
  tone: BadgeTone
  variant?: 'status' | 'eyebrow'
  children: ReactNode
}) {
  if (variant === 'eyebrow') {
    const eyebrowToneClasses: Record<BadgeTone, string> = {
      success: 'bg-status-success-bg text-status-success-text',
      info: 'bg-status-info-bg text-status-info-text',
      pending: 'bg-status-pending-bg text-status-pending-text',
      neutral: 'bg-surface-sunken-strong text-body',
      gold: 'bg-brand-navy-panel text-brand-gold',
      glass: 'bg-white/10 text-inverse backdrop-blur-lg',
    }
    return (
      <span
        className={`inline-block rounded-full px-4 py-1 font-display text-sm italic ${eyebrowToneClasses[tone]}`}
      >
        {children}
      </span>
    )
  }

  const statusToneClasses: Record<BadgeTone, string> = {
    success: 'bg-status-success-bg text-status-success-text',
    info: 'bg-status-info-bg text-status-info-text',
    pending: 'bg-status-pending-bg text-status-pending-text',
    neutral: 'bg-surface-sunken-strong text-body-strong',
    gold: 'bg-brand-gold text-brand-gold-ink',
    glass: 'bg-white/10 text-inverse backdrop-blur-lg',
  }

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${statusToneClasses[tone]}`}
    >
      {children}
    </span>
  )
}
