/**
 * Presentational-adjacent humanization + icon-mapping helpers for the
 * design-system restyle (docs/plans/design-system-restyle.md §5 field
 * mapping). Pulled out of JSX so the pillar/eventType/profileType -> label/
 * icon logic is independently testable — see src/lib/display.unit.test.ts
 * for the exact contract. Every mapping here is deterministic and derived
 * from real select-field option values (Projects.pillars, Events.eventType,
 * Profiles.profileType) — nothing here fabricates data.
 */

export type Pillar = 'build' | 'engage' | 'publish'

const PILLAR_LABELS: Record<Pillar, string> = {
  build: 'Build',
  engage: 'Engage',
  publish: 'Publish',
}

/** Title-cases a real Projects.pillars value for display (e.g. FilterPill, ProjectCard category). */
export function humanizePillar(pillar: Pillar): string {
  return PILLAR_LABELS[pillar]
}

const PILLAR_ICONS: Record<Pillar, string> = {
  build: 'code',
  engage: 'diversity_3',
  publish: 'auto_awesome',
}

/** Deterministic pillar -> Material Symbol glyph name (no status/sector field exists — see plan R1). */
export function pillarToIcon(pillar: Pillar): string {
  return PILLAR_ICONS[pillar]
}

export type EventType = 'workshop' | 'code-review' | 'employer-session' | 'talk' | 'other'

const EVENT_TYPE_ICONS: Record<EventType, string> = {
  workshop: 'school',
  'code-review': 'code',
  'employer-session': 'handshake',
  talk: 'stars',
  // Events.eventType's fifth option isn't enumerated in the plan's mapping
  // table — degrade gracefully to a sensible generic glyph rather than
  // throwing or rendering an empty icon.
  other: 'event',
}

/** Real Events.eventType value -> Material Symbol glyph, with a graceful fallback for 'other'. */
export function eventTypeToIcon(eventType: EventType): string {
  return EVENT_TYPE_ICONS[eventType] ?? 'event'
}

export type ProfileType = 'student' | 'team' | 'faculty' | 'alum'

const PROFILE_TYPE_LABELS: Record<ProfileType, string> = {
  student: 'Student',
  team: 'Team',
  faculty: 'Faculty',
  alum: 'Alum',
}

/** Real Profiles.profileType value -> display label (StudentCard's `tag`, see plan R4). */
export function profileTypeLabel(profileType: ProfileType): string {
  return PROFILE_TYPE_LABELS[profileType]
}

/**
 * Normalizes a Payload upload relationship (populated Media doc, a bare id
 * when unpopulated/depth:0, or absent) into the `{ url, alt }` shape the
 * card components take. Returns undefined rather than fabricating a URL.
 */
export function mediaImage(
  media: { url?: string | null; alt?: string | null } | number | null | undefined,
): { url: string; alt?: string } | undefined {
  if (!media || typeof media === 'number' || !media.url) return undefined
  return { url: media.url, alt: media.alt ?? undefined }
}
