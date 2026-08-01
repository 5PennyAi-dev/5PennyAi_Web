import test from 'node:test'
import assert from 'node:assert/strict'
import { createEmptyArticleForm } from './articleFormData.js'
import { getArticleWarnings } from './articleWarnings.js'

function codes(form) {
  return getArticleWarnings(form).map(({ code }) => code)
}

test('signale les clés invalides et dupliquées', () => {
  const form = createEmptyArticleForm()
  form.media = [{ key: 'Média_1' }, { key: 'Média_1' }]
  form.sources = [{ key: 'Source 1' }, { key: 'Source 1' }]
  const result = codes(form)
  assert.ok(result.includes('invalidMediaKey'))
  assert.ok(result.includes('duplicateMediaKey'))
  assert.ok(result.includes('invalidSourceKey'))
  assert.ok(result.includes('duplicateSourceKey'))
})

test('signale les marqueurs non résolus, les éléments inutilisés et sourceKeys inconnues', () => {
  const form = createEmptyArticleForm()
  form.contentMarkdown = '{{cite:absente}}\n\n{{media:absent}}'
  form.media = [{ key: 'media-inutilise', sourceKeys: ['source-absente'], altText: 'Alt' }]
  form.sources = [{ key: 'source-inutilisee', title: 'Source' }]
  const result = codes(form)
  assert.ok(result.includes('unresolvedCitation'))
  assert.ok(result.includes('unresolvedMedia'))
  assert.ok(result.includes('unusedMedia'))
  assert.ok(result.includes('unusedSource'))
  assert.ok(result.includes('unknownMediaSourceKey'))
})

test('ignore les faux marqueurs situés dans un bloc de code clôturé', () => {
  const form = createEmptyArticleForm()
  form.contentMarkdown = '```text\n{{cite:fausse}}\n{{media:faux}}\n```\n\nTexte.'
  const result = codes(form)
  assert.equal(result.includes('unresolvedCitation'), false)
  assert.equal(result.includes('unresolvedMedia'), false)
  assert.equal(result.includes('unclosedCodeFence'), false)
})

test('signale H1, HTML, élément dangereux, image externe et bloc non fermé', () => {
  const form = createEmptyArticleForm()
  form.contentMarkdown = '# Titre\n<script>alert(1)</script>\n![alt](https://example.com/a.png)\n```js'
  const result = codes(form)
  assert.ok(result.includes('markdownH1'))
  assert.ok(result.includes('rawHtml'))
  assert.ok(result.includes('unsafeHtmlElement'))
  assert.ok(result.includes('externalMarkdownImage'))
  assert.ok(result.includes('unclosedCodeFence'))
})

test('signale URL, dates, type de source et SEO incomplet', () => {
  const form = createEmptyArticleForm()
  form.sources = [
    {
      key: 'source',
      url: 'ftp://example.com',
      publicationDate: '2026-13',
      accessDate: '2026-02-30',
      sourceType: 'blog_post',
    },
  ]
  form.seo = { ...form.seo, metaDescription: 'Trop court' }
  const result = codes(form)
  assert.ok(result.includes('invalidSourceUrl'))
  assert.ok(result.includes('invalidPublicationDate'))
  assert.ok(result.includes('invalidAccessDate'))
  assert.ok(result.includes('unknownSourceType'))
  assert.ok(result.includes('incompleteSeo'))
  assert.ok(result.includes('missingPrimaryQuery'))
  assert.ok(result.includes('unusualMetaDescriptionLength'))
})

test('signale couverture, fichiers manquants, orphelins, ratio et poids sans bloquer', () => {
  const form = createEmptyArticleForm()
  form.contentMarkdown = '{{media:requis}}'
  form.media = [
    { key: 'requis', required: true, preferredAspectRatio: '16:9' },
    { key: 'avec-fichier', required: false, preferredAspectRatio: '16:9' },
  ]
  const result = getArticleWarnings(form, {
    articleId: 'article-id',
    assetsLoaded: true,
    coverPath: null,
    assets: [
      { media_key: 'avec-fichier', file_metadata: { width: 800, height: 800, sizeBytes: 2 * 1024 * 1024 } },
      { media_key: 'orphelin', file_metadata: {} },
    ],
  })
  const resultCodes = result.map(({ code }) => code)
  for (const code of ['missingCover', 'requiredMediaFileMissing', 'usedMediaFileMissing', 'orphanAsset', 'unusedMediaFile', 'heavyMediaFile', 'mediaRatioMismatch']) {
    assert.ok(resultCodes.includes(code), code)
  }
  assert.ok(result.every(({ severity }) => severity !== 'error'))
})
