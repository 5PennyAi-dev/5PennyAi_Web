import { Helmet } from 'react-helmet-async'
import { useTranslation } from 'react-i18next'
import { Sparkles, Workflow, LineChart, Clock, Search } from 'lucide-react'
import BookingButton from '@/components/ui/BookingButton'
import useScrollReveal from '@/hooks/useScrollReveal'

const services = [
  { key: 'app', icon: Sparkles, tone: 'accent' },
  { key: 'integration', icon: Workflow, tone: 'steel' },
  { key: 'prompt', icon: LineChart, tone: 'accent' },
  { key: 'mvp', icon: Clock, tone: 'steel' },
  { key: 'audit', icon: Search, tone: 'accent' },
]

const technologies = [
  'React / Vite',
  'Supabase',
  'Vercel',
  'Gemini API',
  'Claude API',
  'OpenAI API',
  'Node.js',
  'Python',
  'DataForSEO',
  'Tailwind CSS',
]

export default function ServicesPage() {
  const { t } = useTranslation()
  const heroRef = useScrollReveal()
  const listRef = useScrollReveal()
  const techRef = useScrollReveal()
  const ctaRef = useScrollReveal()

  return (
    <>
      <Helmet>
        <title>{t('services_page.seo.title')}</title>
        <meta name="description" content={t('services_page.seo.description')} />
      </Helmet>

      {/* Hero compact — same atmospheric treatment as landing hero */}
      <section
        ref={heroRef}
        className="reveal relative pt-36 pb-24 md:pt-40 md:pb-28 overflow-hidden bg-grain"
        style={{
          backgroundColor: '#0D2240',
          backgroundImage:
            'radial-gradient(ellipse 80% 70% at 70% 20%, rgba(221,135,55,0.16), transparent 60%), ' +
            'radial-gradient(ellipse 70% 70% at 20% 100%, rgba(129,174,215,0.20), transparent 60%), ' +
            'radial-gradient(ellipse 100% 100% at 50% 50%, #143054 0%, #0D2240 80%)',
        }}
      >
        <div className="absolute inset-0 bg-dot-grid-dark opacity-30 pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/30 to-transparent pointer-events-none" />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 text-center z-10">
          <div className="inline-flex items-center gap-2 bg-white/[0.06] border border-white/[0.14] rounded-full px-4 py-1.5 mb-6 backdrop-blur-md">
            <span className="w-1.5 h-1.5 rounded-full bg-accent shadow-[0_0_8px_rgba(221,135,55,0.6)]" />
            <span className="text-white/75 uppercase tracking-[0.2em] text-[11px] font-bold">
              {t('services_page.hero.overline')}
            </span>
          </div>
          <h1 className="text-display text-[2.25rem] md:text-[3.25rem] lg:text-[4rem] font-bold text-white mb-5">
            {t('services_page.hero.title')}
          </h1>
          <p className="text-white/65 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            {t('services_page.hero.subtitle')}
          </p>
        </div>
      </section>

      {/* Services list */}
      <section ref={listRef} className="reveal py-20 md:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="space-y-4 stagger-children">
            {services.map(({ key, icon: Icon, tone }) => {
              const tags = t(`services_page.items.${key}.tags`, { returnObjects: true }) || []
              const iconBg = tone === 'accent' ? 'bg-accent/12' : 'bg-steel/12'
              const iconColor = tone === 'accent' ? 'text-accent' : 'text-steel'
              return (
                <article
                  key={key}
                  className="bg-white border border-navy/[0.08] rounded-3xl p-7 md:p-8 flex flex-col md:flex-row gap-6 card-elevated hover:border-steel/40"
                >
                  <div
                    className={`w-12 h-12 rounded-xl ${iconBg} shrink-0 flex items-center justify-center`}
                  >
                    <Icon size={22} className={iconColor} strokeWidth={1.8} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-heading font-bold text-navy text-[17px] mb-2 tracking-tight">
                      {t(`services_page.items.${key}.title`)}
                    </h3>
                    <p className="text-muted text-[14px] leading-relaxed mb-5">
                      {t(`services_page.items.${key}.description`)}
                    </p>

                    <div className="flex flex-wrap gap-1.5 mb-5">
                      {tags.map((tag, i) => (
                        <span
                          key={i}
                          className="bg-navy/[0.05] text-navy/65 text-[11px] font-bold uppercase tracking-[0.12em] px-2.5 py-1 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <p className="text-[14px] text-muted leading-relaxed">
                      <span className="font-bold text-navy">{t('services_page.case_label')}</span>{' '}
                      {t(`services_page.items.${key}.case`)}
                    </p>
                  </div>
                </article>
              )
            })}
          </div>
        </div>
      </section>

      {/* Technologies */}
      <section ref={techRef} className="reveal pb-20 md:pb-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="bg-warm-gray rounded-3xl p-10 md:p-14 text-center border border-navy/[0.06] relative overflow-hidden">
            <div className="absolute inset-0 bg-dot-grid opacity-50 pointer-events-none" />
            <div className="relative">
              <p className="text-navy/55 text-[11px] font-bold uppercase tracking-[0.18em] mb-7">
                {t('services_page.tech.title')}
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {technologies.map((tech) => (
                  <span
                    key={tech}
                    className="bg-white border border-navy/[0.08] rounded-full px-4 py-1.5 text-[13px] font-medium text-navy/75"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section ref={ctaRef} className="reveal pb-24 md:pb-32">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div
            className="relative rounded-3xl p-12 md:p-16 text-center overflow-hidden bg-grain ring-inner-highlight"
            style={{
              backgroundColor: '#0D2240',
              backgroundImage:
                'radial-gradient(ellipse 70% 80% at 80% 0%, rgba(221,135,55,0.18), transparent 60%), ' +
                'radial-gradient(ellipse 70% 80% at 20% 100%, rgba(129,174,215,0.18), transparent 60%), ' +
                'radial-gradient(ellipse 100% 100% at 50% 50%, #143054 0%, #0D2240 80%)',
            }}
          >
            <div className="absolute inset-0 bg-dot-grid-dark opacity-25 pointer-events-none" />
            <div className="relative z-10">
              <h2 className="text-display text-[2rem] md:text-[2.5rem] font-bold text-white mb-4">
                {t('services_page.cta.title')}
              </h2>
              <p className="text-white/65 text-base mb-8 max-w-md mx-auto leading-relaxed">
                {t('services_page.cta.subtitle')}
              </p>
              <BookingButton variant="primary" className="px-8 py-3.5 text-[15px]">
                {t('services_page.cta.button')}
              </BookingButton>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
