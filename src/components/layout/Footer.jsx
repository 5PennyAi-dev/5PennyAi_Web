import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { Mail } from 'lucide-react'
import Logo from '@/components/ui/Logo'

function LinkedinIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  )
}


const footerLinks = [
  { key: 'nav.services', to: '/services' },
  { key: 'nav.about', to: '/about' },
  { key: 'nav.portfolio', to: '/portfolio' },
  { key: 'nav.faq', href: '/#faq' },
  { key: 'nav.contact', to: '/contact' },
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
              <Logo variant="dark" height={28} />
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
                { icon: <LinkedinIcon />, href: 'https://www.linkedin.com/in/christian-couillard-86705146/', label: 'LinkedIn' },
                { icon: <Mail size={18} aria-hidden="true" />, href: 'mailto:info@5pennyai.com', label: 'Email' },
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

        <div className="mt-14 pt-6 border-t border-white/[0.08] flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6">
          <p className="text-white/35 text-xs tnum">
            {t('footer.copyright')}
          </p>
          <Link
            to="/admin/blog"
            className="text-white/25 hover:text-white/60 text-[11px] uppercase tracking-[0.14em] font-bold transition-colors"
          >
            {t('footer.admin')}
          </Link>
        </div>
      </div>
    </footer>
  )
}
