import test from 'node:test'
import assert from 'node:assert/strict'
import { Buffer } from 'node:buffer'
import {
  authorizeSeriesThumbnailRequest,
  editSeriesThumbnail,
} from './generate-series-thumbnail.js'

test('refuse une requête sans jeton et un utilisateur non administrateur', async () => {
  let called = false
  const unauthenticatedClient = {
    auth: { getUser: async () => { called = true; return { data: {}, error: null } } },
  }
  await assert.rejects(
    authorizeSeriesThumbnailRequest({ headers: {} }, unauthenticatedClient),
    (error) => error.code === 'unauthenticated' && error.status === 401,
  )
  assert.equal(called, false)

  const unauthorizedClient = {
    auth: {
      getUser: async () => ({ data: { user: { email: 'other@example.com' } }, error: null }),
    },
  }
  await assert.rejects(
    authorizeSeriesThumbnailRequest(
      { headers: { authorization: 'Bearer token' } },
      unauthorizedClient,
    ),
    (error) => error.code === 'forbidden' && error.status === 403,
  )
})

test('transmet plusieurs références au SDK et demande une seule sortie WebP 1280 × 720', async () => {
  const calls = []
  const references = [
    { buffer: Buffer.from('one'), path: 'one.webp', mimeType: 'image/webp' },
    { buffer: Buffer.from('two'), path: 'two.png', mimeType: 'image/png' },
  ]
  const result = await editSeriesThumbnail({
    openai: {
      images: {
        edit: async (params) => {
          calls.push(params)
          return { data: [{ b64_json: Buffer.from('generated').toString('base64') }] }
        },
      },
    },
    prompt: 'series-thumbnail-skill-v1',
    references,
    toFileImpl: async (buffer, name, options) => ({ buffer, name, ...options }),
  })

  assert.equal(calls.length, 1)
  assert.equal(calls[0].image.length, 2)
  assert.equal(calls[0].image[0].name, 'one.webp')
  assert.equal(calls[0].model, 'gpt-image-2')
  assert.equal(calls[0].size, '1280x720')
  assert.equal(calls[0].quality, 'medium')
  assert.equal(calls[0].output_format, 'webp')
  assert.equal(calls[0].output_compression, 85)
  assert.equal(calls[0].n, 1)
  assert.equal(result.buffer.toString(), 'generated')
})

test('refuse un appel sans référence ou une réponse fournisseur sans image', async () => {
  await assert.rejects(
    editSeriesThumbnail({ openai: {}, prompt: 'prompt', references: [] }),
    (error) => error.code === 'no_usable_references',
  )
  await assert.rejects(
    editSeriesThumbnail({
      openai: { images: { edit: async () => ({ data: [] }) } },
      prompt: 'prompt',
      references: [{ buffer: Buffer.from('one'), path: 'one.webp', mimeType: 'image/webp' }],
      toFileImpl: async () => ({}),
    }),
    (error) => error.code === 'provider_invalid_image_count',
  )
})
