import { Helmet } from 'react-helmet-async'
import { useTranslation } from 'react-i18next'
import { Mail, MapPin } from 'lucide-react'
import ShaderBackground from '@/components/ui/ShaderBackground'
import useScrollReveal from '@/hooks/useScrollReveal'

function LinkedinIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  )
}

function GithubIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.4 5.4 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  )
}

export default function Contact() {
  const { t } = useTranslation()
  const heroRef = useScrollReveal()
  const cardsRef = useScrollReveal()

  const channels = [
    {
      Icon: () => <Mail size={22} strokeWidth={1.8} aria-hidden="true" />,
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
    <>
      <Helmet>
        <title>{t('contact.seo.title')}</title>
        <meta name="description" content={t('contact.seo.description')} />
      </Helmet>

      {/* Hero */}
      <section
        ref={heroRef}
        className="reveal relative pt-36 pb-20 md:pt-40 md:pb-24 overflow-hidden bg-grain"
        style={{
          backgroundColor: '#0D2240',
          backgroundImage:
            'radial-gradient(ellipse 80% 70% at 70% 20%, rgba(221,135,55,0.16), transparent 60%), ' +
            'radial-gradient(ellipse 70% 70% at 20% 100%, rgba(129,174,215,0.20), transparent 60%), ' +
            'radial-gradient(ellipse 100% 100% at 50% 50%, #143054 0%, #0D2240 80%)',
        }}
      >
        <ShaderBackground />
        <div className="absolute inset-0 bg-dot-grid-dark opacity-30 pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/30 to-transparent pointer-events-none" />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 text-center z-10">
          <div className="inline-flex items-center gap-2 bg-white/[0.06] border border-white/[0.14] rounded-full px-4 py-1.5 mb-6 backdrop-blur-md">
            <span className="w-1.5 h-1.5 rounded-full bg-accent shadow-[0_0_8px_rgba(221,135,55,0.6)]" />
            <span className="text-white/75 uppercase tracking-[0.2em] text-[11px] font-bold">
              {t('contact.hero.overline')}
            </span>
          </div>
          <h1 className="text-display text-[2.25rem] md:text-[3.25rem] lg:text-[4rem] font-bold text-white mb-5">
            {t('contact.hero.title')}
          </h1>
          <p className="text-white/65 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            {t('contact.hero.subtitle')}
          </p>
        </div>
      </section>

      {/* Coordinates */}
      <section ref={cardsRef} className="reveal py-20 md:py-28">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="grid sm:grid-cols-3 gap-4 stagger-children">
            {channels.map((c) => {
              const Icon = c.Icon
              return (
                <a
                  key={c.label}
                  href={c.href}
                  target={c.external ? '_blank' : undefined}
                  rel={c.external ? 'noopener noreferrer' : undefined}
                  className="group bg-white border border-navy/[0.08] rounded-2xl p-7 card-elevated hover:border-steel/40 hover:-translate-y-0.5 transition-all duration-200 flex flex-col items-start"
                >
                  <span className="flex w-12 h-12 items-center justify-center rounded-xl bg-accent/[0.10] text-accent mb-5 group-hover:bg-accent/[0.18] transition-colors">
                    <Icon />
                  </span>
                  <span className="text-navy/55 text-[11px] uppercase tracking-[0.16em] font-bold mb-1.5">
                    {c.label}
                  </span>
                  <span className="text-navy text-[15px] font-medium break-words">
                    {c.value}
                  </span>
                </a>
              )
            })}
          </div>

          <div className="mt-12 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-muted text-[13px]">
            <span className="inline-flex items-center gap-2">
              <MapPin size={14} className="text-accent shrink-0" strokeWidth={2} />
              {t('contact.info.location')}
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="w-1 h-1 rounded-full bg-navy/30" aria-hidden="true" />
              {t('contact.info.availability')}
            </span>
          </div>
        </div>
      </section>
    </>
  )
}
