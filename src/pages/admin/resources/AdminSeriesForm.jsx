import { ArrowLeft, ExternalLink, Layers3, LoaderCircle, Save, Trash2, Unlink } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import AdminGuard from '@/components/admin/AdminGuard'
import AdminResourcesNav from '@/components/admin/resources/AdminResourcesNav'
import SeriesThumbnailField from '@/components/admin/resources/SeriesThumbnailField'
import Card from '@/components/ui/Card'
import {
  createAdminResourceSeries,
  deleteAdminResourceSeries,
  deleteAdminSeriesMembership,
  fetchAdminResourceSeriesById,
  fetchAdminSeriesMemberships,
  proposeResourceSeriesSlug,
  sortAdminSeriesMemberships,
  updateAdminResourceSeries,
  updateAdminSeriesMembershipPosition,
} from '@/lib/adminResourceSeries'

const SERIES_PATH = '/admin/ressources-ia/series'
const EMPTY_FORM = { name: '', slug: '', description: '', objective: '' }

export default function AdminSeriesForm() {
  return <AdminGuard><AdminSeriesFormPage /></AdminGuard>
}

function AdminSeriesFormPage() {
  const { t } = useTranslation()
  const { id } = useParams()
  const navigate = useNavigate()
  const editing = Boolean(id)
  const [form, setForm] = useState(EMPTY_FORM)
  const [baseline, setBaseline] = useState(JSON.stringify(EMPTY_FORM))
  const [savedSeries, setSavedSeries] = useState(null)
  const [memberships, setMemberships] = useState([])
  const [positionValues, setPositionValues] = useState({})
  const [positionErrors, setPositionErrors] = useState({})
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
    setLoading(true)
    Promise.all([fetchAdminResourceSeriesById(id), fetchAdminSeriesMemberships(id)])
      .then(([series, memberRows]) => {
        if (cancelled) return
        const nextForm = rowToForm(series)
        setSavedSeries(series)
        setForm(nextForm)
        setBaseline(JSON.stringify(nextForm))
        setMemberships(memberRows)
        setPositionValues(Object.fromEntries(memberRows.map((membership) => [membership.id, membership.position ?? ''])))
      })
      .catch((error) => {
        if (!cancelled) setLoadError(error.code || 'load')
      })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [editing, id])

  useEffect(() => {
    const beforeUnload = (event) => {
      if (!dirty) return
      event.preventDefault()
      event.returnValue = ''
    }
    window.addEventListener('beforeunload', beforeUnload)
    return () => window.removeEventListener('beforeunload', beforeUnload)
  }, [dirty])

  const publishedCount = useMemo(
    () => memberships.filter(({ status }) => status === 'published').length,
    [memberships],
  )

  const updateName = (value) => {
    setForm((current) => ({
      ...current,
      name: value,
      slug: !editing && !slugTouched ? proposeResourceSeriesSlug(value) : current.slug,
    }))
    setNotice(null)
  }

  const update = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }))
    setNotice(null)
  }

  const handleSave = async (event) => {
    event.preventDefault()
    if (saving) return
    setSaving(true)
    setNotice(null)
    try {
      const row = editing
        ? await updateAdminResourceSeries(id, form)
        : await createAdminResourceSeries(form)
      const nextForm = rowToForm(row)
      setSavedSeries((current) => ({ ...current, ...row }))
      setForm(nextForm)
      setBaseline(JSON.stringify(nextForm))
      setNotice({ type: 'success', text: t('admin.resourcesAi.seriesForm.saved') })
      if (!editing) navigate(`${SERIES_PATH}/${row.id}`, { replace: true })
    } catch (error) {
      console.error('Unable to save resource series:', error.cause?.message || error.message)
      setNotice({ type: 'error', text: t(`admin.resourcesAi.seriesForm.errors.${error.code || 'save'}`) })
    } finally {
      setSaving(false)
    }
  }

  const handlePositionSave = async (membership) => {
    setPositionErrors((current) => ({ ...current, [membership.id]: null }))
    try {
      const updated = await updateAdminSeriesMembershipPosition({
        membershipId: membership.id,
        seriesId: id,
        position: positionValues[membership.id],
      })
      setMemberships((current) => sortAdminSeriesMemberships(current.map((item) => item.id === updated.id ? { ...item, position: updated.position } : item)))
      setPositionValues((current) => ({ ...current, [membership.id]: updated.position ?? '' }))
    } catch (error) {
      setPositionErrors((current) => ({ ...current, [membership.id]: t(`admin.resourcesAi.seriesForm.errors.${error.code || 'positionSave'}`) }))
    }
  }

  const handleRemoveMembership = async (membership) => {
    if (!window.confirm(t('admin.resourcesAi.seriesForm.members.removeConfirm', { title: membership.title || t('admin.resourcesAi.seriesForm.members.untitled') }))) return
    try {
      await deleteAdminSeriesMembership({ membershipId: membership.id, seriesId: id })
      setMemberships((current) => current.filter(({ id: membershipId }) => membershipId !== membership.id))
      setNotice({ type: 'success', text: t('admin.resourcesAi.seriesForm.members.removed') })
    } catch (error) {
      setNotice({ type: 'error', text: t(`admin.resourcesAi.seriesForm.errors.${error.code || 'membershipDelete'}`) })
    }
  }

  const handleDelete = async () => {
    if (!savedSeries || deleting) return
    const confirmationKey = memberships.length > 0 ? 'deleteWithResources' : 'deleteEmpty'
    if (!window.confirm(t(`admin.resourcesAi.series.${confirmationKey}`, { count: memberships.length }))) return
    setDeleting(true)
    setNotice(null)
    try {
      const result = await deleteAdminResourceSeries(savedSeries)
      if (result.cleanupFailed) window.alert(t('admin.resourcesAi.series.deletedCleanupWarning'))
      navigate(SERIES_PATH, { replace: true })
    } catch (error) {
      setNotice({ type: 'error', text: t(`admin.resourcesAi.series.errors.${error.code || 'delete'}`) })
      setDeleting(false)
    }
  }

  const leave = (event) => {
    if (dirty && !window.confirm(t('admin.resourcesAi.seriesForm.unsavedConfirm'))) event.preventDefault()
  }

  if (loading) return <PageState text={t('admin.resourcesAi.seriesForm.loading')} />
  if (loadError) return <PageState text={t(`admin.resourcesAi.seriesForm.errors.${loadError}`)} />

  return (
    <section className="min-h-[90vh] bg-warm-gray pb-20 pt-28">
      <div className="mx-auto max-w-[1600px] px-4 sm:px-6">
        <Link to={SERIES_PATH} onClick={leave} className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-accent-deep"><ArrowLeft size={16} aria-hidden="true" />{t('admin.resourcesAi.seriesForm.back')}</Link>
        <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:items-start">
          <AdminResourcesNav active="series" />
          <div className="min-w-0">
            <header className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-accent">{t('admin.resourcesAi.brand')}</p>
                <h1 className="mt-2 font-heading text-2xl font-bold text-navy md:text-3xl">{t(`admin.resourcesAi.seriesForm.${editing ? 'editTitle' : 'newTitle'}`)}</h1>
              </div>
              {editing && publishedCount > 0 && <a href={`/ressources-ia/series/${savedSeries.slug}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-navy"><ExternalLink size={15} aria-hidden="true" />{t('admin.resourcesAi.series.view')}</a>}
            </header>

            {notice && <Notice notice={notice} />}
            <form onSubmit={handleSave} className="space-y-5">
              <FormSection title={t('admin.resourcesAi.seriesForm.sections.general')}>
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label={t('admin.resourcesAi.seriesForm.fields.name')} required value={form.name} onChange={updateName} error={notice?.type === 'error' && !form.name.trim() ? t('admin.resourcesAi.seriesForm.errors.nameRequired') : null} />
                  <Field
                    label={t('admin.resourcesAi.seriesForm.fields.slug')}
                    required
                    readOnly={editing}
                    value={form.slug}
                    onChange={(value) => { setSlugTouched(true); update('slug', value) }}
                    help={t(`admin.resourcesAi.seriesForm.${editing ? 'slugLocked' : 'slugHelp'}`)}
                  />
                </div>
              </FormSection>

              <FormSection title={t('admin.resourcesAi.seriesForm.sections.editorial')}>
                <div className="space-y-4">
                  <Field as="textarea" rows={4} label={t('admin.resourcesAi.seriesForm.fields.description')} value={form.description} onChange={(value) => update('description', value)} />
                  <Field as="textarea" rows={5} label={t('admin.resourcesAi.seriesForm.fields.objective')} value={form.objective} onChange={(value) => update('objective', value)} />
                </div>
              </FormSection>

              <FormSection title={t('admin.resourcesAi.seriesForm.sections.thumbnail')}>
                {savedSeries ? (
                  <SeriesThumbnailField
                    seriesId={savedSeries.id}
                    seriesSlug={savedSeries.slug}
                    seriesName={savedSeries.name}
                    onThumbnailChange={(thumbnailPath) => setSavedSeries((current) => ({ ...current, thumbnail_path: thumbnailPath }))}
                    t={t}
                  />
                ) : <p className="text-sm text-muted">{t('admin.resourcesAi.seriesForm.thumbnailSaveFirst')}</p>}
              </FormSection>

              {editing && (
                <FormSection title={t('admin.resourcesAi.seriesForm.sections.members')}>
                  {memberships.length === 0 ? <EmptyMembers t={t} /> : (
                    <ul className="space-y-3">
                      {memberships.map((membership) => (
                        <MembershipRow
                          key={membership.id}
                          membership={membership}
                          value={positionValues[membership.id] ?? ''}
                          error={positionErrors[membership.id]}
                          onChange={(value) => setPositionValues((current) => ({ ...current, [membership.id]: value }))}
                          onSave={() => handlePositionSave(membership)}
                          onRemove={() => handleRemoveMembership(membership)}
                          t={t}
                        />
                      ))}
                    </ul>
                  )}
                </FormSection>
              )}

              <FormSection title={t('admin.resourcesAi.seriesForm.sections.actions')}>
                <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                  <button type="submit" disabled={saving} className="inline-flex items-center justify-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white disabled:opacity-60">{saving ? <LoaderCircle size={16} className="animate-spin" aria-hidden="true" /> : <Save size={16} aria-hidden="true" />}{saving ? t('admin.resourcesAi.seriesForm.saving') : t('admin.resourcesAi.seriesForm.save')}</button>
                  <Link to={SERIES_PATH} onClick={leave} className="inline-flex items-center justify-center rounded-full border border-gray-300 px-6 py-3 text-sm font-semibold text-navy">{t('admin.resourcesAi.seriesForm.cancel')}</Link>
                  {editing && <button type="button" disabled={deleting} onClick={handleDelete} className="inline-flex items-center justify-center gap-2 rounded-full border border-red-200 px-6 py-3 text-sm font-semibold text-red-700 disabled:opacity-60 sm:ml-auto"><Trash2 size={16} aria-hidden="true" />{t('admin.resourcesAi.series.delete')}</button>}
                </div>
              </FormSection>
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}

function MembershipRow({ error, membership, onChange, onRemove, onSave, t, value }) {
  const editPath = membership.format === 'article'
    ? `/admin/ressources-ia/articles/${membership.resourceId}/modifier`
    : `/admin/ressources-ia/infographies/${membership.resourceId}/modifier`
  const errorId = `membership-position-error-${membership.id}`
  return (
    <li className="rounded-xl border border-gray-200 bg-white p-4">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wide">
            <span className="text-accent-deep">{t(`admin.resourcesAi.seriesForm.members.formats.${membership.format}`)}</span>
            <span className={`rounded-full border px-2 py-0.5 normal-case tracking-normal ${membership.status === 'published' ? 'border-green-300 bg-green-100 text-green-800' : 'border-gray-300 bg-gray-100 text-gray-700'}`}>{t(`admin.resourcesAi.seriesForm.members.statuses.${membership.status === 'published' ? 'published' : 'draft'}`)}</span>
          </div>
          <h3 className="mt-2 font-heading text-base font-semibold text-navy">{membership.title || t('admin.resourcesAi.seriesForm.members.untitled')}</h3>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-navy/65">{t('admin.resourcesAi.seriesForm.members.position')}</span>
            <input type="number" min="1" step="1" inputMode="numeric" value={value} onChange={(event) => onChange(event.target.value)} aria-describedby={error ? errorId : undefined} placeholder={t('admin.resourcesAi.seriesForm.members.undefined')} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-navy focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 sm:w-32" />
          </label>
          <button type="button" onClick={onSave} className="rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white">{t('admin.resourcesAi.seriesForm.members.savePosition')}</button>
          <Link to={editPath} className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-navy"><ExternalLink size={14} aria-hidden="true" />{t('admin.resourcesAi.seriesForm.members.open')}</Link>
          <button type="button" onClick={onRemove} className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-700"><Unlink size={14} aria-hidden="true" />{t('admin.resourcesAi.seriesForm.members.remove')}</button>
        </div>
      </div>
      {error && <p id={errorId} role="alert" className="mt-2 text-sm text-red-700">{error}</p>}
    </li>
  )
}

function Field({ as = 'input', error, help, label, onChange, readOnly = false, required = false, rows, value }) {
  const Element = as
  const id = `series-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
  return (
    <label className="block" htmlFor={id}>
      <span className="mb-1.5 block text-xs font-bold uppercase tracking-[0.1em] text-navy/65">{label}{required ? ' *' : ''}</span>
      <Element id={id} rows={rows} required={required} readOnly={readOnly} value={value} onChange={(event) => onChange(event.target.value)} aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : help ? `${id}-help` : undefined} className={`w-full rounded-xl border px-4 py-3 text-sm text-navy focus:outline-none focus:ring-2 ${readOnly ? 'border-gray-200 bg-gray-100 text-navy/65' : error ? 'border-red-400 bg-white focus:ring-red-200' : 'border-gray-300 bg-white focus:border-accent focus:ring-accent/20'}`} />
      {help && <p id={`${id}-help`} className="mt-1.5 text-xs leading-relaxed text-muted">{help}</p>}
      {error && <p id={`${id}-error`} role="alert" className="mt-1.5 text-xs text-red-700">{error}</p>}
    </label>
  )
}

function FormSection({ children, title }) {
  return <Card className="p-5 sm:p-6"><h2 className="mb-5 font-heading text-xl font-bold text-navy">{title}</h2>{children}</Card>
}

function EmptyMembers({ t }) {
  return <div className="rounded-xl border border-dashed border-gray-300 px-6 py-10 text-center"><Layers3 size={28} className="mx-auto text-steel" aria-hidden="true" /><p className="mt-3 text-sm text-muted">{t('admin.resourcesAi.seriesForm.members.empty')}</p></div>
}

function Notice({ notice }) {
  return <p role={notice.type === 'error' ? 'alert' : 'status'} className={`mb-5 rounded-xl border px-4 py-3 text-sm ${notice.type === 'error' ? 'border-red-200 bg-red-50 text-red-800' : 'border-green-200 bg-green-50 text-green-800'}`}>{notice.text}</p>
}

function PageState({ text }) {
  return <section className="flex min-h-[75vh] items-center justify-center bg-warm-gray px-4 pt-24"><p role="status" className="text-sm text-muted">{text}</p></section>
}

function rowToForm(row) {
  return {
    name: row?.name || '',
    slug: row?.slug || '',
    description: row?.description || '',
    objective: row?.objective || '',
  }
}
