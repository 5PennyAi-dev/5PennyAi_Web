import { Buffer } from 'node:buffer'
import { buildDefaultSocialImageUrl } from '../src/lib/siteConfig.js'
import {
  createSignedArticleCoverUrl,
  fetchPublishedArticleSeo,
} from './_lib/publicSeoData.js'

const IMAGE_CACHE = 'public, max-age=300, s-maxage=900, stale-while-revalidate=300'

export function createArticleSocialImageHandler({ env, fetchImpl = fetch, logger = console } = {}) {
  return async function articleSocialImageHandler(req, res) {
    if (!['GET', 'HEAD'].includes(req.method || 'GET')) {
      res.statusCode = 405
      res.setHeader('Allow', 'GET, HEAD')
      res.end('Method not allowed')
      return
    }
    const slug = readArticleSlug(req.url)
    if (!slug) return sendNotFound(res)

    let article
    try {
      article = await fetchPublishedArticleSeo(slug, { env, fetchImpl })
    } catch (error) {
      logger?.error?.('Unable to resolve article social image:', error?.message)
      return sendUnavailable(res)
    }
    if (!article) return sendNotFound(res)
    if (!article.hasCover) return sendFallback(res)

    try {
      const signedUrl = await createSignedArticleCoverUrl(article, { env, fetchImpl })
      const imageResponse = await fetchImpl(signedUrl)
      const contentType = imageResponse.headers.get('content-type') || ''
      if (!imageResponse.ok || !contentType.toLowerCase().startsWith('image/')) {
        throw new Error(`Invalid article cover response (${imageResponse.status})`)
      }
      const body = req.method === 'HEAD' ? null : Buffer.from(await imageResponse.arrayBuffer())
      res.statusCode = 200
      res.setHeader('Content-Type', contentType)
      res.setHeader('Cache-Control', IMAGE_CACHE)
      res.setHeader('X-Content-Type-Options', 'nosniff')
      if (body) res.setHeader('Content-Length', body.length)
      res.end(body || '')
    } catch (error) {
      logger?.warn?.('Unable to proxy article cover; using public fallback:', error?.message)
      return sendFallback(res)
    }
  }
}

function sendFallback(res) {
  res.statusCode = 302
  res.setHeader('Location', buildDefaultSocialImageUrl())
  res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=300')
  res.end('')
}

function sendNotFound(res) {
  res.statusCode = 404
  res.setHeader('Cache-Control', 'no-store')
  res.end('Not found')
}

function sendUnavailable(res) {
  res.statusCode = 503
  res.setHeader('Cache-Control', 'no-store')
  res.end('Temporarily unavailable')
}

function readArticleSlug(requestUrl) {
  try {
    const url = new URL(requestUrl || '/', 'http://localhost')
    const querySlug = url.searchParams.get('slug')
    if (querySlug) return querySlug
    const pathMatch = url.pathname.match(/^\/api\/article-social-image\/([^/]+)\/?$/)
    return pathMatch ? decodeURIComponent(pathMatch[1]) : ''
  } catch {
    return ''
  }
}

export default createArticleSocialImageHandler()
