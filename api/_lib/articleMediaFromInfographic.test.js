import test from 'node:test'
import assert from 'node:assert/strict'
import { Buffer } from 'node:buffer'
import sharp from 'sharp'
import {
  ARTICLE_MEDIA_PROFILES,
  ARTICLE_MEDIA_RATIO_SPECS,
  ArticleMediaGenerationError,
  buildArticleMediaFromInfographicPrompt,
  generateAndStoreArticleMedia,
  getArticleMediaRatioSpec,
  normalizeArticleMedia,
  validateArticleMediaKey,
  validateGeneratedArticleMedia,
} from './articleMediaFromInfographic.js'

const ARTICLE_ID = '11111111-1111-4111-8111-111111111111'
const OLD_ID = '22222222-2222-4222-8222-222222222222'
const NEW_ID = '33333333-3333-4333-8333-333333333333'
const INFOGRAPHIC_PATH = `articles/${ARTICLE_ID}/infographic/44444444-4444-4444-8444-444444444444.png`
const OLD_PATH = `articles/${ARTICLE_ID}/media/flux-rag/${OLD_ID}.webp`
const NEW_PATH = `articles/${ARTICLE_ID}/media/flux-rag/${NEW_ID}.webp`
const REFERENCE_PNG = await sharp({ create: { width: 800, height: 1200, channels: 3, background: '#f6f2e9' } }).png().toBuffer()

test('valide strictement la mediaKey et résout les quatre ratios', () => {
  assert.equal(validateArticleMediaKey('flux-rag'), true)
  assert.equal(validateArticleMediaKey('Flux-rag'), false)
  assert.equal(validateArticleMediaKey('flux rag'), false)
  assert.equal(validateArticleMediaKey(''), false)
  assert.deepEqual(getArticleMediaRatioSpec('16:9'), { width: 1280, height: 720, size: '1280x720' })
  assert.deepEqual(getArticleMediaRatioSpec('4:3'), { width: 1280, height: 960, size: '1280x960' })
  assert.deepEqual(getArticleMediaRatioSpec('1:1'), { width: 1280, height: 1280, size: '1280x1280' })
  assert.deepEqual(getArticleMediaRatioSpec('4:5'), { width: 1024, height: 1280, size: '1024x1280' })
  assert.equal(getArticleMediaRatioSpec('3:2'), null)
})

test('construit un prompt dont le brief prévaut sur l’infographie et exclut le contenu inutile', () => {
  const prompt = buildArticleMediaFromInfographicPrompt(article(), media(), ARTICLE_MEDIA_RATIO_SPECS['16:9'])
  assert.match(prompt, /article-media-from-infographic-v1/)
  assert.match(prompt, new RegExp(ARTICLE_MEDIA_PROFILES.diagram))
  assert.match(prompt, /SOURCE DE VÉRITÉ DU CONTENU/)
  assert.match(prompt, /Toute interdiction explicite du generationBrief est obligatoire/)
  assert.match(prompt, /avant une limite, représente-la clairement avant cette limite/)
  assert.match(prompt, /branche de gestion demandée avant une limite doit rester entièrement du côté amont/)
  assert.match(prompt, /place ces actions à gauche de la limite et place la limite seulement après leur sortie/)
  assert.match(prompt, /Ne dessine jamais un flux qui franchit cette limite avant de passer par l’action demandée/)
  assert.match(prompt, /N’utilise jamais de cerveau, réseau de neurones, visage, robot ou personnage/)
  assert.match(prompt, /Ne copie pas sa composition/)
  assert.match(prompt, /Ne l’utilise pas comme source factuelle/)
  assert.match(prompt, /simple crop|miniature de l’infographie/i)
  assert.match(prompt, /Le flux réel du brief/)
  assert.doesNotMatch(prompt, /MARKDOWN SECRET|https:\/\/secret\.example|articles\/.*\/media/)
})

test('accepte diagram, illustration et infographic, puis stocke un nouveau média WebP', async () => {
  for (const kind of Object.keys(ARTICLE_MEDIA_PROFILES)) {
    const fixture = createDependencies({ media: media({ kind }) })
    const result = await generateAndStoreArticleMedia({ articleId: ARTICLE_ID, mediaKey: 'flux-rag', dependencies: fixture.dependencies })
    assert.equal(result.mediaPath, NEW_PATH)
    assert.equal(result.kind, kind)
    assert.equal(result.requestedRatio, '16:9')
    assert.deepEqual(fixture.events, [`download:${INFOGRAPHIC_PATH}`, 'get-existing', 'generate', `upload:${NEW_PATH}`, `replace:${OLD_PATH}->${NEW_PATH}`, `remove:${OLD_PATH}`])
  }
})

