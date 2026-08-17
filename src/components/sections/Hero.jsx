import { useState } from 'react'
import { ArrowRight, Search } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Button from '@/components/ui/Button'
import { ResourcePreview } from '@/components/resources/ResourceCard'
import {
  buildHeroSearchDestination,
  selectHeroResources,
} from '@/lib/homepageCuration'

const SERIES_DIRECTORY_PATH = '/ressources-ia?vue=series'

export default function Hero({ catalog }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const resources = selectHeroResources(catalog?.resources)
  const starterSeries = catalog?.starterSeries || null

  const starterPath = starterSeries
    ? `/ressources-ia/series/${starterSeries.slug}`
    : SERIES_DIRECTORY_PATH

  const onSubmit = (event) => {
    event.preventDefault()
    navigate(buildHeroSearchDestination(query))
  }

  return (
    <section
      id="hero"
      className="relative overflow-hidden bg-warm-gray pt-[68px]"
      aria-labelledby="home-hero-title"
    >
      <div className="pointer-events-none absolute inset-0 bg-dot-grid opacity-30" aria-hidden="true" />
      <div className="relative mx-auto grid min-h-[650px] max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.95fr)] lg:gap-16 lg:py-24">
        <div className="max-w-2xl">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-accent-deep sm:text-xs">
            {t('hero.overline')}
          </p>
          <h1
            id="home-hero-title"
            className="mt-5 max-w-[13ch] text-display text-[2.5rem] font-bold leading-[0.98] text-navy sm:text-5xl lg:text-6xl"
          >
            {t('hero.title')}
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-navy/70 sm:text-lg">
            {t('hero.description')}
          </p>

          <form className="mt-8 max-w-xl" onSubmit={onSubmit} role="search">
            <label htmlFor="hero-search" className="sr-only">
              {t('hero.searchLabel')}
            </label>
            <div className="flex items-center gap-2 rounded-2xl border border-navy/15 bg-white p-2 shadow-[var(--shadow-card)] focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/25">
              <Search className="ml-2 shrink-0 text-navy/45" size={19} aria-hidden="true" />
              <input
                id="hero-search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={t('hero.searchPlaceholder')}
                className="min-w-0 flex-1 bg-transparent px-1 py-2.5 text-sm text-navy placeholder:text-navy/45 focus:outline-none sm:text-base"
              />
              <button
                type="submit"
                className="shrink-0 rounded-xl bg-navy px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-navy-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 sm:px-5"
              >
                {t('hero.searchSubmit')}
              </button>
            </div>
          </form>

          <div className="mt-6 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
            <Button to="/ressources-ia" variant="primary" className="px-6 py-3.5 text-[15px]">
              {t('hero.cta_primary')}
            </Button>
            <Link
              to={starterPath}
              className="inline-flex items-center justify-center gap-1.5 rounded-full px-4 py-3 text-sm font-bold text-navy/70 transition-colors hover:text-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
            >
              {starterSeries ? t('hero.cta_secondary') : t('hero.cta_seriesFallback')}
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
        </div>

        {resources.length > 0 && (
          <div className="relative mx-auto h-[245px] w-full max-w-xl sm:h-[320px] lg:h-[360px]" aria-label={t('hero.visualsLabel')}>
            {resources.map((resource, index) => (
              <Link
                key={`${resource.contentType}:${resource.id}`}
                to={resource.publicUrl}
                aria-label={t('hero.visualLinkLabel', { title: resource.title })}
                className={`group absolute block aspect-video w-[78%] overflow-hidden rounded-2xl border border-navy/10 bg-white shadow-[var(--shadow-card-hover)] transition-transform duration-200 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-4 ${
                  index === 0
                    ? 'left-0 top-0 -rotate-2 group-hover:-translate-y-1 sm:left-[4%]'
                    : 'bottom-0 right-0 rotate-2 group-hover:translate-y-1 sm:right-[2%]'
                }`}
              >
                <ResourcePreview
                  contentType={resource.contentType}
                  sources={resource.thumbnailSources}
                  t={t}
                  loading="eager"
                  fetchPriority={index === 0 ? 'high' : 'auto'}
                />
                <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy/75 to-transparent px-4 pb-3 pt-10 text-sm font-bold text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100 motion-reduce:transition-none">
                  {resource.title}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
