import { Helmet } from 'react-helmet-async'
import { useTranslation } from 'react-i18next'
import { ExternalLink, ArrowRight } from 'lucide-react'
import Button from '@/components/ui/Button'
import SectionHeader from '@/components/ui/SectionHeader'
import ShaderBackground from '@/components/ui/ShaderBackground'
import useScrollReveal from '@/hooks/useScrollReveal'

export default function Portfolio() {
  const { t } = useTranslation()
  const heroRef = useScrollReveal()
  const challengeRef = useScrollReveal()
  const solutionRef = useScrollReveal()
  const archRef = useScrollReveal()
  const screenshotsRef = useScrollReveal()
  const resultsRef = useScrollReveal()
  const ctaRef = useScrollReveal()

  const tags = t('portfolio.hero.tags', { returnObjects: true }) || []
  const archSteps = t('portfolio.architecture.steps', { returnObjects: true }) || []
  const screenshotItems = t('portfolio.screenshots.items', { returnObjects: true }) || []
  const resultItems = t('portfolio.results.items', { returnObjects: true }) || []

  return (
    <>
      <Helmet>
        <title>{t('portfolio.seo.title')}</title>
        <meta name="description" content={t('portfolio.seo.description')} />
      </Helmet>

      {/* ─── 1. HERO HEADER ─── */}
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
              {t('portfolio.hero.overline')}
            </span>
          </div>

          <h1 className="text-display text-[3rem] md:text-[4rem] lg:text-[5rem] font-bold text-white mb-5">
            {t('portfolio.hero.title')}
          </h1>

          <p className="text-white/60 text-base md:text-lg max-w-2xl mx-auto leading-relaxed mb-8">
            {t('portfolio.hero.subtitle')}
          </p>

          {/* Tech badges */}
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

          <a
            href="https://www.pennyseo.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-accent hover:brightness-110 text-[14px] font-medium transition-all"
          >
            {t('portfolio.hero.link_label')}
            <ExternalLink size={14} strokeWidth={2} />
          </a>
        </div>
      </section>

      {/* ─── 2. LE DÉFI ─── */}
      <section ref={challengeRef} className="reveal py-24 md:py-32">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <SectionHeader
            overline={t('portfolio.challenge.overline')}
            title={t('portfolio.challenge.title')}
            className="text-center !mb-8"
          />
          <p className="text-muted text-[17px] md:text-[19px] leading-relaxed">
            {t('portfolio.challenge.text')}
          </p>
        </div>
      </section>

      {/* ─── 3. LA SOLUTION ─── */}
      <section ref={solutionRef} className="reveal py-24 md:py-32 bg-warm-gray relative overflow-hidden">
        <div className="absolute inset-0 bg-dot-grid opacity-40 pointer-events-none" />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <SectionHeader
            overline={t('portfolio.solution.overline')}
            title={t('portfolio.solution.title')}
            className="text-center !mb-8"
          />
          <p className="text-muted text-[17px] md:text-[19px] leading-relaxed">
            {t('portfolio.solution.text')}
          </p>
        </div>
      </section>

      {/* ─── 4. ARCHITECTURE TECHNIQUE ─── */}
      <section ref={archRef} className="reveal py-24 md:py-32">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <SectionHeader
            overline={t('portfolio.architecture.overline')}
            title={t('portfolio.architecture.title')}
            className="text-center"
          />

          {/* Pipeline diagram */}
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

      {/* ─── 5. SCREENSHOTS ─── */}
      <section ref={screenshotsRef} className="reveal py-24 md:py-32 bg-warm-gray relative overflow-hidden">
        <div className="absolute inset-0 bg-dot-grid opacity-40 pointer-events-none" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
          <SectionHeader
            overline={t('portfolio.screenshots.overline')}
            title={t('portfolio.screenshots.title')}
            className="text-center"
          />

          <div className="space-y-12 md:space-y-16">
            {screenshotItems.map((item, i) => (
              <figure
                key={i}
                className="bg-white border border-navy/[0.08] rounded-3xl overflow-hidden card-elevated"
              >
                <div className="p-3 md:p-5">
                  <img
                    src={item.src}
                    alt={item.alt}
                    className="w-full rounded-xl border border-navy/[0.06]"
                    loading="lazy"
                  />
                </div>
                <figcaption className="px-6 md:px-10 pb-6 md:pb-8 pt-2 text-center">
                  <p className="text-muted text-[14px] md:text-[15px] leading-relaxed max-w-3xl mx-auto">
                    {item.caption}
                  </p>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 6. RÉSULTATS & CHIFFRES CLÉS ─── */}
      <section ref={resultsRef} className="reveal py-24 md:py-32">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <SectionHeader
            overline={t('portfolio.results.overline')}
            title={t('portfolio.results.title')}
            className="text-center"
          />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-4xl mx-auto stagger-children">
            {resultItems.map((item, i) => (
              <div
                key={i}
                className="bg-white border border-navy/[0.08] rounded-2xl p-6 md:p-8 text-center card-elevated"
              >
                <div className="text-accent font-bold text-[2rem] md:text-[2.5rem] leading-none tracking-tight tnum mb-2">
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

      {/* ─── CTA ─── */}
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
