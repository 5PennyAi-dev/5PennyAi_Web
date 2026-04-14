import { useTranslation } from 'react-i18next'
import useScrollReveal from '@/hooks/useScrollReveal'

export default function CaseStudy() {
  const { t } = useTranslation()
  const ref = useScrollReveal()

  const tags = t('case_study.tags', { returnObjects: true }) || []

  return (
    <section id="case-study" ref={ref} className="reveal py-24 md:py-32 bg-warm-gray relative overflow-hidden">
      <div className="absolute inset-0 bg-dot-grid opacity-40 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-14 md:mb-16">
          <div className="inline-flex items-center gap-2 bg-accent/[0.08] border border-accent/[0.18] rounded-full px-3.5 py-1 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-accent" />
            <span className="text-accent uppercase tracking-[0.18em] text-[11px] font-bold">
              {t('case_study.overline')}
            </span>
          </div>
          <div>
            <img
              src="/images/pennyseo-logo.png"
              alt="PennySEO"
              className="w-[280px] md:w-[360px] mx-auto"
            />
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-12 md:gap-14 max-w-5xl mx-auto items-center">
          {/* Text side */}
          <div>
            <div className="flex flex-wrap gap-2 mb-6">
              {tags.map((tag, i) => (
                <span
                  key={i}
                  className="bg-white border border-navy/10 text-navy/65 text-[11px] font-bold uppercase tracking-[0.12em] px-2.5 py-1 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
            <p className="text-muted leading-relaxed text-[15px]">
              {t('case_study.description')}
            </p>
          </div>

          {/* Browser-chrome mockup */}
          <div className="browser-chrome bg-white rounded-2xl border border-navy/[0.08] card-elevated overflow-hidden">
            <div className="pt-[28px]">
              <img
                src="/images/portfolio/keywords-table.png"
                alt="PennySEO Keywords Table"
                className="w-full block"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