test('refuse article absent, article publié, média inconnu, kind interdit, brief vide et ratio inconnu', async () => {
  const cases = [
    [{ article: null }, 'article_not_found'],
    [{ article: article({ status: 'published' }) }, 'article_not_editable'],
    [{ article: article({ infographic_path: null }) }, 'infographic_missing'],
    [{ article: article({ infographic_path: 'other/infographic.png' }) }, 'infographic_invalid_path'],
    [{ mediaKey: 'absent' }, 'media_not_found'],
    [{ media: media({ kind: 'chart' }) }, 'media_kind_not_generatable'],
    [{ media: media({ kind: 'screenshot' }) }, 'media_kind_not_generatable'],
    [{ media: media({ kind: 'other' }) }, 'media_kind_not_generatable'],
    [{ media: media({ generationBrief: '   ' }) }, 'media_generation_brief_missing'],
    [{ media: media({ preferredAspectRatio: '3:2' }) }, 'media_ratio_invalid'],
  ]
  for (const [options, code] of cases) {
    const fixture = createDependencies(options)
    await assert.rejects(
      generateAndStoreArticleMedia({ articleId: ARTICLE_ID, mediaKey: options.mediaKey || 'flux-rag', dependencies: fixture.dependencies }),
      (error) => error.code === code,
    )
    assert.equal(fixture.events.includes('generate'), false)
  }
  await assert.rejects(generateAndStoreArticleMedia({ articleId: 'invalid', mediaKey: 'flux-rag', dependencies: createDependencies().dependencies }), { code: 'invalid_article_id' })
  await assert.rejects(generateAndStoreArticleMedia({ articleId: ARTICLE_ID, mediaKey: 'Flux rag', dependencies: createDependencies().dependencies }), { code: 'invalid_media_key' })
})

test('conserve l’ancien média lorsque la source, le fournisseur, la validation ou l’upload échoue', async () => {
  for (const failure of ['download', 'generate', 'invalid-generated', 'upload']) {
    const fixture = createDependencies({ failure })
    await assert.rejects(generateAndStoreArticleMedia({ articleId: ARTICLE_ID, mediaKey: 'flux-rag', dependencies: fixture.dependencies }))
    assert.equal(fixture.events.includes(`remove:${OLD_PATH}`), false)
    assert.equal(fixture.activePath(), OLD_PATH)
  }
})

test('réutilise les contrôles de référence de l’infographie avant toute génération', async () => {
  for (const [failure, code] of [
    ['source-empty', 'infographic_empty'],
    ['source-mime', 'infographic_invalid_mime'],
    ['source-too-large', 'infographic_too_large'],
    ['source-decode', 'infographic_invalid_signature'],
  ]) {
    const fixture = createDependencies({ failure })
    await assert.rejects(
      generateAndStoreArticleMedia({ articleId: ARTICLE_ID, mediaKey: 'flux-rag', dependencies: fixture.dependencies }),
      (error) => error.code === code,
    )
    assert.equal(fixture.events.includes('generate'), false)
    assert.equal(fixture.activePath(), OLD_PATH)
  }
})

test('normalise les quatre ratios en WebP opaque sans déformation', async () => {
  for (const spec of Object.values(ARTICLE_MEDIA_RATIO_SPECS)) {
    const source = await webp(spec.width, spec.height)
    await validateGeneratedArticleMedia({ buffer: source, mimeType: 'image/webp' }, spec)
    const normalized = await normalizeArticleMedia(source, spec)
    const metadata = await sharp(normalized.buffer).metadata()
    assert.equal(normalized.width, spec.width)
    assert.equal(normalized.height, spec.height)
    assert.equal(metadata.format, 'webp')
    assert.equal(metadata.channels, 3)
  }
})

test('refuse une sortie invalide ou d’un ratio incompatible avant le stockage', async () => {
  const spec = ARTICLE_MEDIA_RATIO_SPECS['4:5']
  await assert.rejects(validateGeneratedArticleMedia({ buffer: Buffer.alloc(0), mimeType: 'image/webp' }, spec), { code: 'provider_invalid_image' })
  await assert.rejects(validateGeneratedArticleMedia({ buffer: withMinimumSize(await webp(1280, 720)), mimeType: 'image/webp' }, spec), { code: 'provider_invalid_dimensions' })
  await assert.rejects(validateGeneratedArticleMedia({ buffer: Buffer.from('invalid'), mimeType: 'image/webp' }, spec), { code: 'provider_invalid_image' })
})

