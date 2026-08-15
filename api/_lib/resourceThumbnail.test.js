import test from 'node:test'
import assert from 'node:assert/strict'
import { Buffer } from 'node:buffer'
import sharp from 'sharp'
import {
  NORMALIZED_THUMBNAIL_HEIGHT,
  NORMALIZED_THUMBNAIL_WIDTH,
  RESOURCE_THUMBNAIL_NORMALIZATION,
  RESOURCE_THUMBNAIL_PROMPT_VERSION,
  ResourceThumbnailError,
  buildResourceThumbnailPrompt,
  generateAndStoreResourceThumbnail,
  getReferenceMimeType,
  isInfographicReferencePathForResource,
  normalizeResourceThumbnail,
  validateReferenceImage,
  validateResourceId,
} from './resourceThumbnail.js'

const RESOURCE_ID = '123e4567-e89b-42d3-a456-426614174000'
const REFERENCE_PATH = `${RESOURCE_ID}/reference.png`
const REFERENCE_PNG = await createPng(1024, 1536, '#f7f5f2')
const GENERATED_WEBP = await createWebp(1280, 720, '#143054')
const NORMALIZED_WEBP = await createWebp(1280, 720, '#2a9d8f')

test('valide strictement un identifiant UUID et un chemin de référence appartenant à la ressource', () => {
  assert.equal(validateResourceId(RESOURCE_ID), true)
  assert.equal(validateResourceId('not-a-uuid'), false)
  assert.equal(isInfographicReferencePathForResource(REFERENCE_PATH, RESOURCE_ID), true)
  assert.equal(isInfographicReferencePathForResource('other/reference.png', RESOURCE_ID), false)
  assert.equal(isInfographicReferencePathForResource(`${RESOURCE_ID}/nested/reference.png`, RESOURCE_ID), false)
  assert.equal(getReferenceMimeType(`${RESOURCE_ID}/reference.jpeg`), 'image/jpeg')
  assert.equal(getReferenceMimeType(`${RESOURCE_ID}/reference.gif`), null)
})

test('construit le prompt v3 avec la référence, une composition libre et les métadonnées utiles', () => {
  const prompt = buildResourceThumbnailPrompt({
    title: 'Comprendre le RAG',
    subtitle: 'Des réponses mieux ancrées',
    summary: 'Recherche puis génération.',
    theme: 'IA générative',
    key_points: [{ title: 'Chercher', description: 'Trouver le bon contexte' }],
    takeaway: 'La qualité du contexte compte.',
    sources: [{ title: 'Interdit', url: 'https://example.com' }],
  })

  assert.equal(RESOURCE_THUMBNAIL_PROMPT_VERSION, 'thumbnail-skill-v3')
  assert.match(prompt, /THUMBNAIL SKILL — VERSION thumbnail-skill-v3/)
  assert.match(prompt, /infographie fournie comme référence visuelle principale/i)
  assert.match(prompt, /composition entièrement repensée/i)
  assert.match(prompt, /ne s’agit pas de réduire[^.]+simplement la recadrer/i)
  assert.match(prompt, /mini-infographie/i)
  assert.match(prompt, /LIBERTÉ DE COMPOSITION/)
  assert.match(prompt, /pas un gabarit obligatoire/i)
  assert.match(prompt, /Titre complet :\nComprendre le RAG/)
  assert.match(prompt, /Résumé :\nRecherche puis génération\./)
  assert.match(prompt, /Notions essentielles :\nChercher — Trouver le bon contexte/)
  assert.match(prompt, /Message principal :\nLa qualité du contexte compte\./)
  assert.match(prompt, /nom de la série[^.]+numéro d’épisode/i)
  assert.match(prompt, /référence peut elle-même contenir le nom de la série, un numéro d’épisode/i)
  assert.match(prompt, /source, une URL/)
  assert.match(prompt, /microtexte/)
  assert.match(prompt, /16:9/)
  assert.doesNotMatch(prompt, /https:\/\/example\.com/)
  assert.doesNotMatch(prompt, /undefined|null/)
})

