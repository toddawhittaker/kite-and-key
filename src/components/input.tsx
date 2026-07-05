/**
 * Labeled input wrapper for Partner's intake form. Plain Server-Component-
 * renderable markup — the form is unwired in this pass (R6), so no client
 * validation is needed yet.
 */
export function Input({
  label,
  name,
  type = 'text',
  placeholder,
  required = false,
  disabled = false,
}: {
  label: string
  name?: string
  type?: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
}) {
  return (
    <label className="flex flex-col gap-2 text-sm font-medium text-body-strong">
      {label}
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className="rounded-sm border border-hairline bg-surface-card px-4 py-3 text-base text-body-strong placeholder:text-muted focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/40 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
      />
    </label>
  )
}
