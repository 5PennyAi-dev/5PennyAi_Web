import { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useTranslation } from 'react-i18next'
import Hero from '@/components/sections/Hero'
import HomeStartHere from '@/components/sections/HomeStartHere'
import HomeRecommendedSeries from '@/components/sections/HomeRecommendedSeries'
import HomeTopics from '@/components/sections/HomeTopics'
import HomeSeries from '@/components/sections/HomeSeries'
import HomeDiscover from '@/components/sections/HomeDiscover'
import HomeBehind from '@/components/sections/HomeBehind'
import { buildDefaultSocialImageUrl, buildSiteUrl } from '@/lib/siteConfig'
import { fetchPublishedCatalog } from '@/lib/publicInfographics'
import { resolveStarterSeries, selectHeroResources } from '@/lib/homepageCuration'

export default function Home() {
  const { t } = useTranslation()
  const [catalogState, setCatalogState] = useState({ status: 'loading', catalog: null })

  useEffect(() => {
    let cancelled = false

    fetchPublishedCatalog()
      .then((catalog) => {
        if (cancelled) return
        const heroResources = selectHeroResources(catalog.resources)
        setCatalogState({
          status: 'ready',
          catalog: {
            ...catalog,
            heroResources,
            starterSeries: resolveStarterSeries(catalog.series),
          },
        })
      })
      .catch(() => {
        if (!cancelled) setCatalogState({ status: 'error', catalog: null })
      })

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <>
      <Helmet>
        <title>{t('seo.home.title')}</title>
        <meta name="description" content={t('seo.home.description')} />
        <link rel="canonical" href={buildSiteUrl('/')} />
        <meta property="og:title" content={t('seo.home.title')} />
        <meta property="og:description" content={t('seo.home.description')} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="5PennyAi" />
        <meta property="og:url" content={buildSiteUrl('/')} />
        <meta property="og:image" content={buildDefaultSocialImageUrl()} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content={t('seo.home.socialImageAlt')} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={t('seo.home.title')} />
        <meta name="twitter:description" content={t('seo.home.description')} />
        <meta name="twitter:image" content={buildDefaultSocialImageUrl()} />
        <meta name="twitter:image:alt" content={t('seo.home.socialImageAlt')} />
      </Helmet>
      <Hero catalog={catalogState.catalog} />
      <HomeStartHere starterSeries={catalogState.catalog?.starterSeries} />
      <HomeRecommendedSeries
        series={catalogState.catalog?.starterSeries}
        status={catalogState.status}
      />
      <HomeTopics resources={catalogState.catalog?.resources} status={catalogState.status} />
      <HomeSeries series={catalogState.catalog?.series} status={catalogState.status} />
      <HomeDiscover
        resources={catalogState.catalog?.resources}
        excludedResources={catalogState.catalog?.heroResources}
        status={catalogState.status}
      />
      <HomeBehind />
    </>
  )
}
