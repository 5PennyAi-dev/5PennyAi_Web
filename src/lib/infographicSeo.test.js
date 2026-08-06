import assert from 'node:assert/strict'
import test from 'node:test'
import {
  buildInfographicCanonicalUrl,
  buildInfographicSeoData,
  buildInfographicSocialImageUrl,
} from './infographicSeo.js'

const INFOGRAPHIC_ID = '11111111-1111-4111-8111-111111111111'
const SUPABASE_URL = 'https://project.supabase.co'
const THUMBNAIL_PATH = `thumbnails/infographics/${INFOGRAPHIC_ID}/thumbnail.webp`

function buildMetadata(overrides = {}) {
  return buildInfographicSeoData({ id: INFOGRAPHIC_ID, ...overrides }, {
    supabaseUrl: SUPABASE_URL,
  })
}

test('construit une canonical absolue depuis un UUID valide seulement', () => {
  assert.equal(
    buildInfographicCanonicalUrl(INFOGRAPHIC_ID),
    `https://5pennyai.com/ressources-ia/infographies/${INFOGRAPHIC_ID}`,
  )
  assert.equal(buildInfographicCanonicalUrl('invalide'), '')
})

test('utilise le titre réel avec un suffixe de page unique', () => {
  const metadata = buildMetadata({ title: 'Comprendre le RAG' })
  assert.equal(metadata.headline, 'Comprendre le RAG')
  assert.equal(metadata.socialTitle, 'Comprendre le RAG')
  assert.equal(metadata.title, 'Comprendre le RAG — 5PennyAi')
  assert.equal(buildMetadata({ title: 'Titre — 5PennyAi' }).title, 'Titre — 5PennyAi')
})

test('utilise un fallback de titre complet pour une valeur vide ou limitée à la marque', () => {
  for (const title of [undefined, null, '   ', '5PennyAi']) {
    const metadata = buildMetadata({ title })
    assert.equal(metadata.headline, 'Infographie')
    assert.equal(metadata.socialTitle, 'Infographie — 5PennyAi')
    assert.equal(metadata.title, 'Infographie — 5PennyAi')
  }
})

test('utilise summary puis introduction et nettoie HTML, retours et espaces', () => {
  assert.equal(
    buildMetadata({ summary: '  Résumé <strong>très</strong>\n\n utile  ', introduction: 'Introduction' }).description,
    'Résumé très utile',
  )
  assert.equal(
    buildMetadata({ summary: ' ', introduction: 'Une\n introduction  claire' }).description,
    'Une introduction claire',
  )
})

test('utilise la description générale de Ressources IA en dernier recours', () => {
  assert.equal(
    buildMetadata().description,
    "Des ressources pédagogiques claires et pratiques pour mieux comprendre l'intelligence artificielle.",
  )
})

test('préfère le thumbnail individuel et encode chaque segment du chemin', () => {
  const path = `thumbnails/infographics/${INFOGRAPHIC_ID}/miniature spéciale & finale.webp`
  assert.equal(
    buildInfographicSocialImageUrl(path, { resourceId: INFOGRAPHIC_ID, supabaseUrl: SUPABASE_URL }),
    `https://project.supabase.co/storage/v1/object/public/infographics/thumbnails/infographics/${INFOGRAPHIC_ID}/miniature%20sp%C3%A9ciale%20%26%20finale.webp`,
  )
  assert.equal(buildMetadata({ thumbnail_path: THUMBNAIL_PATH }).socialImageUrl,
    `https://project.supabase.co/storage/v1/object/public/infographics/${THUMBNAIL_PATH}`)
})

test('utilise le fallback social si le thumbnail est absent, invalide ou impossible à construire', () => {
  for (const metadata of [
    buildMetadata(),
    buildMetadata({ thumbnail_path: 'foreign/path.webp' }),
    buildInfographicSeoData({ id: INFOGRAPHIC_ID, thumbnail_path: THUMBNAIL_PATH }, { supabaseUrl: 'invalide' }),
  ]) {
    const imageUrl = typeof metadata === 'string' ? metadata : metadata.socialImageUrl
    assert.equal(imageUrl, 'https://5pennyai.com/images/og-christian.jpg')
  }
})

test('ignore toujours image_path comme fallback social', () => {
  assert.equal(
    buildMetadata({ image_path: `infographics/${INFOGRAPHIC_ID}/verticale.png` }).socialImageUrl,
    'https://5pennyai.com/images/og-christian.jpg',
  )
})

test('utilise image_alt puis le titre pour le texte alternatif', () => {
  assert.equal(buildMetadata({ title: 'Titre', image_alt: 'Description visuelle' }).socialImageAlt,
    'Description visuelle')
  assert.equal(buildMetadata({ title: 'Titre', image_alt: ' ' }).socialImageAlt, 'Titre')
})

test('ne produit aucune valeur undefined ou null', () => {
  const metadata = buildInfographicSeoData()
  assert.equal(metadata.ogType, 'article')
  assert.equal(metadata.locale, 'fr_CA')
  assert.equal(metadata.twitterCard, 'summary_large_image')
  for (const value of Object.values(metadata)) {
    assert.notEqual(value, undefined)
    assert.notEqual(value, null)
  }
})
