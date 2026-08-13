import { useState } from 'react'
import { ArrowRight, MessageSquareText } from 'lucide-react'
import { Link } from 'react-router-dom'
import { promptTaxonomyLabelKey } from '@/lib/promptTaxonomies'

export default function PromptCard({ resource, t }) {
  const title = cleanText(resource.title) || t('resourcesAi.prompt.fallbackTitle')
  const category = cleanText(resource.category)
  const contexts = cleanStringArray(resource.contexts)

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-navy/[0.09] bg-white shadow-[var(--shadow-card)] transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-0.5 hover:border-navy/15 hover:shadow-[var(--shadow-card-hover)] focus-within:border-accent focus-within:shadow-[var(--shadow-card-hover)]">
      <div className="aspect-video overflow-hidden border-b border-navy/[0.06] bg-surface">
        <PromptPreview
          key={(resource.thumbnailSources || []).map(({ path, url }) => path || url).join('|')}
          sources={resource.thumbnailSources}
          t={t}
        />
      </div>

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-accent">
            {t('resourcesAi.formats.prompt')}
          </p>
          {category && (
            <span className="rounded-full bg-lavender/35 px-2.5 py-1 text-[11px] font-bold text-navy">
              {t(promptTaxonomyLabelKey('categories', category), { defaultValue: category })}
            </span>
          )}
        </div>

        <h2 className="mt-3 line-clamp-3 font-heading text-xl font-bold leading-snug text-navy">
          {title}
        </h2>
        {resource.summary && (
          <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted">{resource.summary}</p>
        )}

        {(resource.level || contexts.length > 0) && (
          <div className="mt-4 flex flex-wrap gap-2 text-xs font-medium text-navy/65">
            {resource.level && (
              <span className="rounded-full bg-steel/15 px-3 py-1">
                {t(`resourcesAi.levels.${resource.level}`, { defaultValue: resource.level })}
              </span>
            )}
            {contexts.slice(0, 3).map((context) => (
              <span key={context} className="rounded-full bg-navy/[0.055] px-3 py-1">
                {t(promptTaxonomyLabelKey('contexts', context), { defaultValue: context })}
              </span>
            ))}
          </div>
        )}

        {resource.publicUrl && (
          <Link
            to={resource.publicUrl}
            aria-label={t('resourcesAi.prompt.viewLabel', { title })}
            className="mt-auto inline-flex w-fit items-center gap-2 pt-6 text-sm font-bold text-accent-deep transition-colors hover:text-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-4"
          >
            {t('resourcesAi.prompt.view')}
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        )}
      </div>
    </article>
  )
}

function PromptPreview({ sources, t }) {
  const [sourceIndex, setSourceIndex] = useState(0)
  const source = Array.isArray(sources) ? sources[sourceIndex] : null

  if (!source?.url) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 bg-gradient-to-br from-lavender/35 to-steel/10 text-center text-navy/45">
        <MessageSquareText size={34} strokeWidth={1.4} aria-hidden="true" />
        <span className="text-xs font-bold">{t('resourcesAi.prompt.thumbnailFallback')}</span>
      </div>
    )
  }

  return (
    <img
      src={source.url}
      alt=""
      className="h-full w-full object-cover object-center"
      loading="lazy"
      decoding="async"
      onError={() => setSourceIndex((index) => index + 1)}
    />
  )
}

function cleanText(value) {
  return typeof value === 'string' ? value.trim() : ''
}

function cleanStringArray(value) {
  return Array.isArray(value)
    ? value.filter((item) => typeof item === 'string').map((item) => item.trim()).filter(Boolean)
    : []
}
