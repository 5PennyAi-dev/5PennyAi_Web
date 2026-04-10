import { Helmet } from 'react-helmet-async'
import { useTranslation } from 'react-i18next'
import Hero from '@/components/sections/Hero'
import Comparison from '@/components/sections/Comparison'
import Services from '@/components/sections/Services'
import Benefits from '@/components/sections/Benefits'
import Process from '@/components/sections/Process'
import CaseStudy from '@/components/sections/CaseStudy'
import FAQ from '@/components/sections/FAQ'
import CTABlock from '@/components/sections/CTABlock'
import Booking from '@/components/sections/Booking'

export default function Home() {
  const { t } = useTranslation()

  return (
    <>
      <Helmet>
        <title>{t('seo.home.title')}</title>
        <meta name="description" content={t('seo.home.description')} />
        <meta property="og:title" content={t('seo.home.title')} />
        <meta property="og:description" content={t('seo.home.description')} />
        <meta property="og:type" content="website" />
      </Helmet>
      <Hero />
      <Comparison />
      <Services />
      <Benefits />
      <Process />
      <CaseStudy />
      <FAQ />
      <CTABlock />
      <Booking />
    </>
  )
}
