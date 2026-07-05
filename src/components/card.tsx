import type { ReactNode } from 'react'

/**
 * Generic flat panel. Hover-lift only applies when the caller wraps this in
 * a `<Link>` and passes `hoverLift` — lifting a non-interactive info panel
 * is a false affordance (docs/plans/design-system-restyle-ux.md §1).
 */
export function Card({
  padding = 'md',
  tone = 'default',
  hoverLift = false,
  className = '',
  children,
}: {
  padding?: 'md' | 'lg'
  tone?: 'default' | 'sunken'
  hoverLift?: boolean
  className?: string
  children: ReactNode
}) {
  const paddingClasses = padding === 'lg' ? 'p-10 md:p-12' : 'p-8'
  const toneClasses = tone === 'sunken' ? 'bg-surface-card-tint' : 'bg-surface-card'

  return (
    <div
      className={`rounded-lg ${toneClasses} ${paddingClasses} ${hoverLift ? 'transition-all duration-300 hover:-translate-y-2 hover:shadow-card' : ''} ${className}`}
    >
      {children}
    </div>
  )
}
