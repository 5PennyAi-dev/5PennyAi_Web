export const markdownComponents = {
  h1: (props) => (
    <h1 className="font-heading font-bold text-navy text-3xl md:text-4xl mt-10 mb-5 tracking-tight" {...props} />
  ),
  h2: (props) => (
    <h2 className="font-heading font-bold text-navy text-2xl md:text-[1.75rem] mt-10 mb-4 tracking-tight" {...props} />
  ),
  h3: (props) => (
    <h3 className="font-heading font-semibold text-navy text-xl mt-8 mb-3 tracking-tight" {...props} />
  ),
  h4: (props) => (
    <h4 className="font-heading font-semibold text-navy text-lg mt-6 mb-2 tracking-tight" {...props} />
  ),
  p: (props) => (
    <p className="text-[15px] md:text-base text-navy/80 leading-[1.75] mb-5" {...props} />
  ),
  ul: (props) => (
    <ul className="list-disc pl-6 mb-5 space-y-2 text-[15px] md:text-base text-navy/80 leading-[1.75] marker:text-accent" {...props} />
  ),
  ol: (props) => (
    <ol className="list-decimal pl-6 mb-5 space-y-2 text-[15px] md:text-base text-navy/80 leading-[1.75] marker:text-accent" {...props} />
  ),
  li: (props) => <li className="pl-1" {...props} />,
  blockquote: (props) => (
    <blockquote
      className="border-l-4 border-accent pl-5 py-1 my-6 italic text-navy/70 bg-warm-gray/50 rounded-r-lg"
      {...props}
    />
  ),
  code: ({ inline, className, children, ...props }) => {
    if (inline) {
      return (
        <code
          className="bg-navy/[0.06] text-navy px-1.5 py-0.5 rounded text-[0.9em] font-mono"
          {...props}
        >
          {children}
        </code>
      )
    }
    return (
      <code className={`${className || ''} font-mono text-[0.9em]`} {...props}>
        {children}
      </code>
    )
  },
  pre: (props) => (
    <pre
      className="bg-navy-deep text-white/90 p-5 rounded-xl overflow-x-auto my-6 text-[13px] leading-relaxed font-mono shadow-[var(--shadow-dark-card)]"
      {...props}
    />
  ),
  img: ({ alt, src, ...props }) => (
    <button
      type="button"
      onClick={() =>
        window.dispatchEvent(
          new CustomEvent('lightbox:open', { detail: { src, alt: alt || '' } })
        )
      }
      className="my-8 block w-full rounded-xl bg-transparent border-0 p-0 cursor-zoom-in focus:outline-none focus:ring-2 focus:ring-accent/40 md:w-[calc(100%+80px)] md:max-w-[820px] md:-ml-[40px]"
      aria-label={alt || 'Open image'}
    >
      <img
        alt={alt || ''}
        src={src}
        className="rounded-xl w-full h-auto shadow-[var(--shadow-card)] hover:shadow-lg transition-shadow"
        {...props}
      />
    </button>
  ),
  a: (props) => (
    <a
      className="text-accent hover:text-accent-deep underline underline-offset-4 decoration-accent/40 hover:decoration-accent transition-colors"
      target={props.href?.startsWith('http') ? '_blank' : undefined}
      rel={props.href?.startsWith('http') ? 'noopener noreferrer' : undefined}
      {...props}
    />
  ),
  hr: () => <hr className="my-10 border-t border-navy/10" />,
  table: (props) => (
    <div className="my-6 overflow-x-auto rounded-xl border border-navy/10">
      <table className="w-full text-[14px] border-collapse" {...props} />
    </div>
  ),
  thead: (props) => <thead className="bg-warm-gray text-navy" {...props} />,
  th: (props) => <th className="text-left font-semibold px-4 py-2 border-b border-navy/10" {...props} />,
  td: (props) => <td className="px-4 py-2 border-b border-navy/5 text-navy/80" {...props} />,
  strong: (props) => <strong className="font-semibold text-navy" {...props} />,
  em: (props) => <em className="italic" {...props} />,
}
