import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { ChevronDown } from 'lucide-react'

const OPTIONS = ['newest', 'oldest', 'readingTime']

export default function SortSelect({ value, onChange }) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  useEffect(() => {
    if (!open) return
    const handler = (e) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open])

  const label = (key) => t(`blog.sort.${key}`)

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex items-center gap-1.5 rounded-full border border-navy/15 px-3.5 py-1.5
                   text-[12px] font-medium text-navy/60 hover:text-navy hover:border-navy/35
                   transition-colors bg-white"
      >
        <span>{label(value)}</span>
        <ChevronDown
          size={14}
          className={`text-navy/40 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute right-0 top-full mt-1.5 min-w-[160px] rounded-xl border border-navy/10
                     bg-white shadow-lg py-1 z-20"
        >
          {OPTIONS.map((opt) => (
            <button
              key={opt}
              type="button"
              role="option"
              aria-selected={value === opt}
              onClick={() => {
                onChange(opt)
                setOpen(false)
              }}
              className={`w-full text-left px-4 py-2 text-[13px] transition-colors
                ${value === opt
                  ? 'text-accent font-medium bg-accent/5'
                  : 'text-navy/70 hover:bg-surface hover:text-navy'
                }`}
            >
              {label(opt)}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
