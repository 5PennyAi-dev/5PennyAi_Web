import assert from 'node:assert/strict'
import test from 'node:test'
import {
  FEATURED_TOPIC_SLUGS,
  LEGACY_RESOURCE_TOPIC_SLUG_ALIASES,
  findResourceTopic,
  getAvailableResourceTopics,
  getResourceTopicLabel,
  matchesResourceTopic,
  resolveResourceTopicSlug,
} from './resourceTopics.js'

const topic = (slug, nameFr, nameEn) => ({ topicId: slug, slug, nameFr, nameEn })
const resources = [
  { id: 'article-a', contentType: 'article', theme: 'IA generative', topicMemberships: [topic('modeles-de-langage', 'Modeles de langage', 'Language models'), topic('rag-recherche-semantique', 'RAG et recherche semantique', 'RAG and semantic search')] },
  { id: 'info-a', contentType: 'infographic', theme: 'RAG', topicMemberships: [topic('rag-recherche-semantique', 'RAG et recherche semantique', 'RAG and semantic search')] },
  { id: 'article-b', contentType: 'article', theme: 'Codex', topicMemberships: [topic('fondamentaux-ia', 'Fondamentaux de IA', 'AI fundamentals')] },
  { id: 'prompt-a', contentType: 'prompt', topicMemberships: [] },
]

test('builds public topics from memberships, counts each resource once, and keeps curated order', () => {
  const topics = getAvailableResourceTopics(resources)
  assert.deepEqual(topics.map(({ slug, count }) => ({ slug, count })), [
    { slug: 'fondamentaux-ia', count: 1 },
    { slug: 'modeles-de-langage', count: 1 },
    { slug: 'rag-recherche-semantique', count: 2 },
  ])
  assert.equal(findResourceTopic(resources, 'rag-recherche-semantique')?.nameEn, 'RAG and semantic search')
  assert.equal(getResourceTopicLabel(findResourceTopic(resources, 'modeles-de-langage'), 'en'), 'Language models')
})

test('filters strictly by topic memberships and never by theme', () => {
  assert.equal(matchesResourceTopic(resources[0], 'modeles-de-langage'), true)
  assert.equal(matchesResourceTopic(resources[0], 'fondamentaux-ia'), false)
  assert.equal(matchesResourceTopic(resources[1], 'rag-recherche-semantique'), true)
  assert.equal(matchesResourceTopic({ contentType: 'article', theme: 'RAG', topicMemberships: [] }, 'rag-recherche-semantique'), false)
  assert.equal(matchesResourceTopic(resources[3], 'modeles-de-langage'), false)
})

test('canonicalizes every observed legacy slug or explicitly removes its topic filter', () => {
  const expected = {
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
  }
  assert.deepEqual(LEGACY_RESOURCE_TOPIC_SLUG_ALIASES, expected)
  const allTopics = [...resources, { id: 'extra', contentType: 'article', topicMemberships: Object.values(expected).filter(Boolean).map((slug) => topic(slug, slug, slug)) }]
  for (const [legacy, canonical] of Object.entries(expected)) {
    assert.equal(resolveResourceTopicSlug(allTopics, legacy), canonical, legacy)
  }
  assert.equal(resolveResourceTopicSlug(allTopics, 'unknown-topic'), '')
})

test('keeps the six homepage topics explicitly curated', () => {
  assert.deepEqual(FEATURED_TOPIC_SLUGS, [
    'fondamentaux-ia',
    'modeles-de-langage',
    'prompting-interaction',
    'rag-recherche-semantique',
    'fiabilite-evaluation',
    'assistants-programmation',
  ])
})
