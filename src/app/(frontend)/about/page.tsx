import { RichText } from '@payloadcms/richtext-lexical/react'

import { PageContainer } from '@/components/page-container'
import { getPayloadClient } from '@/lib/payload'

export const dynamic = 'force-dynamic'

export default async function AboutPage() {
  const payload = await getPayloadClient()
  const about = await payload.findGlobal({ slug: 'about' })

  return (
    <PageContainer>
      <div className="max-w-2xl py-16">
        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">{about.heading}</h1>
        <div className="mt-6 text-base leading-relaxed">
          {about.body && <RichText data={about.body} />}
        </div>
        {about.facultyModeratorNote && (
          <div className="mt-8 rounded-lg border border-ink-100 p-6 text-sm text-ink-700 dark:border-ink-900 dark:text-ink-300">
            <RichText data={about.facultyModeratorNote} />
          </div>
        )}
      </div>
    </PageContainer>
  )
}
