import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { selectFeaturedTopics } from '@/lib/homepageCuration'
import { getResourceTopicLabel } from '@/lib/resourceTopics'

export default function HomeTopics({ resources, status }) {
  const { t, i18n } = useTranslation()
  const topics = selectFeaturedTopics(resources)

  return (
    <section id="explorer-par-sujet" className="scroll-mt-20 bg-navy py-20 text-white sm:py-24 lg:py-28" aria-labelledby="home-topics-title">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="max-w-2xl">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-lavender">{t('homeTopics.eyebrow')}</p>
          <h2 id="home-topics-title" className="mt-3 font-heading text-3xl font-bold tracking-tight !text-white sm:text-4xl">{t('homeTopics.title')}</h2>
          <p className="mt-4 text-base leading-relaxed text-white/70">{t('homeTopics.description')}</p>
        </div>

        {status === 'ready' && topics.length > 0 && (
          <div className="mt-10 grid gap-x-12 md:grid-cols-2">
            {topics.map((topic) => {
              const label = getResourceTopicLabel(topic, i18n.language)
              return (
                <Link
                  key={topic.key}
                  to={`/ressources-ia?${new URLSearchParams({ sujet: topic.key }).toString()}`}
                  className="group flex min-h-14 items-center gap-4 border-t border-white/15 py-4 text-left transition-colors hover:text-lavender focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lavender focus-visible:ring-offset-4 focus-visible:ring-offset-navy"
                >
                  <span className="min-w-0 flex-1 font-heading text-lg font-bold">{label}</span>
                  <span className="shrink-0 text-sm font-medium text-white/65">{t('homeTopics.resourceCount', { count: topic.count })}</span>
                  <ArrowRight className="shrink-0 transition-transform duration-200 motion-reduce:transition-none group-hover:translate-x-1" size={17} aria-hidden="true" />
                </Link>
              )
            })}
          </div>
        )}

        {status === 'ready' && topics.length === 0 && <p className="mt-10 text-sm text-white/65">{t('homeTopics.empty')}</p>}
      </div>
    </section>
  )
}
