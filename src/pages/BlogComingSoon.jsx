import { Helmet } from 'react-helmet-async'
import { useTranslation } from 'react-i18next'
import Button from '@/components/ui/Button'

export default function BlogComingSoon() {
  const { t } = useTranslation()

  return (
    <>
      <Helmet>
        <title>{t('blog_coming_soon.seo.title')}</title>
        <meta name="description" content={t('blog_coming_soon.seo.description')} />
        <meta name="robots" content="noindex, follow" />
      </Helmet>

      <section
        className="relative overflow-hidden bg-grain pt-36 pb-24 md:pt-44 md:pb-32"
        style={{
          backgroundColor: '#0D2240',
          backgroundImage:
            'radial-gradient(ellipse 70% 90% at 80% 0%, rgba(221,135,55,0.16), transparent 60%), ' +
            'radial-gradient(ellipse 70% 90% at 15% 100%, rgba(129,174,215,0.18), transparent 60%), ' +
            'radial-gradient(ellipse 100% 100% at 50% 50%, #143054 0%, #0D2240 80%)',
        }}
      >
        <div className="absolute inset-0 bg-dot-grid-dark opacity-30 pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-accent uppercase tracking-[0.2em] text-[11px] font-bold mb-6">
            {t('blog_coming_soon.eyebrow')}
          </p>
          <h1 className="text-display text-[2.5rem] md:text-[3.5rem] font-bold leading-[1.08] text-white">
            {t('blog_coming_soon.title')}
          </h1>
          <div className="mt-8 max-w-2xl mx-auto space-y-4 text-white/70 text-base md:text-lg leading-relaxed">
            <p>{t('blog_coming_soon.description')}</p>
            <p>{t('blog_coming_soon.additional_text')}</p>
          </div>
          <div className="mt-10 flex flex-col sm:flex-row justify-center gap-3">
            <Button to="/about">{t('blog_coming_soon.cta_primary')}</Button>
            <Button to="/portfolio/pennyseo" variant="ghost">
              {t('blog_coming_soon.cta_secondary')}
            </Button>
          </div>
        </div>
      </section>
    </>
  )
}
