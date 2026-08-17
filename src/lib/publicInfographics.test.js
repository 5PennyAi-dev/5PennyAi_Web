import test from 'node:test'
import assert from 'node:assert/strict'
import { applyPublishedFilter } from './publicInfographicQuery.js'
import { loadPublishedCatalog } from './publicResourceCatalog.js'
import {
  fetchPublishedInfographics,
  fetchPublishedInfographicsForShowcase,
  getInfographicDownloadFileName,
} from './publicInfographics.js'

test('la lecture publique applique toujours le filtre published', () => {
  const calls = []
  const query = {
    eq(column, value) {
      calls.push([column, value])
      return this
    },
  }

  assert.equal(applyPublishedFilter(query), query)
  assert.deepEqual(calls, [['status', 'published']])
})

test('nomme le téléchargement depuis le titre et conserve l’extension réelle', () => {
  assert.equal(
    getInfographicDownloadFileName(
      'Comment fonctionne le RAG ?',
      'resource-id/original-file.PNG',
    ),
    'comment-fonctionne-le-rag.png',
  )
  assert.equal(
    getInfographicDownloadFileName('Éthique & sécurité', 'resource-id/original.webp'),
    'ethique-securite.webp',
  )
})

test('refuse un chemin absent ou sans extension image reconnue', () => {
  assert.equal(getInfographicDownloadFileName('Titre', null), null)
  assert.equal(getInfographicDownloadFileName('Titre', 'resource-id/file.tmp'), null)
})

test('la requête d’accueil limite les colonnes et filtre les publications', async () => {
  const calls = []
  const client = {
    from(table) {
      return {
        select(columns) {
          calls.push([table, 'select', columns])
          return this
        },
        eq(column, value) {
          calls.push([table, 'eq', column, value])
          return this
        },
        async order() {
          return { data: [], error: null }
        },
      }
    },
  }

  await fetchPublishedInfographicsForShowcase(client)

  const selectCall = calls.find(([, method]) => method === 'select')
  assert.ok(selectCall[2].includes('thumbnail_path'))
  assert.equal(selectCall[2].includes('key_points'), false)
  assert.deepEqual(calls.filter(([, method]) => method === 'eq'), [
    ['infographics', 'eq', 'status', 'published'],
  ])
})

test('charges series and topic memberships in global queries without N+1', async () => {
  const calls = []
  const result = await loadPublishedCatalog({
    client: {},
    fetchInfographics: async () => [{ id: 'one', status: 'published' }],
    fetchArticles: async () => ({ rows: [], coverUrls: {} }),
    fetchPrompts: async () => ({ rows: [], thumbnailUrls: {} }),
    fetchSeries: async () => {
      calls.push('series')
      return [{ id: 'alpha', slug: 'serie-alpha', name: 'Série Alpha' }]
    },
    fetchMemberships: async () => {
      calls.push('memberships')
      return [{ id: 'm1', series_id: 'alpha', infographic_id: 'one', position: 1 }]
    },
    fetchTopics: async () => {
      calls.push('topics')
      return [{ id: 'topic-alpha', slug: 'fondamentaux-ia', name_fr: 'Fondamentaux', name_en: 'AI fundamentals' }]
    },
    fetchTopicMemberships: async () => {
      calls.push('topic-memberships')
      return [{ id: 'tm1', topic_id: 'topic-alpha', infographic_id: 'one' }]
    },
  })
  assert.deepEqual(calls, ['series', 'memberships', 'topics', 'topic-memberships'])
  assert.equal(result.infographics[0].seriesMemberships[0].slug, 'serie-alpha')
  assert.equal(result.infographics[0].topicMemberships[0].slug, 'fondamentaux-ia')
  assert.equal(result.series.length, 1)
})

test('ne réactive aucun fallback legacy si les memberships échouent', async () => {
  await assert.rejects(loadPublishedCatalog({
    client: {},
    fetchInfographics: async () => [{ id: 'one', status: 'published' }],
    fetchArticles: async () => ({ rows: [], coverUrls: {} }),
    fetchPrompts: async () => ({ rows: [], thumbnailUrls: {} }),
    fetchSeries: async () => [],
    fetchMemberships: async () => { throw new Error('offline') },
  }), /offline/)
})

test('the catalog query includes public keywords and subtitle', async () => {
  const calls = []
  const client = {
    from(table) {
      return {
        select(columns) { calls.push([table, 'select', columns]); return this },
        eq() { return this },
        async order() { return { data: [], error: null } },
      }
    },
  }

  await fetchPublishedInfographics(client)
  assert.equal(calls[0][2].includes('subtitle'), true)
  assert.equal(calls[0][2].includes('keywords'), true)
})
