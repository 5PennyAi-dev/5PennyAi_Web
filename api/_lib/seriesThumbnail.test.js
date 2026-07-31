import test from 'node:test'
import assert from 'node:assert/strict'
import { Buffer } from 'node:buffer'
import sharp from 'sharp'
import {
  SERIES_THUMBNAIL_PROMPT_VERSION,
  buildSeriesThumbnailPrompt,
  collectSeriesReferences,
  generateAndStoreSeriesThumbnail,
  getEpisodeReferenceCandidates,
  selectRepresentativeEpisodes,
} from './seriesThumbnail.js'

const IDS = Array.from({ length: 6 }, (_, index) =>
  `123e4567-e89b-42d3-a456-42661417400${index}`,
)
const REFERENCE = await sharp({
  create: { width: 1280, height: 720, channels: 3, background: '#f7f5f2' },
}).webp().toBuffer()
const GENERATED = await sharp({
  create: { width: 1280, height: 720, channels: 3, background: '#143054' },
}).webp().toBuffer()

test('sélectionne un, deux ou trois épisodes dans leur ordre centralisé', () => {
  assert.deepEqual(selectRepresentativeEpisodes(makeEpisodes(1)).map(({ episode_number }) => episode_number), [1])
  assert.deepEqual(selectRepresentativeEpisodes(makeEpisodes(2).reverse()).map(({ episode_number }) => episode_number), [1, 2])
  assert.deepEqual(selectRepresentativeEpisodes(makeEpisodes(3).reverse()).map(({ episode_number }) => episode_number), [1, 2, 3])
})

test('sélectionne le premier, le milieu et le dernier au-delà de trois épisodes', () => {
  assert.deepEqual(
    selectRepresentativeEpisodes(makeEpisodes(6)).map(({ episode_number }) => episode_number),
    [1, 3, 6],
  )
})

test('priorise les épisodes publiés et complète avec des brouillons seulement si nécessaire', () => {
  const mixed = makeEpisodes(4).map((episode, index) => ({
    ...episode,
    status: index === 1 || index === 3 ? 'published' : 'draft',
  }))
  assert.deepEqual(selectRepresentativeEpisodes(mixed).map(({ episode_number }) => episode_number), [1, 2, 4])
  assert.equal(selectRepresentativeEpisodes(mixed.map((episode) => ({ ...episode, status: 'draft' }))).length, 3)

  const enoughPublished = makeEpisodes(6).map((episode, index) => ({
    ...episode,
    status: index < 4 ? 'published' : 'draft',
  }))
  assert.deepEqual(
    selectRepresentativeEpisodes(enoughPublished).map(({ episode_number }) => episode_number),
    [1, 2, 4],
  )
})

test('préfère le thumbnail individuel puis l’infographie originale', () => {
  const episode = makeEpisodes(1)[0]
  assert.deepEqual(getEpisodeReferenceCandidates(episode), [episode.thumbnail_path, episode.image_path])
  assert.deepEqual(getEpisodeReferenceCandidates({ ...episode, thumbnail_path: 'foreign.webp' }), [episode.image_path])
  assert.deepEqual(getEpisodeReferenceCandidates({ ...episode, image_path: null }), [episode.thumbnail_path])
})

test('construit le prompt versionné sans données techniques, niveau ni nombre d’épisodes', () => {
  const prompt = buildSeriesThumbnailPrompt({
    seriesName: 'Les fondamentaux de l’IA générative',
    episodes: [
      { title: 'Comprendre le RAG', theme: 'IA générative', level: 'beginner', status: 'published' },
      { title: 'Utiliser les agents', theme: 'Agents' },
    ],
  })
  assert.equal(SERIES_THUMBNAIL_PROMPT_VERSION, 'series-thumbnail-skill-v1')
  assert.match(prompt, /SERIES THUMBNAIL SKILL — VERSION series-thumbnail-skill-v1/)
  assert.match(prompt, /Les fondamentaux de l’IA générative/)
  assert.match(prompt, /Comprendre le RAG \| Utiliser les agents/)
  assert.match(prompt, /images fournies comme références visuelles principales/i)
  assert.match(prompt, /nouvelle couverture horizontale 16:9/i)
  assert.match(prompt, /mosaïque/i)
  assert.match(prompt, /sommaire/i)
  assert.match(prompt, /numéro d’épisode/i)
  assert.match(prompt, /nombre total d’épisodes/i)
  assert.match(prompt, /niveau/i)
  assert.match(prompt, /microtexte/i)
  assert.match(prompt, /une seule composition cohérente/i)
  assert.doesNotMatch(prompt, /beginner|published|undefined|null|123e4567/)
})

