import { getPayloadClient } from '@/lib/payload'

/**
 * Idempotent, dev-only seed: creates the first admin user (env-driven, no
 * hardcoded password) and a handful of clearly-labeled placeholder Profiles/
 * Projects/Posts/Events/PartnerOpportunities so the app isn't empty on first
 * run. Safe to re-run — every create is guarded by a `find` on a unique
 * field. Run with `pnpm seed` (mapped to `payload run src/seed/index.ts`).
 */
async function run() {
  if (process.env.NODE_ENV === 'production' && process.env.ALLOW_SEED !== 'true') {
    console.error(
      'Refusing to seed: NODE_ENV=production and ALLOW_SEED is not "true". ' +
        'Set ALLOW_SEED=true to force this outside dev.',
    )
    process.exit(1)
  }

  const { SEED_ADMIN_EMAIL, SEED_ADMIN_PASSWORD } = process.env
  if (!SEED_ADMIN_EMAIL || !SEED_ADMIN_PASSWORD) {
    console.error(
      'Refusing to seed: SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD must both be set (see .env.example).',
    )
    process.exit(1)
  }

  const payload = await getPayloadClient()

  // --- first admin ---
  const existingAdmin = await payload.find({
    collection: 'users',
    where: { email: { equals: SEED_ADMIN_EMAIL } },
    limit: 1,
  })
  if (existingAdmin.docs.length === 0) {
    await payload.create({
      collection: 'users',
      data: {
        email: SEED_ADMIN_EMAIL,
        password: SEED_ADMIN_PASSWORD,
        name: 'Seed Admin',
        role: 'admin',
      },
    })
    console.log(`Created first admin user: ${SEED_ADMIN_EMAIL}`)
  } else {
    console.log(`Admin user already exists: ${SEED_ADMIN_EMAIL} (skipped)`)
  }

  // --- profiles ---
  const profileSeeds = [
    {
      slug: 'sample-profile-one',
      name: 'Sample Profile — Student One',
      profileType: 'student' as const,
      program: 'B.S. Computer Science',
      bio: richText('Placeholder bio for a sample student profile.'),
      outcome: { type: 'internship' as const, detail: 'SWE Intern — sample data' },
    },
    {
      slug: 'sample-profile-two',
      name: 'Sample Profile — Student Two',
      profileType: 'student' as const,
      program: 'B.S. Computing Science',
      bio: richText('Placeholder bio for a sample student profile.'),
      outcome: { type: 'new-position' as const },
    },
  ]
  const profileIds: Record<string, number> = {}
  for (const seed of profileSeeds) {
    const existing = await payload.find({
      collection: 'profiles',
      where: { slug: { equals: seed.slug } },
      limit: 1,
    })
    if (existing.docs.length > 0) {
      profileIds[seed.slug] = existing.docs[0].id
      console.log(`Profile already exists: ${seed.name} (skipped)`)
      continue
    }
    const created = await payload.create({ collection: 'profiles', data: seed })
    profileIds[seed.slug] = created.id
    console.log(`Created profile: ${seed.name}`)
  }

  // --- projects ---
  const projectSeeds = [
    {
      slug: 'sample-project-one',
      title: 'Sample Project — Inventory Tracker',
      summary: 'Placeholder summary: a scoped inventory-tracking application.',
      problem: richText('Placeholder problem statement for a sample project.'),
      technologies: [{ name: 'Next.js' }, { name: 'PostgreSQL' }],
      contributors: [profileIds['sample-profile-one']].filter(Boolean),
      outcomes: richText('Placeholder outcomes for a sample project.'),
      pillars: ['build'] as ('build' | 'engage' | 'publish')[],
      publishedDate: new Date().toISOString(),
      _status: 'published' as const,
    },
    {
      slug: 'sample-project-two',
      title: 'Sample Project — Data Dashboard',
      summary: 'Placeholder summary: a scoped reporting dashboard.',
      problem: richText('Placeholder problem statement for a sample project.'),
      technologies: [{ name: 'React' }, { name: 'AWS Lambda' }],
      contributors: [profileIds['sample-profile-two']].filter(Boolean),
      outcomes: richText('Placeholder outcomes for a sample project.'),
      pillars: ['build', 'publish'] as ('build' | 'engage' | 'publish')[],
      publishedDate: new Date().toISOString(),
      _status: 'published' as const,
    },
  ]
  for (const seed of projectSeeds) {
    const existing = await payload.find({
      collection: 'projects',
      where: { slug: { equals: seed.slug } },
      limit: 1,
    })
    if (existing.docs.length > 0) {
      console.log(`Project already exists: ${seed.title} (skipped)`)
      continue
    }
    await payload.create({ collection: 'projects', data: seed, draft: false })
    console.log(`Created project: ${seed.title}`)
  }

  // --- posts ---
  const postSeeds = [
    {
      slug: 'sample-post-one',
      title: 'Sample Post — Field Notes From a Project',
      author: profileIds['sample-profile-one'],
      excerpt: 'Placeholder excerpt for a sample blog post.',
      body: richText('Placeholder body copy for a sample blog post.'),
      publishedDate: new Date().toISOString(),
      _status: 'published' as const,
    },
    {
      slug: 'sample-post-two',
      title: 'Sample Post — What We Learned',
      author: profileIds['sample-profile-two'],
      excerpt: 'Placeholder excerpt for a sample blog post.',
      body: richText('Placeholder body copy for a sample blog post.'),
      publishedDate: new Date().toISOString(),
      _status: 'published' as const,
    },
  ]
  for (const seed of postSeeds) {
    if (!seed.author) continue
    const existing = await payload.find({
      collection: 'posts',
      where: { slug: { equals: seed.slug } },
      limit: 1,
    })
    if (existing.docs.length > 0) {
      console.log(`Post already exists: ${seed.title} (skipped)`)
      continue
    }
    await payload.create({ collection: 'posts', data: seed, draft: false })
    console.log(`Created post: ${seed.title}`)
  }

  // --- events ---
  const existingEvent = await payload.find({
    collection: 'events',
    where: { slug: { equals: 'sample-event' } },
    limit: 1,
  })
  if (existingEvent.docs.length === 0) {
    // Future offset (not `new Date()`): Get Involved's "upcoming events"
    // query filters on `startDate >= now` at request time, which is always
    // strictly after seed time — a same-instant timestamp would already be
    // in the past by the time any page requests it (see e2e/get-involved.spec.ts).
    const upcomingEventStartDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    await payload.create({
      collection: 'events',
      data: {
        slug: 'sample-event',
        title: 'Sample Event — Code Review Session',
        eventType: 'code-review',
        description: richText('Placeholder description for a sample event.'),
        startDate: upcomingEventStartDate.toISOString(),
        _status: 'published' as const,
      },
      draft: false,
    })
    console.log('Created event: Sample Event — Code Review Session')
  } else {
    console.log('Event already exists: Sample Event — Code Review Session (skipped)')
  }

  // --- partner opportunities ---
  const existingOpportunity = await payload.find({
    collection: 'partner-opportunities',
    where: { title: { equals: 'Sample Partner Opportunity' } },
    limit: 1,
  })
  if (existingOpportunity.docs.length === 0) {
    await payload.create({
      collection: 'partner-opportunities',
      data: {
        title: 'Sample Partner Opportunity',
        organization: 'Sample Organization',
        contactName: 'Sample Contact',
        contactEmail: 'partner@example.org',
        problem: richText('Placeholder problem statement for a sample partner opportunity.'),
        scope: 'Placeholder scope: a bounded, term-length engagement.',
        estimatedEffort: 'term-length',
        status: 'submitted',
      },
    })
    console.log('Created partner opportunity: Sample Partner Opportunity')
  } else {
    console.log('Partner opportunity already exists: Sample Partner Opportunity (skipped)')
  }

  // --- about global ---
  const about = await payload.findGlobal({ slug: 'about' })
  if (!about?.body) {
    await payload.updateGlobal({
      slug: 'about',
      data: {
        heading: 'About Kite & Key IT',
        body: richText(
          'PLACEHOLDER: Kite & Key IT is the public surface of applied technology work by ' +
            "Franklin University Computing Sciences and Mathematics students, organized around " +
            'three pillars — Build, Engage, and Publish. Replace this paragraph with real, ' +
            'specific copy before launch.',
        ),
        facultyModeratorNote: richText(
          'PLACEHOLDER: All project work shown here is scoped and reviewed under faculty ' +
            'oversight — this is educationally-appropriate, bounded work, not open-ended ' +
            'consulting. Replace this note with real, specific copy before launch.',
        ),
      },
    })
    console.log('Seeded about global (placeholder copy)')
  } else {
    console.log('About global already has content (skipped)')
  }

  console.log('Seed complete.')
  process.exit(0)
}

// Minimal Lexical rich-text document wrapper for placeholder copy.
function richText(text: string) {
  return {
    root: {
      type: 'root',
      children: [
        {
          type: 'paragraph',
          children: [{ type: 'text', text, version: 1 }],
          direction: 'ltr' as const,
          format: '' as const,
          indent: 0,
          version: 1,
        },
      ],
      direction: 'ltr' as const,
      format: '' as const,
      indent: 0,
      version: 1,
    },
  }
}

// Top-level await matters here: `payload run <script>` dynamically
// `import()`s this file and only waits for that import's promise, not for
// any un-awaited async call inside it. Without `await`, the process would
// exit as soon as `run()` returns its (still-pending) promise — before any
// of the seed logic actually executes.
await run().catch((error) => {
  console.error('Seed failed:', error)
  process.exit(1)
})
