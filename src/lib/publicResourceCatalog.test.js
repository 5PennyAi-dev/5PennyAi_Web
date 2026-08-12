import test from 'node:test'
import assert from 'node:assert/strict'
import {
  adaptArticleToPublicResource,
  adaptInfographicToPublicResource,
  buildResourceSearchText,
  filterPublicResources,
  getPublicResourceKey,
  matchesResourceSearch,
  mergePublicResources,
  normalizeResourceLevel,
  normalizeResourceFormat,
  normalizeSearchText,
  RESOURCE_FORMATS,
  sortResourcesByPublishedAt,
} from './publicResourceCatalog.js'
import {
  getAdjacentEpisodes,
  groupResourcesBySeries,
} from './resourceSeries.js'
import {
  MIXED_SERIES_NAME,
  mixedPublicSeriesFixture,
} from './testFixtures/mixedPublicSeries.js'

test('adapte une infographie complète avec thumbnail prioritaire et URL publique', () => {
  const resource = adaptInfographicToPublicResource({
    id: 'info-1',
    title: 'Infographie',
    subtitle: 'Sous-titre',
    summary: 'Résumé',
    theme: 'RAG',
    level: 'beginner',
    keywords: ['rag', ' recherche '],
    series_name: 'Série',
    episode_number: 1,
    published_at: '2026-01-01T00:00:00Z',
    reading_time_minutes: 4,
    thumbnail_path: 'thumbnail.webp',
    image_path: 'original.webp',
  }, { getImageUrl: (path) => `public:${path}` })

  assert.equal(resource.contentType, 'infographic')
  assert.equal(resource.subtitle, 'Sous-titre')
  assert.deepEqual(resource.keywords, ['rag', 'recherche'])
  assert.equal(resource.thumbnailUrl, 'public:thumbnail.webp')
  assert.deepEqual(resource.thumbnailSources.map(({ kind }) => kind), ['thumbnail', 'fallback'])
  assert.equal(resource.publicUrl, '/ressources-ia/infographies/info-1')
  assert.equal(resource.seriesName, 'Série')
})

test('utilise l’image originale comme fallback de catalogue d’une infographie', () => {
  const resource = adaptInfographicToPublicResource(
    { id: 'info-2', image_path: 'original.webp' },
    { getImageUrl: (path) => `public:${path}` },
  )
  assert.equal(resource.thumbnailUrl, 'public:original.webp')
  assert.equal(resource.thumbnailSources[0].kind, 'fallback')
})

test('adapte un article avec ou sans couverture sans inventer les métadonnées', () => {
  const row = {
    id: 'article-1',
    slug: 'article-public',
    title: null,
    subtitle: null,
    keywords: null,
    cover_path: 'cover.webp',
    content_markdown: 'Contenu',
  }
  const withCover = adaptArticleToPublicResource(row, {
    coverUrl: 'signed:cover.webp',
    readingTime: () => 3,
  })
  const withoutCover = adaptArticleToPublicResource(row, { readingTime: () => 3 })

  assert.equal(withCover.contentType, 'article')
  assert.equal(withCover.subtitle, '')
  assert.deepEqual(withCover.keywords, [])
  assert.equal(withCover.thumbnailUrl, 'signed:cover.webp')
  assert.equal(withCover.publicUrl, '/ressources-ia/articles/article-public')
  assert.equal(withCover.readingTimeMinutes, 3)
  assert.equal(withCover.title, null)
  assert.equal(withoutCover.thumbnailUrl, null)
  assert.deepEqual(withoutCover.thumbnailSources, [])
})

test('fusionne, exclut le brouillon et trie le catalogue par publication décroissante', () => {
  const catalog = createMixedCatalog()
  assert.deepEqual(catalog.resources.map(getPublicResourceKey), [
    'article:article-extra',
    'infographic:infographic-3',
    'article:article-2',
    'infographic:infographic-1',
  ])
  assert.equal(catalog.articles.some(({ id }) => id === 'article-draft'), false)
})

test('place les dates absentes ou invalides à la fin de façon stable', () => {
  const resources = [
    { id: 'valid', contentType: 'article', title: 'Z', publishedAt: '2026-01-01' },
    { id: 'missing-b', contentType: 'article', title: 'B', publishedAt: null },
    { id: 'missing-a', contentType: 'infographic', title: 'A', publishedAt: 'invalid' },
  ]
  assert.deepEqual(sortResourcesByPublishedAt(resources).map(getPublicResourceKey), [
    'article:valid',
    'infographic:missing-a',
    'article:missing-b',
  ])
})

