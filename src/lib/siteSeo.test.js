import assert from 'node:assert/strict'
import test from 'node:test'
import { buildRobotsTxt, buildSitemapEntries, buildSitemapXml } from './siteSeo.js'

const INFOGRAPHIC_ID = '11111111-1111-4111-8111-111111111111'

test('inclut publications, infographie et série non vide, puis exclut les brouillons', () => {
  const entries = buildSitemapEntries({
    articleRows: [
      { slug: 'article-public', status: 'published', series_name: 'Série mixte', updated_at: '2026-08-02T00:00:00Z' },
      { slug: 'article-brouillon', status: 'draft', series_name: 'Série vide' },
      { slug: 'article-retire', status: 'archived' },
    ],
    infographicRows: [
      { id: INFOGRAPHIC_ID, status: 'published', series_name: 'Série mixte', published_at: '2026-08-01T00:00:00Z' },
    ],
    promptRows: [
      { slug: 'prompt-public', status: 'published', updated_at: '2026-08-03T00:00:00Z' },
      { slug: 'prompt-brouillon', status: 'draft' },
      { slug: '', status: 'published' },
    ],
  })
  const urls = entries.map(({ url }) => url)
  assert.ok(urls.includes('https://5pennyai.com/ressources-ia/articles/article-public'))
  assert.ok(urls.includes(`https://5pennyai.com/ressources-ia/infographies/${INFOGRAPHIC_ID}`))
  assert.ok(urls.includes('https://5pennyai.com/ressources-ia/series/serie-mixte'))
  assert.ok(urls.includes('https://5pennyai.com/ressources-ia/prompts/prompt-public'))
  assert.ok(!urls.some((url) => url.includes('brouillon') || url.includes('serie-vide')))
  assert.ok(!urls.some((url) => url.includes('/admin') || url.includes('?') || url.includes('#')))
  assert.equal(new Set(urls).size, urls.length)
})
test('déduplique les URLs et conserve le lastmod technique le plus récent', () => {
  const entries = buildSitemapEntries({
    articleRows: [
      { slug: 'meme-article', status: 'published', updated_at: '2026-08-01T00:00:00Z' },
      { slug: 'meme-article', status: 'published', updated_at: '2026-08-02T00:00:00Z' },
    ],
  })
  const article = entries.find(({ url }) => url.endsWith('/meme-article'))
  assert.equal(article.lastmod, '2026-08-02T00:00:00.000Z')
})

test('génère un XML lisible et échappe les caractères réservés', () => {
  const xml = buildSitemapXml([
    { url: 'https://5pennyai.com/test?a=1&b=<deux>', lastmod: '2026-08-01T00:00:00Z' },
  ])
  assert.match(xml, /^<\?xml version="1\.0" encoding="UTF-8"\?>/)
  assert.match(xml, /xmlns="http:\/\/www\.sitemaps\.org\/schemas\/sitemap\/0\.9"/)
  assert.match(xml, /a=1&amp;b=&lt;deux&gt;/)
  assert.match(xml, /<lastmod>2026-08-01T00:00:00Z<\/lastmod>/)
})

test('robots autorise le public, exclut admin et référence le domaine canonique', () => {
  const robots = buildRobotsTxt()
  assert.match(robots, /User-agent: \*/)
  assert.match(robots, /Allow: \//)
  assert.match(robots, /Disallow: \/admin\//)
  assert.match(robots, /Sitemap: https:\/\/5pennyai\.com\/sitemap\.xml/)
  assert.doesNotMatch(robots, /vercel\.app/i)
})
