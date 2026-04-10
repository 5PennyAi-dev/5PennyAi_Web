import { useTranslation } from 'react-i18next'
import SectionHeader from '@/components/ui/SectionHeader'
import useScrollReveal from '@/hooks/useScrollReveal'

export default function CaseStudy() {
  const { t } = useTranslation()
  const ref = useScrollReveal()

  const tags = t('case_study.tags', { returnObjects: true }) || []

  return (
    <section id="case-study" ref={ref} className="reveal py-24 md:py-32 bg-warm-gray relative overflow-hidden">
      <div className="absolute inset-0 bg-dot-grid opacity-40 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
        <SectionHeader
          overline={t('case_study.overline')}
          title={t('case_study.title')}
          className="text-center"
        />
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
              <div
                className="aspect-[16/10] flex items-center justify-center relative"
                style={{
                  backgroundImage:
                    'radial-gradient(ellipse 80% 60% at 50% 30%, rgba(129,174,215,0.15), transparent 70%), linear-gradient(135deg, #FAFAF9 0%, #F0F4F8 100%)',
                }}
              >
                <div className="text-center">
                  <div className="w-14 h-14 rounded-2xl bg-accent/10 ring-1 ring-accent/20 flex items-center justify-center mx-auto mb-4">
                    <span className="text-accent font-display font-bold text-[14px] tracking-tight">SEO</span>
                  </div>
                  <span className="text-navy/35 font-heading font-bold text-[11px] uppercase tracking-[0.18em]">
                    PennySEO
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
