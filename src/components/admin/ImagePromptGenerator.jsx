import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Sparkles, Image as ImageIcon, Copy, Check, X } from 'lucide-react'

export default function ImagePromptGenerator({ metaDescription }) {
  const { t } = useTranslation()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [prompts, setPrompts] = useState(null)
  const [copiedVariant, setCopiedVariant] = useState(null)

  const canGenerate = Boolean(metaDescription && metaDescription.trim())

  const handleGenerate = async () => {
    if (!canGenerate) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/generate-image-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ metaDescription: metaDescription.trim() }),
      })
      if (!res.ok) {
        setError(t('admin.imagePromptGen.error'))
        return
      }
      const data = await res.json()
      setPrompts(data)
    } catch (err) {
      console.error('Image prompt generation failed', err)
      setError(t('admin.imagePromptGen.error'))
    } finally {
      setLoading(false)
    }
  }

  const copy = async (variant, text) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedVariant(variant)
      setTimeout(() => setCopiedVariant(null), 2000)
    } catch (err) {
      console.error('Clipboard write failed', err)
    }
  }

  return (
    <div className="space-y-3">
      {error && (
        <div className="rounded-lg bg-accent/5 border border-accent/20 px-3 py-2 text-[12px] text-accent-deep">
          {error}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handleGenerate}
          disabled={!canGenerate || loading}
          className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/5 px-4 py-2 text-[13px] font-medium text-accent-deep hover:bg-accent/10 hover:border-accent/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-accent/5 disabled:hover:border-accent/30"
        >
          {loading ? (
            <>
              <span className="h-3.5 w-3.5 rounded-full border-2 border-accent/30 border-t-accent animate-spin" />
              {t('admin.imagePromptGen.buttonLoading')}
            </>
          ) : (
            <>
              <Sparkles size={14} strokeWidth={2} />
              {t('admin.imagePromptGen.button')}
            </>
          )}
        </button>
        {!canGenerate && !loading && (
          <span className="text-[11px] text-muted">
            {t('admin.imagePromptGen.needMeta')}
          </span>
        )}
      </div>

      {prompts && (
        <div className="rounded-lg border border-navy/10 bg-surface p-4 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                <ImageIcon size={13} strokeWidth={2} className="text-accent" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-navy/70">
                {t('admin.imagePromptGen.title')}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setPrompts(null)}
              aria-label="close"
              className="text-navy/50 hover:text-navy transition-colors"
            >
              <X size={14} strokeWidth={2} />
            </button>
          </div>

          <VariantBlock
            label={t('admin.imagePromptGen.variantLiteral')}
            text={prompts.literal.en}
            copied={copiedVariant === 'literal'}
            onCopy={() => copy('literal', prompts.literal.en)}
            copyLabel={t('admin.generator.copy')}
            copiedLabel={t('admin.generator.copied')}
          />

          <VariantBlock
            label={t('admin.imagePromptGen.variantMetaphorical')}
            text={prompts.metaphorical.en}
            copied={copiedVariant === 'metaphorical'}
            onCopy={() => copy('metaphorical', prompts.metaphorical.en)}
            copyLabel={t('admin.generator.copy')}
            copiedLabel={t('admin.generator.copied')}
          />

          <p className="text-[11px] text-muted italic">
            {t('admin.imagePromptGen.nanoBananaHint')}
          </p>
        </div>
      )}
    </div>
  )
}

function VariantBlock({ label, text, copied, onCopy, copyLabel, copiedLabel }) {
  return (
    <div className="space-y-2">
      <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-navy/70">
        {label}
      </div>
      <div className="rounded-md border border-navy/10 bg-white p-3">
        <p className="text-[12px] text-navy/80 leading-relaxed whitespace-pre-wrap">
          {text}
        </p>
      </div>
      <div className="flex justify-end">
        <button
          type="button"
          onClick={onCopy}
          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-medium transition-all ${
            copied
              ? 'border-steel/40 bg-steel/10 text-navy'
              : 'border-navy/15 bg-white text-navy/75 hover:border-accent/40 hover:text-accent-deep hover:bg-accent/[0.03]'
          }`}
        >
          {copied ? (
            <>
              <Check size={11} strokeWidth={2.5} />
              {copiedLabel}
            </>
          ) : (
            <>
              <Copy size={11} strokeWidth={2} />
              {copyLabel}
            </>
          )}
        </button>
      </div>
    </div>
  )
}
