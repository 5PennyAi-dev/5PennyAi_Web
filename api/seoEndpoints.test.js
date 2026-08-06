import assert from 'node:assert/strict'
import { Buffer } from 'node:buffer'
import test from 'node:test'
import { createArticleSocialImageHandler } from './article-social-image.js'
import { robotsHandler } from './robots.js'
import { createSitemapHandler } from './sitemap.js'

const ARTICLE_ID = '11111111-1111-4111-8111-111111111111'
const COVER_ID = '22222222-2222-4222-8222-222222222222'
const COVER_PATH = `articles/${ARTICLE_ID}/cover/${COVER_ID}.webp`
const ENV = { VITE_SUPABASE_URL: 'https://example.supabase.co', VITE_SUPABASE_ANON_KEY: 'anon-key' }

test('sert le sitemap XML avec publications et type de contenu correct', async () => {
  const fetchImpl = async (url) => {
    const path = String(url)
    if (path.includes('/articles?')) return jsonResponse([{ slug: 'article-public', status: 'published' }])
    return jsonResponse([{ id: ARTICLE_ID, status: 'published' }])
  }
  const res = createMockResponse()
  await createSitemapHandler({ env: ENV, fetchImpl })({ method: 'GET' }, res)
  assert.equal(res.statusCode, 200)
  assert.match(res.headers['content-type'], /application\/xml/)
  assert.match(res.body, /article-public/)
  assert.match(res.body, new RegExp(ARTICLE_ID))
  assert.doesNotMatch(res.body, /\/admin|\?vue=/)
})

test('retourne une erreur contrôlée sans XML partiel si Supabase échoue', async () => {
  const res = createMockResponse()
  const logger = { error() {} }
  await createSitemapHandler({
    env: ENV,
    logger,
    fetchImpl: async () => new Response('Erreur', { status: 500 }),
  })({ method: 'GET' }, res)
  assert.equal(res.statusCode, 503)
  assert.match(res.headers['content-type'], /text\/plain/)
  assert.doesNotMatch(res.body, /<urlset/)
})

test('sert robots.txt avec cache et sitemap absolu', () => {
  const res = createMockResponse()
  robotsHandler({ method: 'GET' }, res)
  assert.equal(res.statusCode, 200)
  assert.match(res.headers['content-type'], /text\/plain/)
  assert.match(res.body, /Sitemap: https:\/\/5pennyai\.com\/sitemap\.xml/)
})

test('proxifie une couverture publiée sans exposer son chemin privé', async () => {
  const calls = []
  const fetchImpl = async (url) => {
    calls.push(String(url))
    if (String(url).includes('/storage/v1/object/sign/article-assets/opaque?token=')) {
      return new Response(new Uint8Array([1, 2, 3]), { headers: { 'content-type': 'image/webp' } })
    }
    if (String(url).includes('/rest/v1/articles')) {
      return jsonResponse([publishedArticle({ cover_path: COVER_PATH })])
    }
    if (String(url).includes('/storage/v1/object/sign/')) {
      return jsonResponse({ signedURL: '/object/sign/article-assets/opaque?token=temporaire' })
    }
    throw new Error(`Unexpected URL: ${url}`)
  }
  const res = createMockResponse()
  await createArticleSocialImageHandler({ env: ENV, fetchImpl, logger: { warn() {} } })(
    { method: 'GET', url: '/api/article-social-image?slug=article-public' },
    res,
  )
  assert.equal(res.statusCode, 200)
  assert.equal(res.headers['content-type'], 'image/webp')
  assert.match(res.headers['cache-control'], /s-maxage=900/)
  assert.equal(Buffer.from(res.body).length, 3)
  assert.ok(calls.some((url) => url.includes('/storage/v1/object/sign/')))
  assert.ok(calls.some((url) => url === 'https://example.supabase.co/storage/v1/object/sign/article-assets/opaque?token=temporaire'))
  assert.doesNotMatch(String(res.body), /articles\/|supabase|token/)
})

test('utilise le fallback public pour une publication sans couverture ou une erreur de signature', async () => {
  const withoutCover = createMockResponse()
  await createArticleSocialImageHandler({
    env: ENV,
    fetchImpl: async () => jsonResponse([publishedArticle()]),
  })({ method: 'GET', url: '/api/article-social-image?slug=sans-couverture' }, withoutCover)
  assert.equal(withoutCover.statusCode, 302)
  assert.equal(withoutCover.headers.location, 'https://5pennyai.com/images/og-christian.jpg')

  const signFailure = createMockResponse()
  let call = 0
  await createArticleSocialImageHandler({
    env: ENV,
    logger: { warn() {} },
    fetchImpl: async () => ++call === 1
      ? jsonResponse([publishedArticle({ cover_path: COVER_PATH })])
      : new Response('Erreur', { status: 500 }),
  })({ method: 'GET', url: '/api/article-social-image?slug=avec-couverture' }, signFailure)
  assert.equal(signFailure.statusCode, 302)
})

test('refuse slug inconnu ou brouillon sans révéler de couverture', async () => {
  const res = createMockResponse()
  await createArticleSocialImageHandler({
    env: ENV,
    fetchImpl: async () => jsonResponse([]),
  })({ method: 'GET', url: '/api/article-social-image?slug=brouillon' }, res)
  assert.equal(res.statusCode, 404)
  assert.equal(res.headers['cache-control'], 'no-store')
  assert.doesNotMatch(res.body, /cover|storage|supabase/i)
})

function publishedArticle(overrides = {}) {
  return {
    id: ARTICLE_ID,
    slug: 'article-public',
    title: 'Article public',
    language: 'fr',
    seo: {},
    cover: {},
    status: 'published',
    published_at: '2026-08-01T00:00:00Z',
    updated_at: '2026-08-01T01:00:00Z',
    ...overrides,
  }
}

function jsonResponse(value) {
  return new Response(JSON.stringify(value), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  })
}

function createMockResponse() {
  return {
    statusCode: 200,
    headers: {},
    body: '',
    setHeader(name, value) { this.headers[name.toLowerCase()] = String(value) },
    end(value = '') { this.body = value },
  }
}
