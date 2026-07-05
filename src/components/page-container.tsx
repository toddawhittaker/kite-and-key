import type { ReactNode } from 'react'

/**
 * Shared width/gutter wrapper reused by every route so pages don't repeat
 * the same container classes. `max-w-7xl` + a flat 32px gutter (`px-8`,
 * `px-6` on mobile) matches the design system's content well
 * (docs/design/reference/tokens/spacing.css `--content-max`).
 */
export function PageContainer({ children }: { children: ReactNode }) {
  return <div className="mx-auto max-w-7xl px-6 md:px-8">{children}</div>
}
