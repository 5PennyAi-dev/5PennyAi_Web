import { useTranslation } from 'react-i18next'
import SectionHeader from '@/components/ui/SectionHeader'
import Accordion from '@/components/ui/Accordion'
import useScrollReveal from '@/hooks/useScrollReveal'

export default function FAQ() {
  const { t } = useTranslation()
  const ref = useScrollReveal()

  const items = t('faq.items', { returnObjects: true }) || []

  return (
    <section id="faq" ref={ref} className="reveal py-24 md:py-32">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <SectionHeader
          overline={t('faq.overline')}
          title={t('faq.title')}
          className="text-center"
        />
        <Accordion items={items} />
      </div>
    </section>
  )
}
