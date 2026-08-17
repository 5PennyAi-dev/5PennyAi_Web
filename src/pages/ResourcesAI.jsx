import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Image as ImageIcon,
  Layers3,
  RotateCw,
  Search,
} from 'lucide-react'
import { Helmet } from 'react-helmet-async'
import { Link, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import ResourceCard from '@/components/resources/ResourceCard'
import PromptCard from '@/components/resources/PromptCard'
import SeriesArtwork from '@/components/resources/SeriesArtwork'
import { fetchPublishedCatalog } from '@/lib/publicInfographics'
import {
  filterPublicResources,
  getCatalogPaginationItems,
  getPublicResourceKey,
  normalizeCatalogSearchParams,
  normalizeResourceLevel,
  normalizeSearchText,
  normalizeResourceFormat,
  paginatePublicResources,
  RESOURCE_FORMATS,
  updateCatalogCriteria,
} from '@/lib/publicResourceCatalog'
import { selectFeaturedSeries } from '@/lib/resourceSeries'
import {
  findResourceTopic,
  getAvailableResourceTopics,
  getResourceTopicLabel,
  resolveResourceTopicSlug,
} from '@/lib/resourceTopics'
import {
  isPromptCategory,
  PROMPT_CATEGORIES,
  promptTaxonomyLabelKey,
} from '@/lib/promptTaxonomies'

const SERIES_PATH = '/ressources-ia/series'

export default function ResourcesAI() {
  const { t, i18n } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()
  const [resources, setResources] = useState([])
  const [articles, setArticles] = useState([])
  const [prompts, setPrompts] = useState([])
  const [series, setSeries] = useState([])
  const [state, setState] = useState('loading')
  const resourcesListRef = useRef(null)
  const isSeriesView = searchParams.get('vue') === 'series'
  const selectedSeriesSlug = isSeriesView ? '' : searchParams.get('serie') || ''
  const rawFormat = searchParams.get('format') || ''
  const rawQuery = searchParams.get('q') || ''
  const rawLevel = searchParams.get('niveau') || ''
  const rawTopic = searchParams.get('sujet') || ''
  const rawCategory = searchParams.get('categorie') || ''
  const rawPage = searchParams.get('page') || ''
  const selectedQuery = isSeriesView ? '' : rawQuery
  const selectedLevel = isSeriesView ? '' : normalizeResourceLevel(rawLevel)
  const selectedFormat = isSeriesView
    ? RESOURCE_FORMATS.ALL
    : normalizeResourceFormat(rawFormat, articles.length > 0, prompts.length > 0)
  const isPromptMode = selectedFormat === RESOURCE_FORMATS.PROMPTS
  const topics = useMemo(() => getAvailableResourceTopics(resources), [resources])
  const resolvedTopicKey = isSeriesView || isPromptMode
    ? ''
    : resolveResourceTopicSlug(resources, rawTopic)
  const selectedTopic = isSeriesView || isPromptMode ? null : findResourceTopic(resources, resolvedTopicKey)
  const selectedTopicKey = selectedTopic?.key || ''
  const selectedCategory = isPromptMode && isPromptCategory(rawCategory) ? rawCategory : ''
  const selectedSeries = useMemo(
    () => series.find(({ slug }) => slug === selectedSeriesSlug) || null,
    [selectedSeriesSlug, series],
  )
  const featuredSeries = useMemo(() => selectFeaturedSeries(series), [series])
  const getPromptTaxonomyLabels = useCallback((resource) => {
    if (resource?.contentType !== 'prompt') return []
    return ['fr', 'en'].flatMap((language) => {
      const translate = i18n.getFixedT(language)
      return [resource.category, ...(resource.contexts || [])]
        .filter(Boolean)
        .map((value) => translate(promptTaxonomyLabelKey(
          value === resource.category ? 'categories' : 'contexts',
          value,
        )))
    })
  }, [i18n])
  const visibleResources = filterPublicResources(resources, {
    format: selectedFormat,
    level: selectedLevel,
    query: selectedQuery,
    seriesSlug: selectedSeriesSlug,
    topic: selectedTopicKey,
    category: selectedCategory,
    getPromptTaxonomyLabels,
  })
  const pagination = paginatePublicResources(visibleResources, rawPage)
  const hasActiveResourceFilters = Boolean(normalizeSearchText(selectedQuery))
    || Boolean(selectedLevel)
    || selectedFormat !== RESOURCE_FORMATS.ALL
    || Boolean(selectedSeriesSlug)
    || Boolean(selectedTopicKey)
    || Boolean(selectedCategory)
  const isNeutralResourceView = !isSeriesView && !hasActiveResourceFilters

  const loadInfographics = useCallback(async () => {
    setState('loading')
    try {
      const catalog = await fetchPublishedCatalog()
      setResources(catalog.resources)
      setArticles(catalog.articles)
      setPrompts(catalog.prompts)
      setSeries(catalog.series)
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
          setPrompts(catalog.prompts)
          setSeries(catalog.series)
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
    if (!isSeriesView && !isPromptMode && rawTopic && rawTopic !== resolvedTopicKey) {
      const nextParams = new URLSearchParams(searchParams)
      if (resolvedTopicKey) nextParams.set('sujet', resolvedTopicKey)
      else nextParams.delete('sujet')
      setSearchParams(nextParams, { replace: true })
      return
    }
    const { hasChanges, nextParams } = normalizeCatalogSearchParams(searchParams, {
      hasPublishedArticles: articles.length > 0,
      hasPublishedPrompts: prompts.length > 0,
      hasValidTopic: Boolean(selectedTopic),
      isSeriesView,
      totalPages: pagination.totalPages,
    })
    if (hasChanges) setSearchParams(nextParams, { replace: true })
  }, [
    articles.length,
    isSeriesView,
    isPromptMode,
    searchParams,
    selectedTopic,
    resolvedTopicKey,
    rawTopic,
    setSearchParams,
    state,
    prompts.length,
    pagination.totalPages,
  ])

  const showResourcesView = () => {
    const nextParams = new URLSearchParams(searchParams)
    nextParams.delete('vue')
    nextParams.delete('serie')
    nextParams.delete('page')
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
    nextParams.delete('categorie')
    nextParams.delete('page')
    setSearchParams(nextParams)
  }

  const filterBySearch = (query) => {
    const nextParams = updateCatalogCriteria(searchParams, {
      vue: null,
      q: query.trim() ? query : null,
    })
    setSearchParams(nextParams, { replace: true })
  }

  const filterByLevel = (level) => {
    const nextParams = updateCatalogCriteria(searchParams, {
      vue: null,
      niveau: normalizeResourceLevel(level) ? level : null,
    })
    setSearchParams(nextParams)
  }

  const filterByTopic = (topicKey) => {
    const nextParams = updateCatalogCriteria(searchParams, {
      vue: null,
      sujet: findResourceTopic(resources, topicKey) ? topicKey : null,
    })
    setSearchParams(nextParams)
  }

  const filterByFormat = (format) => {
    const updates = { vue: null }
    if (
      format === RESOURCE_FORMATS.INFOGRAPHICS
      || format === RESOURCE_FORMATS.ARTICLES
      || format === RESOURCE_FORMATS.PROMPTS
    ) {
      updates.format = format
    } else {
      updates.format = null
    }
    if (format === RESOURCE_FORMATS.PROMPTS) {
      updates.sujet = null
      updates.serie = null
    } else {
      updates.categorie = null
    }
    const nextParams = updateCatalogCriteria(searchParams, updates)
    setSearchParams(nextParams)
  }

  const filterByCategory = (category) => {
    const nextParams = updateCatalogCriteria(searchParams, {
      vue: null,
      categorie: isPromptCategory(category) ? category : null,
    })
    setSearchParams(nextParams)
  }

  const filterBySeries = (slug) => {
    const nextParams = updateCatalogCriteria(searchParams, { vue: null, serie: slug || null })
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
    nextParams.delete('categorie')
    nextParams.delete('page')
    setSearchParams(nextParams)
  }

  const removeResourceFilter = (parameter) => {
    const nextParams = updateCatalogCriteria(searchParams, { [parameter]: null })
    setSearchParams(nextParams)
  }

  const goToPage = useCallback((page) => {
    const nextParams = new URLSearchParams(searchParams)
    if (page <= 1) nextParams.delete('page')
    else nextParams.set('page', String(page))
    setSearchParams(nextParams)
    resourcesListRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [searchParams, setSearchParams])

  return (
    <>
      <Helmet>
        <title>{t('resourcesAi.seo.listTitle')}</title>
        <meta name="description" content={t('resourcesAi.seo.listDescription')} />
      </Helmet>

      <section className="min-h-[75vh] bg-warm-gray pt-28 pb-20 md:pt-36 md:pb-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <header className="mx-auto mb-8 max-w-3xl text-center md:mb-10">
            <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.2em] text-accent">
              {t('resourcesAi.eyebrow')}
            </p>
            <h1 className="text-display text-4xl font-bold text-navy md:text-5xl">
              {t(isPromptMode ? 'resourcesAi.promptLibrary.title' : 'resourcesAi.title')}
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-muted md:text-lg">
              {t(isPromptMode ? 'resourcesAi.promptLibrary.subtitle' : 'resourcesAi.subtitle')}
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
                hasPublishedPrompts={prompts.length > 0}
                onFilterChange={filterBySeries}
                onFormatChange={filterByFormat}
                onCategoryChange={filterByCategory}
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
                selectedCategory={selectedCategory}
                isPromptMode={isPromptMode}
                series={series}
                topics={topics}
                language={i18n.language}
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
                    category: selectedCategory,
                    language: i18n.language,
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
                  currentPage={pagination.currentPage}
                  listRef={resourcesListRef}
                  onPageChange={goToPage}
                  resources={pagination.resources}
                  totalPages={pagination.totalPages}
                  totalResources={pagination.totalResults}
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
  hasPublishedPrompts,
  language,
  isSeriesView,
  isPromptMode,
  onCategoryChange,
  onFilterChange,
  onFormatChange,
  onLevelChange,
  onSearchChange,
  onTopicChange,
  onShowResources,
  onShowSeries,
  selectedLevel,
  selectedCategory,
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
    <div className="mb-10">
      <div
        role="group"
        aria-label={t('resourcesAi.catalog.viewControlLabel')}
        className="mx-auto mb-6 grid w-full max-w-md grid-cols-2 rounded-xl border border-navy/[0.08] bg-white/70 p-1 shadow-sm sm:w-fit sm:max-w-none"
      >
        <button
          type="button"
          aria-pressed={!isSeriesView}
          onClick={onShowResources}
          className={`rounded-lg px-4 py-2.5 text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 ${
            !isSeriesView
              ? 'bg-navy text-white shadow-sm'
              : 'text-navy/65 hover:bg-navy/[0.045] hover:text-navy'
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
              : 'text-navy/65 hover:bg-navy/[0.045] hover:text-navy'
          }`}
        >
          {t('resourcesAi.catalog.series')}
        </button>
      </div>

      {!isSeriesView && (
        <div className="rounded-3xl border border-navy/[0.08] bg-white p-5 shadow-sm sm:p-6 lg:p-7">
          <div className="space-y-6">
            <SearchFilter
              isPromptMode={isPromptMode}
              onChange={onSearchChange}
              query={selectedQuery}
              t={t}
            />

            {(hasPublishedArticles || hasPublishedPrompts) && (
              <FormatFilter
                hasPublishedArticles={hasPublishedArticles}
                hasPublishedPrompts={hasPublishedPrompts}
                onChange={onFormatChange}
                selectedFormat={selectedFormat}
                t={t}
              />
            )}

            {isPromptMode && (
              <CategoryFilter
                onChange={onCategoryChange}
                selectedCategory={selectedCategory}
                t={t}
              />
            )}

            {isPromptMode ? (
              <div className="max-w-xs">
                <LevelFilter onChange={onLevelChange} selectedLevel={selectedLevel} t={t} />
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <LevelFilter onChange={onLevelChange} selectedLevel={selectedLevel} t={t} />
                <TopicFilter
                  onChange={onTopicChange}
                  selectedTopicKey={selectedTopicKey}
                  topics={topics}
                  language={language}
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
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function SearchFilter({ isPromptMode, onChange, query, t }) {
  return (
    <div>
      <label
        htmlFor="resource-search"
        className="mb-1.5 block text-xs font-bold text-navy/70"
      >
        {t('resourcesAi.catalog.searchLabel')}
      </label>
      <div className="relative">
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-navy/40"
          size={18}
          strokeWidth={2}
        />
        <input
          id="resource-search"
          type="search"
          value={query}
          onChange={(event) => onChange(event.target.value)}
          placeholder={t(isPromptMode
            ? 'resourcesAi.catalog.promptSearchPlaceholder'
            : 'resourcesAi.catalog.searchPlaceholder')}
          className="min-h-12 w-full rounded-xl border border-navy/15 bg-white py-3 pl-11 pr-4 text-sm font-medium text-navy shadow-sm placeholder:text-navy/40 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25"
        />
      </div>
    </div>
  )
}

function FormatFilter({ hasPublishedArticles, hasPublishedPrompts, onChange, selectedFormat, t }) {
  const options = [
    [RESOURCE_FORMATS.ALL, t('resourcesAi.catalog.allFormats')],
    [RESOURCE_FORMATS.INFOGRAPHICS, t('resourcesAi.catalog.infographics')],
    ...(hasPublishedArticles
      ? [[RESOURCE_FORMATS.ARTICLES, t('resourcesAi.catalog.articles')]]
      : []),
    ...(hasPublishedPrompts
      ? [[RESOURCE_FORMATS.PROMPTS, t('resourcesAi.catalog.prompts')]]
      : []),
  ]

  return (
    <fieldset className="min-w-0">
      <legend className="mb-1.5 text-xs font-bold text-navy/70">
        {t('resourcesAi.catalog.formatLabel')}
      </legend>
      <div
        className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap"
        role="group"
      >
        {options.map(([value, label]) => (
          <button
            key={value}
            type="button"
            aria-pressed={selectedFormat === value}
            onClick={() => onChange(value)}
            className={`min-h-11 min-w-fit whitespace-nowrap rounded-xl border px-4 py-2.5 text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 sm:flex-none ${
              selectedFormat === value
                ? 'border-navy bg-navy text-white shadow-sm'
                : 'border-navy/10 bg-white text-navy/65 hover:border-navy/25 hover:bg-navy/[0.025] hover:text-navy'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </fieldset>
  )
}

function CategoryFilter({ onChange, selectedCategory, t }) {
  const options = ['', ...PROMPT_CATEGORIES]

  return (
    <fieldset className="min-w-0">
      <legend className="mb-2 text-xs font-bold text-navy/70">
        {t('resourcesAi.promptLibrary.categoryQuestion')}
      </legend>
      <div
        role="group"
        aria-label={t('resourcesAi.promptLibrary.categoryFilterLabel')}
        className="flex flex-wrap gap-2"
      >
        {options.map((category) => {
          const selected = selectedCategory === category
          const label = category
            ? t(promptTaxonomyLabelKey('categories', category))
            : t('resourcesAi.promptLibrary.allCategories')
          return (
            <button
              key={category || 'all'}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(category)}
              className={`min-h-10 rounded-full border px-3.5 py-2 text-xs font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 ${
                selected
                  ? 'border-navy bg-navy text-white shadow-sm'
                  : 'border-navy/10 bg-white text-navy/70 hover:border-navy/25 hover:text-navy'
              }`}
            >
              {label}
            </button>
          )
        })}
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
    <div className="w-full">
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

function TopicFilter({ language, onChange, selectedTopicKey, topics, t }) {
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
            {getTopicLabel(topic, language)}
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
  currentPage,
  featuredSeries,
  listRef,
  onPageChange,
  resources,
  onClearAll,
  selectedSeries,
  selectedSeriesSlug,
  t,
  totalPages,
  totalResources,
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

      <section ref={listRef} aria-labelledby="resources-list-title" className="scroll-mt-24">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 id="resources-list-title" className="font-heading text-2xl font-bold text-navy">
              {selectedSeries?.name || t('resourcesAi.catalog.allResources')}
            </h2>
            <p className="mt-1 text-sm text-muted">
              {t('resourcesAi.catalog.resourceCount', { count: totalResources })}
            </p>
          </div>
        </div>

        <ResourceGrid resources={resources} selectedSeriesSlug={selectedSeriesSlug} t={t} />
        <CatalogPagination
          currentPage={currentPage}
          onPageChange={onPageChange}
          t={t}
          totalPages={totalPages}
        />
      </section>
    </>
  )
}

function CatalogPagination({ currentPage, onPageChange, t, totalPages }) {
  const items = getCatalogPaginationItems(currentPage, totalPages)
  if (items.length === 0) return null

  const buttonBaseClass = 'inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border px-3 text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-40'
  const buttonClass = `${buttonBaseClass} border-navy/15 bg-white text-navy/70 hover:border-navy/35 hover:text-navy`

  return (
    <nav
      aria-label={t('resourcesAi.catalog.pagination.label')}
      className="mt-12 flex flex-wrap items-center justify-center gap-2 sm:mt-14"
    >
      <button
        type="button"
        aria-label={t('resourcesAi.catalog.pagination.previous')}
        disabled={currentPage <= 1}
        onClick={() => onPageChange(currentPage - 1)}
        className={buttonClass}
      >
        <ArrowLeft size={16} aria-hidden="true" />
        <span className="ml-2 hidden sm:inline">{t('resourcesAi.catalog.pagination.previous')}</span>
      </button>

      {items.map((item) => typeof item === 'number' ? (
        <button
          key={item}
          type="button"
          aria-current={item === currentPage ? 'page' : undefined}
          aria-label={item === currentPage
            ? t('resourcesAi.catalog.pagination.currentPage', { page: item })
            : t('resourcesAi.catalog.pagination.goToPage', { page: item })}
          onClick={() => onPageChange(item)}
          className={item === currentPage
            ? `${buttonBaseClass} border-navy bg-navy text-white hover:border-navy hover:bg-navy-deep`
            : buttonClass}
        >
          {item}
        </button>
      ) : (
        <span key={item} aria-hidden="true" className="min-w-5 text-center text-sm text-muted">…</span>
      ))}

      <button
        type="button"
        aria-label={t('resourcesAi.catalog.pagination.next')}
        disabled={currentPage >= totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        className={buttonClass}
      >
        <span className="mr-2 hidden sm:inline">{t('resourcesAi.catalog.pagination.next')}</span>
        <ArrowRight size={16} aria-hidden="true" />
      </button>
    </nav>
  )
}

function getActiveResourceFilters({ category, format, language, level, query, series, seriesSlug, t, topic }) {
  const filters = []
  if (normalizeSearchText(query)) {
    filters.push({
      parameter: 'q',
      label: t('resourcesAi.catalog.activeSearch', { query }),
      removeLabel: t('resourcesAi.catalog.removeSearch', { query }),
    })
  }
  if (format !== RESOURCE_FORMATS.ALL) {
    const formatKeys = {
      [RESOURCE_FORMATS.INFOGRAPHICS]: 'infographics',
      [RESOURCE_FORMATS.ARTICLES]: 'articles',
      [RESOURCE_FORMATS.PROMPTS]: 'prompts',
    }
    const label = t(`resourcesAi.catalog.${formatKeys[format]}`)
    filters.push({
      parameter: 'format',
      label,
      removeLabel: t('resourcesAi.catalog.removeFilter', { filter: label }),
    })
  }
  if (category) {
    const label = t(promptTaxonomyLabelKey('categories', category))
    filters.push({
      parameter: 'categorie',
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
    const label = getTopicLabel(topic, language)
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

function getTopicLabel(topic, language) {
  return getResourceTopicLabel(topic, language)
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
          {series.description && (
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/75">
              {series.description}
            </p>
          )}
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
          <li key={item.id}>
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
        {series.description && (
          <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted">
            {series.description}
          </p>
        )}
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

function ResourceGrid({ resources, selectedSeriesSlug = '', t }) {
  return (
    <ul
      aria-label={t('resourcesAi.catalog.resourceListLabel')}
      className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-7"
    >
      {resources.map((resource) => (
        <li key={getPublicResourceKey(resource)}>
          {resource.contentType === 'prompt'
            ? <PromptCard resource={resource} t={t} />
            : <ResourceCard resource={resource} selectedSeriesSlug={selectedSeriesSlug} t={t} />}
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
