import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import { Maximize2, Download } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { resolveCoverImage, resolveCoverAlt } from '@/lib/posts'
import { markdownComponents } from '@/components/blog/markdownComponents'
import { stripDiagramArtifacts } from '@/lib/markdown'

export default function InfographicRenderer({ content, post, lang }) {
  const { t } = useTranslation()
  const coverUrl = resolveCoverImage(post, lang)
  const coverAlt = resolveCoverAlt(post, lang)

  const handleEnlarge = () => {
    if (!coverUrl) return
    window.dispatchEvent(
      new CustomEvent('lightbox:open', { detail: { src: coverUrl, alt: coverAlt || '' } }),
    )
  }

  return (
    <div>
      {coverUrl && (
        <div className="flex flex-col items-center mb-10">
          <img
            src={coverUrl}
            alt={coverAlt || ''}
            className="w-full max-w-lg rounded-2xl shadow-[var(--shadow-card)] cursor-pointer"
            onClick={handleEnlarge}
          />
          <div className="flex items-center gap-3 mt-4">
            <button
              type="button"
              onClick={handleEnlarge}
              className="inline-flex items-center gap-2 rounded-full border border-navy/15 bg-white text-navy/75 px-4 py-2 text-[13px] font-medium hover:text-navy hover:border-navy/30 transition-colors"
            >
              <Maximize2 size={14} strokeWidth={2} />
              {t('blog.post.enlarge')}
            </button>
            <a
              href={coverUrl}
              download
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-navy/15 bg-white text-navy/75 px-4 py-2 text-[13px] font-medium hover:text-navy hover:border-navy/30 transition-colors"
            >
              <Download size={14} strokeWidth={2} />
              {t('blog.post.download')}
            </a>
          </div>
        </div>
      )}

      {content && (
        <div className="opacity-80">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-navy/55 mb-5">
            {t('blog.post.infographic.essentialsTitle')}
          </p>
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw]}
            components={markdownComponents}
          >
            {stripDiagramArtifacts(content)}
          </ReactMarkdown>
        </div>
      )}
    </div>
  )
}
