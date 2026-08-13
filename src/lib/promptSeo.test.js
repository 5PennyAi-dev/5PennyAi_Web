import assert from 'node:assert/strict'
import test from 'node:test'
import {
  buildPromptBreadcrumbStructuredData,
  buildPromptCanonicalUrl,
  buildPromptSeoMetadata,
  buildPromptSocialImageUrl,
} from './promptSeo.js'

test('résout titre, description, langue et canonical depuis les données réelles', () => {
  const metadata = buildPromptSeoMetadata({
    slug: 'prompt-definitif',
    title: 'Titre éditorial',
    summary: 'Résumé public',
    language: 'en',
    seo: {
      seoTitle: 'Titre SEO',
      metaDescription: 'Description SEO',
      suggestedSlug: 'suggestion-ignoree',
    },
  })
  assert.equal(metadata.pageTitle, 'Titre SEO — 5PennyAi')
  assert.equal(metadata.description, 'Description SEO')
  assert.equal(metadata.language, 'en')
  assert.equal(metadata.ogLocale, 'en_CA')
  assert.equal(metadata.canonicalUrl, 'https://5pennyai.com/ressources-ia/prompts/prompt-definitif')
})

test('applique les fallbacks sans dériver la description du template', () => {
  const summary = buildPromptSeoMetadata({ title: 'Titre', summary: '**Résumé** utile' })
  assert.equal(summary.description, 'Résumé utile')
  const fallback = buildPromptSeoMetadata({ promptTemplate: 'Secret qui ne doit pas être indexé' })
  assert.doesNotMatch(fallback.description, /Secret/)
  assert.equal(fallback.pageTitle, 'Prompt — 5PennyAi')
  assert.equal(fallback.language, 'fr')
})

test('utilise une image sociale stable uniquement pour un thumbnail valide résolu côté serveur', () => {
  const covered = buildPromptSeoMetadata({
    slug: 'prompt-public',
    title: 'Prompt public',
    hasThumbnail: true,
    updatedAt: '2026-08-13T12:00:00Z',
  })
  assert.equal(
    covered.imageUrl,
    `https://5pennyai.com/api/prompt-social-image/prompt-public?v=${Date.parse('2026-08-13T12:00:00Z')}`,
  )
  assert.doesNotMatch(covered.imageUrl, /signed|token|supabase/i)
  assert.equal(buildPromptSeoMetadata({ slug: 'sans-image' }).imageUrl, 'https://5pennyai.com/images/og-christian.jpg')
  assert.equal(buildPromptSocialImageUrl(''), 'https://5pennyai.com/images/og-christian.jpg')
})

test('normalise la canonical et produit seulement un BreadcrumbList fidèle', () => {
  assert.equal(
    buildPromptCanonicalUrl('  Expliquer un concept  '),
    'https://5pennyai.com/ressources-ia/prompts/expliquer-un-concept',
  )
  const metadata = buildPromptSeoMetadata({ slug: 'expliquer', title: 'Expliquer' })
  const data = buildPromptBreadcrumbStructuredData({}, metadata)
  assert.equal(data['@type'], 'BreadcrumbList')
  assert.deepEqual(data.itemListElement.map(({ position }) => position), [1, 2, 3])
  assert.doesNotMatch(JSON.stringify(data), /Article|HowTo|promptTemplate/)
})
