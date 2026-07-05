import { describe, expect, it } from 'vitest'

import {
  eventTypeToIcon,
  humanizePillar,
  mediaImage,
  outcomeTypeLabel,
  pillarToIcon,
  profileTypeLabel,
} from './display'

/**
 * Contract for the design-system restyle's pillar/eventType/profileType
 * humanization + icon-mapping LOGIC (docs/plans/design-system-restyle.md
 * §5 field mapping, §6 "new unit/integration" worklist). This is pure
 * presentational-adjacent logic pulled out of JSX so it's independently
 * testable — the implementer creates `src/lib/display.ts` to satisfy these
 * assertions; this file is red until that module exists.
 *
 * Mappings are exact strings from the plan:
 *   - pillar -> icon: build -> code, engage -> diversity_3, publish -> auto_awesome
 *   - eventType -> icon: workshop -> school, code-review -> code,
 *     employer-session -> handshake, talk -> stars
 *   - pillar -> humanized label: CLAUDE.md's fixed Build/Engage/Publish vocabulary
 *   - profileType -> label: Profiles' real select options (Student/Team/Faculty/Alum)
 */
describe('humanizePillar', () => {
  it('title-cases the three real Projects.pillars values', () => {
    expect(humanizePillar('build')).toBe('Build')
    expect(humanizePillar('engage')).toBe('Engage')
    expect(humanizePillar('publish')).toBe('Publish')
  })
})

describe('pillarToIcon', () => {
  it('maps each pillar to its deterministic Material Symbol glyph', () => {
    expect(pillarToIcon('build')).toBe('code')
    expect(pillarToIcon('engage')).toBe('diversity_3')
    expect(pillarToIcon('publish')).toBe('auto_awesome')
  })
})

describe('eventTypeToIcon', () => {
  it('maps each real Events.eventType value to its Material Symbol glyph', () => {
    expect(eventTypeToIcon('workshop')).toBe('school')
    expect(eventTypeToIcon('code-review')).toBe('code')
    expect(eventTypeToIcon('employer-session')).toBe('handshake')
    expect(eventTypeToIcon('talk')).toBe('stars')
  })

  it('does not throw for the "other" eventType option and returns a non-empty glyph name', () => {
    // Events.eventType includes an 'other' option (src/collections/Events.ts)
    // not enumerated in the plan's mapping table — must degrade gracefully
    // (a sensible fallback glyph), not throw or return an empty string.
    const icon = eventTypeToIcon('other')
    expect(typeof icon).toBe('string')
    expect(icon.length).toBeGreaterThan(0)
  })
})

describe('profileTypeLabel', () => {
  it('maps each real Profiles.profileType value to its display label', () => {
    expect(profileTypeLabel('student')).toBe('Student')
    expect(profileTypeLabel('team')).toBe('Team')
    expect(profileTypeLabel('faculty')).toBe('Faculty')
    expect(profileTypeLabel('alum')).toBe('Alum')
  })
})

// docs/plans/brand-lockup-and-outcomes.md §5: Profiles.outcome.type -> pill
// label for the /students outcome pill. `outcomeTypeLabel` doesn't exist yet
// (src/lib/display.ts) — this describe block is red until the implementer
// adds the export per the plan's exact mapping table.
describe('outcomeTypeLabel', () => {
  it('maps each real Profiles.outcome.type value to its display label', () => {
    expect(outcomeTypeLabel('internship')).toBe('Internship')
    expect(outcomeTypeLabel('co-op')).toBe('Co-op')
    expect(outcomeTypeLabel('new-position')).toBe('New Position')
    expect(outcomeTypeLabel('full-time-offer')).toBe('Full-time Offer')
    expect(outcomeTypeLabel('promotion')).toBe('Promotion')
    expect(outcomeTypeLabel('research-role')).toBe('Research Role')
    expect(outcomeTypeLabel('grad-school')).toBe('Grad School')
  })
})

// `mediaImage` is beyond the tester's original contract (added by the
// implementer to normalize Payload upload relationships for card
// components) but lives in the same module and is exercised nowhere else —
// added here post-implementation to close the `src/lib/**` coverage gate
// (a real gap, not gold-plating: `pnpm test:coverage` failed the 90%
// threshold on this file without it).
describe('mediaImage', () => {
  it('returns undefined for null/undefined media', () => {
    expect(mediaImage(null)).toBeUndefined()
    expect(mediaImage(undefined)).toBeUndefined()
  })

  it('returns undefined for a bare id (unpopulated relationship, depth:0)', () => {
    expect(mediaImage(42)).toBeUndefined()
  })

  it('returns undefined when the populated doc has no url', () => {
    expect(mediaImage({ alt: 'no url here' })).toBeUndefined()
  })

  it('normalizes a populated Media doc into { url, alt }', () => {
    expect(mediaImage({ url: '/api/media/file/photo.png', alt: 'A photo' })).toEqual({
      url: '/api/media/file/photo.png',
      alt: 'A photo',
    })
  })

  it('omits alt (rather than fabricating one) when the doc has no alt text', () => {
    expect(mediaImage({ url: '/api/media/file/photo.png' })).toEqual({
      url: '/api/media/file/photo.png',
      alt: undefined,
    })
  })
})
