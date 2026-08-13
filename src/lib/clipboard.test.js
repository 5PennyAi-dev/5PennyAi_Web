import assert from 'node:assert/strict'
import test from 'node:test'
import { copyText } from './clipboard.js'

const exactText = 'Ligne 1\n\n- [OPTION_A]\n<texte> & accents éà'

test('Clipboard reçoit le texte exact sans toucher aux lignes ni placeholders', async () => {
  let received
  const result = await copyText(exactText, {
    clipboard: { writeText: async (value) => { received = value } },
  })
  assert.equal(result, true)
  assert.equal(received, exactText)
})

test('signale le fallback lorsque Clipboard est absent ou rejeté', async () => {
  assert.equal(await copyText(exactText, {}), false)
  assert.equal(await copyText(exactText, {
    clipboard: { writeText: async () => { throw new Error('denied') } },
  }), false)
})

test('refuse une valeur non textuelle sans écrire dans Clipboard', async () => {
  let called = false
  assert.equal(await copyText(null, { clipboard: { writeText: async () => { called = true } } }), false)
  assert.equal(called, false)
})
