import test from 'node:test'
import assert from 'node:assert/strict'
import {
  proposeArticleSlug,
  resolveArticleSlugProposal,
  slugifyArticle,
} from './articleSlug.js'

test('normalise accents, espaces, ponctuation et tirets répétés', () => {
  assert.equal(slugifyArticle('  Évaluer l’IA -- en pratique!  '), 'evaluer-l-ia-en-pratique')
  assert.equal(slugifyArticle('RAG---et   réglage fin'), 'rag-et-reglage-fin')
})

test('propose le slug SEO, puis utilise le titre comme fallback', () => {
  assert.equal(
    proposeArticleSlug({ suggestedSlug: 'Mon Slug SEO', title: 'Titre ignoré' }),
    'mon-slug-seo',
  )
  assert.equal(
    proposeArticleSlug({ suggestedSlug: '---', title: 'Comprendre les embeddings' }),
    'comprendre-les-embeddings',
  )
})

test('préserve une modification manuelle du slug', () => {
  assert.equal(
    resolveArticleSlugProposal({
      currentSlug: 'slug-manuel',
      manuallyEdited: true,
      suggestedSlug: 'nouvelle-suggestion',
      title: 'Nouveau titre',
    }),
    'slug-manuel',
  )
})
