import { useTranslation } from 'react-i18next'
import { FileText, Newspaper, ClipboardList, BarChart2 } from 'lucide-react'
import { FORMATS } from '@/lib/contentFormats'

const ICONS = { FileText, Newspaper, ClipboardList, BarChart2 }

export default function FormatSelector({ value, onChange }) {
  const { t } = useTranslation()

  return (
    <div className="grid grid-cols-2 gap-2">
      {FORMATS.map((fmt) => {
        const Icon = ICONS[fmt.iconName]
        const isActive = value === fmt.id
        return (
          <button
            key={fmt.id}
            type="button"
            onClick={() => onChange(fmt.id, fmt.defaultArticleType)}
            className={`flex flex-col items-start gap-1.5 rounded-xl border p-3 text-left transition-all
              ${isActive
                ? 'border-accent bg-accent/5 text-accent'
                : 'border-navy/10 bg-white text-navy/60 hover:border-navy/25 hover:text-navy'
              }`}
          >
            {Icon && <Icon size={16} strokeWidth={2} className="shrink-0" />}
            <span className="text-[12px] font-mono font-medium leading-none">
              {t('admin.studio.formats.' + fmt.id)}
            </span>
          </button>
        )
      })}
    </div>
  )
}
