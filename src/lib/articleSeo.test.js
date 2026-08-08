import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import {
  buildArticleCanonicalUrl,
  buildArticleSeoMetadata,
  buildArticleStructuredData,
  buildBreadcrumbStructuredData,
  serializeJsonLd,
} from './articleSeo.js'

const PILOT_FILES = [
  '../../docs/ressources-ia/fixtures/articles/modele-de-fondation-ia.article.json',
  '../../docs/ressources-ia/fixtures/articles/rag-ou-reglage-fin-adapter-application-llm.article.json',
  '../../docs/ressources-ia/fixtures/articles/evaluation-recuperation-rag.v2-accepted.article.json',
]

test('résout titre SEO, titre éditorial et fallback ultime avec suffixe unique', () => {
  assert.equal(
    buildArticleSeoMetadata({ title: 'Titre', seo: { seoTitle: 'Titre SEO' } }).pageTitle,
    'Titre SEO — 5PennyAi',
  )
  assert.equal(
    buildArticleSeoMetadata({ title: 'Titre — 5PennyAi' }).pageTitle,
    'Titre — 5PennyAi',
  )
  assert.equal(buildArticleSeoMetadata({}).pageTitle, 'Article — 5PennyAi')
  assert.equal(
    buildArticleSeoMetadata({ title: 'Titre utile', seo: { seoTitle: '5PennyAi' } }).pageTitle,
    'Titre utile — 5PennyAi',
  )
})
test('résout la description SEO, le résumé puis le fallback sans Markdown ni HTML', () => {
  assert.equal(
    buildArticleSeoMetadata({ seo: { metaDescription: '**Description** {{cite:x}} <em>utile</em>' } }).description,
    'Description utile',
  )
  assert.equal(buildArticleSeoMetadata({ summary: 'Résumé propre' }).description, 'Résumé propre')
  assert.match(buildArticleSeoMetadata({ language: 'en' }).description, /educational resources/i)
})

test('construit une canonical absolue depuis le slug définitif uniquement', () => {
  assert.equal(
    buildArticleCanonicalUrl('  Évaluer le RAG/ '),
    'https://5pennyai.com/ressources-ia/articles/evaluer-le-rag',
  )
  const metadata = buildArticleSeoMetadata({
    slug: 'slug-definitif',
    seo: { suggestedSlug: 'slug-suggere' },
  })
  assert.equal(metadata.canonicalUrl, 'https://5pennyai.com/ressources-ia/articles/slug-definitif')
  assert.ok(!metadata.canonicalUrl.includes('?'))
  assert.ok(!metadata.canonicalUrl.includes('#'))
  assert.ok(!metadata.canonicalUrl.includes('//ressources'))
})

test('produit Open Graph et Twitter avec image stable ou fallback public', () => {
  const covered = buildArticleSeoMetadata({
    slug: 'article-couvert',
    title: 'Article couvert',
    hasCover: true,
    cover: { altText: 'Texte alternatif' },
    publishedAt: '2026-08-01T10:00:00Z',
    updatedAt: '2026-08-01T11:00:00Z',
  })
  const coveredImageUrl = new URL(covered.imageUrl)
  assert.equal(coveredImageUrl.origin, 'https://5pennyai.com')
  assert.equal(coveredImageUrl.pathname, '/api/article-social-image/article-couvert')
  assert.equal(coveredImageUrl.searchParams.has('slug'), false)
  assert.equal(coveredImageUrl.searchParams.get('v'), String(Date.parse('2026-08-01T11:00:00Z')))
  assert.equal(covered.imageAlt, 'Texte alternatif')
  assert.equal(covered.datePublished, '2026-08-01T10:00:00.000Z')
  assert.equal(covered.dateModified, '2026-08-01T11:00:00.000Z')
  assert.doesNotMatch(covered.imageUrl, /token|signature|supabase/i)

  const fallback = buildArticleSeoMetadata({ slug: 'sans-couverture', title: 'Sans couverture' })
  assert.equal(fallback.imageUrl, 'https://5pennyai.com/images/og-christian.jpg')
  assert.equal(fallback.imageAlt, 'Sans couverture')
})

test('normalise la langue et omet les dates invalides ou incohérentes', () => {
  assert.equal(buildArticleSeoMetadata({ language: 'en' }).ogLocale, 'en_CA')
  assert.equal(buildArticleSeoMetadata({ language: 'de' }).language, 'fr')
  const metadata = buildArticleSeoMetadata({
    publishedAt: '2026-08-02T00:00:00Z',
    updatedAt: '2026-08-01T00:00:00Z',
  })
  assert.equal(metadata.dateModified, '')
  assert.equal(buildArticleSeoMetadata({ publishedAt: 'invalide' }).datePublished, '')
})

test('construit Article et BreadcrumbList sans propriété administrative inventée', () => {
  const article = {
    slug: 'test-structure',
    title: 'Titre réel',
    summary: 'Résumé',
    language: 'fr',
    hasCover: true,
    publishedAt: '2026-08-01T10:00:00Z',
    updatedAt: '2026-08-01T11:00:00Z',
    cover_path: 'privé',
    generationBrief: 'interdit',
  }
  const metadata = buildArticleSeoMetadata(article)
  const structured = buildArticleStructuredData(article, metadata)
  const breadcrumb = buildBreadcrumbStructuredData(article, metadata)
  assert.equal(structured['@type'], 'Article')
  assert.equal(structured.headline, 'Titre réel')
  assert.equal(structured.mainEntityOfPage, metadata.canonicalUrl)
  assert.equal(breadcrumb['@type'], 'BreadcrumbList')
  assert.deepEqual(breadcrumb.itemListElement.map(({ position }) => position), [1, 2, 3])
  const serialized = JSON.stringify({ structured, breadcrumb })
  assert.doesNotMatch(serialized, /cover_path|generationBrief|suggestedSlug|author|publisher/)
})

test('sérialise sûrement guillemets, chevrons, esperluette et fermeture de script', () => {
  const serialized = serializeJsonLd({ headline: '" < > & </script><script>alert(1)</script>' })
  assert.doesNotMatch(serialized, /<|>|&|<\/script/i)
  assert.match(serialized, /\\u003c\/script\\u003e/)
  assert.deepEqual(JSON.parse(serialized), { headline: '" < > & </script><script>alert(1)</script>' })
})

test('les trois fixtures pilotes couvrent débutant, intermédiaire et avancé', () => {
  const fixtures = PILOT_FILES.map((path) => JSON.parse(readFileSync(new URL(path, import.meta.url), 'utf8')))
  assert.deepEqual(fixtures.map(({ level }) => level), ['beginner', 'intermediate', 'advanced'])
  for (const fixture of fixtures) {
    const metadata = buildArticleSeoMetadata({ ...fixture, slug: fixture.seo.suggestedSlug })
    assert.ok(metadata.pageTitle.startsWith(fixture.seo.seoTitle))
    assert.equal(buildArticleStructuredData(fixture, metadata).inLanguage, 'fr')
  }
})
