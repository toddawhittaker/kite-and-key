import { Button } from '@/components/button'
import { PageContainer } from '@/components/page-container'
import { Select } from '@/components/select'
import { StudentCard } from '@/components/student-card'
import { StudentsView } from '@/components/students-view'
import { mediaImage, profileTypeLabel, type ProfileType } from '@/lib/display'
import { findPublic } from '@/lib/payload'
import { richTextToPlainText } from '@/lib/richtext'

export const dynamic = 'force-dynamic'

const PROFILE_TYPES: ProfileType[] = ['student', 'team', 'faculty', 'alum']

export default async function StudentsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const params = await searchParams
  const program = typeof params.program === 'string' ? params.program : undefined
  const year = typeof params.year === 'string' ? params.year : undefined
  const type = typeof params.type === 'string' ? params.type : undefined

  // Profiles has no drafts, so overrideAccess:false is a no-op today — kept
  // for consistency/defense-in-depth via the same findPublic() helper.
  // Filter options + results are computed in-memory from a single fetch
  // (plan §5 describes a `where`-based approach; this is the simpler v1
  // path). `limit: 500` is an intentional headroom cap, not a silent one —
  // revisit with a `where`-based filter + pagination if the roster outgrows it.
  const { docs: allProfiles } = await findPublic('profiles', {
    depth: 0,
    sort: 'name',
    limit: 500,
  })

  const programOptions = Array.from(
    new Set(allProfiles.map((p) => p.program).filter((p): p is string => Boolean(p))),
  ).sort()
  const yearOptions = Array.from(
    new Set(allProfiles.map((p) => p.gradYear).filter((y): y is number => Boolean(y))),
  ).sort((a, b) => b - a)

  const profiles = allProfiles.filter((profile) => {
    if (program && profile.program !== program) return false
    if (year && String(profile.gradYear ?? '') !== year) return false
    if (type && profile.profileType !== type) return false
    return true
  })

  return (
    <PageContainer>
      <div className="py-16">
        <span className="eyebrow text-muted">Success Narratives</span>
        <h1 className="mt-6 text-4xl font-bold text-brand-ink md:text-5xl">Student Highlights</h1>
        <p className="type-emphasis mt-4 text-xl text-body">
          Meet the people behind the work — and where the work took them.
        </p>
        <div className="mt-4 h-1 w-24 bg-brand-gold" />
        <p className="mt-6 max-w-xl text-base leading-relaxed text-muted">
          The students and team members behind the work on this site — real contributors, not a
          directory.
        </p>

        <form
          method="get"
          className="mt-12 flex flex-col gap-6 border-b border-hairline/20 pb-8 sm:flex-row sm:items-end sm:justify-between"
        >
          <div className="grid flex-1 gap-6 sm:grid-cols-3">
            <Select
              label="Program"
              name="program"
              defaultValue={program ?? ''}
              options={[
                { label: 'All Programs', value: '' },
                ...programOptions.map((p) => ({ label: p, value: p })),
              ]}
            />
            <Select
              label="Profile Type"
              name="type"
              defaultValue={type ?? ''}
              options={[
                { label: 'All Types', value: '' },
                ...PROFILE_TYPES.map((t) => ({ label: profileTypeLabel(t), value: t })),
              ]}
            />
            <Select
              label="Class Year"
              name="year"
              defaultValue={year ?? ''}
              options={[
                { label: 'All Years', value: '' },
                ...yearOptions.map((y) => ({ label: String(y), value: String(y) })),
              ]}
            />
          </div>
          <Button type="submit" variant="secondary" size="sm">
            Apply Filters
          </Button>
        </form>

        {profiles.length === 0 ? (
          <p className="mt-12 text-muted">Student profiles are being added — check back soon.</p>
        ) : (
          <StudentsView>
            {profiles.map((profile) => (
              <StudentCard
                key={profile.id}
                name={profile.name}
                program={profile.program ?? undefined}
                year={profile.gradYear ?? undefined}
                description={richTextToPlainText(profile.bio)}
                avatar={mediaImage(profile.avatar)}
                tag={profileTypeLabel(profile.profileType)}
              />
            ))}
          </StudentsView>
        )}
      </div>
    </PageContainer>
  )
}
