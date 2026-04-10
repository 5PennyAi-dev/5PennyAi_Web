import { useTranslation } from 'react-i18next'
import { X, Check } from 'lucide-react'
import SectionHeader from '@/components/ui/SectionHeader'
import useScrollReveal from '@/hooks/useScrollReveal'

export default function Comparison() {
  const { t } = useTranslation()
  const ref = useScrollReveal()

  const oldItems = t('comparison.old_way.items', { returnObjects: true }) || []
  const newItems = t('comparison.new_way.items', { returnObjects: true }) || []

  return (
    <section id="comparison" ref={ref} className="reveal py-24 md:py-32 bg-warm-gray relative overflow-hidden">
      {/* Subtle dot grid background */}
      <div className="absolute inset-0 bg-dot-grid opacity-50 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
        <SectionHeader
          overline={t('comparison.overline')}
          title={t('comparison.title')}
          className="text-center"
        />
        <div className="grid md:grid-cols-2 gap-5 max-w-5xl mx-auto">
          {/* Old way — neutral, recessed */}
          <div className="bg-white rounded-3xl p-8 md:p-9 border border-navy/[0.08] card-elevated">
            <div className="flex items-center gap-2 mb-7">
              <span className="w-1.5 h-1.5 rounded-full bg-navy/30" />
              <h3 className="font-heading font-semibold text-navy/55 text-[12px] uppercase tracking-[0.16em]">
                {t('comparison.old_way.title')}
              </h3>
            </div>
            <ul className="space-y-4">
              {oldItems.map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-navy/[0.06] flex items-center justify-center shrink-0 mt-0.5">
                    <X size={12} className="text-navy/40" strokeWidth={2.5} />
                  </div>
                  <span className="text-muted/80 text-[14px] leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* New way — dark, elevated, accent */}
          <div
            className="rounded-3xl p-8 md:p-9 ring-inner-highlight border border-accent/30 relative overflow-hidden"
            style={{
              backgroundColor: '#0D2240',
              backgroundImage:
                'radial-gradient(ellipse 60% 80% at 100% 0%, rgba(221,135,55,0.12), transparent 60%)',
            }}
          >
            <div className="flex items-center gap-2 mb-7">
              <span className="w-1.5 h-1.5 rounded-full bg-accent shadow-[0_0_8px_rgba(221,135,55,0.6)]" />
              <h3 className="font-heading font-semibold text-accent text-[12px] uppercase tracking-[0.16em]">
                {t('comparison.new_way.title')}
              </h3>
            </div>
            <ul className="space-y-4">
              {newItems.map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center shrink-0 mt-0.5">
                    <Check size={12} className="text-accent" strokeWidth={3} />
                  </div>
                  <span className="text-white/85 text-[14px] leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
