import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { Bot, Plug, MessageSquare, Search, ArrowUpRight } from 'lucide-react'
import SectionHeader from '@/components/ui/SectionHeader'
import useScrollReveal from '@/hooks/useScrollReveal'

const icons = [Bot, Plug, MessageSquare, Search]
const iconColors = [
  { bg: 'bg-steel/12', text: 'text-steel' },
  { bg: 'bg-accent/12', text: 'text-accent' },
  { bg: 'bg-steel/12', text: 'text-steel' },
  { bg: 'bg-accent/12', text: 'text-accent' },
]

export default function Services() {
  const { t } = useTranslation()
  const ref = useScrollReveal()

  const items = t('services.items', { returnObjects: true }) || []

  return (
    <section id="services" ref={ref} className="reveal py-24 md:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <SectionHeader
          overline={t('services.overline')}
          title={t('services.title')}
          className="text-center"
        />
        <div className="grid md:grid-cols-2 gap-4 max-w-4xl mx-auto stagger-children">
          {items.map((item, i) => {
            const Icon = icons[i]
            const colors = iconColors[i]
            return (
              <Link
                key={i}
                to="/services"
                className="group relative bg-white rounded-3xl p-8 border border-navy/[0.08] flex flex-col items-start card-elevated hover:border-steel/40 hover:-translate-y-0.5"
              >
                <div className={`w-12 h-12 rounded-xl ${colors.bg} flex items-center justify-center mb-6`}>
                  <Icon size={22} className={colors.text} strokeWidth={1.8} />
                </div>
                <h3 className="font-heading font-bold text-navy text-[16px] mb-2 tracking-tight">
                  {item.title}
                </h3>
                <p className="text-muted text-[14px] leading-relaxed">
                  {item.description}
                </p>
                <ArrowUpRight
                  size={16}
                  strokeWidth={2}
                  className="absolute top-8 right-8 text-navy/20 group-hover:text-accent group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-300"
                />
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
