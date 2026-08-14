import { Check, Copy, Sparkles } from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'
import { copyText } from '@/lib/clipboard'
import { scrollPromptSectionIntoView } from '@/lib/promptCustomization'
import {
  isPromptCategory,
  isPromptContext,
  isPromptLevel,
} from '@/lib/promptTaxonomies'
import {
  buildCustomizedPromptSegments,
  buildPromptExampleSegments,
  extractPromptPlaceholders,
  getUsedPromptVariableKeys,
  splitPromptTemplateForDisplay,
} from '@/lib/promptVariables'

const COPY_SUCCESS_DURATION = 2500

export default function PromptContent({ allowCustomization = false, headingLevel = 1, prompt, shareActions, thumbnailUrl, t }) {
  const [isCustomizing, setIsCustomizing] = useState(false)
  const [customValues, setCustomValues] = useState({})
  const customizationId = useId()
  const customizationSectionRef = useRef(null)
  const customizedPreviewRef = useRef(null)
  const title = cleanText(prompt?.title) || t('resourcesAi.prompt.fallbackTitle')
  const category = isPromptCategory(prompt?.category) ? prompt.category : ''
  const level = isPromptLevel(prompt?.level) ? prompt.level : ''
  const contexts = array(prompt?.contexts).filter(isPromptContext)
  const variables = array(prompt?.variables).filter(hasVariableContent)
  const template = cleanTextPreservingWhitespace(prompt?.promptTemplate)
  const usedVariableKeys = getUsedPromptVariableKeys(template, variables)
  const firstVariableByKey = new Map()
  variables.forEach((variable) => {
    if (!firstVariableByKey.has(variable.key)) firstVariableByKey.set(variable.key, variable)
  })
  const applicableVariables = usedVariableKeys.map((key) => firstVariableByKey.get(key)).filter(Boolean)
  const customizationAvailable = allowCustomization && applicableVariables.length > 0
  const filledCount = usedVariableKeys.filter((key) => typeof customValues[key] === 'string' && customValues[key].trim()).length
  const customizedPrompt = buildCustomizedPromptSegments(template, customValues, usedVariableKeys)
  const example = buildPromptExampleSegments(template, variables)
  const showExample = template && extractPromptPlaceholders(template).length > 0 && example.complete
  const Heading = `h${Math.min(6, Math.max(1, headingLevel))}`
  const handleOpenCustomization = () => setIsCustomizing(true)
  const handleCloseCustomization = () => setIsCustomizing(false)

  useEffect(() => {
    if (!isCustomizing) return undefined
    const frame = window.requestAnimationFrame(() => {
      const section = customizationSectionRef.current
      if (!section) return
      scrollPromptSectionIntoView(section, { focus: true })
    })
    return () => window.cancelAnimationFrame(frame)
  }, [isCustomizing])

  return (
    <article className="mx-auto max-w-6xl">
      <div className="grid gap-7 lg:grid-cols-[minmax(0,1fr)_minmax(280px,420px)] lg:items-start lg:gap-10">
        <header className="order-1 min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-accent">
            {t('resourcesAi.prompt.eyebrow')}
          </p>
          <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold text-navy/70">
            {category && <Tag>{taxonomyLabel(t, 'categories', category)}</Tag>}
            {level && <Tag>{taxonomyLabel(t, 'levels', level)}</Tag>}
          </div>
          <Heading className="mt-4 font-heading text-3xl font-bold leading-tight text-navy sm:text-4xl lg:text-5xl">
            {title}
          </Heading>
          {cleanText(prompt?.summary) && (
            <p className="mt-4 max-w-3xl text-base leading-7 text-muted sm:text-lg">{prompt.summary}</p>
          )}
          {contexts.length > 0 && (
            <div className="mt-5" aria-label={t('resourcesAi.prompt.contextsLabel')}>
              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-navy/55">
                {t('resourcesAi.prompt.contexts')}
              </p>
              <div className="flex flex-wrap gap-2">
                {contexts.map((context) => <Tag key={context}>{taxonomyLabel(t, 'contexts', context)}</Tag>)}
              </div>
            </div>
          )}
          {shareActions}
        </header>

        <div className="order-3 overflow-hidden rounded-2xl border border-navy/10 bg-surface lg:order-2">
          <div className="aspect-video">
            {thumbnailUrl ? (
              <img
                src={thumbnailUrl}
                alt={cleanText(prompt?.thumbnailAltText)}
                className="h-full w-full object-contain"
              />
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-3 bg-gradient-to-br from-lavender/45 via-white to-steel/20 text-navy/55">
                <Sparkles size={38} strokeWidth={1.5} aria-hidden="true" />
                <span className="text-sm font-bold">{t('resourcesAi.prompt.thumbnailFallback')}</span>
              </div>
            )}
          </div>
        </div>

        <section className="order-2 min-w-0 lg:order-3 lg:col-span-2" aria-labelledby="prompt-main-title">
          {cleanText(prompt?.whenToUse) && (
            <div className="mb-6">
              <h2 className="font-heading text-2xl font-bold text-navy">
                {t('resourcesAi.prompt.whenToUse')}
              </h2>
              <div className="mt-3"><PlainText>{prompt.whenToUse}</PlainText></div>
            </div>
          )}
          {template ? (
            <CopyableText
              buttonLabel={t('resourcesAi.prompt.copyPrompt')}
              copiedLabel={t('resourcesAi.prompt.promptCopied')}
              heading={t('resourcesAi.prompt.mainPrompt')}
              highlightedKeys={usedVariableKeys}
              manualLabel={t('resourcesAi.prompt.manualCopyPrompt')}
              manualFieldLabel={t('resourcesAi.prompt.manualCopyPromptLabel')}
              meta={usedVariableKeys.length > 0
                ? isCustomizing
                  ? t('resourcesAi.prompt.customizationProgress', { count: filledCount, filled: filledCount, total: usedVariableKeys.length })
                  : t('resourcesAi.prompt.customizableCount', { count: usedVariableKeys.length })
                : ''}
              headerAction={customizationAvailable ? (
                <button
                  type="button"
                  aria-controls={customizationId}
                  aria-expanded={isCustomizing}
                  onClick={isCustomizing ? handleCloseCustomization : handleOpenCustomization}
                  className="inline-flex min-h-11 w-full items-center justify-center rounded-full border border-navy/20 bg-white px-5 py-2.5 text-sm font-semibold text-navy hover:border-accent/50 hover:text-accent-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-deep sm:w-auto"
                >
                  {isCustomizing ? t('resourcesAi.prompt.closeCustomization') : t('resourcesAi.prompt.customize')}
                </button>
              ) : null}
              primary
              text={template}
            />
          ) : (
            <div>
              <h2 id="prompt-main-title" className="font-heading text-2xl font-bold text-navy">
                {t('resourcesAi.prompt.mainPrompt')}
              </h2>
              <p className="mt-3 rounded-xl border border-navy/10 bg-white p-4 text-sm text-muted">
                {t('resourcesAi.prompt.missingPrompt')}
              </p>
            </div>
          )}
        </section>
      </div>

      <div className="mt-10 space-y-9">
        {isCustomizing && customizationAvailable ? (
          <div
            id={customizationId}
            ref={customizationSectionRef}
            tabIndex="-1"
            aria-labelledby={`${customizationId}-title`}
            className="scroll-mt-24 outline-none lg:grid lg:grid-cols-2 lg:items-start lg:gap-8"
          >
            <section>
              <h2 id={`${customizationId}-title`} className="font-heading text-2xl font-bold text-navy">
                {t('resourcesAi.prompt.customizationActiveTitle')}
              </h2>
              <p className="mt-3 leading-7 text-navy/80">{t('resourcesAi.prompt.customizationInstruction')}</p>
              <p id={`${customizationId}-privacy`} className="mt-2 text-sm leading-6 text-navy/65">
                {t('resourcesAi.prompt.customizationPrivacy')}
              </p>
              <p className="mt-3 text-sm font-semibold text-navy/70" aria-live="polite">
                {t('resourcesAi.prompt.customizationProgress', { count: filledCount, filled: filledCount, total: usedVariableKeys.length })}
              </p>
              <div className="mt-4">
                <PromptVariableCards
                  customValues={customValues}
                  customizationId={customizationId}
                  isCustomizing
                  onChange={setCustomValues}
                  t={t}
                  variables={applicableVariables}
                />
              </div>
              <button
                type="button"
                aria-controls={`${customizationId}-preview`}
                onClick={() => scrollPromptSectionIntoView(customizedPreviewRef.current, { focus: true })}
                className="mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-full border border-navy/20 bg-white px-5 py-2.5 text-sm font-semibold text-navy hover:border-accent/50 hover:text-accent-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-deep lg:hidden"
              >
                {t('resourcesAi.prompt.viewCustomizedPrompt')} ↓
              </button>
            </section>

            <section
              id={`${customizationId}-preview`}
              ref={customizedPreviewRef}
              tabIndex="-1"
              aria-labelledby={`${customizationId}-preview-title`}
              className="mt-9 scroll-mt-24 outline-none lg:sticky lg:top-24 lg:mt-0 lg:self-start"
            >
              <h2 id={`${customizationId}-preview-title`} className="font-heading text-2xl font-bold text-navy">
                {t('resourcesAi.prompt.customizedPrompt')}
              </h2>
              <CopyableText
                buttonLabel={t('resourcesAi.prompt.copyCustomizedPrompt')}
                copiedLabel={t('resourcesAi.prompt.customizedPromptCopied')}
                manualLabel={t('resourcesAi.prompt.manualCopyCustomizedPrompt')}
                manualFieldLabel={t('resourcesAi.prompt.manualCopyCustomizedPromptLabel')}
                renderedText={<PromptSegments segments={customizedPrompt.segments} />}
                responsiveActions
                secondaryAction={(
                  <>
                    <button
                      type="button"
                      onClick={() => setCustomValues({})}
                      className="inline-flex min-h-11 w-full items-center justify-center rounded-full border border-navy/20 bg-white px-5 py-2.5 text-sm font-semibold text-navy hover:border-accent/50 hover:text-accent-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-deep sm:w-auto"
                    >
                      {t('resourcesAi.prompt.resetCustomization')}
                    </button>
                    <button
                      type="button"
                      onClick={handleCloseCustomization}
                      className="inline-flex min-h-11 w-full items-center justify-center rounded-full border border-navy/20 bg-white px-5 py-2.5 text-sm font-semibold text-navy hover:border-accent/50 hover:text-accent-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-deep sm:w-auto"
                    >
                      {t('resourcesAi.prompt.closeCustomization')}
                    </button>
                  </>
                )}
                text={customizedPrompt.text}
              />
            </section>
          </div>
        ) : variables.length > 0 && (
          <Section title={t('resourcesAi.prompt.variables')}>
            <PromptVariableCards customizationId={customizationId} t={t} variables={variables} />
          </Section>
        )}

        {!isCustomizing && showExample && (
          <Section title={t('resourcesAi.prompt.filledExample')}>
            <RawText><PromptSegments segments={example.segments} /></RawText>
          </Section>
        )}

        {cleanText(prompt?.tip) && (
          <Section title={t('resourcesAi.prompt.tip')}>
            <div className="rounded-2xl border border-steel/30 bg-steel/10 p-5"><PlainText>{prompt.tip}</PlainText></div>
          </Section>
        )}

        {cleanTextPreservingWhitespace(prompt?.quickTemplate) && (
          <Section title={t('resourcesAi.prompt.quickTemplate')}>
            <CopyableText
              buttonLabel={t('resourcesAi.prompt.copyQuickTemplate')}
              copiedLabel={t('resourcesAi.prompt.quickTemplateCopied')}
              manualLabel={t('resourcesAi.prompt.manualCopyQuickTemplate')}
              manualFieldLabel={t('resourcesAi.prompt.manualCopyQuickTemplateLabel')}
              text={prompt.quickTemplate}
            />
          </Section>
        )}

        {cleanText(prompt?.caution) && (
          <Section title={t('resourcesAi.prompt.caution')}>
            <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-5"><PlainText>{prompt.caution}</PlainText></div>
          </Section>
        )}
      </div>
    </article>
  )
}

