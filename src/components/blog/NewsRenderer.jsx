import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import { Newspaper } from 'lucide-react'
import { markdownComponents } from '@/components/blog/markdownComponents'

// Links inside news items are source citations — render them small and discrete.
const newsBodyComponents = {
  ...markdownComponents,
  a: ({ href, children, ...props }) => (
    <a
      href={href}
      className="text-[11px] font-mono text-navy/40 hover:text-accent transition-colors"
      target={href?.startsWith('http') ? '_blank' : undefined}
      rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
      {...props}
    >
      {children}
    </a>
  ),
}

function parseDigest(md) {
  // Split on newlines immediately followed by "## " to get sections.
  const parts = (md || '').split(/\n(?=## )/)
  const sections = []
  let intro = ''

  for (const part of parts) {
    if (part.startsWith('## ')) {
      const newline = part.indexOf('\n')
      const title = newline === -1 ? part.slice(3).trim() : part.slice(3, newline).trim()
      const body  = newline === -1 ? '' : part.slice(newline + 1).trim()
      sections.push({ title, body })
    } else {
      intro = part.trim()
    }
  }
  return { intro, sections }
}

export default function NewsRenderer({ content }) {
  const { intro, sections } = parseDigest(content)
  const sourceCount = (content?.match(/\[source\]/gi) || []).length

  // Degrade gracefully if digest structure is missing (< 2 sections).
  if (sections.length < 2) {
    return (
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={markdownComponents}
      >
        {content}
      </ReactMarkdown>
    )
  }

  // Last section = synthesis regardless of its label (position-based detection).
  const synthesis = sections[sections.length - 1]
  const newsItems = sections.slice(0, -1)

  return (
    <article>
      {/* Intro */}
      {intro && (
        <div className="mb-8">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw]}
            components={newsBodyComponents}
          >
            {intro}
          </ReactMarkdown>
        </div>
      )}

      {/* Actualités numérotées */}
      <div>
        {newsItems.map((item, i) => (
          <div
            key={i}
            className="border-t border-navy/10 py-7 first:border-t-0 first:pt-0"
          >
            <div className="flex items-baseline gap-3 mb-3">
              <span className="font-mono text-[11px] text-accent font-bold tracking-widest shrink-0 select-none">
                {String(i + 1).padStart(2, '0')}
              </span>
              <h2 className="font-heading font-bold text-navy text-xl md:text-[1.35rem] leading-snug">
                {item.title}
              </h2>
            </div>
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw]}
              components={newsBodyComponents}
            >
              {item.body}
            </ReactMarkdown>
          </div>
        ))}
      </div>

      {/* Synthèse — bordure gauche orange */}
      {synthesis.body && (
        <div className="mt-10 border-l-4 border-accent pl-5 py-4 bg-surface rounded-r-xl">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-accent mb-3">
            {synthesis.title}
          </p>
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw]}
            components={newsBodyComponents}
          >
            {synthesis.body}
          </ReactMarkdown>
        </div>
      )}

      {/* Ligne de provenance */}
      <div className="mt-10 pt-6 border-t border-navy/10 flex items-center gap-2 text-[11px] text-navy/35 font-mono">
        <Newspaper size={12} strokeWidth={2} aria-hidden="true" />
        <span>
          Veille générée avec Perplexity + Claude
          {sourceCount > 0 && ` · ${sourceCount} source${sourceCount > 1 ? 's' : ''}`}
        </span>
      </div>
    </article>
  )
}
