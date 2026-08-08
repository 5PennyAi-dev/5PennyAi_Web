import test from 'node:test'
import assert from 'node:assert/strict'
import {
  buildArticleCoverPath,
  buildArticleInfographicPath,
  buildArticleMediaPath,
  collectArticleObjectPaths,
  isArticleAssetPath,
  isArticleCoverPath,
  isArticleInfographicPath,
  isArticleMediaPath,
  replaceStoredReference,
  resolveArticleAssets,
  validateArticleFileIdentity,
  validateArticleImage,
} from './articleAssetRules.js'
import {
  readImageMetadata,
  removeArticleInfographic,
  uploadArticleInfographic,
} from './articleAssets.js'

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

test('accepte 4:5 et 2:3 pour une infographie et avertit sans bloquer un ratio inhabituel', () => {
  for (const [width, height] of [[2400, 3000], [2400, 3600]]) {
    const result = validateArticleImage({ kind: 'infographic', mimeType: 'image/webp', sizeBytes: 1000, width, height })
    assert.equal(result.valid, true)
    assert.deepEqual(result.warnings, [])
  }
  const unusual = validateArticleImage({ kind: 'infographic', mimeType: 'image/png', sizeBytes: 1000, width: 1600, height: 900 })
  assert.equal(unusual.valid, true)
  assert.deepEqual(unusual.warnings, ['infographicRatioMismatch'])
  assert.equal(validateArticleImage({ kind: 'infographic', mimeType: 'image/png', sizeBytes: 1000, width: 0, height: 3000 }).error, 'unreadable')
})

test('valide extension et signature réelles pour PNG, JPEG et WebP', () => {
  const fixtures = [
    ['fiche.png', 'image/png', [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0]],
    ['fiche.jpeg', 'image/jpeg', [0xff, 0xd8, 0xff, 0xe0, 0, 0, 0, 0, 0, 0, 0, 0]],
    ['fiche.webp', 'image/webp', [0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50]],
  ]
  for (const [originalName, mimeType, bytes] of fixtures) {
    assert.deepEqual(validateArticleFileIdentity({ originalName, mimeType, signatureBytes: Uint8Array.from(bytes) }), { valid: true })
  }
  assert.equal(validateArticleFileIdentity({ originalName: 'fiche.gif', mimeType: 'image/gif', signatureBytes: [] }).error, 'unsupportedType')
  assert.equal(validateArticleFileIdentity({ originalName: 'fiche.txt', mimeType: 'image/png', signatureBytes: [] }).error, 'unsupportedExtension')
  assert.equal(validateArticleFileIdentity({ originalName: 'fiche.jpg', mimeType: 'image/png', signatureBytes: [] }).error, 'extensionMismatch')
  assert.equal(validateArticleFileIdentity({ originalName: 'fiche.png', mimeType: 'image/png', signatureBytes: Uint8Array.from([0xff, 0xd8, 0xff]) }).error, 'signatureMismatch')
})

test('lit une image décodable et refuse une image que le navigateur ne peut pas décoder', async () => {
  const file = fakeImageFile('fiche.png', 'image/png', [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0])
  const urlCalls = []
  const urlObject = {
    createObjectURL() { urlCalls.push('create'); return 'blob:test' },
    revokeObjectURL(value) { urlCalls.push(`revoke:${value}`) },
  }
  const metadata = await readImageMetadata(file, {
    urlObject,
    createImage: () => fakeBrowserImage({ width: 2400, height: 3000 }),
  })
  assert.equal(metadata.width, 2400)
  assert.equal(metadata.height, 3000)
  assert.deepEqual(urlCalls, ['create', 'revoke:blob:test'])

  await assert.rejects(
    readImageMetadata(file, { urlObject, createImage: () => fakeBrowserImage({ fails: true }) }),
    (error) => error.code === 'unreadable',
  )
})

