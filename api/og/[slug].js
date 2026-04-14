/* global process */
// Vercel Serverless Function — returns a minimal HTML page with Open Graph meta tags
// for social media crawlers (LinkedIn, Facebook, Twitter). Real visitors get a JS redirect
// to the SPA route. Called via Edge Middleware rewrite when User-Agent is a known crawler.

import { createClient } from '@supabase/supabase-js'

export const config = {
  maxDuration: 10,
}

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

export default async function handler(req, res) {
  const { slug } = req.query

  if (!slug || typeof slug !== 'string') {
    return res.redirect(302, SITE_URL)
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.error('Supabase env vars missing')
    return res.redirect(302, `${SITE_URL}/blog/${slug}`)
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

  try {
    const { data: post, error } = await supabase
      .from('posts')
      .select('title_fr, title_en, excerpt_fr, excerpt_en, meta_description_fr, meta_description_en, cover_image, slug')
      .eq('slug', slug)
      .eq('status', 'published')
      .single()

    if (error || !post) {
      return res.redirect(302, `${SITE_URL}/blog/${slug}`)
    }

    const title = escapeHtml(post.title_fr || post.title_en || SITE_NAME)
    const description = escapeHtml(
      post.meta_description_fr || post.excerpt_fr || post.meta_description_en || post.excerpt_en || ''
    )
    const image = post.cover_image || DEFAULT_IMAGE
    const url = `${SITE_URL}/blog/${encodeURIComponent(post.slug)}`

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
<meta property="og:url" content="${escapeHtml(url)}">
<meta property="og:site_name" content="${SITE_NAME}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${title}">
<meta name="twitter:description" content="${description}">
<meta name="twitter:image" content="${escapeHtml(image)}">
<script>window.location.replace("${url}");</script>
</head>
<body>
<p><a href="${escapeHtml(url)}">Lire l'article : ${title}</a></p>
</body>
</html>`

    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400')
    return res.status(200).send(html)
  } catch (err) {
    console.error('OG handler error:', err)
    return res.redirect(302, `${SITE_URL}/blog/${slug}`)
  }
}
