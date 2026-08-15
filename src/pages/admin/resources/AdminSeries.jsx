import { ExternalLink, Image as ImageIcon, Layers3, Pencil, Plus, RotateCw, Trash2 } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import AdminGuard from '@/components/admin/AdminGuard'
import AdminResourcesNav from '@/components/admin/resources/AdminResourcesNav'
import Card from '@/components/ui/Card'
import {
  deleteAdminResourceSeries,
  fetchAdminResourceSeries,
  SERIES_THUMBNAIL_BUCKET,
} from '@/lib/adminResourceSeries'
import { supabase } from '@/lib/supabase'

const SERIES_PATH = '/admin/ressources-ia/series'

export default function AdminSeries() {
  return <AdminGuard><AdminSeriesPage /></AdminGuard>
}

function AdminSeriesPage() {
  const { t, i18n } = useTranslation()
  const [series, setSeries] = useState([])
  const [state, setState] = useState('loading')
  const [notice, setNotice] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const locale = i18n.language?.startsWith('en') ? 'en-CA' : 'fr-CA'

  const load = useCallback(async () => {
    setState('loading')
    try {
      setSeries(await fetchAdminResourceSeries())
      setState('ready')
    } catch (error) {
      console.error('Unable to load resource series:', error.cause?.message || error.message)
      setState(error.code || 'load')
    }
  }, [])

  useEffect(() => { load() }, [load])

  const confirmDelete = async () => {
    if (!deleteTarget || deleting) return
    setDeleting(true)
    setNotice(null)
    try {
      const result = await deleteAdminResourceSeries(deleteTarget)
      setSeries((current) => current.filter(({ id }) => id !== deleteTarget.id))
      setDeleteTarget(null)
      setNotice({
        type: result.cleanupFailed ? 'warning' : 'success',
        text: t(`admin.resourcesAi.series.${result.cleanupFailed ? 'deletedCleanupWarning' : 'deleted'}`),
      })
    } catch (error) {
      console.error('Unable to delete resource series:', error.cause?.message || error.message)
      setNotice({ type: 'error', text: t(`admin.resourcesAi.series.errors.${error.code || 'delete'}`) })
    } finally {
      setDeleting(false)
    }
  }

  return (
    <section className="min-h-[90vh] bg-warm-gray pb-20 pt-28">
      <div className="mx-auto max-w-[1600px] px-4 sm:px-6">
        <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-accent">{t('admin.resourcesAi.brand')}</p>
        <h1 className="mb-7 font-heading text-2xl font-bold text-navy md:text-3xl">{t('admin.resourcesAi.brand')}</h1>
        <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:items-start">
          <AdminResourcesNav active="series" />
          <div className="min-w-0">
            <header className="mb-7 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="font-heading text-2xl font-bold text-navy md:text-3xl">{t('admin.resourcesAi.series.title')}</h2>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">{t('admin.resourcesAi.series.subtitle')}</p>
              </div>
              <Link to={`${SERIES_PATH}/nouvelle`} className="inline-flex items-center justify-center gap-2 rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-white hover:brightness-95">
                <Plus size={16} aria-hidden="true" />{t('admin.resourcesAi.series.add')}
              </Link>
            </header>

            {notice && <Notice notice={notice} />}
            {state === 'loading' ? (
              <StateCard text={t('admin.resourcesAi.series.loading')} />
            ) : state !== 'ready' ? (
              <StateCard
                text={t(`admin.resourcesAi.series.errors.${state}`)}
                action={<button type="button" onClick={load} className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-accent-deep"><RotateCw size={15} aria-hidden="true" />{t('admin.resourcesAi.series.retry')}</button>}
              />
            ) : series.length === 0 ? (
              <StateCard text={t('admin.resourcesAi.series.empty')} />
            ) : (
              <SeriesList rows={series} locale={locale} onDelete={setDeleteTarget} t={t} />
            )}
          </div>
        </div>
      </div>

      {deleteTarget && (
        <DeleteDialog
          deleting={deleting}
          series={deleteTarget}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={confirmDelete}
          t={t}
        />
      )}
    </section>
  )
}

function SeriesList({ rows, locale, onDelete, t }) {
  return (
    <>
      <Card className="hidden overflow-x-auto p-0 md:block">
        <table className="w-full min-w-[960px] text-left text-sm">
          <thead className="border-b border-gray-200 bg-surface text-[11px] uppercase tracking-wider text-muted">
            <tr>{['name', 'slug', 'resources', 'published', 'thumbnail', 'updated', 'actions'].map((key) => <th key={key} className="px-4 py-3">{t(`admin.resourcesAi.series.columns.${key}`)}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.map((series) => (
              <tr key={series.id}>
                <td className="max-w-xs px-4 py-4 font-semibold text-navy">{series.name}</td>
                <td className="max-w-xs truncate px-4 py-4 font-mono text-xs text-navy/70">{series.slug}</td>
                <td className="tnum px-4 py-4">{series.resourceCount}</td>
                <td className="tnum px-4 py-4">{series.publishedCount}</td>
                <td className="px-4 py-4"><SeriesThumbnail series={series} t={t} /></td>
                <td className="px-4 py-4 text-xs text-muted">{formatDate(series.updated_at, locale)}</td>
                <td className="px-4 py-4"><SeriesActions series={series} onDelete={onDelete} t={t} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <ul className="space-y-3 md:hidden">
        {rows.map((series) => (
          <li key={series.id} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <SeriesThumbnail series={series} t={t} large />
              <div className="min-w-0 flex-1">
                <h3 className="font-heading text-base font-semibold text-navy">{series.name}</h3>
                <p className="mt-1 break-all font-mono text-xs text-muted">{series.slug}</p>
              </div>
            </div>
            <dl className="mt-4 grid grid-cols-3 gap-3 border-t border-gray-100 pt-3 text-xs">
              <Meta label={t('admin.resourcesAi.series.columns.resources')} value={series.resourceCount} />
              <Meta label={t('admin.resourcesAi.series.columns.published')} value={series.publishedCount} />
              <Meta label={t('admin.resourcesAi.series.columns.updated')} value={formatDate(series.updated_at, locale)} />
            </dl>
            <div className="mt-4 border-t border-gray-100 pt-3"><SeriesActions series={series} onDelete={onDelete} t={t} /></div>
          </li>
        ))}
      </ul>
    </>
  )
}

function SeriesThumbnail({ large = false, series, t }) {
  const url = series.thumbnail_path
    ? supabase.storage.from(SERIES_THUMBNAIL_BUCKET).getPublicUrl(series.thumbnail_path).data.publicUrl
    : null
  return (
    <div className={`flex shrink-0 items-center justify-center overflow-hidden rounded-lg border border-gray-200 bg-surface ${large ? 'h-16 w-24' : 'h-12 w-20'}`}>
      {url ? <img src={url} alt={t('admin.resourcesAi.series.thumbnailAlt', { name: series.name })} className="h-full w-full object-contain" /> : <ImageIcon size={20} className="text-steel" aria-hidden="true" />}
    </div>
  )
}

function SeriesActions({ series, onDelete, t }) {
  return (
    <div className="flex flex-wrap gap-2">
      <Link to={`${SERIES_PATH}/${series.id}`} className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-navy hover:border-accent"><Pencil size={13} aria-hidden="true" />{t('admin.resourcesAi.series.edit')}</Link>
      {series.publishedCount > 0 && <a href={`/ressources-ia/series/${series.slug}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-navy hover:border-accent"><ExternalLink size={13} aria-hidden="true" />{t('admin.resourcesAi.series.view')}</a>}
      <button type="button" onClick={() => onDelete(series)} className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50"><Trash2 size={13} aria-hidden="true" />{t('admin.resourcesAi.series.delete')}</button>
    </div>
  )
}

function DeleteDialog({ deleting, onCancel, onConfirm, series, t }) {
  const hasResources = series.resourceCount > 0
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/55 p-4" role="presentation" onMouseDown={(event) => { if (!deleting && event.target === event.currentTarget) onCancel() }}>
      <div role="alertdialog" aria-modal="true" aria-labelledby="delete-series-title" aria-describedby="delete-series-description" className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <h2 id="delete-series-title" className="font-heading text-xl font-bold text-navy">{t('admin.resourcesAi.series.deleteTitle', { name: series.name })}</h2>
        <p id="delete-series-description" className="mt-3 text-sm leading-relaxed text-muted">{t(`admin.resourcesAi.series.${hasResources ? 'deleteWithResources' : 'deleteEmpty'}`, { count: series.resourceCount })}</p>
        {deleting && <p role="status" className="mt-4 text-sm font-semibold text-accent-deep">{t('admin.resourcesAi.series.deleting')}</p>}
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button type="button" disabled={deleting} onClick={onCancel} className="rounded-full border border-gray-300 px-5 py-2.5 text-sm font-medium text-navy disabled:opacity-50">{t('admin.resourcesAi.series.cancel')}</button>
          <button type="button" disabled={deleting} onClick={onConfirm} className="inline-flex items-center justify-center gap-2 rounded-full bg-red-700 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"><Trash2 size={15} aria-hidden="true" />{t('admin.resourcesAi.series.delete')}</button>
        </div>
      </div>
    </div>
  )
}

function Meta({ label, value }) {
  return <div><dt className="font-semibold text-navy/55">{label}</dt><dd className="mt-1 text-navy">{value}</dd></div>
}

function Notice({ notice }) {
  return <p role={notice.type === 'error' ? 'alert' : 'status'} className={`mb-5 rounded-xl border px-4 py-3 text-sm ${notice.type === 'error' ? 'border-red-200 bg-red-50 text-red-800' : notice.type === 'warning' ? 'border-amber-200 bg-amber-50 text-amber-900' : 'border-green-200 bg-green-50 text-green-800'}`}>{notice.text}</p>
}

function StateCard({ action, text }) {
  return <Card className="flex min-h-64 flex-col items-center justify-center p-10 text-center"><Layers3 size={30} className="mb-4 text-steel" aria-hidden="true" /><p role="status" className="text-sm text-muted">{text}</p>{action}</Card>
}

function formatDate(value, locale) {
  const timestamp = Date.parse(value)
  return Number.isFinite(timestamp) ? new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(timestamp) : '—'
}
