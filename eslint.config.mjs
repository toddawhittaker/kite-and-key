import nextCoreWebVitals from 'eslint-config-next/core-web-vitals'
import nextTypescript from 'eslint-config-next/typescript'

// eslint-config-next 16.x ships native flat config — no `@eslint/eslintrc`
// FlatCompat shim needed (and that shim crashes with a circular-JSON error
// against this eslint/eslint-config-next combination anyway).
const eslintConfig = [
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    rules: {
      '@typescript-eslint/ban-ts-comment': 'warn',
      '@typescript-eslint/no-empty-object-type': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          vars: 'all',
          args: 'after-used',
          ignoreRestSiblings: false,
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^(_|ignore)',
        },
      ],
    },
  },
  {
    // `docs/design/reference/` is imported reference material (design-system
    // restyle source docs, not buildable product code — see
    // docs/plans/design-system-restyle.md); `coverage/` is generated,
    // gitignored test output. Neither should be linted as our TS/React code.
    ignores: [
      '.next/',
      'coverage/',
      'docs/design/reference/',
      'src/payload-types.ts',
      'src/payload-generated-schema.ts',
    ],
  },
]

export default eslintConfig
