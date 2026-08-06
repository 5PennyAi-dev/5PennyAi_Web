import { cleanMetaText } from './articleSeo.js'
import { isInfographicThumbnailPathForResource } from './infographicThumbnails.js'
import {
  buildDefaultSocialImageUrl,
  buildSiteUrl,
  SITE_NAME,
} from './siteConfig.js'

const INFOGRAPHIC_FALLBACK_TITLE = 'Infographie'
const INFOGRAPHIC_FALLBACK_DESCRIPTION =
  "Des ressources pédagogiques claires et pratiques pour mieux comprendre l'intelligence artificielle."

export const INFOGRAPHIC_UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function isValidInfographicId(value) {
  return typeof value === 'string' && INFOGRAPHIC_UUID_PATTERN.test(value)
}

export function buildInfographicCanonicalUrl(id) {
  if (!isValidInfographicId(id)) return ''
  return buildSiteUrl(`/ressources-ia/infographies/${encodeURIComponent(id)}`)
}

export function buildInfographicSocialImageUrl(
  thumbnailPath,
  { resourceId, supabaseUrl } = {},
) {
  if (!isInfographicThumbnailPathForResource(thumbnailPath, resourceId)) {
    return buildDefaultSocialImageUrl()
  }

  const publicStorageOrigin = normalizeSupabaseUrl(supabaseUrl || configuredSupabaseUrl())
  if (!publicStorageOrigin) return buildDefaultSocialImageUrl()

  const encodedPath = thumbnailPath.split('/').map(encodeURIComponent).join('/')
  return `${publicStorageOrigin}/storage/v1/object/public/infographics/${encodedPath}`
}

export function buildInfographicSeoData(infographic = {}, options = {}) {
  const rawTitle = cleanMetaText(infographic.title)
  const headline = isBrandOnly(rawTitle) ? INFOGRAPHIC_FALLBACK_TITLE : rawTitle || INFOGRAPHIC_FALLBACK_TITLE
  const socialTitle = rawTitle && !isBrandOnly(rawTitle)
    ? rawTitle
    : `${INFOGRAPHIC_FALLBACK_TITLE} — ${SITE_NAME}`
  const description = cleanMetaText(infographic.summary)
    || cleanMetaText(infographic.introduction)
    || INFOGRAPHIC_FALLBACK_DESCRIPTION
  const thumbnailPath = cleanPath(infographic.thumbnailPath ?? infographic.thumbnail_path)
  const imageAlt = cleanMetaText(infographic.imageAlt ?? infographic.image_alt) || headline

  return {
    canonicalUrl: buildInfographicCanonicalUrl(infographic.id),
    description,
    headline,
    locale: 'fr_CA',
    ogType: 'article',
    siteName: SITE_NAME,
    socialImageAlt: imageAlt,
    socialImageUrl: buildInfographicSocialImageUrl(thumbnailPath, {
      resourceId: infographic.id,
      supabaseUrl: options.supabaseUrl,
    }),
    socialTitle,
    title: withBrandSuffix(headline),
    twitterCard: 'summary_large_image',
  }
}

function configuredSupabaseUrl() {
  return import.meta.env?.VITE_SUPABASE_URL
    || globalThis.process?.env?.SUPABASE_URL
    || globalThis.process?.env?.VITE_SUPABASE_URL
    || ''
}

function normalizeSupabaseUrl(value) {
  if (typeof value !== 'string' || !value.trim()) return ''
  try {
    const url = new URL(value)
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return ''
    url.search = ''
    url.hash = ''
    return url.toString().replace(/\/+$/, '')
  } catch {
    return ''
  }
}

function cleanPath(value) {
  return typeof value === 'string' ? value.trim() : ''
}

function isBrandOnly(value) {
  return value.toLocaleLowerCase() === SITE_NAME.toLocaleLowerCase()
}

function withBrandSuffix(value) {
  if (new RegExp(`(?:^|[|—–-]\\s*)${SITE_NAME}$`, 'i').test(value)) return value
  return `${value} — ${SITE_NAME}`
}
