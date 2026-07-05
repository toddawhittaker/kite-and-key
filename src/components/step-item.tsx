/**
 * Numbered process step with an oversized, low-opacity "ghost numeral"
 * behind the title (Partner's 5-step process; reused for Get Involved's
 * pathway strip).
 */
export function StepItem({
  number,
  title,
  description,
}: {
  number: number
  title: string
  description: string
}) {
  return (
    <div className="relative pt-8">
      {/* Rendered as generated (::before) content, not a real text node: a
          decorative low-contrast numeral needs to stay invisible to both
          assistive tech (aria-hidden) and axe's color-contrast check, which
          scans literal DOM text regardless of aria-hidden — see the
          `.ghost-numeral` rule in globals.css. */}
      <span
        aria-hidden="true"
        data-number={String(number).padStart(2, '0')}
        className="ghost-numeral pointer-events-none absolute top-0 left-0 font-display text-6xl font-bold text-surface-sunken-strong select-none"
      />
      <div className="relative pt-8">
        <h3 className="text-lg font-bold text-brand-ink">{title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-body">{description}</p>
      </div>
    </div>
  )
}
