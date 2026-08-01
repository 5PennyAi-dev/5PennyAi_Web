import test from 'node:test'
import assert from 'node:assert/strict'
import {
  buildArticleCoverPath,
  buildArticleMediaPath,
  collectArticleObjectPaths,
  isArticleAssetPath,
  isArticleCoverPath,
  isArticleMediaPath,
  replaceStoredReference,
  resolveArticleAssets,
  validateArticleImage,
} from './articleAssetRules.js'

const ARTICLE_ID = '11111111-1111-4111-8111-111111111111'
const UUID_A = '22222222-2222-4222-8222-222222222222'
const UUID_B = '33333333-3333-4333-8333-333333333333'

test('valide PNG, JPEG et WebP et refuse les autres types ou plus de 5 Mo', () => {
  for (const mimeType of ['image/png', 'image/jpeg', 'image/webp']) {
    assert.equal(validateArticleImage({ kind: 'media', mimeType, sizeBytes: 1000, width: 800, height: 600 }).valid, true)
  }
  assert.equal(validateArticleImage({ kind: 'media', mimeType: 'image/gif', sizeBytes: 1, width: 1, height: 1 }).error, 'unsupportedType')
  assert.equal(validateArticleImage({ kind: 'media', mimeType: 'image/png', sizeBytes: 5 * 1024 * 1024 + 1, width: 1, height: 1 }).error, 'tooLarge')
})

test('bloque une couverture hors 16:9 et avertit pour le poids et le ratio média', () => {
  assert.equal(validateArticleImage({ kind: 'cover', mimeType: 'image/png', sizeBytes: 1000, width: 1600, height: 900 }).valid, true)
  assert.equal(validateArticleImage({ kind: 'cover', mimeType: 'image/png', sizeBytes: 1000, width: 1200, height: 900 }).error, 'invalidCoverRatio')
  const media = validateArticleImage({ kind: 'media', mimeType: 'image/webp', sizeBytes: 2 * 1024 * 1024, width: 900, height: 900, preferredAspectRatio: '16:9' })
  assert.deepEqual(media.warnings.sort(), ['heavyFile', 'ratioMismatch'])
})

test('construit des chemins uniques stricts pour couverture et média', () => {
  const cover = buildArticleCoverPath(ARTICLE_ID, UUID_A, 'image/jpeg')
  const mediaA = buildArticleMediaPath(ARTICLE_ID, 'schema-rag', UUID_A, 'image/webp')
  const mediaB = buildArticleMediaPath(ARTICLE_ID, 'schema-rag', UUID_B, 'image/webp')
  assert.equal(cover, `articles/${ARTICLE_ID}/cover/${UUID_A}.jpg`)
  assert.notEqual(mediaA, mediaB)
  assert.equal(isArticleCoverPath(cover, ARTICLE_ID), true)
  assert.equal(isArticleMediaPath(mediaA, ARTICLE_ID, 'schema-rag'), true)
  assert.equal(isArticleMediaPath(mediaA, ARTICLE_ID, 'autre-cle'), false)
  assert.equal(isArticleCoverPath(mediaA, ARTICLE_ID), false)
  assert.equal(isArticleMediaPath(cover, ARTICLE_ID, 'schema-rag'), false)
  assert.equal(isArticleAssetPath(mediaA, ARTICLE_ID), true)
  assert.equal(isArticleAssetPath(`articles/${ARTICLE_ID}/media/Schema-Rag/${UUID_A}.webp`, ARTICLE_ID), false)
  assert.equal(isArticleAssetPath(`articles/${ARTICLE_ID}/cover/not-a-uuid.png`, ARTICLE_ID), false)
  assert.equal(isArticleAssetPath(`articles/${ARTICLE_ID}/media/schema-rag/not-a-uuid.webp`, ARTICLE_ID), false)
  assert.equal(isArticleAssetPath(`articles/${ARTICLE_ID}/media/schema-rag/../${UUID_A}.webp`, ARTICLE_ID), false)
  assert.equal(isArticleAssetPath(`articles/${ARTICLE_ID}/media/schema-rag/%2e%2e/${UUID_A}.webp`, ARTICLE_ID), false)
  assert.throws(() => buildArticleMediaPath(ARTICLE_ID, 'Clé invalide', UUID_A, 'image/png'))
  assert.equal(isArticleAssetPath(`articles/${UUID_B}/cover/${UUID_A}.png`, ARTICLE_ID), false)
})

test('rapproche manifeste, fichiers et orphelins sans déplacer les assets', () => {
  const assets = [
    { id: 'a', media_key: 'alpha', storage_path: 'alpha.png' },
    { id: 'b', media_key: 'ancienne-cle', storage_path: 'old.png' },
  ]
  const resolved = resolveArticleAssets([{ key: 'alpha' }, { key: 'beta' }], assets)
  assert.equal(resolved.media[0].asset.id, 'a')
  assert.equal(resolved.media[1].asset, null)
  assert.deepEqual(resolved.orphans.map(({ id }) => id), ['b'])

  const afterKeyChange = resolveArticleAssets([{ key: 'nouvelle-cle' }], assets)
  assert.deepEqual(afterKeyChange.orphans.map(({ id }) => id), ['a', 'b'])
  assert.equal(assets[0].media_key, 'alpha')
})

test('nettoie le nouvel objet si SQL échoue et conserve ancien jusqu’à succès', async () => {
  const events = []
  await assert.rejects(() => replaceStoredReference({
    newPath: 'new', oldPath: 'old',
    upload: async () => events.push('upload-new'),
    persist: async () => { events.push('sql-failed'); throw new Error('sql') },
    remove: async (path) => events.push(`remove-${path}`),
  }))
  assert.deepEqual(events, ['upload-new', 'sql-failed', 'remove-new'])

  events.length = 0
  const result = await replaceStoredReference({
    newPath: 'new', oldPath: 'old',
    upload: async () => events.push('upload-new'),
    persist: async () => events.push('sql-ok'),
    remove: async (path) => events.push(`remove-${path}`),
  })
  assert.deepEqual(events, ['upload-new', 'sql-ok', 'remove-old'])
  assert.equal(result.cleanupFailed, false)
})

test('signale un orphelin possible si SQL et le nettoyage de repli échouent', async () => {
  await assert.rejects(
    () => replaceStoredReference({
      newPath: 'new',
      upload: async () => {},
      persist: async () => { throw new Error('sql') },
      remove: async () => { throw new Error('storage') },
    }),
    (error) => error.message === 'sql' && error.assetCleanupFailed === true,
  )
})

test('ne persiste rien lorsque le téléversement échoue', async () => {
  const events = []
  await assert.rejects(() => replaceStoredReference({
    newPath: 'new', oldPath: 'old',
    upload: async () => { events.push('upload-failed'); throw new Error('storage') },
    persist: async () => events.push('sql'),
    remove: async (path) => events.push(`remove-${path}`),
  }))
  assert.deepEqual(events, ['upload-failed'])
})

test('prépare seulement les objets sous le préfixe sûr lors de la suppression', () => {
  const safe = buildArticleCoverPath(ARTICLE_ID, UUID_A, 'image/png')
  const media = buildArticleMediaPath(ARTICLE_ID, 'alpha', UUID_B, 'image/jpeg')
  assert.deepEqual(collectArticleObjectPaths({
    id: ARTICLE_ID,
    cover_path: safe,
    assets: [
      { media_key: 'alpha', storage_path: media },
      { media_key: 'beta', storage_path: media },
      { media_key: 'alpha', storage_path: '../foreign.png' },
    ],
  }), [safe, media])
})
