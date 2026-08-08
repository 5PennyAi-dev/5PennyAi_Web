import { slugifyArticle } from './articleSlug.js'
import {
  buildDefaultSocialImageUrl,
  buildSiteUrl,
  SITE_NAME,
  SITE_ORIGIN,
} from './siteConfig.js'

const FALLBACKS = Object.freeze({
  fr: {
    article: 'Article',
    description: "Découvrez les articles et ressources pédagogiques de 5PennyAi sur l’intelligence artificielle.",
    home: 'Accueil',
    imageAlt: "Illustration de l’article",
    resources: 'Ressources IA',
  },
  en: {
    article: 'Article',
    description: 'Explore 5PennyAi articles and educational resources about artificial intelligence.',
    home: 'Home',
    imageAlt: 'Article illustration',
    resources: 'AI Resources',
  },
})

export function normalizeArticleLanguage(value) {
  return value === 'en' ? 'en' : 'fr'
}
export function buildArticleCanonicalUrl(slug) {
  const normalizedSlug = slugifyArticle(typeof slug === 'string' ? slug : '')
  if (!normalizedSlug) return ''
  return buildSiteUrl(`/ressources-ia/articles/${encodeURIComponent(normalizedSlug)}`)
}

export function buildArticleSocialImageUrl(slug, version) {
  const normalizedSlug = slugifyArticle(typeof slug === 'string' ? slug : '')
  if (!normalizedSlug) return buildDefaultSocialImageUrl()
  const url = new URL(
    `/api/article-social-image/${encodeURIComponent(normalizedSlug)}`,
    `${SITE_ORIGIN}/`,
  )
  const versionTimestamp = Date.parse(version)
  if (Number.isFinite(versionTimestamp)) url.searchParams.set('v', String(versionTimestamp))
  return url.toString()
}

export function buildArticleSeoMetadata(article = {}) {
  const language = normalizeArticleLanguage(article.language)
  const fallback = FALLBACKS[language]
  const headline = cleanText(article.title) || fallback.article
  const editorialSeoTitle = cleanText(article.seo?.seoTitle)
  const titleBase = isBrandOnly(editorialSeoTitle)
    ? headline
    : editorialSeoTitle || headline || fallback.article
  const pageTitle = withBrandSuffix(titleBase || fallback.article)
  const description = cleanMetaText(article.seo?.metaDescription)
    || cleanMetaText(article.summary)
    || fallback.description
  const canonicalUrl = buildArticleCanonicalUrl(article.slug)
  const datePublished = toIsoDate(article.publishedAt)
  const candidateModified = toIsoDate(article.updatedAt)
  const dateModified = candidateModified
    && (!datePublished || Date.parse(candidateModified) >= Date.parse(datePublished))
    ? candidateModified
    : ''
  const imageUrl = article.hasCover && canonicalUrl
    ? buildArticleSocialImageUrl(article.slug, candidateModified)
    : buildDefaultSocialImageUrl()
  const imageAlt = cleanText(article.cover?.altText) || headline || fallback.imageAlt

  return {
    canonicalUrl,
    dateModified,
    datePublished,
    description,
    headline,
    imageAlt,
    imageUrl,
    language,
    ogLocale: language === 'en' ? 'en_CA' : 'fr_CA',
    pageTitle,
    robots: 'index, follow',
    siteName: SITE_NAME,
    socialTitle: pageTitle,
  }
}

export function buildArticleStructuredData(article = {}, metadata = buildArticleSeoMetadata(article)) {
  if (!metadata.canonicalUrl) return null
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: metadata.headline,
    description: metadata.description,
    inLanguage: metadata.language,
    image: metadata.imageUrl,
    mainEntityOfPage: metadata.canonicalUrl,
  }
  if (metadata.datePublished) data.datePublished = metadata.datePublished
  if (metadata.dateModified) data.dateModified = metadata.dateModified
  return data
}

export function buildBreadcrumbStructuredData(article = {}, metadata = buildArticleSeoMetadata(article)) {
  if (!metadata.canonicalUrl) return null
  const fallback = FALLBACKS[metadata.language]
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: fallback.home,
        item: buildSiteUrl('/'),
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: fallback.resources,
        item: buildSiteUrl('/ressources-ia'),
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: metadata.headline,
        item: metadata.canonicalUrl,
      },
    ],
  }
}

export function serializeJsonLd(value) {
  return JSON.stringify(value)
    .replace(/&/g, '\\u0026')
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029')
}

export function cleanMetaText(value) {
  return cleanText(value)
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/~~~[\s\S]*?~~~/g, ' ')
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/\{\{(?:cite|media):[^{}]+\}\}/g, ' ')
    .replace(/<\/?[A-Za-z!][^>]*>/g, ' ')
    .replace(/[*_~`#>|]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function cleanText(value) {
  return typeof value === 'string' ? value.replace(/\s+/g, ' ').trim() : ''
}

function isBrandOnly(value) {
  return value.toLocaleLowerCase() === SITE_NAME.toLocaleLowerCase()
}

function withBrandSuffix(value) {
  const clean = cleanText(value)
  if (!clean || isBrandOnly(clean)) return `${FALLBACKS.fr.article} — ${SITE_NAME}`
  if (new RegExp(`(?:^|[|—–-]\\s*)${SITE_NAME}$`, 'i').test(clean)) return clean
  return `${clean} — ${SITE_NAME}`
}

function toIsoDate(value) {
  if (typeof value !== 'string' || !value.trim()) return ''
  const timestamp = Date.parse(value)
  return Number.isFinite(timestamp) ? new Date(timestamp).toISOString() : ''
}
