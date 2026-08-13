import assert from 'node:assert/strict'
import { Buffer } from 'node:buffer'
import test from 'node:test'
import { createPromptSocialImageHandler } from './prompt-social-image.js'

const PROMPT_ID = '11111111-1111-4111-8111-111111111111'
const THUMBNAIL_ID = '22222222-2222-4222-8222-222222222222'
const THUMBNAIL_PATH = `prompts/${PROMPT_ID}/thumbnail/${THUMBNAIL_ID}.webp`
const ENV = { VITE_SUPABASE_URL: 'https://example.supabase.co', VITE_SUPABASE_ANON_KEY: 'anon-key' }

test('proxifie le thumbnail d’un Prompt publié avec le MIME réel', async () => {
  const calls = []
  const fetchImpl = async (url) => {
    calls.push(String(url))
    if (String(url).includes('/rest/v1/prompts')) return jsonResponse([publishedPrompt()])
    if (String(url).includes('/storage/v1/object/sign/article-assets/opaque')) {
      return new Response(new Uint8Array([1, 2, 3]), { headers: { 'content-type': 'image/webp' } })
    }
    if (String(url).includes('/storage/v1/object/sign/')) {
      return jsonResponse({ signedURL: '/object/sign/article-assets/opaque?token=temporaire' })
    }
    throw new Error(`Unexpected URL: ${url}`)
  }
  const res = mockResponse()
  await createPromptSocialImageHandler({ env: ENV, fetchImpl })({
    method: 'GET',
    url: '/api/prompt-social-image/prompt-public',
  }, res)
  assert.equal(res.statusCode, 200)
  assert.equal(res.headers['content-type'], 'image/webp')
  assert.equal(Buffer.from(res.body).length, 3)
  assert.ok(calls.some((url) => url.includes('status=eq.published')))
})

test('retourne le fallback pour une publication sans thumbnail ou un objet Storage absent', async () => {
  const absent = mockResponse()
  await createPromptSocialImageHandler({
    env: ENV,
    fetchImpl: async () => jsonResponse([publishedPrompt({ slug: 'sans-image', thumbnail_path: null })]),
  })({ method: 'GET', url: '/api/prompt-social-image?slug=sans-image' }, absent)
  assert.equal(absent.statusCode, 302)
  assert.equal(absent.headers.location, 'https://5pennyai.com/images/og-christian.jpg')

  let call = 0
  const missing = mockResponse()
  await createPromptSocialImageHandler({ env: ENV, logger: { warn() {} }, fetchImpl: async () => {
    call += 1
    if (call === 1) return jsonResponse([publishedPrompt()])
    if (call === 2) return jsonResponse({ signedURL: '/object/sign/article-assets/missing?token=x' })
    return new Response('absent', { status: 404, headers: { 'content-type': 'text/plain' } })
  } })({ method: 'GET', url: '/api/prompt-social-image/prompt-public' }, missing)
  assert.equal(missing.statusCode, 302)
})

test('refuse brouillon, slug inconnu et chemin invalide sans signer ni révéler Storage', async () => {
  for (const rows of [[], [publishedPrompt({ status: 'draft' })], [publishedPrompt({ thumbnail_path: 'autre/secret.webp' })]]) {
    let calls = 0
    const res = mockResponse()
    await createPromptSocialImageHandler({ env: ENV, fetchImpl: async () => {
      calls += 1
      return jsonResponse(rows)
    } })({ method: 'GET', url: '/api/prompt-social-image/prompt-public' }, res)
    if (rows[0]?.status === 'published') {
      assert.equal(res.statusCode, 302)
    } else {
      assert.equal(res.statusCode, 404)
    }
    assert.equal(calls, 1)
    assert.doesNotMatch(String(res.body), /storage|thumbnail|secret/i)
  }
})

function publishedPrompt(overrides = {}) {
  return {
    id: PROMPT_ID,
    slug: 'prompt-public',
    title: 'Prompt public',
    summary: 'Résumé',
    language: 'fr',
    seo: {},
    thumbnail: {},
    thumbnail_path: THUMBNAIL_PATH,
    published_at: '2026-08-13T00:00:00Z',
    updated_at: '2026-08-13T01:00:00Z',
    status: 'published',
    ...overrides,
  }
}

function jsonResponse(value) {
  return new Response(JSON.stringify(value), { status: 200, headers: { 'content-type': 'application/json' } })
}

function mockResponse() {
  return {
    body: '',
    headers: {},
    statusCode: 200,
    setHeader(name, value) { this.headers[name.toLowerCase()] = value },
    end(value = '') { this.body = value },
  }
}
