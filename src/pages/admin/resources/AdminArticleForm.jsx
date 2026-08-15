import { useEffect, useMemo, useRef, useState } from 'react'
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  FileJson,
  Plus,
  Save,
  Send,
  Trash2,
  Undo2,
} from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import AdminGuard from '@/components/admin/AdminGuard'
import ArticleAssetField from '@/components/admin/resources/ArticleAssetField'
import ArticlePreview from '@/components/admin/resources/ArticlePreview'
import AdminResourcesNav from '@/components/admin/resources/AdminResourcesNav'
import ResourceSeriesMembershipsField from '@/components/admin/resources/ResourceSeriesMembershipsField'
import ResourceSocialPostsPanel from '@/components/admin/ResourceSocialPostsPanel'
import Card from '@/components/ui/Card'
import {
  ArticleAdminError,
  createArticleDraft,
  fetchAdminArticle,
  publishArticle,
  unpublishArticle,
  updateArticleDraft,
} from '@/lib/adminArticles'
import {
  articleFormToDraftPayload,
  articleRowToForm,
  createEmptyArticleForm,
  hasArticleEditorialData,
} from '@/lib/articleFormData'
import { analyzeArticleJson, applyAnalyzedArticleImport } from '@/lib/articleJsonImport'
import { isValidArticleSlug, resolveArticleSlugProposal, slugifyArticle } from '@/lib/articleSlug'
import { getArticleWarnings } from '@/lib/articleWarnings'
import {
  createArticleAssetUrls,
  fetchArticleAssets,
  resolveArticleAssets,
} from '@/lib/articleAssets'
import { buildArticleCanonicalUrl } from '@/lib/articleSeo'
import { buildDefaultSocialImageUrl } from '@/lib/siteConfig'
import { getResourceSocialDisabledReason } from '@/lib/resourceSocialPosts'

const ARTICLES_PATH = '/admin/ressources-ia/articles'
const CONTENT_TYPES = ['article']
const LANGUAGES = ['fr', 'en']
const LEVELS = ['beginner', 'intermediate', 'advanced']
const MEDIA_KINDS = ['diagram', 'illustration', 'infographic', 'chart', 'screenshot']
const RATIOS = ['16:9', '4:3', '1:1', '4:5']
const SOURCE_TYPES = [
  'official_documentation',
  'research_paper',
  'standard',
  'government',
  'book',
  'technical_article',
  'other',
]
const SEARCH_INTENTS = ['informational', 'comparative', 'tutorial']

export default function AdminArticleForm() {
  return (
    <AdminGuard>
      <AdminArticleFormPage />
    </AdminGuard>
  )
}

