import test from 'node:test'
import assert from 'node:assert/strict'
import { Buffer } from 'node:buffer'
import {
  authorizeResourceThumbnailRequest,
  editResourceThumbnail,
} from './generate-resource-thumbnail.js'

test('refuse un appel non authentifié avant toute vérification distante', async () => {
  let authCalled = false
  const supabase = {
    auth: {
      getUser: async () => {
        authCalled = true
        return { data: {}, error: null }
      },
    },
  }

  await assert.rejects(
    authorizeResourceThumbnailRequest({ headers: {} }, supabase),
    (error) => error.code === 'unauthenticated' && error.status === 401,
  )
  assert.equal(authCalled, false)
})

test('refuse un utilisateur authentifié qui ne correspond pas à l’administrateur', async () => {
  const supabase = {
    auth: {
      getUser: async () => ({
        data: { user: { id: 'user-id', email: 'someone@example.com' } },
        error: null,
      }),
    },
  }

  await assert.rejects(
    authorizeResourceThumbnailRequest(
      { headers: { authorization: 'Bearer valid-token' } },
      supabase,
    ),
    (error) => error.code === 'forbidden' && error.status === 403,
  )
})

test('accepte le jeton Supabase de l’administrateur attendu', async () => {
  const user = { id: 'admin-id', email: 'christian.couillard@5pennyai.com' }
  const supabase = {
    auth: { getUser: async (token) => ({ data: { user: { ...user, token } }, error: null }) },
  }

  const result = await authorizeResourceThumbnailRequest(
    { headers: { authorization: 'Bearer valid-token' } },
    supabase,
  )
  assert.equal(result.email, user.email)
  assert.equal(result.token, 'valid-token')
})

test('utilise images.edit avec une seule référence et une seule sortie gpt-image-2', async () => {
  const referenceBuffer = Buffer.from('reference-image')
  const uploadable = { name: 'reference.png', type: 'image/png' }
  const calls = []
  const openai = {
    images: {
      edit: async (params) => {
        calls.push(params)
        return { data: [{ b64_json: Buffer.from('generated-image').toString('base64') }] }
      },
    },
  }

  const result = await editResourceThumbnail({
    openai,
    prompt: 'THUMBNAIL SKILL — VERSION thumbnail-skill-v3',
    reference: {
      buffer: referenceBuffer,
      mimeType: 'image/png',
      path: 'resource-id/reference.png',
    },
    toFileImpl: async (buffer, name, options) => {
      assert.strictEqual(buffer, referenceBuffer)
      assert.equal(name, 'reference.png')
      assert.deepEqual(options, { type: 'image/png' })
      return uploadable
    },
  })

  assert.equal(calls.length, 1)
  assert.strictEqual(calls[0].image, uploadable)
  assert.equal(Array.isArray(calls[0].image), false)
  assert.equal(calls[0].model, 'gpt-image-2')
  assert.match(calls[0].prompt, /thumbnail-skill-v3/)
  assert.equal(calls[0].size, '1280x720')
  assert.equal(calls[0].quality, 'medium')
  assert.equal(calls[0].output_format, 'webp')
  assert.equal(calls[0].output_compression, 85)
  assert.equal(calls[0].n, 1)
  assert.equal(result.buffer.toString(), 'generated-image')
  assert.equal(result.mimeType, 'image/webp')
})

test('produit une erreur contrôlée lorsque images.edit ne renvoie pas exactement une image', async () => {
  const openai = { images: { edit: async () => ({ data: [] }) } }
  await assert.rejects(
    editResourceThumbnail({
      openai,
      prompt: 'thumbnail-skill-v3',
      reference: { buffer: Buffer.from('reference'), mimeType: 'image/png', path: 'r/ref.png' },
      toFileImpl: async () => ({ name: 'ref.png' }),
    }),
    (error) => error.code === 'provider_invalid_image_count' && error.status === 502,
  )
})
