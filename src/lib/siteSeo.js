import { createSeriesSlug } from './resourceSeries.js'
import { buildSiteUrl, SITE_ORIGIN } from './siteConfig.js'
import { slugifyArticle } from './articleSlug.js'

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const STATIC_PUBLIC_PATHS = [
  '/',
  '/about',
  '/contact',
  '/portfolio',
  '/portfolio/pennyseo',
  '/ressources-ia',
]

export function buildSitemapEntries({ articleRows = [], infographicRows = [] } = {}) {
  const entries = new Map(STATIC_PUBLIC_PATHS.map((path) => [buildSiteUrl(path), {}]))
  const series = new Map()

  for (const row of articleRows) {
    if (row?.status && row.status !== 'published') continue
    const slug = slugifyArticle(row?.slug || '')
    if (!slug) continue
    addEntry(entries, buildSiteUrl(`/ressources-ia/articles/${encodeURIComponent(slug)}`), resolveLastmod(row))
    addSeries(series, row?.series_name, resolveLastmod(row))
  }

  for (const row of infographicRows) {
    if (row?.status && row.status !== 'published') continue
    if (!UUID_PATTERN.test(row?.id || '')) continue
    addEntry(entries, buildSiteUrl(`/ressources-ia/infographies/${row.id}`), resolveLastmod(row))
    addSeries(series, row?.series_name, resolveLastmod(row))
  }

  for (const [slug, details] of series) {
    addEntry(entries, buildSiteUrl(`/ressources-ia/series/${encodeURIComponent(slug)}`), details.lastmod)
  }

  return [...entries.entries()]
    .map(([url, details]) => ({ url, ...details }))
    .sort((left, right) => left.url.localeCompare(right.url))
}
export function buildSitemapXml(entries = []) {
  const urls = entries.map(({ url, lastmod }) => {
    const lastmodTag = isIsoDate(lastmod) ? `\n    <lastmod>${escapeXml(lastmod)}</lastmod>` : ''
    return `  <url>\n    <loc>${escapeXml(url)}</loc>${lastmodTag}\n  </url>`
  }).join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`
}

export function buildRobotsTxt() {
  return [
    'User-agent: *',
    'Allow: /',
    'Disallow: /admin/',
    `Sitemap: ${buildSiteUrl('/sitemap.xml')}`,
    '',
  ].join('\n')
}

function addEntry(entries, url, lastmod) {
  if (!url || !url.startsWith(`${SITE_ORIGIN}/`) || url.includes('?') || url.includes('#')) return
  const current = entries.get(url)
  if (!current || isNewer(lastmod, current.lastmod)) entries.set(url, lastmod ? { lastmod } : {})
}

function addSeries(series, name, lastmod) {
  const slug = createSeriesSlug(typeof name === 'string' ? name.trim() : '')
  if (!slug) return
  const current = series.get(slug)
  if (!current || isNewer(lastmod, current.lastmod)) series.set(slug, { lastmod })
}

function resolveLastmod(row) {
  return normalizeIsoDate(row?.updated_at) || normalizeIsoDate(row?.published_at) || ''
}

function normalizeIsoDate(value) {
  if (typeof value !== 'string' || !value.trim()) return ''
  const timestamp = Date.parse(value)
  return Number.isFinite(timestamp) ? new Date(timestamp).toISOString() : ''
}

function isIsoDate(value) {
  return Boolean(normalizeIsoDate(value))
}

function isNewer(candidate, current) {
  if (!candidate) return false
  if (!current) return true
  return Date.parse(candidate) > Date.parse(current)
}

function escapeXml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}
