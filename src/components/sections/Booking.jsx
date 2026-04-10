import { useTranslation } from 'react-i18next'
import { Calendar } from 'lucide-react'
import SectionHeader from '@/components/ui/SectionHeader'
import useScrollReveal from '@/hooks/useScrollReveal'

export default function Booking() {
  const { t } = useTranslation()
  const ref = useScrollReveal()

  return (
    <section id="booking" ref={ref} className="reveal py-24 md:py-32 bg-warm-gray relative overflow-hidden">
      <div className="absolute inset-0 bg-dot-grid opacity-40 pointer-events-none" />

      <div className="relative max-w-3xl mx-auto px-4 sm:px-6">
        <SectionHeader
          overline={t('booking.overline')}
          title={t('booking.title')}
          className="text-center"
        />
        <div className="bg-white rounded-3xl border border-navy/[0.08] card-elevated p-10 md:p-14 text-center">
          <div className="w-14 h-14 rounded-2xl bg-accent/12 ring-1 ring-accent/20 flex items-center justify-center mx-auto mb-5">
            <Calendar size={24} className="text-accent" strokeWidth={1.8} />
          </div>
          <p className="text-muted text-[14px] leading-relaxed max-w-md mx-auto">
            {t('booking.placeholder')}
          </p>
        </div>
      </div>
    </section>
  )
}
