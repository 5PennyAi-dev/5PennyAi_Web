import test from 'node:test'
import assert from 'node:assert/strict'
import { applyPublishedFilter } from './publicInfographicQuery.js'

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
