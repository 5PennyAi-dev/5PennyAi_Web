import { ExternalLink, Pencil, Plus, RotateCw, Trash2 } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import AdminGuard from '@/components/admin/AdminGuard'
import AdminResourcesNav from '@/components/admin/resources/AdminResourcesNav'
import Card from '@/components/ui/Card'
import { deletePromptDraft, fetchAdminPrompts } from '@/lib/adminPrompts'

const LIST_PATH = '/admin/ressources-ia/prompts'

export default function AdminPrompts() {
  return <AdminGuard><AdminPromptsPage /></AdminGuard>
}

function AdminPromptsPage() {
  const { t, i18n } = useTranslation()
  const [prompts, setPrompts] = useState([])
  const [filter, setFilter] = useState('all')
  const [state, setState] = useState('loading')
  const [notice, setNotice] = useState(null)
  const [deleting, setDeleting] = useState(null)

  const load = useCallback(async () => {
    setState('loading')
    try {
      setPrompts(await fetchAdminPrompts())
      setState('ready')
    } catch (error) {
      console.error('Unable to load prompts:', error.cause?.message || error.message)
      setState(error.code || 'error')
    }
  }, [])
  useEffect(() => { load() }, [load])

  const visible = useMemo(() => filter === 'all' ? prompts : prompts.filter(({ status }) => status === filter), [filter, prompts])
  const counts = useMemo(() => ({ all: prompts.length, draft: prompts.filter(({ status }) => status === 'draft').length, published: prompts.filter(({ status }) => status === 'published').length }), [prompts])
  const locale = i18n.language?.startsWith('en') ? 'en-CA' : 'fr-CA'

  const remove = async (prompt) => {
    if (!window.confirm(t('admin.resourcesAi.prompts.deleteConfirm', { title: prompt.title || t('admin.resourcesAi.prompts.untitled') }))) return
    setDeleting(prompt.id)
    setNotice(null)
    try {
      const result = await deletePromptDraft(prompt.id)
      setPrompts((current) => current.filter(({ id }) => id !== prompt.id))
      setNotice({ type: result.cleanupFailed ? 'warning' : 'success', text: t(`admin.resourcesAi.prompts.${result.cleanupFailed ? 'deletedCleanupWarning' : 'deleted'}`) })
    } catch (error) {
      setNotice({ type: 'error', text: t(`admin.resourcesAi.prompts.errors.${error.code || 'delete'}`) })
    } finally {
      setDeleting(null)
    }
  }

  return (
    <section className="min-h-[90vh] bg-warm-gray pb-20 pt-28">
      <div className="mx-auto max-w-[1600px] px-4 sm:px-6">
        <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-accent">{t('admin.resourcesAi.brand')}</p>
        <h1 className="mb-7 font-heading text-3xl font-bold text-navy">{t('admin.resourcesAi.brand')}</h1>
        <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:items-start">
          <AdminResourcesNav active="prompts" />
          <div className="min-w-0">
            <div className="mb-7 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div><h2 className="font-heading text-3xl font-bold text-navy">{t('admin.resourcesAi.prompts.title')}</h2><p className="mt-2 text-sm text-muted">{t('admin.resourcesAi.prompts.subtitle')}</p></div>
              <Link to={`${LIST_PATH}/nouveau`} className="inline-flex items-center justify-center gap-2 rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-white"><Plus size={16} aria-hidden="true" />{t('admin.resourcesAi.prompts.add')}</Link>
            </div>
            {notice && <Notice notice={notice} />}
            {state === 'ready' && prompts.length > 0 && (
              <div className="mb-5 flex flex-wrap gap-2" aria-label={t('admin.resourcesAi.prompts.filters.label')}>
                {['all', 'draft', 'published'].map((value) => <button key={value} type="button" aria-pressed={filter === value} onClick={() => setFilter(value)} className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${filter === value ? 'border-accent bg-accent/10 text-accent-deep' : 'border-gray-200 bg-white text-muted'}`}>{t(`admin.resourcesAi.prompts.filters.${value}`)} <span className="ml-1">{counts[value]}</span></button>)}
              </div>
            )}
            {state === 'loading' ? <StateCard text={t('admin.resourcesAi.prompts.loading')} /> : state !== 'ready' ? <StateCard text={t(`admin.resourcesAi.prompts.errors.${state}`)} action={<button type="button" onClick={load} className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-accent-deep"><RotateCw size={15} aria-hidden="true" />{t('admin.resourcesAi.prompts.retry')}</button>} /> : prompts.length === 0 ? <StateCard text={t('admin.resourcesAi.prompts.empty')} /> : visible.length === 0 ? <StateCard text={t('admin.resourcesAi.prompts.filteredEmpty')} /> : (
              <Card className="overflow-x-auto p-0">
                <table className="min-w-[1080px] w-full text-left text-sm">
                  <thead className="border-b border-gray-200 bg-surface text-[11px] uppercase tracking-wider text-muted"><tr>{['titleColumn', 'category', 'level', 'language', 'status', 'thumbnail', 'updated', 'published', 'actions'].map((key) => <th key={key} className="px-4 py-3">{t(`admin.resourcesAi.prompts.${key}`)}</th>)}</tr></thead>
                  <tbody className="divide-y divide-gray-100">{visible.map((prompt) => (
                    <tr key={prompt.id}>
                      <td className="max-w-xs truncate px-4 py-4 font-semibold text-navy">{prompt.title || t('admin.resourcesAi.prompts.untitled')}</td>
                      <td className="px-4 py-4">{label(t, 'categories', prompt.category)}</td>
                      <td className="px-4 py-4">{label(t, 'levels', prompt.level)}</td>
                      <td className="px-4 py-4">{prompt.language || '—'}</td>
                      <td className="px-4 py-4">{t(`admin.resourcesAi.prompts.statuses.${prompt.status}`, { defaultValue: prompt.status })}</td>
                      <td className="px-4 py-4">{prompt.thumbnail_path ? t('admin.resourcesAi.prompts.yes') : t('admin.resourcesAi.prompts.no')}</td>
                      <td className="px-4 py-4 text-xs text-muted">{formatDate(prompt.updated_at, locale)}</td>
                      <td className="px-4 py-4 text-xs text-muted">{formatDate(prompt.published_at, locale)}</td>
                      <td className="px-4 py-4"><div className="flex gap-2">
                        <Link to={`${LIST_PATH}/${prompt.id}/modifier`} className="rounded-lg border border-gray-200 p-2 text-navy" aria-label={t('admin.resourcesAi.prompts.edit')}><Pencil size={15} aria-hidden="true" /></Link>
                        {prompt.status === 'published' && prompt.slug
                          ? <a href={`/ressources-ia/prompts/${prompt.slug}`} target="_blank" rel="noopener noreferrer" className="rounded-lg border border-gray-200 p-2 text-navy" aria-label={t('admin.resourcesAi.prompts.view')}><ExternalLink size={15} aria-hidden="true" /></a>
                          : <Link to={`${LIST_PATH}/${prompt.id}/modifier#prompt-preview`} className="rounded-lg border border-gray-200 p-2 text-navy" aria-label={t('admin.resourcesAi.prompts.preview')}><ExternalLink size={15} aria-hidden="true" /></Link>}
                        <button type="button" disabled={prompt.status !== 'draft' || deleting === prompt.id} onClick={() => remove(prompt)} className="rounded-lg border border-gray-200 p-2 text-red-700 disabled:opacity-35" aria-label={t('admin.resourcesAi.prompts.delete')}><Trash2 size={15} aria-hidden="true" /></button>
                      </div></td>
                    </tr>
                  ))}</tbody>
                </table>
              </Card>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

function label(t, group, value) {
  return value ? t(`admin.resourcesAi.promptTaxonomies.${group}.${value}`, { defaultValue: value }) : '—'
}

function formatDate(value, locale) {
  const timestamp = Date.parse(value)
  return Number.isFinite(timestamp) ? new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(timestamp) : '—'
}

function Notice({ notice }) {
  return <p role={notice.type === 'error' ? 'alert' : 'status'} className={`mb-5 rounded-xl border px-4 py-3 text-sm ${notice.type === 'error' ? 'border-red-200 bg-red-50 text-red-800' : notice.type === 'warning' ? 'border-amber-200 bg-amber-50 text-amber-900' : 'border-green-200 bg-green-50 text-green-800'}`}>{notice.text}</p>
}

function StateCard({ action, text }) {
  return <Card className="p-10 text-center"><p role="status" className="text-sm text-muted">{text}</p>{action}</Card>
}
