export default function SectionHeader({ overline, title, subtitle, className = '' }) {
  return (
    <div className={`mb-14 md:mb-16 ${className}`}>
      {overline && (
        <div className="inline-flex items-center gap-2 bg-accent/[0.08] border border-accent/[0.18] rounded-full px-3.5 py-1 mb-5">
          <span className="w-1.5 h-1.5 rounded-full bg-accent" />
          <span className="text-accent uppercase tracking-[0.18em] text-[11px] font-bold">
            {overline}
          </span>
        </div>
      )}
      <h2 className="text-display text-[2rem] md:text-[2.75rem] lg:text-[3.25rem] font-bold text-navy max-w-3xl mx-auto">
        {title}
      </h2>
      {subtitle && (
        <p className="text-muted text-base md:text-[17px] leading-relaxed mt-5 max-w-2xl mx-auto">
          {subtitle}
        </p>
      )}
    </div>
  )
}