test('omet proprement les métadonnées facultatives absentes', () => {
  const prompt = buildResourceThumbnailPrompt({ title: 'Titre seul' })
  assert.match(prompt, /Titre complet :\nTitre seul/)
  assert.doesNotMatch(prompt, /Sous-titre ou accroche facultative :/)
  assert.doesNotMatch(prompt, /Résumé :/)
  assert.doesNotMatch(prompt, /Notions essentielles :/)
  assert.doesNotMatch(prompt, /Message principal :/)
})

test('valide une référence PNG décodable sans la modifier', async () => {
  const original = Buffer.from(REFERENCE_PNG)
  const result = await validateReferenceImage(
    { path: REFERENCE_PATH, buffer: REFERENCE_PNG, mimeType: 'image/png' },
    RESOURCE_ID,
  )
  assert.strictEqual(result.buffer, REFERENCE_PNG)
  assert.deepEqual(REFERENCE_PNG, original)
  assert.equal(result.mimeType, 'image/png')
  assert.equal(result.width, 1024)
  assert.equal(result.height, 1536)
})

test('refuse une référence vide, au MIME incohérent ou indécodable', async () => {
  await assert.rejects(
    validateReferenceImage({ path: REFERENCE_PATH, buffer: Buffer.alloc(0) }, RESOURCE_ID),
    (error) => error.code === 'reference_empty',
  )
  await assert.rejects(
    validateReferenceImage(
      { path: REFERENCE_PATH, buffer: REFERENCE_PNG, mimeType: 'image/jpeg' },
      RESOURCE_ID,
    ),
    (error) => error.code === 'reference_invalid_mime',
  )
  await assert.rejects(
    validateReferenceImage(
      { path: REFERENCE_PATH, buffer: Buffer.from('not-an-image'), mimeType: 'image/png' },
      RESOURCE_ID,
    ),
    (error) => error.code === 'reference_invalid_image',
  )
})

test('conserve une sortie native 1280 × 720 en WebP opaque', async () => {
  const result = await normalizeResourceThumbnail(GENERATED_WEBP)
  const metadata = await sharp(result.buffer).metadata()
  assert.equal(result.width, NORMALIZED_THUMBNAIL_WIDTH)
  assert.equal(result.height, NORMALIZED_THUMBNAIL_HEIGHT)
  assert.equal(metadata.format, 'webp')
  assert.equal(metadata.hasAlpha, false)
  assert.equal(RESOURCE_THUMBNAIL_NORMALIZATION.fit, 'cover')
  assert.equal(RESOURCE_THUMBNAIL_NORMALIZATION.position, 'centre')
  assert.equal(RESOURCE_THUMBNAIL_NORMALIZATION.quality, 85)
  assert.equal('background' in RESOURCE_THUMBNAIL_NORMALIZATION, false)
})

test('recadre au centre une sortie 1536 × 1024 sans contain ni bandes ajoutées', async () => {
  const source = await createCenterCropFixture()
  const result = await normalizeResourceThumbnail(source)
  const { data, info } = await sharp(result.buffer).raw().toBuffer({ resolveWithObject: true })
  assert.equal(info.width, 1280)
  assert.equal(info.height, 720)

  for (const y of [0, Math.floor(info.height / 2), info.height - 1]) {
    const offset = (y * info.width + Math.floor(info.width / 2)) * info.channels
    const [r, g, b] = data.subarray(offset, offset + 3)
    assert.ok(g > 120 && g > r * 1.5 && g > b * 1.2)
  }
})

test('refuse une sortie générée vide ou indécodable pendant le traitement', async () => {
  await assert.rejects(
    normalizeResourceThumbnail(Buffer.alloc(0)),
    (error) => error.code === 'normalization_invalid_input',
  )
  await assert.rejects(
    normalizeResourceThumbnail(Buffer.from('not-an-image')),
    (error) => error.code === 'normalization_failed',
  )
})

