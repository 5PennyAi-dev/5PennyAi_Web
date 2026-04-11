import { useTranslation } from 'react-i18next'
import Cal from '@calcom/embed-react'
import SectionHeader from '@/components/ui/SectionHeader'
import useScrollReveal from '@/hooks/useScrollReveal'
import { CAL_LINK } from '@/lib/cal'

export default function Booking() {
  const { t } = useTranslation()
  const ref = useScrollReveal()

  return (
    <section id="booking" ref={ref} className="reveal py-24 md:py-32 bg-warm-gray relative overflow-hidden">
      <div className="absolute inset-0 bg-dot-grid opacity-40 pointer-events-none" />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6">
        <SectionHeader
          overline={t('booking.overline')}
          title={t('booking.title')}
          className="text-center"
        />
        <div className="bg-white rounded-3xl border border-navy/[0.08] overflow-hidden shadow-[var(--shadow-card)] min-h-[680px]">
          <Cal
            calLink={CAL_LINK}
            config={{ layout: 'month_view', theme: 'light' }}
            style={{ width: '100%', height: '100%', minHeight: '680px', overflow: 'scroll' }}
          />
        </div>
      </div>
    </section>
  )
}
