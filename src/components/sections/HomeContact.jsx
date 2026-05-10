import { useTranslation } from 'react-i18next'
import { Mail } from 'lucide-react'
import useScrollReveal from '@/hooks/useScrollReveal'

function LinkedinIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  )
}

function GithubIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.4 5.4 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  )
}

export default function HomeContact() {
  const { t } = useTranslation()
  const ref = useScrollReveal()

  const links = [
    {
      Icon: () => <Mail size={18} strokeWidth={1.8} aria-hidden="true" />,
      label: t('home_contact.email_label'),
      value: t('home_contact.email'),
      href: `mailto:${t('home_contact.email')}`,
      external: false,
    },
    {
      Icon: LinkedinIcon,
      label: t('home_contact.linkedin_label'),
      value: t('home_contact.linkedin_handle'),
      href: t('home_contact.linkedin_url'),
      external: true,
    },
    {
      Icon: GithubIcon,
      label: t('home_contact.github_label'),
      value: t('home_contact.github_handle'),
      href: t('home_contact.github_url'),
      external: true,
    },
  ]

  return (
    <section
      id="contact"
      ref={ref}
      className="reveal relative py-24 md:py-32 overflow-hidden bg-grain"
      style={{
        backgroundColor: '#0D2240',
        backgroundImage:
          'radial-gradient(ellipse 60% 80% at 80% 0%, rgba(221,135,55,0.16), transparent 60%), ' +
          'radial-gradient(ellipse 60% 80% at 20% 100%, rgba(129,174,215,0.18), transparent 60%), ' +
          'radial-gradient(ellipse 100% 100% at 50% 50%, #143054 0%, #0D2240 80%)',
      }}
    >
      <div className="absolute inset-0 bg-dot-grid-dark opacity-30 pointer-events-none" />

      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 text-center z-10">
        <div className="inline-flex items-center gap-2 bg-white/[0.06] border border-white/[0.14] rounded-full px-4 py-1.5 mb-6 backdrop-blur-md">
          <span className="w-1.5 h-1.5 rounded-full bg-accent shadow-[0_0_8px_rgba(221,135,55,0.6)]" />
          <span className="text-white/70 uppercase tracking-[0.2em] text-[11px] font-bold">
            {t('home_contact.overline')}
          </span>
        </div>
        <h2 className="text-display text-[2.25rem] md:text-[3rem] lg:text-[3.5rem] font-bold text-white mb-6">
          {t('home_contact.title')}
        </h2>
        <p className="text-white/65 text-base md:text-lg mb-12 max-w-xl mx-auto leading-relaxed">
          {t('home_contact.subtitle')}
        </p>

        <div className="flex flex-col sm:flex-row items-stretch justify-center gap-3 max-w-2xl mx-auto">
          {links.map((link) => {
            const Icon = link.Icon
            return (
              <a
                key={link.label}
                href={link.href}
                target={link.external ? '_blank' : undefined}
                rel={link.external ? 'noopener noreferrer' : undefined}
                className="flex-1 group flex items-center gap-3 bg-white/[0.04] border border-white/[0.12] hover:bg-white/[0.08] hover:border-white/25 rounded-xl px-5 py-4 transition-colors duration-200 text-left"
              >
                <span className="flex w-10 h-10 shrink-0 items-center justify-center rounded-lg bg-white/[0.06] border border-white/[0.1] text-white/70 group-hover:text-accent transition-colors">
                  <Icon />
                </span>
                <span className="flex flex-col min-w-0">
                  <span className="text-white/45 text-[11px] uppercase tracking-[0.16em] font-bold">
                    {link.label}
                  </span>
                  <span className="text-white/90 text-[14px] font-medium truncate">
                    {link.value}
                  </span>
                </span>
              </a>
            )
          })}
        </div>
      </div>
    </section>
  )
}
