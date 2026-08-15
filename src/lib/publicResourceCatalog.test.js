import test from 'node:test'
import assert from 'node:assert/strict'
import {
  adaptArticleToPublicResource,
  adaptInfographicToPublicResource,
  adaptPromptToPublicResource,
  attachSeriesMemberships,
  buildResourceSearchText,
  filterPublicResources,
  fetchPublicSeriesMembershipRows,
  fetchPublicSeriesRows,
  getCatalogPaginationItems,
  getPublicResourceKey,
  getResourceSeriesDisplay,
  matchesResourceSearch,
  mergePublicResources,
  normalizeCatalogSearchParams,
  paginatePublicResources,
  parseCatalogPage,
  normalizeResourceLevel,
  normalizeResourceFormat,
  normalizeSearchText,
  RESOURCE_FORMATS,
  RESOURCE_PAGE_SIZE,
  sortResourcesByPublishedAt,
  updateCatalogCriteria,
} from './publicResourceCatalog.js'
import {
  getAdjacentEpisodes,
  groupResourcesBySeries,
} from './resourceSeries.js'
import {
  MIXED_SERIES_NAME,
  mixedPublicSeriesFixture,
} from './testFixtures/mixedPublicSeries.js'

const TEST_SERIES = {
  id: 'series-mixed',
  slug: 'parcours-ia-mixte',
  name: MIXED_SERIES_NAME,
}

test('cible les lectures de série par slug, identifiants et ressource sans requête unitaire', async () => {
  const calls = []
  const client = {
    from(table) {
      const query = {
        select(columns) { calls.push([table, 'select', columns]); return this },
        eq(column, value) { calls.push([table, 'eq', column, value]); return this },
        in(column, values) { calls.push([table, 'in', column, values]); return this },
        then(resolve) { return Promise.resolve({ data: [], error: null }).then(resolve) },
      }
      return query
    },
  }

  await fetchPublicSeriesRows(client, { slug: 'parcours-ia' })
  await fetchPublicSeriesRows(client, { ids: ['series-1', 'series-2'] })
  await fetchPublicSeriesMembershipRows(client, {
    resourceId: 'article-1',
    resourceType: 'article',
  })
  await fetchPublicSeriesMembershipRows(client, {
    resourceId: 'infographic-1',
    resourceType: 'infographic',
  })
  await fetchPublicSeriesMembershipRows(client, { seriesIds: ['series-1', 'series-2'] })

  assert.deepEqual(calls.filter(([, method]) => method === 'eq'), [
    ['resource_series', 'eq', 'slug', 'parcours-ia'],
    ['resource_series_memberships', 'eq', 'article_id', 'article-1'],
    ['resource_series_memberships', 'eq', 'infographic_id', 'infographic-1'],
  ])
  assert.deepEqual(calls.filter(([, method]) => method === 'in'), [
    ['resource_series', 'in', 'id', ['series-1', 'series-2']],
    ['resource_series_memberships', 'in', 'series_id', ['series-1', 'series-2']],
  ])
})

