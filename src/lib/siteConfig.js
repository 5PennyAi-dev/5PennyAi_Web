export const SITE_ORIGIN = 'https://5pennyai.com'
export const SITE_NAME = '5PennyAi'
export const DEFAULT_SOCIAL_IMAGE_PATH = '/images/og-christian.jpg'

export function buildSiteUrl(path = '/') {
  const url = new URL(typeof path === 'string' ? path : '/', `${SITE_ORIGIN}/`)
  url.protocol = 'https:'
  url.search = ''
  url.hash = ''
  url.pathname = url.pathname.replace(/\/{2,}/g, '/')
  return url.toString()
}
export function buildDefaultSocialImageUrl() {
  return buildSiteUrl(DEFAULT_SOCIAL_IMAGE_PATH)
}
