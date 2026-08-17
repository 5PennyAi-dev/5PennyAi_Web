import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useLocation } from 'react-router-dom'
import { Menu, Search, X } from 'lucide-react'
import Logo from '@/components/ui/Logo'

const navLinks = [
  { key: 'nav.resources', to: '/ressources-ia' },
  { key: 'nav.series', to: '/ressources-ia?vue=series' },
  { key: 'nav.prompts', to: '/ressources-ia?format=prompt' },
  { key: 'nav.aboutSite', to: '/about' },
]

export default function Navbar() {
  const { t, i18n } = useTranslation()
  const { pathname, search } = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const menuButtonRef = useRef(null)

  useEffect(() => {
    const closeOnEscape = (event) => {
      if (event.key !== 'Escape' || !mobileOpen) return
      setMobileOpen(false)
      menuButtonRef.current?.focus()
    }

    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [mobileOpen])

  const toggleLang = () => {
    i18n.changeLanguage(i18n.language === 'fr' ? 'en' : 'fr')
  }

  const isActive = (link) => {
    if (link.to.includes('vue=series')) return pathname === '/ressources-ia' && search.includes('vue=series')
    if (link.to.includes('format=prompt')) return pathname === '/ressources-ia' && search.includes('format=prompt')
    if (link.to === '/ressources-ia') return pathname === '/ressources-ia' && !search
    return pathname === link.to
  }

  const desktopLinkClass = (active) => (
    `relative py-2 text-[13px] font-semibold tracking-wide transition-colors duration-200 ${
      active ? 'text-navy' : 'text-navy/65 hover:text-navy'
    }`
  )

  const renderLink = (link) => (
    <Link key={link.key} to={link.to} className={desktopLinkClass(isActive(link))} aria-current={isActive(link) ? 'page' : undefined}>
      {t(link.key)}
      {isActive(link) && <span className="absolute inset-x-0 bottom-0 h-px bg-accent" />}
    </Link>
  )

  return (
    <nav className="fixed inset-x-0 top-0 z-50 border-b border-navy/[0.08] bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex h-[68px] max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="shrink-0" aria-label="5PennyAi" onClick={() => setMobileOpen(false)}>
          <Logo variant="light" height={28} />
        </Link>

        <div className="hidden items-center gap-7 lg:flex">
          {navLinks.map(renderLink)}
        </div>

        <div className="hidden items-center gap-2 lg:flex">
          <Link
            to="/ressources-ia"
            className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-2 text-[12px] font-semibold text-navy/65 transition-colors hover:text-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <Search size={15} aria-hidden="true" />
            {t('nav.search')}
          </Link>
          <Link
            to="/admin/ressources-ia/infographies"
            className="px-2 py-2 text-[11px] font-bold uppercase tracking-[0.14em] text-navy/40 transition-colors hover:text-navy/75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            {t('nav.admin')}
          </Link>
          <button
            onClick={toggleLang}
            className="rounded-full border border-navy/10 px-3 py-1.5 text-[12px] font-semibold tracking-wide text-navy/65 transition-colors hover:border-navy/25 hover:text-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            aria-label={t('nav.changeLanguage')}
          >
            {t('nav.lang_toggle')}
          </button>
        </div>

        <button
          ref={menuButtonRef}
          type="button"
          onClick={() => setMobileOpen((open) => !open)}
          className="-mr-2 rounded-lg p-2 text-navy transition-colors hover:bg-navy/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent lg:hidden"
          aria-label={t('nav.menu')}
          aria-expanded={mobileOpen}
          aria-controls="mobile-navigation"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {mobileOpen && (
        <div id="mobile-navigation" className="border-t border-navy/[0.06] bg-white/98 lg:hidden">
          <div className="mx-auto max-w-7xl space-y-1 px-4 py-4 sm:px-6">
            {navLinks.map((link) => (
              <Link
                key={link.key}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className="block rounded-lg px-3 py-3 text-sm font-semibold text-navy/75 transition-colors hover:bg-navy/[0.04] hover:text-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                aria-current={isActive(link) ? 'page' : undefined}
              >
                {t(link.key)}
              </Link>
            ))}
            <Link
              to="/ressources-ia"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 rounded-lg px-3 py-3 text-sm font-semibold text-navy/75 transition-colors hover:bg-navy/[0.04] hover:text-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <Search size={16} aria-hidden="true" />
              {t('nav.search')}
            </Link>
            <div className="flex flex-wrap items-center gap-3 border-t border-navy/[0.06] px-3 pt-4">
              <Link
                to="/admin/ressources-ia/infographies"
                onClick={() => setMobileOpen(false)}
                className="text-[11px] font-bold uppercase tracking-[0.14em] text-navy/45 transition-colors hover:text-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                {t('nav.admin')}
              </Link>
              <button
                type="button"
                onClick={() => {
                  toggleLang()
                  setMobileOpen(false)
                  menuButtonRef.current?.focus()
                }}
                className="rounded-full border border-navy/10 px-3 py-1.5 text-sm font-semibold text-navy/65 transition-colors hover:border-navy/25 hover:text-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                aria-label={t('nav.changeLanguage')}
              >
                {t('nav.lang_toggle')}
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
