import { Helmet } from 'react-helmet-async'
import { useTranslation } from 'react-i18next'
import { ArrowRight, ExternalLink } from 'lucide-react'
import Button from '@/components/ui/Button'
import SectionHeader from '@/components/ui/SectionHeader'
import ShaderBackground from '@/components/ui/ShaderBackground'
import useScrollReveal from '@/hooks/useScrollReveal'

export default function PortfolioPipeline() {
  const { t } = useTranslation()
  const heroRef = useScrollReveal()
  const challengeRef = useScrollReveal()
  const solutionRef = useScrollReveal()
  const archRef = useScrollReveal()
  const actionRef = useScrollReveal()
  const resultsRef = useScrollReveal()
  const ctaRef = useScrollReveal()

  const tags = t('portfolio_pipeline.hero.tags', { returnObjects: true }) || []
  const archSteps = t('portfolio_pipeline.architecture.steps', { returnObjects: true }) || []
  const actionItems = t('portfolio_pipeline.screenshots.items', { returnObjects: true }) || []
  const resultItems = t('portfolio_pipeline.results.items', { returnObjects: true }) || []

  return (
    <>
      <Helmet>
        <title>{t('portfolio_pipeline.seo.title')}</title>
        <meta name="description" content={t('portfolio_pipeline.seo.description')} />
      </Helmet>

      {/* HERO */}
      <section
        ref={heroRef}
        className="reveal relative pt-36 pb-24 md:pt-44 md:pb-32 overflow-hidden bg-grain"
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
              {t('portfolio_pipeline.hero.overline')}
            </span>
          </div>

          <h1 className="text-display text-[2.25rem] md:text-[3.25rem] lg:text-[3.75rem] font-bold text-white mb-5 leading-[1.05]">
            {t('portfolio_pipeline.hero.title')}
          </h1>

          <p className="text-white/65 text-base md:text-lg max-w-2xl mx-auto leading-relaxed mb-8">
            {t('portfolio_pipeline.hero.subtitle')}
          </p>

          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {tags.map((tag, i) => (
              <span
                key={i}
                className="bg-white/[0.08] border border-white/[0.12] text-white/80 text-[11px] font-bold uppercase tracking-[0.12em] px-3.5 py-1.5 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>

          <Button
            to={t('portfolio_pipeline.hero.link_to')}
            variant="ghost"
            className="px-6 py-2.5 text-[13px]"
          >
            <span className="inline-flex items-center gap-1.5">
              {t('portfolio_pipeline.hero.link_label')}
              <ExternalLink size={14} strokeWidth={2} />
            </span>
          </Button>
        </div>
      </section>

      {/* LE DÉFI */}
      <section ref={challengeRef} className="reveal py-24 md:py-32">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <SectionHeader
            overline={t('portfolio_pipeline.challenge.overline')}
            title={t('portfolio_pipeline.challenge.title')}
            className="text-center !mb-8"
          />
          <p className="text-muted text-[17px] md:text-[19px] leading-relaxed">
            {t('portfolio_pipeline.challenge.text')}
          </p>
        </div>
      </section>

      {/* LA SOLUTION */}
      <section ref={solutionRef} className="reveal py-24 md:py-32 bg-warm-gray relative overflow-hidden">
        <div className="absolute inset-0 bg-dot-grid opacity-40 pointer-events-none" />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <SectionHeader
            overline={t('portfolio_pipeline.solution.overline')}
            title={t('portfolio_pipeline.solution.title')}
            className="text-center !mb-8"
          />
          <p className="text-muted text-[17px] md:text-[19px] leading-relaxed">
            {t('portfolio_pipeline.solution.text')}
          </p>
        </div>
      </section>

      {/* ARCHITECTURE */}
      <section ref={archRef} className="reveal py-24 md:py-32">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <SectionHeader
            overline={t('portfolio_pipeline.architecture.overline')}
            title={t('portfolio_pipeline.architecture.title')}
            className="text-center"
          />

          <div className="flex flex-wrap items-center justify-center gap-y-4 gap-x-2">
            {archSteps.map((step, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="bg-white border border-navy/[0.08] rounded-xl px-5 py-3 text-[13px] md:text-[14px] font-medium text-navy card-elevated whitespace-nowrap">
                  {step}
                </div>
                {i < archSteps.length - 1 && (
                  <ArrowRight size={16} className="text-accent shrink-0 hidden sm:block" strokeWidth={2.5} />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* EN ACTION */}
      <section ref={actionRef} className="reveal py-24 md:py-32 bg-warm-gray relative overflow-hidden">
        <div className="absolute inset-0 bg-dot-grid opacity-40 pointer-events-none" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
          <SectionHeader
            overline={t('portfolio_pipeline.screenshots.overline')}
            title={t('portfolio_pipeline.screenshots.title')}
            className="text-center"
          />

          <div className="grid md:grid-cols-3 gap-4 max-w-5xl mx-auto stagger-children">
            {actionItems.map((item, i) => (
              <article
                key={i}
                className="bg-white border border-navy/[0.08] rounded-2xl p-7 card-elevated"
              >
                <div className="w-9 h-9 rounded-lg bg-accent/12 text-accent flex items-center justify-center font-heading font-bold text-[14px] mb-5">
                  {i + 1}
                </div>
                <h3 className="font-heading font-bold text-navy text-[16px] mb-3 tracking-tight">
                  {item.title}
                </h3>
                <p className="text-muted text-[14px] leading-relaxed">
                  {item.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* RÉSULTATS */}
      <section ref={resultsRef} className="reveal py-24 md:py-32">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <SectionHeader
            overline={t('portfolio_pipeline.results.overline')}
            title={t('portfolio_pipeline.results.title')}
            className="text-center"
          />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-4xl mx-auto stagger-children">
            {resultItems.map((item, i) => (
              <div
                key={i}
                className="bg-white border border-navy/[0.08] rounded-2xl p-6 md:p-8 text-center card-elevated"
              >
                <div className="text-accent font-bold text-[1.75rem] md:text-[2.25rem] leading-none tracking-tight tnum mb-2">
                  {item.value}
                </div>
                <div className="text-muted text-[12px] md:text-[13px] leading-snug">
                  {item.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
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
                {t('portfolio_pipeline.cta.title')}
              </h2>
              <p className="text-white/65 text-base mb-8 max-w-md mx-auto leading-relaxed">
                {t('portfolio_pipeline.cta.subtitle')}
              </p>
              <Button to="/contact" variant="primary" className="px-8 py-3.5 text-[15px]">
                {t('portfolio_pipeline.cta.button')}
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
