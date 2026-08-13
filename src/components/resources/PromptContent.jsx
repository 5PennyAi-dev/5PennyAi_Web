import { Check, Copy, Sparkles } from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'
import { copyText } from '@/lib/clipboard'
import {
  isPromptCategory,
  isPromptContext,
  isPromptLevel,
} from '@/lib/promptTaxonomies'
import { buildPromptExample, extractPromptPlaceholders } from '@/lib/promptVariables'

const COPY_SUCCESS_DURATION = 2500

export default function PromptContent({ headingLevel = 1, prompt, shareActions, thumbnailUrl, t }) {
  const title = cleanText(prompt?.title) || t('resourcesAi.prompt.fallbackTitle')
  const category = isPromptCategory(prompt?.category) ? prompt.category : ''
  const level = isPromptLevel(prompt?.level) ? prompt.level : ''
  const contexts = array(prompt?.contexts).filter(isPromptContext)
  const variables = array(prompt?.variables).filter(hasVariableContent)
  const template = cleanTextPreservingWhitespace(prompt?.promptTemplate)
  const example = buildPromptExample(template, variables)
  const showExample = template && extractPromptPlaceholders(template).length > 0 && example.complete
  const Heading = `h${Math.min(6, Math.max(1, headingLevel))}`

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
        </header>

        <div className="order-3 overflow-hidden rounded-2xl border border-navy/10 bg-surface lg:order-2 lg:row-span-2">
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

        <section className="order-2 min-w-0 lg:order-3" aria-labelledby="prompt-main-title">
          <h2 id="prompt-main-title" className="font-heading text-2xl font-bold text-navy">
            {t('resourcesAi.prompt.mainPrompt')}
          </h2>
          {template ? (
            <CopyableText
              buttonLabel={t('resourcesAi.prompt.copyPrompt')}
              copiedLabel={t('resourcesAi.prompt.promptCopied')}
              manualLabel={t('resourcesAi.prompt.manualCopyPrompt')}
              manualFieldLabel={t('resourcesAi.prompt.manualCopyPromptLabel')}
              text={template}
            />
          ) : (
            <p className="mt-3 rounded-xl border border-navy/10 bg-white p-4 text-sm text-muted">
              {t('resourcesAi.prompt.missingPrompt')}
            </p>
          )}
          {shareActions}
        </section>
      </div>

      <div className="mt-10 space-y-9">
        {cleanText(prompt?.whenToUse) && (
          <Section title={t('resourcesAi.prompt.whenToUse')}><PlainText>{prompt.whenToUse}</PlainText></Section>
        )}

        {variables.length > 0 && (
          <Section title={t('resourcesAi.prompt.variables')}>
            <div className="grid gap-4 sm:grid-cols-2">
              {variables.map((variable, index) => (
                <div key={`${variable.key || 'variable'}-${index}`} className="rounded-2xl border border-navy/10 bg-white p-5">
                  {cleanText(variable.key) && <p className="font-mono text-sm font-bold text-accent-deep">[{variable.key}]</p>}
                  {cleanText(variable.label) && <h3 className="mt-2 font-semibold text-navy">{variable.label}</h3>}
                  {cleanText(variable.description) && <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-muted">{variable.description}</p>}
                  {cleanTextPreservingWhitespace(variable.example) && (
                    <p className="mt-3 whitespace-pre-wrap text-sm text-navy/70">
                      <span className="font-semibold">{t('resourcesAi.prompt.exampleLabel')}</span> {variable.example}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </Section>
        )}

        {showExample && (
          <Section title={t('resourcesAi.prompt.filledExample')}>
            <RawText>{example.text}</RawText>
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

export function CopyableText({ buttonLabel, copiedLabel, manualFieldLabel, manualLabel, text }) {
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

  return (
    <div className="mt-3 min-w-0">
      <RawText>{text}</RawText>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex min-h-11 items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white hover:bg-accent-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-deep"
        >
          {state === 'copied' ? <Check size={16} aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />}
          {state === 'copied' ? copiedLabel : buttonLabel}
        </button>
        <span className="min-h-5 text-sm text-navy/70" role="status" aria-live="polite">
          {state === 'copied' ? copiedLabel : state === 'manual' ? manualLabel : ''}
        </span>
      </div>
      {state === 'manual' && (
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
      )}
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
