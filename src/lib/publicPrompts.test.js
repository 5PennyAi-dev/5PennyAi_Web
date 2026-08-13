import assert from 'node:assert/strict'
import test from 'node:test'
import {
  fetchPublishedPromptsForCatalog,
  loadPublishedPromptBySlug,
  PUBLIC_PROMPT_CATALOG_COLUMNS,
  PUBLIC_PROMPT_COLUMNS,
  sanitizePublishedPrompt,
} from './publicPrompts.js'

const PROMPT_ID = '11111111-1111-4111-8111-111111111111'
const FILE_ID = '22222222-2222-4222-8222-222222222222'
const THUMBNAIL_PATH = `prompts/${PROMPT_ID}/thumbnail/${FILE_ID}.webp`

test('charge par slug normalisé avec une défense explicite status=published', async () => {
  const calls = []
  const result = await loadPublishedPromptBySlug(' Mon Prompt ', client({ calls, row: publishedRow() }))
  assert.equal(result.state, 'found')
  assert.deepEqual(calls.filter(([method]) => method === 'eq'), [
    ['eq', 'slug', 'mon-prompt'],
    ['eq', 'status', 'published'],
  ])
  assert.equal(result.thumbnailUrl, `signed:${THUMBNAIL_PATH}`)
})

test('draft, slug inconnu et slug invalide ont le même état non trouvé', async () => {
  const draft = await loadPublishedPromptBySlug('mon-prompt', client({ row: publishedRow({ status: 'draft' }) }))
  const unknown = await loadPublishedPromptBySlug('inconnu', client({ row: null }))
  const invalid = await loadPublishedPromptBySlug('---', client({ row: publishedRow() }))
  assert.deepEqual([draft.state, unknown.state, invalid.state], ['not-found', 'not-found', 'not-found'])
})

test('la liste blanche exclut les données administratives et chemins Storage', () => {
  const prompt = sanitizePublishedPrompt(publishedRow({
    editorial_objective: 'secret éditorial',
    created_at: 'secret',
    thumbnail: { altText: 'Alt public', generationBrief: 'brief secret' },
    seo: {
      seoTitle: 'Titre minimal',
      metaDescription: 'Description minimale',
      primaryQuery: 'secret',
      suggestedSlug: 'secret',
      internalLinkSuggestions: [{ targetTopic: 'secret' }],
    },
  }))
  assert.equal(prompt.thumbnailAltText, 'Alt public')
  assert.equal(prompt.seoTitle, 'Titre minimal')
  assert.equal(prompt.metaDescription, 'Description minimale')
  for (const forbidden of ['editorialObjective', 'editorial_objective', 'thumbnailPath', 'thumbnail_path', 'thumbnail', 'seo', 'created_at', 'generationBrief']) {
    assert.equal(forbidden in prompt, false)
  }
  assert.doesNotMatch(JSON.stringify(prompt), /brief secret|secret éditorial|primaryQuery|suggestedSlug/)
})

test('les colonnes publiques ne sélectionnent pas les champs administratifs', () => {
  assert.match(PUBLIC_PROMPT_COLUMNS, /prompt_template/)
  assert.match(PUBLIC_PROMPT_COLUMNS, /published_at/)
  assert.doesNotMatch(PUBLIC_PROMPT_COLUMNS, /editorial_objective|keywords|created_at|updated_at/)
})

test('un chemin thumbnail invalide ou une signature refusée utilise le fallback', async () => {
  const invalid = await loadPublishedPromptBySlug('mon-prompt', client({ row: publishedRow({ thumbnail_path: '../secret.webp' }) }))
  assert.equal(invalid.thumbnailUrl, null)

  const refused = await loadPublishedPromptBySlug('mon-prompt', client({ row: publishedRow(), signError: new Error('denied') }), { logger: { warn() {} } })
  assert.equal(refused.state, 'found')
  assert.equal(refused.thumbnailUrl, null)
})

test('charge seulement les champs de catalogue des prompts publiés et signe les thumbnails valides', async () => {
  const calls = []
  const rows = [publishedRow({ keywords: ['options'] })]
  const result = await fetchPublishedPromptsForCatalog(catalogClient({ calls, rows }))

  assert.deepEqual(calls.filter(([method]) => method === 'eq'), [
    ['eq', 'status', 'published'],
  ])
  assert.match(PUBLIC_PROMPT_CATALOG_COLUMNS, /category.*contexts.*keywords.*published_at/s)
  assert.doesNotMatch(PUBLIC_PROMPT_CATALOG_COLUMNS, /prompt_template|variables|when_to_use|seo|editorial_objective/)
  assert.equal(result.rows.length, 1)
  assert.equal(result.thumbnailUrls[PROMPT_ID], `signed:${THUMBNAIL_PATH}`)
})

function publishedRow(overrides = {}) {
  return {
    id: PROMPT_ID,
    slug: 'mon-prompt',
    status: 'published',
    language: 'fr',
    title: 'Mon prompt',
    summary: 'Résumé',
    category: 'decide',
    level: 'beginner',
    contexts: ['work'],
    when_to_use: 'Pour décider.',
    prompt_template: 'Compare [A] et [B].',
    variables: [{ key: 'A', label: 'Option A', example: 'Train' }],
    tip: 'Soyez précis.',
    quick_template: 'Compare [A] et [B].',
    caution: 'Vérifiez les données.',
    published_at: '2026-08-13T15:30:00.000Z',
    thumbnail_path: THUMBNAIL_PATH,
    thumbnail: { altText: 'Comparaison visuelle' },
    seo: { seoTitle: 'Titre SEO', metaDescription: 'Description SEO' },
    ...overrides,
  }
}

function client({ calls = [], row = null, signError = null } = {}) {
  const filters = {}
  return {
    from(table) {
      assert.equal(table, 'prompts')
      const query = {
        select(columns) { calls.push(['select', columns]); return query },
        eq(field, value) { calls.push(['eq', field, value]); filters[field] = value; return query },
        limit() { return query },
        async maybeSingle() {
          const matches = row && row.slug === filters.slug && row.status === filters.status
          return { data: matches ? row : null, error: null }
        },
      }
      return query
    },
    storage: {
      from(bucket) {
        assert.equal(bucket, 'article-assets')
        return { async createSignedUrl(path) { return signError ? { data: null, error: signError } : { data: { signedUrl: `signed:${path}` }, error: null } } }
      },
    },
  }
}

function catalogClient({ calls = [], rows = [], signError = null } = {}) {
  return {
    from(table) {
      assert.equal(table, 'prompts')
      const query = {
        select(columns) { calls.push(['select', columns]); return query },
        eq(field, value) { calls.push(['eq', field, value]); return query },
        async order(field, options) {
          calls.push(['order', field, options])
          return { data: rows, error: null }
        },
      }
      return query
    },
    storage: {
      from(bucket) {
        assert.equal(bucket, 'article-assets')
        return {
          async createSignedUrl(path) {
            return signError
              ? { data: null, error: signError }
              : { data: { signedUrl: `signed:${path}` }, error: null }
          },
        }
      },
    },
  }
}
