import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(__filename)

// Env-gated allowlist for `next dev`'s cross-origin `/_next/*` (HMR/RSC)
// guard — lets the dockerized `e2e` service drive the admin panel at the
// compose network alias `webapp` (see docker-compose.yml) without loosening
// anything outside dev. `allowedDevOrigins` only affects `next dev`; `next
// start` (prod) ignores it entirely, and it's `undefined` (Next default:
// localhost only) whenever ALLOWED_DEV_ORIGINS is unset, which is every
// normal dev/prod run.
const allowedDevOrigins = process.env.ALLOWED_DEV_ORIGINS
  ? process.env.ALLOWED_DEV_ORIGINS.split(',')
      .map((s) => s.trim())
      .filter(Boolean)
  : undefined

const nextConfig: NextConfig = {
  ...(allowedDevOrigins ? { allowedDevOrigins } : {}),
  images: {
    localPatterns: [
      {
        pathname: '/api/media/file/**',
      },
      {
        // Static brand crest in public/ (site header + footer)
        pathname: '/kite-key-crest.png',
      },
    ],
  },
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }

    return webpackConfig
  },
  turbopack: {
    root: path.resolve(dirname),
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
