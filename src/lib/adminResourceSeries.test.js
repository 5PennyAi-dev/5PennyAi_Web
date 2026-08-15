import assert from 'node:assert/strict'
import test from 'node:test'
import {
  ResourceSeriesAdminError,
  attachResourceSeriesCounts,
  createAdminResourceSeries,
  deleteAdminResourceSeries,
  deleteAdminSeriesMembership,
  fetchAdminResourceSeriesById,
  fetchAdminSeriesMemberships,
  normalizeResourceSeriesPayload,
  proposeResourceSeriesSlug,
  sortAdminSeriesMemberships,
  updateAdminResourceSeries,
  updateAdminSeriesMembershipPosition,
} from './adminResourceSeries.js'

const SERIES_ID = '11111111-1111-4111-8111-111111111111'
const MEMBERSHIP_ID = '22222222-2222-4222-8222-222222222222'

test('propose le slug initial sans lier ensuite le nom au slug', () => {
  assert.equal(proposeResourceSeriesSlug('  Bien débuter avec les agents IA  '), 'bien-debuter-avec-les-agents-ia')
  assert.deepEqual(
    normalizeResourceSeriesPayload({
      name: 'Le vocabulaire essentiel de l’IA',
      slug: 'le-vocabulaire-de-l-ia-generative',
      description: '  Une description. ',
      objective: '   ',
    }),
    {
      name: 'Le vocabulaire essentiel de l’IA',
      slug: 'le-vocabulaire-de-l-ia-generative',
      description: 'Une description.',
      objective: null,
    },
  )
})

test('refuse un nom vide', () => {
  assert.throws(
    () => normalizeResourceSeriesPayload({ name: '   ', slug: 'serie' }),
    (error) => error instanceof ResourceSeriesAdminError && error.code === 'nameRequired',
  )
})

test('calcule les comptes total et publié, y compris pour une série vide', () => {
  const result = attachResourceSeriesCounts(
    [{ id: SERIES_ID }, { id: 'empty' }],
    [
      { series_id: SERIES_ID, article: { status: 'published' }, infographic: null },
      { series_id: SERIES_ID, article: null, infographic: { status: 'draft' } },
    ],
  )
  assert.deepEqual(result.map(({ resourceCount, publishedCount }) => [resourceCount, publishedCount]), [[2, 1], [0, 0]])
})

test('lit une série par UUID et crée puis met à jour sans recalculer le slug', async () => {
  const client = createSeriesClient()
  const loaded = await fetchAdminResourceSeriesById(SERIES_ID, client)
  const created = await createAdminResourceSeries({ name: 'Nom A', slug: 'nom-a' }, client)
  const updated = await updateAdminResourceSeries(SERIES_ID, { name: 'Nom B', slug: 'nom-a' }, client)

  assert.equal(loaded.id, SERIES_ID)
  assert.equal(created.slug, 'nom-a')
  assert.equal(updated.name, 'Nom B')
  assert.equal(updated.slug, 'nom-a')
  assert.deepEqual(client.identifiers(), [SERIES_ID, SERIES_ID])
})

test('traduit une collision de slug en erreur contrôlée', async () => {
  const client = createSeriesClient({ saveError: { code: '23505', message: 'resource_series_slug_key' } })
  await assert.rejects(
    createAdminResourceSeries({ name: 'Nom', slug: 'slug-pris' }, client),
    (error) => error.code === 'slugConflict',
  )
})

test('distingue Article et Infographie et trie les positions NULL à la fin', async () => {
  const rows = [
    membershipRow({ id: 'null', position: null, infographic: { id: 'i1', title: 'Zulu', status: 'draft', published_at: null } }),
    membershipRow({ id: 'two', position: 2, article: { id: 'a2', title: 'Bravo', slug: 'bravo', status: 'published', published_at: '2026-01-02' } }),
    membershipRow({ id: 'one', position: 1, infographic: { id: 'i2', title: 'Alpha', status: 'published', published_at: '2026-01-01' } }),
  ]
  const client = createMembershipClient({ rows })
  const memberships = await fetchAdminSeriesMemberships(SERIES_ID, client)
  assert.deepEqual(memberships.map(({ id }) => id), ['one', 'two', 'null'])
  assert.deepEqual(memberships.map(({ format }) => format), ['infographic', 'article', 'infographic'])
  assert.deepEqual(sortAdminSeriesMemberships(memberships).map(({ id }) => id), ['one', 'two', 'null'])
})

