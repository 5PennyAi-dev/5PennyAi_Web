import { useEffect, useMemo, useRef, useState } from 'react'
import {
  AlertTriangle,
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  CheckCircle2,
  Eye,
  Image as ImageIcon,
  LoaderCircle,
  Plus,
  Trash2,
  Upload,
} from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import AdminGuard from '@/components/admin/AdminGuard'
import InfographicThumbnailField from '@/components/admin/resources/InfographicThumbnailField'
import {
  hasInfographicMetadata,
  importInfographicJson,
} from '@/lib/infographicJsonImport'
import {
  buildInfographicThumbnailPath,
  isAllowedThumbnailMime,
  isInfographicThumbnailPathForResource,
  isThumbnailSizeAllowed,
  validateInfographicThumbnail,
} from '@/lib/infographicThumbnails'
import { supabase } from '@/lib/supabase'

const LIST_PATH = '/admin/ressources-ia/infographies'
const BUCKET = 'infographics'
const IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp']
const IMPORT_FIELD_TRANSLATION_KEYS = {
  title: 'fields.title',
  subtitle: 'fields.subtitle',
  summary: 'fields.summary',
  introduction: 'fields.introduction',
  imageAlt: 'fields.imageAlt',
  theme: 'fields.theme',
  level: 'fields.level',
  readingTimeMinutes: 'fields.readingTime',
  'series.name': 'fields.seriesName',
  'series.episodeNumber': 'fields.episodeNumber',
  keyPoints: 'sections.keyPoints',
  takeaway: 'sections.takeaway',
  keywords: 'sections.keywords',
  sources: 'sections.sources',
}
const EDIT_COLUMNS =
  'id, status, published_at, image_path, image_metadata, thumbnail_path, title, subtitle, summary, introduction, image_alt, theme, level, reading_time_minutes, series_name, episode_number, key_points, takeaway, keywords, sources'

const EMPTY_FORM = {
  title: '',
  subtitle: '',
  summary: '',
  introduction: '',
  image_alt: '',
  theme: '',
  level: '',
  reading_time_minutes: '',
  series_name: '',
  episode_number: '',
  key_points: [],
  takeaway: '',
  keywords: '',
  sources: [],
}

export default function AdminInfographicForm() {
  return (
    <AdminGuard>
      <AdminInfographicFormPage />
    </AdminGuard>
  )
}

