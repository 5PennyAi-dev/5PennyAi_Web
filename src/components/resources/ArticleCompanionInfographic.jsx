import { useState } from 'react'
import { Download, LoaderCircle, Maximize2 } from 'lucide-react'
import ImageDialog from './ImageDialog'
import { downloadPublicAsset } from '@/lib/publicAssetDownload'

export default function ArticleCompanionInfographic({ infographic, showActions = true, t, title }) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [imageFailed, setImageFailed] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [downloadError, setDownloadError] = useState(false)

  if (!infographic?.url || imageFailed) return null

  const alt = infographic.altText?.trim()
    || t('resourcesAi.article.infographic.altFallback', { title })

  const download = async () => {
    if (!infographic.downloadFileName || downloading) return
    setDownloading(true)
    setDownloadError(false)
    try {
      await downloadPublicAsset(infographic.url, infographic.downloadFileName)
    } catch {
      setDownloadError(true)
    } finally {
      setDownloading(false)
    }
  }

  return (
    <section aria-labelledby="article-companion-infographic-title" className="rounded-2xl border border-navy/[0.08] bg-surface p-4 sm:p-6">
      <div className="mx-auto max-w-2xl text-center">
        <h2 id="article-companion-infographic-title" className="font-heading text-xl font-semibold text-navy">
          {t('resourcesAi.article.infographic.title')}
        </h2>
        <p className="mt-2 text-sm leading-6 text-navy/65">
          {t('resourcesAi.article.infographic.description')}
        </p>
      </div>

      <div className="mx-auto mt-5 max-w-xl overflow-hidden rounded-xl border border-navy/[0.08] bg-white p-2 sm:p-3">
        <img
          src={infographic.url}
          alt={alt}
          loading="lazy"
          decoding="async"
          onError={() => setImageFailed(true)}
          className="h-auto w-full object-contain"
        />
      </div>

      {showActions && (
        <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => setDialogOpen(true)}
            className="inline-flex items-center gap-2 rounded-full border border-navy/15 bg-white px-5 py-2.5 text-sm font-semibold text-navy hover:border-accent hover:text-accent-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <Maximize2 size={15} aria-hidden="true" />
            {t('resourcesAi.article.infographic.enlarge')}
          </button>
          {infographic.downloadFileName && (
            <button
              type="button"
              disabled={downloading}
              onClick={download}
              className="inline-flex items-center gap-2 rounded-full bg-navy px-5 py-2.5 text-sm font-semibold text-white hover:bg-navy-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-wait disabled:opacity-65"
            >
              {downloading ? <LoaderCircle size={15} className="animate-spin" aria-hidden="true" /> : <Download size={15} aria-hidden="true" />}
              {t(`resourcesAi.article.infographic.${downloading ? 'downloading' : 'download'}`)}
            </button>
          )}
        </div>
      )}

      {downloadError && (
        <p role="status" className="mt-3 text-center text-sm text-red-700">
          {t('resourcesAi.article.infographic.downloadError')}
        </p>
      )}

      {dialogOpen && (
        <ImageDialog
          alt={alt}
          closeLabel={t('resourcesAi.article.infographic.close')}
          onClose={() => setDialogOpen(false)}
          src={infographic.url}
        />
      )}
    </section>
  )
}