function PromptVariableCards({ customValues = {}, customizationId, isCustomizing = false, onChange, t, variables }) {
  return (
    <div className={isCustomizing ? 'grid gap-4' : 'grid gap-4 sm:grid-cols-2'}>
      {variables.map((variable, index) => {
        const fieldId = `${customizationId}-field-${index}`
        const descriptionId = `${fieldId}-description`
        const exampleId = `${fieldId}-example`
        const describedBy = isCustomizing ? [
          cleanText(variable.description) ? descriptionId : '',
          cleanTextPreservingWhitespace(variable.example) ? exampleId : '',
          `${customizationId}-privacy`,
        ].filter(Boolean).join(' ') : ''

        return (
          <div key={`${variable.key || 'variable'}-${index}`} className="rounded-2xl border border-navy/10 bg-white p-5">
            {cleanText(variable.key) && <p className="font-mono text-sm font-bold text-accent-deep">[{variable.key}]</p>}
            {isCustomizing ? (
              <label htmlFor={fieldId} className="mt-2 block font-semibold text-navy">
                {cleanText(variable.label) || variable.key}
              </label>
            ) : cleanText(variable.label) ? <h3 className="mt-2 font-semibold text-navy">{variable.label}</h3> : null}
            {cleanText(variable.description) && (
              <p id={isCustomizing ? descriptionId : undefined} className="mt-2 whitespace-pre-wrap text-sm leading-6 text-muted">
                {variable.description}
              </p>
            )}
            {isCustomizing && (
              <textarea
                id={fieldId}
                aria-describedby={describedBy || undefined}
                rows={2}
                value={customValues[variable.key] || ''}
                onChange={(event) => onChange((values) => ({ ...values, [variable.key]: event.target.value }))}
                placeholder={t('resourcesAi.prompt.customValuePlaceholder')}
                className="mt-3 min-h-16 w-full resize-y rounded-xl border border-navy/20 bg-white px-3 py-2.5 text-base leading-6 text-navy placeholder:text-navy/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-deep"
              />
            )}
            {cleanTextPreservingWhitespace(variable.example) && (
              <p id={isCustomizing ? exampleId : undefined} className={`${isCustomizing ? 'mt-2.5' : 'mt-3'} whitespace-pre-wrap text-sm text-navy/70`}>
                <span className="font-semibold">{t('resourcesAi.prompt.exampleLabel')}</span> {variable.example}
              </p>
            )}
          </div>
        )
      })}
    </div>
  )
}

