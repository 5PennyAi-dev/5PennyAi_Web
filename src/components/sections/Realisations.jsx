import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import SectionHeader from '@/components/ui/SectionHeader'
import useScrollReveal from '@/hooks/useScrollReveal'

export default function Realisations() {
  const { t } = useTranslation()
  const ref = useScrollReveal()

  const items = t('realisations.items', { returnObjects: true }) || []

  return (
    <section
      id="realisations"
      ref={ref}
      className="reveal py-24 md:py-32 bg-warm-gray relative overflow-hidden scroll-mt-20"
    >
      <div className="absolute inset-0 bg-dot-grid opacity-40 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
        <SectionHeader
          overline={t('realisations.overline')}
          title={t('realisations.title')}
          className="text-center"
        />

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
  )
}
