import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { Mail } from 'lucide-react'

function LinkedinIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  )
}

function GithubIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  )
}

const footerLinks = [
  { key: 'nav.services', to: '/services' },
  { key: 'nav.about', to: '/about' },
  { key: 'nav.portfolio', href: '/#case-study' },
  { key: 'nav.faq', href: '/#faq' },
  { key: 'nav.contact', href: '/#booking' },
]

const linkClass =
  'text-white/55 hover:text-white text-[14px] font-medium transition-colors duration-200'

function FooterLink({ link, children }) {
  if (link.to) {
    return <Link to={link.to} className={linkClass}>{children}</Link>
  }
  return <a href={link.href} className={linkClass}>{children}</a>
}

export default function Footer() {
  const { t } = useTranslation()

  return (
    <footer
      className="text-white relative overflow-hidden bg-grain"
      style={{
        backgroundColor: '#0D2240',
        backgroundImage:
          'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(20,48,84,0.6), transparent 70%)',
      }}
    >
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid md:grid-cols-12 gap-10 md:gap-12 items-start">
          {/* Brand */}
          <div className="md:col-span-5">
            <Link to="/" className="inline-block">
              <img
                src="/images/logo5PennyAi.png"
                alt="5PennyAi"
                className="h-7 brightness-[2]"
              />
            </Link>
            <p className="text-white/35 text-[11px] uppercase tracking-[0.18em] font-bold mt-5">
              {t('footer.tagline')}
            </p>
            <p className="text-white/45 text-[14px] mt-2 max-w-xs leading-relaxed">
              {t('footer.made_with')}
            </p>
          </div>

          {/* Links */}
          <nav className="md:col-span-4">
            <p className="text-white/35 text-[11px] uppercase tracking-[0.18em] font-bold mb-5">
              Navigation
            </p>
            <div className="grid grid-cols-2 gap-x-6 gap-y-3">
              {footerLinks.map((link) => (
                <FooterLink key={link.key} link={link}>
                  {t(link.key)}
                </FooterLink>
              ))}
            </div>
          </nav>

          {/* Social */}
          <div className="md:col-span-3">
            <p className="text-white/35 text-[11px] uppercase tracking-[0.18em] font-bold mb-5">
              Contact
            </p>
            <div className="flex items-center gap-3">
              {[
                { icon: <LinkedinIcon />, href: 'https://linkedin.com', label: 'LinkedIn' },
                { icon: <GithubIcon />, href: 'https://github.com', label: 'GitHub' },
                { icon: <Mail size={18} aria-hidden="true" />, href: 'mailto:christian.couillard@5pennyai.com', label: 'Email' },
              ].map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target={social.href.startsWith('http') ? '_blank' : undefined}
                  rel={social.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/50 hover:text-accent hover:border-accent/40 hover:bg-white/[0.04] transition-all duration-200"
                  aria-label={social.label}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-14 pt-6 border-t border-white/[0.08] flex items-center justify-center">
          <p className="text-white/35 text-xs tnum">
            {t('footer.copyright')}
          </p>
        </div>
      </div>
    </footer>
  )
}
