import type { Config } from 'tailwindcss'

/**
 * Minimal design-token baseline (designer pass) — a restrained, professional
 * neutral scale + single accent, not a finished brand system. Body/background
 * comes from `ink`, all interactive/brand emphasis from `accent`, `signal` is
 * reserved for status chips only. `darkMode: 'class'` so dark mode is an
 * explicit toggle later rather than forced by OS preference in this pass.
 */
const config: Config = {
  darkMode: 'class',
  content: ['./src/app/**/*.{ts,tsx}', './src/components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#0b0d10',
          900: '#14171a',
          700: '#3a4148',
          500: '#5b6570',
          300: '#98a1a9',
          100: '#e4e7ea',
          50: '#f6f7f8',
        },
        accent: {
          700: '#0f5c5c',
          500: '#1a7a7a',
          100: '#e0f0ef',
        },
        signal: {
          success: '#2f7a4f',
          warning: '#9a6b1a',
          info: '#3a628f',
        },
      },
    },
  },
}

export default config
