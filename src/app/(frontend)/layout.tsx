import localFont from 'next/font/local'
import { Inter, Noto_Serif } from 'next/font/google'
import React from 'react'

import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'
import './globals.css'

// next/font/google self-hosts at build time (no runtime Google Fonts CDN
// call) and auto-generates fallback size-adjust metrics, which is what
// actually prevents layout shift (not just `display: swap`). See
// docs/plans/design-system-restyle.md §0.3.
const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter',
  display: 'swap',
})

const notoSerif = Noto_Serif({
  subsets: ['latin'],
  weight: ['400', '700'],
  style: ['normal', 'italic'],
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
