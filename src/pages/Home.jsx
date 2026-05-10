import { Helmet } from 'react-helmet-async'
import { useTranslation } from 'react-i18next'
import Hero from '@/components/sections/Hero'
import Realisations from '@/components/sections/Realisations'
import Tools from '@/components/sections/Tools'
import LatestPosts from '@/components/sections/LatestPosts'
import HomeContact from '@/components/sections/HomeContact'

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
        <meta property="og:url" content="https://5pennyai.com" />
        <meta property="og:image" content="https://5pennyai.com/images/og-christian.jpg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="Christian Couillard - AI Solutions Engineer" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={t('seo.home.title')} />
        <meta name="twitter:description" content={t('seo.home.description')} />
        <meta name="twitter:image" content="https://5pennyai.com/images/og-christian.jpg" />
        <meta name="twitter:image:alt" content="Christian Couillard - AI Solutions Engineer" />
      </Helmet>
      <Hero />
      <Realisations />
      <Tools />
      <LatestPosts />
      <HomeContact />
    </>
  )
}
