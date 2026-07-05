import config from '@payload-config'
import { getPayload } from 'payload'
import type { CollectionSlug, DataFromCollectionSlug, FindOptions, PaginatedDocs } from 'payload'

/**
 * Local API client for server components — in-process, no HTTP round trip.
 * Prefer `findPublic()` below for any public-facing query; call `getPayload`
 * directly only for admin-context work (e.g. the `about` global, which has
 * no drafts and public read access).
 */
export const getPayloadClient = () => getPayload({ config })

/**
 * The safe path, baked in as the default. Wraps `payload.find()` with
 * `overrideAccess: false` and `draft: false` so every public query gets
 * both without depending on each call site remembering to pass them:
 *   - `draft: false` — returns the published version of matching docs.
 *   - `overrideAccess: false` — the Local API defaults to `overrideAccess:
 *     true`, which SKIPS collection `access.read` entirely. Without this,
 *     `draft: false` alone does NOT filter out documents whose `_status`
 *     is `'draft'` (it only affects which version of a matched doc is
 *     returned) — the `access.read` (`publishedOrAuth` in `src/lib/
 *     access.ts`) is what actually excludes drafts for anonymous callers.
 * Never surface a `_status: 'draft'` document on the public site — use this
 * helper for any collection query a public page runs, rather than calling
 * `payload.find()` directly.
 */
export async function findPublic<TSlug extends CollectionSlug>(
  collection: TSlug,
  // `SelectType`/`SelectFromCollectionSlug` aren't exported from the
  // top-level `payload` package, so the select generic is left permissive
  // here — none of our public queries use `select` today.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  options: Omit<FindOptions<TSlug, any>, 'collection' | 'draft' | 'overrideAccess'> = {} as Omit<
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    FindOptions<TSlug, any>,
    'collection' | 'draft' | 'overrideAccess'
  >,
  // Explicit return type: `FindOptions`'s `draft` flag is conditionally
  // typed per-slug (via `strictDraftTypes`), and that conditional can't
  // distribute over a generic `TSlug` at the `payload.find()` call site
  // below, nor can the `select` generic (left `any` — see above) be let
  // loose on the *return* type without it collapsing individual fields to
  // `unknown`/optional. Annotating the return type here keeps callers'
  // inference exact (full, non-select documents — what every caller gets).
): Promise<PaginatedDocs<DataFromCollectionSlug<TSlug>>> {
  const payload = await getPayloadClient()
  // Safe: `draft: false` and `overrideAccess: false` are valid for every
  // collection regardless of whether it has `versions.drafts` enabled.
  return payload.find({
    ...options,
    collection,
    overrideAccess: false,
    draft: false,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any)
}
