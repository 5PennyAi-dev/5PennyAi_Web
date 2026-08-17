import test from 'node:test'
import assert from 'node:assert/strict'
import { Buffer } from 'node:buffer'
import sharp from 'sharp'
import {
  ARTICLE_COVER_PROMPT_VERSION,
  ArticleCoverGenerationError,
  buildArticleCoverFromInfographicPrompt,
  generateAndStoreArticleCover,
  normalizeArticleCover,
  validateArticleId,
  validateArticleInfographicReference,
} from './articleCoverFromInfographic.js'

const ARTICLE_ID = '11111111-1111-4111-8111-111111111111'
const OLD_COVER_ID = '22222222-2222-4222-8222-222222222222'
const INFOGRAPHIC_ID = '33333333-3333-4333-8333-333333333333'
const NEW_COVER_ID = '44444444-4444-4444-8444-444444444444'
const INFOGRAPHIC_PATH = `articles/${ARTICLE_ID}/infographic/${INFOGRAPHIC_ID}.png`
const OLD_COVER_PATH = `articles/${ARTICLE_ID}/cover/${OLD_COVER_ID}.webp`
const NEW_COVER_PATH = `articles/${ARTICLE_ID}/cover/${NEW_COVER_ID}.webp`
const REFERENCE_PNG = await sharp({ create: { width: 800, height: 1200, channels: 3, background: '#f6f2e9' } }).png().toBuffer()
const GENERATED_WEBP = withMinimumSize(await sharp({ create: { width: 1280, height: 720, channels: 3, background: '#19334f' } }).webp().toBuffer())
const NORMALIZED_WEBP = withMinimumSize(await sharp({ create: { width: 1280, height: 720, channels: 3, background: '#2b9b91' } }).webp().toBuffer())

test('valide UUID, appartenance du chemin, MIME, signature, taille et décodage de la source', async () => {
  assert.equal(validateArticleId(ARTICLE_ID), true)
  assert.equal(validateArticleId('invalid'), false)
  const valid = await validateArticleInfographicReference({ path: INFOGRAPHIC_PATH, buffer: REFERENCE_PNG, mimeType: 'image/png' }, ARTICLE_ID)
  assert.equal(valid.width, 800)
  await assert.rejects(validateArticleInfographicReference({ path: INFOGRAPHIC_PATH.replace(ARTICLE_ID, NEW_COVER_ID), buffer: REFERENCE_PNG, mimeType: 'image/png' }, ARTICLE_ID), { code: 'infographic_invalid_path' })
  await assert.rejects(validateArticleInfographicReference({ path: INFOGRAPHIC_PATH, buffer: Buffer.alloc(0), mimeType: 'image/png' }, ARTICLE_ID), { code: 'infographic_empty' })
  await assert.rejects(validateArticleInfographicReference({ path: INFOGRAPHIC_PATH, buffer: REFERENCE_PNG, mimeType: 'image/jpeg' }, ARTICLE_ID), { code: 'infographic_invalid_mime' })
  await assert.rejects(validateArticleInfographicReference({ path: INFOGRAPHIC_PATH, buffer: Buffer.alloc(5 * 1024 * 1024 + 1), mimeType: 'image/png' }, ARTICLE_ID), { code: 'infographic_too_large' })
  await assert.rejects(validateArticleInfographicReference({ path: INFOGRAPHIC_PATH, buffer: Buffer.from('not-an-image'), mimeType: 'image/png' }, ARTICLE_ID), { code: 'infographic_invalid_signature' })
  const fakePng = Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), Buffer.alloc(32)])
  await assert.rejects(validateArticleInfographicReference({ path: INFOGRAPHIC_PATH, buffer: fakePng, mimeType: 'image/png' }, ARTICLE_ID), { code: 'infographic_invalid_image' })
})

test('construit le prompt versionné avec le titre exact et seulement les données éditoriales minimales', () => {
  const title = 'L’IA : utile, mais jusqu’où?'
  const prompt = buildArticleCoverFromInfographicPrompt({
    title, subtitle: 'Sous-titre', summary: 'Résumé', level: 'beginner', takeaway: 'À retenir',
    content_markdown: 'SECRET MARKDOWN', sources: [{ url: 'https://secret.example' }], seo: { primaryQuery: 'SECRET SEO' },
  })
  assert.equal(ARTICLE_COVER_PROMPT_VERSION, 'article-cover-from-infographic-v1')
  assert.match(prompt, /ARTICLE COVER FROM INFOGRAPHIC — VERSION article-cover-from-infographic-v1/)
  assert.match(prompt, new RegExp(title.replace('?', '\\?')))
  assert.match(prompt, /jamais un simple recadrage, une copie miniature, une infographie compacte/i)
  assert.match(prompt, /Affiche le titre exact et complet/i)
  assert.doesNotMatch(prompt, /SECRET MARKDOWN|secret\.example|SECRET SEO/)
})

test('réutilise la normalisation cover centrée et produit un WebP 1280 × 720 opaque', async () => {
  const portrait = await sharp({ create: { width: 900, height: 1200, channels: 4, background: '#7d53de' } }).png().toBuffer()
  const result = await normalizeArticleCover(portrait)
  const metadata = await sharp(result.buffer).metadata()
  assert.equal(result.width, 1280)
  assert.equal(result.height, 720)
  assert.equal(result.mimeType, 'image/webp')
  assert.equal(metadata.format, 'webp')
  assert.equal(metadata.channels, 3)
})

