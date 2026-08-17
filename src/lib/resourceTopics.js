export const PUBLIC_TOPIC_ORDER = Object.freeze([
  'fondamentaux-ia',
  'modeles-de-langage',
  'prompting-interaction',
  'rag-recherche-semantique',
  'agents-outils',
  'fiabilite-evaluation',
  'entrainement-adaptation',
  'assistants-programmation',
  'multimodalite',
])

export const FEATURED_TOPIC_SLUGS = Object.freeze([
  'fondamentaux-ia',
  'modeles-de-langage',
  'prompting-interaction',
  'rag-recherche-semantique',
  'fiabilite-evaluation',
  'assistants-programmation',
])

// Every key is a legacy public URL slug. Empty means
// that the legacy filter has no canonical replacement and must be removed.
export const LEGACY_RESOURCE_TOPIC_SLUG_ALIASES = Object.freeze({
  'apprentissage-automatique': 'fondamentaux-ia',
  'assistants-de-programmation': 'assistants-programmation',
  'claude-code': 'assistants-programmation',
  codex: 'assistants-programmation',
  embeddings: 'rag-recherche-semantique',
  'fiabilite-des-modeles-d-ia': 'fiabilite-evaluation',
  'github-copilot': 'assistants-programmation',
  'ia-generative': '',
  'intelligence-artificielle': 'fondamentaux-ia',
  'modeles-de-langage': 'modeles-de-langage',
  'prompt-engineering': 'prompting-interaction',
  prompting: 'prompting-interaction',
  rag: 'rag-recherche-semantique',
  'utilisation-de-l-ia': 'prompting-interaction',
  'utilisation-de-l-ia-generative': '',
})

const ORDER_INDEX = new Map(PUBLIC_TOPIC_ORDER.map((slug, index) => [slug, index]))

export function getAvailableResourceTopics(resources) {
  const topicsBySlug = new Map()

  for (const resource of Array.isArray(resources) ? resources : []) {
    if (resource?.contentType === 'prompt') continue
    const seen = new Set()
    for (const membership of Array.isArray(resource?.topicMemberships) ? resource.topicMemberships : []) {
      const slug = cleanText(membership?.slug)
      const id = cleanText(membership?.topicId) || slug
      if (!slug || !id || seen.has(id)) continue
      seen.add(id)
      const current = topicsBySlug.get(slug)
      if (current) {
        current.count += 1
        continue
      }
      topicsBySlug.set(slug, {
        key: slug,
        topicId: cleanText(membership?.topicId),
        slug,
        nameFr: cleanText(membership?.nameFr),
        nameEn: cleanText(membership?.nameEn),
        count: 1,
      })
    }
  }

  return [...topicsBySlug.values()].sort(comparePublicTopics)
}

export function findResourceTopic(resources, topicKey) {
  const slug = cleanText(topicKey)
  if (!slug) return null
  return getAvailableResourceTopics(resources).find((topic) => topic.slug === slug) || null
}

export function resolveResourceTopicSlug(resources, requestedSlug) {
  const rawSlug = cleanText(requestedSlug)
  if (!rawSlug) return ''
  const canonicalSlug = Object.hasOwn(LEGACY_RESOURCE_TOPIC_SLUG_ALIASES, rawSlug)
    ? LEGACY_RESOURCE_TOPIC_SLUG_ALIASES[rawSlug]
    : rawSlug
  if (!canonicalSlug) return ''
  return findResourceTopic(resources, canonicalSlug) ? canonicalSlug : ''
}

export function matchesResourceTopic(resource, topicKey) {
  const slug = cleanText(topicKey)
  if (!slug) return true
  return (Array.isArray(resource?.topicMemberships) ? resource.topicMemberships : [])
    .some((membership) => cleanText(membership?.slug) === slug)
}

export function getResourceTopicLabel(topic, language = 'fr') {
  const preferred = String(language).toLowerCase().startsWith('en')
    ? cleanText(topic?.nameEn)
    : cleanText(topic?.nameFr)
  return preferred || cleanText(topic?.nameFr) || cleanText(topic?.nameEn) || cleanText(topic?.slug) || cleanText(topic?.key)
}

export function getResourceTopicMembershipLabels(resource, language = 'fr') {
  return (Array.isArray(resource?.topicMemberships) ? resource.topicMemberships : [])
    .map((membership) => getResourceTopicLabel(membership, language))
    .filter(Boolean)
}

function comparePublicTopics(left, right) {
  const leftOrder = ORDER_INDEX.get(left.slug)
  const rightOrder = ORDER_INDEX.get(right.slug)
  if (leftOrder != null || rightOrder != null) {
    if (leftOrder == null) return 1
    if (rightOrder == null) return -1
    return leftOrder - rightOrder
  }
  return getResourceTopicLabel(left, 'fr').localeCompare(
    getResourceTopicLabel(right, 'fr'),
    'fr',
    { sensitivity: 'base' },
  )
}

function cleanText(value) {
  return typeof value === 'string' ? value.trim() : ''
}