test('arrête avant le téléchargement si la ressource, image_path ou le chemin sont invalides', async () => {
  const missingCalls = []
  await assert.rejects(
    generateAndStoreResourceThumbnail({
      resourceId: RESOURCE_ID,
      dependencies: createDependencies(missingCalls, { getResource: async () => null }),
    }),
    (error) => error.code === 'resource_not_found',
  )

  const noPathCalls = []
  await assert.rejects(
    generateAndStoreResourceThumbnail({
      resourceId: RESOURCE_ID,
      dependencies: createDependencies(noPathCalls, {
        getResource: async () => ({ id: RESOURCE_ID, image_path: null }),
      }),
    }),
    (error) => error.code === 'reference_missing',
  )

  const invalidPathCalls = []
  await assert.rejects(
    generateAndStoreResourceThumbnail({
      resourceId: RESOURCE_ID,
      dependencies: createDependencies(invalidPathCalls, {
        getResource: async () => ({ id: RESOURCE_ID, image_path: 'other/reference.png' }),
      }),
    }),
    (error) => error.code === 'reference_invalid_path',
  )
})

test('conserve l’ancien thumbnail si le téléchargement ou la référence échoue', async () => {
  const downloadCalls = []
  await assert.rejects(
    generateAndStoreResourceThumbnail({
      resourceId: RESOURCE_ID,
      dependencies: createDependencies(downloadCalls, {
        downloadReference: async () => {
          downloadCalls.push('download')
          throw new ResourceThumbnailError('reference_download_failed', 422)
        },
      }),
    }),
    (error) => error.code === 'reference_download_failed',
  )
  assert.deepEqual(downloadCalls, ['get', 'download'])

  const invalidCalls = []
  await assert.rejects(
    generateAndStoreResourceThumbnail({
      resourceId: RESOURCE_ID,
      dependencies: createDependencies(invalidCalls, {
        downloadReference: async () => {
          invalidCalls.push('download')
          return { buffer: Buffer.from('broken'), mimeType: 'image/png' }
        },
      }),
    }),
    (error) => error.code === 'reference_invalid_image',
  )
  assert.deepEqual(invalidCalls, ['get', 'download'])
})

test('transmet la référence validée à OpenAI avant tout traitement ou stockage', async () => {
  const calls = []
  const dependencies = createDependencies(calls, {
    generateImage: async (prompt, reference) => {
      calls.push('generate')
      assert.match(prompt, /thumbnail-skill-v3/)
      assert.strictEqual(reference.buffer, REFERENCE_PNG)
      assert.equal(reference.mimeType, 'image/png')
      assert.equal(reference.path, REFERENCE_PATH)
      return { buffer: GENERATED_WEBP, mimeType: 'image/webp' }
    },
  })
  await generateAndStoreResourceThumbnail({ resourceId: RESOURCE_ID, dependencies })
  assert.deepEqual(calls, [
    'get',
    'download',
    'generate',
    'normalize',
    'upload',
    'update',
    'remove:old.webp',
  ])
})

test('conserve l’ancien thumbnail si OpenAI, le traitement ou Storage échoue', async () => {
  const providerCalls = []
  await assert.rejects(
    generateAndStoreResourceThumbnail({
      resourceId: RESOURCE_ID,
      dependencies: createDependencies(providerCalls, {
        generateImage: async () => {
          providerCalls.push('generate')
          throw new ResourceThumbnailError('provider_failed', 502)
        },
      }),
    }),
    (error) => error.code === 'provider_failed',
  )
  assert.deepEqual(providerCalls, ['get', 'download', 'generate'])

  const normalizationCalls = []
  await assert.rejects(
    generateAndStoreResourceThumbnail({
      resourceId: RESOURCE_ID,
      dependencies: createDependencies(normalizationCalls, {
        normalizeImage: async () => {
          normalizationCalls.push('normalize')
          throw new ResourceThumbnailError('normalization_failed', 502)
        },
      }),
    }),
    (error) => error.code === 'normalization_failed',
  )
  assert.deepEqual(normalizationCalls, ['get', 'download', 'generate', 'normalize'])

  const uploadCalls = []
  await assert.rejects(
    generateAndStoreResourceThumbnail({
      resourceId: RESOURCE_ID,
      dependencies: createDependencies(uploadCalls, {
        uploadThumbnail: async () => {
          uploadCalls.push('upload')
          throw new Error('upload failed')
        },
      }),
    }),
    /upload failed/,
  )
  assert.deepEqual(uploadCalls, ['get', 'download', 'generate', 'normalize', 'upload'])
})

