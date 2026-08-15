import test from 'node:test'
import assert from 'node:assert/strict'
import {
  buildPublicSeries,
  buildSeriesNavigationContexts,
  createSeriesSlug,
  findSeriesBySlug,
  getAdjacentEpisodes,
  getCommonSeriesLevel,
  groupResourcesBySeries,
  selectFeaturedSeries,
  sortSeriesEpisodes,
} from './resourceSeries.js'

const ALPHA = { id: 'series-alpha', slug: 'ancien-slug', name: 'Nouveau nom' }
const BETA = { id: 'series-beta', slug: 'serie-beta', name: 'Série Bêta' }

test('conserve le helper de création de slug pour les usages éditoriaux non publics', () => {
  assert.equal(createSeriesSlug('  Les fondamentaux de l’IA générative  '), 'les-fondamentaux-de-l-ia-generative')
  assert.equal(createSeriesSlug(null), '')
})

test('construit les séries depuis les entités persistantes et exclut les séries vides', () => {
  const resources = [
    createResource('a', { memberships: [membership(ALPHA, 2)] }),
    createResource('b', { memberships: [membership(ALPHA, 1)] }),
    createResource('c', { memberships: [] }),
  ]
  const groups = buildPublicSeries([
    { ...ALPHA, description: 'Description', objective: 'Objectif', thumbnail_path: 'cover.webp' },
    BETA,
  ], resources)

  assert.equal(groups.length, 1)
  assert.equal(groups[0].slug, 'ancien-slug')
  assert.equal(groups[0].name, 'Nouveau nom')
  assert.equal(groups[0].description, 'Description')
  assert.equal(groups[0].objective, 'Objectif')
  assert.equal(groups[0].thumbnailPath, 'cover.webp')
  assert.deepEqual(groups[0].resources.map(({ id }) => id), ['b', 'a'])
})

test('regroupe une ressource multi-séries sans recalculer les slugs', () => {
  const resource = createResource('shared', {
    memberships: [membership(ALPHA, 3), membership(BETA, 1)],
  })
  const groups = groupResourcesBySeries([resource])
  assert.equal(groups.length, 2)
  assert.deepEqual(groups.map(({ slug }) => slug).sort(), ['ancien-slug', 'serie-beta'])
  assert.equal(groups.every(({ resources }) => resources[0] === resource), true)
})

test('trie par position du membership, puis NULL, date et titre sans muter la source', () => {
  const resources = [
    createResource('null-late', { memberships: [membership(ALPHA, null)], publishedAt: '2026-01-05', title: 'Bêta' }),
    createResource('two-late', { memberships: [membership(ALPHA, 2)], publishedAt: '2026-01-04', title: 'Bêta' }),
    createResource('one', { memberships: [membership(ALPHA, 1)], publishedAt: '2026-01-03' }),
    createResource('two-early', { memberships: [membership(ALPHA, 2)], publishedAt: '2026-01-01', title: 'Alpha' }),
    createResource('null-early', { memberships: [membership(ALPHA, null)], publishedAt: '2026-01-02', title: 'Alpha' }),
  ]
  const original = resources.map(({ id }) => id)
  assert.deepEqual(sortSeriesEpisodes(resources, ALPHA.id).map(({ id }) => id), [
    'one', 'two-early', 'two-late', 'null-early', 'null-late',
  ])
  assert.deepEqual(resources.map(({ id }) => id), original)
})

test('calcule compte, premier membre, aperçus, niveau commun et activité publiée', () => {
  const resources = [1, 2, 3, 4].map((position) => createResource(`r${position}`, {
    memberships: [membership(ALPHA, position)],
    level: 'beginner',
    publishedAt: `2026-01-0${position}`,
  }))
  const series = buildPublicSeries([ALPHA], resources)[0]
  assert.equal(series.firstEpisode.id, 'r1')
  assert.equal(series.episodeCount, 4)
  assert.equal(series.commonLevel, 'beginner')
  assert.equal(series.latestActivity, '2026-01-04')
  assert.deepEqual(series.previews.map(({ id }) => id), ['r1', 'r2', 'r3'])
  assert.equal(getCommonSeriesLevel([{ level: 'beginner' }, { level: 'advanced' }]), null)
})