test('modifie une position, traduit une collision et retire seulement le membership', async () => {
  const client = createMembershipClient({ rows: [membershipRow({ id: MEMBERSHIP_ID, position: 3, article: { id: 'a1', title: 'Article', status: 'draft' } })] })
  const updated = await updateAdminSeriesMembershipPosition({ membershipId: MEMBERSHIP_ID, seriesId: SERIES_ID, position: '3' }, client)
  assert.equal(updated.position, 3)
  await deleteAdminSeriesMembership({ membershipId: MEMBERSHIP_ID, seriesId: SERIES_ID }, client)
  assert.equal(client.resourceDeletes(), 0)

  const collisionClient = createMembershipClient({ updateError: { code: '23505', message: 'resource_series_memberships_series_position_uidx' } })
  await assert.rejects(
    updateAdminSeriesMembershipPosition({ membershipId: MEMBERSHIP_ID, seriesId: SERIES_ID, position: 2 }, collisionClient),
    (error) => error.code === 'positionConflict',
  )
})

test('supprime la série puis nettoie uniquement son thumbnail en meilleur effort', async () => {
  const path = 'thumbnails/series/serie-test/image.webp'
  const client = createSeriesClient({ thumbnailPath: path, cleanupError: new Error('storage') })
  const result = await deleteAdminResourceSeries({ id: SERIES_ID, slug: 'serie-test', thumbnail_path: path }, client)
  assert.equal(result.cleanupFailed, true)
  assert.deepEqual(client.removed(), [path])
  assert.equal(client.resourceDeletes(), 0)
})

function membershipRow(overrides) {
  return {
    id: MEMBERSHIP_ID,
    series_id: SERIES_ID,
    article_id: overrides.article?.id || null,
    infographic_id: overrides.infographic?.id || null,
    position: null,
    article: null,
    infographic: null,
    ...overrides,
  }
}

function createSeriesClient({ saveError = null, cleanupError = null } = {}) {
  const identifiers = []
  let removed = []
  let resourceDeletes = 0
  const row = { id: SERIES_ID, name: 'Nom A', slug: 'nom-a', description: null, objective: null }
  return {
    identifiers: () => identifiers,
    removed: () => removed,
    resourceDeletes: () => resourceDeletes,
    from(table) {
      assert.equal(table, 'resource_series')
      let operation = 'load'
      let payload = null
      return {
        select() { return this },
        insert(value) { operation = 'insert'; payload = value; return this },
        update(value) { operation = 'update'; payload = value; return this },
        delete() { operation = 'delete'; return this },
        eq(column, value) { if (column === 'id') identifiers.push(value); return this },
        async single() {
          if (saveError) return { data: null, error: saveError }
          return { data: { ...row, ...payload }, error: null }
        },
        async maybeSingle() {
          if (saveError) return { data: null, error: saveError }
          if (operation === 'delete') return { data: { id: SERIES_ID }, error: null }
          return { data: { ...row, ...payload }, error: null }
        },
      }
    },
    storage: {
      from(bucket) {
        assert.equal(bucket, 'infographics')
        return { async remove(paths) { removed = paths; return { error: cleanupError } } }
      },
    },
  }
}

function createMembershipClient({ rows = [], updateError = null } = {}) {
  let resourceDeletes = 0
  return {
    resourceDeletes: () => resourceDeletes,
    from(table) {
      assert.equal(table, 'resource_series_memberships')
      let operation = 'select'
      let position = null
      return {
        select() { return this },
        update(payload) { operation = 'update'; position = payload.position; return this },
        delete() { operation = 'delete'; return this },
        eq() { return this },
        then(resolve) { return resolve({ data: rows, error: null }) },
        async maybeSingle() {
          if (updateError) return { data: null, error: updateError }
          if (operation === 'delete') return { data: { id: MEMBERSHIP_ID }, error: null }
          return { data: { ...rows[0], position }, error: null }
        },
      }
    },
  }
}
