import assert from 'node:assert/strict'
import fs from 'node:fs'
import test from 'node:test'
import {
  canEnablePromptPublish,
  getPromptPublishTransition,
  getPromptUnpublishTransition,
  PromptPublicationValidationError,
} from './promptPublication.js'

test('publie explicitement un brouillon avec slug normalisé et date ISO', () => {
  const date = new Date('2026-08-13T15:30:00.000Z')
  assert.deepEqual(getPromptPublishTransition({ status: 'draft', slug: ' Mon Prompt ' }, date), {
    slug: 'mon-prompt',
    status: 'published',
    published_at: date.toISOString(),
  })
})

test('exige un slug exploitable et un état brouillon', () => {
  for (const current of [
    { status: 'draft', slug: '' },
    { status: 'draft', slug: '---' },
    { status: 'published', slug: 'mon-prompt' },
  ]) {
    assert.throws(() => getPromptPublishTransition(current), PromptPublicationValidationError)
  }
})

test('le retour en brouillon retire la date de publication', () => {
  assert.deepEqual(getPromptUnpublishTransition(), { status: 'draft', published_at: null })
})

test('active Publier dès que la première sauvegarde retourne un identifiant', () => {
  assert.equal(canEnablePromptPublish({ savedPromptId: null }), false)
  assert.equal(canEnablePromptPublish({ savedPromptId: 'prompt-id' }), true)
  assert.equal(canEnablePromptPublish({ savedPromptId: 'prompt-id', dirty: true }), false)
  assert.equal(canEnablePromptPublish({ savedPromptId: 'prompt-id', saving: true }), false)
})

test('le clic Publier lance directement l’action et rend son résultat dans la section', () => {
  const source = fs.readFileSync(new URL('../pages/admin/resources/AdminPromptForm.jsx', import.meta.url), 'utf8')
  const handler = source.slice(source.indexOf('const handlePublish'), source.indexOf('const handleUnpublish'))
  assert.doesNotMatch(handler, /window\.confirm/)
  assert.match(handler, /publishPrompt\(savedPromptId\)/)
  assert.match(source, /publicationNotice &&/)
})
