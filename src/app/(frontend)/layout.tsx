import localFont from 'next/font/local'
import React from 'react'

import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'
import './globals.css'

// Inter/Noto Serif — self-hosted from committed woff2 (fix batch #8), same
// mechanism as Material Symbols below: no network call at build (unlike
// next/font/google, which fetches from Google at `next build` — see
// docs/plans/design-system-restyle.md §0.3/R-BUILD). Both files are
// variable fonts (wght axis) subsetted to latin only, so one file per
// style covers the full 400-700 weight range we use.
const inter = localFont({
  src: [{ path: './fonts/Inter.woff2', weight: '400 700', style: 'normal' }],
  variable: '--font-inter',
  display: 'swap',
})

const notoSerif = localFont({
  src: [
    { path: './fonts/NotoSerif.woff2', weight: '400 700', style: 'normal' },
    { path: './fonts/NotoSerifItalic.woff2', weight: '400 700', style: 'italic' },
  ],
  variable: '--font-noto-serif',
  display: 'swap',
})

// Material Symbols Outlined — self-hosted from a committed woff2 (§0.2): no
// third-party font CDN call at build or runtime, and full FILL/wght/GRAD/opsz
// variable-axis control for the outline<->filled hover interaction.
const materialSymbols = localFont({
  src: './fonts/MaterialSymbolsOutlined.woff2',
  variable: '--font-material-symbols',
  display: 'block',
})

export const metadata = {
  description:
    'Kite & Key IT — the public surface of applied technology work by Franklin University Computing Sciences and Mathematics students.',
  title: 'Kite & Key IT',
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props

  return (
    <html
      lang="en"
      className={`${inter.variable} ${notoSerif.variable} ${materialSymbols.variable}`}
    >
      <body className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex-1 pt-24">{children}</main>
        <SiteFooter />
      </body>
    </html>
  )
}
