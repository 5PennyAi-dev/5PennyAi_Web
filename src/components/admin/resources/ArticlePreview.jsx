import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { BookOpenText, Image as ImageIcon } from 'lucide-react'
import ArticleCompanionInfographic from '@/components/resources/ArticleCompanionInfographic'
import {
  articleUrlTransform,
  calculateArticleReadingTime,
  isExternalArticleLink,
  isSafeArticleLink,
  remarkArticleMarkers,
} from '@/lib/articleMarkdown'

export default function ArticlePreview({ assets = [], assetUrls = {}, coverUrl, form, infographic, mode = 'admin', t }) {
  const readingTime = calculateArticleReadingTime(form.contentMarkdown)
  const levelLabel = form.level
    ? t(`admin.resourcesAi.articleForm.levels.${form.level}`, { defaultValue: form.level })
    : ''

  return (
    <article className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
      <div className="border-b border-gray-200 bg-surface px-5 py-4 sm:px-7">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-accent">
          {t('admin.resourcesAi.articleForm.preview.label')}
        </p>
      </div>
      <div className="space-y-8 p-5 sm:p-7">
        <header className="space-y-4">
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-surface">
            <div className="aspect-video">
              {coverUrl ? (
                <img src={coverUrl} alt={form.cover?.altText || ''} className="h-full w-full object-contain" />
              ) : (
                <div className="flex h-full items-center justify-center text-navy/35">
                  <ImageIcon size={36} strokeWidth={1.4} aria-hidden="true" />
                </div>
              )}
            </div>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-steel">
              {[form.theme, levelLabel].filter(Boolean).join(' · ')}
            </p>
            <h2 className="mt-2 font-heading text-2xl font-bold text-navy sm:text-3xl">
              {form.title || t('admin.resourcesAi.articleForm.preview.untitled')}
            </h2>
            {form.subtitle && <p className="mt-2 text-lg text-navy/70">{form.subtitle}</p>}
            {form.summary && <p className="mt-4 text-sm leading-7 text-muted">{form.summary}</p>}
          </div>
          <div className="flex flex-wrap gap-3 text-xs text-navy/60">
            {readingTime > 0 && (
              <span className="inline-flex items-center gap-1.5"><BookOpenText size={14} aria-hidden="true" />{t('admin.resourcesAi.articleForm.preview.readingTime', { count: readingTime })}</span>
            )}
            {form.series?.name && <span>{form.series.name}{form.series.episodeNumber ? ` · ${t('admin.resourcesAi.articleForm.preview.episode', { number: form.series.episodeNumber })}` : ''}</span>}
          </div>
        </header>

        {(form.learningObjectives?.length > 0 || form.prerequisites?.length > 0) && (
          <div className="grid gap-5 sm:grid-cols-2">
            <PreviewList title={t('admin.resourcesAi.articleForm.preview.objectives')} values={form.learningObjectives} />
            <PreviewList title={t('admin.resourcesAi.articleForm.preview.prerequisites')} values={form.prerequisites} />
          </div>
        )}

        <ArticleMarkdownContent assets={assets} assetUrls={assetUrls} companionInfographic={infographic} form={form} mode={mode} t={t} />
      </div>
    </article>
  )
}

