import assert from 'node:assert/strict'
import test from 'node:test'
import { createEmptyPromptForm } from './promptFormData.js'
import { analyzePromptJson, importPromptJson } from './promptJsonImport.js'

test('accepte un objet vide et un JSON partiel', () => {
  const empty = analyzePromptJson('{}')
  assert.equal(empty.success, true)
  assert.deepEqual(empty.patch, {})
  const partial = analyzePromptJson('{"title":"Comparer deux options"}')
  assert.equal(partial.patch.title, 'Comparer deux options')
})

test('importe un paquet complet et conserve les valeurs contrôlées inconnues', () => {
  const result = analyzePromptJson(JSON.stringify({
    schemaVersion: 2,
    contentType: 'prompt-v2',
    language: 'es',
    title: 'Titre',
    summary: 'Résumé',
    category: 'productivity',
    level: 'expert',
    contexts: ['work', 'business'],
    resultTypes: ['table', 'diagram'],
    whenToUse: 'Quand',
    promptTemplate: 'Compare [A] et [B]',
    variables: [{ key: 'A', label: 'A', description: 'A', example: 'un' }],
    tip: 'Conseil',
    quickTemplate: 'Compare [A]',
    caution: 'Attention',
    editorialObjective: 'Objectif',
    thumbnail: { altText: '', generationBrief: 'Brief', preferredAspectRatio: '16:9' },
    keywords: ['comparer'],
    seo: { primaryQuery: 'requête', secondaryQueries: [], seoTitle: 'SEO', metaDescription: 'Meta', suggestedSlug: 'suggestion', internalLinkSuggestions: [] },
  }))
  assert.equal(result.success, true)
  assert.equal(result.patch.category, 'productivity')
  assert.deepEqual(result.patch.contexts, ['work', 'business'])
  assert.ok(result.warnings.some(({ code }) => code === 'unknownCategory'))
  assert.ok(result.warnings.some(({ code }) => code === 'unknownContext'))
  assert.equal(result.patch.thumbnail.generationBrief, 'Brief')
})

test('refuse JSON invalide, tableau, null et scalaire sans modifier le formulaire', () => {
  const form = { ...createEmptyPromptForm(), title: 'Conserver' }
  for (const value of ['{', '[]', 'null', '42', '"texte"']) {
    const result = importPromptJson(value, form)
    assert.equal(result.success, false)
    assert.equal(result.nextForm, form)
    assert.equal(result.nextForm.title, 'Conserver')
  }
})

test('ignore les propriétés inconnues et techniques, y compris slug et examplePrompt', () => {
  const result = analyzePromptJson(JSON.stringify({
    title: 'Valide', slug: 'interdit', status: 'published', thumbnailPath: 'secret',
    examplePrompt: 'dupliqué', unknown: 42,
    thumbnail: { generationBrief: 'Brief', thumbnailUrl: 'secret' },
  }))
  assert.equal(result.patch.title, 'Valide')
  assert.equal('slug' in result.patch, false)
  assert.deepEqual(result.forbidden.sort(), ['examplePrompt', 'slug', 'status', 'thumbnail.thumbnailUrl', 'thumbnailPath'].sort())
  assert.deepEqual(result.unknown, ['unknown'])
})

test('demande confirmation pour une réimportation et conserve slug et données absentes', () => {
  const current = { ...createEmptyPromptForm(), title: 'Ancien', summary: 'Conserver', slug: 'slug-technique' }
  const cancelled = importPromptJson('{"title":"Nouveau","seo":{"suggestedSlug":"suggestion"}}', current, { confirmed: false })
  assert.equal(cancelled.cancelled, true)
  assert.equal(cancelled.nextForm, current)
  const applied = importPromptJson('{"title":"Nouveau","seo":{"suggestedSlug":"suggestion"}}', current)
  assert.equal(applied.nextForm.title, 'Nouveau')
  assert.equal(applied.nextForm.summary, 'Conserver')
  assert.equal(applied.nextForm.slug, 'slug-technique')
  assert.equal(applied.nextForm.seo.suggestedSlug, 'suggestion')
})
