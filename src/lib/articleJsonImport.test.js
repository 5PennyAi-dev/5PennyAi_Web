import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createEmptyArticleForm } from './articleFormData.js'
import { analyzeArticleJson, importArticleJson } from './articleJsonImport.js'

const fixtures = [
  ['débutant', 'modele-de-fondation-ia.article.json', 'beginner'],
  ['intermédiaire', 'rag-ou-reglage-fin-adapter-application-llm.article.json', 'intermediate'],
  ['avancé', 'evaluation-recuperation-rag.v2-accepted.article.json', 'advanced'],
]

test('importe un objet vide sans modifier un formulaire vide', () => {
  const current = createEmptyArticleForm()
  const result = importArticleJson('{}', current)
  assert.equal(result.success, true)
  assert.deepEqual(result.patch, {})
  assert.deepEqual(result.nextForm, current)
})

test('importe un objet partiel sans effacer les propriétés absentes', () => {
  const current = createEmptyArticleForm()
  current.summary = 'Résumé conservé'
  current.infographicAltText = 'Alt conservé'
  current.infographicPath = 'articles/article/infographic/existante.webp'
  current.coverPath = 'articles/article/cover/existante.webp'
  current.articleMediaAssets = [{ media_key: 'schema', storage_path: 'media.webp' }]
  const result = importArticleJson(
    JSON.stringify({ title: 'Titre importé', series: { name: 'Série' } }),
    current,
  )
  assert.equal(result.nextForm.title, 'Titre importé')
  assert.equal(result.nextForm.summary, 'Résumé conservé')
  assert.equal(result.nextForm.series.name, 'Série')
  assert.equal(result.nextForm.infographicAltText, 'Alt conservé')
  assert.equal(result.nextForm.infographicPath, current.infographicPath)
  assert.equal(result.nextForm.coverPath, current.coverPath)
  assert.deepEqual(result.nextForm.articleMediaAssets, current.articleMediaAssets)
})

for (const [label, filename, level] of fixtures) {
  test(`importe la fixture ${label}`, () => {
    const json = readFileSync(
      new URL(`../../docs/ressources-ia/fixtures/articles/${filename}`, import.meta.url),
      'utf8',
    )
    const result = importArticleJson(json, createEmptyArticleForm())
    assert.equal(result.success, true)
    assert.equal(result.nextForm.level, level)
    assert.equal(result.nextForm.contentType, 'article')
    assert.ok(result.nextForm.title.length > 0)
    assert.ok(result.nextForm.contentMarkdown.length > 0)
    assert.ok(result.nextForm.sources.length > 0)
  })
}

test('les erreurs de syntaxe et de racine laissent le même formulaire intact', () => {
  const current = createEmptyArticleForm()
  current.title = 'Ne pas modifier'

  for (const json of ['{"title":', 'null', '[]', '"texte"', '42', 'true']) {
    const result = importArticleJson(json, current)
    assert.equal(result.success, false)
    assert.equal(result.nextForm, current)
    assert.equal(result.nextForm.title, 'Ne pas modifier')
  }
})

test('ignore une propriété inconnue et les propriétés techniques de statut', () => {
  const result = importArticleJson(
    JSON.stringify({ title: 'Titre', visualMood: 'sobre', slug: 'slug-interdit', status: 'published', publishedAt: '2026-08-01' }),
    createEmptyArticleForm(),
  )
  assert.equal(result.nextForm.title, 'Titre')
  assert.equal(result.nextForm.slug, '')
  assert.deepEqual(result.unknown, ['visualMood'])
  assert.deepEqual(result.forbidden, ['slug', 'status', 'publishedAt'])
  assert.equal('status' in result.nextForm, false)
})

test('refuse toutes les variantes techniques d’infographie sans écraser l’asset courant', () => {
  const current = createEmptyArticleForm()
  current.infographicAltText = 'Alt actuel'
  current.infographicPath = 'articles/article/infographic/actuelle.webp'
  const forbidden = {
    infographicPath: 'foreign/a.webp',
    infographicUrl: 'https://example.com/a.webp',
    articleInfographicPath: 'foreign/b.webp',
    articleInfographicUrl: 'https://example.com/b.webp',
    companionInfographicPath: 'foreign/c.webp',
    infographic_path: 'foreign/d.webp',
    article_infographic_path: 'foreign/e.webp',
  }
  const result = importArticleJson(JSON.stringify({ title: 'Titre importé', ...forbidden }), current)
  assert.equal(result.nextForm.title, 'Titre importé')
  assert.equal(result.nextForm.infographicPath, current.infographicPath)
  assert.equal(result.nextForm.infographicAltText, 'Alt actuel')
  assert.deepEqual(result.forbidden, Object.keys(forbidden))
  assert.ok(result.warnings.every(({ code }) => code === 'forbiddenProperty'))
})

test('conserve les enums inconnues de bon type et avertit', () => {
  const result = importArticleJson(
    JSON.stringify({
      schemaVersion: 2,
      contentType: 'tutorial',
      language: 'french',
      level: 'expert',
    }),
    createEmptyArticleForm(),
  )

  assert.equal(result.nextForm.schemaVersion, '2')
  assert.equal(result.nextForm.contentType, 'tutorial')
  assert.equal(result.nextForm.language, 'french')
  assert.equal(result.nextForm.level, 'expert')
  assert.deepEqual(
    result.warnings.map(({ code }) => code),
    ['unsupportedSchemaVersion', 'unexpectedContentType', 'unknownLanguage', 'unknownLevel'],
  )
})

test('conserve les sous-objets partiellement valides', () => {
  const result = importArticleJson(
    JSON.stringify({
      media: [{ key: 'schema', required: 'oui', extra: true }],
      sources: [{ title: 'Source', authors: ['Alice', 42] }],
      seo: { metaDescription: 'Description', primaryQuery: false },
    }),
    createEmptyArticleForm(),
  )

  assert.deepEqual(result.nextForm.media, [{ key: 'schema' }])
  assert.deepEqual(result.nextForm.sources, [{ title: 'Source', authors: ['Alice'] }])
  assert.equal(result.nextForm.seo.metaDescription, 'Description')
  assert.equal(result.nextForm.seo.primaryQuery, '')
  assert.ok(result.warnings.some(({ path }) => path === 'media[0].required'))
  assert.ok(result.unknown.includes('media[0].extra'))
})

test('une confirmation annulée conserve strictement le formulaire', () => {
  const current = createEmptyArticleForm()
  current.title = 'Titre actuel'
  const result = importArticleJson('{"title":"Nouveau titre"}', current, { confirmed: false })
  assert.equal(result.success, true)
  assert.equal(result.cancelled, true)
  assert.equal(result.nextForm, current)
})

test('analyse séparément sans appliquer ni sauvegarder', () => {
  const analysis = analyzeArticleJson('{"title":"Titre"}')
  assert.deepEqual(analysis.patch, { title: 'Titre' })
  assert.deepEqual(analysis.imported, ['title'])
  assert.equal('nextForm' in analysis, false)
})
