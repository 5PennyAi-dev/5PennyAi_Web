import { createElement } from 'react'
import { BookOpenText, Images, Layers3, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Card from '@/components/ui/Card'

const ITEMS = [
  {
    key: 'infographics',
    to: '/admin/ressources-ia/infographies',
    icon: Images,
    labelKey: 'admin.resourcesAi.infographics.navLabel',
  },
  {
    key: 'articles',
    to: '/admin/ressources-ia/articles',
    icon: BookOpenText,
    labelKey: 'admin.resourcesAi.articles.navLabel',
  },
  {
    key: 'prompts',
    to: '/admin/ressources-ia/prompts',
    icon: Sparkles,
    labelKey: 'admin.resourcesAi.prompts.navLabel',
  },
  {
    key: 'series',
    to: '/admin/ressources-ia/series',
    icon: Layers3,
    labelKey: 'admin.resourcesAi.series.navLabel',
  },
]

export default function AdminResourcesNav({ active }) {
  const { t } = useTranslation()

  return (
    <Card className="p-4 sm:p-5 lg:sticky lg:top-24">
      <nav aria-label={t('admin.resourcesAi.navigationLabel')}>
        <p className="px-3 pb-2 text-[11px] font-bold uppercase tracking-[0.14em] text-navy/45">
          {t('admin.resourcesAi.group')}
        </p>
        <div className="space-y-1.5">
          {ITEMS.map(({ key, to, icon, labelKey }) => {
            const selected = active === key
            return (
              <Link
                key={key}
                to={to}
                aria-current={selected ? 'page' : undefined}
                className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 text-sm font-semibold transition-colors ${
                  selected
                    ? 'border-accent/25 bg-accent/10 text-navy'
                    : 'border-transparent text-navy/70 hover:border-gray-200 hover:bg-surface hover:text-navy'
                }`}
              >
                {createElement(icon, {
                  size: 17,
                  strokeWidth: 1.9,
                  className: selected ? 'text-accent' : 'text-steel',
                  'aria-hidden': 'true',
                })}
                {t(labelKey)}
              </Link>
            )
          })}
        </div>
      </nav>
    </Card>
  )
}
