import { useCallback, useEffect, useMemo, useState } from 'react'
import { BookOpenText, LockKeyhole, Pencil, Plus, RotateCw, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import AdminGuard from '@/components/admin/AdminGuard'
import AdminResourcesNav from '@/components/admin/resources/AdminResourcesNav'
import Card from '@/components/ui/Card'
import { deleteArticleDraft, fetchAdminArticles } from '@/lib/adminArticles'

const ARTICLES_PATH = '/admin/ressources-ia/articles'
const NEW_ARTICLE_PATH = `${ARTICLES_PATH}/nouvel`

export default function AdminArticles() {
  return (
    <AdminGuard>
      <AdminArticlesPage />
    </AdminGuard>
  )
}

function AdminArticlesPage() {
  const { t, i18n } = useTranslation()
  const [articles, setArticles] = useState([])
  const [activeFilter, setActiveFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [errorCode, setErrorCode] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [notice, setNotice] = useState(null)

  const loadArticles = useCallback(async () => {
    setLoading(true)
    setErrorCode(null)
    try {
      setArticles(await fetchAdminArticles())
    } catch (error) {
      console.error('Unable to load articles:', error.cause?.message || error.message)
      setErrorCode(error.code || 'load')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadArticles()
  }, [loadArticles])

  const counts = useMemo(
    () => ({
      all: articles.length,
      draft: articles.filter(({ status }) => status === 'draft').length,
      published: articles.filter(({ status }) => status === 'published').length,
    }),
    [articles],
  )
  const filtered = useMemo(
    () => (activeFilter === 'all' ? articles : articles.filter(({ status }) => status === activeFilter)),
    [activeFilter, articles],
  )
  const locale = i18n.language?.startsWith('en') ? 'en-CA' : 'fr-CA'

  const confirmDelete = async () => {
    if (!deleteTarget || deleting) return
    setDeleting(true)
    setNotice(null)
    try {
      await deleteArticleDraft(deleteTarget.id)
      const title = deleteTarget.title || t('admin.resourcesAi.articles.untitled')
      setArticles((current) => current.filter(({ id }) => id !== deleteTarget.id))
      setDeleteTarget(null)
      setNotice({ type: 'success', text: t('admin.resourcesAi.articles.delete.success', { title }) })
    } catch (error) {
      console.error('Unable to delete article:', error.cause?.message || error.message)
      setNotice({
        type: 'error',
        text: t(`admin.resourcesAi.articles.errors.${error.code || 'delete'}`),
      })
    } finally {
      setDeleting(false)
    }
  }

  return (
    <section className="min-h-[90vh] bg-warm-gray pt-24 pb-16 md:pt-28 md:pb-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <PageBrand t={t} />
        <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:items-start">
          <AdminResourcesNav active="articles" />
          <div className="min-w-0">
            <div className="mb-7 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="font-heading text-2xl font-bold tracking-tight text-navy md:text-3xl">
                  {t('admin.resourcesAi.articles.title')}
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
                  {t('admin.resourcesAi.articles.subtitle')}
                </p>
              </div>
              <Link
                to={NEW_ARTICLE_PATH}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:brightness-95"
              >
                <Plus size={16} strokeWidth={2.2} aria-hidden="true" />
                {t('admin.resourcesAi.articles.add')}
              </Link>
            </div>

            {!loading && !errorCode && articles.length > 0 && (
              <Filters active={activeFilter} counts={counts} onChange={setActiveFilter} t={t} />
            )}
            {notice && <Notice notice={notice} />}

            {loading ? (
              <LoadingState t={t} />
            ) : errorCode ? (
              <ErrorState code={errorCode} onRetry={loadArticles} t={t} />
            ) : articles.length === 0 ? (
              <EmptyState t={t} />
            ) : filtered.length === 0 ? (
              <FilteredEmpty onShowAll={() => setActiveFilter('all')} t={t} />
            ) : (
              <ArticleList articles={filtered} locale={locale} onDelete={setDeleteTarget} t={t} />
            )}
          </div>
        </div>
      </div>

      {deleteTarget && (
        <DeleteDialog
          article={deleteTarget}
          deleting={deleting}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={confirmDelete}
          t={t}
        />
      )}
    </section>
  )
}

function PageBrand({ t }) {
  return (
    <div className="mb-7">
      <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-accent">
        {t('admin.resourcesAi.brand')}
      </p>
      <h1 className="font-heading text-2xl font-bold tracking-tight text-navy md:text-3xl">
        {t('admin.resourcesAi.brand')}
      </h1>
    </div>
  )
}

function Filters({ active, counts, onChange, t }) {
  return (
    <div className="mb-5 flex flex-wrap gap-2" aria-label={t('admin.resourcesAi.articles.filters.label')}>
      {['all', 'draft', 'published'].map((filter) => (
        <button
          key={filter}
          type="button"
          aria-pressed={active === filter}
          onClick={() => onChange(filter)}
          className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
            active === filter
              ? 'border-accent bg-accent/10 text-accent-deep'
              : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:text-navy'
          }`}
        >
          {t(`admin.resourcesAi.articles.filters.${filter}`)}
          <span className="tnum rounded-full bg-white/75 px-1.5 py-0.5 text-[10px]">{counts[filter]}</span>
        </button>
      ))}
    </div>
  )
}

function ArticleList({ articles, locale, onDelete, t }) {
  return (
    <>
      <div className="hidden overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm md:block">
        <div className="min-w-[980px]">
        <div className="grid grid-cols-[minmax(180px,1.5fr)_100px_80px_100px_minmax(130px,1fr)_125px_160px] items-center gap-3 border-b border-gray-200 bg-surface px-5 py-3 text-[11px] font-medium uppercase tracking-wider text-gray-400">
          {['title', 'status', 'language', 'level', 'series', 'updated', 'actions'].map((column) => (
            <span key={column} className={column === 'actions' ? 'text-right' : ''}>
              {t(`admin.resourcesAi.articles.columns.${column}`)}
            </span>
          ))}
        </div>
        <ul className="divide-y divide-gray-100">
          {articles.map((article) => (
            <li
              key={article.id}
              className="grid grid-cols-[minmax(180px,1.5fr)_100px_80px_100px_minmax(130px,1fr)_125px_160px] items-center gap-3 px-5 py-4"
            >
              <p className="truncate font-heading text-sm font-semibold text-navy">
                {article.title || t('admin.resourcesAi.articles.untitled')}
              </p>
              <StatusBadge status={article.status} t={t} />
              <span className="text-sm text-navy/75">{article.language || '—'}</span>
              <span className="text-sm text-navy/75">{formatLevel(article.level, t)}</span>
              <span className="truncate text-sm text-navy/75">{formatSeries(article, t) || '—'}</span>
              <time className="tnum text-xs text-muted" dateTime={article.updated_at}>
                {formatDate(article.updated_at, locale)}
              </time>
              <Actions article={article} onDelete={onDelete} t={t} />
            </li>
          ))}
        </ul>
        </div>
      </div>

      <ul className="space-y-3 md:hidden">
        {articles.map((article) => (
          <li key={article.id} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-lavender/40 text-navy">
                <BookOpenText size={18} aria-hidden="true" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-heading text-sm font-semibold text-navy">
                  {article.title || t('admin.resourcesAi.articles.untitled')}
                </p>
                <p className="mt-1 text-xs text-muted">{formatSeries(article, t) || '—'}</p>
              </div>
              <StatusBadge status={article.status} t={t} />
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-gray-100 pt-3 text-xs">
              <Meta label={t('admin.resourcesAi.articles.columns.language')} value={article.language || '—'} />
              <Meta label={t('admin.resourcesAi.articles.columns.level')} value={formatLevel(article.level, t)} />
              <Meta
                label={t('admin.resourcesAi.articles.columns.updated')}
                value={formatDate(article.updated_at, locale)}
              />
            </dl>
            <div className="mt-4 border-t border-gray-100 pt-3">
              <Actions article={article} onDelete={onDelete} t={t} />
            </div>
          </li>
        ))}
      </ul>
    </>
  )
}

function Meta({ label, value }) {
  return (
    <div>
      <dt className="text-muted">{label}</dt>
      <dd className="mt-0.5 text-navy">{value}</dd>
    </div>
  )
}

function StatusBadge({ status, t }) {
  const published = status === 'published'
  return (
    <span
      className={`inline-flex w-fit items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${
        published
          ? 'border-green-300 bg-green-100 text-green-800'
          : 'border-gray-300 bg-gray-100 text-gray-700'
      }`}
    >
      {t(`admin.resourcesAi.articles.status.${published ? 'published' : 'draft'}`)}
    </span>
  )
}

function Actions({ article, onDelete, t }) {
  if (article.status !== 'draft') {
    return (
      <div className="flex justify-end">
        <span className="inline-flex items-center gap-1.5 text-xs text-muted" title={t('admin.resourcesAi.articles.publishedLocked')}>
          <LockKeyhole size={13} aria-hidden="true" />
          {t('admin.resourcesAi.articles.locked')}
        </span>
      </div>
    )
  }

  return (
    <div className="flex flex-wrap justify-end gap-2">
      <Link
        to={`${ARTICLES_PATH}/${article.id}/modifier`}
        className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-navy transition-colors hover:border-accent hover:text-accent-deep"
      >
        <Pencil size={13} aria-hidden="true" />
        {t('admin.resourcesAi.articles.edit')}
      </Link>
      <button
        type="button"
        onClick={() => onDelete(article)}
        className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-700 transition-colors hover:border-red-300 hover:bg-red-50"
      >
        <Trash2 size={13} aria-hidden="true" />
        {t('admin.resourcesAi.articles.delete.action')}
      </button>
    </div>
  )
}

function Notice({ notice }) {
  return (
    <div
      role={notice.type === 'success' ? 'status' : 'alert'}
      className={`mb-5 rounded-xl border px-4 py-3 text-sm ${
        notice.type === 'success'
          ? 'border-green-200 bg-green-50 text-green-800'
          : 'border-red-200 bg-red-50 text-red-800'
      }`}
    >
      {notice.text}
    </div>
  )
}

function DeleteDialog({ article, deleting, onCancel, onConfirm, t }) {
  const title = article.title || t('admin.resourcesAi.articles.untitled')
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-navy/55 p-4"
      role="presentation"
      onMouseDown={(event) => {
        if (!deleting && event.target === event.currentTarget) onCancel()
      }}
    >
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl" role="dialog" aria-modal="true">
        <h2 className="font-heading text-xl font-bold text-navy">
          {t('admin.resourcesAi.articles.delete.title', { title })}
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          {t('admin.resourcesAi.articles.delete.description')}
        </p>
        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <button
            type="button"
            disabled={deleting}
            onClick={onCancel}
            className="rounded-full border border-gray-300 px-5 py-2.5 text-sm font-medium text-navy disabled:opacity-50"
          >
            {t('admin.resourcesAi.articles.delete.cancel')}
          </button>
          <button
            type="button"
            disabled={deleting}
            onClick={onConfirm}
            className="rounded-full bg-red-700 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
          >
            {deleting ? t('admin.resourcesAi.articles.delete.deleting') : t('admin.resourcesAi.articles.delete.action')}
          </button>
        </div>
      </div>
    </div>
  )
}

function LoadingState({ t }) {
  return (
    <Card className="flex min-h-72 items-center justify-center">
      <p className="text-sm text-muted">{t('admin.resourcesAi.articles.loading')}</p>
    </Card>
  )
}

function ErrorState({ code, onRetry, t }) {
  return (
    <Card className="flex min-h-72 flex-col items-center justify-center border-dashed text-center">
      <RotateCw size={24} className="text-accent" aria-hidden="true" />
      <h3 className="mt-4 font-heading text-lg font-bold text-navy">
        {t('admin.resourcesAi.articles.errorTitle')}
      </h3>
      <p className="mt-2 max-w-lg text-sm leading-relaxed text-muted">
        {t(`admin.resourcesAi.articles.errors.${code}`)}
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-5 rounded-full border border-gray-300 px-5 py-2 text-sm font-medium text-navy hover:border-accent"
      >
        {t('admin.resourcesAi.articles.retry')}
      </button>
    </Card>
  )
}

function EmptyState({ t }) {
  return (
    <Card className="flex min-h-72 flex-col items-center justify-center border-dashed px-6 text-center">
      <BookOpenText size={28} className="text-steel" aria-hidden="true" />
      <h3 className="mt-4 font-heading text-lg font-bold text-navy">
        {t('admin.resourcesAi.articles.emptyTitle')}
      </h3>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-muted">
        {t('admin.resourcesAi.articles.emptyDescription')}
      </p>
      <Link to={NEW_ARTICLE_PATH} className="mt-5 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white">
        {t('admin.resourcesAi.articles.add')}
      </Link>
    </Card>
  )
}

function FilteredEmpty({ onShowAll, t }) {
  return (
    <Card className="min-h-48 text-center">
      <h3 className="font-heading text-lg font-semibold text-navy">
        {t('admin.resourcesAi.articles.filteredEmptyTitle')}
      </h3>
      <button type="button" onClick={onShowAll} className="mt-5 rounded-full border border-gray-300 px-5 py-2 text-sm text-navy">
        {t('admin.resourcesAi.articles.showAll')}
      </button>
    </Card>
  )
}

function formatSeries(article, t) {
  if (!article.series_name && !article.episode_number) return ''
  if (!article.series_name) return t('admin.resourcesAi.articles.episode', { number: article.episode_number })
  if (!article.episode_number) return article.series_name
  return `${article.series_name} · ${t('admin.resourcesAi.articles.episode', { number: article.episode_number })}`
}

function formatLevel(level, t) {
  if (!level) return '—'
  return t(`admin.resourcesAi.articles.levels.${level}`, { defaultValue: level })
}

function formatDate(value, locale) {
  if (!value) return '—'
  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(new Date(value))
}