export function ArticleMarkdownContent({ assets = [], assetUrls = {}, companionInfographic, form, mode = 'admin', t }) {
  const sources = Array.isArray(form.sources) ? form.sources : []
  const media = Array.isArray(form.media) ? form.media : []
  const sourceIndex = new Map(sources.map((source, index) => [source.key, { source, number: index + 1 }]))
  const assetIndex = new Map(assets.map((asset) => [asset.media_key, asset]))
  const components = createMarkdownComponents({ assetIndex, assetUrls, media, mode, sourceIndex, t })
  const labelPrefix = mode === 'public' ? 'resourcesAi.article' : 'admin.resourcesAi.articleForm.preview'

  return (
    <>
      <div className="min-w-0 text-[15px] leading-7 text-navy/85">
        {form.contentMarkdown?.trim() ? (
          <ReactMarkdown
            remarkPlugins={[remarkGfm, [remarkArticleMarkers, { mode }]]}
            components={components}
            urlTransform={articleUrlTransform}
          >
            {form.contentMarkdown}
          </ReactMarkdown>
        ) : (
          <p className="rounded-xl bg-surface p-5 text-sm text-navy/65">{t(`${labelPrefix}.emptyMarkdown`)}</p>
        )}
      </div>

      {form.takeaway && (
        <aside className="rounded-xl border border-steel/30 bg-steel/10 p-5">
          <h2 className="font-heading text-lg font-semibold text-navy">{t(`${labelPrefix}.takeaway`)}</h2>
          <p className="mt-2 text-sm leading-7 text-navy/80">{form.takeaway}</p>
        </aside>
      )}

      {companionInfographic && (
        <ArticleCompanionInfographic
          infographic={companionInfographic}
          showActions={mode === 'public'}
          t={t}
          title={form.title || t(`${labelPrefix}.fallbackTitle`, { defaultValue: 'Article' })}
        />
      )}

      {sources.length > 0 && (
        <section aria-labelledby="article-sources">
          <h2 id="article-sources" className="font-heading text-xl font-semibold text-navy">
            {t(`${labelPrefix}.sources`)}
          </h2>
          <ol className="mt-4 space-y-3 text-sm text-navy/75">
            {sources.map((source, index) => <SourceItem key={source.key || index} index={index + 1} source={source} t={t} labelPrefix={labelPrefix} />)}
          </ol>
        </section>
      )}
    </>
  )
}

