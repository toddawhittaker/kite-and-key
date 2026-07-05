'use client'

import { Icon } from '@/components/icon'

/**
 * Students' grid/list presentation toggle. Local UI state only — it never
 * refetches data, so the page around it stays a Server Component.
 */
export function ViewToggle({
  value,
  onChange,
}: {
  value: 'grid' | 'list'
  onChange: (value: 'grid' | 'list') => void
}) {
  return (
    <div className="flex gap-1 rounded-lg bg-surface-sunken p-1">
      <button
        type="button"
        aria-pressed={value === 'grid'}
        aria-label="Grid view"
        onClick={() => onChange('grid')}
        className={`flex items-center justify-center rounded-sm p-2 ${
          value === 'grid' ? 'bg-surface-card text-brand-ink shadow-card-soft' : 'text-body'
        }`}
      >
        <Icon name="grid_view" size={20} />
      </button>
      <button
        type="button"
        aria-pressed={value === 'list'}
        aria-label="List view"
        onClick={() => onChange('list')}
        className={`flex items-center justify-center rounded-sm p-2 ${
          value === 'list' ? 'bg-surface-card text-brand-ink shadow-card-soft' : 'text-body'
        }`}
      >
        <Icon name="view_list" size={20} />
      </button>
    </div>
  )
}
