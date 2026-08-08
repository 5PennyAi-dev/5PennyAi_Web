import assert from 'node:assert/strict'
import test from 'node:test'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { createInstance } from 'i18next'
import { I18nextProvider } from 'react-i18next'
import { createServer } from 'vite'

const vite = await createServer({
  appType: 'custom',
  optimizeDeps: { noDiscovery: true },
  server: { middlewareMode: true, hmr: false },
})
const componentModule = await vite.ssrLoadModule('/src/components/resources/ResourceShareActions.jsx')

test.after(async () => {
  await vite.close()
})

const {
  copyCanonicalUrl,
  default: ResourceShareActions,
  downloadPublicAsset,
  getSafeShareText,
  shareCanonicalUrl,
} = componentModule
const canonicalUrl = 'https://www.5pennyai.com/ressources-ia/articles/test-canonical'
const originalNavigator = globalThis.navigator

test.afterEach(() => {
  Object.defineProperty(globalThis, 'navigator', {
    configurable: true,
    value: originalNavigator,
  })
})

const i18n = createInstance()
await i18n.init({
  initImmediate: false,
  lng: 'fr',
  resources: {
    fr: {
      translation: {
        resourcesAi: {
          formats: { article: 'Article', infographic: 'Infographie' },
          share: {
            actionsLabel: 'Partager {{type}}',
            share: 'Partager',
            copy: 'Copier le lien',
            copied: 'Lien copié',
            download: 'Télécharger',
            downloading: 'Téléchargement…',
            downloadError: 'Impossible de télécharger l’infographie.',
            error: 'Impossible d’ouvrir le partage.',
            manualCopy: 'Copie automatique impossible. Le lien est sélectionné ci-dessous.',
            manualCopyLabel: 'Lien canonique à copier manuellement',
          },
        },
      },
    },
  },
})

function setNavigator(value) {
  Object.defineProperty(globalThis, 'navigator', { configurable: true, value })
}

function renderActions(props = {}) {
  return renderToStaticMarkup(
    React.createElement(
      I18nextProvider,
      { i18n },
      React.createElement(ResourceShareActions, {
        canonicalUrl,
        resourceType: 'article',
        title: 'Article test',
        ...props,
      }),
    ),
  )
}

test('affiche Partager lorsque Web Share est disponible et conserve Copier le lien', () => {
  setNavigator({ share: async () => {} })
  const html = renderActions()
  assert.match(html, />Partager</)
  assert.match(html, />Copier le lien</)
  assert.match(html, /role="group"/)
})

test('masque Partager sans Web Share sans réserver de bouton vide', () => {
  setNavigator({ clipboard: { writeText: async () => {} } })
  const html = renderActions()
  assert.doesNotMatch(html, />Partager</)
  assert.match(html, />Copier le lien</)
  assert.equal((html.match(/<button/g) || []).length, 1)
})

test('un article sans configuration de téléchargement ne propose pas Télécharger', () => {
  setNavigator({ clipboard: { writeText: async () => {} } })
  const html = renderActions()
  assert.doesNotMatch(html, />Télécharger</)
})

test('une infographie avec son asset complet propose Télécharger', () => {
  setNavigator({ clipboard: { writeText: async () => {} } })
  const html = renderActions({
    resourceType: 'infographic',
    downloadUrl: 'https://storage.example/infographics/full.png',
    downloadFileName: 'infographie-complete.png',
  })
  assert.match(html, />Télécharger</)
  assert.equal((html.match(/<button/g) || []).length, 2)
})

test('un asset ou un nom absent masque Télécharger', () => {
  setNavigator({ clipboard: { writeText: async () => {} } })
  assert.doesNotMatch(renderActions({ downloadFileName: 'image.png' }), />Télécharger</)
  assert.doesNotMatch(renderActions({ downloadUrl: 'https://storage.example/full.png' }), />Télécharger</)
})

test('partage le titre, le texte et exactement la canonical', async () => {
  let sharedData
  const navigatorObject = { share: async (data) => { sharedData = data } }
  assert.equal(await shareCanonicalUrl({
    title: 'Comprendre le RAG',
    shareText: 'Un résumé factuel.',
    canonicalUrl,
  }, navigatorObject), 'shared')
  assert.deepEqual(sharedData, {
    title: 'Comprendre le RAG',
    text: 'Un résumé factuel.',
    url: canonicalUrl,
  })
})

