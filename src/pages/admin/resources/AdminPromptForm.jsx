import { ArrowLeft, ExternalLink, FileJson, Plus, Save, Send, Sparkles, Trash2, Undo2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import AdminGuard from '@/components/admin/AdminGuard'
import AdminResourcesNav from '@/components/admin/resources/AdminResourcesNav'
import PromptPreview from '@/components/admin/resources/PromptPreview'
import PromptThumbnailField from '@/components/admin/resources/PromptThumbnailField'
import Card from '@/components/ui/Card'
import {
  createPromptDraft,
  fetchAdminPrompt,
  publishPrompt,
  unpublishPrompt,
  updatePromptDraft,
} from '@/lib/adminPrompts'
import {
  createEmptyPromptForm,
  hasPromptEditorialData,
  promptFormToDraftPayload,
  promptRowToForm,
} from '@/lib/promptFormData'
import { analyzePromptJson, applyAnalyzedPromptImport } from '@/lib/promptJsonImport'
import { isValidPromptSlug, proposePromptSlug } from '@/lib/promptSlug'
import { canEnablePromptPublish } from '@/lib/promptPublication'
import {
  PROMPT_CATEGORIES,
  PROMPT_CONTEXTS,
  PROMPT_LANGUAGES,
  PROMPT_LEVELS,
  PROMPT_RESULT_TYPES,
} from '@/lib/promptTaxonomies'
import { createPromptThumbnailUrl } from '@/lib/promptThumbnails'
import { buildPromptExample } from '@/lib/promptVariables'
import { getPromptWarnings } from '@/lib/promptWarnings'

const LIST_PATH = '/admin/ressources-ia/prompts'

export default function AdminPromptForm() {
  return <AdminGuard><AdminPromptFormPage /></AdminGuard>
}

function AdminPromptFormPage() {
  const { t } = useTranslation()
  const { id } = useParams()
  const navigate = useNavigate()
  const editing = Boolean(id)
  const [savedPromptId, setSavedPromptId] = useState(id || null)
  const [form, setForm] = useState(createEmptyPromptForm)
  const [baseline, setBaseline] = useState(() => JSON.stringify(createEmptyPromptForm()))
  const [status, setStatus] = useState('draft')
  const [publishedAt, setPublishedAt] = useState(null)
  const [loading, setLoading] = useState(editing)
  const [loadError, setLoadError] = useState(null)
  const [saving, setSaving] = useState(false)
  const [notice, setNotice] = useState(null)
  const [publicationNotice, setPublicationNotice] = useState(null)
  const [importText, setImportText] = useState('')
  const [importFileName, setImportFileName] = useState('')
  const [importReport, setImportReport] = useState(null)
  const [thumbnailPath, setThumbnailPath] = useState(null)
  const [thumbnailUrl, setThumbnailUrl] = useState(null)
  const [thumbnailBusy, setThumbnailBusy] = useState(false)
  const [transitioning, setTransitioning] = useState(false)

  const dirty = JSON.stringify(form) !== baseline
  const warnings = useMemo(() => getPromptWarnings(form), [form])
  const calculatedExample = useMemo(() => buildPromptExample(form.promptTemplate, form.variables), [form.promptTemplate, form.variables])
  const publishEnabled = canEnablePromptPublish({
    dirty,
    savedPromptId,
    saving,
    thumbnailBusy,
    transitioning,
  })

  useEffect(() => {
    if (!editing) return
    let cancelled = false
    setLoading(true)
    fetchAdminPrompt(id)
      .then(async (row) => {
        if (cancelled) return
        const next = promptRowToForm(row)
        setSavedPromptId(row.id)
        setForm(next)
        setBaseline(JSON.stringify(next))
        setStatus(row.status || 'draft')
        setPublishedAt(row.published_at || null)
        setThumbnailPath(row.thumbnail_path || null)
        if (row.thumbnail_path) {
          try {
            const url = await createPromptThumbnailUrl(row.thumbnail_path, row.id)
            if (!cancelled) setThumbnailUrl(url)
          } catch (error) {
            console.warn('Unable to sign prompt thumbnail:', error.message)
          }
        }
      })
      .catch((error) => { if (!cancelled) setLoadError(error.code || 'load') })
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

  const update = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }))
    setNotice(null)
    setPublicationNotice(null)
  }
  const updateNested = (group, field, value) => {
    setForm((current) => ({ ...current, [group]: { ...current[group], [field]: value } }))
    setNotice(null)
    setPublicationNotice(null)
  }

  const handleFile = async (event) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    if (!file.name.toLowerCase().endsWith('.prompt.json')) {
      setImportReport({ success: false, error: 'invalidFileType' })
      setImportFileName('')
      return
    }
    try {
      setImportText(await file.text())
      setImportFileName(file.name)
      setImportReport(null)
    } catch {
      setImportReport({ success: false, error: 'fileReadError' })
    }
  }

  const handleImport = () => {
    const analysis = analyzePromptJson(importText)
    if (!analysis.success) {
      setImportReport(analysis)
      return
    }
    if (hasPromptEditorialData(form) && !window.confirm(t('admin.resourcesAi.promptForm.import.replaceConfirm'))) {
      setImportReport({ ...analysis, cancelled: true })
      return
    }
    const result = applyAnalyzedPromptImport(analysis, form)
    setForm(result.nextForm)
    setImportReport({ ...result, applied: true })
    setNotice(null)
  }

  const handleSave = async (event) => {
    event.preventDefault()
    if (saving || thumbnailBusy || status !== 'draft') return
    setSaving(true)
    setNotice(null)
    setPublicationNotice(null)
    try {
      const payload = promptFormToDraftPayload(form)
      const row = editing
        ? await updatePromptDraft(id, payload)
        : await createPromptDraft(payload)
      const next = promptRowToForm(row)
      setSavedPromptId(row.id)
      setForm(next)
      setBaseline(JSON.stringify(next))
      setStatus(row.status || 'draft')
      setPublishedAt(row.published_at || null)
      setThumbnailPath(row.thumbnail_path || thumbnailPath)
      setNotice({ type: 'success', text: t('admin.resourcesAi.promptForm.saved') })
      if (!editing) navigate(`${LIST_PATH}/${row.id}/modifier`, { replace: true })
    } catch (error) {
      console.error('Unable to save prompt:', error.cause?.message || error.message)
      setNotice({ type: 'error', text: t(`admin.resourcesAi.promptForm.errors.${error.code || 'save'}`) })
    } finally {
      setSaving(false)
    }
  }

  const handlePublish = async () => {
    if (!savedPromptId || dirty || transitioning || thumbnailBusy) return
    if (!isValidPromptSlug(form.slug)) {
      setPublicationNotice({ type: 'error', text: t(`admin.resourcesAi.promptForm.errors.${form.slug ? 'slugInvalid' : 'slugRequired'}`) })
      return
    }
    setTransitioning(true)
    setNotice(null)
    setPublicationNotice({ type: 'status', text: t('admin.resourcesAi.promptForm.publishing') })
    try {
      const row = await publishPrompt(savedPromptId)
      setStatus('published')
      setPublishedAt(row.published_at || null)
      setPublicationNotice({ type: 'success', text: t('admin.resourcesAi.promptForm.published') })
    } catch (error) {
      console.error('Unable to publish prompt:', error.cause?.message || error.message)
      setPublicationNotice({ type: 'error', text: t(`admin.resourcesAi.promptForm.errors.${error.code || 'publish'}`) })
    } finally {
      setTransitioning(false)
    }
  }

  const handleUnpublish = async () => {
    if (status !== 'published' || transitioning) return
    if (!window.confirm(t('admin.resourcesAi.promptForm.unpublishConfirm'))) return
    setTransitioning(true)
    setNotice(null)
    setPublicationNotice({ type: 'status', text: t('admin.resourcesAi.promptForm.unpublishing') })
    try {
      await unpublishPrompt(savedPromptId)
      setStatus('draft')
      setPublishedAt(null)
      setPublicationNotice({ type: 'success', text: t('admin.resourcesAi.promptForm.unpublished') })
    } catch (error) {
      console.error('Unable to unpublish prompt:', error.cause?.message || error.message)
      setPublicationNotice({ type: 'error', text: t(`admin.resourcesAi.promptForm.errors.${error.code || 'unpublish'}`) })
    } finally {
      setTransitioning(false)
    }
  }

  const leave = () => {
    if (dirty && !window.confirm(t('admin.resourcesAi.promptForm.unsavedConfirm'))) return
    navigate(LIST_PATH)
  }

  if (loading) return <PageState text={t('admin.resourcesAi.promptForm.loading')} />
  if (loadError) return <PageState text={t(`admin.resourcesAi.promptForm.errors.${loadError}`)} />

  return (
    <section className="min-h-[90vh] bg-warm-gray pb-20 pt-28">
      <div className="mx-auto max-w-[1600px] px-4 sm:px-6">
        <Link to={LIST_PATH} onClick={(event) => { if (dirty && !window.confirm(t('admin.resourcesAi.promptForm.unsavedConfirm'))) event.preventDefault() }} className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-accent-deep"><ArrowLeft size={16} aria-hidden="true" />{t('admin.resourcesAi.promptForm.back')}</Link>
        <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:items-start">
          <AdminResourcesNav active="prompts" />
          <div className="min-w-0">
            <header className="mb-7"><p className="text-[11px] font-bold uppercase tracking-[0.18em] text-accent">{t('admin.resourcesAi.brand')}</p><div className="mt-2 flex flex-wrap items-center gap-3"><h1 className="font-heading text-3xl font-bold text-navy">{t(`admin.resourcesAi.promptForm.${editing ? 'editTitle' : 'newTitle'}`)}</h1>{status === 'published' && <span className="rounded-full border border-green-300 bg-green-100 px-3 py-1 text-xs font-semibold text-green-800">{t('admin.resourcesAi.promptForm.publishedBadge')}</span>}</div>{publishedAt && <time dateTime={publishedAt} className="mt-2 block text-sm text-navy/65">{t('admin.resourcesAi.promptForm.publishedDate', { date: new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(publishedAt)) })}</time>}</header>
            {notice && <Notice notice={notice} />}
            {status !== 'draft' && <Notice notice={{ type: 'warning', text: t('admin.resourcesAi.promptForm.publishedReadOnly') }} />}
            <form onSubmit={handleSave} className="space-y-5">
              <fieldset disabled={status !== 'draft'} className="space-y-5 disabled:opacity-75">
                <FormSection number="1" title={t('admin.resourcesAi.promptForm.sections.import')}>
                  <p className="mb-4 text-sm text-muted">{t('admin.resourcesAi.promptForm.import.help')}</p>
                  <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
                    <Field as="textarea" rows={8} label={t('admin.resourcesAi.promptForm.import.paste')} value={importText} onChange={setImportText} />
                    <div className="space-y-3">
                      <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-navy/15 bg-white px-4 py-3 text-sm font-semibold text-navy"><FileJson size={16} aria-hidden="true" />{importFileName || t('admin.resourcesAi.promptForm.import.choose')}<input type="file" accept=".prompt.json,application/json" onChange={handleFile} className="sr-only" /></label>
                      <button type="button" onClick={handleImport} className="w-full rounded-lg bg-navy px-4 py-3 text-sm font-semibold text-white">{t('admin.resourcesAi.promptForm.import.analyze')}</button>
                    </div>
                  </div>
                  {importReport && <ImportReport report={importReport} t={t} />}
                </FormSection>

                <FormSection number="2" title={t('admin.resourcesAi.promptForm.sections.metadata')}>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <Field label={t('admin.resourcesAi.promptForm.fields.schemaVersion')} value={form.schemaVersion} onChange={(value) => update('schemaVersion', value)} />
                    <SelectField label={t('admin.resourcesAi.promptForm.fields.contentType')} value={form.contentType} values={['prompt']} onChange={(value) => update('contentType', value)} t={t} group="contentTypes" />
                    <SelectField label={t('admin.resourcesAi.promptForm.fields.language')} value={form.language} values={PROMPT_LANGUAGES} onChange={(value) => update('language', value)} t={t} group="languages" />
                    <Field className="sm:col-span-2 lg:col-span-3" label={t('admin.resourcesAi.promptForm.fields.title')} value={form.title} onChange={(value) => update('title', value)} />
                    <Field as="textarea" rows={3} className="sm:col-span-2 lg:col-span-3" label={t('admin.resourcesAi.promptForm.fields.summary')} value={form.summary} onChange={(value) => update('summary', value)} />
                  </div>
                </FormSection>

                <FormSection number="3" title={t('admin.resourcesAi.promptForm.sections.classification')}>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <SelectField label={t('admin.resourcesAi.promptForm.fields.category')} value={form.category} values={PROMPT_CATEGORIES} onChange={(value) => update('category', value)} t={t} group="categories" />
                    <SelectField label={t('admin.resourcesAi.promptForm.fields.level')} value={form.level} values={PROMPT_LEVELS} onChange={(value) => update('level', value)} t={t} group="levels" />
                  </div>
                  <TaxonomyChecks className="mt-5" label={t('admin.resourcesAi.promptForm.fields.contexts')} values={PROMPT_CONTEXTS} selected={form.contexts} onChange={(value) => update('contexts', value)} t={t} group="contexts" />
                  <TaxonomyChecks className="mt-5" label={t('admin.resourcesAi.promptForm.fields.resultTypes')} values={PROMPT_RESULT_TYPES} selected={form.resultTypes} onChange={(value) => update('resultTypes', value)} t={t} group="resultTypes" />
                </FormSection>

                <FormSection number="4" title={t('admin.resourcesAi.promptForm.sections.whenToUse')}><Field as="textarea" rows={4} label={t('admin.resourcesAi.promptForm.fields.whenToUse')} value={form.whenToUse} onChange={(value) => update('whenToUse', value)} /></FormSection>
                <FormSection number="5" title={t('admin.resourcesAi.promptForm.sections.prompt')}><Field as="textarea" rows={14} className="font-mono" label={t('admin.resourcesAi.promptForm.fields.promptTemplate')} value={form.promptTemplate} onChange={(value) => update('promptTemplate', value)} /></FormSection>

                <FormSection number="6" title={t('admin.resourcesAi.promptForm.sections.variables')}>
                  <VariableEditor variables={form.variables} onChange={(value) => update('variables', value)} t={t} />
                </FormSection>

                <FormSection number="7" title={t('admin.resourcesAi.promptForm.sections.example')}>
                  {form.promptTemplate ? <pre className="whitespace-pre-wrap break-words rounded-xl bg-navy/[0.045] p-4 text-sm leading-7 text-navy" tabIndex="0">{calculatedExample.text}</pre> : <p className="text-sm text-muted">{t('admin.resourcesAi.promptForm.exampleEmpty')}</p>}
                  {!calculatedExample.complete && <p role="status" className="mt-3 text-sm text-amber-800">{t('admin.resourcesAi.promptForm.exampleIncomplete')}</p>}
                </FormSection>

                <FormSection number="8" title={t('admin.resourcesAi.promptForm.sections.tip')}><Field as="textarea" rows={3} label={t('admin.resourcesAi.promptForm.fields.tip')} value={form.tip} onChange={(value) => update('tip', value)} /></FormSection>
                <FormSection number="9" title={t('admin.resourcesAi.promptForm.sections.quick')}><Field as="textarea" rows={6} className="font-mono" label={t('admin.resourcesAi.promptForm.fields.quickTemplate')} value={form.quickTemplate} onChange={(value) => update('quickTemplate', value)} /></FormSection>
                <FormSection number="10" title={t('admin.resourcesAi.promptForm.sections.caution')}><Field as="textarea" rows={3} label={t('admin.resourcesAi.promptForm.fields.caution')} value={form.caution} onChange={(value) => update('caution', value)} /></FormSection>
              </fieldset>

              <FormSection number="11" title={t('admin.resourcesAi.promptForm.sections.thumbnail')}>
                <div className="grid gap-5 lg:grid-cols-2">
                  <fieldset disabled={status !== 'draft'} className="space-y-4 disabled:opacity-75">
                      <Field label={t('admin.resourcesAi.promptForm.fields.thumbnailAlt')} value={form.thumbnail.altText || ''} onChange={(value) => updateNested('thumbnail', 'altText', value)} />
                      <Field as="textarea" rows={5} label={t('admin.resourcesAi.promptForm.fields.thumbnailBrief')} value={form.thumbnail.generationBrief || ''} onChange={(value) => updateNested('thumbnail', 'generationBrief', value)} />
                      <Field label={t('admin.resourcesAi.promptForm.fields.thumbnailRatio')} value={form.thumbnail.preferredAspectRatio || ''} onChange={(value) => updateNested('thumbnail', 'preferredAspectRatio', value)} />
                  </fieldset>
                  <PromptThumbnailField dirty={dirty} generationBrief={form.thumbnail.generationBrief} promptId={savedPromptId} thumbnailPath={thumbnailPath} thumbnailUrl={thumbnailUrl} onBusyChange={setThumbnailBusy} onChanged={({ path, url }) => { setThumbnailPath(path); setThumbnailUrl(url) }} t={t} />
                </div>
              </FormSection>

              <fieldset disabled={status !== 'draft'} className="space-y-5 disabled:opacity-75">
                <FormSection number="12" title={t('admin.resourcesAi.promptForm.sections.objective')}><Field as="textarea" rows={4} label={t('admin.resourcesAi.promptForm.fields.editorialObjective')} value={form.editorialObjective} onChange={(value) => update('editorialObjective', value)} /></FormSection>
                <FormSection number="13" title={t('admin.resourcesAi.promptForm.sections.keywords')}><StringList values={form.keywords} onChange={(value) => update('keywords', value)} addLabel={t('admin.resourcesAi.promptForm.addKeyword')} /></FormSection>

                <FormSection number="14" title={t('admin.resourcesAi.promptForm.sections.seo')}>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label={t('admin.resourcesAi.promptForm.fields.primaryQuery')} value={form.seo.primaryQuery || ''} onChange={(value) => updateNested('seo', 'primaryQuery', value)} />
                    <Field label={t('admin.resourcesAi.promptForm.fields.seoTitle')} value={form.seo.seoTitle || ''} onChange={(value) => updateNested('seo', 'seoTitle', value)} />
                    <Field as="textarea" rows={3} className="sm:col-span-2" label={t('admin.resourcesAi.promptForm.fields.metaDescription')} value={form.seo.metaDescription || ''} onChange={(value) => updateNested('seo', 'metaDescription', value)} />
                    <Field label={t('admin.resourcesAi.promptForm.fields.suggestedSlug')} value={form.seo.suggestedSlug || ''} onChange={(value) => updateNested('seo', 'suggestedSlug', value)} />
                    <div><Field label={t('admin.resourcesAi.promptForm.fields.slug')} value={form.slug} onChange={(value) => update('slug', value)} /><button type="button" onClick={() => update('slug', proposePromptSlug({ suggestedSlug: form.seo.suggestedSlug, title: form.title }))} className="mt-2 text-xs font-bold text-accent-deep">{t('admin.resourcesAi.promptForm.useSuggestion')}</button>{form.slug && !isValidPromptSlug(form.slug) && <p className="mt-1 text-xs text-amber-800">{t('admin.resourcesAi.promptForm.slugWillNormalize')}</p>}</div>
                  </div>
                  <div className="mt-5 grid gap-5 lg:grid-cols-2"><StringList values={form.seo.secondaryQueries || []} onChange={(value) => updateNested('seo', 'secondaryQueries', value)} addLabel={t('admin.resourcesAi.promptForm.addSecondaryQuery')} /><InternalLinks values={form.seo.internalLinkSuggestions || []} onChange={(value) => updateNested('seo', 'internalLinkSuggestions', value)} t={t} /></div>
                </FormSection>

                <FormSection number="15" title={t('admin.resourcesAi.promptForm.sections.warnings')}><Warnings warnings={warnings} t={t} /></FormSection>
                <FormSection number="16" title={t('admin.resourcesAi.promptForm.sections.preview')}><PromptPreview form={form} thumbnailUrl={thumbnailUrl} t={t} /></FormSection>
              </fieldset>

              <FormSection number="17" title={t(`admin.resourcesAi.promptForm.sections.${status === 'published' ? 'publication' : 'save'}`)}>
                <p className="text-sm text-muted">{status === 'published' ? t('admin.resourcesAi.promptForm.publishedReadOnly') : !savedPromptId ? t('admin.resourcesAi.promptForm.draftOnly') : dirty ? t('admin.resourcesAi.promptForm.saveBeforePublish') : !form.slug ? t('admin.resourcesAi.promptForm.slugRequiredHint') : !isValidPromptSlug(form.slug) ? t('admin.resourcesAi.promptForm.slugInvalidHint') : t('admin.resourcesAi.promptForm.readyToPublish')}</p>
                {publicationNotice && <div className="mt-4"><Notice notice={publicationNotice} /></div>}
                <div className="mt-5 flex flex-wrap justify-end gap-3">
                  <button type="button" onClick={leave} className="rounded-full border border-gray-300 px-6 py-2.5 text-sm font-semibold text-navy">{t('admin.resourcesAi.promptForm.cancel')}</button>
                  {status === 'published' ? <>
                    {form.slug && <a href={`/ressources-ia/prompts/${form.slug}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full border border-gray-300 px-5 py-2.5 text-sm font-medium text-navy"><ExternalLink size={16} aria-hidden="true" />{t('admin.resourcesAi.promptForm.open')}</a>}
                    <button type="button" disabled={transitioning} onClick={handleUnpublish} className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-50"><Undo2 size={16} aria-hidden="true" />{transitioning ? t('admin.resourcesAi.promptForm.unpublishing') : t('admin.resourcesAi.promptForm.unpublish')}</button>
                  </> : <>
                    <button type="submit" disabled={saving || thumbnailBusy} className="inline-flex items-center gap-2 rounded-full border border-gray-300 px-6 py-2.5 text-sm font-semibold text-navy disabled:opacity-50"><Save size={16} aria-hidden="true" />{saving ? t('admin.resourcesAi.promptForm.saving') : t('admin.resourcesAi.promptForm.saveDraft')}</button>
                    <button type="button" onClick={handlePublish} disabled={!publishEnabled} className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"><Send size={16} aria-hidden="true" />{transitioning ? t('admin.resourcesAi.promptForm.publishing') : t('admin.resourcesAi.promptForm.publish')}</button>
                  </>}
                </div>
              </FormSection>
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}

function FormSection({ children, number, title }) {
  return <Card className="p-5 sm:p-6"><div className="mb-5 flex items-center gap-3 border-b border-gray-100 pb-4"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/10 text-xs font-bold text-accent-deep">{number}</span><h2 className="font-heading text-lg font-bold text-navy">{title}</h2></div>{children}</Card>
}

function Field({ as = 'input', className = '', label, onChange, value, ...props }) {
  const Component = as
  return <label className={`block ${className}`}><span className="mb-1.5 block text-xs font-bold text-navy/70">{label}</span><Component value={value ?? ''} onChange={(event) => onChange(event.target.value)} className={`w-full rounded-xl border border-navy/15 bg-white px-3.5 py-2.5 text-sm text-navy focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 ${className.includes('font-mono') ? 'font-mono' : ''}`} {...props} /></label>
}

function SelectField({ group, label, onChange, t, value, values }) {
  const unknown = value && !values.includes(value)
  return <label className="block"><span className="mb-1.5 block text-xs font-bold text-navy/70">{label}</span><select value={value} onChange={(event) => onChange(event.target.value)} className="w-full rounded-xl border border-navy/15 bg-white px-3.5 py-2.5 text-sm text-navy"><option value="">—</option>{unknown && <option value={value}>{value} — {t('admin.resourcesAi.promptForm.unknownValue')}</option>}{values.map((item) => <option key={item} value={item}>{t(`admin.resourcesAi.promptTaxonomies.${group}.${item}`, { defaultValue: item })}</option>)}</select></label>
}

function TaxonomyChecks({ className = '', group, label, onChange, selected = [], t, values }) {
  const toggle = (value) => onChange(selected.includes(value) ? selected.filter((item) => item !== value) : [...selected, value])
  const unknown = selected.filter((item) => !values.includes(item))
  return <fieldset className={className}><legend className="mb-2 text-xs font-bold text-navy/70">{label}</legend><div className="flex flex-wrap gap-2">{values.map((value) => <label key={value} className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-navy/15 bg-white px-3 py-2 text-xs font-semibold text-navy"><input type="checkbox" checked={selected.includes(value)} onChange={() => toggle(value)} />{t(`admin.resourcesAi.promptTaxonomies.${group}.${value}`)}</label>)}{unknown.map((value) => <button key={value} type="button" onClick={() => toggle(value)} className="rounded-full border border-amber-300 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-900">{value} ×</button>)}</div></fieldset>
}

function VariableEditor({ onChange, t, variables }) {
  const update = (index, field, value) => onChange(variables.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item))
  return <div className="space-y-4">{variables.map((variable, index) => <div key={index} className="rounded-xl border border-navy/10 bg-surface p-4"><div className="mb-4 flex items-center justify-between"><h3 className="font-semibold text-navy">{t('admin.resourcesAi.promptForm.variableNumber', { number: index + 1 })}</h3><button type="button" onClick={() => onChange(variables.filter((_, itemIndex) => itemIndex !== index))} className="text-red-700" aria-label={t('admin.resourcesAi.promptForm.removeVariable')}><Trash2 size={16} aria-hidden="true" /></button></div><div className="grid gap-4 sm:grid-cols-2"><Field label={t('admin.resourcesAi.promptForm.fields.variableKey')} value={variable.key || ''} onChange={(value) => update(index, 'key', value)} /><Field label={t('admin.resourcesAi.promptForm.fields.variableLabel')} value={variable.label || ''} onChange={(value) => update(index, 'label', value)} /><Field as="textarea" rows={3} label={t('admin.resourcesAi.promptForm.fields.variableDescription')} value={variable.description || ''} onChange={(value) => update(index, 'description', value)} /><Field as="textarea" rows={3} label={t('admin.resourcesAi.promptForm.fields.variableExample')} value={variable.example || ''} onChange={(value) => update(index, 'example', value)} /></div></div>)}<button type="button" onClick={() => onChange([...variables, { key: '', label: '', description: '', example: '' }])} className="inline-flex items-center gap-2 rounded-lg border border-accent/30 px-4 py-2.5 text-sm font-semibold text-accent-deep"><Plus size={15} aria-hidden="true" />{t('admin.resourcesAi.promptForm.addVariable')}</button></div>
}

function StringList({ addLabel, onChange, values }) {
  return <div className="space-y-2">{values.map((value, index) => <div key={index} className="flex gap-2"><input value={value} onChange={(event) => onChange(values.map((item, itemIndex) => itemIndex === index ? event.target.value : item))} className="min-w-0 flex-1 rounded-lg border border-navy/15 px-3 py-2 text-sm" /><button type="button" onClick={() => onChange(values.filter((_, itemIndex) => itemIndex !== index))} className="p-2 text-red-700"><Trash2 size={15} aria-hidden="true" /></button></div>)}<button type="button" onClick={() => onChange([...values, ''])} className="inline-flex items-center gap-2 text-sm font-bold text-accent-deep"><Plus size={15} aria-hidden="true" />{addLabel}</button></div>
}

function InternalLinks({ onChange, t, values }) {
  const update = (index, field, value) => onChange(values.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item))
  return <div><p className="mb-2 text-xs font-bold text-navy/70">{t('admin.resourcesAi.promptForm.fields.internalLinks')}</p><div className="space-y-3">{values.map((item, index) => <div key={index} className="rounded-lg border border-navy/10 p-3"><Field label={t('admin.resourcesAi.promptForm.fields.targetTopic')} value={item.targetTopic || ''} onChange={(value) => update(index, 'targetTopic', value)} /><div className="mt-2"><Field label={t('admin.resourcesAi.promptForm.fields.suggestedAnchor')} value={item.suggestedAnchor || ''} onChange={(value) => update(index, 'suggestedAnchor', value)} /></div><div className="mt-2"><Field label={t('admin.resourcesAi.promptForm.fields.placementHint')} value={item.placementHint || ''} onChange={(value) => update(index, 'placementHint', value)} /></div><button type="button" onClick={() => onChange(values.filter((_, itemIndex) => itemIndex !== index))} className="mt-2 text-xs font-bold text-red-700">{t('admin.resourcesAi.promptForm.removeLink')}</button></div>)}</div><button type="button" onClick={() => onChange([...values, {}])} className="mt-2 inline-flex items-center gap-2 text-sm font-bold text-accent-deep"><Plus size={15} aria-hidden="true" />{t('admin.resourcesAi.promptForm.addLink')}</button></div>
}

function Warnings({ t, warnings }) {
  if (!warnings.length) return <p className="flex items-center gap-2 text-sm text-green-800"><Sparkles size={16} aria-hidden="true" />{t('admin.resourcesAi.promptForm.noWarnings')}</p>
  return <ul className="space-y-2">{warnings.map((warning, index) => <li key={`${warning.path}-${warning.code}-${index}`} className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950"><strong>{warning.path}</strong> — {t(`admin.resourcesAi.promptWarnings.${warning.code}`, { detail: warning.detail || '' })}</li>)}</ul>
}

function ImportReport({ report, t }) {
  if (!report.success) return <p role="alert" className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{t(`admin.resourcesAi.promptForm.import.errors.${report.error}`)}</p>
  return <div role="status" className="mt-4 rounded-lg border border-steel/30 bg-steel/10 px-4 py-3 text-sm text-navy"><p className="font-semibold">{t(`admin.resourcesAi.promptForm.import.${report.cancelled ? 'cancelled' : report.imported.length ? 'success' : 'empty'}`)}</p>{!report.cancelled && <p className="mt-1 text-xs">{t('admin.resourcesAi.promptForm.import.notSaved')}</p>}{report.warnings.length > 0 && <ul className="mt-3 list-disc space-y-1 pl-5 text-xs">{report.warnings.map((warning, index) => <li key={index}>{warning.path} — {t(`admin.resourcesAi.promptImportWarnings.${warning.code}`)}</li>)}</ul>}</div>
}

function Notice({ notice }) {
  return <p role={notice.type === 'error' ? 'alert' : 'status'} className={`mb-5 rounded-xl border px-4 py-3 text-sm ${notice.type === 'error' ? 'border-red-200 bg-red-50 text-red-800' : notice.type === 'warning' ? 'border-amber-200 bg-amber-50 text-amber-900' : 'border-green-200 bg-green-50 text-green-800'}`}>{notice.text}</p>
}

function PageState({ text }) {
  return <section className="min-h-[70vh] bg-warm-gray pt-32"><p role="status" className="mx-auto max-w-xl px-4 text-center text-muted">{text}</p></section>
}
