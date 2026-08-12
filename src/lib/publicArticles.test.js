import test from 'node:test'
import assert from 'node:assert/strict'
import {
  fetchPublishedArticlesForCatalog,
  fetchPublishedArticlesForShowcase,
  getArticleInfographicDownloadFileName,
  loadPublishedArticleBySlug,
  normalizePublicArticleSlug,
  sanitizePublishedArticle,
} from './publicArticles.js'

const ARTICLE_ID = '11111111-1111-4111-8111-111111111111'
const FILE_ID = '22222222-2222-4222-8222-222222222222'
const COVER_PATH = `articles/${ARTICLE_ID}/cover/${FILE_ID}.webp`
const MEDIA_PATH = `articles/${ARTICLE_ID}/media/schema-rag/${FILE_ID}.png`
const INFOGRAPHIC_PATH = `articles/${ARTICLE_ID}/infographic/${FILE_ID}.webp`

test('normalise le slug public et filtre explicitement par slug et statut publié', async () => {
  const calls = []
  const client = createPublicClient(calls, { article: publishedRow() })
  const result = await loadPublishedArticleBySlug(' Mon-Article ', client)
  assert.equal(result.state, 'found')
  assert.deepEqual(calls.filter(([table, method]) => table === 'articles' && method === 'eq'), [
    ['articles', 'eq', 'slug', 'mon-article'],
    ['articles', 'eq', 'status', 'published'],
  ])
  assert.equal(calls.some((call) => call.includes('id') && call.includes(ARTICLE_ID)), false)
})

test('la requête de catalogue sélectionne les colonnes publiques et filtre les publications', async () => {
  const calls = []
  const row = publishedRow()
  const result = await fetchPublishedArticlesForCatalog(createPublicClient(calls, {
    catalogRows: [row],
  }))

  const selectCall = calls.find(([table, method]) => table === 'articles' && method === 'select')
  assert.match(selectCall[2], /id, slug, title/)
  assert.match(selectCall[2], /subtitle/)
  assert.match(selectCall[2], /keywords/)
  assert.match(selectCall[2], /content_markdown/)
  assert.equal(selectCall[2].includes('media'), false)
  assert.equal(selectCall[2].includes('seo'), false)
  assert.equal(selectCall[2].includes('infographic_path'), false)
  assert.deepEqual(calls.filter(([table, method]) => table === 'articles' && method === 'eq'), [
    ['articles', 'eq', 'status', 'published'],
  ])
  assert.equal(result.rows.length, 1)
  assert.equal(result.coverUrls[ARTICLE_ID], `signed:${COVER_PATH}`)
})

test('la requête d’accueil exclut le Markdown et filtre les publications', async () => {
  const calls = []
  await fetchPublishedArticlesForShowcase(createPublicClient(calls, { catalogRows: [] }))

  const selectCall = calls.find(([table, method]) => table === 'articles' && method === 'select')
  assert.ok(selectCall[2].includes('cover_path'))
  assert.equal(selectCall[2].includes('content_markdown'), false)
  assert.equal(selectCall[2].includes('infographic_path'), false)
  assert.deepEqual(calls.filter(([table, method]) => table === 'articles' && method === 'eq'), [
    ['articles', 'eq', 'status', 'published'],
  ])
})

test('la requête de série d’articles conserve le filtre publié et le nom exact', async () => {
  const calls = []
  await fetchPublishedArticlesForCatalog(createPublicClient(calls, { catalogRows: [] }), {
    seriesName: ' Série Alpha ',
  })
  assert.deepEqual(calls.filter(([table, method]) => table === 'articles' && method === 'eq'), [
    ['articles', 'eq', 'status', 'published'],
    ['articles', 'eq', 'series_name', 'Série Alpha'],
  ])
})