test('sélectionne la série dont un membre publié a l’activité la plus récente', () => {
  const series = buildPublicSeries([ALPHA, BETA], [
    createResource('alpha', { memberships: [membership(ALPHA, 1)], publishedAt: '2026-01-01' }),
    createResource('beta', { memberships: [membership(BETA, 1)], publishedAt: '2026-02-01' }),
    createResource('shared', {
      memberships: [membership(ALPHA, 2), membership(BETA, 2)],
      publishedAt: '2026-03-01',
    }),
  ])
  assert.equal(selectFeaturedSeries(series).name, 'Nouveau nom')
})

test('résout une série par son slug persistant même lorsque le nom change', () => {
  const series = buildPublicSeries([ALPHA], [
    createResource('a', { memberships: [membership(ALPHA, 1)] }),
  ])
  assert.equal(findSeriesBySlug(series, 'ancien-slug').name, 'Nouveau nom')
  assert.equal(findSeriesBySlug(series, createSeriesSlug(ALPHA.name)), null)
})

test('calcule les voisins au début, au milieu, à la fin et ignore un absent', () => {
  const resources = ['one', 'two', 'three'].map((id) => createResource(id))
  assert.deepEqual(getAdjacentEpisodes(resources, resources[0]), { previous: null, next: resources[1] })
  assert.deepEqual(getAdjacentEpisodes(resources, resources[1]), { previous: resources[0], next: resources[2] })
  assert.deepEqual(getAdjacentEpisodes(resources, resources[2]), { previous: resources[1], next: null })
  assert.deepEqual(getAdjacentEpisodes(resources, { id: 'missing', contentType: 'article' }), { previous: null, next: null })
})

test('produit deux navigations indépendantes pour une ressource multi-séries', () => {
  const shared = createResource('shared', {
    memberships: [membership(ALPHA, 3), membership(BETA, 1)],
  })
  const alphaBefore = createResource('alpha-before', { memberships: [membership(ALPHA, 1)] })
  const betaAfter = createResource('beta-after', { memberships: [membership(BETA, 2)] })
  const series = buildPublicSeries([ALPHA, BETA], [shared, alphaBefore, betaAfter])
  const contexts = buildSeriesNavigationContexts(series, shared)
  assert.equal(contexts.length, 2)
  assert.equal(contexts.find(({ series: item }) => item.id === ALPHA.id).previous.id, 'alpha-before')
  assert.equal(contexts.find(({ series: item }) => item.id === BETA.id).next.id, 'beta-after')
  assert.deepEqual(contexts.map(({ membership: item }) => item.position), [3, 1])
})

test('une position NULL reste navigable à la fin sans numéro artificiel', () => {
  const first = createResource('first', { memberships: [membership(ALPHA, 2)] })
  const unnumbered = createResource('unnumbered', { memberships: [membership(ALPHA, null)] })
  const series = buildPublicSeries([ALPHA], [unnumbered, first])[0]
  assert.deepEqual(series.resources.map(({ id }) => id), ['first', 'unnumbered'])
  const [context] = buildSeriesNavigationContexts([series], unnumbered)
  assert.equal(context.membership.position, null)
  assert.equal(context.previous.id, 'first')
  assert.equal(context.next, null)
})

function membership(series, position) {
  return {
    membershipId: `${series.id}:${position ?? 'null'}`,
    seriesId: series.id,
    slug: series.slug,
    name: series.name,
    position,
  }
}

function createResource(id, overrides = {}) {
  const { memberships = [], ...rest } = overrides
  return {
    id,
    contentType: 'article',
    title: id,
    level: 'beginner',
    publishedAt: '2026-01-01',
    publicUrl: `/articles/${id}`,
    seriesMemberships: memberships,
    ...rest,
  }
}
