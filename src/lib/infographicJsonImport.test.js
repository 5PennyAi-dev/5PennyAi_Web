import test from 'node:test'
import assert from 'node:assert/strict'
import { importInfographicJson } from './infographicJsonImport.js'

test('importe un objet partiel sans effacer les autres métadonnées', () => {
  const currentForm = {
    title: 'Titre actuel',
    summary: 'Résumé conservé',
    series_name: '',
  }

  const result = importInfographicJson(
    JSON.stringify({
      title: 'Introduction au RAG',
      series: { name: 'Ressources IA' },
    }),
    currentForm,
  )

  assert.equal(result.success, true)
  assert.deepEqual(result.nextForm, {
    title: 'Introduction au RAG',
    summary: 'Résumé conservé',
    series_name: 'Ressources IA',
  })
  assert.deepEqual(result.imported, ['title', 'series.name'])
})

test('ignore les valeurs invalides tout en conservant les portions valides', () => {
  const currentForm = {
    title: 'Titre actuel',
    level: 'beginner',
    reading_time_minutes: '7',
    series_name: 'Série actuelle',
    episode_number: '2',
    key_points: [{ title: 'Point actuel' }],
    keywords: 'mot-clé actuel',
    sources: [{ title: 'Source actuelle', url: 'https://example.com' }],
  }

  const result = importInfographicJson(
    JSON.stringify({
      title: 'Architecture agentique',
      level: 'expert',
      readingTimeMinutes: 'cinq',
      series: { name: 'Agents IA', episodeNumber: -1 },
      keyPoints: [null],
      keywords: ['', 42],
      sources: [{ title: 'Titre conservé', url: 'ftp://example.com' }],
      unknownField: true,
    }),
    currentForm,
  )

  assert.deepEqual(result.nextForm, {
    title: 'Architecture agentique',
    level: 'beginner',
    reading_time_minutes: '7',
    series_name: 'Agents IA',
    episode_number: '2',
    key_points: [{ title: 'Point actuel' }],
    keywords: 'mot-clé actuel',
    sources: [{ title: 'Titre conservé' }],
  })
  assert.deepEqual(
    result.warnings.map(({ path }) => path),
    [
      'level',
      'readingTimeMinutes',
      'series.episodeNumber',
      'keyPoints[0]',
      'keywords[0]',
      'keywords[1]',
      'sources[0].url',
    ],
  )
  assert.deepEqual(result.unknown, ['unknownField'])
})

test('un JSON syntaxiquement invalide laisse intactes les données présentes', () => {
  const currentForm = {
    title: 'Ne pas modifier',
    key_points: [{ title: 'Point existant' }],
  }

  const result = importInfographicJson('{"title":', currentForm)

  assert.equal(result.success, false)
  assert.equal(result.error, 'invalidJson')
  assert.equal(result.nextForm, currentForm)
  assert.deepEqual(result.nextForm, {
    title: 'Ne pas modifier',
    key_points: [{ title: 'Point existant' }],
  })
})
