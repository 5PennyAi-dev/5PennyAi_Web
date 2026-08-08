import test from 'node:test'
import assert from 'node:assert/strict'
import { Buffer } from 'node:buffer'
import { readFileSync } from 'node:fs'
import { editArticleMedia } from './generate-article-media-from-infographic.js'

test('appelle images.edit avec la référence privée, gpt-image-2 et le ratio demandé', async () => {
  const calls = []
  const uploadable = { name: 'source.png' }
  const result = await editArticleMedia({
    openai: { images: { edit: async (params) => { calls.push(params); return { data: [{ b64_json: Buffer.from('image').toString('base64') }] } } } },
    prompt: 'article-media-from-infographic-v1',
    reference: { path: 'articles/id/infographic/source.png', buffer: Buffer.from('source'), mimeType: 'image/png' },
    size: '1024x1280',
    toFileImpl: async (buffer, name, options) => {
      assert.equal(buffer.toString(), 'source')
      assert.equal(name, 'source.png')
      assert.deepEqual(options, { type: 'image/png' })
      return uploadable
    },
  })
  assert.equal(calls.length, 1)
  assert.equal(calls[0].model, 'gpt-image-2')
  assert.equal(calls[0].size, '1024x1280')
  assert.equal(calls[0].n, 1)
  assert.strictEqual(calls[0].image, uploadable)
  assert.equal(calls[0].output_format, 'webp')
  assert.equal(result.mimeType, 'image/webp')
})

test('refuse une réponse fournisseur sans image', async () => {
  await assert.rejects(
    editArticleMedia({
      openai: { images: { edit: async () => ({ data: [] }) } },
      prompt: 'v1',
      reference: { path: 'source.png', buffer: Buffer.from('source'), mimeType: 'image/png' },
      size: '1280x720',
      toFileImpl: async () => ({}),
    }),
    { code: 'provider_invalid_image_count', status: 502 },
  )
})

test('configure la même limite Vercel de 300 secondes que la couverture', () => {
  const vercel = JSON.parse(readFileSync(new URL('../vercel.json', import.meta.url), 'utf8'))
  assert.equal(vercel.functions['api/generate-article-cover-from-infographic.js'].maxDuration, 300)
  assert.equal(vercel.functions['api/generate-article-media-from-infographic.js'].maxDuration, 300)
})
