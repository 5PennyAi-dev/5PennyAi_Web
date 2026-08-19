import { useMemo } from 'react'
import { ArrowRight, Clock3 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ResourcePreview } from '@/components/resources/ResourceCard'
import { selectDiscoverResources } from '@/lib/homepageCuration'

export default function HomeDiscover({ resources, excludedResources, status }) {
  const { t } = useTranslation()
  const selected = useMemo(
    () => selectDiscoverResources(resources, { excludedResources }),
    [resources, excludedResources],
  )

  if (status === 'ready' && selected.length === 0) return null

  return (
    <section className="bg-lavender/20 py-20 sm:py-24 lg:py-28" aria-labelledby="home-discover-title">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="max-w-2xl">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-accent-deep">{t('homeDiscover.eyebrow')}</p>
          <h2 id="home-discover-title" className="mt-3 font-heading text-3xl font-bold tracking-tight text-navy sm:text-4xl">{t('homeDiscover.title')}</h2>
          <p className="mt-4 text-base leading-relaxed text-navy/70">{t('homeDiscover.description')}</p>
        </div>

        {status === 'loading' ? <DiscoverLoading t={t} /> : selected.length > 0 && (
          <div className="mt-10 grid gap-7 md:grid-cols-2 xl:grid-cols-3">
            {selected.map((resource) => <DiscoverResource key={resourceKey(resource)} resource={resource} t={t} />)}
          </div>
        )}
      </div>
    </section>
  )
}

function DiscoverResource({ resource, t }) {
  const title = resource.title || t('resourcesAi.type')
  return (
    <article className="group flex min-w-0 flex-col">
      <div className="aspect-video overflow-hidden rounded-2xl bg-white shadow-[var(--shadow-card)]">
        <ResourcePreview contentType={resource.contentType} sources={resource.thumbnailSources} t={t} />
      </div>
      <div className="flex flex-1 flex-col pt-5">
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-accent-deep">{t(`resourcesAi.formats.${resource.contentType}`)}</p>
        <h3 className="mt-2 font-heading text-xl font-bold leading-snug text-navy sm:text-2xl">{title}</h3>
        <ResourceMetadata resource={resource} t={t} />
        <Link to={resource.publicUrl} aria-label={t('homeDiscover.viewLabel', { title })} className="mt-auto inline-flex min-h-11 w-fit items-center gap-1.5 pt-4 text-sm font-bold text-accent-deep transition-colors hover:text-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-4">
          {t('homeDiscover.view')} <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </div>
    </article>
  )
}

function ResourceMetadata({ resource, t }) {
  if (!resource.level && !(resource.readingTimeMinutes > 0)) return null
  return (
    <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium text-navy/60">
      {resource.level && <span>{t(`resourcesAi.levels.${resource.level}`, { defaultValue: resource.level })}</span>}
      {resource.readingTimeMinutes > 0 && <span className="inline-flex items-center gap-1"><Clock3 size={13} aria-hidden="true" />{t('resourcesAi.readingTime', { count: resource.readingTimeMinutes })}</span>}
    </p>
  )
}

function DiscoverLoading({ t }) {
  return (
    <div className="mt-10 grid gap-7 md:grid-cols-2 xl:grid-cols-3" aria-busy="true">
      <p className="sr-only">{t('homeDiscover.loading')}</p>
      {[0, 1, 2, 3, 4].map((item) => <div key={item} className="aspect-video animate-pulse rounded-2xl bg-white/70" />)}
    </div>
  )
}

function resourceKey(resource) {
  return `${resource.contentType}:${resource.id}`
}