test('essaie l’infographie lorsque le thumbnail sélectionné est inutilisable', async () => {
  const episode = makeEpisodes(1)[0]
  const calls = []
  const result = await collectSeriesReferences([episode], {
    logger: { warn: () => {} },
    downloadReference: async (path) => {
      calls.push(path)
      if (path === episode.thumbnail_path) return { buffer: Buffer.from('invalid'), mimeType: 'image/webp' }
      return { buffer: REFERENCE, mimeType: 'image/webp' }
    },
  })
  assert.deepEqual(calls, [episode.thumbnail_path, episode.image_path])
  assert.equal(result.references[0].path, episode.image_path)
})

test('refuse une série sans référence utilisable', async () => {
  await assert.rejects(
    collectSeriesReferences(makeEpisodes(1), {
      logger: { warn: () => {} },
      downloadReference: async () => { throw new Error('missing') },
    }),
    (error) => error.code === 'no_usable_references',
  )
})

test('téléverse, upsert puis nettoie l’ancienne couverture', async () => {
  const calls = []
  const result = await generateAndStoreSeriesThumbnail({
    resourceId: IDS[0],
    dependencies: makeDependencies(calls),
  })
  assert.deepEqual(calls, [
    'resource', 'episodes', 'download', 'download', 'download', 'generate', 'normalize',
    'series', 'upload', 'upsert', 'remove:old.webp',
  ])
  assert.equal(result.referenceCount, 3)
  assert.equal(result.thumbnailPath, 'thumbnails/series/serie-test/new-id.webp')
})

test('nettoie le nouveau fichier si l’upsert échoue et garde l’ancien actif', async () => {
  const calls = []
  await assert.rejects(
    generateAndStoreSeriesThumbnail({
      resourceId: IDS[0],
      dependencies: makeDependencies(calls, {
        upsertSeries: async () => { calls.push('upsert'); throw new Error('database') },
      }),
    }),
    /database/,
  )
  assert.equal(calls.at(-1), 'remove:new-id.webp')
  assert.equal(calls.includes('remove:old.webp'), false)
})

test('un échec de nettoyage de l’ancien fichier conserve le succès', async () => {
  const result = await generateAndStoreSeriesThumbnail({
    resourceId: IDS[0],
    dependencies: makeDependencies([], {
      removeThumbnail: async () => { throw new Error('cleanup') },
    }),
  })
  assert.equal(result.cleanupWarning, true)
})

function makeEpisodes(count) {
  return Array.from({ length: count }, (_, index) => ({
    id: IDS[index],
    status: 'published',
    published_at: `2026-01-${String(index + 1).padStart(2, '0')}T00:00:00Z`,
    episode_number: index + 1,
    title: `Épisode ${index + 1}`,
    theme: index % 2 ? 'Agents' : 'IA générative',
    thumbnail_path: `thumbnails/infographics/${IDS[index]}/thumbnail.webp`,
    image_path: `${IDS[index]}/original.webp`,
  }))
}

function makeDependencies(calls, overrides = {}) {
  return {
    createUniqueId: () => 'new-id',
    now: () => '2026-07-31T12:00:00.000Z',
    logger: { warn: () => {} },
    getResource: async () => { calls.push('resource'); return { id: IDS[0], series_name: 'Série test' } },
    getSeriesEpisodes: async () => { calls.push('episodes'); return makeEpisodes(4) },
    downloadReference: async () => { calls.push('download'); return { buffer: REFERENCE, mimeType: 'image/webp' } },
    generateImage: async () => { calls.push('generate'); return { buffer: GENERATED, mimeType: 'image/webp' } },
    normalizeImage: async () => {
      calls.push('normalize')
      return { buffer: GENERATED, mimeType: 'image/webp', width: 1280, height: 720, channels: 3 }
    },
    getSeries: async () => {
      calls.push('series')
      return { slug: 'serie-test', thumbnail_path: 'thumbnails/series/serie-test/old.webp' }
    },
    uploadThumbnail: async () => calls.push('upload'),
    upsertSeries: async ({ slug, name, thumbnailPath }) => {
      calls.push('upsert')
      assert.equal(slug, 'serie-test')
      assert.equal(name, 'Série test')
      assert.equal(thumbnailPath, 'thumbnails/series/serie-test/new-id.webp')
    },
    removeThumbnail: async (path) => calls.push(`remove:${path.split('/').at(-1)}`),
    ...overrides,
  }
}
