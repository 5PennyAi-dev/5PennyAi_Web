import { useTranslation } from 'react-i18next'
import BookingButton from '@/components/ui/BookingButton'
import useScrollReveal from '@/hooks/useScrollReveal'

export default function CTABlock() {
  const { t } = useTranslation()
  const ref = useScrollReveal()

  return (
    <section
      id="cta"
      ref={ref}
      className="reveal relative py-24 md:py-32 overflow-hidden bg-grain"
      style={{
        backgroundColor: '#0D2240',
        backgroundImage:
          'radial-gradient(ellipse 60% 80% at 80% 0%, rgba(221,135,55,0.16), transparent 60%), ' +
          'radial-gradient(ellipse 60% 80% at 20% 100%, rgba(129,174,215,0.18), transparent 60%), ' +
          'radial-gradient(ellipse 100% 100% at 50% 50%, #143054 0%, #0D2240 80%)',
      }}
    >
      {/* Dot grid texture */}
      <div className="absolute inset-0 bg-dot-grid-dark opacity-30 pointer-events-none" />

      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 text-center z-10">
        <div className="inline-flex items-center gap-2 bg-white/[0.06] border border-white/[0.14] rounded-full px-4 py-1.5 mb-6 backdrop-blur-md">
          <span className="w-1.5 h-1.5 rounded-full bg-accent shadow-[0_0_8px_rgba(221,135,55,0.6)]" />
          <span className="text-white/70 uppercase tracking-[0.2em] text-[11px] font-bold">
            Contact
          </span>
        </div>
        <h2 className="text-display text-[2.25rem] md:text-[3rem] lg:text-[3.5rem] font-bold text-white mb-6">
          {t('cta_block.title')}
        </h2>
        <p className="text-white/65 text-base md:text-lg mb-10 max-w-xl mx-auto leading-relaxed">
          {t('cta_block.subtitle')}
        </p>
        <BookingButton variant="primary" className="px-8 py-3.5 text-[15px]">
          {t('cta_block.cta')}
        </BookingButton>
      </div>
    </section>
  )
}
