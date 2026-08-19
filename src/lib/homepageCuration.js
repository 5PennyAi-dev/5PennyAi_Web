const RESOURCES_PATH = '/ressources-ia'
import { FEATURED_TOPIC_SLUGS, getAvailableResourceTopics } from './resourceTopics.js'

export const STARTER_SERIES_SLUG = 'les-fondamentaux-de-l-ia-generative'

export { FEATURED_TOPIC_SLUGS }

// Editorial selections only contain stable identifiers. Their public data is
// always resolved from the shared published catalog in Home.
export const FEATURED_SERIES_SLUGS = [
  'le-vocabulaire-de-l-ia-generative',
  'anatomie-d-une-reponse-generee',
  'developper-avec-les-assistants-ia',
]

export function buildHeroSearchDestination(query) {
  const value = typeof query === 'string' ? query.trim() : ''
  if (!value) return RESOURCES_PATH

  const params = new URLSearchParams({ q: value })
  return `${RESOURCES_PATH}?${params.toString()}`
}

export function selectHeroResources(resources, { count = 3, random = Math.random } = {}) {
  const limit = Math.min(3, Number.isInteger(count) && count > 0 ? count : 3)
  const identities = new Set()
  const eligible = (Array.isArray(resources) ? resources : [])
    .filter((resource) => isEligibleResource(resource) && hasUsableThumbnail(resource))
    .filter((resource) => {
      const identity = resourceIdentity(resource)
      if (identities.has(identity)) return false
      identities.add(identity)
      return true
    })

  return shuffle(eligible, random).slice(0, limit)
}

export function resolveStarterSeries(series, configuredSlug = STARTER_SERIES_SLUG) {
  if (!Array.isArray(series) || typeof configuredSlug !== 'string') return null

  const candidate = series.find((item) => item?.slug === configuredSlug)
  if (!candidate || candidate.status === 'draft') return null

  const publishedCount = Number.isInteger(candidate.episodeCount)
    ? candidate.episodeCount
    : Array.isArray(candidate.resources)
      ? candidate.resources.length
      : 0

  return publishedCount > 0 ? candidate : null
}

export function selectFeaturedTopics(resources, configuredSlugs = FEATURED_TOPIC_SLUGS) {
  const availableTopics = getAvailableResourceTopics(resources)
  const byKey = new Map(availableTopics.map((topic) => [topic.key, topic]))

  return (Array.isArray(configuredSlugs) ? configuredSlugs : [])
    .map((slug) => byKey.get(slug))
    .filter(Boolean)
}

export function selectFeaturedSeries(series, configuredSlugs = FEATURED_SERIES_SLUGS) {
  const eligible = (Array.isArray(series) ? series : []).filter(isEligibleSeries)
  const bySlug = new Map(eligible.map((item) => [item.slug, item]))
  const selected = uniqueConfiguredItems(configuredSlugs, bySlug)

  // Keep fallback intentional and deterministic. It is only used to replace a
  // missing configured series, never to recreate a series from legacy fields.
  const fallback = [...eligible].sort((left, right) => left.slug.localeCompare(right.slug))
  for (const item of fallback) {
    if (selected.length >= 3) break
    if (!selected.includes(item)) selected.push(item)
  }

  return selected.slice(0, 3)
}

export function selectDiscoverResources(
  resources,
  { count = 5, excludedResources, random = Math.random } = {},
) {
  const limit = Number.isInteger(count) && count > 0 ? count : 5
  const heroResources = Array.isArray(excludedResources)
    ? excludedResources
    : selectHeroResources(resources)
  const excludedKeys = new Set(heroResources.map(resourceIdentity))
  const eligible = (Array.isArray(resources) ? resources : [])
    .filter(isEligibleResource)
    .filter((resource) => !excludedKeys.has(resourceIdentity(resource)))
  const selected = []

  for (const contentType of ['article', 'infographic', 'prompt']) {
    const candidate = pickRandom(
      eligible.filter((resource) => resource.contentType === contentType && !selected.includes(resource)),
      random,
    )
    if (candidate) selected.push(candidate)
  }

  const remaining = eligible.filter((resource) => !selected.includes(resource))
  while (selected.length < limit && remaining.length > 0) {
    const index = randomIndex(remaining.length, random)
    selected.push(remaining.splice(index, 1)[0])
  }

  return shuffle(selected.slice(0, limit), random)
}

export function buildFormatDestination(format) {
  const params = new URLSearchParams({ format })
  return `${RESOURCES_PATH}?${params.toString()}`
}

function uniqueConfiguredItems(configuredSlugs, bySlug) {
  const selected = []
  for (const slug of Array.isArray(configuredSlugs) ? configuredSlugs : []) {
    const item = bySlug.get(slug)
    if (item && !selected.includes(item)) selected.push(item)
  }
  return selected
}

function isEligibleSeries(series) {
  if (!series?.slug || !series?.name || series.status === 'draft') return false
  const count = Number.isInteger(series.episodeCount)
    ? series.episodeCount
    : Array.isArray(series.resources)
      ? series.resources.length
      : 0
  return count > 0
}

function isEligibleResource(resource) {
  return Boolean(
    resource?.contentType
    && resource?.publicUrl
    && resource.status !== 'draft',
  )
}

function hasUsableThumbnail(resource) {
  return Array.isArray(resource?.thumbnailSources)
    && resource.thumbnailSources.some((source) => Boolean(source?.url))
}

function resourceIdentity(resource) {
  return `${resource?.contentType || ''}:${resource?.id || resource?.publicUrl || ''}`
}

function pickRandom(resources, random) {
  if (resources.length === 0) return null
  return resources[randomIndex(resources.length, random)]
}

function shuffle(resources, random) {
  const shuffled = [...resources]
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = randomIndex(index + 1, random)
    ;[shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]]
  }
  return shuffled
}

function randomIndex(length, random) {
  return Math.min(length - 1, Math.floor(random() * length))
}
