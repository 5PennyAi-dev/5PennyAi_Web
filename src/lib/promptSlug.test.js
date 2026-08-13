import assert from 'node:assert/strict'
import test from 'node:test'
import { isValidPromptSlug, proposePromptSlug, slugifyPrompt } from './promptSlug.js'

test('normalise et valide un slug Prompt', () => {
  assert.equal(slugifyPrompt('  Comparer deux options — Été  '), 'comparer-deux-options-ete')
  assert.equal(isValidPromptSlug('comparer-deux-options'), true)
  assert.equal(isValidPromptSlug('Comparer options'), false)
})

test('préfère explicitement la suggestion puis utilise le titre', () => {
  assert.equal(proposePromptSlug({ suggestedSlug: 'Suggestion SEO', title: 'Titre' }), 'suggestion-seo')
  assert.equal(proposePromptSlug({ title: 'Titre utile' }), 'titre-utile')
})
