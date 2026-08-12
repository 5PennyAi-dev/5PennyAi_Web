import test from 'node:test'
import assert from 'node:assert/strict'
import {
  findResourceTopic,
  getAvailableResourceTopics,
  matchesResourceTopic,
} from './resourceTopics.js'

const resources = [
  { id: 'one', theme: 'IA générative' },
  { id: 'two', theme: 'Utilisation de l’IA générative' },
  { id: 'three', theme: 'Prompting' },
  { id: 'four', theme: 'Prompt engineering' },
  { id: 'five', theme: 'RAG' },
  { id: 'six', theme: 'Embeddings' },
  { id: 'seven', theme: 'Codex' },
  { id: 'eight', theme: 'Claude Code' },
  { id: 'nine', theme: 'GitHub Copilot' },
  { id: 'ten', theme: 'Assistants de programmation' },
  { id: 'eleven', theme: '  ' },
  { id: 'twelve', theme: null },
]

test('groups only the two explicit topic variants and counts their resources', () => {
  const topics = getAvailableResourceTopics(resources)

  assert.deepEqual(topics.find(({ key }) => key === 'ia-generative'), {
    key: 'ia-generative',
    label: 'IA générative',
    labelKey: 'resourcesAi.topics.iaGenerative',
    themeValues: ['IA générative', 'Utilisation de l’IA générative'],
    count: 2,
  })
  assert.equal(topics.find(({ key }) => key === 'prompting')?.count, 2)
  assert.deepEqual(topics.map(({ label }) => label), [...topics.map(({ label }) => label)].sort(
    (left, right) => left.localeCompare(right, 'fr', { sensitivity: 'base' }),
  ))
})

test('keeps direct themes distinct and excludes themes without resources', () => {
  const topics = getAvailableResourceTopics(resources)
  assert.deepEqual(
    topics.filter(({ key }) => ['codex', 'claude-code', 'github-copilot', 'assistants-de-programmation'].includes(key))
      .map(({ key }) => key)
      .sort(),
    ['assistants-de-programmation', 'claude-code', 'codex', 'github-copilot'],
  )
  assert.equal(findResourceTopic(resources, 'rag')?.label, 'RAG')
  assert.equal(findResourceTopic(resources, 'missing'), null)
  assert.equal(topics.some(({ label }) => !label.trim()), false)
})

test('matches grouped topics exactly and direct topics by their exact theme key', () => {
  assert.equal(matchesResourceTopic({ theme: 'IA générative' }, 'ia-generative'), true)
  assert.equal(matchesResourceTopic({ theme: 'Utilisation de l’IA générative' }, 'ia-generative'), true)
  assert.equal(matchesResourceTopic({ theme: 'Prompt engineering' }, 'prompting'), true)
  assert.equal(matchesResourceTopic({ theme: 'Prompting' }, 'prompting'), true)
  assert.equal(matchesResourceTopic({ theme: 'Codex' }, 'codex'), true)
  assert.equal(matchesResourceTopic({ theme: 'Claude Code' }, 'codex'), false)
  assert.equal(matchesResourceTopic({ theme: 'RAG' }, 'rag'), true)
  assert.equal(matchesResourceTopic({ theme: null }, 'rag'), false)
  assert.equal(matchesResourceTopic({ theme: 'RAG' }, ''), true)
})
