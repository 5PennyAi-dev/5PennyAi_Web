import assert from 'node:assert/strict'
import test from 'node:test'
import {
  buildResourceSocialPublicUrl,
  buildSocialPostCopyText,
  countSocialPostCharacters,
  getResourceSocialDisabledReason,
  getSocialHashtagState,
  getSocialPostLengthState,
  hashtagsToInput,
  normalizeSocialHashtags,
  requestResourceSocialPosts,
  ResourceSocialPostsRequestError,
} from './resourceSocialPosts.js'

const ID = '123e4567-e89b-12d3-a456-426614174000'

test('assemble le corps, l’URL et les hashtags dans l’ordre sans lignes superflues', () => {
  assert.equal(
    buildSocialPostCopyText({
      body: '  Une accroche.  ',
      publicUrl: ' https://5pennyai.com/ressources-ia/articles/test ',
      hashtags: ['#IA', '', '#RAG'],
    }),
    'Une accroche.\n\nhttps://5pennyai.com/ressources-ia/articles/test\n\n#IA #RAG',
  )
  assert.equal(buildSocialPostCopyText({ body: '', publicUrl: 'https://5pennyai.com/x', hashtags: [] }), 'https://5pennyai.com/x')
  assert.equal(buildSocialPostCopyText({ body: 'Texte', publicUrl: '', hashtags: '' }), 'Texte')
})

test('normalise les hashtags édités, ignore les vides et déduplique en conservant l’ordre', () => {
  assert.deepEqual(normalizeSocialHashtags(['#IA', ' RAG ', '', '#IA']), ['#IA', '#RAG'])
  assert.deepEqual(normalizeSocialHashtags(' #IA   RAG #IA '), ['#IA', '#RAG'])
  assert.equal(hashtagsToInput(['IA', '#RAG']), '#IA #RAG')
  assert.deepEqual(normalizeSocialHashtags(null), [])
})

test('compte les points de code Unicode du corps seulement et classe les cibles', () => {
  assert.equal(countSocialPostCharacters('é🙂'), 2)
  assert.equal(countSocialPostCharacters('Texte'), 5)
  assert.deepEqual(getSocialPostLengthState('facebook', 'a'.repeat(150)), { count: 150, state: 'inTarget' })
  assert.equal(getSocialPostLengthState('facebook', 'court').state, 'underTarget')
  assert.equal(getSocialPostLengthState('facebook', 'a'.repeat(351)).state, 'overTarget')
  assert.equal(getSocialPostLengthState('facebook', 'a'.repeat(451)).state, 'overMaximum')
  assert.equal(getSocialPostLengthState('linkedin', 'a'.repeat(551)).state, 'overMaximum')
  assert.equal(getSocialHashtagState('linkedin', '#IA #RAG').state, 'inTarget')
  assert.equal(getSocialHashtagState('facebook', '#IA').state, 'outsideTarget')
})

test('construit uniquement les URL publiques canoniques exploitables', () => {
  assert.equal(buildResourceSocialPublicUrl({ resourceType: 'article', resourceId: ID, persistedSlug: 'mon-article' }), 'https://5pennyai.com/ressources-ia/articles/mon-article')
  assert.equal(buildResourceSocialPublicUrl({ resourceType: 'article', resourceId: ID, persistedSlug: 'Mon Article' }), '')
  assert.equal(buildResourceSocialPublicUrl({ resourceType: 'article', resourceId: ID, persistedSlug: '' }), '')
  assert.equal(buildResourceSocialPublicUrl({ resourceType: 'infographic', resourceId: ID }), `https://5pennyai.com/ressources-ia/infographies/${ID}`)
  assert.equal(buildResourceSocialPublicUrl({ resourceType: 'infographic', resourceId: '' }), '')
  assert.equal(getResourceSocialDisabledReason({ resourceType: 'article', resourceId: null }), 'unsaved')
  assert.equal(getResourceSocialDisabledReason({ resourceType: 'article', resourceId: ID, persistedSlug: '' }), 'slugRequired')
  assert.doesNotMatch(buildResourceSocialPublicUrl({ resourceType: 'article', resourceId: ID, persistedSlug: 'test' }), /localhost|\/admin\//)
})

test('envoie la requête authentifiée complète et ciblée', async () => {
  const calls = []
  const fetchImpl = async (url, options) => {
    calls.push({ url, options })
    return { ok: true, status: 200, json: async () => ({ facebook: { body: 'F', hashtags: ['#IA'] }, linkedin: { body: 'L', hashtags: ['#IA'] } }) }
  }
  await requestResourceSocialPosts({ fetchImpl, getAccessToken: async () => 'token-secret', resourceId: ID, resourceType: 'article' })
  assert.equal(calls[0].url, '/api/generate-resource-social-posts')
  assert.equal(calls[0].options.headers.Authorization, 'Bearer token-secret')
  assert.deepEqual(JSON.parse(calls[0].options.body), { resourceType: 'article', resourceId: ID })

  calls.length = 0
  await requestResourceSocialPosts({
    fetchImpl: async (url, options) => {
      calls.push({ url, options })
      return { ok: true, status: 200, json: async () => ({ facebook: { body: 'Nouveau', hashtags: ['#IA'] } }) }
    },
    getAccessToken: async () => 'token-secret', resourceId: ID, resourceType: 'article', platform: 'facebook',
  })
  assert.equal(JSON.parse(calls[0].options.body).platform, 'facebook')
})

test('refuse une session absente et conserve les codes serveur', async () => {
  await assert.rejects(
    requestResourceSocialPosts({ getAccessToken: async () => null, resourceId: ID, resourceType: 'article' }),
    (error) => error instanceof ResourceSocialPostsRequestError && error.code === 'unauthenticated',
  )
  await assert.rejects(
    requestResourceSocialPosts({
      fetchImpl: async () => ({ ok: false, status: 422, json: async () => ({ error: 'insufficient_content' }) }),
      getAccessToken: async () => 'token', resourceId: ID, resourceType: 'article',
    }),
    (error) => error.code === 'insufficient_content' && error.status === 422,
  )
})

test('conserve les principaux codes d’erreur contrôlés de l’endpoint', async () => {
  const cases = [
    [400, 'invalid_request'],
    [401, 'unauthenticated'],
    [403, 'forbidden'],
    [404, 'resource_not_found'],
    [422, 'resource_not_ready'],
    [500, 'server_not_configured'],
    [502, 'provider_failed'],
    [502, 'invalid_provider_output'],
  ]
  for (const [status, code] of cases) {
    await assert.rejects(
      requestResourceSocialPosts({
        fetchImpl: async () => ({ ok: false, status, json: async () => ({ error: code }) }),
        getAccessToken: async () => 'token', resourceId: ID, resourceType: 'article',
      }),
      (error) => error.code === code && error.status === status,
    )
  }
})
