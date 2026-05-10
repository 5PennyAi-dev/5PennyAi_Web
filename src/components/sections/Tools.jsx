import { useTranslation } from 'react-i18next'
import SectionHeader from '@/components/ui/SectionHeader'
import useScrollReveal from '@/hooks/useScrollReveal'

export default function Tools() {
  const { t } = useTranslation()
  const ref = useScrollReveal()

  const groups = t('tools.groups', { returnObjects: true }) || []

  return (
    <section id="tools" ref={ref} className="reveal py-24 md:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <SectionHeader
          overline={t('tools.overline')}
          title={t('tools.title')}
          subtitle={t('tools.subtitle')}
          className="text-center"
        />

        <div className="max-w-4xl mx-auto space-y-8">
          {groups.map((group, i) => (
            <div key={i} className="text-center">
              <h3 className="font-heading font-semibold text-navy/55 text-[11px] uppercase tracking-[0.18em] mb-4">
                {group.label}
              </h3>
              <div className="flex flex-wrap justify-center gap-2.5">
                {group.items.map((item, j) => (
                  <span
                    key={j}
                    className="bg-white border border-navy/10 text-navy/80 text-[13px] font-medium px-4 py-2 rounded-full hover:border-steel/40 hover:text-navy transition-colors duration-200"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