test('adapte une infographie complète avec thumbnail prioritaire et URL publique', () => {
  const resource = adaptInfographicToPublicResource({
    id: 'info-1',
    title: 'Infographie',
    subtitle: 'Sous-titre',
    summary: 'Résumé',
    theme: 'RAG',
    level: 'beginner',
    keywords: ['rag', ' recherche '],
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
  assert.deepEqual(resource.seriesMemberships, [])
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

test('adapte un prompt de catalogue sans lui inventer de sujet ou de série', () => {
  const resource = adaptPromptToPublicResource({
    id: 'prompt-1',
    slug: 'comparer-options',
    title: 'Comparer deux options',
    summary: 'Préparer une décision.',
    category: 'decide',
    level: 'beginner',
    contexts: ['work', 'daily_life'],
    keywords: ['choix'],
    published_at: '2026-01-02T00:00:00Z',
    thumbnail_path: 'prompts/prompt-1/thumbnail/image.webp',
  }, { thumbnailUrl: 'signed:prompt-cover' })

  assert.equal(resource.contentType, 'prompt')
  assert.equal(resource.publicUrl, '/ressources-ia/prompts/comparer-options')
  assert.equal(resource.thumbnailUrl, 'signed:prompt-cover')
  assert.deepEqual(resource.contexts, ['work', 'daily_life'])
  assert.equal('theme' in resource, false)
  assert.equal('seriesName' in resource, false)
  assert.equal('episodeNumber' in resource, false)
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

test('fusionne les trois formats par date et exclut les brouillons Prompt', () => {
  const catalog = mergePublicResources({
    infographicRows: [{ id: 'info', status: 'published', published_at: '2026-01-01' }],
    articleRows: [{ id: 'article', status: 'published', published_at: '2026-01-03' }],
    promptRows: [
      { id: 'prompt', slug: 'prompt', status: 'published', published_at: '2026-01-02' },
      { id: 'draft', slug: 'draft', status: 'draft', published_at: '2026-01-04' },
    ],
  })
  assert.deepEqual(catalog.resources.map(getPublicResourceKey), [
    'article:article', 'prompt:prompt', 'infographic:info',
  ])
  assert.deepEqual(catalog.prompts.map(({ id }) => id), ['prompt'])
})

test('attache zéro, une ou plusieurs séries sans dupliquer les ressources et ignore les orphelins', () => {
  const resources = [
    { id: 'article-none', contentType: 'article' },
    { id: 'article-shared', contentType: 'article' },
    { id: 'info-shared', contentType: 'infographic' },
    { id: 'prompt', contentType: 'prompt' },
  ]
  const secondSeries = { id: 'series-second', slug: 'second', name: 'Deuxième' }
  const attached = attachSeriesMemberships(resources, [TEST_SERIES, secondSeries], [
    { id: 'm1', series_id: TEST_SERIES.id, article_id: 'article-shared', position: 3 },
    { id: 'm2', series_id: secondSeries.id, article_id: 'article-shared', position: 1 },
    { id: 'm3', series_id: TEST_SERIES.id, infographic_id: 'info-shared', position: null },
    { id: 'orphan-series', series_id: 'missing', article_id: 'article-shared', position: 2 },
    { id: 'orphan-resource', series_id: TEST_SERIES.id, article_id: 'missing', position: 2 },
    { id: 'invalid-two-fks', series_id: TEST_SERIES.id, article_id: 'article-shared', infographic_id: 'info-shared', position: 2 },
  ])

  assert.equal(attached.length, resources.length)
  assert.deepEqual(attached.find(({ id }) => id === 'article-none').seriesMemberships, [])
  assert.equal(attached.find(({ id }) => id === 'article-shared').seriesMemberships.length, 2)
  assert.equal(attached.find(({ id }) => id === 'info-shared').seriesMemberships[0].position, null)
  assert.deepEqual(attached.find(({ id }) => id === 'prompt').seriesMemberships, [])
})

test('présente une série unique, un résumé multi-séries et le membership filtré exact', () => {
  const alpha = membership({ ...TEST_SERIES, name: 'Alpha' }, 3)
  const beta = membership({ id: 'beta', slug: 'beta', name: 'Bêta' }, 1)

  assert.deepEqual(getResourceSeriesDisplay({ seriesMemberships: [alpha] }), {
    membership: alpha,
    additionalCount: 0,
    position: 3,
  })
  assert.deepEqual(getResourceSeriesDisplay({ seriesMemberships: [alpha, beta] }), {
    membership: alpha,
    additionalCount: 1,
    position: null,
  })
  assert.deepEqual(getResourceSeriesDisplay({ seriesMemberships: [alpha, beta] }, 'beta'), {
    membership: beta,
    additionalCount: 0,
    position: 1,
  })
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
  assert.equal(normalizeResourceFormat(RESOURCE_FORMATS.PROMPTS, true, false), RESOURCE_FORMATS.ALL)
  assert.equal(normalizeResourceFormat(RESOURCE_FORMATS.PROMPTS, true, true), RESOURCE_FORMATS.PROMPTS)
  assert.equal(filterPublicResources(catalog.resources).length, 4)
  assert.equal(filterPublicResources(catalog.resources, { format: RESOURCE_FORMATS.INFOGRAPHICS }).length, 2)
  assert.equal(filterPublicResources(catalog.resources, { format: RESOURCE_FORMATS.ARTICLES }).length, 2)

  const combined = filterPublicResources(catalog.resources, {
    format: RESOURCE_FORMATS.ARTICLES,
    seriesSlug: 'parcours-ia-mixte',
  })
  assert.deepEqual(combined.map(({ id }) => id), ['article-2', 'article-extra'])

  const independent = { id: 'standalone', contentType: 'article', seriesMemberships: [] }
  assert.equal(filterPublicResources([...catalog.resources, independent]).includes(independent), true)
})

test('combine format Prompt, catégorie, niveau et recherche avec une logique AND', () => {
  const prompts = [
    {
      id: 'matching', contentType: 'prompt', title: 'Comparer des options', summary: 'Choisir clairement',
      category: 'decide', level: 'beginner', contexts: ['work'], keywords: ['priorités'],
    },
    {
      id: 'wrong-level', contentType: 'prompt', title: 'Comparer des options',
      category: 'decide', level: 'advanced', contexts: ['work'],
    },
    {
      id: 'wrong-category', contentType: 'prompt', title: 'Comparer des options',
      category: 'think', level: 'beginner', contexts: ['work'],
    },
    { id: 'article', contentType: 'article', title: 'Comparer des options', level: 'beginner' },
  ]
  const labels = (resource) => resource.id === 'matching' ? ['Décider', 'Travail'] : []

  assert.deepEqual(filterPublicResources(prompts, {
    format: RESOURCE_FORMATS.PROMPTS,
    category: 'decide',
    level: 'beginner',
    query: 'décider travail priorités',
    getPromptTaxonomyLabels: labels,
  }).map(({ id }) => id), ['matching'])
  assert.equal(matchesResourceSearch(prompts[0], 'comparer choisir'), true)
  assert.equal(matchesResourceSearch(prompts[0], 'explique'), false)
})

test('normalise atomiquement les paramètres incompatibles du mode Prompt', () => {
  const promptParams = new URLSearchParams(
    'format=prompt&categorie=decide&niveau=beginner&q=options&sujet=prompting&serie=parcours',
  )
  const promptResult = normalizeCatalogSearchParams(promptParams, {
    hasPublishedArticles: true,
    hasPublishedPrompts: true,
    hasValidTopic: true,
  })
  assert.equal(promptResult.hasChanges, true)
  assert.equal(
    promptResult.nextParams.toString(),
    'format=prompt&categorie=decide&niveau=beginner&q=options',
  )

  const invalidCategory = normalizeCatalogSearchParams(
    new URLSearchParams('format=prompt&categorie=foobar'),
    { hasPublishedPrompts: true },
  )
  assert.equal(invalidCategory.nextParams.toString(), 'format=prompt')

  const articleResult = normalizeCatalogSearchParams(
    new URLSearchParams('format=articles&categorie=write&sujet=prompting'),
    { hasPublishedArticles: true, hasValidTopic: true },
  )
  assert.equal(articleResult.nextParams.toString(), 'format=articles&sujet=prompting')
})

test('pagine 12 résultats sur une page et 13 résultats sur deux pages', () => {
  const twelve = Array.from({ length: 12 }, (_, index) => ({ id: index + 1 }))
  const thirteen = [...twelve, { id: 13 }]

  assert.equal(RESOURCE_PAGE_SIZE, 12)
  assert.deepEqual(paginatePublicResources(twelve, 1), {
    currentPage: 1,
    resources: twelve,
    totalPages: 1,
    totalResults: 12,
  })

  const firstPage = paginatePublicResources(thirteen, 1)
  const lastPage = paginatePublicResources(thirteen, 2)
  assert.equal(firstPage.totalPages, 2)
  assert.deepEqual(firstPage.resources.map(({ id }) => id), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])
  assert.deepEqual(lastPage.resources.map(({ id }) => id), [13])
})

test('calcule les pages sans page vide et conserve l’ordre du résultat final', () => {
  const resources = Array.from({ length: 24 }, (_, index) => ({ id: `resource-${index + 1}` }))
  const result = paginatePublicResources(resources, 2)

  assert.equal(result.totalPages, 2)
  assert.deepEqual(
    result.resources.map(({ id }) => id),
    resources.slice(12).map(({ id }) => id),
  )
})

test('normalise les pages invalides et borne une page supérieure au maximum', () => {
  for (const value of ['0', '-1', 'abc', '1.5', '', '999999999999999999999']) {
    assert.equal(parseCatalogPage(value), 1, value)
  }
  assert.equal(parseCatalogPage('2'), 2)

  const invalid = normalizeCatalogSearchParams(new URLSearchParams('q=rag&page=abc'), {
    totalPages: 3,
  })
  assert.equal(invalid.nextParams.toString(), 'q=rag')

  const overflow = normalizeCatalogSearchParams(new URLSearchParams('format=prompt&page=8'), {
    hasPublishedPrompts: true,
    totalPages: 4,
  })
  assert.equal(overflow.nextParams.toString(), 'format=prompt&page=4')
  assert.equal(paginatePublicResources(Array.from({ length: 48 }), 8).currentPage, 4)
})

test('canonise la page 1 et restaure une combinaison de paramètres valide', () => {
  const pageOne = normalizeCatalogSearchParams(
    new URLSearchParams('format=articles&niveau=beginner&q=embedding&page=1'),
    { hasPublishedArticles: true, totalPages: 3 },
  )
  assert.equal(pageOne.nextParams.toString(), 'format=articles&niveau=beginner&q=embedding')

  const restored = normalizeCatalogSearchParams(
    new URLSearchParams('format=prompt&categorie=write&niveau=beginner&q=texte&page=2'),
    { hasPublishedPrompts: true, totalPages: 3 },
  )
  assert.equal(
    restored.nextParams.toString(),
    'format=prompt&categorie=write&niveau=beginner&q=texte&page=2',
  )
})

test('retire atomiquement page lors d’un changement ou retrait de critère', () => {
  const initial = new URLSearchParams('q=rag&niveau=beginner&serie=parcours&page=3')

  assert.equal(
    updateCatalogCriteria(initial, { q: 'embedding' }).toString(),
    'q=embedding&niveau=beginner&serie=parcours',
  )
  assert.equal(
    updateCatalogCriteria(initial, { niveau: 'advanced' }).toString(),
    'q=rag&niveau=advanced&serie=parcours',
  )
  assert.equal(
    updateCatalogCriteria(initial, { serie: null }).toString(),
    'q=rag&niveau=beginner',
  )
})

test('retire page de la vue Séries et compacte les grandes paginations', () => {
  const seriesView = normalizeCatalogSearchParams(
    new URLSearchParams('vue=series&page=4&q=rag'),
    { isSeriesView: true, totalPages: 12 },
  )
  assert.equal(seriesView.nextParams.toString(), 'vue=series')
  assert.deepEqual(getCatalogPaginationItems(1, 1), [])
  assert.deepEqual(getCatalogPaginationItems(5, 12), [1, 'ellipsis-1', 4, 5, 6, 'ellipsis-6', 12])
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
    seriesMemberships: [membership({ ...TEST_SERIES, name: 'Parcours découverte' }, 1)],
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
      seriesMemberships: [membership({ ...TEST_SERIES, slug: 'parcours-rag', name: 'Parcours RAG' }, null)], publishedAt: '2026-02-02T00:00:00Z',
    },
    {
      id: 'first', contentType: 'article', title: 'RAG débutant', level: 'beginner',
      seriesMemberships: [membership({ ...TEST_SERIES, slug: 'parcours-rag', name: 'Parcours RAG' }, 1)], publishedAt: '2026-02-01T00:00:00Z',
    },
    {
      id: 'second', contentType: 'infographic', title: 'Documents RAG', level: 'intermediate',
      seriesMemberships: [membership({ ...TEST_SERIES, slug: 'parcours-rag', name: 'Parcours RAG' }, 2)], publishedAt: '2026-01-01T00:00:00Z',
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
      seriesMemberships: [membership({ ...TEST_SERIES, slug: 'parcours-ia', name: 'Parcours IA' }, 1)], publishedAt: '2026-01-01T00:00:00Z',
    },
    {
      id: 'second', contentType: 'infographic', title: 'Utilisation de l’IA générative', theme: 'Utilisation de l’IA générative', level: 'beginner',
      seriesMemberships: [membership({ ...TEST_SERIES, slug: 'parcours-ia', name: 'Parcours IA' }, 2)], publishedAt: '2026-01-02T00:00:00Z',
    },
    {
      id: 'third', contentType: 'infographic', title: 'Prompting', theme: 'Prompting', level: 'advanced',
      seriesMemberships: [membership({ ...TEST_SERIES, slug: 'parcours-ia', name: 'Parcours IA' }, 3)], publishedAt: '2026-01-03T00:00:00Z',
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
    seriesRows: [TEST_SERIES],
    membershipRows: mixedPublicSeriesFixture.memberships,
  })
}

function membership(series, position) {
  return {
    membershipId: `${series.id}:${position ?? 'null'}`,
    seriesId: series.id,
    slug: series.slug,
    name: series.name,
    position,
  }
}
