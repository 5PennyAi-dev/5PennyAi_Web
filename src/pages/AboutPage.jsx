import { Helmet } from 'react-helmet-async'
import { useTranslation } from 'react-i18next'
import { Code2, Plug, FileText, BarChart3, MapPin, Mail, ShieldCheck, BrainCircuit, BarChart2, Award } from 'lucide-react'
import BookingButton from '@/components/ui/BookingButton'
import SectionHeader from '@/components/ui/SectionHeader'
import ShaderBackground from '@/components/ui/ShaderBackground'
import useScrollReveal from '@/hooks/useScrollReveal'

const expertiseItems = [
  { key: 'fullstack', icon: Code2, tone: 'accent' },
  { key: 'integration', icon: Plug, tone: 'steel' },
  { key: 'analysis', icon: FileText, tone: 'steel' },
  { key: 'data', icon: BarChart3, tone: 'accent' },
]

function certVendorIcon(vendor) {
  switch (vendor) {
    case 'microsoft': return ShieldCheck
    case 'coursera': return BrainCircuit
    case 'google': return BarChart2
    default: return Award
  }
}

function certVendorTone(vendor) {
  switch (vendor) {
    case 'microsoft': return { bg: 'bg-steel/12', text: 'text-steel' }
    case 'coursera': return { bg: 'bg-accent/12', text: 'text-accent' }
    case 'google': return { bg: 'bg-steel/12', text: 'text-steel' }
    default: return { bg: 'bg-navy/8', text: 'text-navy/60' }
  }
}

