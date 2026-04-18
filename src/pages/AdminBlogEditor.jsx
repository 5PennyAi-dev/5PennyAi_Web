import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, X, Upload, Eye, EyeOff, Sparkles, PencilLine, Check, Image as ImageIcon, Copy, PenTool, Search, AlertTriangle } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import AdminGuard from '@/components/admin/AdminGuard'
import Button from '@/components/ui/Button'
import ArticleGenerator from '@/components/admin/ArticleGenerator'
import DiagramGenerator from '@/components/admin/DiagramGenerator'
import ImagePromptGenerator from '@/components/admin/ImagePromptGenerator'
import SocialPostsGenerator from '@/components/admin/SocialPostsGenerator'
import { Field, Section, inputClass } from '@/components/admin/editorPrimitives'
import { supabase } from '@/lib/supabase'
import { fetchPostById, upsertPost, isSlugTaken, slugify } from '@/lib/posts'
import { updateTopicStatus } from '@/lib/topics'
import { markdownComponents } from '@/components/blog/markdownComponents'
import Lightbox from '@/components/blog/Lightbox'
import { stripDiagramArtifacts, insertAfterH2Section } from '@/lib/markdown'

const BUCKET = 'blog-images'

const EMPTY_FORM = {
  id: null,
  slug: '',
  status: 'draft',
  title_fr: '',
  title_en: '',
  excerpt_fr: '',
  excerpt_en: '',
  content_fr: '',
  content_en: '',
  cover_image: '',
  tags: [],
  reading_time_minutes: 5,
  meta_title_fr: '',
  meta_description_fr: '',
  meta_title_en: '',
  meta_description_en: '',
  published_at: '',
  linkedin_fr: '',
  linkedin_en: '',
  facebook_fr: '',
  facebook_en: '',
  twitter_fr: '',
  twitter_en: '',
}

