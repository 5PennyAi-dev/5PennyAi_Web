import { buildArticleCanonicalUrl } from './articleSeo.js'
import { buildInfographicCanonicalUrl } from './infographicSeo.js'
import { isValidArticleSlug } from './articleSlug.js'

const RESOURCE_ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export const SOCIAL_POST_LIMITS = Object.freeze({
  facebook: Object.freeze({ min: 150, targetMax: 350, hardMax: 450, hashtagMin: 2, hashtagMax: 3 }),
  linkedin: Object.freeze({ min: 200, targetMax: 450, hardMax: 550, hashtagMin: 2, hashtagMax: 4 }),
})

export class ResourceSocialPostsRequestError extends Error {
  constructor(code, status = 0) {
    super(code)
    this.name = 'ResourceSocialPostsRequestError'
    this.code = code
    this.status = status
  }
}

export function normalizeSocialHashtags(value) {
  const entries = (Array.isArray(value) ? value : typeof value === 'string' ? [value] : [])
    .flatMap((entry) => typeof entry === 'string' ? entry.split(/\s+/u) : [])
  const seen = new Set()
  const normalized = []

  for (const entry of entries) {
    const clean = typeof entry === 'string' ? entry.trim().replace(/^#+/u, '') : ''
    if (!clean) continue
    const hashtag = `#${clean}`
    if (seen.has(hashtag)) continue
    seen.add(hashtag)
    normalized.push(hashtag)
  }
  return normalized
}

export function hashtagsToInput(value) {
  return normalizeSocialHashtags(value).join(' ')
}

export function buildSocialPostCopyText({ body, publicUrl, hashtags } = {}) {
  const parts = [
    typeof body === 'string' ? body.trim() : '',
    typeof publicUrl === 'string' ? publicUrl.trim() : '',
    normalizeSocialHashtags(hashtags).join(' '),
  ].filter(Boolean)
  return parts.join('\n\n')
}

export function countSocialPostCharacters(body) {
  return Array.from(typeof body === 'string' ? body : '').length
}

export function getSocialPostLengthState(platform, body) {
  const limits = SOCIAL_POST_LIMITS[platform]
  if (!limits) throw new TypeError('Unsupported social platform')
  const count = countSocialPostCharacters(body)
  if (count > limits.hardMax) return { count, state: 'overMaximum' }
  if (count > limits.targetMax) return { count, state: 'overTarget' }
  if (count < limits.min) return { count, state: 'underTarget' }
  return { count, state: 'inTarget' }
}

export function getSocialHashtagState(platform, hashtags) {
  const limits = SOCIAL_POST_LIMITS[platform]
  if (!limits) throw new TypeError('Unsupported social platform')
  const count = normalizeSocialHashtags(hashtags).length
  return {
    count,
    state: count >= limits.hashtagMin && count <= limits.hashtagMax ? 'inTarget' : 'outsideTarget',
  }
}

export function buildResourceSocialPublicUrl({ resourceType, resourceId, persistedSlug } = {}) {
  if (typeof resourceId !== 'string' || !RESOURCE_ID_PATTERN.test(resourceId)) return ''
  if (resourceType === 'article' && !isValidArticleSlug(persistedSlug)) return ''
  if (resourceType === 'article') return buildArticleCanonicalUrl(persistedSlug)
  if (resourceType === 'infographic') return buildInfographicCanonicalUrl(resourceId)
  return ''
}

export function getResourceSocialDisabledReason({ resourceType, resourceId, persistedSlug } = {}) {
  if (!resourceId) return 'unsaved'
  if (resourceType === 'article' && !isValidArticleSlug(persistedSlug)) return 'slugRequired'
  if (!buildResourceSocialPublicUrl({ resourceType, resourceId, persistedSlug })) return 'invalidResource'
  return ''
}

export async function requestResourceSocialPosts({
  fetchImpl = globalThis.fetch,
  getAccessToken,
  platform,
  resourceId,
  resourceType,
} = {}) {
  const accessToken = await getAccessToken?.()
  if (!accessToken) throw new ResourceSocialPostsRequestError('unauthenticated', 401)
  if (typeof fetchImpl !== 'function') throw new ResourceSocialPostsRequestError('generation_failed')

  const payload = { resourceType, resourceId }
  if (platform) payload.platform = platform
  const response = await fetchImpl('/api/generate-resource-social-posts', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })
  const result = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new ResourceSocialPostsRequestError(result.error || 'generation_failed', response.status)
  }

  const expectedPlatforms = platform ? [platform] : ['facebook', 'linkedin']
  for (const expected of expectedPlatforms) {
    if (
      typeof result[expected]?.body !== 'string'
      || !Array.isArray(result[expected]?.hashtags)
    ) {
      throw new ResourceSocialPostsRequestError('invalid_provider_output', 502)
    }
  }
  return result
}
