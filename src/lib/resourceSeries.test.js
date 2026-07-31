import test from 'node:test'
import assert from 'node:assert/strict'
import {
  createSeriesSlug,
  findSeriesBySlug,
  getAdjacentEpisodes,
  getCommonSeriesLevel,
  groupResourcesBySeries,
  selectFeaturedSeries,
  sortSeriesEpisodes,
} from './resourceSeries.js'

test('génère un slug lisible pour une série', () => {
  assert.equal(
    createSeriesSlug('  Les fondamentaux de l’IA générative  '),
    'les-fondamentaux-de-l-ia-generative',
  )
  assert.equal(createSeriesSlug('Éthique --- et sécurité!'), 'ethique-et-securite')
  assert.equal(createSeriesSlug(null), '')
})

test('regroupe uniquement les ressources possédant une série non vide', () => {
  const resources = [
    createResource('a', { series_name: 'Série Alpha', episode_number: 2 }),
    createResource('b', { series_name: 'Série Alpha', episode_number: 1 }),
    createResource('c', { series_name: '  ' }),
    createResource('d', { series_name: null }),
    createResource('e', { series_name: 'Série Bêta' }),
  ]

  const groups = groupResourcesBySeries(resources)

  assert.equal(groups.length, 2)
  assert.deepEqual(
    groups.map((series) => series.name).sort(),
    ['Série Alpha', 'Série Bêta'],
  )
  assert.deepEqual(
    groups.find((series) => series.name === 'Série Alpha').resources.map(({ id }) => id),
    ['b', 'a'],
  )
  assert.equal(groups.some((series) => series.name === ''), false)
})

test('trie les épisodes sans modifier le tableau source', () => {
  const resources = [
    createResource('missing', { episode_number: undefined, published_at: '2026-01-05' }),
    createResource('two-late', {
      episode_number: 2,
      published_at: '2026-01-04',
      title: 'Bêta',
    }),
    createResource('zero', { episode_number: 0, published_at: '2026-01-02' }),
    createResource('one', { episode_number: 1, published_at: '2026-01-03' }),
    createResource('two-early', {
      episode_number: 2,
      published_at: '2026-01-01',
      title: 'Alpha',
    }),
    createResource('negative', { episode_number: -1, published_at: '2026-01-06' }),
  ]
  const originalOrder = resources.map(({ id }) => id)

  const ordered = sortSeriesEpisodes(resources)

  assert.deepEqual(ordered.map(({ id }) => id), [
    'one',
    'two-early',
    'two-late',
    'zero',
    'missing',
    'negative',
  ])
  assert.deepEqual(resources.map(({ id }) => id), originalOrder)
})

test('calcule le premier épisode, les aperçus et le niveau commun', () => {
  const series = groupResourcesBySeries([
    createResource('episode-3', { episode_number: 3, level: 'beginner' }),
    createResource('episode-1', { episode_number: 1, level: 'beginner' }),
    createResource('episode-2', { episode_number: 2, level: 'beginner' }),
    createResource('episode-4', { episode_number: 4, level: 'beginner' }),
  ])[0]

  assert.equal(series.firstEpisode.id, 'episode-1')
  assert.deepEqual(series.previews.map(({ id }) => id), [
    'episode-1',
    'episode-2',
    'episode-3',
  ])
  assert.equal(series.commonLevel, 'beginner')
  assert.equal(series.episodeCount, 4)
  assert.equal(getCommonSeriesLevel([{ level: 'beginner' }, { level: 'advanced' }]), null)
  assert.equal(getCommonSeriesLevel([{ level: 'beginner' }, { level: null }]), null)
})

test('sélectionne la série dont l’activité publiée est la plus récente', () => {
  const groups = groupResourcesBySeries([
    createResource('alpha-old', {
      series_name: 'Alpha',
      published_at: '2026-01-01T00:00:00Z',
    }),
    createResource('beta-new', {
      series_name: 'Bêta',
      published_at: '2026-03-01T00:00:00Z',
    }),
    createResource('alpha-newer', {
      series_name: 'Alpha',
      published_at: '2026-02-01T00:00:00Z',
    }),
  ])

  assert.equal(selectFeaturedSeries(groups).name, 'Bêta')
})

test('résout une série par son slug', () => {
  const groups = groupResourcesBySeries([
    createResource('alpha', { series_name: 'Série Alpha' }),
    createResource('beta', { series_name: 'Série Bêta' }),
  ])

  assert.equal(findSeriesBySlug(groups, 'serie-beta')?.name, 'Série Bêta')
  assert.equal(findSeriesBySlug(groups, 'serie-inconnue'), null)
  assert.equal(findSeriesBySlug(null, 'serie-beta'), null)
})

test('résout les épisodes adjacents au début, au milieu et à la fin', () => {
  const episodes = [createResource('one'), createResource('two'), createResource('three')]

  assert.deepEqual(getAdjacentEpisodes(episodes, 'one'), {
    previous: null,
    next: episodes[1],
  })
  assert.deepEqual(getAdjacentEpisodes(episodes, 'two'), {
    previous: episodes[0],
    next: episodes[2],
  })
  assert.deepEqual(getAdjacentEpisodes(episodes, 'three'), {
    previous: episodes[1],
    next: null,
  })
})

test('retourne des voisins vides pour un épisode inconnu ou une liste vide', () => {
  const episodes = [createResource('one')]

  assert.deepEqual(getAdjacentEpisodes(episodes, 'unknown'), {
    previous: null,
    next: null,
  })
  assert.deepEqual(getAdjacentEpisodes([], 'one'), { previous: null, next: null })
  assert.deepEqual(getAdjacentEpisodes(null, 'one'), { previous: null, next: null })
})

test('respecte l’ordre fourni, y compris un épisode non numéroté placé à la fin', () => {
  const episodes = [
    createResource('one', { episode_number: 1 }),
    createResource('two', { episode_number: 2 }),
    createResource('unnumbered', { episode_number: null }),
  ]
  const originalOrder = episodes.map(({ id }) => id)

  assert.deepEqual(getAdjacentEpisodes(episodes, 'two'), {
    previous: episodes[0],
    next: episodes[2],
  })
  assert.deepEqual(getAdjacentEpisodes(episodes, 'unnumbered'), {
    previous: episodes[1],
    next: null,
  })
  assert.deepEqual(episodes.map(({ id }) => id), originalOrder)
})

function createResource(id, overrides = {}) {
  return {
    id,
    title: id,
    series_name: 'Série test',
    episode_number: null,
    published_at: '2026-01-01T00:00:00Z',
    level: 'beginner',
    ...overrides,
  }
}
