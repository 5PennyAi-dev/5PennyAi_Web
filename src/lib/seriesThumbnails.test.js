import test from 'node:test'
import assert from 'node:assert/strict'
import {
  attachSeriesThumbnails,
  buildSeriesThumbnailPath,
  isPersistedSeriesName,
  isSeriesThumbnailPathForSlug,
  shouldShowSeriesThumbnailField,
} from './seriesThumbnails.js'

test('construit et valide un chemin de couverture limité au slug de la série', () => {
  const path = buildSeriesThumbnailPath('serie-test', 'asset-id', 'image/webp')
  assert.equal(path, 'thumbnails/series/serie-test/asset-id.webp')
  assert.equal(isSeriesThumbnailPathForSlug(path, 'serie-test'), true)
  assert.equal(isSeriesThumbnailPathForSlug(path, 'autre-serie'), false)
  assert.throws(
    () => buildSeriesThumbnailPath('../serie', 'asset-id', 'image/webp'),
    /Invalid series thumbnail path input/,
  )
})

test('associe uniquement les couvertures valides à des séries déjà dérivées des publications', () => {
  const series = [
    { slug: 'alpha', name: 'Alpha' },
    { slug: 'beta', name: 'Bêta' },
  ]
  const result = attachSeriesThumbnails(series, [
    { slug: 'alpha', thumbnail_path: 'thumbnails/series/alpha/cover.webp' },
    { slug: 'beta', thumbnail_path: 'thumbnails/series/other/cover.webp' },
    { slug: 'orphan', thumbnail_path: 'thumbnails/series/orphan/cover.webp' },
  ])

  assert.equal(result.length, 2)
  assert.equal(result[0].thumbnailPath, 'thumbnails/series/alpha/cover.webp')
  assert.equal(result[1].thumbnailPath, null)
  assert.equal(result.some(({ slug }) => slug === 'orphan'), false)
})

test('désactive les actions lorsque le nom de série courant diffère du nom persisté', () => {
  assert.equal(isPersistedSeriesName(' Série test ', 'Série test'), true)
  assert.equal(isPersistedSeriesName('Série modifiée', 'Série test'), false)
  assert.equal(isPersistedSeriesName('', 'Série test'), false)
})

test('affiche le bloc uniquement lorsqu’un nom de série est présent dans le formulaire', () => {
  assert.equal(shouldShowSeriesThumbnailField(' Série test '), true)
  assert.equal(shouldShowSeriesThumbnailField(''), false)
  assert.equal(shouldShowSeriesThumbnailField(null), false)
})
