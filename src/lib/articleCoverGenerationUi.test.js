import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { generateArticleCoverFromInfographic } from './articleAssets.js'

const ARTICLE_ID = '11111111-1111-4111-8111-111111111111'

test('le client ne transmet que articleId avec le jeton administratif', async () => {
  const calls = []
  const result = await generateArticleCoverFromInfographic(
    ARTICLE_ID,
    { auth: { getSession: async () => ({ data: { session: { access_token: 'token' } }, error: null }) } },
    async (...args) => { calls.push(args); return { ok: true, json: async () => ({ coverPath: 'articles/new.webp' }) } },
  )
  assert.equal(result.coverPath, 'articles/new.webp')
  assert.equal(calls[0][0], '/api/generate-article-cover-from-infographic')
  assert.deepEqual(JSON.parse(calls[0][1].body), { articleId: ARTICLE_ID })
  assert.equal(calls[0][1].headers.Authorization, 'Bearer token')
})

test('le bloc couverture garde upload manuel et expose les états génération requis', () => {
  const source = readFileSync(new URL('../components/admin/resources/ArticleAssetField.jsx', import.meta.url), 'utf8')
  assert.match(source, /saved \? 'regenerate' : 'generate'/)
  assert.match(source, /coverGeneration\.generating/)
  assert.match(source, /!infographicPath \|\| generating/)
  assert.match(source, /coverGeneration\.addInfographicFirst/)
  assert.match(source, /type="file"/)
  assert.match(source, /setFeedback\(\{\s*type: 'error'/)
})
