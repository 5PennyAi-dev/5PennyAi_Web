import test from 'node:test'
import assert from 'node:assert/strict'
import { deleteArticleDraft } from './adminArticles.js'
import {
  buildArticleCoverPath,
  buildArticleInfographicPath,
  buildArticleMediaPath,
} from './articleAssetRules.js'

const ARTICLE_ID = '11111111-1111-4111-8111-111111111111'
const COVER_ID = '22222222-2222-4222-8222-222222222222'
const INFOGRAPHIC_ID = '33333333-3333-4333-8333-333333333333'
const MEDIA_ID = '44444444-4444-4444-8444-444444444444'

test('supprime le brouillon puis nettoie couverture, infographie et médias valides', async () => {
  const coverPath = buildArticleCoverPath(ARTICLE_ID, COVER_ID, 'image/webp')
  const infographicPath = buildArticleInfographicPath(ARTICLE_ID, INFOGRAPHIC_ID, 'image/png')
  const mediaPath = buildArticleMediaPath(ARTICLE_ID, 'schema-rag', MEDIA_ID, 'image/jpeg')
  const client = createDeleteClient({
    article: { id: ARTICLE_ID, status: 'draft', cover_path: coverPath, infographic_path: infographicPath },
    assets: [
      { media_key: 'schema-rag', storage_path: mediaPath },
      { media_key: 'foreign', storage_path: '../foreign.png' },
    ],
  })

  const result = await deleteArticleDraft(ARTICLE_ID, client)
  assert.deepEqual(result.paths, [coverPath, infographicPath, mediaPath])
  assert.deepEqual(client.removed(), [coverPath, infographicPath, mediaPath])
  assert.equal(client.deleted(), true)
  assert.equal(result.cleanupFailed, false)
})

test('conserve la suppression SQL réussie lorsqu’un nettoyage Storage échoue', async () => {
  const infographicPath = buildArticleInfographicPath(ARTICLE_ID, INFOGRAPHIC_ID, 'image/webp')
  const client = createDeleteClient({
    article: { id: ARTICLE_ID, status: 'draft', infographic_path: infographicPath },
    cleanupError: new Error('storage'),
  })
  const result = await deleteArticleDraft(ARTICLE_ID, client)
  assert.equal(client.deleted(), true)
  assert.equal(result.cleanupFailed, true)
})

test('refuse de supprimer un article publié avant tout nettoyage', async () => {
  const client = createDeleteClient({ article: { id: ARTICLE_ID, status: 'published' } })
  await assert.rejects(deleteArticleDraft(ARTICLE_ID, client), (error) => error.code === 'draftOnly')
  assert.equal(client.deleted(), false)
  assert.deepEqual(client.removed(), [])
})

function createDeleteClient({ article, assets = [], cleanupError = null }) {
  let wasDeleted = false
  let removedPaths = []
  return {
    deleted: () => wasDeleted,
    removed: () => removedPaths,
    from(table) {
      if (table === 'article_media_assets') {
        return {
          select() { return this },
          eq() { return this },
          async order() { return { data: assets, error: null } },
        }
      }
      assert.equal(table, 'articles')
      let operation = 'load'
      return {
        select() { return this },
        delete() { operation = 'delete'; return this },
        eq() { return this },
        async maybeSingle() {
          if (operation === 'load') return { data: article, error: null }
          wasDeleted = true
          return { data: { id: article.id }, error: null }
        },
      }
    },
    storage: {
      from(bucket) {
        assert.equal(bucket, 'article-assets')
        return {
          async remove(paths) {
            removedPaths = paths
            return { error: cleanupError }
          },
        }
      },
    },
  }
}
