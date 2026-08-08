import {
  buildArticleSeoMetadata,
  buildArticleStructuredData,
  buildBreadcrumbStructuredData,
  serializeJsonLd,
} from './src/lib/articleSeo.js'
import {
  buildInfographicSeoData,
  isValidInfographicId,
} from './src/lib/infographicSeo.js'
import { buildDefaultSocialImageUrl, buildSiteUrl, SITE_NAME } from './src/lib/siteConfig.js'
import {
  fetchPublishedArticleSeo,
  fetchPublishedInfographicSeo,
  getPublicSupabaseConfig,
} from './api/_lib/publicSeoData.js'

// Social crawlers cannot execute the SPA. Search crawlers are included so direct
// user-agent checks receive the same canonical technical metadata.
export const CRAWLER_PATTERN =
  /LinkedInBot|facebookexternalhit|Facebot|Meta-External(?:Agent|Fetcher)|Twitterbot|Slackbot|TelegramBot|Discordbot|Googlebot|bingbot|Applebot|DuckDuckBot/i

export default async function middleware(request, dependencies = {}) {
  const url = new URL(request.url)
  const ua = request.headers.get('user-agent') || ''
  const crawler = CRAWLER_PATTERN.test(ua)

  const infographicMatch = url.pathname.match(/^\/ressources-ia\/infographies\/([^/]+)\/?$/)
  if (infographicMatch) {
    const id = decodePathSegment(infographicMatch[1])
    if (!isValidInfographicId(id)) return crawler ? unavailableInfographicResponse() : undefined
    return crawler
      ? handleInfographicCrawler(id, dependencies)
      : handleInfographicAppShell(id, request, dependencies)
  }

  const articleMatch = url.pathname.match(/^\/ressources-ia\/articles\/([^/]+)\/?$/)
  if (articleMatch) {
    return crawler
      ? handleArticleCrawler(articleMatch[1], dependencies)
      : handleArticleAppShell(articleMatch[1], request, dependencies)
  }

  if (!crawler) return

  const blogMatch = url.pathname.match(/^\/blog\/([^/]+)$/)
  if (blogMatch) return handleBlogCrawler(blogMatch[1])
}

async function handleInfographicAppShell(id, request, dependencies = {}) {
  try {
    const infographic = await fetchPublishedInfographicSeo(id, dependencies)
    if (!infographic) return
    const { url: supabaseUrl } = getPublicSupabaseConfig(dependencies.env)
    const metadata = buildInfographicSeoData(infographic, { supabaseUrl })
    return renderAppShell(request, buildShellSeoTags({
      canonicalUrl: metadata.canonicalUrl,
      description: metadata.description,
      imageAlt: metadata.socialImageAlt,
      imageUrl: metadata.socialImageUrl,
      locale: metadata.locale,
      pageTitle: metadata.title,
      socialTitle: metadata.socialTitle,
      type: metadata.ogType,
    }), dependencies)
  } catch (error) {
    console.warn('Unable to render infographic app-shell metadata:', error?.message)
  }
}

async function handleArticleAppShell(slug, request, dependencies = {}) {
  try {
    const article = await fetchPublishedArticleSeo(decodePathSegment(slug), dependencies)
    if (!article) return
    const metadata = buildArticleSeoMetadata(article)
    return renderAppShell(request, buildShellSeoTags({
      canonicalUrl: metadata.canonicalUrl,
      description: metadata.description,
      imageAlt: metadata.imageAlt,
      imageUrl: metadata.imageUrl,
      locale: metadata.ogLocale,
      pageTitle: metadata.pageTitle,
      socialTitle: metadata.socialTitle,
      type: 'article',
    }), dependencies)
  } catch (error) {
    console.warn('Unable to render article app-shell metadata:', error?.message)
  }
}

async function renderAppShell(
  request,
  seoTags,
  { shellFetchImpl = fetch } = {},
) {
  const shellUrl = new URL('/index.html', request.url)
  const shellResponse = await shellFetchImpl(shellUrl, {
    headers: { Accept: 'text/html' },
  })
  if (!shellResponse.ok) return

  const html = injectShellSeo(await shellResponse.text(), seoTags)
  if (!html) return
  const headers = new Headers(shellResponse.headers)
  headers.delete('content-encoding')
  headers.delete('content-length')
  headers.set('Cache-Control', 'private, no-store')
  headers.set('Content-Type', 'text/html; charset=utf-8')
  headers.set('Vary', 'User-Agent')
  return new Response(html, { status: 200, headers })
}

export function injectShellSeo(html, seoTags) {
  const markerPattern = /<!-- shell-seo:start -->[\s\S]*?<!-- shell-seo:end -->/
  if (typeof html !== 'string' || !markerPattern.test(html)) return ''
  return html.replace(
    markerPattern,
    `<!-- shell-seo:start -->\n${seoTags}\n    <!-- shell-seo:end -->`,
  )
}

