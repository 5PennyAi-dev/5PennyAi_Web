import test from 'node:test'
import assert from 'node:assert/strict'
import {
  getSeriesFormatKey,
  loadHomeResourceShowcase,
  selectHomeSecondaryResources,
} from './homeResourceShowcase.js'

test('sélectionne la série active et les ressources les plus récentes de chaque format', async () => {
  const coverRequests = []
  const result = await loadHomeResourceShowcase({
    client: {},
    fetchInfographics: async () => [
      {
        id: 'info-new',
        status: 'published',
        title: 'Infographie récente',
        published_at: '2026-08-03T00:00:00Z',
        thumbnail_path: 'thumbnails/infographics/info-new/card.webp',
      },
      {
        id: 'info-draft',
        status: 'draft',
        title: 'Brouillon',
        published_at: '2026-08-05T00:00:00Z',
      },
    ],
    fetchArticles: async () => [
      {
        id: 'article-new',
        status: 'published',
        slug: 'article-recent',
        title: 'Article récent',
        published_at: '2026-08-04T00:00:00Z',
        cover_path: 'articles/article-new/cover/card.webp',
      },
    ],
    fetchArticleCovers: async (rows) => {
      coverRequests.push(...rows.map(({ id }) => id))
      return { 'article-new': 'signed:article-new' }
    },
    fetchSeries: async () => [{
      id: 'foundations', slug: 'fondations-ia', name: 'Fondations IA',
      thumbnail_path: 'thumbnails/series/fondations-ia/cover.webp',
    }],
    fetchMemberships: async () => [
      { id: 'ma', series_id: 'foundations', article_id: 'article-new', position: 1 },
      { id: 'mi', series_id: 'foundations', infographic_id: 'info-new', position: 2 },
    ],
    getInfographicImageUrl: (path) => 'public:' + path,
  })

  assert.equal(result.featuredSeries.name, 'Fondations IA')
  assert.equal(result.featuredSeries.thumbnailPath, 'thumbnails/series/fondations-ia/cover.webp')
  assert.equal(result.featuredSeries.episodeCount, 2)
  assert.equal(getSeriesFormatKey(result.featuredSeries), 'mixed')
  assert.deepEqual(
    result.secondaryResources.map(({ id }) => id),
    ['article-new', 'info-new'],
  )
  assert.equal(result.secondaryResources[0].thumbnailUrl, 'signed:article-new')
  assert.equal(result.secondaryResources[0].publicUrl, '/ressources-ia/articles/article-recent')
  assert.equal(result.secondaryResources[1].publicUrl, '/ressources-ia/infographies/info-new')
  assert.equal(result.resources.some(({ id }) => id === 'info-draft'), false)
  assert.deepEqual(coverRequests, ['article-new'])
  assert.equal(result.partial, false)
})

test('remplace le format absent par une autre ressource publiée sans espace vide', async () => {
  const result = await loadHomeResourceShowcase({
    client: {},
    fetchInfographics: async () => {
      throw new Error('infographics unavailable')
    },
    fetchArticles: async () => [
      {
        id: 'article-2',
        status: 'published',
        slug: 'deux',
        title: 'Deux',
        published_at: '2026-08-02T00:00:00Z',
      },
      {
        id: 'article-1',
        status: 'published',
        slug: 'un',
        title: 'Un',
        published_at: '2026-08-01T00:00:00Z',
      },
    ],
    fetchArticleCovers: async () => ({}),
    fetchSeries: async () => [],
    fetchMemberships: async () => [],
    logger: { warn() {} },
  })

  assert.equal(result.partial, true)
  assert.equal(result.featuredSeries, null)
  assert.deepEqual(result.secondaryResources.map(({ id }) => id), ['article-2', 'article-1'])
})

test('retourne une seule carte lorsqu’une seule ressource est disponible', () => {
  const onlyResource = {
    id: 'only',
    contentType: 'infographic',
    publishedAt: '2026-08-01T00:00:00Z',
  }
  assert.deepEqual(selectHomeSecondaryResources([onlyResource]), [onlyResource])
})

test('échoue seulement lorsque les deux lectures publiques échouent', async () => {
  await assert.rejects(
    loadHomeResourceShowcase({
      client: {},
      fetchInfographics: async () => {
        throw new Error('infographics unavailable')
      },
      fetchArticles: async () => {
        throw new Error('articles unavailable')
      },
      fetchSeries: async () => [],
      fetchMemberships: async () => [],
      logger: { warn() {} },
    }),
    /Unable to load public resources/,
  )
})