export function CopyableText({
  buttonLabel,
  copiedLabel,
  heading,
  headerAction,
  highlightedKeys = [],
  manualFieldLabel,
  manualLabel,
  meta,
  primary = false,
  renderedText,
  responsiveActions = false,
  secondaryAction,
  text,
}) {
  const [state, setState] = useState('idle')
  const manualId = useId()
  const inputRef = useRef(null)
  const timerRef = useRef(null)

  useEffect(() => () => clearTimeout(timerRef.current), [])
  useEffect(() => {
    if (state !== 'manual') return
    inputRef.current?.focus()
    inputRef.current?.select()
  }, [state])

  const handleCopy = async () => {
    clearTimeout(timerRef.current)
    const succeeded = await copyText(text)
    if (!succeeded) {
      setState('manual')
      return
    }
    setState('copied')
    timerRef.current = setTimeout(() => setState('idle'), COPY_SUCCESS_DURATION)
  }

  const copyButton = (
    <button
      type="button"
      onClick={handleCopy}
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white hover:bg-accent-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-deep ${primary || responsiveActions ? 'w-full sm:w-auto' : ''}`}
    >
      {state === 'copied' ? <Check size={16} aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />}
      {state === 'copied' ? copiedLabel : buttonLabel}
    </button>
  )

  if (primary) return (
    <div className="min-w-0 overflow-hidden rounded-3xl border border-navy/20 bg-white shadow-[var(--shadow-card)]">
      <div className="flex flex-col gap-4 border-b border-navy/10 bg-navy/[0.025] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div>
          <h2 id="prompt-main-title" className="font-heading text-2xl font-bold text-navy">{heading}</h2>
          {meta && <p className="mt-1 text-sm font-semibold text-navy/60">{meta}</p>}
        </div>
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
          {headerAction}
          {copyButton}
        </div>
      </div>
      <div className="p-5 sm:p-6 lg:p-7">
        <PromptTemplateText highlightedKeys={highlightedKeys} text={text} />
        <span className="sr-only" role="status" aria-live="polite">
          {state === 'copied' ? copiedLabel : state === 'manual' ? manualLabel : ''}
        </span>
        {state === 'manual' && (
          <ManualCopyField inputRef={inputRef} manualFieldLabel={manualFieldLabel} manualId={manualId} text={text} />
        )}
      </div>
    </div>
  )

  return (
    <div className="mt-3 min-w-0">
      <RawText>{renderedText || text}</RawText>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        {copyButton}
        {secondaryAction}
        <span className="min-h-5 text-sm text-navy/70" role="status" aria-live="polite">
          {state === 'copied' ? copiedLabel : state === 'manual' ? manualLabel : ''}
        </span>
      </div>
      {state === 'manual' && (
        <ManualCopyField inputRef={inputRef} manualFieldLabel={manualFieldLabel} manualId={manualId} text={text} />
      )}
    </div>
  )
}

function PromptTemplateText({ highlightedKeys, text }) {
  return (
    <div className="whitespace-pre-wrap break-words font-mono text-[15px] leading-8 text-navy sm:text-base" tabIndex="0">
      {splitPromptTemplateForDisplay(text, highlightedKeys).map((part, index) => (
        part.highlighted ? (
          <span
            key={`${part.key}-${index}`}
            data-prompt-placeholder={part.key}
            className="rounded-md bg-orange-50 px-1 py-0.5 font-bold text-accent-deep ring-1 ring-inset ring-orange-200/80"
          >
            {part.text}
          </span>
        ) : <span key={`text-${index}`}>{part.text}</span>
      ))}
    </div>
  )
}

function PromptSegments({ segments }) {
  return segments.map((segment, index) => {
    if (segment.injected) return <strong key={`${segment.key}-${index}`}>{segment.text}</strong>
    if (segment.origin === 'placeholder') return (
      <span
        key={`${segment.key}-${index}`}
        data-prompt-placeholder={segment.key}
        className="rounded-md bg-orange-50 px-1 py-0.5 font-bold text-accent-deep ring-1 ring-inset ring-orange-200/80"
      >
        {segment.text}
      </span>
    )
    return <span key={`prompt-text-${index}`}>{segment.text}</span>
  })
}

function ManualCopyField({ inputRef, manualFieldLabel, manualId, text }) {
  return (
    <div className="mt-3">
      <label className="sr-only" htmlFor={manualId}>{manualFieldLabel}</label>
      <textarea
        id={manualId}
        ref={inputRef}
        readOnly
        rows={Math.min(12, Math.max(4, text.split('\n').length + 1))}
        value={text}
        onFocus={(event) => event.currentTarget.select()}
        className="w-full resize-y rounded-xl border border-navy/20 bg-white p-3 font-mono text-sm text-navy focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-deep"
      />
    </div>
  )
}

function Section({ children, title }) {
  return <section><h2 className="font-heading text-2xl font-bold text-navy">{title}</h2><div className="mt-3">{children}</div></section>
}

function RawText({ children }) {
  return <pre className="max-w-full overflow-x-auto whitespace-pre-wrap break-words rounded-2xl border border-navy/10 bg-navy/[0.045] p-4 font-mono text-sm leading-7 text-navy sm:p-5" tabIndex="0">{children}</pre>
}

function PlainText({ children }) {
  return <p className="whitespace-pre-wrap leading-7 text-navy/80">{children}</p>
}

function Tag({ children }) {
  return <span className="rounded-full bg-lavender/40 px-3 py-1.5">{children}</span>
}

function taxonomyLabel(t, group, value) {
  return t(`admin.resourcesAi.promptTaxonomies.${group}.${value}`, { defaultValue: value })
}

function hasVariableContent(variable) {
  return variable && typeof variable === 'object' && ['key', 'label', 'description', 'example'].some((key) => cleanTextPreservingWhitespace(variable[key]))
}

function array(value) {
  return Array.isArray(value) ? value : []
}

function cleanText(value) {
  return typeof value === 'string' ? value.trim() : ''
}

function cleanTextPreservingWhitespace(value) {
  return typeof value === 'string' && value.trim() ? value : ''
}
