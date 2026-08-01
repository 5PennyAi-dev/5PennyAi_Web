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
    series_name: 'Série',
    episode_number: 3,
    learning_objectives: ['Objectif'],
    media: [{ key: 'schema', kind: 'custom' }],
    cover: { altText: 'Alt' },
    seo: { searchIntent: 'commercial', secondaryQueries: ['requête'] },
  })

  assert.equal(form.schemaVersion, '2')
  assert.equal(form.contentType, 'tutorial')
  assert.deepEqual(form.series, { name: 'Série', episodeNumber: '3' })
  assert.deepEqual(form.media, [{ key: 'schema', kind: 'custom' }])
  assert.equal(form.cover.altText, 'Alt')
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
  form.seo = { ...form.seo, searchIntent: 'commercial' }

  const payload = articleFormToDraftPayload(form)

  assert.equal(payload.title, '  Titre conservé  ')
  assert.equal(payload.slug, 'evaluer-le-rag')
  assert.equal(payload.status, 'draft')
  assert.equal(payload.published_at, null)
  assert.deepEqual(payload.media, [{ key: 'media-1', required: true }])
  assert.equal(payload.seo.searchIntent, 'commercial')
})
