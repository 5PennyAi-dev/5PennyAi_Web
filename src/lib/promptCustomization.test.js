import assert from 'node:assert/strict'
import test from 'node:test'
import { scrollPromptSectionIntoView } from './promptCustomization.js'

test('déplace le focus sans provoquer un second scroll puis guide doucement vers la section', () => {
  const calls = []
  const element = {
    focus: (options) => calls.push(['focus', options]),
    scrollIntoView: (options) => calls.push(['scroll', options]),
  }

  assert.equal(scrollPromptSectionIntoView(element, { focus: true, reducedMotion: false }), true)
  assert.deepEqual(calls, [
    ['focus', { preventScroll: true }],
    ['scroll', { behavior: 'smooth', block: 'start' }],
  ])
})

test('respecte la réduction des animations et ignore une cible absente', () => {
  const calls = []
  const element = {
    focus: () => calls.push('focus'),
    scrollIntoView: (options) => calls.push(options),
  }

  assert.equal(scrollPromptSectionIntoView(element, { reducedMotion: true }), true)
  assert.deepEqual(calls, [{ behavior: 'auto', block: 'start' }])
  assert.equal(scrollPromptSectionIntoView(null, { focus: true }), false)
})
