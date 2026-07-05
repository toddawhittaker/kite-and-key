'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

import { Icon } from '@/components/icon'

/**
 * Disclosure panel for the header nav below `md`. Fed the same NAV_LINKS
 * array SiteHeader renders for its desktop nav (no data fetching inside
 * this component) — closes on Escape, tap-outside, or link click, and
 * focus-manages the trigger's `aria-expanded` state.
 */
export function MobileNav({ links }: { links: { href: string; label: string }[] }) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }
    function onPointerDown(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('mousedown', onPointerDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('mousedown', onPointerDown)
    }
  }, [open])

  return (
    // No `relative` here on purpose: this div must NOT establish its own
    // containing block, or the panel's `absolute inset-x-0` below would
    // resolve against this button-sized wrapper (a narrow column next to
    // the trigger) instead of the full-width header. SiteHeader's `<header>`
    // is `fixed`, so it's already the nearest positioned ancestor — that's
    // what makes `inset-x-0` span the full viewport and `top-full` land
    // exactly at the header's bottom edge.
    <div className="md:hidden" ref={containerRef}>
      <button
        type="button"
        aria-expanded={open}
        aria-label={open ? 'Close menu' : 'Open menu'}
        onClick={() => setOpen((value) => !value)}
        className="flex h-10 w-10 items-center justify-center rounded-sm text-brand-ink"
      >
        <Icon name={open ? 'close' : 'menu'} />
      </button>

      {open && (
        <nav className="absolute inset-x-0 top-full flex flex-col gap-1 border-b border-hairline/10 bg-surface-page/95 px-6 py-4 shadow-card-soft backdrop-blur-lg">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="rounded-sm px-2 py-3 text-base font-medium text-brand-ink hover:text-brand-gold"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </div>
  )
}