test('construit des chemins uniques stricts pour couverture, infographie et média', () => {
  const cover = buildArticleCoverPath(ARTICLE_ID, UUID_A, 'image/jpeg')
  const infographic = buildArticleInfographicPath(ARTICLE_ID, UUID_B, 'image/png')
  const mediaA = buildArticleMediaPath(ARTICLE_ID, 'schema-rag', UUID_A, 'image/webp')
  const mediaB = buildArticleMediaPath(ARTICLE_ID, 'schema-rag', UUID_B, 'image/webp')
  assert.equal(cover, `articles/${ARTICLE_ID}/cover/${UUID_A}.jpg`)
  assert.equal(infographic, `articles/${ARTICLE_ID}/infographic/${UUID_B}.png`)
  assert.notEqual(mediaA, mediaB)
  assert.equal(isArticleCoverPath(cover, ARTICLE_ID), true)
  assert.equal(isArticleInfographicPath(infographic, ARTICLE_ID), true)
  assert.equal(isArticleInfographicPath(infographic, UUID_B), false)
  assert.equal(isArticleInfographicPath(`articles/${ARTICLE_ID}/infographic/not-a-uuid.png`, ARTICLE_ID), false)
  assert.equal(isArticleInfographicPath(`articles/${ARTICLE_ID}/media/${UUID_B}.png`, ARTICLE_ID), false)
  assert.equal(isArticleInfographicPath(`articles/${ARTICLE_ID}/infographic/${UUID_B}.gif`, ARTICLE_ID), false)
  assert.equal(isArticleMediaPath(mediaA, ARTICLE_ID, 'schema-rag'), true)
  assert.equal(isArticleMediaPath(mediaA, ARTICLE_ID, 'autre-cle'), false)
  assert.equal(isArticleCoverPath(mediaA, ARTICLE_ID), false)
  assert.equal(isArticleMediaPath(cover, ARTICLE_ID, 'schema-rag'), false)
  assert.equal(isArticleAssetPath(mediaA, ARTICLE_ID), true)
  assert.equal(isArticleAssetPath(infographic, ARTICLE_ID), true)
  assert.equal(isArticleAssetPath(`articles/${ARTICLE_ID}/media/Schema-Rag/${UUID_A}.webp`, ARTICLE_ID), false)
  assert.equal(isArticleAssetPath(`articles/${ARTICLE_ID}/cover/not-a-uuid.png`, ARTICLE_ID), false)
  assert.equal(isArticleAssetPath(`articles/${ARTICLE_ID}/media/schema-rag/not-a-uuid.webp`, ARTICLE_ID), false)
  assert.equal(isArticleAssetPath(`articles/${ARTICLE_ID}/media/schema-rag/../${UUID_A}.webp`, ARTICLE_ID), false)
  assert.equal(isArticleAssetPath(`articles/${ARTICLE_ID}/media/schema-rag/%2e%2e/${UUID_A}.webp`, ARTICLE_ID), false)
  assert.throws(() => buildArticleMediaPath(ARTICLE_ID, 'Clé invalide', UUID_A, 'image/png'))
  assert.throws(() => buildArticleInfographicPath('not-a-uuid', UUID_A, 'image/png'))
  assert.throws(() => buildArticleInfographicPath(ARTICLE_ID, 'not-a-uuid', 'image/png'))
  assert.equal(isArticleAssetPath(`articles/${UUID_B}/cover/${UUID_A}.png`, ARTICLE_ID), false)
})

test('téléverse puis remplace une infographie sans toucher aux autres familles d’assets', async () => {
  const client = createInfographicClient({
    article: { cover_path: 'cover-intacte', infographic_path: null, media_assets: ['media-intact'] },
  })
  const file = { type: 'image/png' }
  const metadata = { mimeType: 'image/png' }
  const first = await uploadArticleInfographic({ articleId: ARTICLE_ID, oldPath: null, file, metadata }, client, UUID_A)
  assert.equal(first.path, `articles/${ARTICLE_ID}/infographic/${UUID_A}.png`)
  assert.equal(client.article().cover_path, 'cover-intacte')
  assert.deepEqual(client.article().media_assets, ['media-intact'])

  const second = await uploadArticleInfographic({ articleId: ARTICLE_ID, oldPath: first.path, file, metadata }, client, UUID_B)
  assert.equal(second.path, `articles/${ARTICLE_ID}/infographic/${UUID_B}.png`)
  assert.ok(client.calls.some((call) => call === `remove:${first.path}`))
  assert.equal(client.article().cover_path, 'cover-intacte')
  assert.deepEqual(client.article().media_assets, ['media-intact'])
})

test('conserve l’ancienne infographie si Storage ou SQL échoue', async () => {
  const oldPath = buildArticleInfographicPath(ARTICLE_ID, UUID_A, 'image/webp')
  const file = { type: 'image/webp' }
  const metadata = { mimeType: 'image/webp' }

  const storageFailure = createInfographicClient({ article: { infographic_path: oldPath }, uploadError: new Error('storage') })
  await assert.rejects(uploadArticleInfographic({ articleId: ARTICLE_ID, oldPath, file, metadata }, storageFailure, UUID_B), /storage/)
  assert.equal(storageFailure.article().infographic_path, oldPath)
  assert.equal(storageFailure.calls.some((call) => call.startsWith('update:')), false)

  const databaseFailure = createInfographicClient({ article: { infographic_path: oldPath }, updateError: new Error('database') })
  await assert.rejects(uploadArticleInfographic({ articleId: ARTICLE_ID, oldPath, file, metadata }, databaseFailure, UUID_B), /database/)
  const newPath = buildArticleInfographicPath(ARTICLE_ID, UUID_B, 'image/webp')
  assert.equal(databaseFailure.article().infographic_path, oldPath)
  assert.ok(databaseFailure.calls.includes(`remove:${newPath}`))
  assert.equal(databaseFailure.calls.includes(`remove:${oldPath}`), false)
})