function AdminArticleFormPage() {
  const { t } = useTranslation()
  const { id } = useParams()
  const navigate = useNavigate()
  const editing = Boolean(id)
  const [form, setForm] = useState(createEmptyArticleForm)
  const [baseline, setBaseline] = useState(() => JSON.stringify(createEmptyArticleForm()))
  const [loading, setLoading] = useState(editing)
  const [loadError, setLoadError] = useState(null)
  const [publishedLocked, setPublishedLocked] = useState(false)
  const [publishedAt, setPublishedAt] = useState(null)
  const [saving, setSaving] = useState(false)
  const [transitioning, setTransitioning] = useState(false)
  const [assetBusyCount, setAssetBusyCount] = useState(0)
  const [notice, setNotice] = useState(null)
  const [importText, setImportText] = useState('')
  const [importFileName, setImportFileName] = useState('')
  const [importReport, setImportReport] = useState(null)
  const [readingFile, setReadingFile] = useState(false)
  const [assets, setAssets] = useState([])
  const [assetUrls, setAssetUrls] = useState({})
  const [assetsLoaded, setAssetsLoaded] = useState(!editing)
  const [assetLoadError, setAssetLoadError] = useState(false)
  const [coverPath, setCoverPath] = useState(null)
  const [infographicPath, setInfographicPath] = useState(null)
  const slugManuallyEdited = useRef(editing)

  const dirty = JSON.stringify(form) !== baseline
  const persistedForm = useMemo(() => JSON.parse(baseline), [baseline])
  const persistedSlug = editing ? persistedForm.slug : ''
  const socialPublicUrl = buildArticleCanonicalUrl(persistedSlug)
  const socialDisabledReason = getResourceSocialDisabledReason({
    resourceType: 'article',
    resourceId: id,
    persistedSlug,
  })
  const socialImageUrl = coverPath
    ? assetUrls[coverPath] || buildDefaultSocialImageUrl()
    : buildDefaultSocialImageUrl()
  const warnings = useMemo(
    () => getArticleWarnings(form, { articleId: id, assets, assetsLoaded, coverPath }),
    [assets, assetsLoaded, coverPath, form, id],
  )
  const resolvedAssets = useMemo(() => resolveArticleAssets(form.media, assets), [assets, form.media])

  useEffect(() => {
    if (!editing) return
    let cancelled = false
    setLoading(true)
    setLoadError(null)

    fetchAdminArticle(id)
      .then(async (row) => {
        if (cancelled) return
        const next = articleRowToForm(row)
        setPublishedLocked(row.status === 'published')
        setPublishedAt(row.published_at || null)
        slugManuallyEdited.current = true
        setForm(next)
        setBaseline(JSON.stringify(next))
        setCoverPath(row.cover_path || null)
        setInfographicPath(row.infographic_path || null)
        try {
          const persistedAssets = await fetchArticleAssets(id)
          const urls = await createArticleAssetUrls({
            coverPath: row.cover_path,
            infographicPath: row.infographic_path,
            assets: persistedAssets,
          }, id)
          if (!cancelled) {
            setAssets(persistedAssets)
            setAssetUrls(urls)
            setAssetsLoaded(true)
          }
        } catch (error) {
          console.error('Unable to load article assets:', error.message)
          if (!cancelled) {
            setAssetLoadError(true)
            setAssetsLoaded(true)
          }
        }
      })
      .catch((error) => {
        if (!cancelled) setLoadError(error.code || 'load')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [editing, id])

  const refreshAssetState = async ({
    coverPath: nextCoverPath = coverPath,
    infographicPath: nextInfographicPath = infographicPath,
  } = {}) => {
    setCoverPath(nextCoverPath || null)
    setInfographicPath(nextInfographicPath || null)
    setAssetLoadError(false)
    try {
      const persistedAssets = await fetchArticleAssets(id)
      const urls = await createArticleAssetUrls({
        coverPath: nextCoverPath,
        infographicPath: nextInfographicPath,
        assets: persistedAssets,
      }, id)
      setAssets(persistedAssets)
      setAssetUrls(urls)
    } catch (error) {
      console.error('Unable to refresh article assets:', error.message)
      setAssetLoadError(true)
    } finally {
      setAssetsLoaded(true)
    }
  }

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (!dirty) return
      event.preventDefault()
      event.returnValue = ''
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [dirty])

  const applyFormChange = (updater) => {
    setForm((current) => {
      const next = typeof updater === 'function' ? updater(current) : updater
      if (slugManuallyEdited.current) return next
      return {
        ...next,
        slug: resolveArticleSlugProposal({
          currentSlug: next.slug,
          manuallyEdited: false,
          suggestedSlug: next.seo?.suggestedSlug,
          title: next.title,
        }),
      }
    })
    setNotice(null)
  }

  const updateRoot = (field, value) => {
    applyFormChange((current) => ({ ...current, [field]: value }))
  }
  const updateNested = (group, field, value) => {
    applyFormChange((current) => ({
      ...current,
      [group]: { ...current[group], [field]: value },
    }))
  }
  const updateArrayItem = (group, index, field, value) => {
    applyFormChange((current) => ({
      ...current,
      [group]: current[group].map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item,
      ),
    }))
  }
  const removeArrayItem = (group, index) => {
    applyFormChange((current) => ({
      ...current,
      [group]: current[group].filter((_, itemIndex) => itemIndex !== index),
    }))
  }

  const leaveForm = (event) => {
    if (dirty && !window.confirm(t('admin.resourcesAi.articleForm.unsavedConfirm'))) {
      event?.preventDefault()
      return
    }
    if (event) event.preventDefault()
    navigate(ARTICLES_PATH)
  }

  const handleFile = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    setImportFileName(file.name)
    setImportReport(null)

    if (!file.name.toLowerCase().endsWith('.article.json')) {
      setImportReport({ success: false, error: 'invalidFileType' })
      event.target.value = ''
      return
    }

    setReadingFile(true)
    try {
      setImportText(await file.text())
    } catch {
      setImportReport({ success: false, error: 'fileReadError' })
    } finally {
      setReadingFile(false)
      event.target.value = ''
    }
  }

  const handleImport = () => {
    const analysis = analyzeArticleJson(importText)
    if (!analysis.success) {
      setImportReport({ ...analysis, cancelled: false })
      return
    }

    if (
      hasArticleEditorialData(form) &&
      !window.confirm(t('admin.resourcesAi.articleForm.import.replaceConfirm'))
    ) {
      setImportReport({ ...analysis, success: true, cancelled: true })
      return
    }

    const result = applyAnalyzedArticleImport(analysis, form)
    applyFormChange(result.nextForm)
    setImportReport(result)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (saving || publishedLocked) return
    setSaving(true)
    setNotice(null)
    try {
      const payload = articleFormToDraftPayload(form)
      const row = editing
        ? await updateArticleDraft(id, payload)
        : await createArticleDraft(payload)
      const next = articleRowToForm(row)
      slugManuallyEdited.current = true
      setForm(next)
      setBaseline(JSON.stringify(next))
      setNotice({ type: 'success', text: t('admin.resourcesAi.articleForm.messages.saved') })
      if (!editing) navigate(`${ARTICLES_PATH}/${row.id}/modifier`, { replace: true })
    } catch (error) {
      const code = error instanceof ArticleAdminError ? error.code : 'save'
      console.error('Unable to save article draft:', error.cause?.message || error.message)
      setNotice({ type: 'error', text: t(`admin.resourcesAi.articleForm.errors.${code}`) })
    } finally {
      setSaving(false)
    }
  }

  const handlePublish = async () => {
    if (!editing || dirty || saving || transitioning || assetBusyCount > 0) return
    if (!isValidArticleSlug(form.slug)) {
      setNotice({ type: 'error', text: t(`admin.resourcesAi.articleForm.errors.${form.slug ? 'slugInvalid' : 'slugRequired'}`) })
      return
    }
    const strongCount = warnings.filter(({ severity }) => severity === 'strong').length
    if (!window.confirm(t('admin.resourcesAi.articleForm.publishConfirm', { count: warnings.length, strongCount }))) return

    setTransitioning(true)
    setNotice(null)
    try {
      const row = await publishArticle(id)
      const next = articleRowToForm(row)
      setForm(next)
      setBaseline(JSON.stringify(next))
      setPublishedLocked(true)
      setPublishedAt(row.published_at || null)
      setNotice({ type: 'success', text: t('admin.resourcesAi.articleForm.messages.published') })
    } catch (error) {
      const code = error instanceof ArticleAdminError ? error.code : 'publish'
      console.error('Unable to publish article:', error.cause?.message || error.message)
      setNotice({ type: 'error', text: t(`admin.resourcesAi.articleForm.errors.${code}`) })
    } finally {
      setTransitioning(false)
    }
  }

  const handleUnpublish = async () => {
    if (!publishedLocked || transitioning) return
    if (!window.confirm(t('admin.resourcesAi.articleForm.unpublishConfirm'))) return
    setTransitioning(true)
    setNotice(null)
    try {
      const row = await unpublishArticle(id)
      const next = articleRowToForm(row)
      setForm(next)
      setBaseline(JSON.stringify(next))
      setPublishedLocked(false)
      setPublishedAt(null)
      setNotice({ type: 'success', text: t('admin.resourcesAi.articleForm.messages.unpublished') })
    } catch (error) {
      const code = error instanceof ArticleAdminError ? error.code : 'unpublish'
      console.error('Unable to unpublish article:', error.cause?.message || error.message)
      setNotice({ type: 'error', text: t(`admin.resourcesAi.articleForm.errors.${code}`) })
    } finally {
      setTransitioning(false)
    }
  }

  const handleAssetBusyChange = (busy) => {
    setAssetBusyCount((count) => Math.max(0, count + (busy ? 1 : -1)))
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
          <AdminResourcesNav active="articles" />
          <div className="min-w-0">
            <div className="mb-7">
              <Link
                to={ARTICLES_PATH}
                onClick={leaveForm}
                className="inline-flex items-center gap-2 text-sm font-medium text-navy/70 hover:text-accent-deep"
              >
                <ArrowLeft size={15} aria-hidden="true" />
                {t('admin.resourcesAi.articleForm.back')}
              </Link>
              <h2 className="mt-4 font-heading text-2xl font-bold tracking-tight text-navy md:text-3xl">
                {t(`admin.resourcesAi.articleForm.${editing ? 'editTitle' : 'addTitle'}`)}
              </h2>
              {publishedLocked && (
                <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
                  <span className="rounded-full border border-green-300 bg-green-100 px-3 py-1 text-xs font-semibold text-green-800">{t('admin.resourcesAi.articleForm.publishedBadge')}</span>
                  {publishedAt && <time dateTime={publishedAt} className="text-navy/65">{t('admin.resourcesAi.articleForm.publishedDate', { date: new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(publishedAt)) })}</time>}
                </div>
              )}
              <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted">
                {t('admin.resourcesAi.articleForm.subtitle')}
              </p>
            </div>

            {loading ? (
              <StateCard text={t('admin.resourcesAi.articleForm.loading')} />
            ) : loadError ? (
              <LoadError code={loadError} t={t} />
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {notice && <Notice notice={notice} />}

                {publishedLocked && (
                  <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-900">
                    <p>{t('admin.resourcesAi.articleForm.publishedReadOnly')}</p>
                    <p className="mt-2 text-xs">{t('admin.resourcesAi.articleForm.signedUrlLimit')}</p>
                  </div>
                )}

                <fieldset disabled={publishedLocked} className="space-y-6 disabled:opacity-80">

                {!publishedLocked && <FormSection number="1" title={t('admin.resourcesAi.articleForm.sections.import')}>
                  <ImportSection
                    fileName={importFileName}
                    importText={importText}
                    onFile={handleFile}
                    onImport={handleImport}
                    onText={setImportText}
                    reading={readingFile}
                    report={importReport}
                    t={t}
                  />
                </FormSection>}

                <FormSection number="2" title={t('admin.resourcesAi.articleForm.sections.general')}>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Field
                      label={t('admin.resourcesAi.articleForm.fields.schemaVersion')}
                      type="number"
                      step="1"
                      value={form.schemaVersion}
                      onChange={(value) => updateRoot('schemaVersion', value)}
                    />
                    <SelectField
                      label={t('admin.resourcesAi.articleForm.fields.contentType')}
                      value={form.contentType}
                      options={CONTENT_TYPES}
                      onChange={(value) => updateRoot('contentType', value)}
                      t={t}
                      translationPrefix="admin.resourcesAi.articleForm.contentTypes"
                    />
                    <SelectField
                      label={t('admin.resourcesAi.articleForm.fields.language')}
                      value={form.language}
                      options={LANGUAGES}
                      onChange={(value) => updateRoot('language', value)}
                      t={t}
                      translationPrefix="admin.resourcesAi.articleForm.languages"
                    />
                    <SelectField
                      label={t('admin.resourcesAi.articleForm.fields.level')}
                      value={form.level}
                      options={LEVELS}
                      onChange={(value) => updateRoot('level', value)}
                      t={t}
                      translationPrefix="admin.resourcesAi.articleForm.levels"
                    />
                  </div>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <Field label={t('admin.resourcesAi.articleForm.fields.title')} value={form.title} onChange={(value) => updateRoot('title', value)} />
                    <Field label={t('admin.resourcesAi.articleForm.fields.subtitle')} value={form.subtitle} onChange={(value) => updateRoot('subtitle', value)} />
                    <Field as="textarea" rows={3} label={t('admin.resourcesAi.articleForm.fields.summary')} value={form.summary} onChange={(value) => updateRoot('summary', value)} />
                    <Field label={t('admin.resourcesAi.articleForm.fields.theme')} value={form.theme} onChange={(value) => updateRoot('theme', value)} />
                  </div>
                  <div className="mt-4 rounded-xl border border-accent/15 bg-accent/[0.04] p-4">
                    <Field
                      label={t('admin.resourcesAi.articleForm.fields.slug')}
                      hint={t('admin.resourcesAi.articleForm.fields.slugHint')}
                      value={form.slug}
                      onChange={(value) => {
                        slugManuallyEdited.current = true
                        setForm((current) => ({ ...current, slug: value }))
                        setNotice(null)
                      }}
                      onBlur={() => setForm((current) => ({ ...current, slug: slugifyArticle(current.slug) }))}
                    />
                  </div>
                </FormSection>

                </fieldset>

                <FormSection number="3" title={t('admin.resourcesAi.memberships.title')}>
                  <ResourceSeriesMembershipsField resourceId={id} resourceType="article" />
                </FormSection>

                <fieldset disabled={publishedLocked} className="space-y-6 disabled:opacity-80">

                <FormSection number="4" title={t('admin.resourcesAi.articleForm.sections.learning')}>
                  <div className="grid gap-6 lg:grid-cols-2">
                    <StringList
                      label={t('admin.resourcesAi.articleForm.fields.learningObjectives')}
                      values={form.learningObjectives}
                      onChange={(values) => updateRoot('learningObjectives', values)}
                      addLabel={t('admin.resourcesAi.articleForm.list.addObjective')}
                      t={t}
                    />
                    <StringList
                      label={t('admin.resourcesAi.articleForm.fields.prerequisites')}
                      values={form.prerequisites}
                      onChange={(values) => updateRoot('prerequisites', values)}
                      addLabel={t('admin.resourcesAi.articleForm.list.addPrerequisite')}
                      t={t}
                    />
                  </div>
                  <div className="mt-5">
                    <Field as="textarea" rows={4} label={t('admin.resourcesAi.articleForm.fields.takeaway')} value={form.takeaway} onChange={(value) => updateRoot('takeaway', value)} />
                  </div>
                </FormSection>

                <FormSection number="5" title={t('admin.resourcesAi.articleForm.sections.markdown')}>
                  <Field
                    as="textarea"
                    rows={22}
                    className="font-mono text-[13px] leading-relaxed"
                    label={t('admin.resourcesAi.articleForm.fields.contentMarkdown')}
                    hint={t('admin.resourcesAi.articleForm.fields.markdownHint')}
                    value={form.contentMarkdown}
                    onChange={(value) => updateRoot('contentMarkdown', value)}
                  />
                </FormSection>

                <FormSection number="6" title={t('admin.resourcesAi.articleForm.sections.media')}>
                  <ObjectListHeader
                    description={t('admin.resourcesAi.articleForm.media.help')}
                    onAdd={() => updateRoot('media', [...form.media, { sourceKeys: [], required: false }])}
                    addLabel={t('admin.resourcesAi.articleForm.media.add')}
                  />
                  <div className="mt-4 space-y-4">
                    {form.media.map((item, index) => (
                      <EditorCard
                        key={index}
                        title={item.title || item.key || t('admin.resourcesAi.articleForm.media.item', { number: index + 1 })}
                        onRemove={() => removeArrayItem('media', index)}
                        removeLabel={t('admin.resourcesAi.articleForm.list.remove')}
                      >
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                          <Field label={t('admin.resourcesAi.articleForm.fields.mediaKey')} value={item.key || ''} onChange={(value) => updateArrayItem('media', index, 'key', value)} />
                          <SelectField label={t('admin.resourcesAi.articleForm.fields.mediaKind')} value={item.kind || ''} options={MEDIA_KINDS} onChange={(value) => updateArrayItem('media', index, 'kind', value)} t={t} translationPrefix="admin.resourcesAi.articleForm.mediaKinds" />
                          <SelectField label={t('admin.resourcesAi.articleForm.fields.aspectRatio')} value={item.preferredAspectRatio || ''} options={RATIOS} onChange={(value) => updateArrayItem('media', index, 'preferredAspectRatio', value)} t={t} />
                          <Field label={t('admin.resourcesAi.articleForm.fields.mediaTitle')} value={item.title || ''} onChange={(value) => updateArrayItem('media', index, 'title', value)} />
                          <Field label={t('admin.resourcesAi.articleForm.fields.caption')} value={item.caption || ''} onChange={(value) => updateArrayItem('media', index, 'caption', value)} />
                          <Field label={t('admin.resourcesAi.articleForm.fields.altText')} value={item.altText || ''} onChange={(value) => updateArrayItem('media', index, 'altText', value)} />
                        </div>
                        <div className="mt-4">
                          <Field as="textarea" rows={5} label={t('admin.resourcesAi.articleForm.fields.generationBrief')} value={item.generationBrief || ''} onChange={(value) => updateArrayItem('media', index, 'generationBrief', value)} />
                        </div>
                        <div className="mt-4 grid gap-4 lg:grid-cols-2">
                          <StringList
                            compact
                            label={t('admin.resourcesAi.articleForm.fields.sourceKeys')}
                            values={Array.isArray(item.sourceKeys) ? item.sourceKeys : []}
                            onChange={(values) => updateArrayItem('media', index, 'sourceKeys', values)}
                            addLabel={t('admin.resourcesAi.articleForm.list.addSourceKey')}
                            t={t}
                          />
                          <label className="flex items-center gap-3 self-start rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-navy">
                            <input
                              type="checkbox"
                              checked={item.required === true}
                              onChange={(event) => updateArrayItem('media', index, 'required', event.target.checked)}
                              className="h-4 w-4 accent-accent"
                            />
                            {t('admin.resourcesAi.articleForm.fields.required')}
                          </label>
                        </div>
                        <ArticleAssetField
                          articleId={id}
                          asset={resolvedAssets.media[index]?.asset || null}
                          infographicPath={infographicPath}
                          kind="media"
                          media={item}
                          onChanged={refreshAssetState}
                          onBusyChange={handleAssetBusyChange}
                          t={t}
                          url={resolvedAssets.media[index]?.asset ? assetUrls[resolvedAssets.media[index].asset.storage_path] : null}
                        />
                      </EditorCard>
                    ))}
                  </div>
                  {assetLoadError && <p role="alert" className="mt-4 text-sm text-red-700">{t('admin.resourcesAi.articleForm.assets.errors.load')}</p>}
                  {resolvedAssets.orphans.length > 0 && (
                    <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
                      <h4 className="font-heading font-semibold text-amber-950">{t('admin.resourcesAi.articleForm.assets.orphans')}</h4>
                      <p className="mt-1 text-sm text-amber-900">{t('admin.resourcesAi.articleForm.assets.orphansHelp')}</p>
                      <div className="mt-4 space-y-3">
                        {resolvedAssets.orphans.map((asset) => (
                          <div key={asset.id} className="rounded-xl border border-amber-200 bg-white p-4">
                            <p className="font-mono text-xs text-navy">{asset.media_key}</p>
                            <ArticleAssetField articleId={id} asset={asset} kind="media" media={{ key: asset.media_key }} onChanged={refreshAssetState} onBusyChange={handleAssetBusyChange} t={t} url={assetUrls[asset.storage_path]} />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </FormSection>

                <FormSection number="7" title={t('admin.resourcesAi.articleForm.sections.cover')}>
                  <p className="mb-4 text-sm text-muted">{t('admin.resourcesAi.articleForm.cover.help')}</p>
                  <ArticleAssetField articleId={id} coverPath={coverPath} infographicPath={infographicPath} kind="cover" onChanged={refreshAssetState} onBusyChange={handleAssetBusyChange} t={t} url={coverPath ? assetUrls[coverPath] : null} />
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <Field label={t('admin.resourcesAi.articleForm.fields.altText')} value={form.cover.altText || ''} onChange={(value) => updateNested('cover', 'altText', value)} />
                    <SelectField label={t('admin.resourcesAi.articleForm.fields.aspectRatio')} value={form.cover.preferredAspectRatio || ''} options={RATIOS} onChange={(value) => updateNested('cover', 'preferredAspectRatio', value)} t={t} />
                  </div>
                  <div className="mt-4">
                    <Field as="textarea" rows={5} label={t('admin.resourcesAi.articleForm.fields.generationBrief')} value={form.cover.generationBrief || ''} onChange={(value) => updateNested('cover', 'generationBrief', value)} />
                  </div>
                </FormSection>

                <FormSection number="8" title={t('admin.resourcesAi.articleForm.sections.infographic')}>
                  <p className="mb-4 text-sm leading-relaxed text-muted">{t('admin.resourcesAi.articleForm.infographic.help')}</p>
                  <ArticleAssetField
                    articleId={id}
                    infographicAltText={form.infographicAltText}
                    infographicPath={infographicPath}
                    kind="infographic"
                    onChanged={refreshAssetState}
                    onBusyChange={handleAssetBusyChange}
                    t={t}
                    url={infographicPath ? assetUrls[infographicPath] : null}
                  />
                  <div className="mt-4">
                    <Field
                      as="textarea"
                      rows={3}
                      hint={t('admin.resourcesAi.articleForm.infographic.altHint', {
                        fallback: form.title || t('admin.resourcesAi.articleForm.preview.untitled'),
                      })}
                      label={t('admin.resourcesAi.articleForm.fields.infographicAltText')}
                      value={form.infographicAltText}
                      onChange={(value) => updateRoot('infographicAltText', value)}
                    />
                  </div>
                </FormSection>

                <FormSection number="9" title={t('admin.resourcesAi.articleForm.sections.sources')}>
                  <ObjectListHeader
                    onAdd={() => updateRoot('sources', [...form.sources, { authors: [] }])}
                    addLabel={t('admin.resourcesAi.articleForm.sources.add')}
                  />
                  <div className="mt-4 space-y-4">
                    {form.sources.map((item, index) => (
                      <EditorCard
                        key={index}
                        title={item.title || item.key || t('admin.resourcesAi.articleForm.sources.item', { number: index + 1 })}
                        onRemove={() => removeArrayItem('sources', index)}
                        removeLabel={t('admin.resourcesAi.articleForm.list.remove')}
                      >
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                          <Field label={t('admin.resourcesAi.articleForm.fields.sourceKey')} value={item.key || ''} onChange={(value) => updateArrayItem('sources', index, 'key', value)} />
                          <Field label={t('admin.resourcesAi.articleForm.fields.sourceTitle')} value={item.title || ''} onChange={(value) => updateArrayItem('sources', index, 'title', value)} />
                          <Field label={t('admin.resourcesAi.articleForm.fields.organization')} value={item.organization || ''} onChange={(value) => updateArrayItem('sources', index, 'organization', value)} />
                          <SelectField label={t('admin.resourcesAi.articleForm.fields.sourceType')} value={item.sourceType || ''} options={SOURCE_TYPES} onChange={(value) => updateArrayItem('sources', index, 'sourceType', value)} t={t} translationPrefix="admin.resourcesAi.articleForm.sourceTypes" />
                          <Field label={t('admin.resourcesAi.articleForm.fields.publicationDate')} value={item.publicationDate || ''} onChange={(value) => updateArrayItem('sources', index, 'publicationDate', value)} />
                          <Field label={t('admin.resourcesAi.articleForm.fields.accessDate')} value={item.accessDate || ''} onChange={(value) => updateArrayItem('sources', index, 'accessDate', value)} />
                        </div>
                        <div className="mt-4">
                          <Field label={t('admin.resourcesAi.articleForm.fields.url')} type="url" value={item.url || ''} onChange={(value) => updateArrayItem('sources', index, 'url', value)} />
                        </div>
                        <div className="mt-4">
                          <StringList
                            compact
                            label={t('admin.resourcesAi.articleForm.fields.authors')}
                            values={Array.isArray(item.authors) ? item.authors : []}
                            onChange={(values) => updateArrayItem('sources', index, 'authors', values)}
                            addLabel={t('admin.resourcesAi.articleForm.list.addAuthor')}
                            t={t}
                          />
                        </div>
                      </EditorCard>
                    ))}
                  </div>
                </FormSection>

                <FormSection number="10" title={t('admin.resourcesAi.articleForm.sections.keywords')}>
                  <StringList
                    label={t('admin.resourcesAi.articleForm.fields.keywords')}
                    values={form.keywords}
                    onChange={(values) => updateRoot('keywords', values)}
                    addLabel={t('admin.resourcesAi.articleForm.list.addKeyword')}
                    t={t}
                  />
                </FormSection>

                <FormSection number="11" title={t('admin.resourcesAi.articleForm.sections.seo')}>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label={t('admin.resourcesAi.articleForm.fields.primaryQuery')} value={form.seo.primaryQuery || ''} onChange={(value) => updateNested('seo', 'primaryQuery', value)} />
                    <SelectField label={t('admin.resourcesAi.articleForm.fields.searchIntent')} value={form.seo.searchIntent || ''} options={SEARCH_INTENTS} onChange={(value) => updateNested('seo', 'searchIntent', value)} t={t} translationPrefix="admin.resourcesAi.articleForm.searchIntents" />
                    <Field label={t('admin.resourcesAi.articleForm.fields.seoTitle')} value={form.seo.seoTitle || ''} onChange={(value) => updateNested('seo', 'seoTitle', value)} />
                    <Field label={t('admin.resourcesAi.articleForm.fields.suggestedSlug')} hint={t('admin.resourcesAi.articleForm.fields.suggestedSlugHint')} value={form.seo.suggestedSlug || ''} onChange={(value) => updateNested('seo', 'suggestedSlug', value)} />
                  </div>
                  <div className="mt-4">
                    <Field as="textarea" rows={4} label={t('admin.resourcesAi.articleForm.fields.metaDescription')} value={form.seo.metaDescription || ''} onChange={(value) => updateNested('seo', 'metaDescription', value)} />
                  </div>
                  <div className="mt-5 grid gap-6 lg:grid-cols-2">
                    <StringList
                      compact
                      label={t('admin.resourcesAi.articleForm.fields.secondaryQueries')}
                      values={Array.isArray(form.seo.secondaryQueries) ? form.seo.secondaryQueries : []}
                      onChange={(values) => updateNested('seo', 'secondaryQueries', values)}
                      addLabel={t('admin.resourcesAi.articleForm.list.addSecondaryQuery')}
                      t={t}
                    />
                    <InternalLinks
                      values={Array.isArray(form.seo.internalLinkSuggestions) ? form.seo.internalLinkSuggestions : []}
                      onChange={(values) => updateNested('seo', 'internalLinkSuggestions', values)}
                      t={t}
                    />
                  </div>
                </FormSection>

                <FormSection number="12" title={t('admin.resourcesAi.articleForm.sections.warnings')}>
                  <WarningsList warnings={warnings} t={t} />
                </FormSection>

                <FormSection number="13" title={t('admin.resourcesAi.articleForm.sections.preview')}>
                  <ArticlePreview
                    assets={assets}
                    assetUrls={assetUrls}
                    coverUrl={coverPath ? assetUrls[coverPath] : null}
                    form={form}
                    infographic={infographicPath && assetUrls[infographicPath] ? {
                      altText: form.infographicAltText,
                      url: assetUrls[infographicPath],
                    } : null}
                    t={t}
                  />
                </FormSection>
                </fieldset>

                <FormSection number="14" title={t('admin.resourcesAi.socialPosts.title')}>
                  <ResourceSocialPostsPanel
                    disabledReason={socialDisabledReason}
                    publicUrl={socialPublicUrl}
                    resourceId={id}
                    resourceType="article"
                    socialImageUrl={socialImageUrl}
                    status={publishedLocked ? 'published' : 'draft'}
                    title={editing ? persistedForm.title : form.title}
                  />
                </FormSection>

                <FormSection number="15" title={t(`admin.resourcesAi.articleForm.sections.${publishedLocked ? 'publication' : 'save'}`)}>
                  <p className="text-sm leading-relaxed text-muted">
                    {publishedLocked ? t('admin.resourcesAi.articleForm.publishedReadOnly') : dirty && editing ? t('admin.resourcesAi.articleForm.messages.saveBeforePublish') : t('admin.resourcesAi.articleForm.draftOnly')}
                  </p>
                  <div className="mt-5 flex flex-wrap justify-end gap-3">
                    <button type="button" onClick={leaveForm} className="rounded-full border border-gray-300 px-6 py-2.5 text-sm font-medium text-navy">
                      {t('admin.resourcesAi.articleForm.actions.cancel')}
                    </button>
                    {publishedLocked ? (
                      <>
                        {form.slug && <a href={`/ressources-ia/articles/${form.slug}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full border border-gray-300 px-5 py-2.5 text-sm font-medium text-navy"><ExternalLink size={16} aria-hidden="true" />{t('admin.resourcesAi.articleForm.actions.open')}</a>}
                        <button type="button" disabled={transitioning} onClick={handleUnpublish} className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-50"><Undo2 size={16} aria-hidden="true" />{transitioning ? t('admin.resourcesAi.articleForm.actions.unpublishing') : t('admin.resourcesAi.articleForm.actions.unpublish')}</button>
                      </>
                    ) : (
                      <>
                        <button type="submit" disabled={saving || transitioning || assetBusyCount > 0} className="inline-flex items-center gap-2 rounded-full border border-accent/40 px-6 py-2.5 text-sm font-semibold text-accent-deep disabled:opacity-50"><Save size={16} aria-hidden="true" />{saving ? t('admin.resourcesAi.articleForm.actions.saving') : t('admin.resourcesAi.articleForm.actions.saveDraft')}</button>
                        <button type="button" onClick={handlePublish} disabled={!editing || dirty || !isValidArticleSlug(form.slug) || saving || transitioning || assetBusyCount > 0} title={dirty ? t('admin.resourcesAi.articleForm.messages.saveBeforePublish') : undefined} className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"><Send size={16} aria-hidden="true" />{transitioning ? t('admin.resourcesAi.articleForm.actions.publishing') : t('admin.resourcesAi.articleForm.actions.publish')}</button>
                      </>
                    )}
                  </div>
                </FormSection>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

function FormSection({ children, number, title }) {
  return (
    <Card className="p-5 sm:p-6">
      <div className="mb-5 flex items-center gap-3 border-b border-gray-100 pb-4">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/10 text-xs font-bold text-accent-deep">
          {number}
        </span>
        <h3 className="font-heading text-lg font-bold text-navy">{title}</h3>
      </div>
      {children}
    </Card>
  )
}

function Field({ as = 'input', className = '', hint, label, onChange, value, ...props }) {
  const Component = as
  return (
    <label className="block min-w-0">
      <span className="mb-1.5 block text-[12px] font-bold uppercase tracking-[0.1em] text-navy/65">
        {label}
      </span>
      <Component
        {...props}
        value={value ?? ''}
        onChange={(event) => onChange(event.target.value)}
        className={`w-full rounded-xl border border-navy/15 bg-white px-4 py-2.5 text-sm text-navy placeholder:text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 ${className}`}
      />
      {hint && <span className="mt-1.5 block text-xs leading-relaxed text-muted">{hint}</span>}
    </label>
  )
}

function SelectField({ label, onChange, options, t, translationPrefix, value }) {
  const unknown = value && !options.includes(value)
  return (
    <label className="block min-w-0">
      <span className="mb-1.5 block text-[12px] font-bold uppercase tracking-[0.1em] text-navy/65">
        {label}
      </span>
      <select
        value={value || ''}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-navy/15 bg-white px-4 py-2.5 text-sm text-navy focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
      >
        <option value="">{t('admin.resourcesAi.articleForm.selectEmpty')}</option>
        {unknown && (
          <option value={value}>
            {t('admin.resourcesAi.articleForm.unknownOption', { value })}
          </option>
        )}
        {options.map((option) => (
          <option key={option} value={option}>
            {translationPrefix
              ? t(`${translationPrefix}.${option}`, { defaultValue: option })
              : option}
          </option>
        ))}
      </select>
    </label>
  )
}

function StringList({ addLabel, compact = false, label, onChange, t, values }) {
  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <h4 className="text-[12px] font-bold uppercase tracking-[0.1em] text-navy/65">{label}</h4>
        <button
          type="button"
          onClick={() => onChange([...values, ''])}
          className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-navy hover:border-accent"
        >
          <Plus size={13} aria-hidden="true" />
          {addLabel}
        </button>
      </div>
      {values.length === 0 ? (
        <p className="mt-3 rounded-xl border border-dashed border-gray-200 px-4 py-3 text-sm text-muted">
          {t('admin.resourcesAi.articleForm.list.empty')}
        </p>
      ) : (
        <div className="mt-3 space-y-2">
          {values.map((value, index) => (
            <div key={index} className="flex items-start gap-2">
              {compact ? (
                <input
                  value={value}
                  onChange={(event) => onChange(values.map((item, itemIndex) => (itemIndex === index ? event.target.value : item)))}
                  className="min-w-0 flex-1 rounded-xl border border-navy/15 px-4 py-2.5 text-sm text-navy focus:border-accent focus:outline-none"
                />
              ) : (
                <textarea
                  rows={2}
                  value={value}
                  onChange={(event) => onChange(values.map((item, itemIndex) => (itemIndex === index ? event.target.value : item)))}
                  className="min-w-0 flex-1 rounded-xl border border-navy/15 px-4 py-2.5 text-sm text-navy focus:border-accent focus:outline-none"
                />
              )}
              <button
                type="button"
                onClick={() => onChange(values.filter((_, itemIndex) => itemIndex !== index))}
                aria-label={t('admin.resourcesAi.articleForm.list.remove')}
                className="mt-1 rounded-lg border border-red-200 p-2 text-red-700 hover:bg-red-50"
              >
                <Trash2 size={14} aria-hidden="true" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function ObjectListHeader({ addLabel, description, onAdd }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      {description ? <p className="max-w-2xl text-sm leading-relaxed text-muted">{description}</p> : <span />}
      <button type="button" onClick={onAdd} className="inline-flex items-center justify-center gap-2 rounded-full border border-accent/30 px-4 py-2 text-sm font-medium text-accent-deep hover:bg-accent/5">
        <Plus size={14} aria-hidden="true" />
        {addLabel}
      </button>
    </div>
  )
}

function EditorCard({ children, onRemove, removeLabel, title }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-surface/40 p-4 sm:p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h4 className="truncate font-heading text-sm font-semibold text-navy">{title}</h4>
        <button type="button" onClick={onRemove} className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-xs text-red-700 hover:bg-red-50">
          <Trash2 size={13} aria-hidden="true" />
          {removeLabel}
        </button>
      </div>
      {children}
    </div>
  )
}

function InternalLinks({ onChange, t, values }) {
  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <h4 className="text-[12px] font-bold uppercase tracking-[0.1em] text-navy/65">
          {t('admin.resourcesAi.articleForm.fields.internalLinks')}
        </h4>
        <button type="button" onClick={() => onChange([...values, {}])} className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-navy hover:border-accent">
          <Plus size={13} aria-hidden="true" />
          {t('admin.resourcesAi.articleForm.list.addInternalLink')}
        </button>
      </div>
      <div className="mt-3 space-y-3">
        {values.map((item, index) => (
          <div key={index} className="rounded-xl border border-gray-200 bg-white p-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label={t('admin.resourcesAi.articleForm.fields.targetTopic')} value={item.targetTopic || ''} onChange={(value) => onChange(values.map((entry, entryIndex) => (entryIndex === index ? { ...entry, targetTopic: value } : entry)))} />
              <Field label={t('admin.resourcesAi.articleForm.fields.suggestedAnchor')} value={item.suggestedAnchor || ''} onChange={(value) => onChange(values.map((entry, entryIndex) => (entryIndex === index ? { ...entry, suggestedAnchor: value } : entry)))} />
            </div>
            <div className="mt-3 flex items-end gap-2">
              <div className="min-w-0 flex-1">
                <Field label={t('admin.resourcesAi.articleForm.fields.placementHint')} value={item.placementHint || ''} onChange={(value) => onChange(values.map((entry, entryIndex) => (entryIndex === index ? { ...entry, placementHint: value } : entry)))} />
              </div>
              <button type="button" onClick={() => onChange(values.filter((_, entryIndex) => entryIndex !== index))} aria-label={t('admin.resourcesAi.articleForm.list.remove')} className="mb-0.5 rounded-lg border border-red-200 p-2.5 text-red-700 hover:bg-red-50">
                <Trash2 size={14} aria-hidden="true" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ImportSection({ fileName, importText, onFile, onImport, onText, reading, report, t }) {
  return (
    <div>
      <p className="text-sm leading-relaxed text-muted">{t('admin.resourcesAi.articleForm.import.help')}</p>
      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px] lg:items-end">
        <Field
          as="textarea"
          rows={10}
          className="font-mono text-xs"
          label={t('admin.resourcesAi.articleForm.import.pasteLabel')}
          placeholder={t('admin.resourcesAi.articleForm.import.placeholder')}
          value={importText}
          onChange={onText}
        />
        <div className="space-y-3">
          <label className="block rounded-xl border border-dashed border-gray-300 bg-surface px-4 py-4 text-center text-sm text-navy hover:border-accent">
            <FileJson size={22} className="mx-auto mb-2 text-accent" aria-hidden="true" />
            <span className="font-medium">{reading ? t('admin.resourcesAi.articleForm.import.reading') : t('admin.resourcesAi.articleForm.import.chooseFile')}</span>
            <span className="mt-1 block truncate text-xs text-muted">{fileName || t('admin.resourcesAi.articleForm.import.noFile')}</span>
            <input type="file" accept=".article.json,application/json" onChange={onFile} className="sr-only" />
          </label>
          <button type="button" disabled={reading} onClick={onImport} className="w-full rounded-full bg-navy px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50">
            {t('admin.resourcesAi.articleForm.import.analyze')}
          </button>
        </div>
      </div>
      {report && <ImportReport report={report} t={t} />}
    </div>
  )
}

function ImportReport({ report, t }) {
  if (!report.success) {
    return (
      <div role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
        {t(`admin.resourcesAi.articleForm.import.errors.${report.error}`)}
      </div>
    )
  }

  return (
    <div className={`mt-4 rounded-xl border px-4 py-4 text-sm ${report.cancelled ? 'border-amber-200 bg-amber-50 text-amber-900' : 'border-green-200 bg-green-50 text-green-900'}`}>
      <p className="flex items-center gap-2 font-semibold">
        {report.cancelled ? <AlertTriangle size={16} aria-hidden="true" /> : <CheckCircle2 size={16} aria-hidden="true" />}
        {t(`admin.resourcesAi.articleForm.import.result.${report.cancelled ? 'cancelled' : 'success'}`)}
      </p>
      {!report.cancelled && <p className="mt-1 text-xs">{t('admin.resourcesAi.articleForm.import.result.notSaved')}</p>}
      {report.imported?.length > 0 && <ReportList title={t('admin.resourcesAi.articleForm.import.result.imported')} values={report.imported} />}
      {report.warnings?.length > 0 && (
        <ReportList
          title={t('admin.resourcesAi.articleForm.import.result.warnings')}
          values={report.warnings.map(({ path, code }) => `${path} — ${t(`admin.resourcesAi.articleForm.import.warnings.${code}`)}`)}
        />
      )}
    </div>
  )
}

function ReportList({ title, values }) {
  return (
    <div className="mt-3">
      <p className="text-xs font-bold uppercase tracking-wider">{title}</p>
      <ul className="mt-1 list-disc space-y-1 pl-5 text-xs">
        {values.map((value, index) => <li key={`${value}-${index}`}>{value}</li>)}
      </ul>
    </div>
  )
}

function WarningsList({ t, warnings }) {
  if (warnings.length === 0) {
    return <p className="flex items-center gap-2 text-sm text-green-800"><CheckCircle2 size={17} aria-hidden="true" />{t('admin.resourcesAi.articleForm.warnings.none')}</p>
  }
  return (
    <div>
      <p className="mb-3 text-sm leading-relaxed text-muted">{t('admin.resourcesAi.articleForm.warnings.help', { count: warnings.length })}</p>
      <ul className="space-y-2">
        {warnings.map((warning, index) => (
          <li key={`${warning.path}-${warning.code}-${index}`} className={`rounded-xl border px-4 py-3 text-sm ${warning.severity === 'strong' ? 'border-amber-300 bg-amber-50 text-amber-950' : 'border-gray-200 bg-surface text-navy'}`}>
            <span className="font-mono text-xs text-navy/55">{warning.path}</span>
            <span className="mx-2 text-navy/25">—</span>
            {t(`admin.resourcesAi.articleForm.warnings.codes.${warning.code}`, warning.details || {})}
          </li>
        ))}
      </ul>
    </div>
  )
}

function Notice({ notice }) {
  return <div role={notice.type === 'success' ? 'status' : 'alert'} className={`rounded-xl border px-4 py-3 text-sm ${notice.type === 'success' ? 'border-green-200 bg-green-50 text-green-800' : 'border-red-200 bg-red-50 text-red-800'}`}>{notice.text}</div>
}

function StateCard({ text }) {
  return <Card className="flex min-h-72 items-center justify-center"><p className="text-sm text-muted">{text}</p></Card>
}

function LoadError({ code, t }) {
  return (
    <Card className="min-h-64 text-center">
      <AlertTriangle size={28} className="mx-auto text-accent" aria-hidden="true" />
      <h3 className="mt-4 font-heading text-lg font-bold text-navy">{t('admin.resourcesAi.articleForm.loadErrorTitle')}</h3>
      <p className="mt-2 text-sm text-muted">{t(`admin.resourcesAi.articleForm.errors.${code}`)}</p>
      <Link to={ARTICLES_PATH} className="mt-5 inline-flex rounded-full border border-gray-300 px-5 py-2 text-sm text-navy">{t('admin.resourcesAi.articleForm.back')}</Link>
    </Card>
  )
}
