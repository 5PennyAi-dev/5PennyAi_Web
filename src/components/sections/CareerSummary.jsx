import { useTranslation } from 'react-i18next'
import { BriefcaseBusiness, GraduationCap, BrainCircuit } from 'lucide-react'
import { Link } from 'react-router-dom'
import SectionHeader from '@/components/ui/SectionHeader'
import useScrollReveal from '@/hooks/useScrollReveal'

const icons = [BriefcaseBusiness, GraduationCap, BrainCircuit]

export default function CareerSummary() {
  const { t } = useTranslation()
  const ref = useScrollReveal()
  const items = t('career_summary.items', { returnObjects: true }) || []

  return (
    <section ref={ref} className="reveal py-24 md:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <SectionHeader
          title={t('career_summary.title')}
          subtitle={t('career_summary.introduction')}
          className="text-center"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl mx-auto stagger-children">
          {items.map((item, index) => {
            const Icon = icons[index]

            return (
              <article
                key={item.title}
                className="bg-white border border-navy/[0.08] rounded-2xl p-7 card-elevated hover:border-steel/40"
              >
                <span className="flex w-12 h-12 items-center justify-center rounded-xl bg-steel/12 text-steel mb-6">
                  <Icon size={22} strokeWidth={1.8} aria-hidden="true" />
                </span>
                <h3 className="font-heading font-bold text-navy text-[18px] mb-3 tracking-tight">
                  {item.title}
                </h3>
                <p className="text-muted text-[14px] leading-relaxed">
                  {item.description}
                </p>
              </article>
            )
          })}
        </div>

        <div className="mt-10 text-center">
          <Link
            to={t('career_summary.cta_link')}
            className="inline-flex items-center justify-center rounded-full border border-navy/20 px-5 py-3 font-heading font-semibold text-[14px] text-navy hover:border-steel hover:text-steel transition-colors duration-200"
          >
            {t('career_summary.cta')}
          </Link>
        </div>
      </div>
    </section>
  )
}
