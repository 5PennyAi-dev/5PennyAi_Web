import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { createServer } from 'vite'

const vite = await createServer({
  appType: 'custom',
  optimizeDeps: { noDiscovery: true },
  server: { middlewareMode: true, hmr: false },
})
const { default: ArticleCompanionInfographic } = await vite.ssrLoadModule('/src/components/resources/ArticleCompanionInfographic.jsx')
const { handleImageDialogKeyDown } = await import('../../lib/imageDialogFocus.js')
const { ArticleMarkdownContent } = await vite.ssrLoadModule('/src/components/admin/resources/ArticlePreview.jsx')

test.after(async () => {
  await vite.close()
})

const labels = {
  'resourcesAi.article.infographic.title': 'Infographie de synthèse',
  'resourcesAi.article.infographic.description': 'Retrouvez les idées principales.',
  'resourcesAi.article.infographic.enlarge': 'Agrandir',
  'resourcesAi.article.infographic.download': 'Télécharger',
  'resourcesAi.article.infographic.downloading': 'Téléchargement…',
  'resourcesAi.article.infographic.downloadError': 'Téléchargement impossible',
  'resourcesAi.article.infographic.close': 'Fermer',
  'resourcesAi.article.takeaway': 'À retenir',
  'resourcesAi.article.sources': 'Sources',
  'resourcesAi.article.untitledSource': 'Source sans titre',
  'resourcesAi.article.accessed': 'Consulté',
  'resourcesAi.article.emptyMarkdown': 'Contenu indisponible',
}

function t(key, values = {}) {
  if (key === 'resourcesAi.article.infographic.altFallback') {
    return `Infographie de synthèse de l’article « ${values.title} »`
  }
  return labels[key] || values.defaultValue || key
}

function renderCompanion(props = {}) {
  return renderToStaticMarkup(React.createElement(ArticleCompanionInfographic, {
    infographic: {
      altText: 'Synthèse accessible',
      downloadFileName: 'mon-article-infographie.webp',
      url: 'https://storage.example/signed.webp',
    },
    t,
    title: 'Mon article',
    ...props,
  }))
}

test('rend l’aperçu naturel, lazy et les deux seules actions attendues', () => {
  const html = renderCompanion()
  assert.match(html, />Infographie de synthèse</)
  assert.match(html, /alt="Synthèse accessible"/)
  assert.match(html, /loading="lazy"/)
  assert.match(html, /decoding="async"/)
  assert.match(html, />Agrandir</)
  assert.match(html, />Télécharger</)
  assert.equal((html.match(/<button/g) || []).length, 2)
  assert.doesNotMatch(html, /Partager|Copier le lien/)
  assert.doesNotMatch(html, /object-cover|aspect-video/)
})

test('applique le fallback d’alt au rendu et masque complètement un asset absent', () => {
  assert.match(renderCompanion({
    infographic: { altText: '', url: 'https://storage.example/signed.png' },
  }), /alt="Infographie de synthèse de l’article « Mon article »"/)
  assert.equal(renderCompanion({ infographic: null }), '')
  assert.equal(renderCompanion({ infographic: { url: '' } }), '')
})

test('l’aperçu administratif réutilise le bloc sans actions publiques', () => {
  const html = renderCompanion({ showActions: false })
  assert.match(html, />Infographie de synthèse</)
  assert.equal((html.match(/<button/g) || []).length, 0)
})

test('place le bloc entre À retenir et Sources sans espace réservé lorsqu’il est absent', () => {
  const form = {
    contentMarkdown: 'Contenu principal.',
    takeaway: 'Essentiel.',
    title: 'Mon article',
    media: [],
    sources: [{ key: 'source', title: 'Source primaire' }],
  }
  const infographic = {
    altText: '',
    downloadFileName: 'mon-article-infographie.png',
    url: 'https://storage.example/signed.png',
  }
  const withBlock = renderToStaticMarkup(React.createElement(ArticleMarkdownContent, {
    companionInfographic: infographic,
    form,
    mode: 'public',
    t,
  }))
  assert.ok(withBlock.indexOf('À retenir') < withBlock.indexOf('Infographie de synthèse'))
  assert.ok(withBlock.indexOf('Infographie de synthèse') < withBlock.indexOf('Sources'))

  const withoutBlock = renderToStaticMarkup(React.createElement(ArticleMarkdownContent, {
    form,
    mode: 'public',
    t,
  }))
  assert.doesNotMatch(withoutBlock, /Infographie de synthèse/)
})

test('gère Escape, Tab et Shift+Tab dans la visionneuse', () => {
  const focused = []
  const first = { hidden: false, getAttribute: () => null, focus: () => focused.push('first') }
  const last = { hidden: false, getAttribute: () => null, focus: () => focused.push('last') }
  const container = {
    contains: (value) => value === first || value === last,
    querySelectorAll: () => [first, last],
  }
  const previousDocument = globalThis.document
  let closed = false
  const preventions = []
  globalThis.document = { activeElement: last }
  try {
    handleImageDialogKeyDown({ key: 'Tab', shiftKey: false, preventDefault: () => preventions.push('tab') }, { container, onClose: () => {} })
    globalThis.document.activeElement = first
    handleImageDialogKeyDown({ key: 'Tab', shiftKey: true, preventDefault: () => preventions.push('shift-tab') }, { container, onClose: () => {} })
    handleImageDialogKeyDown({ key: 'Escape', preventDefault: () => preventions.push('escape') }, { container, onClose: () => { closed = true } })
  } finally {
    globalThis.document = previousDocument
  }
  assert.deepEqual(focused, ['first', 'last'])
  assert.deepEqual(preventions, ['tab', 'shift-tab', 'escape'])
  assert.equal(closed, true)
})

test('la visionneuse conserve fermeture bouton, restauration du focus et blocage du scroll', () => {
  const source = readFileSync(new URL('./ImageDialog.jsx', import.meta.url), 'utf8')
  assert.match(source, /onClick=\{onClose\}/)
  assert.match(source, /previouslyFocused\?\.focus\?\.\(\)/)
  assert.match(source, /document\.body\.style\.overflow = 'hidden'/)
  assert.match(source, /role="dialog"/)
  assert.match(source, /aria-modal="true"/)
})
