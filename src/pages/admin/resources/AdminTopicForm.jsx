import { ArrowLeft, ExternalLink, LoaderCircle, Save, Trash2, Unlink } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import AdminGuard from '@/components/admin/AdminGuard'
import AdminResourcesNav from '@/components/admin/resources/AdminResourcesNav'
import Card from '@/components/ui/Card'
import {
  createAdminResourceTopic,
  deleteAdminResourceTopic,
  deleteAdminResourceTopicMembership,
  fetchAdminResourceTopicById,
  fetchAdminResourceTopicMemberships,
  proposeResourceTopicSlug,
  updateAdminResourceTopic,
} from '@/lib/adminResourceTopics'

const TOPICS_PATH = '/admin/ressources-ia/sujets'
const EMPTY_FORM = { name_fr: '', name_en: '', slug: '', description_fr: '', description_en: '' }

export default function AdminTopicForm() { return <AdminGuard><AdminTopicFormPage /></AdminGuard> }

function AdminTopicFormPage() {
  const { t } = useTranslation()
  const { id } = useParams()
  const navigate = useNavigate()
  const editing = Boolean(id)
  const [form, setForm] = useState(EMPTY_FORM)
  const [baseline, setBaseline] = useState(JSON.stringify(EMPTY_FORM))
  const [savedTopic, setSavedTopic] = useState(null)
  const [memberships, setMemberships] = useState([])
  const [loading, setLoading] = useState(editing)
  const [loadError, setLoadError] = useState(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [notice, setNotice] = useState(null)
  const [slugTouched, setSlugTouched] = useState(false)
  const dirty = JSON.stringify(form) !== baseline

  useEffect(() => {
    if (!editing) return
    let cancelled = false
    Promise.all([fetchAdminResourceTopicById(id), fetchAdminResourceTopicMemberships(id)])
      .then(([topic, memberRows]) => { if (!cancelled) { const next = rowToForm(topic); setSavedTopic(topic); setForm(next); setBaseline(JSON.stringify(next)); setMemberships(memberRows) } })
      .catch((error) => { if (!cancelled) setLoadError(error.code || 'load') })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [editing, id])

  const update = (field, value) => { setForm((current) => ({ ...current, [field]: value })); setNotice(null) }
  const updateFrenchName = (value) => setForm((current) => ({ ...current, name_fr: value, slug: !editing && !slugTouched ? proposeResourceTopicSlug(value) : current.slug }))

  const save = async (event) => {
    event.preventDefault()
    if (saving) return
    setSaving(true); setNotice(null)
    try {
      const topic = editing ? await updateAdminResourceTopic(id, form) : await createAdminResourceTopic(form)
      const next = rowToForm(topic)
      setSavedTopic(topic); setForm(next); setBaseline(JSON.stringify(next))
      setNotice({ type: 'success', text: t('admin.resourcesAi.topicForm.saved') })
      if (!editing) navigate(`${TOPICS_PATH}/${topic.id}`, { replace: true })
    } catch (error) { setNotice({ type: 'error', text: t(`admin.resourcesAi.topicForm.errors.${error.code || 'save'}`) }) } finally { setSaving(false) }
  }

  const removeMembership = async (membership) => {
    try {
      await deleteAdminResourceTopicMembership({ membershipId: membership.id, topicId: id })
      setMemberships((current) => current.filter(({ id: membershipId }) => membershipId !== membership.id))
    } catch (error) { setNotice({ type: 'error', text: t(`admin.resourcesAi.topicForm.errors.${error.code || 'membershipDelete'}`) }) }
  }

  const removeTopic = async () => {
    if (!savedTopic || deleting) return
    const confirmationKey = memberships.length ? 'deleteWithResources' : 'deleteEmpty'
    if (!window.confirm(t(`admin.resourcesAi.topics.${confirmationKey}`, { count: memberships.length }))) return
    setDeleting(true)
    try { await deleteAdminResourceTopic(savedTopic); navigate(TOPICS_PATH, { replace: true }) } catch (error) { setNotice({ type: 'error', text: t(`admin.resourcesAi.topics.errors.${error.code || 'delete'}`) }); setDeleting(false) }
  }

  if (loading) return <PageState text={t('admin.resourcesAi.topicForm.loading')} />
  if (loadError) return <PageState text={t(`admin.resourcesAi.topicForm.errors.${loadError}`)} />
  return <section className="min-h-[90vh] bg-warm-gray pb-20 pt-28"><div className="mx-auto max-w-[1600px] px-4 sm:px-6"><Link to={TOPICS_PATH} className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-accent-deep"><ArrowLeft size={16} aria-hidden="true" />{t('admin.resourcesAi.topicForm.back')}</Link><div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:items-start"><AdminResourcesNav active="topics" /><div className="min-w-0"><header className="mb-7"><p className="text-[11px] font-bold uppercase tracking-[0.18em] text-accent">{t('admin.resourcesAi.brand')}</p><h1 className="mt-2 font-heading text-2xl font-bold text-navy md:text-3xl">{t(`admin.resourcesAi.topicForm.${editing ? 'editTitle' : 'newTitle'}`)}</h1></header>{notice && <Notice notice={notice} />}<form onSubmit={save} className="space-y-5"><Section title={t('admin.resourcesAi.topicForm.sections.general')}><div className="grid gap-4 md:grid-cols-2"><Field label={t('admin.resourcesAi.topicForm.fields.nameFr')} required value={form.name_fr} onChange={updateFrenchName} /><Field label={t('admin.resourcesAi.topicForm.fields.nameEn')} required value={form.name_en} onChange={(value) => update('name_en', value)} /></div><div className="mt-4"><Field label={t('admin.resourcesAi.topicForm.fields.slug')} required value={form.slug} onChange={(value) => { setSlugTouched(true); update('slug', value) }} help={t(`admin.resourcesAi.topicForm.${editing ? 'slugWarning' : 'slugHelp'}`)} /></div></Section><Section title={t('admin.resourcesAi.topicForm.sections.descriptions')}><div className="grid gap-4 lg:grid-cols-2"><Field as="textarea" rows={5} label={t('admin.resourcesAi.topicForm.fields.descriptionFr')} value={form.description_fr} onChange={(value) => update('description_fr', value)} /><Field as="textarea" rows={5} label={t('admin.resourcesAi.topicForm.fields.descriptionEn')} value={form.description_en} onChange={(value) => update('description_en', value)} /></div></Section>{editing && <Section title={t('admin.resourcesAi.topicForm.sections.members')}><TopicMembers memberships={memberships} onRemove={removeMembership} t={t} /></Section>}<Section title={t('admin.resourcesAi.topicForm.sections.actions')}><div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap"><button type="submit" disabled={saving || !dirty} className="inline-flex items-center justify-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white disabled:opacity-60">{saving && <LoaderCircle size={16} className="animate-spin" aria-hidden="true" />}<Save size={16} aria-hidden="true" />{saving ? t('admin.resourcesAi.topicForm.saving') : t('admin.resourcesAi.topicForm.save')}</button><Link to={TOPICS_PATH} className="inline-flex items-center justify-center rounded-full border border-gray-300 px-6 py-3 text-sm font-semibold text-navy">{t('admin.resourcesAi.topicForm.cancel')}</Link>{editing && <button type="button" disabled={deleting} onClick={removeTopic} className="inline-flex items-center justify-center gap-2 rounded-full border border-red-200 px-6 py-3 text-sm font-semibold text-red-700 sm:ml-auto"><Trash2 size={16} aria-hidden="true" />{t('admin.resourcesAi.topics.delete')}</button>}</div></Section></form></div></div></div></section>
}

function TopicMembers({ memberships, onRemove, t }) { return memberships.length === 0 ? <p className="text-sm text-muted">{t('admin.resourcesAi.topicForm.members.empty')}</p> : <ul className="space-y-3">{memberships.map((membership) => { const to = membership.format === 'article' ? `/admin/ressources-ia/articles/${membership.resourceId}/modifier` : `/admin/ressources-ia/infographies/${membership.resourceId}/modifier`; return <li key={membership.id} className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-heading font-semibold text-navy">{membership.title || t('admin.resourcesAi.topicForm.members.untitled')}</p><p className="mt-1 text-xs text-muted">{t(`admin.resourcesAi.topicForm.members.formats.${membership.format}`)} · {t(`admin.resourcesAi.topicForm.members.statuses.${membership.status === 'published' ? 'published' : 'draft'}`)}</p></div><div className="flex flex-wrap gap-2"><Link to={to} className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-2 text-xs font-semibold text-navy"><ExternalLink size={13} aria-hidden="true" />{t('admin.resourcesAi.topicForm.members.open')}</Link><button type="button" onClick={() => onRemove(membership)} className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-700"><Unlink size={13} aria-hidden="true" />{t('admin.resourcesAi.topicForm.members.remove')}</button></div></li> })}</ul> }
function Field({ as = 'input', help, label, onChange, required = false, rows, value }) { const Element = as; const id = `topic-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`; return <label className="block" htmlFor={id}><span className="mb-1.5 block text-xs font-bold uppercase tracking-[0.1em] text-navy/65">{label}{required ? ' *' : ''}</span><Element id={id} rows={rows} required={required} value={value} onChange={(event) => onChange(event.target.value)} aria-describedby={help ? `${id}-help` : undefined} className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-navy focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20" />{help && <p id={`${id}-help`} className="mt-1.5 text-xs leading-relaxed text-muted">{help}</p>}</label> }
function Section({ children, title }) { return <Card className="p-5 sm:p-6"><h2 className="mb-5 font-heading text-xl font-bold text-navy">{title}</h2>{children}</Card> }
function Notice({ notice }) { return <p role={notice.type === 'error' ? 'alert' : 'status'} className={`mb-5 rounded-xl border px-4 py-3 text-sm ${notice.type === 'error' ? 'border-red-200 bg-red-50 text-red-800' : 'border-green-200 bg-green-50 text-green-800'}`}>{notice.text}</p> }
function PageState({ text }) { return <section className="flex min-h-[75vh] items-center justify-center bg-warm-gray px-4 pt-24"><p role="status" className="text-sm text-muted">{text}</p></section> }
function rowToForm(row) { return { name_fr: row?.name_fr || '', name_en: row?.name_en || '', slug: row?.slug || '', description_fr: row?.description_fr || '', description_en: row?.description_en || '' } }
