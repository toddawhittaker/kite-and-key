import type { ReactNode } from 'react'

/**
 * Shared width/gutter wrapper reused by every route so pages don't repeat
 * the same container classes.
 */
export function PageContainer({ children }: { children: ReactNode }) {
  return <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">{children}</div>
}
