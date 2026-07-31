import test from 'node:test'
import assert from 'node:assert/strict'
import { applyPublishedFilter } from './publicInfographicQuery.js'
import { loadPublishedCatalog } from './publicResourceCatalog.js'

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

test('charge toutes les couvertures des séries visibles en une seule requête supplémentaire', async () => {
  const calls = []
  const client = createCatalogClient(calls, {
    infographics: [
      { id: 'one', series_name: 'Série Alpha' },
      { id: 'two', series_name: 'Série Alpha' },
      { id: 'three', series_name: 'Série Bêta' },
    ],
    rows: [{ slug: 'serie-alpha', thumbnail_path: 'thumbnails/series/serie-alpha/a.webp' }],
  })

  const result = await loadPublishedCatalog({
    client,
    fetchInfographics: async (catalogClient) => {
      const query = catalogClient.from('infographics').select('columns').eq('status', 'published')
      const { data } = await query.order('published_at')
      return data
    },
  })
  assert.equal(result.infographics.length, 3)
  assert.equal(result.seriesThumbnailRows.length, 1)
  assert.deepEqual(calls.filter(([table]) => table === 'resource_series'), [
    ['resource_series', ['serie-alpha', 'serie-beta']],
  ])
})

test('conserve les ressources et le fallback si la lecture des couvertures échoue', async () => {
  const warnings = []
  const result = await loadPublishedCatalog({
    client: createCatalogClient([], {
      infographics: [{ id: 'one', series_name: 'Série Alpha' }],
      seriesError: new Error('migration missing'),
    }),
    fetchInfographics: async () => [{ id: 'one', series_name: 'Série Alpha' }],
    logger: { warn: (...args) => warnings.push(args) },
  })

  assert.equal(result.infographics.length, 1)
  assert.deepEqual(result.seriesThumbnailRows, [])
  assert.equal(warnings.length, 1)
})

function createCatalogClient(calls, { infographics, rows = [], seriesError = null }) {
  return {
    from(table) {
      if (table === 'infographics') {
        return {
          select() { return this },
          eq(column, value) { calls.push([table, column, value]); return this },
          async order() { return { data: infographics, error: null } },
        }
      }
      return {
        select() { return this },
        async in(_column, slugs) {
          calls.push([table, slugs])
          return { data: rows, error: seriesError }
        },
      }
    },
  }
}
