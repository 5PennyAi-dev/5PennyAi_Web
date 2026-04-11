export const inputClass =
  'w-full rounded-xl border border-navy/15 bg-white px-4 py-2.5 text-[14px] text-navy placeholder:text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition-colors'

export function Section({ title, children }) {
  return (
    <div className="space-y-5">
      <h2 className="font-heading font-bold text-navy text-[13px] uppercase tracking-[0.14em]">
        {title}
      </h2>
      {children}
    </div>
  )
}

export function Field({ label, children, hint, error, required }) {
  return (
    <label className="block">
      <span className="block text-[11px] font-bold uppercase tracking-[0.12em] text-navy/60 mb-1.5">
        {label}
        {required && <span className="text-accent ml-1">*</span>}
      </span>
      {children}
      {error ? (
        <span className="block text-[12px] text-accent-deep mt-1">{error}</span>
      ) : hint ? (
        <span className="block text-[12px] text-muted mt-1">{hint}</span>
      ) : null}
    </label>
  )
}
