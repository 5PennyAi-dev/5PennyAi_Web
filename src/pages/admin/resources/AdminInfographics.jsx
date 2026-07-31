import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Eye,
  Image as ImageIcon,
  Images,
  MoreHorizontal,
  Pencil,
  Plus,
  RotateCw,
  Trash2,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import AdminGuard from '@/components/admin/AdminGuard'
import Card from '@/components/ui/Card'
import { isInfographicThumbnailPathForResource } from '@/lib/infographicThumbnails'
import { supabase } from '@/lib/supabase'

const INFOGRAPHICS_PATH = '/admin/ressources-ia/infographies'
const NEW_INFOGRAPHIC_PATH = `${INFOGRAPHICS_PATH}/nouvelle`
const BUCKET = 'infographics'
const LIST_COLUMNS =
  'id, status, title, theme, series_name, episode_number, updated_at, image_path, image_metadata, thumbnail_path'

export default function AdminInfographics() {
  return (
    <AdminGuard>
      <AdminInfographicsPage />
    </AdminGuard>
  )
}

function AdminInfographicsPage() {
  const { t, i18n } = useTranslation()
  const [infographics, setInfographics] = useState([])
  const [activeFilter, setActiveFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [notice, setNotice] = useState(null)

  const loadInfographics = useCallback(async () => {
    setLoading(true)
    setError(false)

    try {
      const data = await fetchInfographics()
      setInfographics(data)
    } catch (loadError) {
      console.error('Unable to load infographics:', loadError.message)
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    fetchInfographics()
      .then((data) => {
        if (!cancelled) setInfographics(data)
      })
      .catch((loadError) => {
        console.error('Unable to load infographics:', loadError.message)
        if (!cancelled) setError(true)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  const counts = useMemo(
    () => ({
      all: infographics.length,
      draft: infographics.filter((item) => item.status === 'draft').length,
      published: infographics.filter((item) => item.status === 'published').length,
    }),
    [infographics],
  )

  const filteredInfographics = useMemo(() => {
    if (activeFilter === 'all') return infographics
    return infographics.filter((item) => item.status === activeFilter)
  }, [activeFilter, infographics])

  const locale = i18n.language?.startsWith('en') ? 'en-CA' : 'fr-CA'

  const confirmDelete = async () => {
    if (!deleteTarget || deleting) return

    setDeleting(true)
    setNotice(null)
    let failureType = 'general'

    try {
      if (deleteTarget.image_path) {
        failureType = 'image'
        const storage = supabase.storage.from(BUCKET)
        const { data: imageExists, error: existsError } = await storage.exists(
          deleteTarget.image_path,
        )

        if (existsError) throw existsError

        if (imageExists) {
          const { error: removeError } = await storage.remove([deleteTarget.image_path])
          if (removeError) throw removeError
        }
      }

      failureType = 'row'
      const { error: deleteError } = await supabase
        .from('infographics')
        .delete()
        .eq('id', deleteTarget.id)

      if (deleteError) throw deleteError

      let cleanupWarning = false
      if (deleteTarget.thumbnail_path) {
        if (isInfographicThumbnailPathForResource(deleteTarget.thumbnail_path, deleteTarget.id)) {
          const { error: thumbnailRemoveError } = await supabase.storage
            .from(BUCKET)
            .remove([deleteTarget.thumbnail_path])
          cleanupWarning = Boolean(thumbnailRemoveError)
          if (thumbnailRemoveError) {
            console.warn('Unable to remove infographic thumbnail:', thumbnailRemoveError.message)
          }
        } else {
          cleanupWarning = true
          console.warn('Infographic thumbnail path was outside the resource prefix.')
        }
      }

      const deletedTitle =
        deleteTarget.title || t('admin.resourcesAi.infographics.delete.fallbackTitle')
      setInfographics((current) => current.filter((item) => item.id !== deleteTarget.id))
      setDeleteTarget(null)
      setNotice({
        type: cleanupWarning ? 'warning' : 'success',
        text: cleanupWarning
          ? t('admin.resourcesAi.infographics.delete.successCleanupWarning', { title: deletedTitle })
          : t('admin.resourcesAi.infographics.delete.success', { title: deletedTitle }),
      })
    } catch (deleteError) {
      console.error(`Unable to delete infographic (${failureType}):`, deleteError.message)
      setNotice({
        type: 'error',
        text: t(`admin.resourcesAi.infographics.delete.errors.${failureType}`),
      })
    } finally {
      setDeleting(false)
    }
  }

  return (
    <section className="min-h-[90vh] bg-warm-gray pt-24 pb-16 md:pt-28 md:pb-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-7">
          <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-accent">
            {t('admin.resourcesAi.brand')}
          </p>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-navy md:text-3xl">
            {t('admin.resourcesAi.brand')}
          </h1>
        </div>

        <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:items-start">
          <Card className="p-4 sm:p-5 lg:sticky lg:top-24">
            <nav aria-label={t('admin.resourcesAi.navigationLabel')}>
              <p className="px-3 pb-2 text-[11px] font-bold uppercase tracking-[0.14em] text-navy/45">
                {t('admin.resourcesAi.group')}
              </p>
              <Link
                to={INFOGRAPHICS_PATH}
                aria-current="page"
                className="flex items-center gap-3 rounded-xl border border-accent/25 bg-accent/10 px-3 py-2.5 text-sm font-semibold text-navy"
              >
                <Images size={17} strokeWidth={1.9} className="text-accent" aria-hidden="true" />
                {t('admin.resourcesAi.infographics.navLabel')}
              </Link>
            </nav>
          </Card>

          <div className="min-w-0">
            <div className="mb-7 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="font-heading text-2xl font-bold tracking-tight text-navy md:text-3xl">
                  {t('admin.resourcesAi.infographics.title')}
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
                  {t('admin.resourcesAi.infographics.subtitle')}
                </p>
              </div>

              <div className="sm:text-right">
                <Link
                  to={NEW_INFOGRAPHIC_PATH}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-white transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Plus size={16} strokeWidth={2.2} aria-hidden="true" />
                  {t('admin.resourcesAi.infographics.add')}
                </Link>
              </div>
            </div>

            {!loading && !error && infographics.length > 0 && (
              <InfographicFilters
                activeFilter={activeFilter}
                counts={counts}
                onChange={setActiveFilter}
                t={t}
              />
            )}

            {notice && <DeletionNotice notice={notice} />}

            {loading ? (
              <LoadingState t={t} />
            ) : error ? (
              <ErrorState onRetry={loadInfographics} t={t} />
            ) : infographics.length === 0 ? (
              <GlobalEmptyState t={t} />
            ) : filteredInfographics.length === 0 ? (
              <FilteredEmptyState onShowAll={() => setActiveFilter('all')} t={t} />
            ) : (
              <InfographicList
                infographics={filteredInfographics}
                locale={locale}
                onDelete={setDeleteTarget}
                t={t}
              />
            )}
          </div>
        </div>
      </div>

      {deleteTarget && (
        <DeleteDialog
          deleting={deleting}
          infographic={deleteTarget}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={confirmDelete}
          t={t}
        />
      )}
    </section>
  )
}

function InfographicFilters({ activeFilter, counts, onChange, t }) {
  const filters = ['all', 'draft', 'published']

  return (
    <div
      className="mb-5 flex flex-wrap items-center gap-2"
      aria-label={t('admin.resourcesAi.infographics.filters.label')}
    >
      {filters.map((filter) => {
        const active = activeFilter === filter
        return (
          <button
            key={filter}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(filter)}
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors duration-200 ${
              active
                ? 'border-accent bg-accent/10 text-accent-deep'
                : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:text-navy'
            }`}
          >
            {t(`admin.resourcesAi.infographics.filters.${filter}`)}
            <span
              className={`tnum rounded-full px-1.5 py-0.5 text-[10px] ${
                active ? 'bg-white/75 text-accent-deep' : 'bg-gray-100 text-gray-500'
              }`}
            >
              {counts[filter]}
            </span>
          </button>
        )
      })}
    </div>
  )
}

function InfographicList({ infographics, locale, onDelete, t }) {
  return (
    <>
      <div className="hidden overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm md:block">
        <div className="grid grid-cols-[76px_minmax(180px,1.5fr)_minmax(100px,0.8fr)_110px_130px_170px] items-center gap-4 border-b border-gray-200 bg-surface px-5 py-3 text-[11px] font-medium uppercase tracking-wider text-gray-400">
          <span>{t('admin.resourcesAi.infographics.columns.infographic')}</span>
          <span>{t('admin.resourcesAi.infographics.columns.title')}</span>
          <span>{t('admin.resourcesAi.infographics.columns.theme')}</span>
          <span>{t('admin.resourcesAi.infographics.columns.status')}</span>
          <span>{t('admin.resourcesAi.infographics.columns.updated')}</span>
          <span className="text-right">{t('admin.resourcesAi.infographics.columns.actions')}</span>
        </div>

        <ul className="divide-y divide-gray-100">
          {infographics.map((infographic) => (
            <li
              key={infographic.id}
              className="grid grid-cols-[76px_minmax(180px,1.5fr)_minmax(100px,0.8fr)_110px_130px_170px] items-center gap-4 px-5 py-4"
            >
              <InfographicThumbnail infographic={infographic} t={t} />
              <InfographicIdentity infographic={infographic} t={t} />
              <p className="text-sm text-navy/75">{infographic.theme || '—'}</p>
              <StatusBadge status={infographic.status} t={t} />
              <time
                dateTime={infographic.updated_at}
                className="tnum text-xs text-muted"
              >
                {formatDate(infographic.updated_at, locale)}
              </time>
              <div className="text-right">
                <AdminActions infographic={infographic} onDelete={onDelete} t={t} />
              </div>
            </li>
          ))}
        </ul>
      </div>

      <ul className="space-y-3 md:hidden">
        {infographics.map((infographic) => (
          <li
            key={infographic.id}
            className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
          >
            <div className="flex gap-4">
              <InfographicThumbnail infographic={infographic} t={t} />
              <div className="min-w-0 flex-1">
                <InfographicIdentity infographic={infographic} t={t} />
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <StatusBadge status={infographic.status} t={t} />
                  {infographic.theme && (
                    <span className="rounded-md bg-lavender/40 px-2 py-0.5 text-xs text-navy/70">
                      {infographic.theme}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between gap-3 border-t border-gray-100 pt-3">
              <p className="text-xs text-muted">
                {t('admin.resourcesAi.infographics.updatedLabel')}{' '}
                <time dateTime={infographic.updated_at} className="tnum">
                  {formatDate(infographic.updated_at, locale)}
                </time>
              </p>
              <AdminActions infographic={infographic} mobile onDelete={onDelete} t={t} />
            </div>
          </li>
        ))}
      </ul>
    </>
  )
}

function InfographicThumbnail({ infographic, t }) {
  const [failed, setFailed] = useState(false)
  const imageUrl = infographic.image_path
    ? supabase.storage.from(BUCKET).getPublicUrl(infographic.image_path).data.publicUrl
    : null

  return (
    <div className="flex h-[72px] w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-gray-200 bg-surface">
      {imageUrl && !failed ? (
        <img
          src={imageUrl}
          alt={t('admin.resourcesAi.infographics.thumbnailAlt', {
            title: infographic.title || t('admin.resourcesAi.infographics.untitled'),
          })}
          className="h-full w-full object-contain"
          onError={() => setFailed(true)}
        />
      ) : (
        <ImageIcon size={20} strokeWidth={1.6} className="text-steel" aria-hidden="true" />
      )}
    </div>
  )
}

function InfographicIdentity({ infographic, t }) {
  const series = formatSeries(infographic, t)

  return (
    <div className="min-w-0">
      <p className="truncate font-heading text-sm font-semibold text-navy">
        {infographic.title || t('admin.resourcesAi.infographics.untitled')}
      </p>
      {series && <p className="mt-1 truncate text-xs text-muted">{series}</p>}
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
      {t(`admin.resourcesAi.infographics.status.${published ? 'published' : 'draft'}`)}
    </span>
  )
}

function AdminActions({ infographic, mobile = false, onDelete, t }) {
  if (mobile) {
    return (
      <div className="flex shrink-0 items-center justify-end gap-2">
        <EditAction infographic={infographic} t={t} />
        <details className="group relative">
          <summary
            className="flex h-8 w-8 cursor-pointer list-none items-center justify-center rounded-lg border border-gray-200 text-navy transition-colors hover:border-accent hover:text-accent-deep [&::-webkit-details-marker]:hidden"
            aria-label={t('admin.resourcesAi.infographics.moreActions')}
          >
            <MoreHorizontal size={16} strokeWidth={1.9} aria-hidden="true" />
          </summary>
          <div className="absolute right-0 z-20 mt-2 min-w-36 rounded-lg border border-gray-200 bg-white p-1.5 text-left shadow-lg">
            {infographic.status === 'published' && (
              <Link
                to={`/ressources-ia/infographies/${infographic.id}`}
                className="flex items-center gap-2 rounded-md px-3 py-2 text-xs font-medium text-navy transition-colors hover:bg-surface hover:text-accent-deep"
              >
                <Eye size={13} strokeWidth={1.8} aria-hidden="true" />
                {t('admin.resourcesAi.infographics.view')}
              </Link>
            )}
            <button
              type="button"
              onClick={() => onDelete(infographic)}
              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-xs font-medium text-red-700 transition-colors hover:bg-red-50"
            >
              <Trash2 size={13} strokeWidth={1.8} aria-hidden="true" />
              {t('admin.resourcesAi.infographics.delete.action')}
            </button>
          </div>
        </details>
      </div>
    )
  }

  return (
    <div className="flex flex-wrap justify-end gap-2">
      {infographic.status === 'published' && (
        <Link
          to={`/ressources-ia/infographies/${infographic.id}`}
          className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-navy transition-colors hover:border-accent hover:text-accent-deep"
        >
          <Eye size={13} strokeWidth={1.8} aria-hidden="true" />
          {t('admin.resourcesAi.infographics.view')}
        </Link>
      )}
      <EditAction infographic={infographic} t={t} />
      <button
        type="button"
        onClick={() => onDelete(infographic)}
        className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-700 transition-colors hover:border-red-300 hover:bg-red-50"
      >
        <Trash2 size={13} strokeWidth={1.8} aria-hidden="true" />
        {t('admin.resourcesAi.infographics.delete.action')}
      </button>
    </div>
  )
}

function EditAction({ infographic, t }) {
  return (
    <Link
      to={`${INFOGRAPHICS_PATH}/${infographic.id}/modifier`}
      className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-navy transition-colors hover:border-accent hover:text-accent-deep"
    >
      <Pencil size={13} strokeWidth={1.8} aria-hidden="true" />
      {t('admin.resourcesAi.infographics.edit')}
    </Link>
  )
}

function DeletionNotice({ notice }) {
  const success = notice.type === 'success'
  const warning = notice.type === 'warning'

  return (
    <div
      role={success || warning ? 'status' : 'alert'}
      className={`mb-5 rounded-xl border px-4 py-3 text-sm ${
        success
          ? 'border-green-200 bg-green-50 text-green-800'
          : warning
            ? 'border-amber-200 bg-amber-50 text-amber-900'
            : 'border-red-200 bg-red-50 text-red-800'
      }`}
    >
      {notice.text}
    </div>
  )
}

function DeleteDialog({ deleting, infographic, onCancel, onConfirm, t }) {
  const title = infographic.title || t('admin.resourcesAi.infographics.delete.fallbackTitle')

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-navy/55 p-4"
      role="presentation"
      onMouseDown={(event) => {
        if (!deleting && event.target === event.currentTarget) onCancel()
      }}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-infographic-title"
        aria-describedby="delete-infographic-description"
        className="my-auto w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl sm:p-6"
      >
        <h2
          id="delete-infographic-title"
          className="font-heading text-xl font-bold tracking-tight text-navy"
        >
          {t('admin.resourcesAi.infographics.delete.title', { title })}
        </h2>
        <div id="delete-infographic-description" className="mt-3 space-y-2 text-sm text-muted">
          <p>{t('admin.resourcesAi.infographics.delete.permanent')}</p>
          {infographic.image_path && (
            <p>{t('admin.resourcesAi.infographics.delete.withImage')}</p>
          )}
          {infographic.thumbnail_path && (
            <p>{t('admin.resourcesAi.infographics.delete.withThumbnail')}</p>
          )}
        </div>
        {deleting && (
          <p className="mt-4 text-sm font-medium text-accent-deep" role="status">
            {t('admin.resourcesAi.infographics.delete.deleting')}
          </p>
        )}
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={deleting}
            className="rounded-full border border-gray-300 px-5 py-2.5 text-sm font-medium text-navy transition-colors hover:border-gray-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {t('admin.resourcesAi.infographics.delete.cancel')}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={deleting}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-red-700 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Trash2 size={15} strokeWidth={2} aria-hidden="true" />
            {deleting
              ? t('admin.resourcesAi.infographics.delete.deleting')
              : t('admin.resourcesAi.infographics.delete.action')}
          </button>
        </div>
      </div>
    </div>
  )
}

function LoadingState({ t }) {
  return (
    <div aria-live="polite" aria-busy="true">
      <p className="sr-only">{t('admin.resourcesAi.infographics.loading')}</p>
      <div className="hidden overflow-hidden rounded-xl border border-gray-200 bg-white md:block">
        <div className="h-11 border-b border-gray-200 bg-surface" />
        <div className="divide-y divide-gray-100">
          {[0, 1, 2].map((item) => (
            <div key={item} className="flex items-center gap-5 px-5 py-4">
              <div className="h-[72px] w-14 animate-pulse rounded-lg bg-gray-200" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-2/5 animate-pulse rounded bg-gray-200" />
                <div className="h-3 w-1/4 animate-pulse rounded bg-gray-100" />
              </div>
              <div className="h-6 w-20 animate-pulse rounded-full bg-gray-100" />
            </div>
          ))}
        </div>
      </div>
      <div className="space-y-3 md:hidden">
        {[0, 1].map((item) => (
          <div key={item} className="flex gap-4 rounded-xl border border-gray-200 bg-white p-4">
            <div className="h-[72px] w-14 animate-pulse rounded-lg bg-gray-200" />
            <div className="flex-1 space-y-3 py-1">
              <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200" />
              <div className="h-3 w-1/2 animate-pulse rounded bg-gray-100" />
              <div className="h-5 w-20 animate-pulse rounded-full bg-gray-100" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ErrorState({ onRetry, t }) {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
      <h3 className="font-heading text-lg font-semibold text-red-800">
        {t('admin.resourcesAi.infographics.errorTitle')}
      </h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-red-700">
        {t('admin.resourcesAi.infographics.errorDescription')}
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-5 inline-flex items-center gap-2 rounded-full border border-red-200 bg-white px-5 py-2 text-sm font-medium text-red-700 transition-colors duration-200 hover:bg-red-100"
      >
        <RotateCw size={15} strokeWidth={1.9} aria-hidden="true" />
        {t('admin.resourcesAi.infographics.retry')}
      </button>
    </div>
  )
}

function GlobalEmptyState({ t }) {
  return (
    <Card className="flex min-h-72 flex-col items-center justify-center border-dashed px-6 py-12 text-center">
      <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-lavender/45 text-navy">
        <Images size={25} strokeWidth={1.7} aria-hidden="true" />
      </div>
      <h3 className="font-heading text-lg font-bold tracking-tight text-navy">
        {t('admin.resourcesAi.infographics.emptyTitle')}
      </h3>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-muted">
        {t('admin.resourcesAi.infographics.emptyDescription')}
      </p>
      <Link
        to={NEW_INFOGRAPHIC_PATH}
        className="mt-6 inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white"
      >
        <Plus size={15} aria-hidden="true" />
        {t('admin.resourcesAi.infographics.add')}
      </Link>
    </Card>
  )
}

function FilteredEmptyState({ onShowAll, t }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white px-6 py-10 text-center shadow-sm">
      <h3 className="font-heading text-lg font-semibold text-navy">
        {t('admin.resourcesAi.infographics.filteredEmptyTitle')}
      </h3>
      <p className="mt-2 text-sm text-muted">
        {t('admin.resourcesAi.infographics.filteredEmptyDescription')}
      </p>
      <button
        type="button"
        onClick={onShowAll}
        className="mt-5 rounded-full border border-gray-300 px-5 py-2 text-sm font-medium text-navy transition-colors duration-200 hover:border-accent hover:text-accent-deep"
      >
        {t('admin.resourcesAi.infographics.showAll')}
      </button>
    </div>
  )
}

function formatSeries(infographic, t) {
  if (!infographic.series_name) return null
  if (!infographic.episode_number) return infographic.series_name
  return `${infographic.series_name} · ${t('admin.resourcesAi.infographics.episode', {
    number: infographic.episode_number,
  })}`
}

function formatDate(value, locale) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'

  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date)
}

async function fetchInfographics() {
  const { data, error } = await supabase
    .from('infographics')
    .select(LIST_COLUMNS)
    .order('updated_at', { ascending: false })

  if (error) throw error
  return data || []
}
