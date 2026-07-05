'use client'

import type { ReactNode } from 'react'
import { useState } from 'react'

import { ViewToggle } from '@/components/view-toggle'

/**
 * Small client wrapper composing the (already server-rendered) StudentCard
 * grid with the grid/list presentation toggle. Not in the plan's explicit
 * file list, but a direct consequence of ViewToggle being local-state-only
 * (docs/plans/design-system-restyle-ux.md §1) while /students stays a
 * Server Component that fetches the profile list itself — this wrapper
 * receives the pre-rendered cards as `children`, so no data crosses the
 * client boundary.
 */
export function StudentsView({ children }: { children: ReactNode }) {
  const [view, setView] = useState<'grid' | 'list'>('grid')

  return (
    <div>
      <div className="flex justify-end">
        <ViewToggle value={view} onChange={setView} />
      </div>
      <div
        className={
          view === 'grid'
            ? 'mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3'
            : 'mt-8 flex max-w-2xl flex-col gap-4'
        }
      >
        {children}
      </div>
    </div>
  )
}
