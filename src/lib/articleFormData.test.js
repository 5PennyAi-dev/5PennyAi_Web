import test from 'node:test'
import assert from 'node:assert/strict'
import {
  articleFormToDraftPayload,
  articleRowToForm,
  createEmptyArticleForm,
} from './articleFormData.js'

test('transforme une ligne Supabase en formulaire sans perdre les structures JSON', () => {
  const form = articleRowToForm({
    schema_version: 2,
    content_type: 'tutorial',
    title: 'Titre',
    learning_objectives: ['Objectif'],
    media: [{ key: 'schema', kind: 'custom' }],
    cover: { altText: 'Alt' },
    infographic_path: 'articles/technique.webp',
    infographic_alt_text: 'Synthèse accessible',
    seo: { searchIntent: 'commercial', secondaryQueries: ['requête'] },
  })

  assert.equal(form.schemaVersion, '2')
  assert.equal(form.contentType, 'tutorial')
  assert.equal('series' in form, false)
  assert.deepEqual(form.media, [{ key: 'schema', kind: 'custom' }])
  assert.equal(form.cover.altText, 'Alt')
  assert.equal(form.infographicAltText, 'Synthèse accessible')
  assert.equal('infographicPath' in form, false)
  assert.deepEqual(form.seo.secondaryQueries, ['requête'])
  assert.equal(form.seo.searchIntent, 'commercial')
})

test('transforme le formulaire en payload de brouillon et normalise seulement le slug technique', () => {
  const form = createEmptyArticleForm()
  form.title = '  Titre conservé  '
  form.slug = 'Évaluer le RAG!'
  form.status = 'published'
  form.published_at = '2026-08-01T00:00:00Z'
  form.media = [{ key: 'media-1', required: true }]
  form.infographicAltText = ''
  form.seo = { ...form.seo, searchIntent: 'commercial' }

  const payload = articleFormToDraftPayload(form)

  assert.equal(payload.title, '  Titre conservé  ')
  assert.equal(payload.slug, 'evaluer-le-rag')
  assert.equal(payload.status, 'draft')
  assert.equal(payload.published_at, null)
  assert.deepEqual(payload.media, [{ key: 'media-1', required: true }])
  assert.equal(payload.infographic_alt_text, null)
  assert.equal('infographic_path' in payload, false)
  assert.equal('series_name' in payload, false)
  assert.equal('episode_number' in payload, false)
  assert.equal(payload.seo.searchIntent, 'commercial')
})

test('charge et sauvegarde un alt d’infographie renseigné sans rendre le chemin éditable', () => {
  const form = articleRowToForm({
    infographic_path: 'articles/technique.webp',
    infographic_alt_text: 'Diagramme de synthèse de l’article.',
  })
  assert.equal(form.infographicAltText, 'Diagramme de synthèse de l’article.')
  const payload = articleFormToDraftPayload(form)
  assert.equal(payload.infographic_alt_text, 'Diagramme de synthèse de l’article.')
  assert.equal('infographic_path' in payload, false)
})
