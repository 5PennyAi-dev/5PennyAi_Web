import test from 'node:test'
import assert from 'node:assert/strict'
import {
  MAX_THUMBNAIL_SIZE_BYTES,
  buildInfographicThumbnailPath,
  getInfographicImageCandidates,
  isAllowedThumbnailMime,
  isInfographicThumbnailPathForResource,
  isThumbnailRatioAccepted,
  isThumbnailSizeAllowed,
  validateInfographicThumbnail,
} from './infographicThumbnails.js'

test('priorise le thumbnail, conserve le fallback et déduplique les chemins', () => {
  const resource = { thumbnail_path: 'thumbnail.webp', image_path: 'image.png' }
  const original = { ...resource }

  assert.deepEqual(getInfographicImageCandidates(resource), ['thumbnail.webp', 'image.png'])
  assert.deepEqual(getInfographicImageCandidates({ thumbnail_path: 'same.png', image_path: 'same.png' }), ['same.png'])
  assert.deepEqual(getInfographicImageCandidates({ image_path: 'image.png' }), ['image.png'])
  assert.deepEqual(getInfographicImageCandidates({}), [])
  assert.deepEqual(getInfographicImageCandidates(null), [])
  assert.deepEqual(resource, original)
})

test('accepte seulement les types MIME prévus', () => {
  assert.equal(isAllowedThumbnailMime('image/png'), true)
  assert.equal(isAllowedThumbnailMime('image/jpeg'), true)
  assert.equal(isAllowedThumbnailMime('image/webp'), true)
  assert.equal(isAllowedThumbnailMime('image/gif'), false)
  assert.equal(isAllowedThumbnailMime('text/plain'), false)
})

test('applique la limite dure de 5 Mo', () => {
  assert.equal(isThumbnailSizeAllowed(MAX_THUMBNAIL_SIZE_BYTES), true)
  assert.equal(isThumbnailSizeAllowed(MAX_THUMBNAIL_SIZE_BYTES + 1), false)
  assert.equal(isThumbnailSizeAllowed(Number.NaN), false)
})

test('accepte le 16:9 avec une tolérance de 3 % et refuse un portrait', () => {
  assert.equal(isThumbnailRatioAccepted(1280, 720), true)
  assert.equal(isThumbnailRatioAccepted(1792, 1024), true)
  assert.equal(isThumbnailRatioAccepted(720, 1280), false)
})

test('refuse les dimensions absentes ou invalides', () => {
  assert.equal(isThumbnailRatioAccepted(0, 720), false)
  assert.equal(isThumbnailRatioAccepted(1280, 0), false)
  assert.deepEqual(
    validateInfographicThumbnail({ mimeType: 'image/png', sizeBytes: 100, width: undefined, height: undefined }),
    { valid: false, error: 'unreadable' },
  )
})

test('retourne des erreurs de validation stables et un avertissement de performance', () => {
  assert.deepEqual(
    validateInfographicThumbnail({ mimeType: 'image/gif', sizeBytes: 100, width: 1280, height: 720 }),
    { valid: false, error: 'unsupportedType' },
  )
  assert.deepEqual(
    validateInfographicThumbnail({ mimeType: 'image/png', sizeBytes: MAX_THUMBNAIL_SIZE_BYTES + 1, width: 1280, height: 720 }),
    { valid: false, error: 'tooLarge' },
  )
  assert.deepEqual(
    validateInfographicThumbnail({ mimeType: 'image/png', sizeBytes: 600 * 1024, width: 1280, height: 720 }),
    { valid: true, warning: 'performance' },
  )
})

test('construit un chemin Storage unique selon le MIME', () => {
  assert.equal(
    buildInfographicThumbnailPath('resource-id', 'file-id', 'image/jpeg'),
    'thumbnails/infographics/resource-id/file-id.jpg',
  )
  assert.throws(
    () => buildInfographicThumbnailPath('../resource', 'file-id', 'image/png'),
    /Invalid infographic thumbnail path input/,
  )
})

test('vérifie strictement que le chemin appartient à la ressource', () => {
  assert.equal(
    isInfographicThumbnailPathForResource(
      'thumbnails/infographics/resource-id/file-id.webp',
      'resource-id',
    ),
    true,
  )
  assert.equal(
    isInfographicThumbnailPathForResource(
      'thumbnails/infographics/other-resource/file-id.webp',
      'resource-id',
    ),
    false,
  )
  assert.equal(
    isInfographicThumbnailPathForResource(
      'thumbnails/infographics/resource-id/nested/file-id.webp',
      'resource-id',
    ),
    false,
  )
})
