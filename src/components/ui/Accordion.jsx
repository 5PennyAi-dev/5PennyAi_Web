import { useState } from 'react'
import { Plus } from 'lucide-react'

export default function Accordion({ items = [] }) {
  const [openIndex, setOpenIndex] = useState(null)

  const toggle = (index) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <div className="space-y-3">
      {items.map((item, index) => {
        const isOpen = openIndex === index
        return (
          <div
            key={index}
            className={`rounded-2xl border transition-all duration-300 ${
              isOpen
                ? 'border-accent/30 bg-white shadow-[var(--shadow-card-hover)]'
                : 'border-navy/[0.08] bg-white hover:border-navy/15 hover:shadow-[var(--shadow-card)]'
            }`}
          >
            <button
              onClick={() => toggle(index)}
              aria-expanded={isOpen}
              className="w-full flex items-center justify-between gap-6 p-5 md:p-6 text-left text-navy"
            >
              <span className="font-heading font-semibold text-[15px] md:text-[16px] leading-snug tracking-tight">
                {item.question}
              </span>
              <span
                className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isOpen ? 'bg-accent text-white rotate-45 shadow-[0_2px_8px_rgba(221,135,55,0.35)]' : 'bg-navy/[0.06] text-navy/55'
                }`}
              >
                <Plus size={15} strokeWidth={2.5} />
              </span>
            </button>
            <div
              className={`grid transition-all duration-400 ease-out ${
                isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
              }`}
            >
              <div className="overflow-hidden">
                <p className="px-5 md:px-6 pb-5 md:pb-6 text-muted text-[14px] md:text-[15px] leading-relaxed">
                  {item.answer}
                </p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
