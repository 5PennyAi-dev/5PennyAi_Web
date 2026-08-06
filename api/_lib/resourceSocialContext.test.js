import test from 'node:test'
import assert from 'node:assert/strict'
import {
  adaptArticleSocialContext,
  adaptInfographicSocialContext,
  ARTICLE_SOCIAL_COLUMNS,
  countContextCharacters,
  extractInfographicKeyPoints,
  INFOGRAPHIC_SOCIAL_COLUMNS,
  loadResourceSocialContext,
  MAX_CONTEXT_CHARACTERS,
} from './resourceSocialContext.js'

const ID = '123e4567-e89b-12d3-a456-426614174000'

test('adapte un article enregistré minimal depuis son contenu nettoyé', () => {
  const context = adaptArticleSocialContext({
    id: ID,
    status: 'draft',
    slug: 'article-minimal',
    title: ' Comprendre **le RAG** ',
    content_markdown: 'Un système {{cite:source}} **récupère** du contexte. {{media:flux}}',
  })
  assert.equal(context.resourceType, 'article')
  assert.equal(context.language, 'fr')
  assert.equal(context.title, 'Comprendre le RAG')
  assert.equal(context.mainIdea, 'Un système récupère du contexte.')
  assert.doesNotMatch(JSON.stringify(context), /cite|media|status|slug/)
})

test('conserve la langue anglaise d’un article et accepte brouillon ou publication', () => {
  for (const status of ['draft', 'published']) {
    const context = adaptArticleSocialContext({
      id: ID,
      status,
      slug: 'stored-article',
      language: 'en',
      title: 'Foundation models',
      takeaway: 'One model can support several downstream uses.',
    })
    assert.equal(context.language, 'en')
  }
})

test('refuse un article sans titre, sans contexte ou sans slug persistant valide', () => {
  assert.throws(
    () => adaptArticleSocialContext({ slug: 'article', summary: 'Contexte' }),
    { code: 'insufficient_content', status: 422 },
  )
  assert.throws(
    () => adaptArticleSocialContext({ slug: 'article', title: 'Titre' }),
    { code: 'insufficient_content', status: 422 },
  )
  assert.throws(
    () => adaptArticleSocialContext({ title: 'Titre', summary: 'Contexte' }),
    { code: 'resource_not_ready', status: 422 },
  )
  assert.throws(
    () => adaptArticleSocialContext({ slug: 'Slug invalide', title: 'Titre', summary: 'Contexte' }),
    { code: 'resource_not_ready', status: 422 },
  )
})

test('nettoie Markdown, HTML et marqueurs et limite le contexte article', () => {
  const context = adaptArticleSocialContext({
    id: ID,
    slug: 'long-article',
    title: '<strong>Titre</strong>',
    summary: '[Résumé](https://source.example) {{cite:s1}}',
    learning_objectives: ['**Objectif 1**', 'Objectif 2', 'Objectif 3'],
    content_markdown: `${'Contenu très long 🧠 '.repeat(300)} {{media:m1}}`,
  })
  assert.equal(context.title, 'Titre')
  assert.equal(context.summary, 'Résumé')
  assert.doesNotMatch(context.supportingContext, /https?:|\{\{|<strong>|\*\*/)
  assert.ok(countContextCharacters(context) <= MAX_CONTEXT_CHARACTERS)
  assert.equal(Array.from(context.supportingContext).at(-1) === '\ud83e', false)
})

test('extrait uniquement les textes utiles des key_points', () => {
  assert.deepEqual(
    extractInfographicKeyPoints([
      { title: 'Rôle', description: 'Responsabilité claire', secret: 'non' },
      { text: 'Texte direct' },
      'Point simple',
      null,
    ]),
    ['Rôle — Responsabilité claire', 'Texte direct', 'Point simple'],
  )
})

test('adapte une infographie en français sans image, source ni thumbnail', () => {
  const context = adaptInfographicSocialContext({
    id: ID,
    status: 'draft',
    title: 'Solutions multi-agents',
    introduction: 'Plusieurs rôles coordonnés.',
    key_points: [{ title: 'Orchestration', description: 'Coordonner les étapes.' }],
    keywords: ['agents IA', 'orchestration'],
    sources: [{ url: 'https://secret.example' }],
    image_path: 'private/image.png',
    thumbnail_path: 'thumbnails/private.webp',
  })
  assert.equal(context.language, 'fr')
  assert.equal(context.mainIdea, 'Plusieurs rôles coordonnés.')
  assert.match(context.supportingContext, /Orchestration/)
  assert.doesNotMatch(JSON.stringify(context), /secret|image_path|thumbnail|status/)
})

test('refuse une infographie sans titre ou sans contexte essentiel', () => {
  assert.throws(
    () => adaptInfographicSocialContext({ summary: 'Contexte' }),
    { code: 'insufficient_content' },
  )
  assert.throws(
    () => adaptInfographicSocialContext({ title: 'Titre' }),
    { code: 'insufficient_content' },
  )
})

test('charge un article avec une liste blanche sans sources ni médias', async () => {
  const calls = []
  const client = fakeSupabase({
    id: ID,
    slug: 'article',
    title: 'Article',
    summary: 'Une idée utile.',
  }, calls)
  const context = await loadResourceSocialContext(client, 'article', ID)
  assert.equal(context.resourceType, 'article')
  assert.equal(calls[0].table, 'articles')
  assert.equal(calls[0].columns, ARTICLE_SOCIAL_COLUMNS)
  assert.doesNotMatch(calls[0].columns, /sources|media,|seo|keywords/)
})

test('charge une infographie avec sa liste blanche et retourne 404 si absente', async () => {
  const calls = []
  const context = await loadResourceSocialContext(
    fakeSupabase({ id: ID, title: 'Infographie', summary: 'Une idée.' }, calls),
    'infographic',
    ID,
  )
  assert.equal(context.resourceType, 'infographic')
  assert.equal(calls[0].columns, INFOGRAPHIC_SOCIAL_COLUMNS)
  assert.doesNotMatch(calls[0].columns, /sources|image_path|image_metadata/)
  await assert.rejects(
    loadResourceSocialContext(fakeSupabase(null, []), 'infographic', ID),
    { code: 'resource_not_found', status: 404 },
  )
})

function fakeSupabase(data, calls) {
  return {
    from(table) {
      const call = { table }
      calls.push(call)
      return {
        select(columns) {
          call.columns = columns
          return {
            eq(column, value) {
              call.filter = [column, value]
              return { maybeSingle: async () => ({ data, error: null }) }
            },
          }
        },
      }
    },
  }
}
