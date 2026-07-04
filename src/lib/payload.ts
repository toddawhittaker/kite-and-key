import config from '@payload-config'
import { getPayload } from 'payload'

/**
 * Local API client for server components — in-process, no HTTP round trip.
 * Callers MUST pass `draft: false` explicitly on any public-facing query;
 * see the collections with `versions.drafts` enabled (Projects, Posts,
 * Events). Never surface a `_status: 'draft'` document on the public site.
 */
export const getPayloadClient = () => getPayload({ config })
