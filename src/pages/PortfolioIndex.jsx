import { Helmet } from 'react-helmet-async'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import ShaderBackground from '@/components/ui/ShaderBackground'
import useScrollReveal from '@/hooks/useScrollReveal'

export default function PortfolioIndex() {
  const { t } = useTranslation()
  const heroRef = useScrollReveal()
  const listRef = useScrollReveal()

  const items = t('portfolio_index.items', { returnObjects: true }) || []

  return (
    <>
      <Helmet>
        <title>{t('portfolio_index.seo.title')}</title>
        <meta name="description" content={t('portfolio_index.seo.description')} />
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
              {t('portfolio_index.hero.overline')}
            </span>
          </div>
          <h1 className="text-display text-[2.25rem] md:text-[3.25rem] lg:text-[4rem] font-bold text-white mb-5 leading-[1.05]">
            {t('portfolio_index.hero.title')}
          </h1>
          <p className="text-white/65 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            {t('portfolio_index.hero.subtitle')}
          </p>
        </div>
      </section>

      {/* Case studies grid */}
      <section ref={listRef} className="reveal py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto stagger-children">
            {items.map((item, i) => (
              <Link
                key={i}
                to={item.link}
                className="group relative bg-white rounded-2xl border border-navy/[0.08] card-elevated hover:border-steel/40 hover:-translate-y-0.5 transition-all duration-200 overflow-hidden flex flex-col"
              >
                {item.image && (
                  <div className="aspect-[16/9] overflow-hidden bg-navy/[0.03] border-b border-navy/[0.06]">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-contain"
                      loading="lazy"
                    />
                  </div>
                )}
                <div className="p-7 flex flex-col flex-1">
                  <h3 className="font-heading font-bold text-navy text-[18px] mb-3 tracking-tight">
                    {item.title}
                  </h3>
                  <p className="text-muted text-[14px] leading-relaxed mb-5 flex-1">
                    {item.description}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-5">
                    {(item.tags || []).map((tag, j) => (
                      <span
                        key={j}
                        className="bg-warm-gray border border-navy/10 text-navy/65 text-[11px] font-bold uppercase tracking-[0.12em] px-2.5 py-1 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <span className="inline-flex items-center gap-1.5 text-accent font-heading font-semibold text-[14px] mt-auto">
                    {item.cta}
                    <ArrowUpRight
                      size={16}
                      strokeWidth={2}
                      className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200"
                    />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
