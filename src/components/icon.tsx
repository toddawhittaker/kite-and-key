/**
 * Thin wrapper around a Material Symbols Outlined glyph (self-hosted, see
 * globals.css). Centralizing glyph rendering here means every consumer gets
 * a fixed inline box (no icon-load reflow) and the FILL 0->1 hover-fill
 * convention for free via the `filled` prop.
 */
export function Icon({
  name,
  filled = false,
  size = 24,
  className = '',
}: {
  name: string
  filled?: boolean
  size?: number
  className?: string
}) {
  return (
    <span
      aria-hidden="true"
      className={`material-symbols-outlined inline-flex shrink-0 items-center justify-center ${filled ? 'filled' : ''} ${className}`}
      style={{ fontSize: size, width: size, height: size, lineHeight: `${size}px` }}
    >
      {name}
    </span>
  )
}
