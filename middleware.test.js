import assert from 'node:assert/strict'
import test from 'node:test'
import {
  buildArticleSeoMetadata,
  buildArticleStructuredData,
  buildBreadcrumbStructuredData,
} from './src/lib/articleSeo.js'
import middleware, {
  buildArticleCrawlerHtml,
  CRAWLER_PATTERN,
} from './middleware.js'

const INFOGRAPHIC_ID = '11111111-1111-4111-8111-111111111111'
const ENV = {
  VITE_SUPABASE_URL: 'https://project.supabase.co',
  VITE_SUPABASE_ANON_KEY: 'anon-key',
}

test('reconnaît les crawlers sociaux et de recherche sans traiter un navigateur ordinaire', () => {
  for (const agent of ['facebookexternalhit/1.1', 'Twitterbot/1.0', 'Googlebot', 'bingbot']) {
    assert.match(agent, CRAWLER_PATTERN)
  }
  assert.doesNotMatch('Mozilla/5.0 Chrome/140', CRAWLER_PATTERN)
})
test('la réponse crawler contient une occurrence cohérente de toutes les métadonnées', () => {
  const article = {
    slug: 'article-crawler',
    title: 'Titre " <test> & fiable',
    summary: 'Résumé public',
    language: 'fr',
    hasCover: true,
    publishedAt: '2026-08-01T00:00:00Z',
    updatedAt: '2026-08-01T01:00:00Z',
  }
  const metadata = buildArticleSeoMetadata(article)
  const html = buildArticleCrawlerHtml({
    article,
    metadata,
    articleData: buildArticleStructuredData(article, metadata),
    breadcrumbData: buildBreadcrumbStructuredData(article, metadata),
  })
  for (const marker of [
    '<link rel="canonical"',
    'property="og:type"',
    'name="twitter:card"',
    'property="article:published_time"',
    '"@type":"Article"',
    '"@type":"BreadcrumbList"',
  ]) {
    assert.equal(html.split(marker).length - 1, 1, marker)
  }
  assert.match(html, /og:image" content="https:\/\/5pennyai\.com\/api\/article-social-image\?slug=article-crawler"/)
  assert.doesNotMatch(html, /signed|token|cover_path|generationBrief|<script>alert/i)
  assert.match(html, /Titre &quot; &lt;test&gt; &amp; fiable/)
})

test('sert aux crawlers toutes les métadonnées d’une infographie publiée avec thumbnail', async () => {
  const calls = []
  const thumbnailPath = `thumbnails/infographics/${INFOGRAPHIC_ID}/miniature spéciale & finale.webp`
  const response = await renderInfographic({
    id: INFOGRAPHIC_ID,
    status: 'published',
    title: 'Titre " 2 < 3 & fiable',
    summary: 'Résumé <em>public & utile</em>\n sur deux lignes',
    introduction: 'Introduction ignorée',
    image_alt: 'Miniature " 2 < 3 & nette',
    thumbnail_path: thumbnailPath,
  }, calls)
  const html = await response.text()

  assert.equal(response.status, 200)
  assert.match(response.headers.get('cache-control'), /s-maxage=900/)
  for (const marker of [
    '<link rel="canonical"',
    'property="og:type" content="article"',
    'property="og:title"',
    'property="og:description"',
    'property="og:url"',
    'property="og:image"',
    'property="og:image:alt"',
    'property="og:site_name" content="5PennyAi"',
    'property="og:locale" content="fr_CA"',
    'name="twitter:card" content="summary_large_image"',
    'name="twitter:title"',
    'name="twitter:description"',
    'name="twitter:image"',
  ]) {
    assert.equal(html.split(marker).length - 1, 1, marker)
  }
  assert.match(html, new RegExp(`https://5pennyai\\.com/ressources-ia/infographies/${INFOGRAPHIC_ID}`))
  assert.match(
    html,
    new RegExp(`https://project\\.supabase\\.co/storage/v1/object/public/infographics/thumbnails/infographics/${INFOGRAPHIC_ID}/miniature%20sp%C3%A9ciale%20%26%20finale\\.webp`),
  )
  assert.match(html, /Titre &quot; 2 &lt; 3 &amp; fiable/)
  assert.match(html, /Résumé public &amp; utile sur deux lignes/)
  assert.match(html, /Miniature &quot; 2 &lt; 3 &amp; nette/)
  assert.doesNotMatch(html, /thumbnail_path|image_path|anon-key|apikey|introduction ignorée/i)

  assert.equal(calls.length, 1)
  const query = new URL(calls[0])
  assert.equal(query.pathname, '/rest/v1/infographics')
  assert.equal(query.searchParams.get('id'), `eq.${INFOGRAPHIC_ID}`)
  assert.equal(query.searchParams.get('status'), 'eq.published')
  assert.equal(
    query.searchParams.get('select'),
    'id,title,summary,introduction,image_alt,thumbnail_path,status',
  )
  assert.equal(query.searchParams.get('limit'), '1')
})

test('utilise l’image sociale par défaut pour une infographie publiée sans thumbnail', async () => {
  const response = await renderInfographic(publishedInfographic({ thumbnail_path: null }))
  const html = await response.text()
  assert.equal(response.status, 200)
  assert.match(html, /property="og:image" content="https:\/\/5pennyai\.com\/images\/og-christian\.jpg"/)
  assert.match(html, /name="twitter:image" content="https:\/\/5pennyai\.com\/images\/og-christian\.jpg"/)
})

test('refuse un brouillon et un UUID inconnu sans exposer leurs métadonnées', async () => {
  const secretThumbnail = `thumbnails/infographics/${INFOGRAPHIC_ID}/secret.webp`
  for (const rows of [
    [publishedInfographic({ status: 'draft', title: 'Titre brouillon secret', thumbnail_path: secretThumbnail })],
    [],
  ]) {
    const response = await renderInfographicRows(rows)
    const html = await response.text()
    assert.equal(response.status, 404)
    assert.equal(response.headers.get('cache-control'), 'no-store')
    assert.match(html, /noindex, nofollow/)
    assert.doesNotMatch(html, /Titre brouillon secret|secret\.webp|property="og:|twitter:/i)
  }
})

test('refuse localement un UUID invalide sans appeler Supabase', async () => {
  let fetchCalls = 0
  const response = await middleware(
    crawlerRequest('/ressources-ia/infographies/pas-un-uuid'),
    {
      env: ENV,
      fetchImpl: async () => {
        fetchCalls += 1
        return jsonResponse([])
      },
    },
  )
  assert.equal(response.status, 404)
  assert.equal(fetchCalls, 0)
  assert.doesNotMatch(await response.text(), /property="og:|twitter:/i)
})

test('laisse la SPA traiter une infographie demandée par un navigateur ordinaire', async () => {
  let fetchCalls = 0
  const response = await middleware(
    new Request(`https://5pennyai.com/ressources-ia/infographies/${INFOGRAPHIC_ID}`, {
      headers: { 'user-agent': 'Mozilla/5.0 Chrome/140' },
    }),
    { env: ENV, fetchImpl: async () => { fetchCalls += 1; return jsonResponse([]) } },
  )
  assert.equal(response, undefined)
  assert.equal(fetchCalls, 0)
})

function publishedInfographic(overrides = {}) {
  return {
    id: INFOGRAPHIC_ID,
    status: 'published',
    title: 'Infographie publique',
    summary: 'Résumé public',
    introduction: 'Introduction publique',
    image_alt: 'Texte alternatif',
    thumbnail_path: `thumbnails/infographics/${INFOGRAPHIC_ID}/thumbnail.webp`,
    ...overrides,
  }
}

async function renderInfographic(row, calls = []) {
  return renderInfographicRows([row], calls)
}

async function renderInfographicRows(rows, calls = []) {
  return middleware(crawlerRequest(`/ressources-ia/infographies/${INFOGRAPHIC_ID}`), {
    env: ENV,
    fetchImpl: async (url) => {
      calls.push(String(url))
      return jsonResponse(rows)
    },
  })
}

function crawlerRequest(path) {
  return new Request(`https://5pennyai.com${path}`, {
    headers: { 'user-agent': 'LinkedInBot/1.0' },
  })
}

function jsonResponse(value) {
  return new Response(JSON.stringify(value), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  })
}
