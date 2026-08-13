import { cleanMetaText, serializeJsonLd } from './articleSeo.js'
import { normalizePromptSlug } from './promptSlug.js'
import {
  buildDefaultSocialImageUrl,
  buildSiteUrl,
  SITE_NAME,
  SITE_ORIGIN,
} from './siteConfig.js'

const FALLBACKS = Object.freeze({
  fr: {
    description: 'Découvrez des modèles de prompts simples et réutilisables pour mieux travailler avec une intelligence artificielle.',
    home: 'Accueil',
    prompt: 'Prompt',
    resources: 'Ressources IA',
  },
  en: {
    description: 'Explore simple, reusable prompt templates for working more effectively with artificial intelligence.',
    home: 'Home',
    prompt: 'Prompt',
    resources: 'AI Resources',
  },
})

export function normalizePromptLanguage(value) {
  return value === 'en' ? 'en' : 'fr'
}

export function buildPromptCanonicalUrl(slug) {
  const normalizedSlug = normalizePromptSlug(slug)
  if (!normalizedSlug) return ''
  return buildSiteUrl(`/ressources-ia/prompts/${encodeURIComponent(normalizedSlug)}`)
}

export function buildPromptSocialImageUrl(slug, version) {
  const normalizedSlug = normalizePromptSlug(slug)
  if (!normalizedSlug) return buildDefaultSocialImageUrl()
  const url = new URL(`/api/prompt-social-image/${encodeURIComponent(normalizedSlug)}`, `${SITE_ORIGIN}/`)
  const timestamp = Date.parse(version)
  if (Number.isFinite(timestamp)) url.searchParams.set('v', String(timestamp))
  return url.toString()
}

export function buildPromptSeoMetadata(prompt = {}) {
  const language = normalizePromptLanguage(prompt.language)
  const fallback = FALLBACKS[language]
  const headline = cleanMetaText(prompt.title) || fallback.prompt
  const editorialTitle = cleanMetaText(prompt.seo?.seoTitle ?? prompt.seoTitle)
  const titleBase = isBrandOnly(editorialTitle) ? headline : editorialTitle || headline
  const pageTitle = withBrandSuffix(titleBase || fallback.prompt)
  const description = cleanMetaText(prompt.seo?.metaDescription ?? prompt.metaDescription)
    || cleanMetaText(prompt.summary)
    || fallback.description
  const canonicalUrl = buildPromptCanonicalUrl(prompt.slug)
  const imageVersion = toIsoDate(prompt.updatedAt) || toIsoDate(prompt.publishedAt)
  const imageUrl = prompt.hasThumbnail && canonicalUrl
    ? buildPromptSocialImageUrl(prompt.slug, imageVersion)
    : buildDefaultSocialImageUrl()

  return {
    canonicalUrl,
    description,
    headline,
    imageAlt: cleanMetaText(prompt.thumbnail?.altText ?? prompt.thumbnailAltText) || headline,
    imageUrl,
    language,
    ogLocale: language === 'en' ? 'en_CA' : 'fr_CA',
    pageTitle,
    robots: 'index, follow',
    siteName: SITE_NAME,
    socialTitle: pageTitle,
  }
}

export function buildPromptBreadcrumbStructuredData(
  prompt = {},
  metadata = buildPromptSeoMetadata(prompt),
) {
  if (!metadata.canonicalUrl) return null
  const fallback = FALLBACKS[metadata.language]
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: fallback.home, item: buildSiteUrl('/') },
      { '@type': 'ListItem', position: 2, name: fallback.resources, item: buildSiteUrl('/ressources-ia') },
      { '@type': 'ListItem', position: 3, name: metadata.headline, item: metadata.canonicalUrl },
    ],
  }
}

export { serializeJsonLd }

function isBrandOnly(value) {
  return value.toLocaleLowerCase() === SITE_NAME.toLocaleLowerCase()
}

function withBrandSuffix(value) {
  if (new RegExp(`(?:^|[|—–-]\\s*)${SITE_NAME}$`, 'i').test(value)) return value
  return `${value} — ${SITE_NAME}`
}

function toIsoDate(value) {
  if (typeof value !== 'string' || !value.trim()) return ''
  const timestamp = Date.parse(value)
  return Number.isFinite(timestamp) ? new Date(timestamp).toISOString() : ''
}
