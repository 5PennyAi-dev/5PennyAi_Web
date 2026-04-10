import { useTranslation } from 'react-i18next'
import { Zap, Brain, DollarSign } from 'lucide-react'
import SectionHeader from '@/components/ui/SectionHeader'
import useScrollReveal from '@/hooks/useScrollReveal'

const icons = [Zap, Brain, DollarSign]
const iconColors = [
  { bg: 'bg-accent/12', text: 'text-accent' },
  { bg: 'bg-steel/12', text: 'text-steel' },
  { bg: 'bg-accent/12', text: 'text-accent' },
]

export default function Benefits() {
  const { t } = useTranslation()
  const ref = useScrollReveal()

  const items = t('benefits.items', { returnObjects: true }) || []

  return (
    <section id="benefits" ref={ref} className="reveal py-24 md:py-32 bg-warm-gray relative overflow-hidden">
      <div className="absolute inset-0 bg-dot-grid opacity-40 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
        <SectionHeader
          overline={t('benefits.overline')}
          title={t('benefits.title')}
          className="text-center"
        />
        <div className="grid md:grid-cols-3 gap-8 md:gap-10 max-w-5xl mx-auto stagger-children">
          {items.map((item, i) => {
            const Icon = icons[i]
            const colors = iconColors[i]
            return (
              <div key={i} className="text-center px-2">
                <div className={`w-14 h-14 rounded-2xl ${colors.bg} flex items-center justify-center mx-auto mb-5`}>
                  <Icon size={26} className={colors.text} strokeWidth={1.8} />
                </div>
                <h3 className="font-heading font-bold text-navy text-[18px] mb-3 tracking-tight">
                  {item.title}
                </h3>
                <p className="text-muted text-[14px] leading-relaxed max-w-[28ch] mx-auto">
                  {item.description}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
