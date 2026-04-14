import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Share2, Copy, Check, X } from 'lucide-react'

const TABS = ['linkedin', 'facebook', 'twitter']
const CHAR_LIMITS = { linkedin: 1300, facebook: 600, twitter: 280 }

export default function SocialPostsGenerator({
  contentFr,
  contentEn,
  slug,
  socialPosts,
  onUpdate,
  onGenerated,
}) {
  const { t } = useTranslation()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [copiedKey, setCopiedKey] = useState(null)
  const [activeTab, setActiveTab] = useState('linkedin')
  const [showPanel, setShowPanel] = useState(false)

  const hasPosts = TABS.some(
    (p) => (socialPosts[`${p}_fr`] || '').trim() || (socialPosts[`${p}_en`] || '').trim()
  )

  const initializedRef = useRef(false)
  useEffect(() => {
    if (!initializedRef.current && hasPosts) {
      setShowPanel(true)
      initializedRef.current = true
    }
  }, [hasPosts])

  const canGenerate = Boolean(contentFr && contentFr.trim())
  const articleUrl = slug ? `https://5pennyai.com/blog/${slug}` : ''

  const handleGenerate = async () => {
    if (!canGenerate) return
    if (hasPosts && !window.confirm(t('admin.socialPosts.overwriteConfirm'))) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/generate-social-posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contentFr: contentFr.trim(),
          contentEn: contentEn ? contentEn.trim() : '',
          articleUrl,
        }),
      })
      if (!res.ok) {
        setError(t('admin.socialPosts.error'))
        return
      }
      const data = await res.json()
      onGenerated({
        linkedin_fr: data.linkedin.fr,
        linkedin_en: data.linkedin.en,
        facebook_fr: data.facebook.fr,
        facebook_en: data.facebook.en,
        twitter_fr: data.twitter.fr,
        twitter_en: data.twitter.en,
      })
      setShowPanel(true)
    } catch (err) {
      console.error('Social posts generation failed', err)
      setError(t('admin.socialPosts.error'))
    } finally {
      setLoading(false)
    }
  }

  const copy = async (key, text) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedKey(key)
      setTimeout(() => setCopiedKey(null), 2000)
    } catch (err) {
      console.error('Clipboard write failed', err)
    }
  }

  const frField = `${activeTab}_fr`
  const enField = `${activeTab}_en`

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
              {t('admin.socialPosts.buttonLoading')}
            </>
          ) : (
            <>
              <Share2 size={14} strokeWidth={2} />
              {t('admin.socialPosts.button')}
            </>
          )}
        </button>
        {!canGenerate && !loading && (
          <span className="text-[11px] text-muted">
            {t('admin.socialPosts.needContent')}
          </span>
        )}
        {hasPosts && !showPanel && (
          <button
            type="button"
            onClick={() => setShowPanel(true)}
            className="text-[12px] font-medium text-steel hover:text-navy transition-colors"
          >
            {t('admin.socialPosts.show')}
          </button>
        )}
      </div>

      {showPanel && hasPosts && (
        <div className="rounded-lg border border-navy/10 bg-surface p-4 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                <Share2 size={13} strokeWidth={2} className="text-accent" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-navy/70">
                {t('admin.socialPosts.title')}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setShowPanel(false)}
              aria-label="close"
              className="text-navy/50 hover:text-navy transition-colors"
            >
              <X size={14} strokeWidth={2} />
            </button>
          </div>

          <div className="flex gap-1 border-b border-navy/10">
            {TABS.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-2 text-[12px] font-semibold transition-colors ${
                  activeTab === tab
                    ? 'border-b-2 border-accent text-accent-deep'
                    : 'text-navy/50 hover:text-navy/70'
                }`}
              >
                {t(`admin.socialPosts.${tab}`)}
              </button>
            ))}
          </div>

          <PostBlock
            label={t('admin.socialPosts.langFr')}
            text={socialPosts[frField] || ''}
            charLimit={CHAR_LIMITS[activeTab]}
            rows={activeTab === 'twitter' ? 3 : 6}
            copied={copiedKey === frField}
            onCopy={() => copy(frField, socialPosts[frField] || '')}
            onChange={(val) => onUpdate(frField, val)}
            copyLabel={t('admin.generator.copy')}
            copiedLabel={t('admin.generator.copied')}
          />

          <PostBlock
            label={t('admin.socialPosts.langEn')}
            text={socialPosts[enField] || ''}
            charLimit={CHAR_LIMITS[activeTab]}
            rows={activeTab === 'twitter' ? 3 : 6}
            copied={copiedKey === enField}
            onCopy={() => copy(enField, socialPosts[enField] || '')}
            onChange={(val) => onUpdate(enField, val)}
            copyLabel={t('admin.generator.copy')}
            copiedLabel={t('admin.generator.copied')}
          />
        </div>
      )}
    </div>
  )
}

function PostBlock({ label, text, charLimit, rows, copied, onCopy, onChange, copyLabel, copiedLabel }) {
  const isOver = text.length > charLimit
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-navy/70">
          {label}
        </div>
        <span className={`text-[11px] font-mono ${isOver ? 'text-red-500 font-bold' : 'text-navy/40'}`}>
          {text.length} / {charLimit}
        </span>
      </div>
      <textarea
        value={text}
        onChange={(e) => onChange(e.target.value)}
        rows={rows || 6}
        className="w-full rounded-md border border-navy/10 bg-white p-3 text-[12px] text-navy/80 leading-relaxed resize-y focus:border-accent focus:ring-2 focus:ring-accent/20 transition-colors"
      />
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
