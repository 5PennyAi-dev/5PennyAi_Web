import test from 'node:test'
import assert from 'node:assert/strict'
import { publishArticle, unpublishArticle } from './adminArticles.js'
import { getPublishTransition, getUnpublishTransition } from './articlePublication.js'

const DATE = new Date('2026-08-01T15:30:00.000Z')

test('prépare une publication explicite avec slug normalisé et date courante', () => {
  assert.deepEqual(getPublishTransition({ status: 'draft', slug: ' Mon Article ' }, DATE), {
    slug: 'mon-article',
    status: 'published',
    published_at: DATE.toISOString(),
  })
})

test('refuse la publication sans slug ou avec un slug inutilisable', () => {
  assert.throws(() => getPublishTransition({ status: 'draft', slug: '' }, DATE), { code: 'slugRequired' })
  assert.throws(() => getPublishTransition({ status: 'draft', slug: '---' }, DATE), { code: 'slugInvalid' })
})

test('publie puis repasse en brouillon sans remplacer le contenu ni les assets', async () => {
  const client = createArticleClient({
    id: 'article-1',
    status: 'draft',
    slug: 'article-test',
    title: 'Titre conservé',
    content_markdown: 'Contenu conservé',
    cover_path: 'cover-conservee',
  })

  const published = await publishArticle('article-1', client, DATE)
  assert.equal(published.status, 'published')
  assert.equal(published.published_at, DATE.toISOString())
  assert.equal(published.content_markdown, 'Contenu conservé')
  assert.equal(published.cover_path, 'cover-conservee')

  const draft = await unpublishArticle('article-1', client)
  assert.equal(draft.status, 'draft')
  assert.equal(draft.published_at, null)
  assert.equal(draft.title, 'Titre conservé')
  assert.equal(draft.cover_path, 'cover-conservee')
  assert.deepEqual(getUnpublishTransition(), { status: 'draft', published_at: null })
})

test('transforme une collision de slug en erreur compréhensible sans modifier la ligne', async () => {
  const client = createArticleClient(
    { id: 'article-1', status: 'draft', slug: 'deja-pris', title: 'Intact' },
    { slugConflict: true },
  )
  await assert.rejects(() => publishArticle('article-1', client, DATE), { code: 'slugConflict' })
  assert.equal(client.current().status, 'draft')
  assert.equal(client.current().title, 'Intact')
})

function createArticleClient(initial, options = {}) {
  let row = { ...initial }
  return {
    current: () => ({ ...row }),
    from(table) {
      assert.equal(table, 'articles')
      let operation = 'load'
      let patch = null
      const filters = []
      return {
        select() { return this },
        update(value) { operation = 'update'; patch = value; return this },
        eq(column, value) { filters.push([column, value]); return this },
        async maybeSingle() {
          if (operation === 'load') return { data: { ...row }, error: null }
          if (options.slugConflict) {
            return { data: null, error: { code: '23505', message: 'duplicate key articles_slug_key', details: 'slug' } }
          }
          const matches = filters.every(([column, value]) => row[column] === value)
          if (!matches) return { data: null, error: null }
          row = { ...row, ...patch }
          return { data: { ...row }, error: null }
        },
      }
    },
  }
}