function toDatetimeLocal(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function fromDatetimeLocal(value) {
  if (!value) return null
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? null : d.toISOString()
}

export default function AdminBlogEditor() {
  return (
    <AdminGuard>
      <AdminBlogEditorInner />
    </AdminGuard>
  )
}

function AdminBlogEditorInner() {
  const { t } = useTranslation()
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const isEdit = Boolean(id)

  const [form, setForm] = useState(EMPTY_FORM)
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState(null)
  const [slugError, setSlugError] = useState(null)
  const [showPreview, setShowPreview] = useState(false)
  const [previewLang, setPreviewLang] = useState('fr')
  const [authorMode, setAuthorMode] = useState('manual')
  const [showGenerator, setShowGenerator] = useState(false)
  const [imagePromptHint, setImagePromptHint] = useState('')
  const [pendingRegen, setPendingRegen] = useState(null)
  const [imagePromptCopied, setImagePromptCopied] = useState(false)
  const [showDiagramGenerator, setShowDiagramGenerator] = useState(false)
  const [researchUsed, setResearchUsed] = useState(null)
  const [topicId, setTopicId] = useState(null)
  const [seoData, setSeoData] = useState(null)
  const contentFrRef = useRef(null)
  const contentEnRef = useRef(null)

  // Detect navigation from Topic Finder
  const topicFinderState = useRef(location.state)
  useEffect(() => {
    const state = topicFinderState.current
    if (state?.fromTopicFinder) {
      setAuthorMode('ai')
      setShowGenerator(true)
      setSeoData(state.seoData || null)
      setTopicId(state.topicId || null)
      // Clear location state to prevent re-triggering on back/refresh
      window.history.replaceState({}, '')
    }
  }, [])

  useEffect(() => {
    if (!isEdit) {
      setForm({
        ...EMPTY_FORM,
        published_at: toDatetimeLocal(new Date().toISOString()),
      })
      return
    }
    let cancelled = false
    setLoading(true)
    fetchPostById(id)
      .then((data) => {
        if (cancelled || !data) return
        setForm({
          ...EMPTY_FORM,
          ...data,
          tags: data.tags || [],
          reading_time_minutes: data.reading_time_minutes ?? 5,
          published_at: toDatetimeLocal(data.published_at),
        })
      })
      .catch((err) => {
        console.error(err)
        setFeedback({ kind: 'error', message: t('admin.editor.feedback.error') })
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [id, isEdit, t])

  const update = (field) => (value) => setForm((prev) => ({ ...prev, [field]: value }))

  const handleTitleFrBlur = () => {
    if (!form.slug && form.title_fr) {
      update('slug')(slugify(form.title_fr))
    }
  }

  const handleSlugBlur = async () => {
    setSlugError(null)
    if (!form.slug) return
    try {
      const taken = await isSlugTaken(form.slug, form.id)
      if (taken) setSlugError(t('admin.editor.feedback.slugTaken'))
    } catch (err) {
      console.error(err)
    }
  }

  const handleSave = async (nextStatus) => {
    setFeedback(null)
    if (slugError) {
      setFeedback({ kind: 'error', message: slugError })
      return
    }

    setSaving(true)
    try {
      const status = nextStatus || form.status || 'draft'
      const payload = {
        ...form,
        status,
        slug: form.slug || slugify(form.title_fr),
        tags: form.tags,
        reading_time_minutes: Number(form.reading_time_minutes) || null,
        published_at:
          status === 'published'
            ? fromDatetimeLocal(form.published_at) || new Date().toISOString()
            : fromDatetimeLocal(form.published_at),
      }

      if (!payload.id) delete payload.id
      delete payload.created_at
      delete payload.updated_at

      const saved = await upsertPost(payload)
      setForm((prev) => ({
        ...prev,
        ...saved,
        tags: saved.tags || [],
        published_at: toDatetimeLocal(saved.published_at),
      }))

      // Link article to topic if coming from Topic Finder
      if (topicId && saved.id) {
        try {
          await updateTopicStatus(topicId, 'written', saved.id)
        } catch (err) {
          console.error('Failed to link topic to post:', err)
        }
      }

      setFeedback({
        kind: 'success',
        message:
          status === 'published'
            ? t('admin.editor.feedback.published')
            : t('admin.editor.feedback.saved'),
      })
      if (!isEdit && saved.id) {
        navigate(`/admin/blog/edit/${saved.id}`, { replace: true })
      }
    } catch (err) {
      console.error(err)
      setFeedback({ kind: 'error', message: err.message || t('admin.editor.feedback.error') })
    } finally {
      setSaving(false)
    }
  }

  const applyGenerated = (data) => {
    setForm((prev) => ({
      ...prev,
      slug: prev.slug || slugify(data.slug || data.title_fr || ''),
      title_fr: data.title_fr || '',
      title_en: data.title_en || '',
      excerpt_fr: data.excerpt_fr || '',
      excerpt_en: data.excerpt_en || '',
      content_fr: data.content_fr || '',
      content_en: data.content_en || '',
      tags: Array.isArray(data.tags) ? data.tags : [],
      reading_time_minutes: data.reading_time_minutes || 5,
      meta_title_fr: data.meta_title_fr || '',
      meta_title_en: data.meta_title_en || '',
      meta_description_fr: data.meta_description_fr || '',
      meta_description_en: data.meta_description_en || '',
      status: 'draft',
      published_at: prev.published_at || toDatetimeLocal(new Date().toISOString()),
    }))
    setImagePromptHint(data.cover_image_prompt || '')
  }

  const replaceGenerated = (data) => {
    setForm((prev) => ({
      ...prev,
      title_fr: data.title_fr || prev.title_fr,
      title_en: data.title_en || prev.title_en,
      excerpt_fr: data.excerpt_fr || prev.excerpt_fr,
      excerpt_en: data.excerpt_en || prev.excerpt_en,
      content_fr: data.content_fr || prev.content_fr,
      content_en: data.content_en || prev.content_en,
      tags: Array.isArray(data.tags) && data.tags.length ? data.tags : prev.tags,
      reading_time_minutes: data.reading_time_minutes || prev.reading_time_minutes,
      meta_title_fr: data.meta_title_fr || prev.meta_title_fr,
      meta_title_en: data.meta_title_en || prev.meta_title_en,
      meta_description_fr: data.meta_description_fr || prev.meta_description_fr,
      meta_description_en: data.meta_description_en || prev.meta_description_en,
    }))
    setImagePromptHint(data.cover_image_prompt || '')
  }

  const handleGenerated = (data) => {
    setResearchUsed(data._research_used ?? null)
    if (isEdit) {
      setPendingRegen(data)
      setShowGenerator(false)
    } else {
      applyGenerated(data)
      setShowGenerator(false)
      setAuthorMode('manual')
    }
  }

  const buildDiagramBlock = (variant) => {
    if (!variant) return null
    const alt = variant.language === 'en' ? 'Diagram' : 'Diagramme'
    const sceneJson = variant.scene ? JSON.stringify(variant.scene) : ''
    const safeJson = sceneJson.replace(/-->/g, '-- >')
    return `![${alt}](${variant.url})\n\n<!-- diagram-prompt\n${safeJson}\ndiagram-prompt -->`
  }

  const insertDiagramMarkdown = ({ fr, en, insertPosition }) => {
    const blockFr = buildDiagramBlock(fr)
    const blockEn = buildDiagramBlock(en)
    const sectionIndex = insertPosition === 'end' || insertPosition == null ? -1 : Number.parseInt(insertPosition, 10)
    setForm((prev) => ({
      ...prev,
      content_fr: blockFr ? insertAfterH2Section(prev.content_fr || '', sectionIndex, blockFr) : prev.content_fr,
      content_en: blockEn ? insertAfterH2Section(prev.content_en || '', sectionIndex, blockEn) : prev.content_en,
    }))
    setShowDiagramGenerator(false)
  }

  const handleCopyImagePrompt = async () => {
    if (!imagePromptHint) return
    try {
      await navigator.clipboard.writeText(imagePromptHint)
      setImagePromptCopied(true)
      setTimeout(() => setImagePromptCopied(false), 2000)
    } catch (err) {
      console.error('Clipboard write failed', err)
    }
  }

  if (loading) {
    return <p className="pt-32 text-center text-muted">{t('blog.loading')}</p>
  }

  return (
    <section className="pt-28 pb-20 bg-warm-gray min-h-[90vh]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
          <div>
            <Link
              to="/admin/blog"
              className="inline-flex items-center gap-1.5 text-[12px] font-medium text-muted hover:text-navy transition-colors mb-2"
            >
              <ArrowLeft size={13} strokeWidth={2} />
              {t('admin.nav.back')}
            </Link>
            <h1 className="font-heading font-bold text-navy text-2xl md:text-3xl tracking-tight">
              {isEdit ? t('admin.editor.titleEdit') : t('admin.editor.titleNew')}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {isEdit && (
              <button
                type="button"
                onClick={() => setShowGenerator((v) => !v)}
                className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/5 px-4 py-2 text-[13px] font-medium text-accent-deep hover:bg-accent/10 hover:border-accent/50 transition-colors"
              >
                <Sparkles size={14} strokeWidth={2} />
                {t('admin.generator.regenerate')}
              </button>
            )}
            <button
              type="button"
              onClick={() => setShowPreview((v) => !v)}
              className="hidden md:inline-flex items-center gap-2 rounded-full border border-navy/15 bg-white px-4 py-2 text-[13px] font-medium text-navy/75 hover:text-navy hover:border-navy/30 transition-colors"
            >
              {showPreview ? <EyeOff size={14} strokeWidth={2} /> : <Eye size={14} strokeWidth={2} />}
              {showPreview ? t('admin.editor.actions.hidePreview') : t('admin.editor.actions.showPreview')}
            </button>
          </div>
        </div>

        {!isEdit && (
          <div className="mb-6 inline-flex items-center gap-1 rounded-full border border-navy/10 bg-white p-1">
            <button
              type="button"
              onClick={() => {
                setAuthorMode('manual')
                setShowGenerator(false)
              }}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-[12px] font-bold uppercase tracking-[0.1em] transition-colors ${
                authorMode === 'manual' ? 'bg-navy text-white' : 'text-navy/55 hover:text-navy'
              }`}
            >
              <PencilLine size={13} strokeWidth={2} />
              {t('admin.generator.manual')}
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthorMode('ai')
                setShowGenerator(true)
              }}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-[12px] font-bold uppercase tracking-[0.1em] transition-colors ${
                authorMode === 'ai' ? 'bg-accent text-white' : 'text-navy/55 hover:text-navy'
              }`}
            >
              <Sparkles size={13} strokeWidth={2} />
              {t('admin.generator.aiMode')}
            </button>
          </div>
        )}

        {feedback && (
          <div
            className={`mb-6 rounded-xl px-4 py-3 text-[14px] ${
              feedback.kind === 'success'
                ? 'bg-steel/15 text-navy border border-steel/30'
                : 'bg-accent/10 text-accent-deep border border-accent/30'
            }`}
          >
            {feedback.message}
          </div>
        )}

        {showGenerator && (
          <div className="mb-6">
            <ArticleGenerator
              initialTopic={isEdit ? form.title_fr : (topicFinderState.current?.topic || '')}
              seoData={seoData}
              initialArticleType={topicFinderState.current?.articleType || 'list'}
              initialInstructions={topicFinderState.current?.instructions || ''}
              onGenerated={handleGenerated}
              onCancel={() => {
                setShowGenerator(false)
                if (!isEdit) setAuthorMode('manual')
              }}
            />
          </div>
        )}

        {pendingRegen && (
          <div className="mb-6 rounded-2xl border border-accent/30 bg-accent/5 p-5 md:p-6">
            <div className="flex items-start gap-3 mb-3">
              <Sparkles size={18} strokeWidth={2} className="text-accent mt-0.5 shrink-0" />
              <div className="flex-1">
                <h3 className="font-heading font-bold text-navy text-[15px] mb-1">
                  {t('admin.generator.replaceConfirm')}
                </h3>
                <p className="text-[13px] text-navy/70 leading-relaxed">
                  {t('admin.generator.replaceHint')}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 pl-7">
              <button
                type="button"
                onClick={() => {
                  replaceGenerated(pendingRegen)
                  setPendingRegen(null)
                }}
                className="rounded-full bg-accent text-white px-5 py-2 text-[13px] font-heading font-semibold hover:brightness-95 transition-all"
              >
                {t('admin.generator.replaceYes')}
              </button>
              <button
                type="button"
                onClick={() => setPendingRegen(null)}
                className="rounded-full border border-navy/15 bg-white text-navy/75 px-5 py-2 text-[13px] font-medium hover:border-navy/25 hover:text-navy transition-colors"
              >
                {t('admin.generator.replaceNo')}
              </button>
            </div>
          </div>
        )}

        {researchUsed !== null && !showGenerator && (
          <div className={`mb-5 flex items-center gap-2 text-[12px] ${researchUsed ? 'text-emerald-700' : 'text-accent-deep'}`}>
            {researchUsed ? (
              <>
                <Search size={13} strokeWidth={2} className="shrink-0" />
                <span>{t('admin.generator.researchUsed')}</span>
              </>
            ) : (
              <>
                <AlertTriangle size={13} strokeWidth={2} className="shrink-0" />
                <span>{t('admin.generator.researchNotUsed')}</span>
              </>
            )}
          </div>
        )}

        <div className={`grid gap-6 ${showPreview ? 'lg:grid-cols-2' : 'lg:grid-cols-1'}`}>
          <form
            onSubmit={(e) => e.preventDefault()}
            className="bg-white border border-navy/[0.08] rounded-3xl p-6 md:p-8 space-y-6"
          >
            <Section title={t('admin.editor.sections.content')}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label={t('admin.editor.fields.titleFr')} required>
                  <input
                    type="text"
                    value={form.title_fr}
                    onChange={(e) => update('title_fr')(e.target.value)}
                    onBlur={handleTitleFrBlur}
                    className={inputClass}
                    required
                  />
                </Field>
                <Field label={t('admin.editor.fields.titleEn')}>
                  <input
                    type="text"
                    value={form.title_en || ''}
                    onChange={(e) => update('title_en')(e.target.value)}
                    className={inputClass}
                  />
                </Field>
              </div>

              <Field
                label={t('admin.editor.fields.slug')}
                hint={t('admin.editor.fields.slugHint')}
                error={slugError}
              >
                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) => update('slug')(slugify(e.target.value))}
                  onBlur={handleSlugBlur}
                  className={`${inputClass} font-mono text-[13px]`}
                />
              </Field>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label={t('admin.editor.fields.excerptFr')}>
                  <textarea
                    value={form.excerpt_fr || ''}
                    onChange={(e) => update('excerpt_fr')(e.target.value)}
                    rows={2}
                    className={inputClass}
                  />
                </Field>
                <Field label={t('admin.editor.fields.excerptEn')}>
                  <textarea
                    value={form.excerpt_en || ''}
                    onChange={(e) => update('excerpt_en')(e.target.value)}
                    rows={2}
                    className={inputClass}
                  />
                </Field>
              </div>

              <CoverImageField
                value={form.cover_image || ''}
                onChange={update('cover_image')}
                t={t}
              />

              <ImagePromptGenerator metaDescription={form.meta_description_fr} />

              {imagePromptHint && (
                <div className="rounded-lg border border-navy/10 bg-surface p-4">
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                        <ImageIcon size={13} strokeWidth={2} className="text-accent" />
                      </div>
                      <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-navy/70">
                        {t('admin.generator.imagePrompt')}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyImagePrompt}
                      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-medium transition-all ${
                        imagePromptCopied
                          ? 'border-steel/40 bg-steel/10 text-navy'
                          : 'border-navy/15 bg-white text-navy/75 hover:border-accent/40 hover:text-accent-deep hover:bg-accent/[0.03]'
                      }`}
                    >
                      {imagePromptCopied ? (
                        <>
                          <Check size={11} strokeWidth={2.5} />
                          {t('admin.generator.copied')}
                        </>
                      ) : (
                        <>
                          <Copy size={11} strokeWidth={2} />
                          {t('admin.generator.copy')}
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-[13px] text-navy/80 italic leading-relaxed whitespace-pre-wrap">
                    {imagePromptHint}
                  </p>
                  <p className="text-[11px] text-muted mt-3 not-italic">
                    {t('admin.generator.imagePromptHint')}
                  </p>
                </div>
              )}

              <Field label={t('admin.editor.fields.contentFr')} required>
                <textarea
                  ref={contentFrRef}
                  value={form.content_fr || ''}
                  onChange={(e) => update('content_fr')(e.target.value)}
                  rows={20}
                  className={`${inputClass} font-mono text-[13px] leading-relaxed`}
                  required
                />
              </Field>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowDiagramGenerator((v) => !v)}
                  disabled={(form.content_fr || '').length < 100 && (form.content_en || '').length < 100}
                  className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/5 px-4 py-2 text-[13px] font-medium text-accent-deep hover:bg-accent/10 hover:border-accent/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-accent/5 disabled:hover:border-accent/30"
                >
                  <PenTool size={14} strokeWidth={2} />
                  {t('admin.diagram.generate')}
                </button>
                {(form.content_fr || '').length < 100 && (form.content_en || '').length < 100 && (
                  <span className="text-[11px] text-muted">
                    {t('admin.diagram.minContent')}
                  </span>
                )}
              </div>

              {showDiagramGenerator && (
                <DiagramGenerator
                  articleContentFr={form.content_fr || ''}
                  articleContentEn={form.content_en || ''}
                  slug={form.slug}
                  onInsert={insertDiagramMarkdown}
                  onCancel={() => setShowDiagramGenerator(false)}
                />
              )}

              <Field label={t('admin.editor.fields.contentEn')}>
                <textarea
                  ref={contentEnRef}
                  value={form.content_en || ''}
                  onChange={(e) => update('content_en')(e.target.value)}
                  rows={20}
                  className={`${inputClass} font-mono text-[13px] leading-relaxed`}
                />
              </Field>

              <SocialPostsGenerator
                contentFr={form.content_fr}
                contentEn={form.content_en}
                slug={form.slug}
                socialPosts={{
                  linkedin_fr: form.linkedin_fr,
                  linkedin_en: form.linkedin_en,
                  facebook_fr: form.facebook_fr,
                  facebook_en: form.facebook_en,
                  twitter_fr: form.twitter_fr,
                  twitter_en: form.twitter_en,
                }}
                onUpdate={(field, value) => setForm((prev) => ({ ...prev, [field]: value }))}
                onGenerated={(posts) => setForm((prev) => ({ ...prev, ...posts }))}
              />
            </Section>

            <Section title={t('admin.editor.sections.meta')}>
              <TagInput
                value={form.tags}
                onChange={update('tags')}
                label={t('admin.editor.fields.tags')}
                hint={t('admin.editor.fields.tagsHint')}
                placeholder={t('admin.editor.fields.tagsPlaceholder')}
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Field label={t('admin.editor.fields.readingTime')}>
                  <input
                    type="number"
                    min="1"
                    value={form.reading_time_minutes || ''}
                    onChange={(e) => update('reading_time_minutes')(e.target.value)}
                    className={inputClass}
                  />
                </Field>
                <Field label={t('admin.editor.fields.status')}>
                  <select
                    value={form.status}
                    onChange={(e) => update('status')(e.target.value)}
                    className={inputClass}
                  >
                    <option value="draft">{t('admin.posts.status.draft')}</option>
                    <option value="published">{t('admin.posts.status.published')}</option>
                    <option value="archived">{t('admin.posts.status.archived')}</option>
                  </select>
                </Field>
                <Field label={t('admin.editor.fields.publishedAt')}>
                  <input
                    type="datetime-local"
                    value={form.published_at || ''}
                    onChange={(e) => update('published_at')(e.target.value)}
                    className={inputClass}
                  />
                </Field>
              </div>
            </Section>

            <Section title={t('admin.editor.sections.seo')}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label={t('admin.editor.fields.metaTitleFr')}>
                  <input
                    type="text"
                    value={form.meta_title_fr || ''}
                    onChange={(e) => update('meta_title_fr')(e.target.value)}
                    className={inputClass}
                  />
                </Field>
                <Field label={t('admin.editor.fields.metaTitleEn')}>
                  <input
                    type="text"
                    value={form.meta_title_en || ''}
                    onChange={(e) => update('meta_title_en')(e.target.value)}
                    className={inputClass}
                  />
                </Field>
                <Field label={t('admin.editor.fields.metaDescriptionFr')}>
                  <textarea
                    value={form.meta_description_fr || ''}
                    onChange={(e) => update('meta_description_fr')(e.target.value)}
                    rows={2}
                    className={inputClass}
                  />
                </Field>
                <Field label={t('admin.editor.fields.metaDescriptionEn')}>
                  <textarea
                    value={form.meta_description_en || ''}
                    onChange={(e) => update('meta_description_en')(e.target.value)}
                    rows={2}
                    className={inputClass}
                  />
                </Field>
              </div>
            </Section>

            <div className="pt-4 border-t border-navy/[0.06] flex flex-wrap gap-3 justify-end">
              <Button variant="outline" to="/admin/blog">
                {t('admin.editor.actions.cancel')}
              </Button>
              <button
                type="button"
                disabled={saving}
                onClick={() => handleSave('draft')}
                className="rounded-full border border-navy/15 text-navy/75 bg-white px-7 py-3 text-[14px] font-heading font-semibold hover:bg-navy/[0.03] hover:border-navy/25 transition-colors disabled:opacity-60"
              >
                {t('admin.editor.actions.saveDraft')}
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={() => handleSave('published')}
                className="rounded-full bg-accent text-white px-7 py-3 text-[14px] font-heading font-semibold shadow-[var(--shadow-cta)] hover:brightness-95 hover:shadow-[var(--shadow-cta-hover)] transition-all disabled:opacity-60"
              >
                {t('admin.editor.actions.publish')}
              </button>
            </div>
          </form>

          {showPreview && (
            <PreviewPanel
              form={form}
              previewLang={previewLang}
              setPreviewLang={setPreviewLang}
              t={t}
            />
          )}
        </div>
      </div>
      <Lightbox />
    </section>
  )
}

function TagInput({ value, onChange, label, hint, placeholder }) {
  const [draft, setDraft] = useState('')

  const addTag = () => {
    const normalized = slugify(draft)
    if (!normalized) {
      setDraft('')
      return
    }
    if (!value.includes(normalized)) {
      onChange([...value, normalized])
    }
    setDraft('')
  }

  const removeTag = (tag) => onChange(value.filter((t) => t !== tag))

  return (
    <Field label={label} hint={hint}>
      <div className="rounded-xl border border-navy/15 bg-white px-3 py-2.5 flex flex-wrap items-center gap-2 focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/20 transition-colors">
        {value.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1.5 rounded-full bg-lavender/60 text-navy text-[11px] font-bold uppercase tracking-[0.1em] px-2.5 py-1"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="text-navy/60 hover:text-accent-deep"
              aria-label={`remove ${tag}`}
            >
              <X size={11} strokeWidth={2.5} />
            </button>
          </span>
        ))}
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ',') {
              e.preventDefault()
              addTag()
            } else if (e.key === 'Backspace' && !draft && value.length) {
              removeTag(value[value.length - 1])
            }
          }}
          placeholder={placeholder}
          className="flex-1 min-w-[120px] bg-transparent text-[13px] text-navy placeholder:text-muted outline-none"
        />
      </div>
    </Field>
  )
}

function CoverImageField({ value, onChange, t }) {
  const inputRef = useRef(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)

  const handleFile = async (file) => {
    if (!file) return
    setError(null)
    setUploading(true)
    try {
      const extMatch = file.name.match(/\.[a-z0-9]+$/i)
      const ext = extMatch ? extMatch[0].toLowerCase() : ''
      const safeBase = slugify(file.name.replace(/\.[a-z0-9]+$/i, '')) || 'image'
      const fileName = `${Date.now()}-${safeBase}${ext}`

      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(fileName, file, { cacheControl: '3600', upsert: false })
      if (uploadError) throw uploadError

      const { data } = supabase.storage.from(BUCKET).getPublicUrl(fileName)
      onChange(data.publicUrl)
    } catch (err) {
      console.error(err)
      setError(err.message || t('admin.editor.feedback.uploadError'))
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <Field
      label={t('admin.editor.fields.coverImage')}
      hint={t('admin.editor.fields.coverImageHint')}
      error={error}
    >
      <div className="space-y-3">
        {value && (
          <div className="relative inline-block">
            <img
              src={value}
              alt=""
              className="max-h-48 w-auto rounded-xl object-cover border border-navy/[0.08]"
            />
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
            className="inline-flex items-center gap-2 rounded-full border border-navy/15 bg-white px-4 py-2 text-[13px] font-medium text-navy/75 hover:text-navy hover:border-navy/30 transition-colors disabled:opacity-60"
          >
            <Upload size={14} strokeWidth={2} />
            {uploading
              ? t('admin.editor.fields.coverImageUploading')
              : value
              ? t('admin.editor.fields.coverImageChange')
              : t('admin.editor.fields.coverImage')}
          </button>
          {value && !uploading && (
            <button
              type="button"
              onClick={() => onChange('')}
              className="text-[12px] font-medium text-muted hover:text-accent-deep transition-colors"
            >
              {t('admin.editor.fields.coverImageRemove')}
            </button>
          )}
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
      </div>
    </Field>
  )
}

function formatPreviewDate(value, lang) {
  if (!value) return ''
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  try {
    return d.toLocaleDateString(lang === 'fr' ? 'fr-CA' : 'en-CA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  } catch {
    return d.toISOString().slice(0, 10)
  }
}

function PreviewPanel({ form, previewLang, setPreviewLang, t }) {
  const content = previewLang === 'en' ? form.content_en || form.content_fr : form.content_fr
  const title = previewLang === 'en' ? form.title_en || form.title_fr : form.title_fr
  const excerpt = previewLang === 'en' ? form.excerpt_en || form.excerpt_fr : form.excerpt_fr
  const formattedDate = formatPreviewDate(form.published_at ? new Date(form.published_at).toISOString() : '', previewLang)
  const readingTime = form.reading_time_minutes ? `${form.reading_time_minutes} ${t('blog.card.minRead')}` : ''
  const author = form.author || 'Christian Couillard'

  return (
    <aside className="bg-white border border-navy/[0.08] rounded-3xl p-6 md:p-8 lg:sticky lg:top-24 lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-heading font-bold text-navy text-[13px] uppercase tracking-[0.14em]">
          {t('admin.editor.actions.showPreview')}
        </h2>
        <div className="flex items-center gap-1 rounded-full border border-navy/10 p-1">
          {['fr', 'en'].map((lang) => (
            <button
              key={lang}
              type="button"
              onClick={() => setPreviewLang(lang)}
              className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] transition-colors ${
                previewLang === lang ? 'bg-navy text-white' : 'text-navy/55 hover:text-navy'
              }`}
            >
              {lang}
            </button>
          ))}
        </div>
      </div>

      {form.cover_image && (
        <img
          src={form.cover_image}
          alt=""
          className="w-full aspect-video object-cover rounded-xl mb-6 border border-navy/[0.06]"
        />
      )}

      {form.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {form.tags.map((tag) => (
            <span
              key={tag}
              className="bg-lavender/60 text-navy text-[10px] font-bold uppercase tracking-[0.14em] px-2.5 py-1 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      <h1 className="font-heading font-bold text-navy text-2xl md:text-[1.75rem] mb-3 tracking-tight leading-tight">
        {title || '—'}
      </h1>

      {(formattedDate || readingTime || author) && (
        <div className="flex flex-wrap items-center gap-2 text-[12px] text-navy/55 mb-6">
          {formattedDate && <span>{formattedDate}</span>}
          {formattedDate && readingTime && <span aria-hidden="true">·</span>}
          {readingTime && <span>{readingTime}</span>}
          {(formattedDate || readingTime) && author && <span aria-hidden="true">·</span>}
          {author && (
            <span>
              {t('blog.post.by')} {author}
            </span>
          )}
        </div>
      )}

      {excerpt && (
        <p className="text-[15px] text-navy/75 leading-relaxed italic mb-6 border-l-2 border-accent/50 pl-4">
          {excerpt}
        </p>
      )}

      <div className="blog-prose">
        {content ? (
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
            {stripDiagramArtifacts(content)}
          </ReactMarkdown>
        ) : (
          <p className="text-muted text-sm">—</p>
        )}
      </div>
    </aside>
  )
}

