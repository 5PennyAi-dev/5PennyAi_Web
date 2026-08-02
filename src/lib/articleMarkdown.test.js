import test from 'node:test'
import assert from 'node:assert/strict'
import {
  articleUrlTransform,
  calculateArticleReadingTime,
  isSafeArticleLink,
  transformArticleMarkerTree,
} from './articleMarkdown.js'

test('résout citations consécutives et média seul dans son paragraphe', () => {
  const tree = { type: 'root', children: [
    { type: 'paragraph', children: [{ type: 'text', value: 'Texte {{cite:a}}{{cite:b}} fin.' }] },
    { type: 'paragraph', children: [{ type: 'text', value: '  {{media:schema-rag}}  ' }] },
  ] }
  transformArticleMarkerTree(tree)
  assert.deepEqual(tree.children[0].children.map(({ type }) => type), ['text', 'link', 'link', 'text'])
  assert.equal(tree.children[0].children[1].url, 'article-cite:a')
  assert.equal(tree.children[1].data.hName, 'div')
  assert.equal(tree.children[1].children[0].type, 'image')
  assert.equal(tree.children[1].children[0].url, 'article-media:schema-rag')
})

test('laisse les marqueurs dans le code et un média en ligne intacts', () => {
  const tree = { type: 'root', children: [
    { type: 'code', value: '{{cite:code}} {{media:code}}' },
    { type: 'paragraph', children: [{ type: 'inlineCode', value: '{{cite:inline}}' }] },
    { type: 'paragraph', children: [{ type: 'text', value: 'Avant {{media:inline}} après' }] },
  ] }
  transformArticleMarkerTree(tree)
  assert.equal(tree.children[0].value, '{{cite:code}} {{media:code}}')
  assert.equal(tree.children[1].children[0].type, 'inlineCode')
  assert.equal(tree.children[2].children.map(({ value }) => value).join(''), 'Avant {{media:inline}} après')
})

test('omet les marqueurs média non conformes en mode public sans supprimer le texte voisin', () => {
  const tree = { type: 'root', children: [
    { type: 'paragraph', children: [{ type: 'text', value: 'Avant {{media:inconnu}} après' }] },
  ] }
  transformArticleMarkerTree(tree, { mode: 'public' })
  assert.equal(tree.children[0].children.map(({ value }) => value).join(''), 'Avant  après')
})

test('conserve les nœuds tableau, code et HTML sans les interpréter', () => {
  const tree = { type: 'root', children: [
    { type: 'table', children: [] },
    { type: 'html', value: '<script>alert(1)</script>' },
    { type: 'image', url: 'https://example.com/external.png', alt: 'external' },
  ] }
  transformArticleMarkerTree(tree)
  assert.equal(tree.children[0].type, 'table')
  assert.equal(tree.children[1].type, 'html')
  assert.equal(tree.children[2].url, 'https://example.com/external.png')
})

test('refuse les protocoles dangereux et autorise ancres, relatifs et HTTP(S)', () => {
  for (const url of ['#section', '/article', './suite', '../retour', 'https://example.com', 'http://example.com']) {
    assert.equal(isSafeArticleLink(url), true)
  }
  for (const url of ['javascript:alert(1)', 'data:text/html,test', 'ftp://example.com', '//example.com']) {
    assert.equal(isSafeArticleLink(url), false)
    assert.equal(articleUrlTransform(url), '')
  }
  assert.equal(articleUrlTransform('article-cite:source'), 'article-cite:source')
})

test('calcule un temps de lecture stable en ignorant marqueurs et clôtures Markdown', () => {
  assert.equal(calculateArticleReadingTime(''), 0)
  assert.equal(calculateArticleReadingTime('Un contenu très court.'), 1)
  assert.equal(calculateArticleReadingTime('{{cite:a}} {{media:b}}'), 0)
  assert.equal(calculateArticleReadingTime('```js\nconst ignored = true\n```\nMot'), 1)
  assert.equal(calculateArticleReadingTime(Array.from({ length: 401 }, () => 'mot').join(' ')), 3)
})
