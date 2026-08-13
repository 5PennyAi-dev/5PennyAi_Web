import assert from 'node:assert/strict'
import test from 'node:test'
import {
  createPromptDraft,
  PromptAdminError,
  publishPrompt,
  unpublishPrompt,
  updatePromptDraft,
} from './adminPrompts.js'

test('création et mise à jour imposent toujours le brouillon', async () => {
  const inserted = []
  const updated = []
  const client = {
    from() {
      return {
        insert(payload) { inserted.push(payload); return singleQuery(payload) },
        update(payload) { updated.push(payload); return maybeQuery(payload) },
      }
    },
  }
  await createPromptDraft({ title: 'Nouveau', status: 'published' }, client)
  await updatePromptDraft('id', { title: 'Modifié', status: 'published' }, client)
  assert.equal(inserted[0].status, 'draft')
  assert.equal(inserted[0].published_at, null)
  assert.equal(updated[0].status, 'draft')
})

test('publication explicite définit published_at puis le retour en brouillon le retire', async () => {
  const updates = []
  const date = new Date('2026-08-13T15:30:00.000Z')
  const published = await publishPrompt('id', publicationClient({
    current: { id: 'id', slug: 'mon-prompt', status: 'draft' }, updates,
  }), date)
  assert.equal(published.status, 'published')
  assert.equal(published.published_at, date.toISOString())
  assert.equal(updates.length, 1)

  const unpublished = await unpublishPrompt('id', publicationClient({ updates }))
  assert.equal(unpublished.status, 'draft')
  assert.equal(unpublished.published_at, null)
})

test('une collision de slug reste une erreur contrôlée', async () => {
  await assert.rejects(
    publishPrompt('id', publicationClient({
      current: { id: 'id', slug: 'déjà-pris', status: 'draft' },
      updateError: { code: '23505', message: 'duplicate slug', details: 'slug' },
    })),
    (error) => error instanceof PromptAdminError && error.code === 'slugConflict',
  )
})

function singleQuery(data) {
  const query = { select() { return query }, async single() { return { data, error: null } } }
  return query
}

function maybeQuery(data) {
  const query = { eq() { return query }, select() { return query }, async maybeSingle() { return { data, error: null } } }
  return query
}

function publicationClient({ current = null, updates = [], updateError = null } = {}) {
  return {
    from() {
      return {
        select() {
          const query = { eq() { return query }, async maybeSingle() { return { data: current, error: null } } }
          return query
        },
        update(payload) {
          updates.push(payload)
          const query = {
            eq() { return query },
            select() { return query },
            async maybeSingle() {
              return updateError
                ? { data: null, error: updateError }
                : { data: { id: 'id', ...payload }, error: null }
            },
          }
          return query
        },
      }
    },
  }
}
