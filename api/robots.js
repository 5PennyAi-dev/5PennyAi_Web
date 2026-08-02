import { buildRobotsTxt } from '../src/lib/siteSeo.js'

export function robotsHandler(req, res) {
  if (!['GET', 'HEAD'].includes(req.method || 'GET')) {
    res.statusCode = 405
    res.setHeader('Allow', 'GET, HEAD')
    res.end('Method not allowed')
    return
  }
  res.statusCode = 200
  res.setHeader('Content-Type', 'text/plain; charset=utf-8')
  res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=86400')
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.end(req.method === 'HEAD' ? '' : buildRobotsTxt())
}

export default robotsHandler
