import test from 'node:test'
import assert from 'node:assert/strict'
import {
  buildHeroSearchDestination,
  buildFormatDestination,
  resolveStarterSeries,
  selectDiscoverResources,
  selectFeaturedSeries,
  selectFeaturedTopics,
  selectHeroResources,
} from './homepageCuration.js'

const resource = (id, contentType, publicUrl, thumbnail = true) => ({
  id,
  contentType,
  publicUrl,
  thumbnailSources: thumbnail ? [{ url: `https://example.test/${id}.png` }] : [],
})

test('buildHeroSearchDestination forwards a populated query to the catalog', () => {
  assert.equal(
    buildHeroSearchDestination('agents IA'),
    '/ressources-ia?q=agents+IA',
  )
})

test('buildHeroSearchDestination omits an empty query parameter', () => {
  assert.equal(buildHeroSearchDestination('   '), '/ressources-ia')
})

test('selectHeroResources selects up to three distinct published resources with usable assets', () => {
  const article = resource('article-1', 'article', '/ressources-ia/articles/llm')
  const infographic = resource('infographic-1', 'infographic', '/ressources-ia/infographies/1')
  const prompt = resource('prompt-1', 'prompt', '/ressources-ia/prompts/explain')
  const noImage = resource('article-2', 'article', '/ressources-ia/articles/no-image', false)
  const draft = { ...resource('article-draft', 'article', '/ressources-ia/articles/draft'), status: 'draft' }
  const duplicate = { ...article }

  const selected = selectHeroResources(
    [article, infographic, prompt, noImage, draft, duplicate],
    { random: () => 0 },
  )

  assert.deepEqual(selected, [infographic, prompt, article])
  assert.equal(new Set(selected.map(({ contentType, id }) => `${contentType}:${id}`)).size, 3)
  assert.ok(selected.every((item) => item.status !== 'draft'))
  assert.ok(selected.every((item) => item.thumbnailSources.length > 0))
})

test('selectHeroResources returns fewer cards when fewer eligible resources are available', () => {
  const article = resource('article-1', 'article', '/ressources-ia/articles/llm')
  const noImage = resource('article-2', 'article', '/ressources-ia/articles/no-image', false)

  assert.deepEqual(selectHeroResources([article, noImage], { random: () => 0 }), [article])
  assert.deepEqual(selectHeroResources([], { random: () => 0 }), [])
})

test('resolveStarterSeries resolves only the explicitly curated public series with published members', () => {
  const configured = { slug: 'les-fondamentaux-de-l-ia-generative', episodeCount: 7, status: 'published' }
  assert.equal(resolveStarterSeries([configured]), configured)
  assert.equal(resolveStarterSeries([{ ...configured, episodeCount: 0 }]), null)
  assert.equal(resolveStarterSeries([{ ...configured, status: 'draft' }]), null)
  assert.equal(resolveStarterSeries([{ slug: 'another-series', episodeCount: 7 }]), null)
})

test('selectFeaturedTopics keeps curated order, omits absent topics, and uses calculated counts', () => {
  const resources = [
    { contentType: 'article', topicMemberships: [{ topicId: 'foundation', slug: 'fondamentaux-ia', nameFr: 'Fondamentaux', nameEn: 'AI fundamentals' }] },
    { contentType: 'article', topicMemberships: [{ topicId: 'language', slug: 'modeles-de-langage', nameFr: 'Modeles', nameEn: 'Language models' }] },
    { contentType: 'infographic', topicMemberships: [{ topicId: 'language', slug: 'modeles-de-langage', nameFr: 'Modeles', nameEn: 'Language models' }] },
    { contentType: 'infographic', topicMemberships: [{ topicId: 'rag', slug: 'rag-recherche-semantique', nameFr: 'RAG', nameEn: 'RAG' }] },
  ]

  assert.deepEqual(
    selectFeaturedTopics(resources, ['rag-recherche-semantique', 'modeles-de-langage', 'missing', 'fondamentaux-ia'])
      .map(({ key, count }) => ({ key, count })),
    [
      { key: 'rag-recherche-semantique', count: 1 },
      { key: 'modeles-de-langage', count: 2 },
      { key: 'fondamentaux-ia', count: 1 },
    ],
  )
})