export default function AboutPage() {
  const { t } = useTranslation()
  const heroRef = useScrollReveal()
  const profileRef = useScrollReveal()
  const expertiseRef = useScrollReveal()
  const timelineRef = useScrollReveal()
  const credentialsRef = useScrollReveal()
  const ctaRef = useScrollReveal()

  const timelineItems = t('about_page.timeline.items', { returnObjects: true }) || []
  const education = t('about_page.credentials.education', { returnObjects: true }) || []
  const certifications = t('about_page.credentials.certifications', { returnObjects: true }) || []

  return (
    <>
      <Helmet>
        <title>{t('about_page.seo.title')}</title>
        <meta name="description" content={t('about_page.seo.description')} />
      </Helmet>

      {/* Hero compact */}
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
        <ShaderBackground />
        <div className="absolute inset-0 bg-dot-grid-dark opacity-30 pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/30 to-transparent pointer-events-none" />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 text-center z-10">
          <div className="inline-flex items-center gap-2 bg-white/[0.06] border border-white/[0.14] rounded-full px-4 py-1.5 mb-6 backdrop-blur-md">
            <span className="w-1.5 h-1.5 rounded-full bg-accent shadow-[0_0_8px_rgba(221,135,55,0.6)]" />
            <span className="text-white/75 uppercase tracking-[0.2em] text-[11px] font-bold">
              {t('about_page.hero.overline')}
            </span>
          </div>
          <h1 className="text-display text-[2.25rem] md:text-[3.25rem] lg:text-[4rem] font-bold text-white mb-5">
            {t('about_page.hero.title')}
          </h1>
          <p className="text-white/65 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            {t('about_page.hero.subtitle')}
          </p>
        </div>
      </section>

      {/* Profile + story */}
      <section ref={profileRef} className="reveal py-20 md:py-28">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-5 gap-12 md:gap-16 items-start">
            {/* Profile card */}
            <div className="md:col-span-2">
              <img
                src="/images/portrait_Christian.jpeg"
                alt={t('about_page.profile.name')}
                className="w-[200px] h-[200px] rounded-full border-[3px] border-steel object-cover mx-auto md:mx-0 mb-6"
                style={{ boxShadow: '0 4px 16px rgba(20, 48, 84, 0.10)' }}
              />
              <div className="text-center md:text-left max-w-[280px] mx-auto md:mx-0">
                <h2 className="font-heading font-bold text-navy text-[18px] mb-1 tracking-tight">
                  {t('about_page.profile.name')}
                </h2>
                <p className="text-muted text-[14px] mb-4">
                  {t('about_page.profile.role')}
                </p>
                <div className="flex items-center justify-center md:justify-start gap-2 text-muted text-[14px] mb-2">
                  <MapPin size={14} className="text-accent shrink-0" strokeWidth={2} />
                  <span>{t('about_page.profile.location')}</span>
                </div>
                <a
                  href={`mailto:${t('about_page.profile.email')}`}
                  className="inline-flex items-center justify-center md:justify-start gap-2 text-accent hover:brightness-90 text-[14px] font-medium transition-all"
                >
                  <Mail size={14} className="shrink-0" strokeWidth={2} />
                  <span className="break-all">{t('about_page.profile.email')}</span>
                </a>
              </div>
            </div>

            {/* Story */}
            <div className="md:col-span-3">
              <h3 className="font-heading font-bold text-navy text-[22px] md:text-[26px] mb-4 leading-tight tracking-tight">
                {t('about_page.story.section1_title')}
              </h3>
              <p className="text-muted text-[15px] leading-relaxed mb-4">
                {t('about_page.story.section1_p1')}
              </p>
              <p className="text-muted text-[15px] leading-relaxed mb-10">
                {t('about_page.story.section1_p2')}
              </p>

              <h3 className="font-heading font-bold text-navy text-[22px] md:text-[26px] mb-4 leading-tight tracking-tight">
                {t('about_page.story.section2_title')}
              </h3>
              <p className="text-muted text-[15px] leading-relaxed mb-4">
                {t('about_page.story.section2_p1')}
              </p>
              <p className="text-muted text-[15px] leading-relaxed">
                {t('about_page.story.section2_p2')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Expertise */}
      <section ref={expertiseRef} className="reveal py-24 md:py-32 bg-warm-gray relative overflow-hidden">
        <div className="absolute inset-0 bg-dot-grid opacity-40 pointer-events-none" />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6">
          <SectionHeader
            overline={t('about_page.expertise.overline')}
            title={t('about_page.expertise.title')}
            className="text-center"
          />

          <div className="grid md:grid-cols-2 gap-4 max-w-4xl mx-auto stagger-children">
            {expertiseItems.map(({ key, icon: Icon, tone }) => {
              const iconBg = tone === 'accent' ? 'bg-accent/12' : 'bg-steel/12'
              const iconColor = tone === 'accent' ? 'text-accent' : 'text-steel'
              return (
                <article
                  key={key}
                  className="bg-white border border-navy/[0.08] rounded-3xl p-7 flex flex-col md:flex-row gap-5 card-elevated hover:border-steel/40"
                >
                  <div
                    className={`w-12 h-12 rounded-xl ${iconBg} shrink-0 flex items-center justify-center`}
                  >
                    <Icon size={22} className={iconColor} strokeWidth={1.8} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-heading font-bold text-navy text-[16px] mb-2 tracking-tight">
                      {t(`about_page.expertise.items.${key}.title`)}
                    </h3>
                    <p className="text-muted text-[14px] leading-relaxed">
                      {t(`about_page.expertise.items.${key}.description`)}
                    </p>
                  </div>
                </article>
              )
            })}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section ref={timelineRef} className="reveal py-24 md:py-32">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <SectionHeader
            overline={t('about_page.timeline.overline')}
            title={t('about_page.timeline.title')}
            className="text-center"
          />

          <div className="relative">
            <div className="absolute left-[7px] top-2 bottom-2 w-px bg-gradient-to-b from-transparent via-navy/15 to-transparent" aria-hidden="true" />

            <ol className="space-y-10">
              {timelineItems.map((item, i) => (
                <li key={i} className="relative pl-10">
                  <span
                    className="absolute left-0 top-1.5 w-[15px] h-[15px] rounded-full bg-white border-2 border-accent shadow-[0_0_0_4px_rgba(221,135,55,0.08)]"
                    aria-hidden="true"
                  />
                  <div className="text-[11px] font-bold text-accent uppercase tracking-[0.16em] mb-2 tnum">
                    {item.period}
                  </div>
                  <h3 className="font-heading font-bold text-navy text-[16px] mb-1.5 tracking-tight">
                    {item.role}
                  </h3>
                  <p className="text-muted text-[14px] leading-relaxed">
                    {item.description}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* Credentials */}
      <section ref={credentialsRef} className="reveal py-24 md:py-32 bg-warm-gray relative overflow-hidden">
        <div className="absolute inset-0 bg-dot-grid opacity-40 pointer-events-none" />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6">
          <SectionHeader
            overline={t('about_page.credentials.overline')}
            title={t('about_page.credentials.title')}
            className="text-center"
          />

          {/* Education */}
          <div className="max-w-4xl mx-auto mb-10">
            <h3 className="font-heading font-bold text-navy text-[16px] mb-5 tracking-tight">
              {t('about_page.credentials.education_title')}
            </h3>
            <div className="grid md:grid-cols-3 gap-3">
              {education.map((item, i) => (
                <div
                  key={i}
                  className="bg-white border border-navy/[0.08] rounded-xl px-5 py-4 flex items-center gap-3.5 card-elevated"
                >
                  <div className="w-9 h-9 rounded-lg bg-steel/12 shrink-0 flex items-center justify-center">
                    <Award size={18} className="text-steel" strokeWidth={1.8} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-navy text-[13px] font-medium leading-snug">{item.label}</p>
                    <p className="text-navy/45 text-[11px] font-bold tnum mt-0.5">{item.year}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Certifications — badge grid */}
          <div className="max-w-4xl mx-auto">
            <h3 className="font-heading font-bold text-navy text-[16px] mb-5 tracking-tight">
              {t('about_page.credentials.certifications_title')}
            </h3>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {certifications.map((item, i) => {
                const Icon = certVendorIcon(item.vendor)
                const iconTone = certVendorTone(item.vendor)
                return (
                  <div
                    key={i}
                    className="bg-white border border-navy/[0.08] rounded-xl px-4 py-4 flex flex-col items-center text-center gap-2.5 card-elevated"
                  >
                    <div className={`w-10 h-10 rounded-lg ${iconTone.bg} flex items-center justify-center`}>
                      <Icon size={20} className={iconTone.text} strokeWidth={1.8} />
                    </div>
                    <p className="text-navy text-[12px] font-medium leading-snug">{item.label}</p>
                    <span className="text-navy/45 text-[11px] font-bold tnum">{item.year}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section ref={ctaRef} className="reveal py-24 md:py-32">
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
                {t('about_page.cta.title')}
              </h2>
              <p className="text-white/65 text-base mb-8 max-w-md mx-auto leading-relaxed">
                {t('about_page.cta.subtitle')}
              </p>
              <BookingButton variant="primary" className="px-8 py-3.5 text-[15px]">
                {t('about_page.cta.button')}
              </BookingButton>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
