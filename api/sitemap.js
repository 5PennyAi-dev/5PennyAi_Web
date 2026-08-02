import { fetchPublishedSitemapRows } from './_lib/publicSeoData.js'
import { buildSitemapEntries, buildSitemapXml } from '../src/lib/siteSeo.js'

export function createSitemapHandler({ env, fetchImpl = fetch, logger = console } = {}) {
  return async function sitemapHandler(req, res) {
    if (!['GET', 'HEAD'].includes(req.method || 'GET')) {
      res.statusCode = 405
      res.setHeader('Allow', 'GET, HEAD')
      res.end('Method not allowed')
      return
    }
    try {
      const rows = await fetchPublishedSitemapRows({ env, fetchImpl })
      const xml = buildSitemapXml(buildSitemapEntries(rows))
      res.statusCode = 200
      res.setHeader('Content-Type', 'application/xml; charset=utf-8')
      res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=900, stale-while-revalidate=3600')
      res.setHeader('X-Content-Type-Options', 'nosniff')
      res.end(req.method === 'HEAD' ? '' : xml)
    } catch (error) {
      logger?.error?.('Unable to build sitemap:', error?.message)
      res.statusCode = 503
      res.setHeader('Content-Type', 'text/plain; charset=utf-8')
      res.setHeader('Cache-Control', 'no-store')
      res.end(req.method === 'HEAD' ? '' : 'Sitemap temporarily unavailable')
    }
  }
}

export default createSitemapHandler()
