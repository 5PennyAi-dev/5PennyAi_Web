import test from 'node:test'
import assert from 'node:assert/strict'
import { Buffer } from 'node:buffer'
import { readFileSync } from 'node:fs'
import { editArticleCover } from './generate-article-cover-from-infographic.js'

test('appelle images.edit une fois avec gpt-image-2 et la source privée', async () => {
  const calls = []
  const uploadable = { name: 'source.png' }
  const result = await editArticleCover({
    openai: { images: { edit: async (params) => { calls.push(params); return { data: [{ b64_json: Buffer.from('image').toString('base64') }] } } } },
    prompt: 'article-cover-from-infographic-v1',
    reference: { path: 'articles/id/infographic/source.png', buffer: Buffer.from('source'), mimeType: 'image/png' },
    toFileImpl: async (buffer, name, options) => {
      assert.equal(buffer.toString(), 'source')
      assert.equal(name, 'source.png')
      assert.deepEqual(options, { type: 'image/png' })
      return uploadable
    },
  })
  assert.equal(calls.length, 1)
  assert.equal(calls[0].model, 'gpt-image-2')
  assert.equal(calls[0].size, '1280x720')
  assert.equal(calls[0].n, 1)
  assert.strictEqual(calls[0].image, uploadable)
  assert.equal(calls[0].output_format, 'webp')
  assert.equal(result.mimeType, 'image/webp')
})

test('refuse une réponse sans image et normalise une erreur fournisseur', async () => {
  const base = { prompt: 'v1', reference: { path: 'source.png', buffer: Buffer.from('source'), mimeType: 'image/png' }, toFileImpl: async () => ({}) }
  await assert.rejects(editArticleCover({ ...base, openai: { images: { edit: async () => ({ data: [] }) } } }), { code: 'provider_invalid_image_count', status: 502 })
  await assert.rejects(editArticleCover({ ...base, openai: { images: { edit: async () => { throw new Error('secret provider detail') } } } }), { code: 'provider_failed', status: 502 })
})

test('dispose de la même limite Vercel de 300 secondes que le générateur de thumbnails', () => {
  const vercel = JSON.parse(readFileSync(new URL('../vercel.json', import.meta.url), 'utf8'))
  assert.equal(vercel.functions['api/generate-resource-thumbnail.js'].maxDuration, 300)
  assert.equal(vercel.functions['api/generate-article-cover-from-infographic.js'].maxDuration, 300)
})
