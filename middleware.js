import { NextResponse } from 'next/server'

export const config = {
  matcher: '/blog/:slug*',
}

const CRAWLER_PATTERN =
  /LinkedInBot|facebookexternalhit|Facebot|Twitterbot|Slackbot|WhatsApp|TelegramBot|Discordbot|Googlebot|bingbot/i

export default function middleware(request) {
  const ua = request.headers.get('user-agent') || ''

  if (CRAWLER_PATTERN.test(ua)) {
    const url = request.nextUrl.clone()
    const slug = url.pathname.replace(/^\/blog\//, '')

    if (slug && slug !== '') {
      url.pathname = `/api/og/${slug}`
      return NextResponse.rewrite(url)
    }
  }

  return NextResponse.next()
}
