import test from 'node:test'
import assert from 'node:assert/strict'
import { importInfographicJson } from './infographicJsonImport.js'

test('réimporte un JSON Infographie legacy sans modifier ses memberships', () => {
  const currentForm = {
    title: 'Titre actuel',
    summary: 'Résumé conservé',
    seriesMemberships: [{ id: 'membership-existing' }],
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
    seriesMemberships: [{ id: 'membership-existing' }],
  })
  assert.deepEqual(result.imported, ['title'])
  assert.ok(result.warnings.some(({ code }) => code === 'legacySeriesIgnored'))
})

test('importe un JSON Infographie moderne sans modifier ses memberships', () => {
  const currentForm = {
    title: 'Titre actuel',
    level: 'beginner',
    reading_time_minutes: '7',
    seriesMemberships: [{ id: 'membership-existing' }],
    key_points: [{ title: 'Point actuel' }],
    keywords: 'mot-clé actuel',
    sources: [{ title: 'Source actuelle', url: 'https://example.com' }],
  }

  const result = importInfographicJson(
    JSON.stringify({
      title: 'Architecture agentique',
      level: 'expert',
      readingTimeMinutes: 'cinq',
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
    seriesMemberships: [{ id: 'membership-existing' }],
    key_points: [{ title: 'Point actuel' }],
    keywords: 'mot-clé actuel',
    sources: [{ title: 'Titre conservé' }],
  })
  assert.deepEqual(
    result.warnings.map(({ path }) => path),
    [
      'level',
      'readingTimeMinutes',
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

test('ignore les propriétés de thumbnail contrôlées par l’application', () => {
  const currentForm = { title: 'Titre actuel' }
  const result = importInfographicJson(
    JSON.stringify({
      title: 'Titre importé',
      thumbnail_path: 'foreign/path.webp',
      thumbnailUrl: 'https://example.com/thumbnail.webp',
      thumbnail: 'thumbnail.webp',
      thumbnailGeneratedAt: '2026-07-31T00:00:00Z',
    }),
    currentForm,
  )

  assert.deepEqual(result.nextForm, { title: 'Titre importé' })
  assert.deepEqual(result.unknown, [
    'thumbnail_path',
    'thumbnailUrl',
    'thumbnail',
    'thumbnailGeneratedAt',
  ])
})