test('met à jour SQL avant de nettoyer l’ancien thumbnail', async () => {
  const calls = []
  const result = await generateAndStoreResourceThumbnail({
    resourceId: RESOURCE_ID,
    dependencies: createDependencies(calls),
  })
  assert.deepEqual(calls, ['get', 'download', 'generate', 'normalize', 'upload', 'update', 'remove:old.webp'])
  assert.match(result.thumbnailPath, new RegExp(`thumbnails/infographics/${RESOURCE_ID}/new-id\\.webp`))
  assert.equal(result.width, 1280)
  assert.equal(result.height, 720)
  assert.equal(result.cleanupWarning, false)
})

test('nettoie le nouveau fichier après un échec SQL', async () => {
  const calls = []
  await assert.rejects(
    generateAndStoreResourceThumbnail({
      resourceId: RESOURCE_ID,
      dependencies: createDependencies(calls, {
        updateThumbnailPath: async () => {
          calls.push('update')
          throw new Error('database failed')
        },
      }),
    }),
    /database failed/,
  )
  assert.equal(calls.at(-1), 'remove:new-id.webp')
})

test('un échec de nettoyage de l’ancien fichier ne révoque pas le succès', async () => {
  const calls = []
  const result = await generateAndStoreResourceThumbnail({
    resourceId: RESOURCE_ID,
    dependencies: createDependencies(calls, {
      removeThumbnail: async (path) => {
        calls.push(`remove:${path.split('/').at(-1)}`)
        throw new Error('cleanup failed')
      },
    }),
  })
  assert.equal(result.cleanupWarning, true)
  assert.equal(calls.at(-1), 'remove:old.webp')
})

function createDependencies(calls, overrides = {}) {
  return {
    createUniqueId: () => 'new-id',
    logger: { warn: () => {} },
    getResource: async () => {
      calls.push('get')
      return {
        id: RESOURCE_ID,
        title: 'RAG',
        image_path: REFERENCE_PATH,
        thumbnail_path: `thumbnails/infographics/${RESOURCE_ID}/old.webp`,
      }
    },
    downloadReference: async (path) => {
      calls.push('download')
      assert.equal(path, REFERENCE_PATH)
      return { buffer: REFERENCE_PNG, mimeType: 'image/png' }
    },
    generateImage: async (_prompt, reference) => {
      calls.push('generate')
      assert.strictEqual(reference.buffer, REFERENCE_PNG)
      return { buffer: GENERATED_WEBP, mimeType: 'image/webp' }
    },
    normalizeImage: async (source) => {
      calls.push('normalize')
      assert.strictEqual(source, GENERATED_WEBP)
      return {
        buffer: NORMALIZED_WEBP,
        mimeType: 'image/webp',
        width: 1280,
        height: 720,
        channels: 3,
      }
    },
    uploadThumbnail: async (_path, buffer) => {
      calls.push('upload')
      assert.strictEqual(buffer, NORMALIZED_WEBP)
    },
    updateThumbnailPath: async () => calls.push('update'),
    removeThumbnail: async (path) => calls.push(`remove:${path.split('/').at(-1)}`),
    ...overrides,
  }
}

function createPng(width, height, background) {
  return sharp({ create: { width, height, channels: 3, background } }).png().toBuffer()
}

function createWebp(width, height, background) {
  return sharp({ create: { width, height, channels: 3, background } }).webp({ quality: 90 }).toBuffer()
}

async function createCenterCropFixture() {
  const svg = Buffer.from(`
    <svg xmlns="http://www.w3.org/2000/svg" width="1536" height="1024">
      <rect width="1536" height="1024" fill="#dc2626"/>
      <rect y="80" width="1536" height="864" fill="#2a9d5b"/>
    </svg>
  `)
  return sharp(svg).webp({ quality: 95 }).toBuffer()
}