test('refuse un ancien chemin arbitraire avant tout téléversement', async () => {
  const client = createInfographicClient({ article: { infographic_path: '../foreign.png' } })
  await assert.rejects(
    uploadArticleInfographic({
      articleId: ARTICLE_ID,
      oldPath: '../foreign.png',
      file: { type: 'image/png' },
      metadata: { mimeType: 'image/png' },
    }, client, UUID_B),
    TypeError,
  )
  assert.deepEqual(client.calls, [])
})

test('un échec de nettoyage de l’ancienne infographie conserve la nouvelle référence', async () => {
  const oldPath = buildArticleInfographicPath(ARTICLE_ID, UUID_A, 'image/jpeg')
  const client = createInfographicClient({ article: { infographic_path: oldPath }, removeError: new Error('cleanup') })
  const result = await uploadArticleInfographic({
    articleId: ARTICLE_ID,
    oldPath,
    file: { type: 'image/jpeg' },
    metadata: { mimeType: 'image/jpeg' },
  }, client, UUID_B)
  assert.equal(result.cleanupFailed, true)
  assert.equal(client.article().infographic_path, buildArticleInfographicPath(ARTICLE_ID, UUID_B, 'image/jpeg'))
})

test('supprime uniquement l’infographie active et gère absence, chemin invalide et asset déjà absent', async () => {
  const path = buildArticleInfographicPath(ARTICLE_ID, UUID_A, 'image/png')
  const client = createInfographicClient({
    article: { cover_path: 'cover-intacte', infographic_path: path, media_assets: ['media-intact'] },
  })
  const result = await removeArticleInfographic({ articleId: ARTICLE_ID, path }, client)
  assert.equal(result.cleanupFailed, false)
  assert.equal(client.article().infographic_path, null)
  assert.equal(client.article().cover_path, 'cover-intacte')
  assert.deepEqual(client.article().media_assets, ['media-intact'])

  assert.deepEqual(await removeArticleInfographic({ articleId: ARTICLE_ID, path: null }, client), { absent: true, cleanupFailed: false })
  await assert.rejects(removeArticleInfographic({ articleId: ARTICLE_ID, path: '../foreign.png' }, client), TypeError)
  await assert.rejects(removeArticleInfographic({ articleId: ARTICLE_ID, path }, client), /assetChanged/)
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
  const infographic = buildArticleInfographicPath(ARTICLE_ID, UUID_B, 'image/webp')
  const media = buildArticleMediaPath(ARTICLE_ID, 'alpha', UUID_B, 'image/jpeg')
  assert.deepEqual(collectArticleObjectPaths({
    id: ARTICLE_ID,
    cover_path: safe,
    infographic_path: infographic,
    assets: [
      { media_key: 'alpha', storage_path: media },
      { media_key: 'beta', storage_path: media },
      { media_key: 'alpha', storage_path: '../foreign.png' },
    ],
  }), [safe, infographic, media])
})

function fakeImageFile(name, type, bytes) {
  const data = Uint8Array.from(bytes)
  return {
    name,
    type,
    size: data.length,
    slice() {
      return { arrayBuffer: async () => data.buffer.slice(0) }
    },
  }
}

function fakeBrowserImage({ fails = false, width = 0, height = 0 }) {
  return {
    naturalWidth: width,
    naturalHeight: height,
    set src(_value) {
      queueMicrotask(() => fails ? this.onerror() : this.onload())
    },
  }
}

function createInfographicClient({ article = {}, removeError = null, updateError = null, uploadError = null } = {}) {
  let row = { status: 'draft', ...structuredClone(article) }
  const calls = []
  return {
    calls,
    article: () => structuredClone(row),
    from(table) {
      assert.equal(table, 'articles')
      let patch
      const filters = []
      return {
        update(value) { patch = value; calls.push(`update:${JSON.stringify(value)}`); return this },
        eq(column, value) { filters.push([column, value]); return this },
        select() { return this },
        async maybeSingle() {
          if (updateError) return { data: null, error: updateError }
          const matches = filters.every(([column, value]) => row[column] === value || column === 'id')
          if (!matches) return { data: null, error: null }
          row = { ...row, ...patch }
          return { data: { id: ARTICLE_ID, ...patch }, error: null }
        },
      }
    },
    storage: {
      from(bucket) {
        assert.equal(bucket, 'article-assets')
        return {
          async upload(path, _file, options) {
            calls.push(`upload:${path}`)
            assert.equal(options.upsert, false)
            return { error: uploadError }
          },
          async remove(paths) {
            calls.push(`remove:${paths[0]}`)
            return { error: removeError }
          },
        }
      },
    },
  }
}
