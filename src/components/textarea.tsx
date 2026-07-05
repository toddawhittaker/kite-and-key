/**
 * Labeled textarea wrapper for Partner's intake form (unwired, R6).
 */
export function Textarea({
  label,
  name,
  placeholder,
  required = false,
  disabled = false,
  rows = 4,
}: {
  label: string
  name?: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
  rows?: number
}) {
  return (
    <label className="flex flex-col gap-2 text-sm font-medium text-body-strong">
      {label}
      <textarea
        name={name}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        rows={rows}
        className="resize-y rounded-sm border border-hairline bg-surface-card px-4 py-3 text-base text-body-strong placeholder:text-muted focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/40 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
      />
    </label>
  )
}