function buildShellSeoTags({
  canonicalUrl,
  description,
  imageAlt,
  imageUrl,
  locale,
  pageTitle,
  socialTitle,
  type,
}) {
  return `    <title data-shell-seo>${escapeHtml(pageTitle)}</title>
    <meta data-shell-seo name="description" content="${escapeHtml(description)}">
    <link data-shell-seo rel="canonical" href="${escapeHtml(canonicalUrl)}">
    <meta data-shell-seo property="og:type" content="${escapeHtml(type)}">
    <meta data-shell-seo property="og:site_name" content="${escapeHtml(SITE_NAME)}">
    <meta data-shell-seo property="og:title" content="${escapeHtml(socialTitle)}">
    <meta data-shell-seo property="og:description" content="${escapeHtml(description)}">
    <meta data-shell-seo property="og:image" content="${escapeHtml(imageUrl)}">
    <meta data-shell-seo property="og:image:alt" content="${escapeHtml(imageAlt)}">
    <meta data-shell-seo property="og:url" content="${escapeHtml(canonicalUrl)}">
    <meta data-shell-seo property="og:locale" content="${escapeHtml(locale)}">
    <meta data-shell-seo name="twitter:card" content="summary_large_image">
    <meta data-shell-seo name="twitter:title" content="${escapeHtml(socialTitle)}">
    <meta data-shell-seo name="twitter:description" content="${escapeHtml(description)}">
    <meta data-shell-seo name="twitter:image" content="${escapeHtml(imageUrl)}">
    <meta data-shell-seo name="twitter:image:alt" content="${escapeHtml(imageAlt)}">`
}

export async function handleInfographicCrawler(
  id,
  { env, fetchImpl = fetch } = {},
) {
  try {
    const infographic = await fetchPublishedInfographicSeo(id, { env, fetchImpl })
    if (!infographic) return unavailableInfographicResponse()
    const { url: supabaseUrl } = getPublicSupabaseConfig(env)
    const metadata = buildInfographicSeoData(infographic, { supabaseUrl })
    return htmlResponse(buildInfographicCrawlerHtml({ metadata }))
  } catch (error) {
    console.warn('Unable to render infographic crawler metadata:', error?.message)
    return
  }
}

async function handleArticleCrawler(slug, { env, fetchImpl = fetch } = {}) {
  try {
    const article = await fetchPublishedArticleSeo(decodeURIComponent(slug), { env, fetchImpl })
    if (!article) return unavailableArticleResponse()
    const metadata = buildArticleSeoMetadata(article)
    const articleData = buildArticleStructuredData(article, metadata)
    const breadcrumbData = buildBreadcrumbStructuredData(article, metadata)
    return htmlResponse(buildArticleCrawlerHtml({ article, articleData, breadcrumbData, metadata }))
  } catch (error) {
    console.warn('Unable to render article crawler metadata:', error?.message)
    return
  }
}

async function handleBlogCrawler(slug) {
  let config
  try {
    config = getPublicSupabaseConfig()
  } catch {
    return
  }

  try {
    const apiUrl = new URL('/rest/v1/posts', `${config.url}/`)
    apiUrl.searchParams.set('slug', `eq.${decodeURIComponent(slug)}`)
    apiUrl.searchParams.set('status', 'eq.published')
    apiUrl.searchParams.set(
      'select',
      'title_fr,excerpt_fr,meta_description_fr,cover_image,cover_image_fr,cover_image_en,cover_image_alt_fr,slug',
    )
    apiUrl.searchParams.set('limit', '1')
    const result = await fetch(apiUrl, {
      headers: {
        apikey: config.key,
        Authorization: `Bearer ${config.key}`,
      },
    })
    if (!result.ok) return
    const post = (await result.json())?.[0]
    if (!post) return

    const title = post.title_fr || SITE_NAME
    const description = post.meta_description_fr || post.excerpt_fr || ''
    const image = post.cover_image_fr || post.cover_image_en || post.cover_image || buildDefaultSocialImageUrl()
    const imageAlt = post.cover_image_alt_fr || post.title_fr || ''
    const canonicalUrl = buildSiteUrl(`/blog/${encodeURIComponent(post.slug)}`)
    const html = `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<title>${escapeHtml(title)} — ${SITE_NAME}</title>
<meta name="description" content="${escapeHtml(description)}">
<link rel="canonical" href="${escapeHtml(canonicalUrl)}">
<meta property="og:type" content="article">
<meta property="og:title" content="${escapeHtml(title)}">
<meta property="og:description" content="${escapeHtml(description)}">
<meta property="og:image" content="${escapeHtml(image)}">
${imageAlt ? `<meta property="og:image:alt" content="${escapeHtml(imageAlt)}">\n` : ''}<meta property="og:url" content="${escapeHtml(canonicalUrl)}">
<meta property="og:site_name" content="${SITE_NAME}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${escapeHtml(title)}">
<meta name="twitter:description" content="${escapeHtml(description)}">
<meta name="twitter:image" content="${escapeHtml(image)}">
${imageAlt ? `<meta name="twitter:image:alt" content="${escapeHtml(imageAlt)}">` : ''}
</head>
<body><p><a href="${escapeHtml(canonicalUrl)}">Lire l’article : ${escapeHtml(title)}</a></p></body>
</html>`
    return htmlResponse(html)
  } catch (error) {
    console.warn('Unable to render blog crawler metadata:', error?.message)
    return
  }
}

