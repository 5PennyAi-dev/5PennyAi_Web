import assert from 'node:assert/strict'
import test from 'node:test'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { createInstance } from 'i18next'
import { I18nextProvider } from 'react-i18next'
import { createServer } from 'vite'

const vite = await createServer({ appType: 'custom', server: { middlewareMode: true } })
const componentModule = await vite.ssrLoadModule('/src/components/admin/ResourceSocialPostsPanel.jsx')

test.after(async () => {
  await vite.close()
})

const i18n = createInstance()
await i18n.init({
  initImmediate: false,
  lng: 'fr',
  resources: {
    fr: {
      translation: {
        admin: {
          resourcesAi: {
            socialPosts: {
              title: 'Publications sociales',
              generate: 'Générer les publications sociales',
              generating: 'Génération en cours',
              localOnly: 'Aucune persistance',
              untitled: 'Sans titre',
              urlUnavailable: 'URL indisponible',
              draftWarning: 'Brouillon non public',
              imageUnavailable: 'Image indisponible',
              previewImageAlt: 'Image de {{title}}',
              resourceTypes: { article: 'Article', infographic: 'Infographie' },
              statuses: { draft: 'Brouillon', published: 'Publié' },
              disabled: { unsaved: 'Enregistrez d’abord la ressource.' },
            },
          },
        },
      },
    },
  },
})

const { default: ResourceSocialPostsPanel, PlatformEditor } = componentModule

function renderPanel(props) {
  return renderToStaticMarkup(
    React.createElement(
      I18nextProvider,
      { i18n },
      React.createElement(ResourceSocialPostsPanel, props),
    ),
  )
}

test('désactive la génération d’un article non enregistré et affiche la raison', () => {
  const html = renderPanel({
    disabledReason: 'unsaved',
    resourceType: 'article',
    status: 'draft',
    title: 'Article en cours',
  })
  assert.match(html, /Enregistrez d’abord la ressource/)
  assert.match(html, /<button[^>]*disabled=""/)
  assert.match(html, /URL indisponible/)
})

test('affiche l’aperçu exploitable et l’avertissement de brouillon sans désactiver le bouton', () => {
  const html = renderPanel({
    publicUrl: 'https://5pennyai.com/ressources-ia/infographies/123e4567-e89b-12d3-a456-426614174000',
    resourceId: '123e4567-e89b-12d3-a456-426614174000',
    resourceType: 'infographic',
    socialImageUrl: 'https://5pennyai.com/images/og-christian.jpg',
    status: 'draft',
    title: 'Comprendre le RAG',
  })
  assert.match(html, /Comprendre le RAG/)
  assert.match(html, /Brouillon non public/)
  assert.match(html, /https:\/\/5pennyai.com\/ressources-ia\/infographies/)
  assert.doesNotMatch(html, /<button[^>]*disabled=""/)
})

test('rend des éditeurs séparés avec compteurs, hashtags et actions accessibles', () => {
  const t = (key, values = {}) => {
    if (key.endsWith('characterCount')) return `${values.count} caractères · ${values.min}-${values.max}`
    if (key.endsWith('hashtagCount')) return `${values.count} hashtags · ${values.min}-${values.max}`
    return key
  }
  const html = renderToStaticMarkup(React.createElement(PlatformEditor, {
    copied: false,
    copyText: 'Texte\n\nhttps://5pennyai.com/x\n\n#IA #RAG',
    error: '',
    loading: false,
    manualCopy: false,
    manualCopyRef: () => {},
    onCopy: () => {},
    onRegenerate: () => {},
    onUpdate: () => {},
    platform: 'facebook',
    post: { body: 'a'.repeat(451), hashtags: '#IA #RAG' },
    t,
  }))
  assert.match(html, /451 caractères/)
  assert.match(html, /2 hashtags/)
  assert.match(html, /social-post-facebook-body/)
  assert.match(html, /social-post-facebook-hashtags/)
  assert.match(html, /overMaximum/)
})

test('rend le fallback manuel comme zone focalisable contenant la publication complète', () => {
  const html = renderToStaticMarkup(React.createElement(PlatformEditor, {
    copied: false,
    copyText: 'Corps\n\nhttps://5pennyai.com/x\n\n#IA',
    error: '',
    loading: false,
    manualCopy: true,
    manualCopyRef: () => {},
    onCopy: () => {},
    onRegenerate: () => {},
    onUpdate: () => {},
    platform: 'linkedin',
    post: { body: 'Corps', hashtags: '#IA' },
    t: (key) => key,
  }))
  assert.match(html, /role="alert"/)
  assert.match(html, /linkedin-manual-copy/)
  assert.match(html, /https:\/\/5pennyai.com\/x/)
})
