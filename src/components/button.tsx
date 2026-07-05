import Link from 'next/link'
import type { ReactNode } from 'react'

import { Icon } from '@/components/icon'

/**
 * Replaces every ad-hoc `<Link className="rounded-md bg-accent-700...">`
 * pattern that used to be scattered across pages. Three variants only — no
 * outline-only button exists in the source design system (readme.md).
 */
export function Button({
  variant = 'primary',
  size = 'md',
  href,
  icon = 'arrow_forward',
  fullWidth = false,
  type = 'button',
  disabled = false,
  className = '',
  children,
}: {
  variant?: 'primary' | 'secondary' | 'tertiary'
  size?: 'md' | 'sm'
  href?: string
  icon?: string
  fullWidth?: boolean
  type?: 'button' | 'submit'
  disabled?: boolean
  className?: string
  children: ReactNode
}) {
  const base =
    'group inline-flex items-center justify-center gap-2 rounded-sm font-bold transition-colors active:scale-95 disabled:pointer-events-none disabled:opacity-50'

  const variantClasses: Record<typeof variant, string> = {
    primary: 'bg-brand-gold text-brand-gold-ink hover:bg-brand-gold-hover',
    secondary: 'border border-white/20 bg-brand-navy-panel text-white hover:bg-brand-ink',
    tertiary: 'bg-transparent p-0 text-brand-ink hover:text-brand-gold',
  }

  const sizeClasses: Record<typeof size, string> = {
    md: 'px-6 py-3 text-base',
    sm: 'px-4 py-2 text-sm',
  }

  const classes = [
    base,
    variantClasses[variant],
    variant === 'tertiary' ? '' : sizeClasses[size],
    fullWidth ? 'w-full' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  const content =
    variant === 'tertiary' ? (
      <>
        {children}
        <Icon
          name={icon}
          size={20}
          className="transition-transform duration-200 group-hover:translate-x-1"
        />
      </>
    ) : (
      children
    )

  if (href && !disabled) {
    return (
      <Link href={href} className={classes}>
        {content}
      </Link>
    )
  }

  return (
    <button type={type} disabled={disabled} className={classes}>
      {content}
    </button>
  )
}
