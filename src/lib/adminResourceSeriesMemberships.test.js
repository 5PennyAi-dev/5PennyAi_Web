import assert from 'node:assert/strict'
import test from 'node:test'
import {
  createResourceMembership,
  deleteMembership,
  excludeAssociatedSeries,
  listAvailableSeries,
  listMembershipsForResources,
  listResourceMemberships,
  normalizeMembershipPosition,
  updateMembershipPosition,
} from './adminResourceSeriesMemberships.js'

const RESOURCE_ID = '11111111-1111-4111-8111-111111111111'
const SERIES_ID = '22222222-2222-4222-8222-222222222222'
const MEMBERSHIP_ID = '33333333-3333-4333-8333-333333333333'

test('charge explicitement les memberships Article et Infographie par leur FK', async () => {
  const client = createClient({ memberships: [membershipRow()] })
  await listResourceMemberships({ resourceType: 'article', resourceId: RESOURCE_ID }, client)
  await listResourceMemberships({ resourceType: 'infographic', resourceId: RESOURCE_ID }, client)
  assert.deepEqual(client.filters(), [
    ['article_id', RESOURCE_ID],
    ['infographic_id', RESOURCE_ID],
  ])
})

test('crée Article et Infographie avec une seule FK et une position indépendante', async () => {
  const client = createClient({ memberships: [membershipRow()] })
  await createResourceMembership({ resourceType: 'article', resourceId: RESOURCE_ID, seriesId: SERIES_ID, position: '' }, client)
  await createResourceMembership({ resourceType: 'infographic', resourceId: RESOURCE_ID, seriesId: SERIES_ID, position: '5' }, client)
  assert.deepEqual(client.inserts(), [
    { series_id: SERIES_ID, article_id: RESOURCE_ID, infographic_id: null, position: null },
    { series_id: SERIES_ID, article_id: null, infographic_id: RESOURCE_ID, position: 5 },
  ])
})

test('exclut les séries déjà associées tout en conservant une série vide', async () => {
  const series = [
    { id: SERIES_ID, name: 'Associée' },
    { id: 'empty', name: 'Série vide' },
  ]
  assert.deepEqual(excludeAssociatedSeries(series, [{ seriesId: SERIES_ID }]), [series[1]])
  assert.deepEqual(await listAvailableSeries([{ seriesId: SERIES_ID }], createClient({ series })), [series[1]])
})

test('accepte NULL ou un entier positif et refuse les autres positions', () => {
  assert.equal(normalizeMembershipPosition(''), null)
  assert.equal(normalizeMembershipPosition('4'), 4)
  for (const value of [0, -1, 1.5, 'texte']) {
    assert.throws(() => normalizeMembershipPosition(value), ({ code }) => code === 'positionInvalid')
  }
})

test('traduit collision, doublon et RLS en erreurs contrôlées', async () => {
  await assert.rejects(
    createResourceMembership(
      { resourceType: 'article', resourceId: RESOURCE_ID, seriesId: SERIES_ID, position: 2 },
      createClient({ mutationError: { code: '23505', message: 'series_position_uidx' } }),
    ),
    ({ code }) => code === 'positionConflict',
  )
  await assert.rejects(
    createResourceMembership(
      { resourceType: 'article', resourceId: RESOURCE_ID, seriesId: SERIES_ID, position: null },
      createClient({ mutationError: { code: '23505', message: 'series_article_uidx' } }),
    ),
    ({ code }) => code === 'alreadyAssociated',
  )
  await assert.rejects(
    listResourceMemberships(
      { resourceType: 'article', resourceId: RESOURCE_ID },
      createClient({ loadError: { code: '42501', message: 'row-level security' } }),
    ),
    ({ code }) => code === 'forbidden',
  )
})

test('modifie une position puis retire uniquement le membership ciblé', async () => {
  const client = createClient({ memberships: [membershipRow()] })
  const updated = await updateMembershipPosition({ resourceType: 'article', resourceId: RESOURCE_ID, membershipId: MEMBERSHIP_ID, position: null }, client)
  assert.equal(updated.position, null)
  await deleteMembership({ resourceType: 'article', resourceId: RESOURCE_ID, membershipId: MEMBERSHIP_ID }, client)
  assert.equal(client.membershipDeletes(), 1)
  assert.equal(client.resourceDeletes(), 0)
})

test('charge en lot plusieurs ressources sans N+1 et garde leurs séries séparées', async () => {
  const secondId = '44444444-4444-4444-8444-444444444444'
  const client = createClient({ memberships: [membershipRow(), membershipRow({ id: 'second', article_id: secondId, series: { id: 'other', name: 'Bêta', slug: 'beta' } })] })
  const grouped = await listMembershipsForResources({ resourceType: 'article', resourceIds: [RESOURCE_ID, secondId] }, client)
  assert.equal(grouped.get(RESOURCE_ID).length, 1)
  assert.equal(grouped.get(secondId)[0].seriesName, 'Bêta')
  assert.equal(client.batchQueries(), 1)
})

function membershipRow(overrides = {}) {
  return {
    id: MEMBERSHIP_ID,
    series_id: SERIES_ID,
    article_id: RESOURCE_ID,
    infographic_id: null,
    position: 2,
    series: { id: SERIES_ID, name: 'Alpha', slug: 'alpha' },
    ...overrides,
  }
}

function createClient({ memberships = [], series = [], mutationError = null, loadError = null } = {}) {
  const filters = []
  const inserts = []
  let membershipDeletes = 0
  let resourceDeletes = 0
  let batchQueries = 0
  return {
    filters: () => filters,
    inserts: () => inserts,
    membershipDeletes: () => membershipDeletes,
    resourceDeletes: () => resourceDeletes,
    batchQueries: () => batchQueries,
    from(table) {
      let operation = 'select'
      let payload = null
      const builder = {
        select() { return this },
        order() { return this },
        eq(column, value) { if (column.endsWith('_id')) filters.push([column, value]); return this },
        in() { batchQueries += 1; return this },
        insert(value) { operation = 'insert'; payload = value; inserts.push(value); return this },
        update(value) { operation = 'update'; payload = value; return this },
        delete() { operation = 'delete'; membershipDeletes += 1; return this },
        then(resolve) {
          if (loadError) return resolve({ data: null, error: loadError })
          return resolve({ data: table === 'resource_series' ? series : memberships, error: null })
        },
        async single() {
          if (mutationError) return { data: null, error: mutationError }
          return { data: { ...memberships[0], ...payload }, error: null }
        },
        async maybeSingle() {
          if (mutationError) return { data: null, error: mutationError }
          if (operation === 'delete') return { data: { id: MEMBERSHIP_ID }, error: null }
          return { data: { ...memberships[0], ...payload }, error: null }
        },
      }
      if (table !== 'resource_series_memberships' && table !== 'resource_series') resourceDeletes += 1
      return builder
    },
  }
}
