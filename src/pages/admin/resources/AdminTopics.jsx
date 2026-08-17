import { Layers3, Pencil, Plus, RotateCw, Trash2 } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import AdminGuard from '@/components/admin/AdminGuard'
import AdminResourcesNav from '@/components/admin/resources/AdminResourcesNav'
import Card from '@/components/ui/Card'
import { deleteAdminResourceTopic, fetchAdminResourceTopics } from '@/lib/adminResourceTopics'

const TOPICS_PATH = '/admin/ressources-ia/sujets'

export default function AdminTopics() {
  return <AdminGuard><AdminTopicsPage /></AdminGuard>
}

function AdminTopicsPage() {
  const { t, i18n } = useTranslation()
  const [topics, setTopics] = useState([])
  const [state, setState] = useState('loading')
  const [notice, setNotice] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const locale = i18n.language?.startsWith('en') ? 'en-CA' : 'fr-CA'
  const load = useCallback(async () => {
    setState('loading')
    try { setTopics(await fetchAdminResourceTopics()); setState('ready') } catch (error) { setState(error.code || 'load') }
  }, [])
  useEffect(() => { load() }, [load])

  const confirmDelete = async () => {
    if (!deleteTarget || deleting) return
    setDeleting(true)
    try {
      await deleteAdminResourceTopic(deleteTarget)
      setTopics((current) => current.filter(({ id }) => id !== deleteTarget.id))
      setNotice({ type: 'success', text: t('admin.resourcesAi.topics.deleted') })
      setDeleteTarget(null)
    } catch (error) {
      setNotice({ type: 'error', text: t(`admin.resourcesAi.topics.errors.${error.code || 'delete'}`) })
    } finally { setDeleting(false) }
  }

  return (
    <section className="min-h-[90vh] bg-warm-gray pb-20 pt-28">
      <div className="mx-auto max-w-[1600px] px-4 sm:px-6">
        <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-accent">{t('admin.resourcesAi.brand')}</p>
        <h1 className="mb-7 font-heading text-2xl font-bold text-navy md:text-3xl">{t('admin.resourcesAi.brand')}</h1>
        <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:items-start">
          <AdminResourcesNav active="topics" />
          <div className="min-w-0">
            <header className="mb-7 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div><h2 className="font-heading text-2xl font-bold text-navy md:text-3xl">{t('admin.resourcesAi.topics.title')}</h2><p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">{t('admin.resourcesAi.topics.subtitle')}</p></div>
              <Link to={`${TOPICS_PATH}/nouveau`} className="inline-flex items-center justify-center gap-2 rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-white"><Plus size={16} aria-hidden="true" />{t('admin.resourcesAi.topics.add')}</Link>
            </header>
            {notice && <p role={notice.type === 'error' ? 'alert' : 'status'} className={`mb-5 rounded-xl border px-4 py-3 text-sm ${notice.type === 'error' ? 'border-red-200 bg-red-50 text-red-800' : 'border-green-200 bg-green-50 text-green-800'}`}>{notice.text}</p>}
            {state === 'loading' ? <StateCard text={t('admin.resourcesAi.topics.loading')} /> : state !== 'ready' ? <StateCard text={t(`admin.resourcesAi.topics.errors.${state}`)} action={<button type="button" onClick={load} className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-accent-deep"><RotateCw size={15} aria-hidden="true" />{t('admin.resourcesAi.topics.retry')}</button>} /> : topics.length === 0 ? <StateCard text={t('admin.resourcesAi.topics.empty')} /> : <TopicList rows={topics} locale={locale} onDelete={setDeleteTarget} t={t} />}
          </div>
        </div>
      </div>
      {deleteTarget && <DeleteDialog deleting={deleting} onCancel={() => setDeleteTarget(null)} onConfirm={confirmDelete} topic={deleteTarget} t={t} />}
    </section>
  )
}

function TopicList({ rows, locale, onDelete, t }) {
  return <><Card className="hidden overflow-x-auto p-0 md:block"><table className="w-full min-w-[900px] text-left text-sm"><thead className="border-b border-gray-200 bg-surface text-[11px] uppercase tracking-wider text-muted"><tr>{['nameFr', 'nameEn', 'slug', 'resources', 'published', 'updated', 'actions'].map((key) => <th key={key} className="px-4 py-3">{t(`admin.resourcesAi.topics.columns.${key}`)}</th>)}</tr></thead><tbody className="divide-y divide-gray-100">{rows.map((topic) => <tr key={topic.id}><td className="max-w-xs px-4 py-4 font-semibold text-navy">{topic.name_fr}</td><td className="max-w-xs px-4 py-4 text-navy/75">{topic.name_en}</td><td className="max-w-xs truncate px-4 py-4 font-mono text-xs text-navy/70">{topic.slug}</td><td className="tnum px-4 py-4">{topic.resourceCount}</td><td className="tnum px-4 py-4">{topic.publishedCount}</td><td className="px-4 py-4 text-xs text-muted">{formatDate(topic.updated_at, locale)}</td><td className="px-4 py-4"><TopicActions topic={topic} onDelete={onDelete} t={t} /></td></tr>)}</tbody></table></Card><ul className="space-y-3 md:hidden">{rows.map((topic) => <li key={topic.id} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"><h3 className="font-heading text-base font-semibold text-navy">{topic.name_fr}</h3><p className="mt-1 text-sm text-navy/70">{topic.name_en}</p><p className="mt-1 break-all font-mono text-xs text-muted">{topic.slug}</p><dl className="mt-4 grid grid-cols-3 gap-3 border-t border-gray-100 pt-3 text-xs"><Meta label={t('admin.resourcesAi.topics.columns.resources')} value={topic.resourceCount} /><Meta label={t('admin.resourcesAi.topics.columns.published')} value={topic.publishedCount} /><Meta label={t('admin.resourcesAi.topics.columns.updated')} value={formatDate(topic.updated_at, locale)} /></dl><div className="mt-4 border-t border-gray-100 pt-3"><TopicActions topic={topic} onDelete={onDelete} t={t} /></div></li>)}</ul></>
}

function TopicActions({ onDelete, t, topic }) { return <div className="flex flex-wrap gap-2"><Link to={`${TOPICS_PATH}/${topic.id}`} className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-navy"><Pencil size={13} aria-hidden="true" />{t('admin.resourcesAi.topics.edit')}</Link><button type="button" onClick={() => onDelete(topic)} className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-700"><Trash2 size={13} aria-hidden="true" />{t('admin.resourcesAi.topics.delete')}</button></div> }
function DeleteDialog({ deleting, onCancel, onConfirm, topic, t }) { const key = topic.resourceCount > 0 ? 'deleteWithResources' : 'deleteEmpty'; return <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/55 p-4" role="presentation"><div role="alertdialog" aria-modal="true" aria-labelledby="delete-topic-title" className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"><h2 id="delete-topic-title" className="font-heading text-xl font-bold text-navy">{t('admin.resourcesAi.topics.deleteTitle', { name: topic.name_fr })}</h2><p className="mt-3 text-sm leading-relaxed text-muted">{t(`admin.resourcesAi.topics.${key}`, { count: topic.resourceCount })}</p><div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><button type="button" disabled={deleting} onClick={onCancel} className="rounded-full border border-gray-300 px-5 py-2.5 text-sm font-medium text-navy">{t('admin.resourcesAi.topics.cancel')}</button><button type="button" disabled={deleting} onClick={onConfirm} className="inline-flex items-center justify-center gap-2 rounded-full bg-red-700 px-5 py-2.5 text-sm font-semibold text-white"><Trash2 size={15} aria-hidden="true" />{t('admin.resourcesAi.topics.delete')}</button></div></div></div> }
function Meta({ label, value }) { return <div><dt className="font-semibold text-navy/55">{label}</dt><dd className="mt-1 text-navy">{value}</dd></div> }
function StateCard({ action, text }) { return <Card className="flex min-h-64 flex-col items-center justify-center p-10 text-center"><Layers3 size={30} className="mb-4 text-steel" aria-hidden="true" /><p role="status" className="text-sm text-muted">{text}</p>{action}</Card> }
function formatDate(value, locale) { const timestamp = Date.parse(value); return Number.isFinite(timestamp) ? new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(timestamp) : '—' }
