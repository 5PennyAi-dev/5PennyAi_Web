import { useTranslation } from 'react-i18next'
import { ClipboardList, Code2, Bot } from 'lucide-react'
import SectionHeader from '@/components/ui/SectionHeader'
import useScrollReveal from '@/hooks/useScrollReveal'

const icons = [ClipboardList, Code2, Bot]

export default function Tools() {
  const { t } = useTranslation()
  const ref = useScrollReveal()

  const items = t('tools.items', { returnObjects: true }) || []
  const technologies = t('tools.technologies', { returnObjects: true }) || []

  return (
    <section id="tools" ref={ref} className="reveal py-24 md:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <SectionHeader
          overline={t('tools.overline')}
          title={t('tools.title')}
          subtitle={t('tools.subtitle')}
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

        <div className="max-w-4xl mx-auto mt-12 text-center">
          <h3 className="font-heading font-semibold text-navy/55 text-[11px] uppercase tracking-[0.18em] mb-4">
            {t('tools.technologies_label')}
          </h3>
          <div className="flex flex-wrap justify-center gap-2.5">
            {technologies.map((technology) => (
              <span
                key={technology}
                className="bg-white border border-navy/10 text-navy/80 text-[13px] font-medium px-4 py-2 rounded-full"
              >
                {technology}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
