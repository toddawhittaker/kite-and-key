import { describe, expect, it } from 'vitest'

import { eventTypeToIcon, humanizePillar, pillarToIcon, profileTypeLabel } from './display'

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
