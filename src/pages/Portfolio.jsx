import { Helmet } from 'react-helmet-async'
import { useTranslation } from 'react-i18next'
import {
  Eye,
  BarChart3,
  Sparkles,
  Zap,
  Target,
  SlidersHorizontal,
  Shield,
  ExternalLink,
} from 'lucide-react'
import Button from '@/components/ui/Button'
import SectionHeader from '@/components/ui/SectionHeader'
import useScrollReveal from '@/hooks/useScrollReveal'

const pipelineSteps = [
  { key: 'visual', icon: Eye, tone: 'accent' },
  { key: 'scoring', icon: BarChart3, tone: 'steel' },
  { key: 'seo', icon: Sparkles, tone: 'accent' },
]

const techMetrics = [
  { key: 'speed', icon: Zap, tone: 'accent' },
  { key: 'scoring', icon: Target, tone: 'steel' },
  { key: 'calibration', icon: SlidersHorizontal, tone: 'accent' },
  { key: 'security', icon: Shield, tone: 'steel' },
]

const technologies = [
  'React 19 / Vite',
  'Node.js / Express',
  'Supabase (PostgreSQL + Auth + RLS + Edge Functions)',
  'Gemini Vision API',
  'DataForSEO API',
  'Vercel Serverless',
  'Tailwind CSS',
  'Framer Motion',
]

const screenshots = [
  { src: '/images/portfolio/dashboard-full.png', key: 'dashboard' },
  { src: '/images/portfolio/keywords-table.png', key: 'keywords' },
  { src: '/images/portfolio/seolab-favorites-table.png', key: 'favorites' },
]

