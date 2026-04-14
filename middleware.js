const CRAWLER_PATTERN =
  /LinkedInBot|facebookexternalhit|Facebot|Twitterbot|Slackbot|WhatsApp|TelegramBot|Discordbot/i

const SITE_URL = 'https://5pennyai.com'
const SITE_NAME = '5PennyAi'
const DEFAULT_IMAGE = `${SITE_URL}/images/pennyseo-logo.png`

function escapeHtml(str) {
  if (!str) return ''
  return str
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

export default async function middleware(request) {
  const url = new URL(request.url)

  // Only intercept /blog/[slug] paths
  const match = url.pathname.match(/^\/blog\/([^/]+)$/)
  if (!match) return

  const ua = request.headers.get('user-agent') || ''
  if (!CRAWLER_PATTERN.test(ua)) return

  const slug = match[1]

  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    return
  }

  try {
    const apiUrl = `${supabaseUrl}/rest/v1/posts?slug=eq.${encodeURIComponent(slug)}&status=eq.published&select=title_fr,excerpt_fr,meta_description_fr,cover_image,slug&limit=1`

    const res = await fetch(apiUrl, {
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
      },
    })

    if (!res.ok) return

    const rows = await res.json()
    if (!rows || rows.length === 0) return

    const post = rows[0]
    const title = escapeHtml(post.title_fr || SITE_NAME)
    const description = escapeHtml(post.meta_description_fr || post.excerpt_fr || '')
    const image = post.cover_image || DEFAULT_IMAGE
    const canonicalUrl = `${SITE_URL}/blog/${encodeURIComponent(post.slug)}`

    const html = `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<title>${title} — ${SITE_NAME}</title>
<meta name="description" content="${description}">
<meta property="og:type" content="article">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${description}">
<meta property="og:image" content="${escapeHtml(image)}">
<meta property="og:url" content="${escapeHtml(canonicalUrl)}">
<meta property="og:site_name" content="${SITE_NAME}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${title}">
<meta name="twitter:description" content="${description}">
<meta name="twitter:image" content="${escapeHtml(image)}">
<meta http-equiv="refresh" content="0;url=${escapeHtml(canonicalUrl)}">
</head>
<body>
<p><a href="${escapeHtml(canonicalUrl)}">Lire l'article : ${title}</a></p>
</body>
</html>`

    return new Response(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 's-maxage=3600, stale-while-revalidate=86400',
      },
    })
  } catch (err) {
    // On error, fall through to normal SPA
    return
  }
}

export const config = {
  matcher: '/blog/:slug*',
}
