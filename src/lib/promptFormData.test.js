import assert from 'node:assert/strict'
import test from 'node:test'
import {
  applyPromptImportPatch,
  createEmptyPromptForm,
  promptFormToDraftPayload,
  promptRowToForm,
} from './promptFormData.js'

test('convertit formulaire et ligne sans persister exemple calculé', () => {
  const form = createEmptyPromptForm()
  form.title = 'Titre'
  form.slug = 'Mon Slug'
  form.contexts = ['work']
  form.variables = [{ key: 'SUJET', example: 'IA' }]
  const payload = promptFormToDraftPayload(form)
  assert.equal(payload.slug, 'mon-slug')
  assert.equal(payload.status, 'draft')
  assert.equal(payload.published_at, null)
  assert.equal('example_prompt' in payload, false)
  assert.deepEqual(promptRowToForm({ ...payload, schema_version: 1 }).variables, form.variables)
})

test('un patch éditorial ne remplace jamais le slug technique', () => {
  const current = { ...createEmptyPromptForm(), slug: 'technique', thumbnail: { ...createEmptyPromptForm().thumbnail, altText: 'ancien' } }
  const next = applyPromptImportPatch(current, { slug: 'interdit', thumbnail: { generationBrief: 'nouveau' } })
  assert.equal(next.slug, 'technique')
  assert.equal(next.thumbnail.altText, 'ancien')
  assert.equal(next.thumbnail.generationBrief, 'nouveau')
})