test('selectFeaturedSeries keeps curated order, omits invalid series, and fills only with public series', () => {
  const curated = {
    id: 'curated', slug: 'curated', name: 'Curated', episodeCount: 2,
  }
  const fallback = {
    id: 'fallback', slug: 'fallback', name: 'Fallback', resources: [{ id: 'resource-1' }],
  }
  const invalid = { id: 'invalid', slug: 'invalid', name: 'Invalid', episodeCount: 0 }
  const draft = { id: 'draft', slug: 'draft', name: 'Draft', episodeCount: 2, status: 'draft' }

  assert.deepEqual(
    selectFeaturedSeries([fallback, draft, invalid, curated], ['missing', 'curated']),
    [curated, fallback],
  )
})

test('selectDiscoverResources returns five distinct resources, excludes all three Hero resources, and preserves format diversity', () => {
  const candidates = [
    ...Array.from({ length: 4 }, (_, index) => resource(`article-${index}`, 'article', `/ressources-ia/articles/${index}`)),
    ...Array.from({ length: 3 }, (_, index) => resource(`infographic-${index}`, 'infographic', `/ressources-ia/infographies/${index}`)),
    ...Array.from({ length: 3 }, (_, index) => resource(`prompt-${index}`, 'prompt', `/ressources-ia/prompts/${index}`)),
  ]
  const sourceSnapshot = structuredClone(candidates)
  const excludedResources = [candidates[0], candidates[4], candidates[7]]

  const selected = selectDiscoverResources(candidates, {
    excludedResources,
    random: () => 0,
  })

  assert.equal(selected.length, 5)
  assert.equal(new Set(selected.map(({ contentType, id }) => `${contentType}:${id}`)).size, 5)
  assert.ok(selected.every((item) => !excludedResources.includes(item)))
  assert.deepEqual(new Set(selected.map(({ contentType }) => contentType)), new Set(['article', 'infographic', 'prompt']))
  assert.deepEqual(candidates, sourceSnapshot)
})

test('selectDiscoverResources remains deterministic with an injected random function and handles unavailable formats', () => {
  const candidates = [
    resource('article-1', 'article', '/ressources-ia/articles/1'),
    resource('article-2', 'article', '/ressources-ia/articles/2'),
    resource('infographic-1', 'infographic', '/ressources-ia/infographies/1'),
    resource('infographic-2', 'infographic', '/ressources-ia/infographies/2'),
    resource('infographic-3', 'infographic', '/ressources-ia/infographies/3'),
  ]
  const options = { excludedResources: [], random: () => 0.4 }

  const first = selectDiscoverResources(candidates, options)
  const second = selectDiscoverResources(candidates, options)

  assert.deepEqual(first, second)
  assert.equal(first.length, 5)
  assert.ok(first.every(({ contentType }) => contentType !== 'prompt'))
})

test('selectDiscoverResources returns every eligible candidate when the catalog is smaller than five', () => {
  const candidates = [
    resource('article-1', 'article', '/ressources-ia/articles/1'),
    resource('infographic-1', 'infographic', '/ressources-ia/infographies/1'),
    resource('prompt-1', 'prompt', '/ressources-ia/prompts/1'),
  ]

  assert.equal(selectDiscoverResources(candidates, { excludedResources: [], random: () => 0 }).length, 3)
})

test('buildFormatDestination uses the catalog format values', () => {
  assert.equal(buildFormatDestination('articles'), '/ressources-ia?format=articles')
  assert.equal(buildFormatDestination('infographies'), '/ressources-ia?format=infographies')
  assert.equal(buildFormatDestination('prompt'), '/ressources-ia?format=prompt')
})
