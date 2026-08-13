import assert from 'node:assert/strict'
import test from 'node:test'
import { Buffer } from 'node:buffer'
import {
  createDependencies,
  validatePromptThumbnailRequestBody,
} from './generate-prompt-thumbnail.js'
import { PROMPT_THUMBNAIL_SOURCE_SIZE } from './_lib/promptThumbnail.js'

test('utilise images.generate sans image source, une seule fois avec gpt-image-2', async () => {
  const calls = []
  const openai = { images: { generate: async (params) => {
    calls.push(params)
    return { data: [{ b64_json: Buffer.from('generated-image').toString('base64') }] }
  } } }
  const dependencies = createDependencies({ supabase: {}, openai })
  const result = await dependencies.generateImage('prompt-thumbnail-v1')
  assert.equal(calls.length, 1)
  assert.equal(calls[0].model, 'gpt-image-2')
  assert.equal(calls[0].size, PROMPT_THUMBNAIL_SOURCE_SIZE)
  assert.equal(calls[0].n, 1)
  assert.equal('image' in calls[0], false)
  assert.equal(calls[0].output_format, 'webp')
  assert.equal(result.buffer.toString(), 'generated-image')
})

test('accepte exactement promptId et refuse tout champ client supplémentaire', () => {
  const promptId = '123e4567-e89b-42d3-a456-426614174000'
  assert.deepEqual(validatePromptThumbnailRequestBody({ promptId }), { promptId })
  assert.throws(() => validatePromptThumbnailRequestBody({ promptId, title: 'client' }), (error) => error.code === 'invalid_prompt_id')
  assert.throws(() => validatePromptThumbnailRequestBody({ promptId: 'invalid' }), (error) => error.code === 'invalid_prompt_id')
})

test('convertit les réponses absentes, vides et erreurs fournisseur en erreurs contrôlées', async () => {
  for (const response of [{ data: [] }, { data: [{ b64_json: '' }] }]) {
    const dependencies = createDependencies({
      supabase: {}, openai: { images: { generate: async () => response } },
    })
    await assert.rejects(dependencies.generateImage('prompt'), (error) => error.status === 502)
  }
  const dependencies = createDependencies({
    supabase: {}, openai: { images: { generate: async () => { throw new Error('provider') } } },
  })
  await assert.rejects(dependencies.generateImage('prompt'), (error) => error.code === 'provider_failed')
})

test('récupère les champs éditoriaux côté serveur et met à jour thumbnail_path seulement', async () => {
  const events = []
  const row = {
    id: '123e4567-e89b-42d3-a456-426614174000', status: 'published',
    published_at: '2026-08-13T10:00:00.000Z', thumbnail_path: null,
  }
  const supabase = {
    from(table) {
      assert.equal(table, 'prompts')
      const query = {
        select(columns) { events.push(['select', columns]); return query },
        update(payload) { events.push(['update', payload]); return query },
        eq(column, value) { events.push(['eq', column, value]); return query },
        is(column, value) { events.push(['is', column, value]); return query },
        async maybeSingle() { return { data: row, error: null } },
      }
      return query
    },
  }
  const dependencies = createDependencies({ supabase, openai: {} })
  await dependencies.getPrompt(row.id)
  const selected = events.find(([name]) => name === 'select')[1]
  for (const field of ['title', 'summary', 'category', 'editorial_objective', 'thumbnail']) assert.match(selected, new RegExp(field))
  for (const field of ['prompt_template', 'variables', 'seo', 'slug']) assert.doesNotMatch(selected, new RegExp(field))

  events.length = 0
  await dependencies.updateThumbnailPath(row.id, null, 'prompts/new.webp')
  assert.deepEqual(events.find(([name]) => name === 'update')[1], { thumbnail_path: 'prompts/new.webp' })
  assert.equal(events.some(([name, column]) => name === 'is' && column === 'thumbnail_path'), true)
  assert.equal(events.some(([name]) => name === 'update' && ('status' in events[0][1] || 'published_at' in events[0][1])), false)
})
