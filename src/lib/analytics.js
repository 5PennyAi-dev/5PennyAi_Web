const ADMIN_PATHNAME = '/admin'

function isAdminPathname(pathname) {
  return pathname === ADMIN_PATHNAME || pathname.startsWith(`${ADMIN_PATHNAME}/`)
}

export function filterAnalyticsEvent(event) {
  const { pathname } = new URL(event.url, 'https://5pennyai.com')

  return isAdminPathname(pathname) ? null : event
}
