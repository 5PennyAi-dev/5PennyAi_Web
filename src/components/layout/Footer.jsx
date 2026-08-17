import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import Logo from '@/components/ui/Logo'
import { FOOTER_NAVIGATION } from '@/lib/footerNavigation'

const linkClass =
  'text-sm font-medium text-white/60 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-navy'

export default function Footer() {
  const { t, i18n } = useTranslation()
  const toggleLang = () => i18n.changeLanguage(i18n.language === 'fr' ? 'en' : 'fr')

  return (
    <footer
      className="relative overflow-hidden bg-grain text-white"
      style={{
        backgroundColor: '#0D2240',
        backgroundImage:
          'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(20,48,84,0.6), transparent 70%)',
      }}
    >
      <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16">
        <div className="grid gap-10 md:grid-cols-12 md:gap-8 lg:gap-12">
          <div className="md:col-span-4">
            <Link to="/" className="inline-block" aria-label="5PennyAi">
              <Logo variant="dark" height={28} />
            </Link>
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-white/65">
              {t('footer.brandTagline')}
            </p>
          </div>

          <nav className="grid grid-cols-2 gap-x-7 gap-y-9 md:col-span-7 md:grid-cols-3 md:gap-x-8" aria-label={t('footer.navigationLabel')}>
            {FOOTER_NAVIGATION.map((group) => (
              <div key={group.key}>
                <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.18em] text-white/40">
                  {t(`footer.groups.${group.key}`)}
                </p>
                <ul className="space-y-3">
                  {group.links.map((link) => (
                    <li key={link.to}>
                      <Link to={link.to} className={linkClass}>{t(link.key)}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            <div className="col-span-2 md:col-span-1">
              <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.18em] text-white/40">{t('footer.language')}</p>
              <button type="button" onClick={toggleLang} className="rounded-full border border-white/20 px-3 py-1.5 text-xs font-semibold tracking-wide text-white/75 transition-colors hover:border-white/45 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-navy" aria-label={t('nav.changeLanguage')}>
                {t('nav.lang_toggle')}
              </button>
            </div>
          </nav>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-white/[0.08] pt-6 text-xs text-white/40 sm:flex-row sm:items-center sm:justify-between">
          <p className="tnum">{t('footer.copyright')}</p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <a href={t('home_contact.linkedin_url')} target="_blank" rel="noopener noreferrer" className={linkClass}>LinkedIn</a>
            <a href="https://www.facebook.com/profile.php?id=61576445489064" target="_blank" rel="noopener noreferrer" className={linkClass}>Facebook</a>
            <a href={`mailto:${t('home_contact.email')}`} className={linkClass}>{t('footer.email')}</a>
          </div>
          <Link
            to="/admin/ressources-ia/infographies"
            className="text-[11px] font-bold uppercase tracking-[0.14em] text-white/35 transition-colors hover:text-white/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-navy"
          >
            {t('footer.admin')}
          </Link>
        </div>
      </div>
    </footer>
  )
}