test('génère, téléverse sous UUID, active puis nettoie l’ancienne couverture', async () => {
  const fixture = createDependencies()
  const result = await generateAndStoreArticleCover({ articleId: ARTICLE_ID, dependencies: fixture.dependencies })
  assert.equal(result.coverPath, NEW_COVER_PATH)
  assert.equal(result.width, 1280)
  assert.equal(result.height, 720)
  assert.equal(result.mimeType, 'image/webp')
  assert.deepEqual(fixture.events, [`download:${INFOGRAPHIC_PATH}`, 'generate', `upload:${NEW_COVER_PATH}`, `update:${OLD_COVER_PATH}->${NEW_COVER_PATH}`, `remove:${OLD_COVER_PATH}`])
})

test('refuse article absent, non modifiable, sans infographie et chemin d’un autre article', async () => {
  for (const [article, code] of [
    [null, 'article_not_found'],
    [{ status: 'published', title: 'Titre', infographic_path: INFOGRAPHIC_PATH }, 'article_not_editable'],
    [{ status: 'draft', title: '', infographic_path: INFOGRAPHIC_PATH }, 'article_title_missing'],
    [{ status: 'draft', title: 'Titre', infographic_path: null }, 'infographic_missing'],
    [{ status: 'draft', title: 'Titre', infographic_path: INFOGRAPHIC_PATH.replace(ARTICLE_ID, NEW_COVER_ID) }, 'infographic_invalid_path'],
  ]) {
    const fixture = createDependencies({ article })
    await assert.rejects(generateAndStoreArticleCover({ articleId: ARTICLE_ID, dependencies: fixture.dependencies }), (error) => error.code === code)
  }
})

test('un fichier Storage absent échoue avant le modèle et conserve la couverture', async () => {
  const fixture = createDependencies({ downloadError: new ArticleCoverGenerationError('infographic_download_failed', 422, 'download_source') })
  await assert.rejects(generateAndStoreArticleCover({ articleId: ARTICLE_ID, dependencies: fixture.dependencies }), { code: 'infographic_download_failed' })
  assert.equal(fixture.events.includes('generate'), false)
  assert.equal(fixture.activeCover(), OLD_COVER_PATH)
})

test('un échec fournisseur, upload ou update conserve toujours l’ancienne couverture', async () => {
  for (const failure of ['generate', 'upload', 'update']) {
    const fixture = createDependencies({ failure })
    await assert.rejects(generateAndStoreArticleCover({ articleId: ARTICLE_ID, dependencies: fixture.dependencies }))
    assert.equal(fixture.activeCover(), OLD_COVER_PATH)
    assert.equal(fixture.events.includes(`remove:${OLD_COVER_PATH}`), false)
    if (failure === 'update') assert.equal(fixture.events.includes(`remove:${NEW_COVER_PATH}`), true)
  }
})

test('un échec de nettoyage ancien conserve la nouvelle couverture et signale l’orphelin', async () => {
  const fixture = createDependencies({ removeOldError: true })
  const result = await generateAndStoreArticleCover({ articleId: ARTICLE_ID, dependencies: fixture.dependencies })
  assert.equal(fixture.activeCover(), NEW_COVER_PATH)
  assert.equal(result.cleanupWarning, true)
})

function createDependencies({ article = undefined, downloadError, failure, removeOldError = false } = {}) {
  let activeCover = OLD_COVER_PATH
  const events = []
  const defaultArticle = {
    id: ARTICLE_ID, status: 'draft', title: 'Titre exact', subtitle: 'Sous-titre', summary: 'Résumé', level: 'beginner', takeaway: 'Message',
    infographic_path: INFOGRAPHIC_PATH, cover_path: OLD_COVER_PATH,
  }
  return {
    events,
    activeCover: () => activeCover,
    dependencies: {
      createUniqueId: () => NEW_COVER_ID,
      logger: { warn() {} },
      getArticle: async () => article === undefined ? defaultArticle : article,
      downloadInfographic: async (path) => { events.push(`download:${path}`); if (downloadError) throw downloadError; return { buffer: REFERENCE_PNG, mimeType: 'image/png' } },
      generateImage: async () => { events.push('generate'); if (failure === 'generate') throw new Error('provider'); return { buffer: GENERATED_WEBP, mimeType: 'image/webp' } },
      normalizeImage: async () => ({ buffer: NORMALIZED_WEBP, mimeType: 'image/webp', width: 1280, height: 720, channels: 3 }),
      uploadCover: async (path) => { events.push(`upload:${path}`); if (failure === 'upload') throw new Error('storage') },
      updateCoverPath: async (_id, oldPath, newPath) => { events.push(`update:${oldPath}->${newPath}`); if (failure === 'update') throw new Error('database'); activeCover = newPath },
      removeCover: async (path) => { events.push(`remove:${path}`); if (removeOldError && path === OLD_COVER_PATH) throw new Error('cleanup') },
    },
  }
}

function withMinimumSize(buffer) {
  return buffer.length >= 1024 ? buffer : Buffer.concat([buffer, Buffer.alloc(1024 - buffer.length)])
}
