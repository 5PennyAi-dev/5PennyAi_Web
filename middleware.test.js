import assert from 'node:assert/strict'
import test from 'node:test'
import {
  buildArticleSeoMetadata,
  buildArticleStructuredData,
  buildBreadcrumbStructuredData,
} from './src/lib/articleSeo.js'
import { buildArticleCrawlerHtml, CRAWLER_PATTERN } from './middleware.js'

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
