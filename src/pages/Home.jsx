import { Helmet } from 'react-helmet-async'
import { useTranslation } from 'react-i18next'
import Hero from '@/components/sections/Hero'
import PragmaticApproach from '@/components/sections/PragmaticApproach'
import Tools from '@/components/sections/Tools'
import CareerSummary from '@/components/sections/CareerSummary'
import Realisations from '@/components/sections/Realisations'
import HomeContact from '@/components/sections/HomeContact'
import { buildDefaultSocialImageUrl, buildSiteUrl } from '@/lib/siteConfig'

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
        <meta property="og:site_name" content="Christian Couillard" />
        <meta property="og:url" content={buildSiteUrl('/')} />
        <meta property="og:image" content={buildDefaultSocialImageUrl()} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="Christian Couillard - AI Solutions Engineer" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={t('seo.home.title')} />
        <meta name="twitter:description" content={t('seo.home.description')} />
        <meta name="twitter:image" content={buildDefaultSocialImageUrl()} />
        <meta name="twitter:image:alt" content="Christian Couillard - AI Solutions Engineer" />
      </Helmet>
      <Hero />
      <PragmaticApproach />
      <Tools />
      <CareerSummary />
      <Realisations />
      <HomeContact />
    </>
  )
}