test('exclut brouillon, slug inconnu et slug invalide avec le même état neutre', async () => {
  for (const [slug, article] of [
    ['mon-article', { ...publishedRow(), status: 'draft' }],
    ['inconnu', publishedRow()],
    ['---', publishedRow()],
  ]) {
    const result = await loadPublishedArticleBySlug(slug, createPublicClient([], { article }))
    assert.equal(result.state, 'not-found')
  }
  assert.equal(normalizePublicArticleSlug('---'), '')
})

test('distingue une erreur de chargement', async () => {
  const result = await loadPublishedArticleBySlug('mon-article', createPublicClient([], { articleError: new Error('offline') }))
  assert.equal(result.state, 'error')
})

test('signe couverture et média valides, ignore les chemins invalides', async () => {
  const calls = []
  const result = await loadPublishedArticleBySlug('mon-article', createPublicClient(calls, {
    article: publishedRow(),
    assets: [
      { id: 'a', article_id: ARTICLE_ID, media_key: 'schema-rag', storage_path: MEDIA_PATH },
      { id: 'b', article_id: ARTICLE_ID, media_key: 'dangereux', storage_path: '../secret.png' },
    ],
  }))
  assert.equal(result.coverUrl, `signed:${COVER_PATH}`)
  assert.equal(result.assetUrls[MEDIA_PATH], `signed:${MEDIA_PATH}`)
  assert.equal(result.assets.length, 1)
  assert.equal(calls.some((call) => call[1] === 'sign' && call[2] === '../secret.png'), false)
})

test('résout l’infographie uniquement pour le détail publié et transmet un modèle assaini', async () => {
  const calls = []
  const result = await loadPublishedArticleBySlug('mon-article', createPublicClient(calls, {
    article: publishedRow({
      infographic_path: INFOGRAPHIC_PATH,
      infographic_alt_text: '  Synthèse accessible  ',
      infographic_generation_metadata: { prompt: 'secret' },
    }),
  }))

  const detailSelect = calls.find(([table, method]) => table === 'articles' && method === 'select')
  assert.ok(detailSelect[2].includes('infographic_path'))
  assert.ok(detailSelect[2].includes('infographic_alt_text'))
  assert.deepEqual(result.infographic, {
    url: `signed:${INFOGRAPHIC_PATH}`,
    altText: 'Synthèse accessible',
    downloadFileName: 'mon-article-infographie.webp',
  })
  assert.equal('infographic_path' in result.article, false)
  assert.equal('infographic_alt_text' in result.article, false)
  assert.equal('infographic_generation_metadata' in result.article, false)
  assert.equal(result.assetUrls[INFOGRAPHIC_PATH], undefined)
})

test('omet entièrement l’infographie absente, invalide ou impossible à signer', async () => {
  const absentCalls = []
  const absent = await loadPublishedArticleBySlug('mon-article', createPublicClient(absentCalls, {
    article: publishedRow(),
  }))
  assert.equal(absent.infographic, null)
  assert.equal(absentCalls.some((call) => call[1] === 'sign' && String(call[2]).includes('/infographic/')), false)

  const invalidCalls = []
  const invalid = await loadPublishedArticleBySlug('mon-article', createPublicClient(invalidCalls, {
    article: publishedRow({ infographic_path: '../foreign.png' }),
  }))
  assert.equal(invalid.infographic, null)
  assert.equal(invalidCalls.some((call) => call[1] === 'sign' && call[2] === '../foreign.png'), false)

  const missing = await loadPublishedArticleBySlug('mon-article', createPublicClient([], {
    article: publishedRow({ infographic_path: INFOGRAPHIC_PATH }),
    signFailures: new Set([INFOGRAPHIC_PATH]),
  }), { logger: { warn() {} } })
  assert.equal(missing.state, 'found')
  assert.equal(missing.infographic, null)
})

test('conserve un alt vide pour permettre le fallback de rendu', async () => {
  const result = await loadPublishedArticleBySlug('mon-article', createPublicClient([], {
    article: publishedRow({ infographic_path: INFOGRAPHIC_PATH, infographic_alt_text: '   ' }),
  }))
  assert.equal(result.infographic.altText, '')
})

