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