export function buildArticleCrawlerHtml({ article, articleData, breadcrumbData, metadata }) {
  return `<!DOCTYPE html>
<html lang="${metadata.language}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(metadata.pageTitle)}</title>
<meta name="description" content="${escapeHtml(metadata.description)}">
<meta name="robots" content="${metadata.robots}">
<link rel="canonical" href="${escapeHtml(metadata.canonicalUrl)}">
<meta property="og:type" content="article">
<meta property="og:title" content="${escapeHtml(metadata.socialTitle)}">
<meta property="og:description" content="${escapeHtml(metadata.description)}">
<meta property="og:url" content="${escapeHtml(metadata.canonicalUrl)}">
<meta property="og:image" content="${escapeHtml(metadata.imageUrl)}">
<meta property="og:image:alt" content="${escapeHtml(metadata.imageAlt)}">
<meta property="og:site_name" content="${escapeHtml(metadata.siteName)}">
<meta property="og:locale" content="${metadata.ogLocale}">
${metadata.datePublished ? `<meta property="article:published_time" content="${metadata.datePublished}">\n` : ''}${metadata.dateModified ? `<meta property="article:modified_time" content="${metadata.dateModified}">\n` : ''}<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${escapeHtml(metadata.socialTitle)}">
<meta name="twitter:description" content="${escapeHtml(metadata.description)}">
<meta name="twitter:image" content="${escapeHtml(metadata.imageUrl)}">
<meta name="twitter:image:alt" content="${escapeHtml(metadata.imageAlt)}">
<script type="application/ld+json">${serializeJsonLd(articleData)}</script>
<script type="application/ld+json">${serializeJsonLd(breadcrumbData)}</script>
</head>
<body>
<article>
<h1>${escapeHtml(metadata.headline)}</h1>
${article.summary ? `<p>${escapeHtml(article.summary)}</p>` : ''}
<p><a href="${escapeHtml(metadata.canonicalUrl)}">${escapeHtml(metadata.headline)}</a></p>
</article>
</body>
</html>`
}

export function buildInfographicCrawlerHtml({ metadata }) {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(metadata.title)}</title>
<meta name="description" content="${escapeHtml(metadata.description)}">
<meta name="robots" content="index, follow">
<link rel="canonical" href="${escapeHtml(metadata.canonicalUrl)}">
<meta property="og:type" content="${metadata.ogType}">
<meta property="og:title" content="${escapeHtml(metadata.socialTitle)}">
<meta property="og:description" content="${escapeHtml(metadata.description)}">
<meta property="og:url" content="${escapeHtml(metadata.canonicalUrl)}">
<meta property="og:image" content="${escapeHtml(metadata.socialImageUrl)}">
<meta property="og:image:alt" content="${escapeHtml(metadata.socialImageAlt)}">
<meta property="og:site_name" content="${escapeHtml(metadata.siteName)}">
<meta property="og:locale" content="${metadata.locale}">
<meta name="twitter:card" content="${metadata.twitterCard}">
<meta name="twitter:title" content="${escapeHtml(metadata.socialTitle)}">
<meta name="twitter:description" content="${escapeHtml(metadata.description)}">
<meta name="twitter:image" content="${escapeHtml(metadata.socialImageUrl)}">
<meta name="twitter:image:alt" content="${escapeHtml(metadata.socialImageAlt)}">
</head>
<body>
<article>
<h1>${escapeHtml(metadata.headline)}</h1>
<p>${escapeHtml(metadata.description)}</p>
<p><a href="${escapeHtml(metadata.canonicalUrl)}">${escapeHtml(metadata.headline)}</a></p>
</article>
</body>
</html>`
}

function unavailableArticleResponse() {
  const html = `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"><title>Article indisponible — ${SITE_NAME}</title><meta name="robots" content="noindex, nofollow"></head><body><h1>Article indisponible</h1></body></html>`
  return new Response(html, {
    status: 404,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
      Vary: 'User-Agent',
    },
  })
}

function unavailableInfographicResponse() {
  const html = `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"><title>Infographie indisponible — ${SITE_NAME}</title><meta name="robots" content="noindex, nofollow"></head><body><h1>Infographie indisponible</h1></body></html>`
  return new Response(html, {
    status: 404,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
      Vary: 'User-Agent',
    },
  })
}

function htmlResponse(html) {
  return new Response(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 's-maxage=900, stale-while-revalidate=3600',
      Vary: 'User-Agent',
    },
  })
}

export function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function decodePathSegment(value) {
  try {
    return decodeURIComponent(value)
  } catch {
    return ''
  }
}

export const config = {
  matcher: [
    '/blog/:slug*',
    '/ressources-ia/articles/:slug*',
    '/ressources-ia/infographies/:id*',
  ],
}
