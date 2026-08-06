import test from 'node:test'
import assert from 'node:assert/strict'
import {
  authorizeResourcesAdminRequest,
  createResourcesServerClient,
} from './resourcesAdminAuth.js'

test('refuse une requête sans Bearer token sans appeler Supabase', async () => {
  let called = false
  const supabase = { auth: { getUser: async () => { called = true } } }
  await assert.rejects(
    authorizeResourcesAdminRequest({ headers: {} }, supabase),
    { code: 'unauthenticated', status: 401 },
  )
  assert.equal(called, false)
})

test('refuse un jeton invalide et un utilisateur non administrateur', async () => {
  await assert.rejects(
    authorizeResourcesAdminRequest(
      { headers: { authorization: 'Bearer invalid' } },
      { auth: { getUser: async () => ({ data: {}, error: new Error('invalid') }) } },
    ),
    { code: 'unauthenticated', status: 401 },
  )
  await assert.rejects(
    authorizeResourcesAdminRequest(
      { headers: { authorization: 'Bearer valid' } },
      { auth: { getUser: async () => ({ data: { user: { email: 'other@example.com' } } }) } },
    ),
    { code: 'forbidden', status: 403 },
  )
})

test('accepte uniquement le compte administrateur attendu', async () => {
  const tokens = []
  const user = await authorizeResourcesAdminRequest(
    { headers: { Authorization: 'Bearer valid-token' } },
    {
      auth: {
        getUser: async (token) => {
          tokens.push(token)
          return { data: { user: { id: 'admin', email: 'CHRISTIAN.COUILLARD@5PENNYAI.COM' } } }
        },
      },
    },
  )
  assert.equal(user.id, 'admin')
  assert.deepEqual(tokens, ['valid-token'])
})

test('crée le client serveur avec la service role sans persistance de session', () => {
  const calls = []
  const client = createResourcesServerClient(
    { SUPABASE_URL: 'https://project.supabase.co', SUPABASE_SERVICE_ROLE_KEY: 'secret' },
    (...args) => { calls.push(args); return { server: true } },
  )
  assert.deepEqual(client, { server: true })
  assert.deepEqual(calls[0], [
    'https://project.supabase.co',
    'secret',
    { auth: { persistSession: false, autoRefreshToken: false } },
  ])
})

test('signale une configuration Supabase serveur absente sans exposer de secret', () => {
  assert.throws(() => createResourcesServerClient({}, () => {}), {
    code: 'server_not_configured',
    status: 500,
  })
})
