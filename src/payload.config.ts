import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Projects } from './collections/Projects'
import { Posts } from './collections/Posts'
import { Profiles } from './collections/Profiles'
import { Events } from './collections/Events'
import { PartnerOpportunities } from './collections/PartnerOpportunities'
import { About } from './globals/About'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    meta: {
      titleSuffix: '- Kite & Key IT',
      description: 'Kite & Key IT content administration.',
    },
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Projects, Events, PartnerOpportunities, Posts, Profiles, Media, Users],
  globals: [About],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
    // Lets the Local API tell collections without `versions.drafts` (e.g.
    // PartnerOpportunities) apart from draft-enabled ones at the type
    // level — without it, `create`/`find` calls against a no-drafts
    // collection can fail to resolve either overload. No schema/runtime
    // impact; type-generation only.
    strictDraftTypes: true,
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || '',
    },
    // Migration-based workflow only — no dev-time schema auto-push. This is
    // what makes `payload migrate` on a fresh DB (and the deploy path) real.
    push: false,
  }),
  sharp,
  plugins: [],
})
