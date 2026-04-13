import { useTranslation } from 'react-i18next'
import Button from '@/components/ui/Button'
import BookingButton from '@/components/ui/BookingButton'
import ShaderBackground from '@/components/ui/ShaderBackground'
import useScrollReveal from '@/hooks/useScrollReveal'

export default function Hero() {
  const { t } = useTranslation()
  const ref = useScrollReveal()

  return (
    <section
      id="hero"
      ref={ref}
      className="reveal relative min-h-screen flex items-center justify-center overflow-hidden bg-grain"
      style={{
        backgroundColor: '#0D2240',
        backgroundImage:
          'radial-gradient(ellipse 80% 60% at 70% 20%, rgba(221,135,55,0.18), transparent 60%), ' +
          'radial-gradient(ellipse 70% 60% at 20% 80%, rgba(129,174,215,0.22), transparent 60%), ' +
          'radial-gradient(ellipse 100% 100% at 50% 50%, #143054 0%, #0D2240 70%)',
      }}
    >
      {/* Plasma shader — atmospheric base layer */}
      <ShaderBackground />

      {/* Dot grid texture */}
      <div className="absolute inset-0 bg-dot-grid-dark opacity-40 pointer-events-none" />

      {/* Network node pattern — subtle conceptual reference to AI */}
      <svg
        className="absolute inset-0 w-full h-full opacity-[0.05] pointer-events-none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <pattern id="nodes" x="0" y="0" width="180" height="180" patternUnits="userSpaceOnUse">
            <circle cx="10" cy="10" r="1.5" fill="white" />
            <circle cx="90" cy="70" r="1" fill="white" />
            <circle cx="170" cy="20" r="1.5" fill="white" />
            <circle cx="40" cy="130" r="1" fill="white" />
            <circle cx="130" cy="160" r="1.5" fill="white" />
            <line x1="10" y1="10" x2="90" y2="70" stroke="white" strokeWidth="0.4" />
            <line x1="90" y1="70" x2="170" y2="20" stroke="white" strokeWidth="0.4" />
            <line x1="90" y1="70" x2="40" y2="130" stroke="white" strokeWidth="0.4" />
            <line x1="40" y1="130" x2="130" y2="160" stroke="white" strokeWidth="0.4" />
            <line x1="130" y1="160" x2="170" y2="20" stroke="white" strokeWidth="0.4" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#nodes)" />
      </svg>

      {/* Top fade for navbar legibility */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/30 to-transparent pointer-events-none" />

      {/* Bottom fade transition into next section */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-b from-transparent to-black/20 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-36 pb-24 md:pt-40 md:pb-32 z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left — text content */}
          <div className="text-center lg:text-left reveal-left">
            {/* Pill badge overline */}
            <div className="inline-flex items-center gap-2 bg-white/[0.06] border border-white/[0.12] rounded-full px-4 py-1.5 mb-8 backdrop-blur-md">
              <span className="w-1.5 h-1.5 rounded-full bg-accent shadow-[0_0_8px_rgba(221,135,55,0.6)]" />
              <span className="text-white/75 uppercase tracking-[0.2em] text-[11px] font-semibold">
                {t('hero.overline')}
              </span>
            </div>

            {/* Display title */}
            <h1 className="text-display text-[2.5rem] sm:text-[3rem] md:text-[3.5rem] lg:text-[3.75rem] font-bold text-white mb-6">
              {t('hero.title_before')}
              <span className="text-accent">{t('hero.title_highlight')}</span>
              {t('hero.title_after')}
            </h1>

            <p className="text-white/65 text-lg md:text-xl max-w-xl mx-auto lg:mx-0 mb-10 leading-[1.6]">
              {t('hero.subtitle')}
            </p>

            <div className="flex flex-col sm:flex-row items-center lg:justify-start justify-center gap-3">
              <BookingButton variant="primary" className="px-8 py-3.5 text-[15px]">
                {t('hero.cta_primary')}
              </BookingButton>
              <Button to="/portfolio" variant="ghost" className="px-8 py-3.5 text-[15px]">
                {t('hero.cta_secondary')}
              </Button>
            </div>

            {/* Metrics */}
            <div className="mt-12 flex flex-col sm:flex-row items-center lg:justify-start justify-center gap-8 sm:gap-0 reveal-metrics">
              {(t('hero.metrics', { returnObjects: true }) || []).map((m, i, arr) => (
                <div key={i} className="flex items-center">
                  <div className="text-center lg:text-left px-6 first:pl-0">
                    <div className="text-white font-bold text-[1.75rem] md:text-[2rem] leading-none tracking-tight tnum">
                      {m.value}
                    </div>
                    <div className="text-white/55 text-[12px] mt-1.5 leading-snug">
                      {m.label}
                    </div>
                  </div>
                  {i < arr.length - 1 && (
                    <div className="hidden sm:block w-px h-10 bg-white/20" aria-hidden="true" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Right — PennySEO mockup */}
          <div className="flex justify-center lg:justify-end reveal-right">
            <div
              className="relative w-full max-w-lg lg:max-w-none"
              style={{
                perspective: '1200px',
              }}
            >
              <div
                className="rounded-xl overflow-hidden border border-white/[0.08] bg-white/[0.03]"
                style={{
                  transform: 'rotateY(-5deg)',
                  boxShadow: '0 24px 80px rgba(0, 0, 0, 0.35), 0 8px 32px rgba(0, 0, 0, 0.2)',
                }}
              >
                {/* Browser chrome dots */}
                <div className="flex items-center gap-1.5 px-4 py-2.5 bg-white/[0.04] border-b border-white/[0.06]">
                  <span className="w-2.5 h-2.5 rounded-full bg-white/15" />
                  <span className="w-2.5 h-2.5 rounded-full bg-white/15" />
                  <span className="w-2.5 h-2.5 rounded-full bg-white/15" />
                  <span className="ml-3 h-5 flex-1 max-w-[200px] rounded-full bg-white/[0.06]" />
                </div>
                <img
                  src="/images/portfolio/dashboard-full.png"
                  alt="PennySEO Dashboard"
                  className="w-full block"
                  loading="eager"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
