import type { Access } from 'payload'

/**
 * Centralized access-control helpers. This is the seam the security-auditor
 * should scrutinize: current defaults are "sensible but not hardened"
 * (auth-required writes, public reads on published content). Role-based
 * splits (editor vs admin vs faculty-moderator) and field-level protection
 * on sensitive PartnerOpportunities fields are a follow-up — keep the checks
 * here so that follow-up is a small diff, not a scattered rewrite.
 */

export const isAdmin: Access = ({ req: { user } }) => Boolean(user && user.role === 'admin')

export const isAuthenticated: Access = ({ req: { user } }) => Boolean(user)

export const anyone: Access = () => true

/**
 * For collections with `versions.drafts` enabled (Projects, Posts, Events):
 * authenticated users can read everything (including drafts, for the admin
 * UI); anonymous callers are restricted to published documents only. Payload's
 * Local API defaults to published-only for logged-out requests, but the REST/
 * GraphQL API does NOT — `?draft=true` would otherwise leak unpublished
 * content to anonymous callers. This is the fix for that leak.
 */
export const publishedOrAuth: Access = ({ req: { user } }) =>
  user ? true : { _status: { equals: 'published' } }
