import assert from 'node:assert/strict'
import test from 'node:test'
import {
  buildPromptThumbnailPath,
  generatePromptThumbnail,
  getPromptThumbnailGenerationState,
  isPromptThumbnailPath,
  removePromptThumbnail,
  uploadPromptThumbnail,
  validatePromptThumbnail,
} from './promptThumbnails.js'

const PROMPT_ID = '11111111-1111-4111-8111-111111111111'
const OLD_ID = '22222222-2222-4222-8222-222222222222'
const NEW_ID = '33333333-3333-4333-8333-333333333333'
const OLD_PATH = buildPromptThumbnailPath(PROMPT_ID, OLD_ID, 'image/png')

test('construit et valide seulement les chemins Prompt attendus', () => {
  assert.equal(OLD_PATH, `prompts/${PROMPT_ID}/thumbnail/${OLD_ID}.png`)
  assert.equal(isPromptThumbnailPath(OLD_PATH, PROMPT_ID), true)
  assert.equal(isPromptThumbnailPath(`articles/${PROMPT_ID}/cover/${OLD_ID}.png`, PROMPT_ID), false)
  assert.throws(() => buildPromptThumbnailPath(PROMPT_ID, 'unsafe', 'image/png'))
})

test('accepte PNG, JPEG et WebP 16:9 et refuse un ratio invalide', () => {
  for (const mimeType of ['image/png', 'image/jpeg', 'image/webp']) {
    assert.equal(validatePromptThumbnail({ mimeType, sizeBytes: 1000, width: 1600, height: 900 }).valid, true)
  }
  assert.equal(validatePromptThumbnail({ mimeType: 'image/png', sizeBytes: 1000, width: 1000, height: 1000 }).error, 'invalidCoverRatio')
})

test('détermine les états de génération et envoie promptId seulement', async () => {
  assert.equal(getPromptThumbnailGenerationState({}), 'saveFirst')
  assert.equal(getPromptThumbnailGenerationState({ promptId: PROMPT_ID, dirty: true, generationBrief: 'brief' }), 'saveChangesFirst')
  assert.equal(getPromptThumbnailGenerationState({ promptId: PROMPT_ID, generationBrief: '  ' }), 'briefRequired')
  assert.equal(getPromptThumbnailGenerationState({ promptId: PROMPT_ID, generationBrief: 'brief' }), 'ready')
  assert.equal(getPromptThumbnailGenerationState({ promptId: PROMPT_ID, generationBrief: 'brief', busy: true }), 'generating')

  const calls = []
  const client = { auth: { getSession: async () => ({ data: { session: { access_token: 'token' } }, error: null }) } }
  const result = await generatePromptThumbnail(PROMPT_ID, client, async (...args) => {
    calls.push(args)
    return { ok: true, json: async () => ({ thumbnailPath: OLD_PATH }) }
  })
  assert.equal(result.thumbnailPath, OLD_PATH)
  assert.equal(calls[0][0], '/api/generate-prompt-thumbnail')
  assert.deepEqual(JSON.parse(calls[0][1].body), { promptId: PROMPT_ID })
  assert.equal(calls[0][1].headers.Authorization, 'Bearer token')
})

test('upload, active puis nettoie ancien en meilleur effort', async () => {
  const events = []
  const client = mockClient({ events })
  const result = await uploadPromptThumbnail({
    promptId: PROMPT_ID, oldPath: OLD_PATH, file: {}, metadata: { mimeType: 'image/webp' },
  }, client, NEW_ID)
  assert.equal(result.path, buildPromptThumbnailPath(PROMPT_ID, NEW_ID, 'image/webp'))
  assert.deepEqual(events.map(([event]) => event), ['upload', 'update', 'remove'])
})

test('échec SQL nettoie le nouveau fichier et conserve ancien; échec nettoyage conserve nouveau', async () => {
  const failedEvents = []
  await assert.rejects(uploadPromptThumbnail({
    promptId: PROMPT_ID, oldPath: OLD_PATH, file: {}, metadata: { mimeType: 'image/png' },
  }, mockClient({ events: failedEvents, updateError: new Error('sql') }), NEW_ID), /sql/)
  assert.deepEqual(failedEvents.map(([event]) => event), ['upload', 'update', 'remove'])

  const cleanupResult = await uploadPromptThumbnail({
    promptId: PROMPT_ID, oldPath: OLD_PATH, file: {}, metadata: { mimeType: 'image/png' },
  }, mockClient({ events: [], removeError: new Error('cleanup') }), NEW_ID)
  assert.equal(cleanupResult.cleanupFailed, true)
})

test('suppression retire la référence avant le fichier et tolère le nettoyage échoué', async () => {
  const events = []
  const result = await removePromptThumbnail({ promptId: PROMPT_ID, path: OLD_PATH }, mockClient({ events, removeError: new Error('cleanup') }))
  assert.equal(result.cleanupFailed, true)
  assert.deepEqual(events.map(([event]) => event), ['update', 'remove'])
})

function mockClient({ events, updateError = null, removeError = null }) {
  return {
    from() {
      return {
        update(payload) {
          events.push(['update', payload])
          const query = {
            eq() { return query },
            is() { return query },
            select() { return query },
            async maybeSingle() { return updateError ? { data: null, error: updateError } : { data: { id: PROMPT_ID, ...payload }, error: null } },
          }
          return query
        },
      }
    },
    storage: {
      from() {
        return {
          async upload(path) { events.push(['upload', path]); return { error: null } },
          async remove(paths) { events.push(['remove', paths[0]]); return { error: removeError } },
        }
      },
    },
  }
}
