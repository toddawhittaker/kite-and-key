/**
 * Big-number stat block. `value` must always be real/CMS-derived — never
 * invented (see src/lib/stats.ts and docs/plans/design-system-restyle.md §6 R5).
 */
export function StatTile({
  value,
  label,
  tone = 'navy',
}: {
  value: string
  label: string
  tone?: 'navy' | 'gold'
}) {
  const toneClasses = tone === 'navy' ? 'bg-brand-navy-panel text-white' : 'bg-brand-gold text-brand-gold-ink'

  return (
    <div className={`rounded-lg p-6 ${toneClasses}`}>
      <p className="font-display text-4xl font-bold tracking-tight">{value}</p>
      <p className="mt-2 text-sm font-bold tracking-widest uppercase opacity-80">{label}</p>
    </div>
  )
}
