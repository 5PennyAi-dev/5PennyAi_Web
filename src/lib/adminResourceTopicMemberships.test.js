import assert from 'node:assert/strict'
import test from 'node:test'
import {
  ResourceTopicMembershipError,
  createResourceTopicMembership,
  deleteResourceTopicMembership,
  excludeAssociatedResourceTopics,
  listResourceTopicMemberships,
  mapResourceTopicMembershipError,
  sortResourceTopicMemberships,
} from './adminResourceTopicMemberships.js'

test('exclut les sujets dÃ©jÃ  associÃ©s et conserve les sujets rÃ©els disponibles', () => {
  const topics = [{ id: 'language', name_fr: 'ModÃ¨les' }, { id: 'rag', name_fr: 'RAG' }]
  assert.deepEqual(excludeAssociatedResourceTopics(topics, [{ topicId: 'language' }]), [topics[1]])
  assert.deepEqual(excludeAssociatedResourceTopics(topics, [{ topic_id: 'rag' }]), [topics[0]])
})

test('trie les memberships par nom de sujet', () => {
  const memberships = sortResourceTopicMemberships([
    { topicName: 'RAG' },
    { topicName: 'Agents' },
  ])
  assert.deepEqual(memberships.map(({ topicName }) => topicName), ['Agents', 'RAG'])
})

test('mappe les doublons et RLS en erreurs contrÃ´lÃ©es', () => {
  assert.equal(mapResourceTopicMembershipError({ code: '23505' }, 'create').code, 'alreadyAssociated')
  assert.equal(mapResourceTopicMembershipError({ code: '42501' }, 'create').code, 'forbidden')
})

test('le contrat exclut explicitement les Prompts', async () => {
  const { listResourceTopicMemberships } = await import('./adminResourceTopicMemberships.js')
  await assert.rejects(
    listResourceTopicMemberships({ resourceType: 'prompt', resourceId: 'prompt-id' }, { from() { throw new Error('must not query') } }),
    (error) => error instanceof ResourceTopicMembershipError && error.code === 'invalidResourceType',
  )
})

test('charge et crÃ©e les memberships Article et Infographie avec une seule FK', async () => {
  const client = createMembershipClient()
  await listResourceTopicMemberships({ resourceType: 'article', resourceId: 'article-id' }, client)
  await listResourceTopicMemberships({ resourceType: 'infographic', resourceId: 'infographic-id' }, client)
  await createResourceTopicMembership({ resourceType: 'article', resourceId: 'article-id', topicId: 'topic-id' }, client)
  await createResourceTopicMembership({ resourceType: 'infographic', resourceId: 'infographic-id', topicId: 'topic-id' }, client)

  assert.deepEqual(client.filters(), [['article_id', 'article-id'], ['infographic_id', 'infographic-id']])
  assert.deepEqual(client.inserts(), [
    { topic_id: 'topic-id', article_id: 'article-id', infographic_id: null },
    { topic_id: 'topic-id', article_id: null, infographic_id: 'infographic-id' },
  ])
})

test('retire seulement le membership demandÃ©', async () => {
  const client = createMembershipClient()
  await deleteResourceTopicMembership({ resourceType: 'article', resourceId: 'article-id', membershipId: 'membership-id' }, client)
  assert.equal(client.deletes(), 1)
  assert.equal(client.resourceDeletes(), 0)
})

function createMembershipClient() {
  const filters = []
  const inserts = []
  let deletes = 0
  let resourceDeletes = 0
  const membership = {
    id: 'membership-id',
    topic_id: 'topic-id',
    article_id: 'article-id',
    infographic_id: null,
    topic: { id: 'topic-id', name_fr: 'Langage', slug: 'language' },
  }
  return {
    filters: () => filters,
    inserts: () => inserts,
    deletes: () => deletes,
    resourceDeletes: () => resourceDeletes,
    from(table) {
      if (table !== 'resource_topic_memberships' && table !== 'resource_topics') resourceDeletes += 1
      let operation = 'select'
      let payload = null
      return {
        select() { return this },
        order() { return this },
        eq(column, value) { if (column === 'article_id' || column === 'infographic_id') filters.push([column, value]); return this },
        insert(value) { operation = 'insert'; payload = value; inserts.push(value); return this },
        delete() { operation = 'delete'; deletes += 1; return this },
        then(resolve) { return resolve({ data: table === 'resource_topics' ? [membership.topic] : [membership], error: null }) },
        async single() { return { data: { ...membership, ...payload }, error: null } },
        async maybeSingle() { return { data: operation === 'delete' ? { id: membership.id } : membership, error: null } },
      }
    },
  }
}