function AdminInfographicFormPage() {
  const { id: routeId } = useParams()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [resourceId, setResourceId] = useState(routeId || null)
  const [status, setStatus] = useState('draft')
  const [publishedAt, setPublishedAt] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [imagePath, setImagePath] = useState(null)
  const [imageMetadata, setImageMetadata] = useState(null)
  const [pendingImage, setPendingImage] = useState(null)
  const [removeImage, setRemoveImage] = useState(false)
  const [thumbnailPath, setThumbnailPath] = useState(null)
  const [pendingThumbnail, setPendingThumbnail] = useState(null)
  const [removeThumbnail, setRemoveThumbnail] = useState(false)
  const [thumbnailFeedback, setThumbnailFeedback] = useState(null)
  const [loading, setLoading] = useState(Boolean(routeId))
  const [loadState, setLoadState] = useState('ready')
  const [saving, setSaving] = useState(false)
  const [savePhase, setSavePhase] = useState(null)
  const [dirty, setDirty] = useState(false)
  const [notice, setNotice] = useState(null)
  const [jsonInput, setJsonInput] = useState('')
  const [jsonFileName, setJsonFileName] = useState('')
  const [jsonReport, setJsonReport] = useState(null)
  const [readingJsonFile, setReadingJsonFile] = useState(false)
  const localCreationRef = useRef(null)
  const restoringHistoryRef = useRef(false)

  useEffect(() => {
    if (!routeId) {
      setLoading(false)
      return
    }
    if (localCreationRef.current === routeId) {
      localCreationRef.current = null
      return
    }

    let cancelled = false
    setLoading(true)
    setLoadState('ready')

    supabase
      .from('infographics')
      .select(EDIT_COLUMNS)
      .eq('id', routeId)
      .maybeSingle()
      .then(({ data, error }) => {
        if (cancelled) return
        if (error) {
          console.error('Unable to load infographic:', error.message)
          setLoadState('error')
          return
        }
        if (!data) {
          setLoadState('missing')
          return
        }
        setResourceId(data.id)
        setStatus(data.status === 'published' ? 'published' : 'draft')
        setPublishedAt(data.published_at)
        setImagePath(data.image_path)
        setImageMetadata(data.image_metadata)
        setThumbnailPath(data.thumbnail_path)
        setForm(toFormState(data))
        setDirty(false)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [routeId])

  useEffect(() => {
    if (!dirty) return undefined

    const handleBeforeUnload = (event) => {
      event.preventDefault()
      event.returnValue = ''
    }
    const handleLinkClick = (event) => {
      const link = event.target.closest?.('a[href]')
      if (!link || link.target === '_blank' || link.hasAttribute('download')) return
      if (!window.confirm(t('admin.resourcesAi.infographicForm.unsavedConfirm'))) {
        event.preventDefault()
        event.stopPropagation()
      }
    }
    const handlePopState = () => {
      if (restoringHistoryRef.current) {
        restoringHistoryRef.current = false
        return
      }
      if (!window.confirm(t('admin.resourcesAi.infographicForm.unsavedConfirm'))) {
        restoringHistoryRef.current = true
        window.history.forward()
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    window.addEventListener('popstate', handlePopState)
    document.addEventListener('click', handleLinkClick, true)
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      window.removeEventListener('popstate', handlePopState)
      document.removeEventListener('click', handleLinkClick, true)
    }
  }, [dirty, t])

  const existingImageUrl = useMemo(
    () =>
      imagePath
        ? supabase.storage.from(BUCKET).getPublicUrl(imagePath).data.publicUrl
        : null,
    [imagePath],
  )
  const pendingImageUrl = useObjectUrl(pendingImage?.file)
  const previewUrl = pendingImageUrl || (!removeImage ? existingImageUrl : null)
  const previewMetadata = pendingImage?.metadata || (!removeImage ? imageMetadata : null)
  const existingThumbnailUrl = useMemo(
    () =>
      thumbnailPath
        ? supabase.storage.from(BUCKET).getPublicUrl(thumbnailPath).data.publicUrl
        : null,
    [thumbnailPath],
  )
  const pendingThumbnailUrl = useObjectUrl(pendingThumbnail?.file)
  const thumbnailPreviewUrl =
    pendingThumbnailUrl || (!removeThumbnail ? existingThumbnailUrl : null) || previewUrl

  const updateField = (name, value) => {
    setForm((current) => ({ ...current, [name]: value }))
    setDirty(true)
    setNotice(null)
  }

  const handleImageSelection = async (event) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    if (!IMAGE_TYPES.includes(file.type)) {
      setNotice({ type: 'error', text: t('admin.resourcesAi.infographicForm.image.invalidType') })
      return
    }

    const dimensions = await readImageDimensions(file)
    setPendingImage({
      file,
      metadata: {
        originalName: file.name,
        mimeType: file.type,
        sizeBytes: file.size,
        ...dimensions,
      },
    })
    setRemoveImage(false)
    setDirty(true)
    setNotice(null)
  }

  const handleRemoveImage = () => {
    setPendingImage(null)
    setRemoveImage(Boolean(imagePath))
    setDirty(true)
    setNotice(null)
  }

  const handleThumbnailSelection = async (event) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    if (!isAllowedThumbnailMime(file.type)) {
      setThumbnailFeedback({
        type: 'error',
        text: t('admin.resourcesAi.infographicForm.thumbnail.errors.unsupportedType'),
      })
      return
    }
    if (!isThumbnailSizeAllowed(file.size)) {
      setThumbnailFeedback({
        type: 'error',
        text: t('admin.resourcesAi.infographicForm.thumbnail.errors.tooLarge'),
      })
      return
    }

    const dimensions = await readImageDimensions(file)
    const validation = validateInfographicThumbnail({
      mimeType: file.type,
      sizeBytes: file.size,
      ...dimensions,
    })
    if (!validation.valid) {
      setThumbnailFeedback({
        type: 'error',
        text: t(`admin.resourcesAi.infographicForm.thumbnail.errors.${validation.error}`),
      })
      return
    }

    setPendingThumbnail({
      file,
      metadata: {
        originalName: file.name,
        mimeType: file.type,
        sizeBytes: file.size,
        ...dimensions,
      },
    })
    setRemoveThumbnail(false)
    setDirty(true)
    setThumbnailFeedback({
      type: 'status',
      text: validation.warning
        ? t('admin.resourcesAi.infographicForm.thumbnail.performanceWarning')
        : t('admin.resourcesAi.infographicForm.thumbnail.ready'),
    })
    setNotice(null)
  }

  const handleCancelThumbnailSelection = () => {
    setPendingThumbnail(null)
    setThumbnailFeedback(null)
    setDirty(true)
  }

  const handleRemoveThumbnail = () => {
    setPendingThumbnail(null)
    setRemoveThumbnail(true)
    setThumbnailFeedback(null)
    setDirty(true)
    setNotice(null)
  }

  const handleUndoThumbnailRemoval = () => {
    setRemoveThumbnail(false)
    setThumbnailFeedback(null)
    setDirty(true)
  }

  const handleJsonFileSelection = async (event) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    if (!file.name.toLowerCase().endsWith('.json')) {
      setJsonFileName('')
      setJsonReport({ success: false, error: 'invalidFileType' })
      return
    }

    setReadingJsonFile(true)
    setJsonReport(null)
    try {
      setJsonInput(await file.text())
      setJsonFileName(file.name)
    } catch {
      setJsonFileName('')
      setJsonReport({ success: false, error: 'fileReadError' })
    } finally {
      setReadingJsonFile(false)
    }
  }

  const handleJsonImport = () => {
    const result = importInfographicJson(jsonInput, form)

    if (!result.success || result.imported.length === 0) {
      setJsonReport(result)
      return
    }

    if (
      hasInfographicMetadata(form) &&
      !window.confirm(t('admin.resourcesAi.infographicForm.jsonImport.replaceConfirm'))
    ) {
      setJsonReport({ ...result, cancelled: true, applied: false })
      return
    }

    setForm(result.nextForm)
    setDirty(true)
    setNotice(null)
    setJsonReport({ ...result, applied: true })
  }

  const handleCancel = () => {
    if (dirty && !window.confirm(t('admin.resourcesAi.infographicForm.unsavedConfirm'))) return
    setDirty(false)
    navigate(LIST_PATH)
  }

  const handleSave = async (intent) => {
    if (saving) return
    if (
      intent === 'unpublish' &&
      !window.confirm(t('admin.resourcesAi.infographicForm.unpublishConfirm'))
    ) {
      return
    }

    setSaving(true)
    setSavePhase('saving')
    setNotice(null)
    let savedId = resourceId
    let createdNow = false
    let uploadedImagePath = null
    let uploadedThumbnailPath = null
    let databaseUpdated = false
    let activePhase = 'saving'

    try {
      const editorial = toDatabasePayload(form)
      let nextStatus = status
      let nextPublishedAt = publishedAt

      if (intent === 'publish') {
        nextStatus = 'published'
        if (status !== 'published') nextPublishedAt = new Date().toISOString()
      } else if (intent === 'unpublish') {
        nextStatus = 'draft'
      } else if (!savedId) {
        nextStatus = 'draft'
      }

      if (!savedId) {
        const { data, error } = await supabase
          .from('infographics')
          .insert({ ...editorial, status: 'draft', published_at: null })
          .select('id')
          .single()
        if (error) throw error
        savedId = data.id
        createdNow = true
        setResourceId(savedId)
      }

      let nextImagePath = removeImage ? null : imagePath
      let nextImageMetadata = removeImage ? null : imageMetadata

      if (pendingImage) {
        activePhase = 'uploading'
        setSavePhase('uploading')
        const extension = extensionForFile(pendingImage.file)
        uploadedImagePath = `${savedId}/${crypto.randomUUID()}.${extension}`
        const { error: uploadError } = await supabase.storage
          .from(BUCKET)
          .upload(uploadedImagePath, pendingImage.file, {
            contentType: pendingImage.file.type,
            upsert: false,
          })
        if (uploadError) throw uploadError
        nextImagePath = uploadedImagePath
        nextImageMetadata = pendingImage.metadata
      }

      let nextThumbnailPath = removeThumbnail ? null : thumbnailPath

      if (pendingThumbnail) {
        activePhase = 'thumbnailUploading'
        setSavePhase('uploading')
        uploadedThumbnailPath = buildInfographicThumbnailPath(
          savedId,
          crypto.randomUUID(),
          pendingThumbnail.file.type,
        )
        const { error: thumbnailUploadError } = await supabase.storage
          .from(BUCKET)
          .upload(uploadedThumbnailPath, pendingThumbnail.file, {
            contentType: pendingThumbnail.file.type,
            upsert: false,
          })
        if (thumbnailUploadError) throw thumbnailUploadError
        nextThumbnailPath = uploadedThumbnailPath
      }

      activePhase = 'saving'
      setSavePhase('saving')
      const { error: updateError } = await supabase
        .from('infographics')
        .update({
          ...editorial,
          status: nextStatus,
          published_at: nextPublishedAt,
          image_path: nextImagePath,
          image_metadata: nextImageMetadata,
          thumbnail_path: nextThumbnailPath,
        })
        .eq('id', savedId)
      if (updateError) throw updateError
      databaseUpdated = true

      let cleanupWarning = false
      if (imagePath && imagePath !== nextImagePath) {
        const { error: removeError } = await supabase.storage.from(BUCKET).remove([imagePath])
        cleanupWarning = Boolean(removeError)
        if (removeError) console.warn('Unable to remove previous infographic image:', removeError.message)
      }
      if (thumbnailPath && thumbnailPath !== nextThumbnailPath) {
        if (isInfographicThumbnailPathForResource(thumbnailPath, savedId)) {
          const { error: removeError } = await supabase.storage.from(BUCKET).remove([thumbnailPath])
          cleanupWarning = cleanupWarning || Boolean(removeError)
          if (removeError) console.warn('Unable to remove previous infographic thumbnail:', removeError.message)
        } else {
          cleanupWarning = true
          console.warn('Previous infographic thumbnail path was outside the resource prefix.')
        }
      }

      setStatus(nextStatus)
      setPublishedAt(nextPublishedAt)
      setImagePath(nextImagePath)
      setImageMetadata(nextImageMetadata)
      setThumbnailPath(nextThumbnailPath)
      setPendingImage(null)
      setRemoveImage(false)
      setPendingThumbnail(null)
      setRemoveThumbnail(false)
      setThumbnailFeedback(
        uploadedThumbnailPath
          ? { type: 'status', text: t('admin.resourcesAi.infographicForm.thumbnail.uploadSuccess') }
          : null,
      )
      setDirty(false)
      setNotice({
        type: cleanupWarning ? 'warning' : 'success',
        text: cleanupWarning
          ? t('admin.resourcesAi.infographicForm.messages.savedCleanupWarning')
          : t(`admin.resourcesAi.infographicForm.messages.${intent}`),
      })

      if (createdNow) {
        localCreationRef.current = savedId
        navigate(`${LIST_PATH}/${savedId}/modifier`, { replace: true })
      }
    } catch (saveError) {
      console.error('Unable to save infographic:', saveError.message)
      if (!databaseUpdated) {
        const uploadedAssets = [uploadedImagePath, uploadedThumbnailPath].filter(Boolean)
        if (uploadedAssets.length > 0) {
          const { error: cleanupError } = await supabase.storage.from(BUCKET).remove(uploadedAssets)
          if (cleanupError) console.warn('Unable to clean up uploaded assets:', cleanupError.message)
        }
      }
      if (createdNow && savedId) {
        localCreationRef.current = savedId
        navigate(`${LIST_PATH}/${savedId}/modifier`, { replace: true })
      }
      setNotice({
        type: 'error',
        text:
          activePhase === 'thumbnailUploading'
            ? t('admin.resourcesAi.infographicForm.thumbnail.uploadError')
            : activePhase === 'uploading'
              ? t('admin.resourcesAi.infographicForm.messages.uploadError')
            : t('admin.resourcesAi.infographicForm.messages.saveError'),
      })
    } finally {
      setSaving(false)
      setSavePhase(null)
    }
  }

  if (loading) return <FormLoading t={t} />
  if (loadState !== 'ready') return <LoadFailure state={loadState} t={t} />

  const isEditing = Boolean(resourceId)
  const formTitle = isEditing
    ? t('admin.resourcesAi.infographicForm.editTitle')
    : t('admin.resourcesAi.infographicForm.addTitle')

  return (
    <section className="min-h-[90vh] bg-warm-gray pt-24 pb-16 md:pt-28 md:pb-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Link
          to={LIST_PATH}
          className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-navy/65 hover:text-accent-deep"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          {t('admin.resourcesAi.infographicForm.back')}
        </Link>

        <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-accent">
              {t('admin.resourcesAi.group')}
            </p>
            <h1 className="font-heading text-2xl font-bold tracking-tight text-navy md:text-3xl">
              {formTitle}
            </h1>
          </div>
          {isEditing && (
            <span className="w-fit rounded-full border border-navy/10 bg-white px-3 py-1 text-xs font-medium text-navy/65">
              {t(`admin.resourcesAi.infographics.status.${status}`)}
            </span>
          )}
        </div>

        {notice && <Notice notice={notice} />}

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.75fr)_minmax(280px,0.75fr)] lg:items-start">
          <div className="min-w-0 space-y-5">
            <FormSection
              number="1"
              title={t('admin.resourcesAi.infographicForm.sections.image')}
            >
              <ImagePicker
                metadata={previewMetadata}
                onChange={handleImageSelection}
                onRemove={handleRemoveImage}
                previewUrl={previewUrl}
                t={t}
              />
              <ImagePreview
                className="mt-5 lg:hidden"
                metadata={previewMetadata}
                previewUrl={previewUrl}
                title={form.title}
                t={t}
              />
            </FormSection>

            <FormSection
              number="2"
              title={t('admin.resourcesAi.infographicForm.sections.thumbnail')}
            >
              <InfographicThumbnailField
                feedback={thumbnailFeedback}
                metadata={pendingThumbnail?.metadata}
                onCancelSelection={handleCancelThumbnailSelection}
                onChange={handleThumbnailSelection}
                onRemove={handleRemoveThumbnail}
                onUndoRemove={handleUndoThumbnailRemoval}
                pending={Boolean(pendingThumbnail)}
                previewUrl={thumbnailPreviewUrl}
                removalPending={removeThumbnail}
                savedThumbnail={Boolean(thumbnailPath)}
                t={t}
              />
            </FormSection>

            <FormSection
              number="3"
              title={t('admin.resourcesAi.infographicForm.sections.jsonImport')}
            >
              <JsonImportSection
                fileName={jsonFileName}
                input={jsonInput}
                onFileChange={handleJsonFileSelection}
                onInputChange={(value) => {
                  setJsonInput(value)
                  setJsonFileName('')
                  setJsonReport(null)
                }}
                onImport={handleJsonImport}
                readingFile={readingJsonFile}
                report={jsonReport}
                t={t}
              />
            </FormSection>

            <FormSection
              number="4"
              title={t('admin.resourcesAi.infographicForm.sections.general')}
            >
              <div className="grid gap-4">
                <Field
                  label={t('admin.resourcesAi.infographicForm.fields.title')}
                  value={form.title}
                  onChange={(value) => updateField('title', value)}
                />
                <Field
                  label={t('admin.resourcesAi.infographicForm.fields.subtitle')}
                  value={form.subtitle}
                  onChange={(value) => updateField('subtitle', value)}
                />
                <Field
                  as="textarea"
                  label={t('admin.resourcesAi.infographicForm.fields.summary')}
                  value={form.summary}
                  onChange={(value) => updateField('summary', value)}
                />
                <Field
                  as="textarea"
                  rows={5}
                  label={t('admin.resourcesAi.infographicForm.fields.introduction')}
                  value={form.introduction}
                  onChange={(value) => updateField('introduction', value)}
                />
                <Field
                  as="textarea"
                  label={t('admin.resourcesAi.infographicForm.fields.imageAlt')}
                  value={form.image_alt}
                  onChange={(value) => updateField('image_alt', value)}
                />
              </div>
            </FormSection>

            <FormSection
              number="5"
              title={t('admin.resourcesAi.infographicForm.sections.classification')}
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label={t('admin.resourcesAi.infographicForm.fields.theme')}
                  value={form.theme}
                  onChange={(value) => updateField('theme', value)}
                />
                <SelectField
                  label={t('admin.resourcesAi.infographicForm.fields.level')}
                  value={form.level}
                  onChange={(value) => updateField('level', value)}
                  options={[
                    ['', t('admin.resourcesAi.infographicForm.levels.empty')],
                    ['beginner', t('admin.resourcesAi.infographicForm.levels.beginner')],
                    ['intermediate', t('admin.resourcesAi.infographicForm.levels.intermediate')],
                    ['advanced', t('admin.resourcesAi.infographicForm.levels.advanced')],
                  ]}
                />
                <Field
                  min="0"
                  step="1"
                  type="number"
                  label={t('admin.resourcesAi.infographicForm.fields.readingTime')}
                  value={form.reading_time_minutes}
                  onChange={(value) => updateField('reading_time_minutes', value)}
                />
              </div>
            </FormSection>

            <FormSection
              number="6"
              title={t('admin.resourcesAi.infographicForm.sections.series')}
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label={t('admin.resourcesAi.infographicForm.fields.seriesName')}
                  value={form.series_name}
                  onChange={(value) => updateField('series_name', value)}
                />
                <Field
                  min="0"
                  step="1"
                  type="number"
                  label={t('admin.resourcesAi.infographicForm.fields.episodeNumber')}
                  value={form.episode_number}
                  onChange={(value) => updateField('episode_number', value)}
                />
              </div>
            </FormSection>

            <RepeatableSection
              number="7"
              title={t('admin.resourcesAi.infographicForm.sections.keyPoints')}
              items={form.key_points}
              emptyItem={{ title: '', description: '' }}
              addLabel={t('admin.resourcesAi.infographicForm.keyPoints.add')}
              fields={[
                ['title', t('admin.resourcesAi.infographicForm.fields.pointTitle')],
                ['description', t('admin.resourcesAi.infographicForm.fields.pointDescription')],
              ]}
              onChange={(items) => updateField('key_points', items)}
              t={t}
            />

            <FormSection
              number="8"
              title={t('admin.resourcesAi.infographicForm.sections.takeaway')}
            >
              <Field
                as="textarea"
                rows={4}
                label={t('admin.resourcesAi.infographicForm.fields.takeaway')}
                value={form.takeaway}
                onChange={(value) => updateField('takeaway', value)}
              />
            </FormSection>

            <RepeatableSection
              number="9"
              title={t('admin.resourcesAi.infographicForm.sections.sources')}
              items={form.sources}
              emptyItem={{ title: '', url: '' }}
              addLabel={t('admin.resourcesAi.infographicForm.sources.add')}
              fields={[
                ['title', t('admin.resourcesAi.infographicForm.fields.sourceTitle')],
                ['url', t('admin.resourcesAi.infographicForm.fields.sourceUrl')],
              ]}
              onChange={(items) => updateField('sources', items)}
              t={t}
            />

            <FormSection
              number="10"
              title={t('admin.resourcesAi.infographicForm.sections.keywords')}
            >
              <Field
                label={t('admin.resourcesAi.infographicForm.fields.keywords')}
                hint={t('admin.resourcesAi.infographicForm.fields.keywordsHint')}
                value={form.keywords}
                onChange={(value) => updateField('keywords', value)}
              />
            </FormSection>

            <FormSection
              number="11"
              title={t('admin.resourcesAi.infographicForm.sections.actions')}
            >
              <ActionBar
                isEditing={isEditing}
                onCancel={handleCancel}
                onSave={handleSave}
                resourceId={resourceId}
                savePhase={savePhase}
                saving={saving}
                status={status}
                t={t}
              />
            </FormSection>
          </div>

          <ImagePreview
            className="hidden lg:sticky lg:top-24 lg:block"
            metadata={previewMetadata}
            previewUrl={previewUrl}
            title={form.title}
            t={t}
          />
        </div>
      </div>
    </section>
  )
}