test('nettoie le nouveau fichier après un conflit ou un échec DB et garde l’ancien actif', async () => {
  for (const failure of ['conflict', 'update']) {
    const fixture = createDependencies({ failure })
    await assert.rejects(
      generateAndStoreArticleMedia({ articleId: ARTICLE_ID, mediaKey: 'flux-rag', dependencies: fixture.dependencies }),
      failure === 'conflict' ? { code: 'media_asset_changed', status: 409 } : /database/,
    )
    assert.equal(fixture.activePath(), OLD_PATH)
    assert.equal(fixture.events.at(-1), `remove:${NEW_PATH}`)
  }
})

test('insère proprement un média absent et signale un nettoyage ancien échoué sans annuler le succès', async () => {
  const insertion = createDependencies({ previous: null })
  const inserted = await generateAndStoreArticleMedia({ articleId: ARTICLE_ID, mediaKey: 'flux-rag', dependencies: insertion.dependencies })
  assert.equal(inserted.cleanupWarning, false)
  assert.ok(insertion.events.includes(`replace:null->${NEW_PATH}`))

  const cleanup = createDependencies({ removeOldError: true })
  const result = await generateAndStoreArticleMedia({ articleId: ARTICLE_ID, mediaKey: 'flux-rag', dependencies: cleanup.dependencies })
  assert.equal(result.cleanupWarning, true)
  assert.equal(cleanup.activePath(), NEW_PATH)
})

function article(overrides = {}) {
  return {
    id: ARTICLE_ID,
    status: 'draft',
    title: 'Article utile',
    summary: 'Résumé utile',
    level: 'beginner',
    infographic_path: INFOGRAPHIC_PATH,
    media: [media()],
    content_markdown: 'MARKDOWN SECRET',
    sources: [{ url: 'https://secret.example' }],
    ...overrides,
  }
}

function media(overrides = {}) {
  return {
    key: 'flux-rag',
    kind: 'diagram',
    title: 'Flux',
    caption: 'Une légende',
    altText: 'Texte alternatif',
    generationBrief: 'Le flux réel du brief',
    preferredAspectRatio: '16:9',
    sourceKeys: ['source-a'],
    ...overrides,
  }
}

function createDependencies({ article: currentArticle = article(), media: currentMedia, previous = { storage_path: OLD_PATH }, failure, removeOldError = false } = {}) {
  const events = []
  let active = previous?.storage_path || null
  const nextArticle = currentArticle && { ...currentArticle, media: currentMedia ? [currentMedia] : currentArticle.media }
  return {
    events,
    activePath: () => active,
    dependencies: {
      createUniqueId: () => NEW_ID,
      logger: { warn() {} },
      getArticle: async () => nextArticle,
      downloadInfographic: async (path) => {
        events.push(`download:${path}`)
        if (failure === 'download') throw new ArticleMediaGenerationError('infographic_download_failed', 422)
        if (failure === 'source-empty') return { buffer: Buffer.alloc(0), mimeType: 'image/png' }
        if (failure === 'source-mime') return { buffer: REFERENCE_PNG, mimeType: 'image/jpeg' }
        if (failure === 'source-too-large') return { buffer: Buffer.alloc(5 * 1024 * 1024 + 1), mimeType: 'image/png' }
        if (failure === 'source-decode') return { buffer: Buffer.from('not-an-image'), mimeType: 'image/png' }
        return { buffer: REFERENCE_PNG, mimeType: 'image/png' }
      },
      getMediaAsset: async () => { events.push('get-existing'); return previous },
      generateImage: async (_prompt, _reference, ratioSpec) => {
        events.push('generate')
        if (failure === 'generate') throw new ArticleMediaGenerationError('provider_failed', 502)
        if (failure === 'invalid-generated') return { buffer: Buffer.from('invalid'), mimeType: 'image/webp' }
        return { buffer: await webp(ratioSpec.width, ratioSpec.height), mimeType: 'image/webp' }
      },
      normalizeImage: normalizeArticleMedia,
      uploadMedia: async (path) => {
        events.push(`upload:${path}`)
        if (failure === 'upload') throw new Error('storage')
      },
      replaceMediaAsset: async ({ oldPath, newPath }) => {
        events.push(`replace:${oldPath}->${newPath}`)
        if (failure === 'conflict') throw new ArticleMediaGenerationError('media_asset_changed', 409)
        if (failure === 'update') throw new Error('database')
        active = newPath
      },
      removeMedia: async (path) => {
        events.push(`remove:${path}`)
        if (removeOldError && path === OLD_PATH) throw new Error('cleanup')
      },
    },
  }
}

async function webp(width, height) {
  return withMinimumSize(await sharp({ create: { width, height, channels: 3, background: '#17324d' } }).webp({ quality: 90 }).toBuffer())
}

function withMinimumSize(buffer) {
  return buffer.length >= 1024 ? buffer : Buffer.concat([buffer, Buffer.alloc(1024 - buffer.length)])
}
