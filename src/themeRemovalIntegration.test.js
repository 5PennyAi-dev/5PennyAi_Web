import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const root = new URL('../', import.meta.url)

async function source(path) {
  return readFile(new URL(path, root), 'utf8')
}

test('runtime Article, Infographie et catalogue ne dépendent plus de theme', async () => {
  const [articleForm, infographicForm, infographicList, catalog, articles, infographics] = await Promise.all([
    source('src/pages/admin/resources/AdminArticleForm.jsx'),
    source('src/pages/admin/resources/AdminInfographicForm.jsx'),
    source('src/pages/admin/resources/AdminInfographics.jsx'),
    source('src/lib/publicResourceCatalog.js'),
    source('src/lib/publicArticles.js'),
    source('src/lib/publicInfographics.js'),
  ])

  for (const value of [articleForm, infographicForm, infographicList, catalog, articles, infographics]) {
    assert.doesNotMatch(value, /\btheme\b/)
  }
})

test('générateurs actifs ne sélectionnent ni ne lisent theme', async () => {
  const files = await Promise.all([
    source('api/generate-article-cover-from-infographic.js'),
    source('api/generate-resource-thumbnail.js'),
    source('api/generate-series-thumbnail.js'),
    source('api/_lib/articleCoverFromInfographic.js'),
    source('api/_lib/resourceThumbnail.js'),
    source('api/_lib/resourceSocialContext.js'),
    source('api/_lib/resourceSocialPrompt.js'),
    source('api/_lib/seriesThumbnail.js'),
  ])

  for (const value of files) assert.doesNotMatch(value, /\btheme\b/)
})

test('les contrats nouveaux excluent theme et ne proposent aucun Topic JSON', async () => {
  const [articlesContract, resourcesContract] = await Promise.all([
    source('docs/ressources-ia/CONTRAT_JSON_ARTICLES_5PENNYAI_V1.md'),
    source('docs/ressources-ia/CONTRAT_JSON_RESSOURCES_IA_V1.md'),
  ])

  for (const value of [articlesContract, resourcesContract]) {
    assert.doesNotMatch(value, /"theme"\s*:/)
    assert.doesNotMatch(value, /"topics?"\s*:/)
    assert.match(value, /champ `theme`/i)
  }
})