function FormSection({ children, number, title }) {
  return (
    <section className="rounded-2xl border border-navy/[0.08] bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-5 flex items-center gap-3">
        <span className="tnum flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-lavender/55 text-xs font-bold text-navy">
          {number}
        </span>
        <h2 className="font-heading text-lg font-bold tracking-tight text-navy">{title}</h2>
      </div>
      {children}
    </section>
  )
}

function JsonImportSection({
  fileName,
  input,
  onFileChange,
  onImport,
  onInputChange,
  readingFile,
  report,
  t,
}) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted">
        {t('admin.resourcesAi.infographicForm.jsonImport.help')}
      </p>

      <div className="flex flex-col gap-3 rounded-xl border border-navy/10 bg-surface/60 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-bold text-navy/70">
            {t('admin.resourcesAi.infographicForm.jsonImport.fileLabel')}
          </p>
          <p className="mt-1 truncate text-xs text-muted">
            {fileName || t('admin.resourcesAi.infographicForm.jsonImport.noFile')}
          </p>
        </div>
        <label className="inline-flex w-full shrink-0 cursor-pointer items-center justify-center gap-2 rounded-lg border border-navy/15 bg-white px-4 py-2.5 text-sm font-semibold text-navy hover:border-accent hover:text-accent-deep sm:w-auto">
          {readingFile ? (
            <LoaderCircle className="animate-spin" size={15} aria-hidden="true" />
          ) : (
            <Upload size={15} aria-hidden="true" />
          )}
          {readingFile
            ? t('admin.resourcesAi.infographicForm.jsonImport.readingFile')
            : t('admin.resourcesAi.infographicForm.jsonImport.chooseFile')}
          <input
            type="file"
            accept=".json,application/json"
            disabled={readingFile}
            onChange={onFileChange}
            className="sr-only"
          />
        </label>
      </div>

      <Field
        as="textarea"
        rows={8}
        label={t('admin.resourcesAi.infographicForm.jsonImport.pasteLabel')}
        placeholder={t('admin.resourcesAi.infographicForm.jsonImport.placeholder')}
        value={input}
        onChange={onInputChange}
      />

      <button
        type="button"
        disabled={readingFile}
        onClick={onImport}
        className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-white hover:bg-accent-deep disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
      >
        {t('admin.resourcesAi.infographicForm.jsonImport.analyze')}
      </button>

      {report && <JsonImportReport report={report} t={t} />}
    </div>
  )
}

