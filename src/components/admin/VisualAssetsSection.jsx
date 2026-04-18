import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Image as ImageIcon, BarChart3, PenTool, Trash2 } from 'lucide-react'
import CoverImageField from '@/components/admin/CoverImageField'
import HeaderImageGenerator from '@/components/admin/HeaderImageGenerator'
import InfographicGenerator from '@/components/admin/InfographicGenerator'
import DiagramGenerator from '@/components/admin/DiagramGenerator'

// -----------------------------------------------------------------------------
// HeaderImageSlot — preview pair (FR + EN) + actions when a generated header exists
// -----------------------------------------------------------------------------

function HeaderImageSlot({ form, onClear, onRegenerate }) {
  const { t } = useTranslation()
  const hasAny = Boolean(form.cover_image_fr || form.cover_image_en)
  if (!hasAny) return null

  const categoryLabel = form.cover_image_category
    ? t(`admin.header.categories.${form.cover_image_category}`, {
        defaultValue: form.cover_image_category,
      })
    : null

  return (
    <div className="rounded-2xl border border-navy/[0.08] bg-white p-4 md:p-5 space-y-4">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-navy/70">
            {t('admin.visualAssets.headerLabel')}
          </p>
          {(categoryLabel || form.cover_image_mode) && (
            <p className="text-[11px] text-navy/50 mt-1">
              {categoryLabel && (
                <span className="mr-2">
                  <span className="uppercase tracking-[0.1em] font-bold mr-1">
                    {t('admin.header.categoryLabel')}
                  </span>
                  {categoryLabel}
                </span>
              )}
              {form.cover_image_mode && (
                <span>
                  <span className="uppercase tracking-[0.1em] font-bold mr-1">
                    {t('admin.header.modeLabel')}
                  </span>
                  {form.cover_image_mode}
                </span>
              )}
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onRegenerate}
            className="inline-flex items-center gap-1.5 rounded-full border border-navy/15 bg-white px-3 py-1.5 text-[12px] font-medium text-navy/75 hover:text-navy hover:border-navy/30 transition-colors"
          >
            {t('admin.header.regenerate')}
          </button>
          <button
            type="button"
            onClick={onClear}
            className="inline-flex items-center gap-1.5 rounded-full border border-accent/25 bg-accent/[0.04] px-3 py-1.5 text-[12px] font-medium text-accent-deep hover:bg-accent/10 transition-colors"
          >
            <Trash2 size={12} strokeWidth={2} />
            {t('admin.visualAssets.headerDelete')}
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {form.cover_image_fr && (
          <figure className="space-y-1.5">
            <img
              src={form.cover_image_fr}
              alt={form.cover_image_alt_fr || ''}
              className="w-full aspect-video object-cover rounded-lg border border-navy/[0.08]"
            />
            <figcaption className="text-[10px] font-bold uppercase tracking-[0.14em] text-navy/50">
              {t('admin.header.labelFr')}
            </figcaption>
          </figure>
        )}
        {form.cover_image_en && (
          <figure className="space-y-1.5">
            <img
              src={form.cover_image_en}
              alt={form.cover_image_alt_en || ''}
              className="w-full aspect-video object-cover rounded-lg border border-navy/[0.08]"
            />
            <figcaption className="text-[10px] font-bold uppercase tracking-[0.14em] text-navy/50">
              {t('admin.header.labelEn')}
            </figcaption>
          </figure>
        )}
      </div>
    </div>
  )
}

// -----------------------------------------------------------------------------
// VisualAssetsSection — main wrapper
// -----------------------------------------------------------------------------

export default function VisualAssetsSection({
  form,
  update,
  onApplyHeader,
  onClearHeader,
  onInsertInfographic,
  onInsertDiagram,
  existingInfographics = [],
}) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(null) // 'header' | 'infographic' | 'diagram' | null

  const canGenerateFromContent =
    (form.content_fr || '').length >= 100 && (form.content_en || '').length >= 100
  const canGenerateDiagram =
    (form.content_fr || '').length >= 100 || (form.content_en || '').length >= 100

  const toggle = (key) => setOpen(open === key ? null : key)

  const handleHeaderSave = (result) => {
    onApplyHeader(result)
    setOpen(null)
  }

  const handleInfographicInsert = (payload) => {
    onInsertInfographic(payload)
    setOpen(null)
  }

  const handleDiagramInsert = (payload) => {
    onInsertDiagram(payload)
    setOpen(null)
  }

  return (
    <div className="bg-surface border border-navy/[0.08] rounded-3xl p-6 md:p-8 space-y-6">
      <div className="flex items-center gap-2">
        <ImageIcon size={16} strokeWidth={2} className="text-accent" />
        <h3 className="font-heading font-bold text-navy text-sm uppercase tracking-[0.12em]">
          {t('admin.visualAssets.title')}
        </h3>
      </div>
      <p className="text-[12px] text-navy/60 leading-relaxed -mt-4">
        {t('admin.visualAssets.subtitle')}
      </p>

      {/* Manual cover upload (fallback for articles without generated header) */}
      <CoverImageField
        value={form.cover_image || ''}
        onChange={update('cover_image')}
        t={t}
        label={t('admin.visualAssets.coverLabel')}
        hint={t('admin.visualAssets.coverHint')}
      />

      {/* Generated header preview (if any) */}
      <HeaderImageSlot
        form={form}
        onClear={onClearHeader}
        onRegenerate={() => setOpen('header')}
      />

      {/* Generator buttons */}
      <div className="flex flex-wrap gap-3 pt-2 border-t border-navy/[0.06]">
        <button
          type="button"
          onClick={() => toggle('header')}
          disabled={!canGenerateFromContent}
          className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/5 px-4 py-2 text-[13px] font-medium text-accent-deep hover:bg-accent/10 hover:border-accent/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-accent/5 disabled:hover:border-accent/30"
        >
          <ImageIcon size={14} strokeWidth={2} />
          {t('admin.header.openButton')}
        </button>
        <button
          type="button"
          onClick={() => toggle('infographic')}
          disabled={!canGenerateFromContent}
          className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/5 px-4 py-2 text-[13px] font-medium text-accent-deep hover:bg-accent/10 hover:border-accent/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-accent/5 disabled:hover:border-accent/30"
        >
          <BarChart3 size={14} strokeWidth={2} />
          {t('admin.infographic.openButton')}
        </button>
        <button
          type="button"
          onClick={() => toggle('diagram')}
          disabled={!canGenerateDiagram}
          className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/5 px-4 py-2 text-[13px] font-medium text-accent-deep hover:bg-accent/10 hover:border-accent/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-accent/5 disabled:hover:border-accent/30"
        >
          <PenTool size={14} strokeWidth={2} />
          {t('admin.diagram.generate')}
        </button>
        {!canGenerateFromContent && (
          <span className="text-[11px] text-muted self-center">
            {t('admin.visualAssets.minContent')}
          </span>
        )}
      </div>

      {open === 'header' && (
        <HeaderImageGenerator
          articleContentFr={form.content_fr || ''}
          articleContentEn={form.content_en || ''}
          slug={form.slug}
          onSave={handleHeaderSave}
          onCancel={() => setOpen(null)}
        />
      )}

      {open === 'infographic' && (
        <InfographicGenerator
          articleContentFr={form.content_fr || ''}
          articleContentEn={form.content_en || ''}
          slug={form.slug}
          previousVariants={existingInfographics
            .map((i) => i.takeaway_variant)
            .filter(Boolean)}
          onInsert={handleInfographicInsert}
          onCancel={() => setOpen(null)}
        />
      )}

      {open === 'diagram' && (
        <DiagramGenerator
          articleContentFr={form.content_fr || ''}
          articleContentEn={form.content_en || ''}
          slug={form.slug}
          onInsert={handleDiagramInsert}
          onCancel={() => setOpen(null)}
        />
      )}
    </div>
  )
}