function createMarkdownComponents({ assetIndex, assetUrls, media, mode, sourceIndex, t }) {
  const mediaIndex = new Map(media.map((item) => [item.key, item]))
  return {
    h1: ({ children }) => mode === 'public' ? null : <h2 className="mb-3 mt-8 font-heading text-2xl font-bold text-navy">{children}</h2>,
    h2: ({ children }) => <h2 className="mb-3 mt-8 font-heading text-xl font-bold text-navy">{children}</h2>,
    h3: ({ children }) => <h3 className="mb-2 mt-6 font-heading text-lg font-semibold text-navy">{children}</h3>,
    h4: ({ children }) => <h4 className="mb-2 mt-5 font-heading text-base font-semibold text-navy">{children}</h4>,
    p: ({ children }) => <p className="my-4">{children}</p>,
    ul: ({ children }) => <ul className="my-4 list-disc space-y-1 pl-6">{children}</ul>,
    ol: ({ children }) => <ol className="my-4 list-decimal space-y-1 pl-6">{children}</ol>,
    hr: () => <hr className="my-8 border-gray-200" />,
    blockquote: ({ children }) => <blockquote className="my-5 border-l-4 border-steel pl-4 text-navy/70">{children}</blockquote>,
    table: ({ children, node }) => {
      const hasFourOrMoreColumns = getTableColumnCount(node) >= 4
      return (
        <div className="my-8 max-w-full overflow-x-auto overscroll-x-contain rounded-xl border border-navy/[0.1] bg-white shadow-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2" tabIndex="0">
          <table className={`${hasFourOrMoreColumns ? 'min-w-[42rem]' : 'min-w-full'} border-separate border-spacing-0 text-sm leading-6`}>{children}</table>
        </div>
      )
    },
    thead: ({ children }) => <thead className="bg-steel/20 text-navy">{children}</thead>,
    tbody: ({ children }) => <tbody className="[&>tr:nth-child(even)]:bg-steel/[0.06] [&>tr>td:first-child]:font-semibold [&>tr>td:first-child]:text-navy [&>tr:last-child>td]:border-b-0">{children}</tbody>,
    tr: ({ children }) => <tr>{children}</tr>,
    th: ({ children }) => <th className="border-b-2 border-navy/[0.12] px-4 py-2.5 text-left align-top font-semibold">{children}</th>,
    td: ({ children }) => <td className="border-b border-navy/[0.08] px-4 py-2.5 align-top text-navy/80">{children}</td>,
    pre: ({ children }) => <pre className="my-5 max-w-full overflow-x-auto rounded-xl bg-navy p-4 text-sm text-white" tabIndex="0">{children}</pre>,
    code: ({ children, className }) => className
      ? <code className={className}>{children}</code>
      : <code className="rounded bg-surface px-1.5 py-0.5 font-mono text-[0.9em] text-navy">{children}</code>,
    img: ({ src }) => {
      if (!src?.startsWith('article-media:')) return null
      const key = decodeURIComponent(src.slice('article-media:'.length))
      const item = mediaIndex.get(key)
      const asset = assetIndex.get(key)
      if (!item || !asset || !assetUrls[asset.storage_path]) {
        if (mode === 'public') return null
        return <MediaPlaceholder text={t(item ? 'admin.resourcesAi.articleForm.preview.mediaMissing' : 'admin.resourcesAi.articleForm.preview.mediaUnknown', { key })} />
      }
      return (
        <figure className="my-6 overflow-hidden rounded-xl border border-gray-200 bg-surface">
          <img src={assetUrls[asset.storage_path]} alt={item.altText || ''} onError={(event) => { event.currentTarget.closest('figure').hidden = true }} className="h-auto w-full object-contain" />
          {item.caption && <figcaption className="border-t border-gray-200 px-4 py-3 text-sm text-navy/65">{item.caption}</figcaption>}
        </figure>
      )
    },
    a: ({ children, href }) => {
      if (href?.startsWith('article-cite:')) {
        const key = decodeURIComponent(href.slice('article-cite:'.length))
        const entry = sourceIndex.get(key)
        if (!entry) return mode === 'public' ? null : <span className="rounded bg-amber-100 px-1.5 py-0.5 text-xs text-amber-900">{t('admin.resourcesAi.articleForm.preview.citationUnknown', { key })}</span>
        return <sup><a href={`#article-source-${entry.number}`} aria-label={t('resourcesAi.article.citationLabel', { number: entry.number })} className="rounded px-1 text-steel underline">[{entry.number}]</a></sup>
      }
      if (!isSafeArticleLink(href)) return <span>{children}</span>
      const external = isExternalArticleLink(href)
      return <a href={href} className="text-steel underline" {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>{children}</a>
    },
  }
}

function getTableColumnCount(node) {
  const row = findFirstTableRow(node)
  if (!row?.children) return 0
  return row.children.filter((child) =>
    child?.tagName === 'th' || child?.tagName === 'td' || child?.type === 'tableCell').length
}

function findFirstTableRow(node) {
  if (!node || typeof node !== 'object') return null
  if (node.tagName === 'tr' || node.type === 'tableRow') return node
  if (!Array.isArray(node.children)) return null
  for (const child of node.children) {
    const row = findFirstTableRow(child)
    if (row) return row
  }
  return null
}

function PreviewList({ title, values = [] }) {
  if (!values.length) return null
  return <section className="rounded-xl bg-surface p-4"><h3 className="font-heading font-semibold text-navy">{title}</h3><ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-navy/75">{values.map((value, index) => <li key={index}>{value}</li>)}</ul></section>
}

function MediaPlaceholder({ text }) {
  return <span className="my-5 block rounded-xl border border-dashed border-amber-300 bg-amber-50 p-5 text-center text-sm text-amber-900">{text}</span>
}

function SourceItem({ index, labelPrefix, source, t }) {
  const people = [
    Array.isArray(source.authors) && source.authors.length ? source.authors.join(', ') : '',
    source.organization,
  ].filter(Boolean).join(' · ')
  const safeUrl = isSafeArticleLink(source.url) && /^https?:\/\//i.test(source.url || '')
  return (
    <li id={`article-source-${index}`}>
      <span className="font-semibold text-navy">[{index}] {source.title || t(`${labelPrefix}.untitledSource`)}</span>
      {people && <span> — {people}</span>}
      {source.publicationDate && <span> ({source.publicationDate})</span>}
      {safeUrl ? <span> — <a href={source.url} target="_blank" rel="noopener noreferrer" className="text-steel underline">{source.url}</a></span> : source.url ? <span> — {source.url}</span> : null}
      {source.accessDate && <span> — {t(`${labelPrefix}.accessed`, { date: source.accessDate })}</span>}
    </li>
  )
}
