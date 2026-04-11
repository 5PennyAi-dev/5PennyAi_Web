import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import BookingButton from '@/components/ui/BookingButton'

const navLinks = [
  { key: 'nav.services', to: '/services' },
  { key: 'nav.about', to: '/about' },
  { key: 'nav.portfolio', to: '/portfolio' },
  { key: 'nav.blog', to: '/blog' },
  { key: 'nav.faq', href: '/#faq' },
  { key: 'nav.contact', to: '/contact' },
]

export default function Navbar() {
  const { t, i18n } = useTranslation()
  const { pathname } = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolledPast, setScrolledPast] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolledPast(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Pages without a dark hero should always use the light (scrolled) navbar
  const hasDarkHero = pathname === '/'
  const scrolled = scrolledPast || !hasDarkHero

  const toggleLang = () => {
    i18n.changeLanguage(i18n.language === 'fr' ? 'en' : 'fr')
  }

  const isActive = (link) => {
    if (!link.to) return false
    if (pathname === link.to) return true
    if (link.to === '/blog' && pathname.startsWith('/blog/')) return true
    return false
  }

  const linkClass = (active) => {
    const base = 'relative text-[13px] font-medium tracking-wide transition-colors duration-200 py-2'
    const color = scrolled
      ? active ? 'text-navy' : 'text-navy/55 hover:text-navy'
      : active ? 'text-white' : 'text-white/60 hover:text-white'
    return `${base} ${color}`
  }

  const renderLink = (link) => {
    const active = isActive(link)
    const indicator = active && (
      <span className={`absolute bottom-0 left-0 right-0 h-px ${scrolled ? 'bg-accent' : 'bg-accent'}`} />
    )
    if (link.to) {
      return (
        <Link key={link.key} to={link.to} className={linkClass(active)}>
          {t(link.key)}
          {indicator}
        </Link>
      )
    }
    return (
      <a key={link.key} href={link.href} className={linkClass(active)}>
        {t(link.key)}
        {indicator}
      </a>
    )
  }

  const mobileLinkClass =
    'block text-navy/75 hover:text-navy font-medium text-sm py-3 px-3 rounded-lg hover:bg-navy/[0.04] transition-colors'

  const renderMobileLink = (link) => {
    if (link.to) {
      return (
        <Link
          key={link.key}
          to={link.to}
          onClick={() => setMobileOpen(false)}
          className={mobileLinkClass}
        >
          {t(link.key)}
        </Link>
      )
    }
    return (
      <a
        key={link.key}
        href={link.href}
        onClick={() => setMobileOpen(false)}
        className={mobileLinkClass}
      >
        {t(link.key)}
      </a>
    )
  }

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/85 backdrop-blur-xl border-b border-navy/[0.06]'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-[68px]">
        <Link to="/" className="shrink-0">
          <img
            src="/images/logo5PennyAi.png"
            alt="5PennyAi"
            className={`h-7 transition-all duration-300 ${scrolled ? '' : 'brightness-[2]'}`}
          />
        </Link>

        <div className="hidden md:flex items-center gap-7">
          {navLinks.map(renderLink)}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={toggleLang}
            className={`text-[12px] font-semibold tracking-wide transition-colors duration-200 px-3 py-1.5 rounded-full border ${
              scrolled
                ? 'text-navy/55 border-navy/10 hover:text-navy hover:border-navy/25'
                : 'text-white/55 border-white/15 hover:text-white hover:border-white/30'
            }`}
            aria-label="Change language"
          >
            {t('nav.lang_toggle')}
          </button>
          <BookingButton variant="primary" className="text-[13px] px-5 py-2">
            {t('nav.cta')}
          </BookingButton>
        </div>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className={`md:hidden p-2 -mr-2 transition-colors ${scrolled ? 'text-navy' : 'text-white'}`}
          aria-label="Menu"
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-xl border-t border-navy/5">
          <div className="px-5 py-5 space-y-1">
            {navLinks.map(renderMobileLink)}
            <div className="flex items-center gap-3 pt-4 mt-3 border-t border-navy/5">
              <button
                onClick={toggleLang}
                className="text-sm font-semibold text-navy/55 hover:text-navy px-3 py-1.5 rounded-full border border-navy/10"
              >
                {t('nav.lang_toggle')}
              </button>
              <BookingButton variant="primary" onClick={() => setMobileOpen(false)}>
                {t('nav.cta')}
              </BookingButton>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