test('distingue l’identité React de deux formats partageant le même identifiant', () => {
  assert.notEqual(
    getPublicResourceKey({ id: 'shared', contentType: 'article' }),
    getPublicResourceKey({ id: 'shared', contentType: 'infographic' }),
  )
})

test('normalise et combine les filtres de format et de série', () => {
  const catalog = createMixedCatalog()
  assert.equal(normalizeResourceFormat('inconnu'), RESOURCE_FORMATS.ALL)
  assert.equal(normalizeResourceFormat(RESOURCE_FORMATS.ARTICLES, false), RESOURCE_FORMATS.ALL)
  assert.equal(filterPublicResources(catalog.resources).length, 4)
  assert.equal(filterPublicResources(catalog.resources, { format: RESOURCE_FORMATS.INFOGRAPHICS }).length, 2)
  assert.equal(filterPublicResources(catalog.resources, { format: RESOURCE_FORMATS.ARTICLES }).length, 2)

  const combined = filterPublicResources(catalog.resources, {
    format: RESOURCE_FORMATS.ARTICLES,
    seriesSlug: 'parcours-ia-mixte',
  })
  assert.deepEqual(combined.map(({ id }) => id), ['article-2', 'article-extra'])

  const independent = { id: 'standalone', contentType: 'article', seriesName: null }
  assert.equal(filterPublicResources([...catalog.resources, independent]).includes(independent), true)
})

test('forme une série mixte unique et résout l’adjacence entre formats', () => {
  const catalog = createMixedCatalog()
  const [series] = groupResourcesBySeries(catalog.resources)

  assert.equal(series.name, MIXED_SERIES_NAME)
  assert.equal(series.episodeCount, 4)
  assert.equal(series.commonLevel, 'beginner')
  assert.equal(series.latestActivity, '2026-01-04T12:00:00Z')
  assert.deepEqual(series.resources.map(getPublicResourceKey), [
    'infographic:infographic-1',
    'article:article-2',
    'infographic:infographic-3',
    'article:article-extra',
  ])
  assert.deepEqual(series.previews.map(({ contentType }) => contentType), [
    'infographic', 'article', 'infographic',
  ])

  const afterFirst = getAdjacentEpisodes(series.resources, {
    id: 'infographic-1',
    contentType: 'infographic',
  })
  assert.equal(afterFirst.previous, null)
  assert.equal(afterFirst.next.publicUrl, '/ressources-ia/articles/comprendre-le-parcours')

  const aroundArticle = getAdjacentEpisodes(series.resources, {
    id: 'article-2',
    contentType: 'article',
  })
  assert.equal(aroundArticle.previous.publicUrl, '/ressources-ia/infographies/infographic-1')
  assert.equal(aroundArticle.next.publicUrl, '/ressources-ia/infographies/infographic-3')
  assert.deepEqual(getAdjacentEpisodes(series.resources, { id: 'missing', contentType: 'article' }), {
    previous: null,
    next: null,
  })
})

test('normalizes search text and matches public resource fields', () => {
  assert.equal(normalizeSearchText('  GÉNÉRATIVE   IA  '), 'generative ia')
  assert.equal(normalizeSearchText(null), '')

  const resource = {
    title: 'Introduction au RAG',
    subtitle: 'Recherche augmentée',
    summary: 'Des documents utiles pour votre assistant.',
    theme: 'IA générative',
    seriesName: 'Parcours découverte',
    keywords: ['embeddings', 'base vectorielle'],
  }

  assert.equal(buildResourceSearchText(resource).includes('generative'), true)
  for (const query of ['rag', 'augmentee', 'documents', 'generative', 'decouverte', 'vectorielle']) {
    assert.equal(matchesResourceSearch(resource, query), true, query)
  }
  assert.equal(matchesResourceSearch(resource, 'rag documents'), true)
  assert.equal(matchesResourceSearch(resource, 'rag absent'), false)
  assert.equal(matchesResourceSearch(resource, '   '), true)
})