function JsonImportReport({ report, t }) {
  const successful = report.success && !report.cancelled
  const hasImportedFields = report.imported?.length > 0

  return (
    <div
      role={report.success ? 'status' : 'alert'}
      className={`rounded-xl border p-4 text-sm ${
        successful
          ? 'border-steel/40 bg-steel/10 text-navy'
          : 'border-accent/35 bg-accent/10 text-navy'
      }`}
    >
      <div className="flex items-start gap-3">
        {successful ? (
          <CheckCircle2 className="mt-0.5 shrink-0 text-steel" size={18} aria-hidden="true" />
        ) : (
          <AlertTriangle className="mt-0.5 shrink-0 text-accent" size={18} aria-hidden="true" />
        )}
        <div className="min-w-0 flex-1">
          <p className="font-semibold">
            {report.success
              ? report.cancelled
                ? t('admin.resourcesAi.infographicForm.jsonImport.result.cancelled')
                : hasImportedFields
                  ? t('admin.resourcesAi.infographicForm.jsonImport.result.success')
                  : t('admin.resourcesAi.infographicForm.jsonImport.result.empty')
              : t('admin.resourcesAi.infographicForm.jsonImport.result.failure')}
          </p>

          {!report.success && (
            <p className="mt-1 text-navy/75">
              {t(`admin.resourcesAi.infographicForm.jsonImport.errors.${report.error}`)}
            </p>
          )}

          {hasImportedFields && (
            <div className="mt-3">
              <p className="text-xs font-bold uppercase tracking-wide text-navy/55">
                {t(
                  `admin.resourcesAi.infographicForm.jsonImport.result.${
                    report.applied ? 'importedFields' : 'detectedFields'
                  }`,
                )}
              </p>
              <p className="mt-1 text-navy/80">
                {report.imported
                  .map((field) =>
                    t(
                      `admin.resourcesAi.infographicForm.${
                        IMPORT_FIELD_TRANSLATION_KEYS[field]
                      }`,
                    ),
                  )
                  .join(', ')}
              </p>
            </div>
          )}

          {report.warnings?.length > 0 && (
            <div className="mt-3">
              <p className="text-xs font-bold uppercase tracking-wide text-navy/55">
                {t('admin.resourcesAi.infographicForm.jsonImport.result.warnings')}
              </p>
              <ul className="mt-1 list-disc space-y-1 pl-5 text-navy/80">
                {report.warnings.map((warning, index) => (
                  <li key={`${warning.path}-${warning.code}-${index}`}>
                    <code className="text-xs">{warning.path}</code>
                    {' — '}
                    {t(
                      `admin.resourcesAi.infographicForm.jsonImport.warnings.${warning.code}`,
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {report.unknown?.length > 0 && (
            <div className="mt-3">
              <p className="text-xs font-bold uppercase tracking-wide text-navy/55">
                {t('admin.resourcesAi.infographicForm.jsonImport.result.unknown')}
              </p>
              <p className="mt-1 break-words text-navy/80">
                {report.unknown.map((property) => (
                  <code key={property} className="mr-2 text-xs">
                    {property}
                  </code>
                ))}
              </p>
            </div>
          )}

          <p className="mt-3 text-xs font-medium text-navy/65">
            {report.success
              ? t('admin.resourcesAi.infographicForm.jsonImport.result.notSaved')
              : t('admin.resourcesAi.infographicForm.jsonImport.result.unchanged')}
          </p>
        </div>
      </div>
    </div>
  )
}

function Field({ as = 'input', hint, label, onChange, rows = 3, type = 'text', value, ...props }) {
  const Component = as
  return (
    <label className="block min-w-0">
      <span className="mb-1.5 block text-xs font-bold text-navy/70">{label}</span>
      <Component
        {...props}
        type={as === 'input' ? type : undefined}
        rows={as === 'textarea' ? rows : undefined}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-lg border border-navy/15 bg-white px-3.5 py-2.5 text-sm text-navy placeholder:text-muted focus:border-accent focus:ring-2 focus:ring-accent/20"
      />
      {hint && <span className="mt-1.5 block text-xs text-muted">{hint}</span>}
    </label>
  )
}

function SelectField({ label, onChange, options, value }) {
  return (
    <label className="block min-w-0">
      <span className="mb-1.5 block text-xs font-bold text-navy/70">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-lg border border-navy/15 bg-white px-3.5 py-2.5 text-sm text-navy focus:border-accent focus:ring-2 focus:ring-accent/20"
      >
        {options.map(([optionValue, optionLabel]) => (
          <option key={optionValue} value={optionValue}>
            {optionLabel}
          </option>
        ))}
      </select>
    </label>
  )
}

function RepeatableSection({
  addLabel,
  emptyItem,
  fields,
  items,
  number,
  onChange,
  t,
  title,
}) {
  const updateItem = (index, key, value) =>
    onChange(items.map((item, itemIndex) => (itemIndex === index ? { ...item, [key]: value } : item)))
  const moveItem = (index, direction) => {
    const destination = index + direction
    if (destination < 0 || destination >= items.length) return
    const reordered = [...items]
    ;[reordered[index], reordered[destination]] = [reordered[destination], reordered[index]]
    onChange(reordered)
  }

  return (
    <FormSection number={number} title={title}>
      <div className="space-y-3">
        {items.map((item, index) => (
          <div
            key={index}
            className="rounded-xl border border-navy/10 bg-surface/60 p-4"
          >
            <div className="mb-3 flex items-center justify-between gap-3">
              <span className="tnum text-xs font-bold text-navy/55">#{index + 1}</span>
              <div className="flex items-center gap-1">
                <IconButton
                  disabled={index === 0}
                  label={t('admin.resourcesAi.infographicForm.list.moveUp')}
                  onClick={() => moveItem(index, -1)}
                >
                  <ArrowUp size={15} />
                </IconButton>
                <IconButton
                  disabled={index === items.length - 1}
                  label={t('admin.resourcesAi.infographicForm.list.moveDown')}
                  onClick={() => moveItem(index, 1)}
                >
                  <ArrowDown size={15} />
                </IconButton>
                <IconButton
                  label={t('admin.resourcesAi.infographicForm.list.remove')}
                  onClick={() => onChange(items.filter((_, itemIndex) => itemIndex !== index))}
                >
                  <Trash2 size={15} />
                </IconButton>
              </div>
            </div>
            <div className="grid gap-3">
              {fields.map(([key, label]) => (
                <Field
                  key={key}
                  as={key === 'description' ? 'textarea' : 'input'}
                  label={label}
                  value={item[key] || ''}
                  onChange={(value) => updateItem(index, key, value)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => onChange([...items, { ...emptyItem }])}
        className="mt-4 inline-flex items-center gap-2 rounded-lg border border-navy/15 bg-white px-4 py-2 text-sm font-semibold text-navy hover:border-accent hover:text-accent-deep"
      >
        <Plus size={15} aria-hidden="true" />
        {addLabel}
      </button>
    </FormSection>
  )
}

function IconButton({ children, disabled, label, onClick }) {
  return (
    <button
      type="button"
      disabled={disabled}
      aria-label={label}
      title={label}
      onClick={onClick}
      className="flex h-8 w-8 items-center justify-center rounded-lg border border-navy/10 bg-white text-navy/65 hover:border-accent hover:text-accent-deep disabled:cursor-not-allowed disabled:opacity-35"
    >
      {children}
    </button>
  )
}

function ImagePicker({ metadata, onChange, onRemove, previewUrl, t }) {
  return (
    <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
      <div>
        <p className="text-sm text-muted">{t('admin.resourcesAi.infographicForm.image.help')}</p>
        {metadata && (
          <dl className="mt-3 grid gap-1 text-xs text-navy/65">
            {metadata.originalName && <MetadataRow label={t('admin.resourcesAi.infographicForm.image.name')} value={metadata.originalName} />}
            {metadata.mimeType && <MetadataRow label={t('admin.resourcesAi.infographicForm.image.type')} value={metadata.mimeType} />}
            {metadata.sizeBytes != null && <MetadataRow label={t('admin.resourcesAi.infographicForm.image.size')} value={formatBytes(metadata.sizeBytes)} />}
            {metadata.width && metadata.height && <MetadataRow label={t('admin.resourcesAi.infographicForm.image.dimensions')} value={`${metadata.width} × ${metadata.height} px`} />}
          </dl>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-deep">
          <Upload size={15} aria-hidden="true" />
          {previewUrl
            ? t('admin.resourcesAi.infographicForm.image.replace')
            : t('admin.resourcesAi.infographicForm.image.choose')}
          <input
            type="file"
            accept=".png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp"
            onChange={onChange}
            className="sr-only"
          />
        </label>
        {previewUrl && (
          <button
            type="button"
            onClick={onRemove}
            className="inline-flex items-center gap-2 rounded-lg border border-navy/15 bg-white px-4 py-2 text-sm font-semibold text-navy hover:border-accent hover:text-accent-deep"
          >
            <Trash2 size={15} aria-hidden="true" />
            {t('admin.resourcesAi.infographicForm.image.remove')}
          </button>
        )}
      </div>
    </div>
  )
}

function MetadataRow({ label, value }) {
  return (
    <div className="flex min-w-0 gap-2">
      <dt className="shrink-0 font-semibold">{label}:</dt>
      <dd className="truncate">{value}</dd>
    </div>
  )
}

function ImagePreview({ className = '', metadata, previewUrl, t, title }) {
  return (
    <aside className={`${className} rounded-2xl border border-navy/[0.08] bg-white p-5 shadow-sm`}>
      <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.15em] text-navy/55">
        {t('admin.resourcesAi.infographicForm.preview.title')}
      </p>
      <div className="flex min-h-72 items-center justify-center overflow-hidden rounded-xl border border-navy/10 bg-surface">
        {previewUrl ? (
          <img
            src={previewUrl}
            alt={title || t('admin.resourcesAi.infographicForm.preview.alt')}
            className="max-h-[620px] w-full object-contain"
          />
        ) : (
          <div className="px-5 text-center text-muted">
            <ImageIcon className="mx-auto mb-3 text-steel" size={30} strokeWidth={1.5} />
            <p className="text-sm">{t('admin.resourcesAi.infographicForm.preview.empty')}</p>
          </div>
        )}
      </div>
      {metadata?.originalName && (
        <p className="mt-3 truncate text-xs text-muted">{metadata.originalName}</p>
      )}
    </aside>
  )
}

function ActionBar({
  isEditing,
  onCancel,
  onSave,
  resourceId,
  savePhase,
  saving,
  status,
  t,
}) {
  const saveLabel = !isEditing
    ? t('admin.resourcesAi.infographicForm.actions.saveDraft')
    : t('admin.resourcesAi.infographicForm.actions.saveChanges')
  const busyLabel =
    savePhase === 'uploading'
      ? t('admin.resourcesAi.infographicForm.actions.uploading')
      : t('admin.resourcesAi.infographicForm.actions.saving')

  return (
    <>
      <div className="mb-4 flex gap-3 rounded-xl border border-steel/30 bg-steel/10 p-4 text-sm text-navy/75">
        <AlertTriangle className="mt-0.5 shrink-0 text-steel" size={18} aria-hidden="true" />
        <p>{t('admin.resourcesAi.infographicForm.incompleteWarning')}</p>
      </div>
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:flex-wrap sm:justify-end">
        {status === 'published' && resourceId && (
          <Link
            to={`/ressources-ia/infographies/${resourceId}`}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-navy/15 bg-white px-5 py-2.5 text-sm font-semibold text-navy hover:border-accent hover:text-accent-deep"
          >
            <Eye size={15} aria-hidden="true" />
            {t('admin.resourcesAi.infographicForm.actions.view')}
          </Link>
        )}
        <button
          type="button"
          disabled={saving}
          onClick={onCancel}
          className="rounded-lg border border-navy/15 bg-white px-5 py-2.5 text-sm font-semibold text-navy hover:border-navy/30 disabled:opacity-50"
        >
          {t('admin.resourcesAi.infographicForm.actions.cancel')}
        </button>
        <button
          type="button"
          disabled={saving}
          onClick={() => onSave('save')}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-navy/15 bg-white px-5 py-2.5 text-sm font-semibold text-navy hover:border-accent hover:text-accent-deep disabled:opacity-50"
        >
          {saving && <LoaderCircle className="animate-spin" size={15} aria-hidden="true" />}
          {saving ? busyLabel : saveLabel}
        </button>
        {status === 'published' ? (
          <button
            type="button"
            disabled={saving}
            onClick={() => onSave('unpublish')}
            className="rounded-lg bg-navy px-5 py-2.5 text-sm font-semibold text-white hover:bg-navy-deep disabled:opacity-50"
          >
            {t('admin.resourcesAi.infographicForm.actions.unpublish')}
          </button>
        ) : (
          <button
            type="button"
            disabled={saving}
            onClick={() => onSave('publish')}
            className="rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-white hover:bg-accent-deep disabled:opacity-50"
          >
            {t('admin.resourcesAi.infographicForm.actions.publish')}
          </button>
        )}
      </div>
    </>
  )
}

function Notice({ notice }) {
  const success = notice.type === 'success'
  const warning = notice.type === 'warning'
  return (
    <div
      role={success ? 'status' : 'alert'}
      className={`mb-6 flex items-start gap-3 rounded-xl border p-4 text-sm ${
        success
          ? 'border-steel/40 bg-steel/10 text-navy'
          : warning
            ? 'border-accent/35 bg-accent/10 text-navy'
            : 'border-accent/35 bg-accent/10 text-navy'
      }`}
    >
      {success ? (
        <CheckCircle2 className="mt-0.5 shrink-0" size={18} aria-hidden="true" />
      ) : (
        <AlertTriangle className="mt-0.5 shrink-0" size={18} aria-hidden="true" />
      )}
      <p>{notice.text}</p>
    </div>
  )
}

function FormLoading({ t }) {
  return (
    <section className="min-h-[75vh] bg-warm-gray pt-32 px-4">
      <div className="mx-auto flex max-w-xl items-center justify-center gap-3 rounded-2xl border border-navy/[0.08] bg-white p-10 text-sm text-muted">
        <LoaderCircle className="animate-spin text-accent" size={20} aria-hidden="true" />
        {t('admin.resourcesAi.infographicForm.loading')}
      </div>
    </section>
  )
}

function LoadFailure({ state, t }) {
  return (
    <section className="min-h-[75vh] bg-warm-gray px-4 pt-32">
      <div className="mx-auto max-w-xl rounded-2xl border border-accent/30 bg-white p-8 text-center shadow-sm">
        <AlertTriangle className="mx-auto mb-4 text-accent" size={28} aria-hidden="true" />
        <h1 className="font-heading text-xl font-bold text-navy">
          {t(`admin.resourcesAi.infographicForm.${state}.title`)}
        </h1>
        <p className="mt-2 text-sm text-muted">
          {t(`admin.resourcesAi.infographicForm.${state}.description`)}
        </p>
        <Link
          to={LIST_PATH}
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-white"
        >
          <ArrowLeft size={15} aria-hidden="true" />
          {t('admin.resourcesAi.infographicForm.back')}
        </Link>
      </div>
    </section>
  )
}

function toFormState(data) {
  return {
    ...EMPTY_FORM,
    title: data.title || '',
    subtitle: data.subtitle || '',
    summary: data.summary || '',
    introduction: data.introduction || '',
    image_alt: data.image_alt || '',
    theme: data.theme || '',
    level: ['beginner', 'intermediate', 'advanced'].includes(data.level) ? data.level : '',
    reading_time_minutes: data.reading_time_minutes?.toString() || '',
    series_name: data.series_name || '',
    episode_number: data.episode_number?.toString() || '',
    key_points: Array.isArray(data.key_points) ? data.key_points : [],
    takeaway: data.takeaway || '',
    keywords: Array.isArray(data.keywords) ? data.keywords.join(', ') : '',
    sources: Array.isArray(data.sources) ? data.sources : [],
  }
}

function toDatabasePayload(form) {
  return {
    title: emptyToNull(form.title),
    subtitle: emptyToNull(form.subtitle),
    summary: emptyToNull(form.summary),
    introduction: emptyToNull(form.introduction),
    image_alt: emptyToNull(form.image_alt),
    theme: emptyToNull(form.theme),
    level: emptyToNull(form.level),
    reading_time_minutes: optionalInteger(form.reading_time_minutes),
    series_name: emptyToNull(form.series_name),
    episode_number: optionalInteger(form.episode_number),
    key_points: form.key_points,
    takeaway: emptyToNull(form.takeaway),
    keywords: [...new Set(form.keywords.split(',').map((item) => item.trim()).filter(Boolean))],
    sources: form.sources,
  }
}

function emptyToNull(value) {
  const normalized = value.trim()
  return normalized || null
}

function optionalInteger(value) {
  if (value === '') return null
  const number = Number.parseInt(value, 10)
  return Number.isNaN(number) ? null : number
}

function extensionForFile(file) {
  if (file.type === 'image/png') return 'png'
  if (file.type === 'image/webp') return 'webp'
  return 'jpg'
}

function formatBytes(bytes) {
  if (!Number.isFinite(bytes)) return '—'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function readImageDimensions(file) {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file)
    const image = new Image()
    image.onload = () => {
      resolve({ width: image.naturalWidth, height: image.naturalHeight })
      URL.revokeObjectURL(url)
    }
    image.onerror = () => {
      resolve({})
      URL.revokeObjectURL(url)
    }
    image.src = url
  })
}

function useObjectUrl(file) {
  const url = useMemo(() => (file ? URL.createObjectURL(file) : null), [file])
  useEffect(() => {
    if (!url) return undefined
    return () => URL.revokeObjectURL(url)
  }, [url])
  return url
}
