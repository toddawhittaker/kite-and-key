/**
 * Labeled select wrapper. Used both for Partner's intake form (unwired,
 * R6) and for the Students filter row (server-driven, submitted via a
 * wrapping `<form>` using GET so options land back in `searchParams`).
 */
export function Select({
  label,
  name,
  options,
  defaultValue,
  disabled = false,
}: {
  label: string
  name?: string
  options: { label: string; value: string }[]
  defaultValue?: string
  disabled?: boolean
}) {
  return (
    <label className="flex flex-col gap-2 text-sm font-medium text-body-strong">
      {label}
      <select
        name={name}
        defaultValue={defaultValue}
        disabled={disabled}
        className="rounded-sm border border-hairline bg-surface-card px-4 py-3 text-base text-body-strong focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/40 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
}
