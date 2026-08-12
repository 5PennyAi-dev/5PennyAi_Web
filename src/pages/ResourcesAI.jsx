import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  ArrowRight,
  BookOpen,
  Image as ImageIcon,
  Layers3,
  RotateCw,
} from 'lucide-react'
import { Helmet } from 'react-helmet-async'
import { Link, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import ResourceCard from '@/components/resources/ResourceCard'
import SeriesArtwork from '@/components/resources/SeriesArtwork'
import { fetchPublishedCatalog } from '@/lib/publicInfographics'
import {
  filterPublicResources,
  getPublicResourceKey,
  normalizeResourceLevel,
  normalizeSearchText,
  normalizeResourceFormat,
  RESOURCE_FORMATS,
} from '@/lib/publicResourceCatalog'
import {
  groupResourcesBySeries,
  selectFeaturedSeries,
} from '@/lib/resourceSeries'
import { findResourceTopic, getAvailableResourceTopics } from '@/lib/resourceTopics'
import { attachSeriesThumbnails } from '@/lib/seriesThumbnails'

const SERIES_PATH = '/ressources-ia/series'

export default function ResourcesAI() {
  const { t } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()
  const [resources, setResources] = useState([])
  const [articles, setArticles] = useState([])
  const [seriesThumbnailRows, setSeriesThumbnailRows] = useState([])
  const [state, setState] = useState('loading')
  const series = useMemo(
    () => attachSeriesThumbnails(groupResourcesBySeries(resources), seriesThumbnailRows),
    [resources, seriesThumbnailRows],
  )
  const isSeriesView = searchParams.get('vue') === 'series'
  const selectedSeriesSlug = isSeriesView ? '' : searchParams.get('serie') || ''
  const rawFormat = searchParams.get('format') || ''
  const rawQuery = searchParams.get('q') || ''
  const rawLevel = searchParams.get('niveau') || ''
  const rawTopic = searchParams.get('sujet') || ''
  const selectedQuery = isSeriesView ? '' : rawQuery
  const selectedLevel = isSeriesView ? '' : normalizeResourceLevel(rawLevel)
  const topics = useMemo(() => getAvailableResourceTopics(resources), [resources])
  const selectedTopic = isSeriesView ? null : findResourceTopic(resources, rawTopic)
  const selectedTopicKey = selectedTopic?.key || ''
  const selectedFormat = isSeriesView
    ? RESOURCE_FORMATS.ALL
    : normalizeResourceFormat(rawFormat, articles.length > 0)
  const selectedSeries = useMemo(
    () => series.find(({ slug }) => slug === selectedSeriesSlug) || null,
    [selectedSeriesSlug, series],
  )
  const featuredSeries = useMemo(() => selectFeaturedSeries(series), [series])
  const visibleResources = filterPublicResources(resources, {
    format: selectedFormat,
    level: selectedLevel,
    query: selectedQuery,
    seriesSlug: selectedSeriesSlug,
    topic: selectedTopicKey,
  })
  const hasActiveResourceFilters = Boolean(normalizeSearchText(selectedQuery))
    || Boolean(selectedLevel)
    || selectedFormat !== RESOURCE_FORMATS.ALL
    || Boolean(selectedSeriesSlug)
    || Boolean(selectedTopicKey)
  const isNeutralResourceView = !isSeriesView && !hasActiveResourceFilters

  const loadInfographics = useCallback(async () => {
    setState('loading')
    try {
      const catalog = await fetchPublishedCatalog()
      setResources(catalog.resources)
      setArticles(catalog.articles)
      setSeriesThumbnailRows(catalog.seriesCovers)
      setState('ready')
    } catch (error) {
      console.error('Unable to load published resources:', error.message)
      setState('error')
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    fetchPublishedCatalog()
      .then((catalog) => {
        if (!cancelled) {
          setResources(catalog.resources)
          setArticles(catalog.articles)
          setSeriesThumbnailRows(catalog.seriesCovers)
          setState('ready')
        }
      })
      .catch((error) => {
        console.error('Unable to load published resources:', error.message)
        if (!cancelled) setState('error')
      })

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (state !== 'ready') return

    const nextParams = new URLSearchParams(searchParams)
    let hasChanges = false
    const removeParameter = (parameter) => {
      if (!nextParams.has(parameter)) return
      nextParams.delete(parameter)
      hasChanges = true
    }

    if (isSeriesView) {
      const resourceViewParameters = ['serie', 'format', 'q', 'niveau', 'sujet']
      resourceViewParameters.forEach(removeParameter)
    } else {
      const isValidFormat = rawFormat === RESOURCE_FORMATS.INFOGRAPHICS
        || (rawFormat === RESOURCE_FORMATS.ARTICLES && articles.length > 0)

      if (rawFormat && !isValidFormat) removeParameter('format')
      if (rawLevel && !normalizeResourceLevel(rawLevel)) removeParameter('niveau')
      if (rawTopic && !selectedTopic) removeParameter('sujet')
    }

    if (hasChanges) setSearchParams(nextParams, { replace: true })
  }, [
    articles.length,
    isSeriesView,
    rawFormat,
    rawLevel,
    rawTopic,
    searchParams,
    selectedTopic,
    setSearchParams,
    state,
  ])

  const showResourcesView = () => {
    const nextParams = new URLSearchParams(searchParams)
    nextParams.delete('vue')
    nextParams.delete('serie')
    setSearchParams(nextParams)
  }

  const showSeriesView = () => {
    const nextParams = new URLSearchParams(searchParams)
    nextParams.set('vue', 'series')
    nextParams.delete('serie')
    nextParams.delete('format')
    nextParams.delete('q')
    nextParams.delete('niveau')
    nextParams.delete('sujet')
    setSearchParams(nextParams)
  }

  const filterBySearch = (query) => {
    const nextParams = new URLSearchParams(searchParams)
    nextParams.delete('vue')
    if (query.trim()) nextParams.set('q', query)
    else nextParams.delete('q')
    setSearchParams(nextParams, { replace: true })
  }

  const filterByLevel = (level) => {
    const nextParams = new URLSearchParams(searchParams)
    nextParams.delete('vue')
    if (normalizeResourceLevel(level)) nextParams.set('niveau', level)
    else nextParams.delete('niveau')
    setSearchParams(nextParams)
  }

  const filterByTopic = (topicKey) => {
    const nextParams = new URLSearchParams(searchParams)
    nextParams.delete('vue')
    if (findResourceTopic(resources, topicKey)) nextParams.set('sujet', topicKey)
    else nextParams.delete('sujet')
    setSearchParams(nextParams)
  }

  const filterByFormat = (format) => {
    const nextParams = new URLSearchParams(searchParams)
    nextParams.delete('vue')
    if (format === RESOURCE_FORMATS.INFOGRAPHICS || format === RESOURCE_FORMATS.ARTICLES) {
      nextParams.set('format', format)
    } else {
      nextParams.delete('format')
    }
    setSearchParams(nextParams)
  }

  const filterBySeries = (slug) => {
    const nextParams = new URLSearchParams(searchParams)
    nextParams.delete('vue')
    if (slug) nextParams.set('serie', slug)
    else nextParams.delete('serie')
    setSearchParams(nextParams)
  }

  const clearResourceFilters = () => {
    const nextParams = new URLSearchParams(searchParams)
    nextParams.delete('vue')
    nextParams.delete('q')
    nextParams.delete('niveau')
    nextParams.delete('sujet')
    nextParams.delete('format')
    nextParams.delete('serie')
    setSearchParams(nextParams)
  }

  const removeResourceFilter = (parameter) => {
    const nextParams = new URLSearchParams(searchParams)
    nextParams.delete(parameter)
    setSearchParams(nextParams)
  }

  return (
    <>
      <Helmet>
        <title>{t('resourcesAi.seo.listTitle')}</title>
        <meta name="description" content={t('resourcesAi.seo.listDescription')} />
      </Helmet>

      <section className="min-h-[75vh] bg-warm-gray pt-28 pb-20 md:pt-36 md:pb-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <header className="mx-auto mb-10 max-w-3xl text-center md:mb-12">
            <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.2em] text-accent">
              {t('resourcesAi.eyebrow')}
            </p>
            <h1 className="text-display text-4xl font-bold text-navy md:text-5xl">
              {t('resourcesAi.title')}
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-muted md:text-lg">
              {t('resourcesAi.subtitle')}
            </p>
          </header>

          {state === 'loading' ? (
            <LoadingGrid t={t} />
          ) : state === 'error' ? (
            <ErrorState onRetry={loadInfographics} t={t} />
          ) : resources.length === 0 ? (
            <EmptyState t={t} />
          ) : (
            <>
              <CatalogControls
                isSeriesView={isSeriesView}
                hasPublishedArticles={articles.length > 0}
                onFilterChange={filterBySeries}
                onFormatChange={filterByFormat}
                onLevelChange={filterByLevel}
                onSearchChange={filterBySearch}
                onTopicChange={filterByTopic}
                onShowResources={showResourcesView}
                onShowSeries={showSeriesView}
                selectedLevel={selectedLevel}
                selectedQuery={selectedQuery}
                selectedTopicKey={selectedTopicKey}
                selectedSeriesSlug={selectedSeriesSlug}
                selectedFormat={selectedFormat}
                series={series}
                topics={topics}
                t={t}
              />

              {!isSeriesView && hasActiveResourceFilters && (
                <ActiveResourceFilters
                  filters={getActiveResourceFilters({
                    query: selectedQuery,
                    format: selectedFormat,
                    level: selectedLevel,
                    topic: selectedTopic,
                    series: selectedSeries,
                    seriesSlug: selectedSeriesSlug,
                    t,
                  })}
                  onClearAll={clearResourceFilters}
                  onRemove={removeResourceFilter}
                  t={t}
                />
              )}

              {isSeriesView ? (
                <SeriesView
                  onShowResources={showResourcesView}
                  series={series}
                  t={t}
                />
              ) : (
                <ResourcesView
                  featuredSeries={isNeutralResourceView ? featuredSeries : null}
                  resources={visibleResources}
                  onClearAll={clearResourceFilters}
                  selectedSeries={selectedSeries}
                  selectedSeriesSlug={selectedSeriesSlug}
                  t={t}
                />
              )}
            </>
          )}
        </div>
      </section>
    </>
  )
}

function CatalogControls({
  hasPublishedArticles,
  isSeriesView,
  onFilterChange,
  onFormatChange,
  onLevelChange,
  onSearchChange,
  onTopicChange,
  onShowResources,
  onShowSeries,
  selectedLevel,
  selectedQuery,
  selectedTopicKey,
  selectedFormat,
  selectedSeriesSlug,
  series,
  topics,
  t,
}) {
  const showSeriesFilter = !isSeriesView && (series.length > 0 || selectedSeriesSlug)

  return (
    <div className="mb-10 flex flex-col gap-5 rounded-2xl border border-navy/[0.08] bg-white/85 p-4 shadow-sm sm:flex-row sm:items-end sm:justify-between sm:p-5">
      <div
        role="group"
        aria-label={t('resourcesAi.catalog.viewControlLabel')}
        className="grid w-full grid-cols-2 rounded-xl bg-navy/[0.055] p-1 sm:w-auto"
      >
        <button
          type="button"
          aria-pressed={!isSeriesView}
          onClick={onShowResources}
          className={`rounded-lg px-4 py-2.5 text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 ${
            !isSeriesView
              ? 'bg-navy text-white shadow-sm'
              : 'text-navy/65 hover:bg-white hover:text-navy'
          }`}
        >
          {t('resourcesAi.catalog.allResources')}
        </button>
        <button
          type="button"
          aria-pressed={isSeriesView}
          onClick={onShowSeries}
          className={`rounded-lg px-4 py-2.5 text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 ${
            isSeriesView
              ? 'bg-navy text-white shadow-sm'
              : 'text-navy/65 hover:bg-white hover:text-navy'
          }`}
        >
          {t('resourcesAi.catalog.series')}
        </button>
      </div>

      {!isSeriesView && (
        <div className="w-full space-y-4 sm:max-w-3xl">
          <SearchFilter onChange={onSearchChange} query={selectedQuery} t={t} />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[minmax(13.5rem,1.25fr)_repeat(3,minmax(9rem,1fr))]">
            {hasPublishedArticles && (
              <FormatFilter onChange={onFormatChange} selectedFormat={selectedFormat} t={t} />
            )}
            <LevelFilter onChange={onLevelChange} selectedLevel={selectedLevel} t={t} />
            <TopicFilter
              onChange={onTopicChange}
              selectedTopicKey={selectedTopicKey}
              topics={topics}
              t={t}
            />
            {showSeriesFilter && (
              <SeriesFilter
                onChange={onFilterChange}
                selectedSeriesSlug={selectedSeriesSlug}
                series={series}
                t={t}
              />
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function SearchFilter({ onChange, query, t }) {
  return (
    <div>
      <label
        htmlFor="resource-search"
        className="mb-1.5 block text-xs font-bold text-navy/70"
      >
        {t('resourcesAi.catalog.searchLabel')}
      </label>
      <input
        id="resource-search"
        type="search"
        value={query}
        onChange={(event) => onChange(event.target.value)}
        placeholder={t('resourcesAi.catalog.searchPlaceholder')}
        className="w-full rounded-xl border border-navy/15 bg-white px-3.5 py-2.5 text-sm font-medium text-navy shadow-sm placeholder:text-navy/40 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25"
      />
    </div>
  )
}

function FormatFilter({ onChange, selectedFormat, t }) {
  const options = [
    [RESOURCE_FORMATS.ALL, t('resourcesAi.catalog.allFormats')],
    [RESOURCE_FORMATS.INFOGRAPHICS, t('resourcesAi.catalog.infographics')],
    [RESOURCE_FORMATS.ARTICLES, t('resourcesAi.catalog.articles')],
  ]

  return (
    <fieldset className="min-w-0">
      <legend className="mb-1.5 text-xs font-bold text-navy/70">
        {t('resourcesAi.catalog.formatFilterLabel')}
      </legend>
      <div
        className="grid grid-cols-[auto_minmax(0,1.45fr)_minmax(0,1fr)] rounded-xl bg-navy/[0.055] p-1"
        role="group"
      >
        {options.map(([value, label]) => (
          <button
            key={value}
            type="button"
            aria-pressed={selectedFormat === value}
            onClick={() => onChange(value)}
            className={`whitespace-nowrap rounded-lg px-1.5 py-2 text-xs font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 ${
              selectedFormat === value
                ? 'bg-navy text-white shadow-sm'
                : 'text-navy/65 hover:bg-white hover:text-navy'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </fieldset>
  )
}

function SeriesFilter({ onChange, selectedSeriesSlug, series, t }) {
  const sortedSeries = [...series].sort((left, right) =>
    left.name.localeCompare(right.name, undefined, { sensitivity: 'base' }),
  )
  const hasUnknownSelection =
    selectedSeriesSlug && !series.some(({ slug }) => slug === selectedSeriesSlug)

  return (
    <div className="w-full sm:max-w-xs">
      <label
        htmlFor="resource-series-filter"
        className="mb-1.5 block text-xs font-bold text-navy/70"
      >
        {t('resourcesAi.catalog.filterLabel')}
      </label>
      <select
        id="resource-series-filter"
        value={selectedSeriesSlug}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-navy/15 bg-white px-3.5 py-2.5 text-sm font-medium text-navy shadow-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25"
      >
        <option value="">{t('resourcesAi.catalog.allSeries')}</option>
        {hasUnknownSelection && (
          <option value={selectedSeriesSlug} disabled>
            {t('resourcesAi.catalog.unknownSeries')}
          </option>
        )}
        {sortedSeries.map(({ name, slug }) => (
          <option key={name} value={slug}>
            {name}
          </option>
        ))}
      </select>
    </div>
  )
}

function LevelFilter({ onChange, selectedLevel, t }) {
  return (
    <div className="w-full">
      <label
        htmlFor="resource-level-filter"
        className="mb-1.5 block text-xs font-bold text-navy/70"
      >
        {t('resourcesAi.catalog.levelFilterLabel')}
      </label>
      <select
        id="resource-level-filter"
        value={selectedLevel}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-navy/15 bg-white px-3.5 py-2.5 text-sm font-medium text-navy shadow-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25"
      >
        <option value="">{t('resourcesAi.catalog.allLevels')}</option>
        {['beginner', 'intermediate', 'advanced'].map((level) => (
          <option key={level} value={level}>
            {t(`resourcesAi.levels.${level}`)}
          </option>
        ))}
      </select>
    </div>
  )
}

function TopicFilter({ onChange, selectedTopicKey, topics, t }) {
  return (
    <div className="w-full">
      <label
        htmlFor="resource-topic-filter"
        className="mb-1.5 block text-xs font-bold text-navy/70"
      >
        {t('resourcesAi.catalog.topicFilterLabel')}
      </label>
      <select
        id="resource-topic-filter"
        value={selectedTopicKey}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-navy/15 bg-white px-3.5 py-2.5 text-sm font-medium text-navy shadow-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25"
      >
        <option value="">{t('resourcesAi.catalog.allTopics')}</option>
        {topics.map((topic) => (
          <option key={topic.key} value={topic.key}>
            {getTopicLabel(topic, t)}
          </option>
        ))}
      </select>
    </div>
  )
}

function ActiveResourceFilters({ filters, onClearAll, onRemove, t }) {
  return (
    <div
      aria-label={t('resourcesAi.catalog.activeFiltersLabel')}
      className="mb-6 flex flex-wrap items-center gap-2"
    >
      {filters.map((filter) => (
        <button
          key={filter.parameter}
          type="button"
          aria-label={filter.removeLabel}
          onClick={() => onRemove(filter.parameter)}
          className="inline-flex min-h-9 items-center gap-2 rounded-full bg-lavender/35 px-3 py-1.5 text-xs font-bold text-navy transition-colors hover:bg-lavender/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
        >
          <span>{filter.label}</span>
          <span aria-hidden="true">×</span>
        </button>
      ))}
      <button
        type="button"
        onClick={onClearAll}
        className="ml-1 text-sm font-bold text-accent-deep underline decoration-accent/35 underline-offset-4 hover:text-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
      >
        {t('resourcesAi.catalog.clearAll')}
      </button>
    </div>
  )
}

function ResourcesView({
  featuredSeries,
  resources,
  onClearAll,
  selectedSeries,
  selectedSeriesSlug,
  t,
}) {
  if (selectedSeriesSlug && !selectedSeries) {
    return <FilteredEmptyState onClearAll={onClearAll} t={t} />
  }

  if (resources.length === 0) {
    return <NoResultsState onClearAll={onClearAll} t={t} />
  }

  return (
    <>
      {featuredSeries && (
        <FeaturedSeries series={featuredSeries} t={t} />
      )}

      <section aria-labelledby="resources-list-title">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 id="resources-list-title" className="font-heading text-2xl font-bold text-navy">
              {selectedSeries?.name || t('resourcesAi.catalog.allResources')}
            </h2>
            <p className="mt-1 text-sm text-muted">
              {t('resourcesAi.catalog.resourceCount', { count: resources.length })}
            </p>
          </div>
        </div>

        <ResourceGrid resources={resources} t={t} />
      </section>
    </>
  )
}

function getActiveResourceFilters({ format, level, query, series, seriesSlug, t, topic }) {
  const filters = []
  if (normalizeSearchText(query)) {
    filters.push({
      parameter: 'q',
      label: t('resourcesAi.catalog.activeSearch', { query }),
      removeLabel: t('resourcesAi.catalog.removeSearch', { query }),
    })
  }
  if (format !== RESOURCE_FORMATS.ALL) {
    const label = t(`resourcesAi.catalog.${format}`)
    filters.push({
      parameter: 'format',
      label,
      removeLabel: t('resourcesAi.catalog.removeFilter', { filter: label }),
    })
  }
  if (level) {
    const label = t(`resourcesAi.levels.${level}`)
    filters.push({
      parameter: 'niveau',
      label,
      removeLabel: t('resourcesAi.catalog.removeFilter', { filter: label }),
    })
  }
  if (topic) {
    const label = getTopicLabel(topic, t)
    filters.push({
      parameter: 'sujet',
      label,
      removeLabel: t('resourcesAi.catalog.removeFilter', { filter: label }),
    })
  }
  if (seriesSlug) {
    const label = series?.name || t('resourcesAi.catalog.unknownSeries')
    filters.push({
      parameter: 'serie',
      label,
      removeLabel: t('resourcesAi.catalog.removeFilter', { filter: label }),
    })
  }
  return filters
}

function getTopicLabel(topic, t) {
  return topic?.labelKey ? t(topic.labelKey) : topic?.label || ''
}

function FeaturedSeries({ series, t }) {
  const firstEpisodeTitle = series.firstEpisode?.title || t('resourcesAi.type')

  return (
    <section aria-labelledby="featured-series-title" className="mb-12">
      <div className="grid overflow-hidden rounded-3xl bg-navy text-white shadow-[var(--shadow-card-hover)] lg:grid-cols-[1.05fr_1fr]">
        <div className="min-w-0 p-6 sm:p-8 lg:p-10">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-accent-light">
            {t('resourcesAi.catalog.featuredSeries')}
          </p>
          <h2
            id="featured-series-title"
            className="mt-3 font-heading text-2xl font-bold leading-tight text-white sm:text-3xl"
          >
            {series.name}
          </h2>
          <div className="mt-5 flex flex-wrap gap-2 text-sm font-semibold text-white/80">
            <span className="rounded-full bg-white/10 px-3 py-1.5">
              {t('resourcesAi.catalog.episodeCount', { count: series.episodeCount })}
            </span>
            {series.commonLevel && (
              <span className="rounded-full bg-white/10 px-3 py-1.5">
                {t(`resourcesAi.levels.${series.commonLevel}`)}
              </span>
            )}
          </div>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            {series.firstEpisode && (
              <Link
                to={series.firstEpisode.publicUrl}
                aria-label={t('resourcesAi.catalog.startSeriesLabel', {
                  series: series.name,
                  title: firstEpisodeTitle,
                })}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-accent px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-accent-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-navy"
              >
                <BookOpen size={16} aria-hidden="true" />
                {t('resourcesAi.catalog.startSeries')}
              </Link>
            )}
            <Link
              to={`${SERIES_PATH}/${series.slug}`}
              aria-label={t('resourcesAi.catalog.viewEpisodesLabel', { series: series.name })}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/25 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-navy"
            >
              {t('resourcesAi.catalog.viewEpisodes')}
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
        </div>

        <div className="min-w-0 bg-white/[0.055] p-5 sm:p-7 lg:p-8">
          <SeriesArtwork series={series} t={t} />
        </div>
      </div>
    </section>
  )
}

function SeriesView({ onShowResources, series, t }) {
  if (series.length === 0) {
    return <NoSeriesState onShowResources={onShowResources} t={t} />
  }

  return (
    <section aria-labelledby="series-list-title">
      <h2 id="series-list-title" className="mb-6 font-heading text-2xl font-bold text-navy">
        {t('resourcesAi.catalog.series')}
      </h2>
      <ul
        aria-label={t('resourcesAi.catalog.seriesListLabel')}
        className="grid gap-7 md:grid-cols-2"
      >
        {series.map((item) => (
          <li key={item.name}>
            <SeriesCard series={item} t={t} />
          </li>
        ))}
      </ul>
    </section>
  )
}

function SeriesCard({ series, t }) {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-3xl border border-navy/[0.1] bg-white shadow-[var(--shadow-card)]">
      <div className="border-b border-navy/[0.06] bg-navy/[0.035] p-4 sm:p-5">
        <SeriesArtwork series={series} t={t} />
      </div>
      <div className="flex flex-1 flex-col p-6 sm:p-7">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-accent">
          {t('resourcesAi.catalog.seriesSingular')}
        </p>
        <h2 className="mt-3 font-heading text-2xl font-bold leading-tight text-navy">
          {series.name}
        </h2>
        <div className="mt-5 flex flex-wrap gap-2 text-sm font-semibold text-navy/65">
          <span className="rounded-full bg-lavender/35 px-3 py-1.5">
            {t('resourcesAi.catalog.episodeCount', { count: series.episodeCount })}
          </span>
          {series.commonLevel && (
            <span className="rounded-full bg-steel/15 px-3 py-1.5">
              {t(`resourcesAi.levels.${series.commonLevel}`)}
            </span>
          )}
        </div>
        <Link
          to={`${SERIES_PATH}/${series.slug}`}
          aria-label={t('resourcesAi.catalog.viewEpisodesLabel', { series: series.name })}
          className="mt-auto inline-flex w-fit items-center gap-2 pt-7 text-sm font-bold text-accent-deep hover:text-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-4"
        >
          {t('resourcesAi.catalog.viewEpisodes')}
          <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </div>
    </article>
  )
}

function ResourceGrid({ resources, t }) {
  return (
    <ul
      aria-label={t('resourcesAi.catalog.resourceListLabel')}
      className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-7"
    >
      {resources.map((resource) => (
        <li key={getPublicResourceKey(resource)}>
          <ResourceCard resource={resource} t={t} />
        </li>
      ))}
    </ul>
  )
}

function NoResultsState({ onClearAll, t }) {
  return (
    <div role="status" className="mx-auto max-w-xl rounded-2xl border border-navy/[0.08] bg-white p-10 text-center shadow-sm">
      <Layers3 className="mx-auto text-steel" size={36} strokeWidth={1.4} aria-hidden="true" />
      <h2 className="mt-5 text-xl font-bold text-navy">{t('resourcesAi.catalog.noResultsTitle')}</h2>
      <p className="mt-3 text-sm leading-relaxed text-muted">
        {t('resourcesAi.catalog.noResultsDescription')}
      </p>
      <button
        type="button"
        onClick={onClearAll}
        className="mt-6 rounded-full bg-navy px-5 py-2.5 text-sm font-bold text-white hover:bg-navy-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
      >
        {t('resourcesAi.catalog.clearAll')}
      </button>
    </div>
  )
}

function FilteredEmptyState({ onClearAll, t }) {
  return (
    <div
      role="status"
      className="mx-auto max-w-xl rounded-2xl border border-navy/[0.08] bg-white p-10 text-center shadow-sm"
    >
      <Layers3 className="mx-auto text-steel" size={36} strokeWidth={1.4} aria-hidden="true" />
      <h2 className="mt-5 text-xl font-bold text-navy">
        {t('resourcesAi.catalog.noSeriesMatchTitle')}
      </h2>
      <p className="mt-3 text-sm leading-relaxed text-muted">
        {t('resourcesAi.catalog.noSeriesMatchDescription')}
      </p>
      <button
        type="button"
        onClick={onClearAll}
        className="mt-6 rounded-full bg-navy px-5 py-2.5 text-sm font-bold text-white hover:bg-navy-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
      >
        {t('resourcesAi.catalog.clearAll')}
      </button>
    </div>
  )
}

function NoSeriesState({ onShowResources, t }) {
  return (
    <div
      role="status"
      className="mx-auto max-w-xl rounded-2xl border border-navy/[0.08] bg-white p-10 text-center shadow-sm"
    >
      <Layers3 className="mx-auto text-steel" size={36} strokeWidth={1.4} aria-hidden="true" />
      <h2 className="mt-5 text-xl font-bold text-navy">
        {t('resourcesAi.catalog.noSeriesTitle')}
      </h2>
      <p className="mt-3 text-sm leading-relaxed text-muted">
        {t('resourcesAi.catalog.noSeriesDescription')}
      </p>
      <button
        type="button"
        onClick={onShowResources}
        className="mt-6 rounded-full bg-navy px-5 py-2.5 text-sm font-bold text-white hover:bg-navy-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
      >
        {t('resourcesAi.catalog.backToResources')}
      </button>
    </div>
  )
}

function LoadingGrid({ t }) {
  return (
    <div aria-live="polite" aria-busy="true">
      <p className="sr-only">{t('resourcesAi.loading')}</p>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((item) => (
          <div
            key={item}
            className="overflow-hidden rounded-2xl border border-navy/[0.07] bg-white"
          >
            <div className="aspect-[4/3] animate-pulse bg-gray-200" />
            <div className="space-y-3 p-6">
              <div className="h-3 w-1/3 animate-pulse rounded bg-gray-100" />
              <div className="h-6 w-4/5 animate-pulse rounded bg-gray-200" />
              <div className="h-4 w-full animate-pulse rounded bg-gray-100" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ErrorState({ onRetry, t }) {
  return (
    <div
      role="alert"
      className="mx-auto max-w-xl rounded-2xl border border-red-200 bg-white p-8 text-center"
    >
      <h2 className="text-xl font-bold text-navy">{t('resourcesAi.errorTitle')}</h2>
      <p className="mt-3 text-sm leading-relaxed text-muted">{t('resourcesAi.errorDescription')}</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-6 inline-flex items-center gap-2 rounded-full bg-navy px-5 py-2.5 text-sm font-semibold text-white hover:bg-navy-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
      >
        <RotateCw size={15} aria-hidden="true" />
        {t('resourcesAi.retry')}
      </button>
    </div>
  )
}

function EmptyState({ t }) {
  return (
    <div
      role="status"
      className="mx-auto max-w-xl rounded-2xl border border-navy/[0.08] bg-white p-10 text-center shadow-sm"
    >
      <ImageIcon className="mx-auto text-steel" size={36} strokeWidth={1.4} aria-hidden="true" />
      <h2 className="mt-5 text-xl font-bold text-navy">{t('resourcesAi.emptyTitle')}</h2>
      <p className="mt-3 text-sm leading-relaxed text-muted">{t('resourcesAi.emptyDescription')}</p>
    </div>
  )
}
