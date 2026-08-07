/* eslint-disable react-refresh/only-export-components -- pure browser helpers are exported for focused tests */
import { useEffect, useRef, useState } from 'react'
import { Check, Copy, Share2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const COPY_SUCCESS_DURATION = 2500

export function supportsWebShare(navigatorObject = globalThis.navigator) {
  return typeof navigatorObject !== 'undefined' && typeof navigatorObject.share === 'function'
}

export function getSafeShareText(value) {
  if (typeof value !== 'string' || !value.trim()) return undefined
  if (/\{\{(?:cite|media):|https?:\/\/|www\./i.test(value)) return undefined
  return value.trim()
}

export async function shareCanonicalUrl(
  { title, shareText, canonicalUrl },
  navigatorObject = globalThis.navigator,
) {
  try {
    await navigatorObject.share({
      title,
      text: getSafeShareText(shareText),
      url: canonicalUrl,
    })
    return 'shared'
  } catch (error) {
    if (error?.name === 'AbortError') return 'cancelled'
    throw error
  }
}

export async function copyCanonicalUrl(canonicalUrl, navigatorObject = globalThis.navigator) {
  if (typeof navigatorObject?.clipboard?.writeText !== 'function') return false

  try {
    await navigatorObject.clipboard.writeText(canonicalUrl)
    return true
  } catch {
    return false
  }
}

export default function ResourceShareActions({
  resourceType,
  title,
  canonicalUrl,
  shareText,
  className = '',
}) {
  const { t } = useTranslation()
  const [canShare] = useState(() => supportsWebShare())
  const [copied, setCopied] = useState(false)
  const [manualCopy, setManualCopy] = useState(false)
  const [shareError, setShareError] = useState(false)
  const manualInputRef = useRef(null)
  const copyTimerRef = useRef(null)

  useEffect(() => () => clearTimeout(copyTimerRef.current), [])

  useEffect(() => {
    if (!manualCopy) return
    manualInputRef.current?.focus()
    manualInputRef.current?.select()
  }, [manualCopy])

  async function handleShare() {
    setShareError(false)
    try {
      await shareCanonicalUrl({ title, shareText, canonicalUrl })
    } catch {
      setShareError(true)
    }
  }

  async function handleCopy() {
    clearTimeout(copyTimerRef.current)
    setCopied(false)
    const succeeded = await copyCanonicalUrl(canonicalUrl)
    if (!succeeded) {
      setManualCopy(true)
      return
    }

    setManualCopy(false)
    setCopied(true)
    copyTimerRef.current = setTimeout(() => setCopied(false), COPY_SUCCESS_DURATION)
  }

  const statusMessage = manualCopy
    ? t('resourcesAi.share.manualCopy')
    : copied
      ? t('resourcesAi.share.copied')
      : shareError
        ? t('resourcesAi.share.error')
        : ''
  const typeLabel = t(`resourcesAi.formats.${resourceType}`, { defaultValue: resourceType })

  return (
    <div
      className={`mx-auto max-w-3xl ${className}`.trim()}
      aria-label={t('resourcesAi.share.actionsLabel', { type: typeLabel })}
      role="group"
    >
      <div className="flex flex-wrap items-center justify-center gap-3">
        {canShare && (
          <button
            type="button"
            onClick={handleShare}
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-navy/15 bg-white px-5 py-2.5 text-sm font-semibold text-navy hover:border-accent hover:text-accent-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-deep"
          >
            <Share2 size={16} aria-hidden="true" />
            {t('resourcesAi.share.share')}
          </button>
        )}
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex min-h-11 items-center gap-2 rounded-full border border-navy/15 bg-white px-5 py-2.5 text-sm font-semibold text-navy hover:border-accent hover:text-accent-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-deep"
        >
          {copied
            ? <Check size={16} aria-hidden="true" />
            : <Copy size={16} aria-hidden="true" />}
          {copied ? t('resourcesAi.share.copied') : t('resourcesAi.share.copy')}
        </button>
      </div>

      <div className="min-h-6 pt-2 text-center text-sm text-navy/70" role="status" aria-live="polite">
        {statusMessage}
      </div>

      {manualCopy && (
        <div className="mt-2">
          <label htmlFor={`${resourceType}-canonical-url`} className="sr-only">
            {t('resourcesAi.share.manualCopyLabel')}
          </label>
          <input
            id={`${resourceType}-canonical-url`}
            ref={manualInputRef}
            type="text"
            readOnly
            value={canonicalUrl}
            onFocus={(event) => event.currentTarget.select()}
            className="w-full rounded-lg border border-navy/20 bg-white px-3 py-2 text-sm text-navy focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-deep"
          />
        </div>
      )}
    </div>
  )
}