test('produit des noms PNG, JPEG et WebP sûrs avec slug ou titre fallback', () => {
  const makePath = (extension) => `articles/${ARTICLE_ID}/infographic/${FILE_ID}.${extension}`
  assert.equal(getArticleInfographicDownloadFileName({ articleId: ARTICLE_ID, path: makePath('png'), slug: 'article-public' }), 'article-public-infographie.png')
  assert.equal(getArticleInfographicDownloadFileName({ articleId: ARTICLE_ID, path: makePath('jpg'), title: 'Évaluer le RAG!' }), 'evaluer-le-rag-infographie.jpg')
  assert.equal(getArticleInfographicDownloadFileName({ articleId: ARTICLE_ID, path: makePath('webp'), title: 'Résumé visuel' }), 'resume-visuel-infographie.webp')
  assert.equal(getArticleInfographicDownloadFileName({ articleId: ARTICLE_ID, path: '../foreign.png', slug: 'article' }), null)
})

test('une erreur de signature omet seulement l’asset concerné', async () => {
  const result = await loadPublishedArticleBySlug('mon-article', createPublicClient([], {
    article: publishedRow(),
    assets: [{ id: 'a', article_id: ARTICLE_ID, media_key: 'schema-rag', storage_path: MEDIA_PATH }],
    signFailures: new Set([MEDIA_PATH]),
  }), { logger: { warn() {} } })
  assert.equal(result.state, 'found')
  assert.equal(result.coverUrl, `signed:${COVER_PATH}`)
  assert.equal(result.assetUrls[MEDIA_PATH], undefined)
})

test('assainit les données publiques et applique les fallbacks structurels', () => {
  const article = sanitizePublishedArticle({
    id: ARTICLE_ID,
    media: [{ key: 'a', altText: 'Alt', generationBrief: 'secret' }],
    cover: { altText: 'Couverture', generationBrief: 'secret' },
    seo: { seoTitle: 'SEO', metaDescription: 'Meta', internalLinkSuggestions: ['secret'] },
  })
  assert.deepEqual(article.learningObjectives, [])
  assert.deepEqual(article.prerequisites, [])
  assert.deepEqual(article.sources, [])
  assert.equal(article.media[0].generationBrief, undefined)
  assert.equal(article.cover.generationBrief, undefined)
  assert.equal(article.seo.internalLinkSuggestions, undefined)
})

function publishedRow(overrides = {}) {
  return {
    id: ARTICLE_ID,
    slug: 'mon-article',
    status: 'published',
    title: 'Mon article',
    media: [{ key: 'schema-rag', altText: 'Schéma' }],
    cover: { altText: 'Couverture' },
    sources: [],
    seo: {},
    cover_path: COVER_PATH,
    published_at: '2026-08-01T15:30:00.000Z',
    ...overrides,
  }
}

function createPublicClient(calls, options = {}) {
  return {
    from(table) {
      const filters = new Map()
      return {
        select(columns) { calls.push([table, 'select', columns]); return this },
        eq(column, value) { filters.set(column, value); calls.push([table, 'eq', column, value]); return this },
        limit(value) { calls.push([table, 'limit', value]); return this },
        async maybeSingle() {
          if (options.articleError) return { data: null, error: options.articleError }
          const row = options.article
          const matches = row && filters.get('slug') === row.slug && filters.get('status') === row.status
          return { data: matches ? row : null, error: null }
        },
        async order() {
          return table === 'articles'
            ? { data: options.catalogRows || [], error: options.articleError || null }
            : { data: options.assets || [], error: options.assetError || null }
        },
      }
    },
    storage: {
      from(bucket) {
        assert.equal(bucket, 'article-assets')
        return {
          async createSignedUrl(path) {
            calls.push(['storage', 'sign', path])
            if (options.signFailures?.has(path)) return { data: null, error: new Error('sign failed') }
            return { data: { signedUrl: `signed:${path}` }, error: null }
          },
        }
      },
    },
  }
}