export default function Portfolio() {
  const { t } = useTranslation()
  const heroRef = useScrollReveal()
  const projectRef = useScrollReveal()
  const problemRef = useScrollReveal()
  const solutionRef = useScrollReveal()
  const screenshotsRef = useScrollReveal()
  const metricsRef = useScrollReveal()
  const upcomingRef = useScrollReveal()
  const ctaRef = useScrollReveal()

  const pennyseoTags = t('portfolio.pennyseo.tags', { returnObjects: true }) || []

  return (
    <>
      <Helmet>
        <title>{t('portfolio.seo.title')}</title>
        <meta name="description" content={t('portfolio.seo.description')} />
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
        <div className="absolute inset-0 bg-dot-grid-dark opacity-30 pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/30 to-transparent pointer-events-none" />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 text-center z-10">
          <div className="inline-flex items-center gap-2 bg-white/[0.06] border border-white/[0.14] rounded-full px-4 py-1.5 mb-6 backdrop-blur-md">
            <span className="w-1.5 h-1.5 rounded-full bg-accent shadow-[0_0_8px_rgba(221,135,55,0.6)]" />
            <span className="text-white/75 uppercase tracking-[0.2em] text-[11px] font-bold">
              {t('portfolio.hero.overline')}
            </span>
          </div>
          <h1 className="text-display text-[2.25rem] md:text-[3.25rem] lg:text-[4rem] font-bold text-white mb-5">
            {t('portfolio.hero.title')}
          </h1>
          <p className="text-white/65 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            {t('portfolio.hero.subtitle')}
          </p>
        </div>
      </section>

      {/* PennySEO project overview */}
      <section ref={projectRef} className="reveal py-20 md:py-28">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <article className="bg-white border border-navy/[0.08] rounded-3xl p-7 md:p-10 card-elevated">
            <div className="grid md:grid-cols-2 gap-8 md:gap-10 items-center">
              <div>
                <span className="inline-flex items-center gap-2 bg-accent/[0.10] border border-accent/[0.20] rounded-full px-3 py-1 mb-5">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                  <span className="text-accent text-[11px] font-bold uppercase tracking-[0.16em]">
                    {t('portfolio.pennyseo.badge')}
                  </span>
                </span>
                <h2 className="font-heading font-bold text-navy text-[28px] md:text-[34px] tracking-tight mb-3">
                  {t('portfolio.pennyseo.title')}
                </h2>
                <p className="text-muted text-[15px] leading-relaxed mb-5">
                  {t('portfolio.pennyseo.subtitle')}
                </p>
                <div className="flex flex-wrap gap-1.5 mb-6">
                  {pennyseoTags.map((tag, i) => (
                    <span
                      key={i}
                      className="bg-navy/[0.05] text-navy/65 text-[11px] font-bold uppercase tracking-[0.12em] px-2.5 py-1 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <a
                  href="https://www.pennyseo.ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-accent hover:brightness-90 text-[14px] font-medium transition-all"
                >
                  www.pennyseo.ai
                  <ExternalLink size={14} strokeWidth={2} />
                </a>
              </div>
              <div>
                <img
                  src="/images/portfolio/dashboard-full.png"
                  alt={t('portfolio.pennyseo.image_alt')}
                  className="w-full rounded-xl border border-navy/[0.08] shadow-[0_8px_24px_-8px_rgba(20,48,84,0.18)]"
                  loading="lazy"
                />
              </div>
            </div>
          </article>
        </div>
      </section>

      {/* Problem */}
      <section ref={problemRef} className="reveal py-20 md:py-24 bg-warm-gray relative overflow-hidden">
        <div className="absolute inset-0 bg-dot-grid opacity-40 pointer-events-none" />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <SectionHeader
            overline={t('portfolio.problem.overline')}
            title={t('portfolio.problem.title')}
            className="text-center !mb-8"
          />
          <p className="text-muted text-[16px] leading-relaxed">
            {t('portfolio.problem.text')}
          </p>
        </div>
      </section>

      {/* Solution + pipeline */}
      <section ref={solutionRef} className="reveal py-24 md:py-32">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <SectionHeader
            overline={t('portfolio.solution.overline')}
            title={t('portfolio.solution.title')}
            subtitle={t('portfolio.solution.text')}
            className="text-center"
          />
          <div className="grid md:grid-cols-3 gap-4 stagger-children">
            {pipelineSteps.map(({ key, icon: Icon, tone }) => {
              const iconBg = tone === 'accent' ? 'bg-accent/12' : 'bg-steel/12'
              const iconColor = tone === 'accent' ? 'text-accent' : 'text-steel'
              return (
                <article
                  key={key}
                  className="bg-white border border-navy/[0.08] rounded-3xl p-7 card-elevated hover:border-steel/40"
                >
                  <div className={`w-12 h-12 rounded-xl ${iconBg} mb-5 flex items-center justify-center`}>
                    <Icon size={22} className={iconColor} strokeWidth={1.8} />
                  </div>
                  <h3 className="font-heading font-bold text-navy text-[16px] mb-2 tracking-tight">
                    {t(`portfolio.pipeline.${key}.title`)}
                  </h3>
                  <p className="text-muted text-[14px] leading-relaxed">
                    {t(`portfolio.pipeline.${key}.description`)}
                  </p>
                </article>
              )
            })}
          </div>
        </div>
      </section>

      {/* Screenshots gallery */}
      <section ref={screenshotsRef} className="reveal py-24 md:py-32 bg-warm-gray relative overflow-hidden">
        <div className="absolute inset-0 bg-dot-grid opacity-40 pointer-events-none" />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6">
          <SectionHeader
            overline={t('portfolio.screenshots.overline')}
            title={t('portfolio.screenshots.title')}
            className="text-center"
          />
          <div className="space-y-8 md:space-y-10">
            {screenshots.map(({ src, key }) => (
              <figure
                key={key}
                className="bg-white border border-navy/[0.08] rounded-3xl p-4 md:p-6 card-elevated hover:border-steel/40"
              >
                <img
                  src={src}
                  alt={t(`portfolio.screenshots.${key}.alt`)}
                  className="w-full rounded-xl border border-navy/[0.06]"
                  loading="lazy"
                />
                <figcaption className="text-muted text-[14px] leading-relaxed text-center mt-5 px-2 md:px-6">
                  {t(`portfolio.screenshots.${key}.caption`)}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* Tech metrics */}
      <section ref={metricsRef} className="reveal py-24 md:py-32">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <SectionHeader
            overline={t('portfolio.metrics.overline')}
            title={t('portfolio.metrics.title')}
            className="text-center"
          />
          <div className="grid md:grid-cols-2 gap-4 max-w-4xl mx-auto stagger-children">
            {techMetrics.map(({ key, icon: Icon, tone }) => {
              const iconBg = tone === 'accent' ? 'bg-accent/12' : 'bg-steel/12'
              const iconColor = tone === 'accent' ? 'text-accent' : 'text-steel'
              return (
                <article
                  key={key}
                  className="bg-white border border-navy/[0.08] rounded-3xl p-7 flex gap-5 card-elevated hover:border-steel/40"
                >
                  <div className={`w-12 h-12 rounded-xl ${iconBg} shrink-0 flex items-center justify-center`}>
                    <Icon size={22} className={iconColor} strokeWidth={1.8} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-heading font-bold text-navy text-[16px] mb-2 tracking-tight">
                      {t(`portfolio.metrics.items.${key}.title`)}
                    </h3>
                    <p className="text-muted text-[14px] leading-relaxed">
                      {t(`portfolio.metrics.items.${key}.description`)}
                    </p>
                  </div>
                </article>
              )
            })}
          </div>
        </div>
      </section>

      {/* Stack technique */}
      <section className="bg-warm-gray">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-20 md:py-24">
          <div className="bg-white rounded-3xl p-10 md:p-14 text-center border border-navy/[0.06] relative overflow-hidden">
            <div className="absolute inset-0 bg-dot-grid opacity-40 pointer-events-none" />
            <div className="relative">
              <p className="text-navy/55 text-[11px] font-bold uppercase tracking-[0.18em] mb-7">
                {t('portfolio.stack.title')}
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {technologies.map((tech) => (
                  <span
                    key={tech}
                    className="bg-warm-gray border border-navy/[0.08] rounded-full px-4 py-1.5 text-[13px] font-medium text-navy/75"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Upcoming projects */}
      <section ref={upcomingRef} className="reveal py-24 md:py-32 bg-warm-gray relative overflow-hidden">
        <div className="absolute inset-0 bg-dot-grid opacity-40 pointer-events-none" />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6">
          <SectionHeader
            overline={t('portfolio.upcoming.overline')}
            title={t('portfolio.upcoming.title')}
            subtitle={t('portfolio.upcoming.subtitle')}
            className="text-center"
          />
          <div className="grid md:grid-cols-2 gap-4 max-w-4xl mx-auto">
            {[0, 1].map((i) => (
              <div
                key={i}
                className="h-[200px] rounded-2xl border-2 border-dashed border-navy/15 flex items-center justify-center text-navy/35 text-[13px] font-medium uppercase tracking-[0.16em]"
              >
                {t('portfolio.upcoming.placeholder')}
              </div>
            ))}
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
                {t('portfolio.cta.title')}
              </h2>
              <p className="text-white/65 text-base mb-8 max-w-md mx-auto leading-relaxed">
                {t('portfolio.cta.subtitle')}
              </p>
              <Button to="/contact" variant="primary" className="px-8 py-3.5 text-[15px]">
                {t('portfolio.cta.button')}
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