test('combines search, level, format and series without changing series order', () => {
  const resources = [
    {
      id: 'latest', contentType: 'article', title: 'RAG documents', level: 'intermediate',
      seriesName: 'Parcours RAG', publishedAt: '2026-02-02T00:00:00Z',
    },
    {
      id: 'first', contentType: 'article', title: 'RAG débutant', level: 'beginner',
      seriesName: 'Parcours RAG', episodeNumber: 1, publishedAt: '2026-02-01T00:00:00Z',
    },
    {
      id: 'second', contentType: 'infographic', title: 'Documents RAG', level: 'intermediate',
      seriesName: 'Parcours RAG', episodeNumber: 2, publishedAt: '2026-01-01T00:00:00Z',
    },
  ]

  assert.deepEqual(filterPublicResources(resources, {
    query: 'rag documents',
    level: 'intermediate',
    format: RESOURCE_FORMATS.INFOGRAPHICS,
    seriesSlug: 'parcours-rag',
  }).map(({ id }) => id), ['second'])
  assert.deepEqual(
    filterPublicResources(resources, { query: 'rag', level: 'beginner' }).map(({ id }) => id),
    ['first'],
  )
  assert.deepEqual(
    filterPublicResources(resources, { query: 'documents', format: RESOURCE_FORMATS.ARTICLES }).map(({ id }) => id),
    ['latest'],
  )
  assert.deepEqual(
    filterPublicResources(resources, { query: 'documents', seriesSlug: 'parcours-rag' }).map(({ id }) => id),
    ['second', 'latest'],
  )
  assert.deepEqual(
    filterPublicResources(resources, { level: 'intermediate', format: RESOURCE_FORMATS.ARTICLES }).map(({ id }) => id),
    ['latest'],
  )
  assert.deepEqual(
    filterPublicResources(resources, { level: 'intermediate', seriesSlug: 'parcours-rag' }).map(({ id }) => id),
    ['second', 'latest'],
  )
  assert.equal(normalizeResourceLevel('advanced'), 'advanced')
  assert.equal(normalizeResourceLevel('unknown'), '')
  assert.deepEqual(
    filterPublicResources(resources, { level: 'unknown' }).map(({ id }) => id),
    ['latest', 'first', 'second'],
  )
  assert.deepEqual(
    filterPublicResources(resources, { seriesSlug: 'parcours-rag' }).map(({ id }) => id),
    ['first', 'second', 'latest'],
  )
})

test('filters each valid level and excludes resources without a selected level', () => {
  const resources = [
    { id: 'beginner', level: 'beginner' },
    { id: 'intermediate', level: 'intermediate' },
    { id: 'advanced', level: 'advanced' },
    { id: 'none', level: null },
  ]

  for (const level of ['beginner', 'intermediate', 'advanced']) {
    assert.deepEqual(filterPublicResources(resources, { level }).map(({ id }) => id), [level])
  }
  assert.deepEqual(filterPublicResources(resources).map(({ id }) => id), [
    'beginner', 'intermediate', 'advanced', 'none',
  ])
})

test('combines topic with the existing resource filters without changing series order', () => {
  const resources = [
    {
      id: 'first', contentType: 'article', title: 'IA générative', theme: 'IA générative', level: 'beginner',
      seriesName: 'Parcours IA', episodeNumber: 1, publishedAt: '2026-01-01T00:00:00Z',
    },
    {
      id: 'second', contentType: 'infographic', title: 'Utilisation de l’IA générative', theme: 'Utilisation de l’IA générative', level: 'beginner',
      seriesName: 'Parcours IA', episodeNumber: 2, publishedAt: '2026-01-02T00:00:00Z',
    },
    {
      id: 'third', contentType: 'infographic', title: 'Prompting', theme: 'Prompting', level: 'advanced',
      seriesName: 'Parcours IA', episodeNumber: 3, publishedAt: '2026-01-03T00:00:00Z',
    },
  ]

  assert.deepEqual(filterPublicResources(resources, {
    topic: 'ia-generative', query: 'ia', level: 'beginner', seriesSlug: 'parcours-ia',
  }).map(({ id }) => id), ['first', 'second'])
  assert.deepEqual(filterPublicResources(resources, {
    topic: 'ia-generative', format: RESOURCE_FORMATS.INFOGRAPHICS,
  }).map(({ id }) => id), ['second'])
  assert.deepEqual(filterPublicResources(resources, { topic: 'prompting' }).map(({ id }) => id), ['third'])
})

function createMixedCatalog() {
  return mergePublicResources({
    infographicRows: mixedPublicSeriesFixture.infographics,
    articleRows: mixedPublicSeriesFixture.articles,
    articleCoverUrls: { 'article-2': 'signed:article-cover' },
    getInfographicImageUrl: (path) => `public:${path}`,
    calculateArticleReadingTime: () => 2,
  })
}
