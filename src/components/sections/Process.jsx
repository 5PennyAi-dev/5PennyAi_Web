import { useTranslation } from 'react-i18next'
import SectionHeader from '@/components/ui/SectionHeader'
import useScrollReveal from '@/hooks/useScrollReveal'

export default function Process() {
  const { t } = useTranslation()
  const ref = useScrollReveal()

  const steps = t('process.steps', { returnObjects: true }) || []

  return (
    <section id="process" ref={ref} className="reveal py-24 md:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <SectionHeader
          overline={t('process.overline')}
          title={t('process.title')}
          className="text-center"
        />
        <div className="grid md:grid-cols-3 gap-10 max-w-5xl mx-auto relative">
          {/* Connector line */}
          <div
            className="hidden md:block absolute top-7 left-[16%] right-[16%] h-px bg-gradient-to-r from-transparent via-navy/15 to-transparent"
            aria-hidden="true"
          />

          {steps.map((step, i) => (
            <div key={i} className="text-center relative">
              <div className="relative w-14 h-14 mx-auto mb-6 z-10">
                <span className="absolute inset-0 rounded-2xl bg-white" aria-hidden="true" />
                <span className="absolute inset-0 rounded-2xl bg-accent/12 ring-1 ring-accent/20" aria-hidden="true" />
                <span className="relative w-full h-full flex items-center justify-center text-accent font-display font-bold text-[18px] tnum">
                  {step.number}
                </span>
              </div>
              <h3 className="font-heading font-bold text-navy text-[18px] mb-2.5 tracking-tight">
                {step.title}
              </h3>
              <p className="text-muted text-[14px] leading-relaxed max-w-[28ch] mx-auto">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
