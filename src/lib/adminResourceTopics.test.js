import assert from 'node:assert/strict'
import test from 'node:test'
import {
  ResourceTopicAdminError,
  attachResourceTopicCounts,
  createAdminResourceTopic,
  deleteAdminResourceTopic,
  fetchAdminResourceTopics,
  normalizeResourceTopicPayload,
  proposeResourceTopicSlug,
  sortAdminResourceTopicMemberships,
  updateAdminResourceTopic,
} from './adminResourceTopics.js'

test('normalise le sujet, propose le slug initial et garde le slug explicitement fourni', () => {
  assert.equal(proposeResourceTopicSlug('  Modeles de langage  '), 'modeles-de-langage')
  assert.deepEqual(
    normalizeResourceTopicPayload({
      name_fr: ' Modeles de langage ',
      name_en: ' Language models ',
      slug: 'slug-stable',
      description_fr: ' Description FR ',
      description_en: ' ',
    }),
    {
      name_fr: 'Modeles de langage',
      name_en: 'Language models',
      slug: 'slug-stable',
      description_fr: 'Description FR',
      description_en: null,
    },
  )
})

test('refuse les trois identifiants requis du sujet', () => {
  for (const [payload, code] of [
    [{ name_fr: '', name_en: 'English', slug: 'slug' }, 'nameFrRequired'],
    [{ name_fr: 'FranÃ§ais', name_en: '', slug: 'slug' }, 'nameEnRequired'],
    [{ name_fr: 'FranÃ§ais', name_en: 'English', slug: '' }, 'slugRequired'],
  ]) {
    assert.throws(
      () => normalizeResourceTopicPayload(payload),
      (error) => error instanceof ResourceTopicAdminError && error.code === code,
    )
  }
})

test('calcule les comptes sans les stocker et ne compte comme public que published', () => {
  const topics = [{ id: 'language' }, { id: 'empty' }]
  const rows = [
    { topic_id: 'language', article: { status: 'published' }, infographic: null },
    { topic_id: 'language', article: { status: 'draft' }, infographic: null },
    { topic_id: 'language', article: null, infographic: { status: 'published' } },
  ]
  const result = attachResourceTopicCounts(topics, rows)
  assert.deepEqual(result.map(({ resourceCount, publishedCount }) => [resourceCount, publishedCount]), [[3, 2], [0, 0]])
})

test('trie les membres par titre sans dÃ©duire de sujet depuis theme ou keywords', () => {
  const sorted = sortAdminResourceTopicMemberships([
    { title: 'Zulu' },
    { title: 'alpha' },
  ])
  assert.deepEqual(sorted.map(({ title }) => title), ['alpha', 'Zulu'])
})

test('charge les sujets et memberships en deux requÃªtes puis crÃ©e, modifie et supprime un sujet', async () => {
  const client = createTopicClient()
  const listed = await fetchAdminResourceTopics(client)
  const created = await createAdminResourceTopic({ name_fr: 'Agents', name_en: 'Agents', slug: 'agents' }, client)
  const updated = await updateAdminResourceTopic(created.id, { name_fr: 'Agents IA', name_en: 'AI agents', slug: 'agents' }, client)
  await deleteAdminResourceTopic(updated, client)

  assert.equal(listed[0].resourceCount, 1)
  assert.equal(listed[0].publishedCount, 1)
  assert.equal(created.slug, 'agents')
  assert.equal(updated.name_fr, 'Agents IA')
  assert.deepEqual(client.tables(), ['resource_topics', 'resource_topic_memberships', 'resource_topics', 'resource_topics', 'resource_topics'])
  assert.equal(client.resourceDeletes(), 0)
})

test('traduit une collision de slug en erreur contrÃ´lÃ©e', async () => {
  await assert.rejects(
    createAdminResourceTopic(
      { name_fr: 'Agents', name_en: 'Agents', slug: 'agents' },
      createTopicClient({ saveError: { code: '23505', message: 'resource_topics_slug_key' } }),
    ),
    (error) => error.code === 'slugConflict',
  )
})

function createTopicClient({ saveError = null } = {}) {
  const topic = { id: 'topic-id', name_fr: 'Langage', name_en: 'Language', slug: 'language', description_fr: null, description_en: null }
  const memberships = [{ topic_id: 'topic-id', article: { status: 'published' }, infographic: null }]
  const calledTables = []
  return {
    tables: () => calledTables,
    from(table) {
      calledTables.push(table)
      let operation = 'select'
      let payload = null
      return {
        select() { return this },
        order() { return this },
        insert(value) { operation = 'insert'; payload = value; return this },
        update(value) { operation = 'update'; payload = value; return this },
        delete() { operation = 'delete'; return this },
        eq() { return this },
        then(resolve) { return resolve({ data: table === 'resource_topics' ? [topic] : memberships, error: null }) },
        async single() {
          if (saveError) return { data: null, error: saveError }
          return { data: { ...topic, ...payload }, error: null }
        },
        async maybeSingle() {
          if (saveError) return { data: null, error: saveError }
          return { data: operation === 'delete' ? { id: topic.id } : { ...topic, ...payload }, error: null }
        },
      }
    },
    resourceDeletes: () => 0,
  }
}
