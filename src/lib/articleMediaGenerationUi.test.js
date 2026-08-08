import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import {
  generateArticleMediaFromInfographic,
  getArticleMediaGenerationAvailability,
} from './articleAssets.js'

const ARTICLE_ID = '11111111-1111-4111-8111-111111111111'
const INFOGRAPHIC_PATH = `articles/${ARTICLE_ID}/infographic/22222222-2222-4222-8222-222222222222.webp`

test('le client média transmet uniquement articleId et mediaKey avec le jeton administratif', async () => {
  const calls = []
  const result = await generateArticleMediaFromInfographic(
    ARTICLE_ID,
    'flux-rag',
    { auth: { getSession: async () => ({ data: { session: { access_token: 'token' } }, error: null }) } },
    async (...args) => { calls.push(args); return { ok: true, json: async () => ({ mediaPath: 'articles/new.webp' }) } },
  )
  assert.equal(result.mediaPath, 'articles/new.webp')
  assert.equal(calls[0][0], '/api/generate-article-media-from-infographic')
  assert.deepEqual(JSON.parse(calls[0][1].body), { articleId: ARTICLE_ID, mediaKey: 'flux-rag' })
  assert.equal(calls[0][1].headers.Authorization, 'Bearer token')
})

test('le client média conserve les erreurs contrôlées et refuse une session absente', async () => {
  await assert.rejects(
    generateArticleMediaFromInfographic(ARTICLE_ID, 'flux-rag', { auth: { getSession: async () => ({ data: {}, error: null }) } }),
    { code: 'unauthenticated' },
  )
  await assert.rejects(
    generateArticleMediaFromInfographic(
      ARTICLE_ID,
      'flux-rag',
      { auth: { getSession: async () => ({ data: { session: { access_token: 'token' } }, error: null }) } },
      async () => ({ ok: false, json: async () => ({ error: 'media_asset_changed' }) }),
    ),
    { code: 'media_asset_changed' },
  )
})

test('détermine la disponibilité UI sans remplacer les validations serveur', () => {
  const available = { articleId: ARTICLE_ID, infographicPath: INFOGRAPHIC_PATH, media: media() }
  assert.deepEqual(getArticleMediaGenerationAvailability(available), { available: true, reason: null })
  assert.deepEqual(getArticleMediaGenerationAvailability({ ...available, infographicPath: null }), { available: false, reason: 'infographicMissing' })
  assert.deepEqual(getArticleMediaGenerationAvailability({ ...available, media: media({ generationBrief: ' ' }) }), { available: false, reason: 'briefMissing' })
  assert.deepEqual(getArticleMediaGenerationAvailability({ ...available, media: media({ kind: 'chart' }) }), { available: false, reason: 'chartManual' })
  assert.deepEqual(getArticleMediaGenerationAvailability({ ...available, media: media({ kind: 'chart', generationBrief: '' }) }), { available: false, reason: 'chartManual' })
  assert.deepEqual(getArticleMediaGenerationAvailability({ ...available, media: media({ kind: 'screenshot' }) }), { available: false, reason: 'screenshotManual' })
  assert.deepEqual(getArticleMediaGenerationAvailability({ ...available, media: media({ kind: 'unknown' }) }), { available: false, reason: 'kindUnsupported' })
  assert.deepEqual(getArticleMediaGenerationAvailability({ ...available, media: media({ key: 'Flux rag' }) }), { available: false, reason: 'invalidKey' })
  assert.deepEqual(getArticleMediaGenerationAvailability({ ...available, media: media({ kind: 'illustration' }) }), { available: true, reason: null })
  assert.deepEqual(getArticleMediaGenerationAvailability({ ...available, media: media({ kind: 'infographic' }) }), { available: true, reason: null })
})

test('chaque carte média garde son état de génération et ses actions manuelles', () => {
  const source = readFileSync(new URL('../components/admin/resources/ArticleAssetField.jsx', import.meta.url), 'utf8')
  assert.match(source, /const \[generating, setGenerating\] = useState\(false\)/)
  assert.match(source, /getArticleMediaGenerationAvailability\(\{ articleId, infographicPath, media \}\)/)
  assert.match(source, /generateArticleMediaFromInfographic\(articleId, media\.key\)/)
  assert.match(source, /mediaGeneration\?\.available/)
  assert.match(source, /saved \? 'regenerate' : 'generate'/)
  assert.match(source, /disabled=\{generating\}/)
  assert.match(source, /type="file"/)
  assert.match(source, /disabled=\{busy \|\| generating\}/)
  assert.match(source, /onBusyChange\?\.\(true\)/)
})

function media(overrides = {}) {
  return {
    key: 'flux-rag',
    kind: 'diagram',
    generationBrief: 'Représenter le flux.',
    ...overrides,
  }
}
