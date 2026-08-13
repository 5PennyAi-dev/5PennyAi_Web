import PromptContent from '@/components/resources/PromptContent'

export default function PromptPreview({ form, thumbnailUrl, t }) {
  return (
    <div id="prompt-preview" className="rounded-2xl border border-navy/10 bg-white p-5 sm:p-7">
      <PromptContent
        headingLevel={2}
        prompt={{ ...form, thumbnailAltText: form.thumbnail?.altText || '' }}
        thumbnailUrl={thumbnailUrl}
        t={t}
      />
    </div>
  )
}