test('partage sans inventer de texte lorsque shareText est absent', async () => {
  let sharedData
  await shareCanonicalUrl({ title: 'Sans résumé', canonicalUrl }, {
    share: async (data) => { sharedData = data },
  })
  assert.deepEqual(sharedData, { title: 'Sans résumé', text: undefined, url: canonicalUrl })
})

test('écarte du texte de partage les URLs et marqueurs éditoriaux', () => {
  assert.equal(getSafeShareText('Voir https://example.com/source'), undefined)
  assert.equal(getSafeShareText('Résumé {{cite:source-1}}'), undefined)
  assert.equal(getSafeShareText('Illustration {{media:hero}}'), undefined)
  assert.equal(getSafeShareText('  Résumé public court.  '), 'Résumé public court.')
})

test('traite AbortError comme une annulation silencieuse', async () => {
  const abortError = new Error('cancelled')
  abortError.name = 'AbortError'
  const result = await shareCanonicalUrl({ title: 'Test', canonicalUrl }, {
    share: async () => { throw abortError },
  })
  assert.equal(result, 'cancelled')
})

test('propage une véritable erreur de partage afin que le composant l’annonce', async () => {
  await assert.rejects(
    shareCanonicalUrl({ title: 'Test', canonicalUrl }, {
      share: async () => { throw new Error('Not allowed') },
    }),
    /Not allowed/,
  )
  const html = renderActions()
  assert.match(html, /role="status"/)
  assert.match(html, />Copier le lien</)
})

test('Clipboard reçoit uniquement la canonical et signale le succès', async () => {
  let copiedValue
  const succeeded = await copyCanonicalUrl(canonicalUrl, {
    clipboard: { writeText: async (value) => { copiedValue = value } },
  })
  assert.equal(succeeded, true)
  assert.equal(copiedValue, canonicalUrl)
})

test('demande le fallback manuel lorsque Clipboard est absent ou refusé', async () => {
  assert.equal(await copyCanonicalUrl(canonicalUrl, {}), false)
  assert.equal(await copyCanonicalUrl(canonicalUrl, {
    clipboard: { writeText: async () => { throw new Error('denied') } },
  }), false)
})

test('télécharge le Blob sous le nom fourni puis libère l’URL temporaire', async () => {
  const calls = []
  const link = {
    click() { calls.push(['click', this.href, this.download]) },
    remove() { calls.push(['remove']) },
  }
  const documentObject = {
    createElement(tag) { calls.push(['create', tag]); return link },
    body: { appendChild(value) { calls.push(['append', value === link]) } },
  }
  const urlObject = {
    createObjectURL(blob) { calls.push(['object', blob.type]); return 'blob:test' },
    revokeObjectURL(url) { calls.push(['revoke', url]) },
  }

  await downloadPublicAsset(
    'https://storage.example/full.png',
    'infographie-complete.png',
    {
      fetchObject: async () => ({
        ok: true,
        blob: async () => ({ type: 'image/png' }),
      }),
      documentObject,
      urlObject,
    },
  )

  assert.deepEqual(calls, [
    ['object', 'image/png'],
    ['create', 'a'],
    ['append', true],
    ['click', 'blob:test', 'infographie-complete.png'],
    ['remove'],
    ['revoke', 'blob:test'],
  ])
})

test('un échec HTTP rejette le téléchargement sans masquer les autres actions', async () => {
  await assert.rejects(
    downloadPublicAsset('https://storage.example/missing.png', 'missing.png', {
      fetchObject: async () => ({ ok: false }),
    }),
    /download_failed/,
  )
  const html = renderActions({
    resourceType: 'infographic',
    downloadUrl: 'https://storage.example/full.png',
    downloadFileName: 'full.png',
  })
  assert.match(html, /role="status"/)
  assert.match(html, />Copier le lien</)
})

test('le fallback contient un champ readOnly sélectionnable avec la canonical intacte', () => {
  const source = componentModule.default.toString()
  assert.match(source, /manualInputRef\.current\?\.focus\(\)/)
  assert.match(source, /manualInputRef\.current\?\.select\(\)/)
  assert.match(source, /readOnly/)
  assert.match(source, /value:\s*canonicalUrl|value=\{canonicalUrl\}/)
  const html = renderActions()
  assert.match(html, /focus-visible:outline/)
  assert.match(html, /aria-live="polite"/)
})
