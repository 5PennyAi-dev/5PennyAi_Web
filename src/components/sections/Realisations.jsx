import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import SectionHeader from '@/components/ui/SectionHeader'
import useScrollReveal from '@/hooks/useScrollReveal'

export default function Realisations() {
  const { t } = useTranslation()
  const ref = useScrollReveal()

  const project = t('realisations.project', { returnObjects: true }) || {}

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
          subtitle={t('realisations.subtitle')}
          className="text-center"
        />

        <article className="max-w-5xl mx-auto bg-white rounded-2xl border border-navy/[0.08] card-elevated overflow-hidden grid grid-cols-1 lg:grid-cols-2">
          <div className="aspect-[16/10] lg:aspect-auto bg-navy/[0.03] border-b lg:border-b-0 lg:border-r border-navy/[0.06]">
            <img
              src={project.image}
              alt={project.title}
              className="w-full h-full object-contain"
              loading="lazy"
            />
          </div>
          <div className="p-7 sm:p-9 flex flex-col justify-center">
            <h3 className="font-heading font-bold text-navy text-2xl tracking-tight mb-4">
              {project.title}
            </h3>
            <p className="text-navy text-[16px] leading-relaxed mb-5">
              {project.description}
            </p>
            <p className="text-muted text-[14px] leading-relaxed mb-7">
              {project.professional_description}
            </p>
            <Link
              to={project.link}
              className="inline-flex self-start items-center gap-1.5 bg-accent text-white font-heading font-semibold text-[14px] px-5 py-3 rounded-full hover:bg-accent/90 transition-colors duration-200"
            >
              {project.cta}
              <ArrowUpRight size={16} strokeWidth={2} aria-hidden="true" />
            </Link>
          </div>
        </article>
      </div>
    </section>
  )
}
