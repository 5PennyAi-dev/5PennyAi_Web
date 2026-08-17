import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import useScrollReveal from '@/hooks/useScrollReveal'

export default function HomeBehind() {
  const { t } = useTranslation()
  const ref = useScrollReveal()

  return (
    <section ref={ref} className="reveal bg-warm-gray py-16 sm:py-20" aria-labelledby="home-behind-title">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid items-center gap-7 md:grid-cols-12 md:gap-10">
          <div className="md:col-span-3">
            <img
              src="/images/portrait_Christian.jpeg"
              alt={t('homeBehind.portraitAlt')}
              className="h-28 w-28 rounded-2xl border-2 border-steel/50 object-cover shadow-[var(--shadow-card)] sm:h-32 sm:w-32"
            />
          </div>
          <div className="md:col-span-8">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-accent-deep">{t('homeBehind.eyebrow')}</p>
            <h2 id="home-behind-title" className="mt-3 font-heading text-2xl font-bold tracking-tight text-navy sm:text-3xl">{t('homeBehind.title')}</h2>
            <p className="mt-4 max-w-3xl text-sm leading-relaxed text-navy/70 sm:text-base">{t('homeBehind.description')}</p>
            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3">
              <Link to="/about" className="inline-flex min-h-11 items-center gap-1.5 text-sm font-bold text-accent-deep transition-colors hover:text-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-4">
                {t('homeBehind.about')} <ArrowRight size={16} aria-hidden="true" />
              </Link>
              <Link to="/portfolio" className="inline-flex min-h-11 items-center gap-1.5 text-sm font-bold text-accent-deep transition-colors hover:text-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-4">
                {t('homeBehind.projects')} <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
