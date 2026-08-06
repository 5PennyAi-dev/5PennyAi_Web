const PLATFORM_RULES = Object.freeze({
  facebook: Object.freeze({ maxBodyLength: 450, minHashtags: 2, maxHashtags: 3 }),
  linkedin: Object.freeze({ maxBodyLength: 550, minHashtags: 2, maxHashtags: 4 }),
})

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const INPUT_KEYS = new Set(['resourceType', 'resourceId', 'platform'])
const TECHNICAL_MARKER_PATTERN = /\b(?:schemaVersion|resourceType|resourceId|publicUrl|socialImageUrl|thumbnail_path|cover_path|storage_path)\b/i

export class ResourceSocialError extends Error {
  constructor(code, status, issues = []) {
    super(code)
    this.name = 'ResourceSocialError'
    this.code = code
    this.status = status
    this.issues = issues
  }
}

export function isValidResourceId(value) {
  return typeof value === 'string' && UUID_PATTERN.test(value)
}

export function parseResourceSocialRequestBody(body) {
  let parsed = body
  if (typeof body === 'string') {
    try {
      parsed = JSON.parse(body)
    } catch {
      throw new ResourceSocialError('invalid_request', 400)
    }
  }

  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new ResourceSocialError('invalid_request', 400)
  }
  if (Object.keys(parsed).some((key) => !INPUT_KEYS.has(key))) {
    throw new ResourceSocialError('invalid_request', 400)
  }
  if (!['article', 'infographic'].includes(parsed.resourceType)) {
    throw new ResourceSocialError('invalid_request', 400)
  }
  if (!isValidResourceId(parsed.resourceId)) {
    throw new ResourceSocialError('invalid_request', 400)
  }
  if (parsed.platform !== undefined && !Object.hasOwn(PLATFORM_RULES, parsed.platform)) {
    throw new ResourceSocialError('invalid_request', 400)
  }

  return {
    resourceType: parsed.resourceType,
    resourceId: parsed.resourceId,
    ...(parsed.platform ? { platform: parsed.platform } : {}),
  }
}

export function countUnicodeCharacters(value) {
  return Array.from(value).length
}

export function normalizeSocialBody(value) {
  if (typeof value !== 'string') return ''
  return value
    .replace(/\r\n?/g, '\n')
    .split('\n')
    .map((line) => line.replace(/[\t ]+/g, ' ').trim())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

export function normalizeHashtags(values) {
  if (!Array.isArray(values)) return []
  const seen = new Set()
  const normalized = []

  for (const value of values) {
    if (typeof value !== 'string') continue
    const content = value
      .trim()
      .replace(/^#+/, '')
      .replace(/\s+/g, '')
      .replace(/[.,;:!?]+$/u, '')
    if (!content || !/^[\p{L}\p{N}_]+$/u.test(content)) continue
    const hashtag = `#${content}`
    const key = hashtag.toLocaleLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    normalized.push(hashtag)
  }

  return normalized
}

export function validateProviderSocialOutput(payload, platform) {
  const issues = []
  const expectedPlatforms = platform ? [platform] : ['facebook', 'linkedin']
  const normalized = {}

  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    throw new ResourceSocialError('invalid_provider_output', 502, ['root_not_object'])
  }

  if (platform) {
    normalized[platform] = normalizePlatformOutput(payload, platform, issues)
  } else {
    const keys = Object.keys(payload)
    if (keys.some((key) => !expectedPlatforms.includes(key))) issues.push('unexpected_property')
    for (const name of expectedPlatforms) {
      normalized[name] = normalizePlatformOutput(payload[name], name, issues)
    }
    if (
      normalized.facebook?.body &&
      normalized.linkedin?.body &&
      comparableBody(normalized.facebook.body) === comparableBody(normalized.linkedin.body)
    ) {
      issues.push('platform_bodies_identical')
    }
  }

  if (issues.length) {
    throw new ResourceSocialError('invalid_provider_output', 502, [...new Set(issues)])
  }
  return normalized
}

function normalizePlatformOutput(value, platform, issues) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    issues.push(`${platform}_missing`)
    return null
  }
  const keys = Object.keys(value)
  if (keys.some((key) => !['body', 'hashtags'].includes(key))) {
    issues.push(`${platform}_unexpected_property`)
  }

  const body = normalizeSocialBody(value.body)
  const hashtags = normalizeHashtags(value.hashtags)
  const rules = PLATFORM_RULES[platform]
  if (!body) issues.push(`${platform}_body_empty`)
  if (/https?:\/\/|www\./i.test(body)) issues.push(`${platform}_body_url`)
  if (/\{\{\s*(?:cite|media):[^{}]+\}\}/i.test(body)) {
    issues.push(`${platform}_technical_marker`)
  }
  if (/```|~~~/u.test(body)) issues.push(`${platform}_code_block`)
  if (/^\s*(?:[-*•]|\d+[.)])\s+/mu.test(body)) issues.push(`${platform}_bullet_list`)
  if (/(^|\s)#[\p{L}\p{N}_]/u.test(body)) issues.push(`${platform}_hashtag_in_body`)
  if (TECHNICAL_MARKER_PATTERN.test(body)) issues.push(`${platform}_technical_property`)
  if (countUnicodeCharacters(body) > rules.maxBodyLength) issues.push(`${platform}_body_too_long`)
  if (hasInvalidHashtag(value.hashtags)) issues.push(`${platform}_invalid_hashtag`)
  if (hashtags.length < rules.minHashtags) issues.push(`${platform}_too_few_hashtags`)
  if (hashtags.length > rules.maxHashtags) issues.push(`${platform}_too_many_hashtags`)

  return { body, hashtags }
}

function hasInvalidHashtag(values) {
  if (!Array.isArray(values)) return true
  return values.some((value) => {
    if (typeof value !== 'string') return true
    const content = value.trim().replace(/^#+/, '').replace(/\s+/g, '').replace(/[.,;:!?]+$/u, '')
    return !content || !/^[\p{L}\p{N}_]+$/u.test(content)
  })
}

function comparableBody(value) {
  return value.trim().replace(/\s+/g, ' ').toLocaleLowerCase()
}

export { PLATFORM_RULES }
