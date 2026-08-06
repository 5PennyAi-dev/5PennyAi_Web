import test from 'node:test'
import assert from 'node:assert/strict'
import { handleResourceSocialPosts } from './generate-resource-social-posts.js'
import { ResourcesAdminAuthError } from './_lib/resourcesAdminAuth.js'
import { ResourceSocialError } from './_lib/resourceSocialValidation.js'

const ID = '123e4567-e89b-12d3-a456-426614174000'
const CONTEXT = {
  id: ID,
  resourceType: 'article',
  language: 'fr',
  title: 'Article',
  mainIdea: 'Une idée.',
  supportingContext: '',
}

test('refuse toute méthode autre que POST avec Allow', async () => {
  const response = createResponse()
  await handleResourceSocialPosts({ method: 'GET' }, response, {})
  assert.equal(response.statusCode, 405)
  assert.deepEqual(response.headers, { Allow: 'POST' })
  assert.deepEqual(response.body, { error: 'method_not_allowed' })
})

test('retourne les erreurs d’authentification avant tout chargement éditorial', async () => {
  let loaded = false
  for (const authError of [
    new ResourcesAdminAuthError('unauthenticated', 401),
    new ResourcesAdminAuthError('forbidden', 403),
  ]) {
    const response = createResponse()
    await handleResourceSocialPosts(postRequest(), response, {
      environment: { OPENAI_API_KEY: 'test' },
      supabase: {},
      authorize: async () => { throw authError },
      loadContext: async () => { loaded = true },
      logger: quietLogger(),
    })
    assert.equal(response.statusCode, authError.status)
    assert.equal(response.body.error, authError.code)
  }
  assert.equal(loaded, false)
})

test('refuse une requête invalide avant de charger la ressource', async () => {
  let loaded = false
  const response = createResponse()
  await handleResourceSocialPosts({ method: 'POST', body: { resourceType: 'video', resourceId: ID } }, response, {
    environment: { OPENAI_API_KEY: 'test' },
    supabase: {},
    authorize: async () => {},
    loadContext: async () => { loaded = true },
    logger: quietLogger(),
  })
  assert.equal(response.statusCode, 400)
  assert.deepEqual(response.body, { error: 'invalid_request' })
  assert.equal(loaded, false)
})

test('retourne server_not_configured lorsque OPENAI_API_KEY est absente', async () => {
  const response = createResponse()
  await handleResourceSocialPosts(postRequest(), response, {
    environment: {},
    supabase: {},
    authorize: async () => {},
    logger: quietLogger(),
  })
  assert.equal(response.statusCode, 500)
  assert.deepEqual(response.body, { error: 'server_not_configured' })
})

test('retourne resource_not_found et les erreurs de préparation contrôlées', async () => {
  for (const failure of [
    ['resource_not_found', 404],
    ['resource_not_ready', 422],
    ['insufficient_content', 422],
  ]) {
    const response = createResponse()
    await handleResourceSocialPosts(postRequest(), response, {
      environment: { OPENAI_API_KEY: 'test' },
      supabase: {},
      authorize: async () => {},
      loadContext: async () => { throw new ResourceSocialError(failure[0], failure[1]) },
      logger: quietLogger(),
    })
    assert.equal(response.statusCode, failure[1])
    assert.equal(response.body.error, failure[0])
  }
})

test('assemble la réponse complète avec les métadonnées ajoutées par le serveur', async () => {
  const response = createResponse()
  const generated = {
    facebook: { body: 'Facebook 📚', hashtags: ['#IA', '#Article'] },
    linkedin: { body: 'LinkedIn 🧠', hashtags: ['#IA', '#Article'] },
  }
  const calls = []
  await handleResourceSocialPosts(postRequest(), response, {
    environment: { OPENAI_API_KEY: 'test' },
    supabase: { marker: true },
    openai: { mocked: true },
    authorize: async (req, supabase) => calls.push(['authorize', req, supabase]),
    loadContext: async (supabase, type, id) => { calls.push(['load', supabase, type, id]); return CONTEXT },
    generate: async (params) => { calls.push(['generate', params]); return generated },
    logger: quietLogger(),
  })
  assert.equal(response.statusCode, 200)
  assert.deepEqual(response.body, {
    schemaVersion: 1,
    resourceType: 'article',
    resourceId: ID,
    language: 'fr',
    ...generated,
  })
  assert.equal(calls[1][2], 'article')
  assert.equal(calls[2][1].platform, undefined)
})

test('assemble une réponse ciblée contenant seulement Facebook', async () => {
  const response = createResponse()
  await handleResourceSocialPosts(postRequest('facebook'), response, {
    environment: { OPENAI_API_KEY: 'test' },
    supabase: {},
    openai: {},
    authorize: async () => {},
    loadContext: async () => ({ ...CONTEXT, resourceType: 'infographic', language: 'fr' }),
    generate: async ({ platform }) => ({
      [platform]: { body: 'Facebook 📊', hashtags: ['#IA', '#Infographie'] },
    }),
    logger: quietLogger(),
  })
  assert.equal(response.statusCode, 200)
  assert.equal(response.body.resourceType, 'infographic')
  assert.deepEqual(Object.keys(response.body), [
    'schemaVersion', 'resourceType', 'resourceId', 'language', 'facebook',
  ])
})

test('ne retourne jamais le détail sensible d’une erreur fournisseur', async () => {
  const response = createResponse()
  await handleResourceSocialPosts(postRequest(), response, {
    environment: { OPENAI_API_KEY: 'test' },
    supabase: {},
    openai: {},
    authorize: async () => {},
    loadContext: async () => CONTEXT,
    generate: async () => { throw new ResourceSocialError('provider_failed', 502) },
    logger: quietLogger(),
  })
  assert.deepEqual(response.body, { error: 'provider_failed' })
  assert.doesNotMatch(JSON.stringify(response.body), /secret|payload/)
})

function postRequest(platform) {
  return {
    method: 'POST',
    headers: { authorization: 'Bearer token' },
    body: {
      resourceType: platform ? 'infographic' : 'article',
      resourceId: ID,
      ...(platform ? { platform } : {}),
    },
  }
}

function createResponse() {
  return {
    headers: {},
    setHeader(name, value) { this.headers[name] = value },
    status(code) { this.statusCode = code; return this },
    json(body) { this.body = body; return this },
  }
}

function quietLogger() {
  return { info() {}, error() {} }
}
