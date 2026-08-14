import assert from 'node:assert/strict'
import test from 'node:test'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { createServer } from 'vite'

const vite = await createServer({
  appType: 'custom',
  optimizeDeps: { noDiscovery: true },
  server: { middlewareMode: true, hmr: false },
})
const { default: PromptContent } = await vite.ssrLoadModule('/src/components/resources/PromptContent.jsx')

test.after(async () => vite.close())

const labels = {
  'resourcesAi.prompt.customize': 'Personnaliser',
  'resourcesAi.prompt.closeCustomization': 'Fermer',
  'resourcesAi.prompt.fallbackTitle': 'Prompt',
  'resourcesAi.prompt.eyebrow': 'Ressources IA · Prompt',
  'resourcesAi.prompt.contexts': 'Contextes',
  'resourcesAi.prompt.contextsLabel': 'Contextes disponibles',
  'resourcesAi.prompt.mainPrompt': 'Prompt',
  'resourcesAi.prompt.missingPrompt': 'Contenu indisponible',
  'resourcesAi.prompt.copyPrompt': 'Copier le prompt',
  'resourcesAi.prompt.promptCopied': 'Prompt copié',
  'resourcesAi.prompt.customizableCount_one': '{{count}} élément à personnaliser',
  'resourcesAi.prompt.customizableCount_other': '{{count}} éléments à personnaliser',
  'resourcesAi.prompt.manualCopyPrompt': 'Copie manuelle',
  'resourcesAi.prompt.manualCopyPromptLabel': 'Prompt manuel',
  'resourcesAi.prompt.thumbnailFallback': 'Fallback Prompt',
  'resourcesAi.prompt.whenToUse': 'Quand l’utiliser',
  'resourcesAi.prompt.variables': 'À personnaliser',
  'resourcesAi.prompt.exampleLabel': 'Exemple :',
  'resourcesAi.prompt.filledExample': 'Exemple rempli',
  'resourcesAi.prompt.tip': 'Conseil',
  'resourcesAi.prompt.quickTemplate': 'Version rapide',
  'resourcesAi.prompt.copyQuickTemplate': 'Copier la version rapide',
  'resourcesAi.prompt.quickTemplateCopied': 'Version rapide copiée',
  'resourcesAi.prompt.manualCopyQuickTemplate': 'Copie rapide manuelle',
  'resourcesAi.prompt.manualCopyQuickTemplateLabel': 'Version rapide manuelle',
  'resourcesAi.prompt.caution': 'Limite / précision',
}
const t = (key, options) => {
  const pluralKey = options?.count === 1 ? `${key}_one` : `${key}_other`
  const value = labels[pluralKey] || labels[key] || options?.defaultValue || key.split('.').at(-1)
  return value
    .replace('{{count}}', options?.count)
    .replace('{{filled}}', options?.filled)
    .replace('{{total}}', options?.total)
}

test('rend le HTML hostile comme texte brut sans élément ni handler exécutable', () => {
  const hostile = `<script>alert('test')</script>\n<img src=x onerror=alert('test')>\n<b>gras?</b>\n- [KEY]\n< > &`
  const html = render({ title: 'Sécurité', promptTemplate: hostile })
  assert.doesNotMatch(html, /<script|<img src=x|<b>gras/)
  assert.match(html, /&lt;script&gt;alert/)
  assert.match(html, /&lt;img src=x onerror=/)
  assert.match(html, /&lt;b&gt;gras\?&lt;\/b&gt;/)
  assert.match(html, /- <\/span><span>\[KEY\]/)
  assert.match(html, /&lt; &gt; &amp;/)
  assert.match(html, /whitespace-pre-wrap/)
})

test('affiche sections complètes, ordre des variables et exemple non récursif complet', () => {
  const html = render({
    title: 'Comparer', summary: 'Résumé', category: 'decide', level: 'beginner', contexts: ['work', 'daily_life'],
    whenToUse: 'Pour choisir.', promptTemplate: '[A]\ncontre\n[B]',
    variables: [
      { key: 'A', label: 'Première', description: 'Description A', example: '[B]' },
      { key: 'B', label: 'Seconde', example: 'Train\nexpress' },
    ],
    tip: 'Conseil utile', quickTemplate: 'Choisis [A] ou [B]', caution: 'Vérifier',
  }, 'https://storage.example/thumbnail.webp')
  for (const text of ['Comparer', 'Résumé', 'Pour choisir.', 'À personnaliser', 'Première', 'Seconde', 'Exemple rempli', 'Conseil utile', 'Version rapide', 'Limite / précision']) assert.match(html, new RegExp(text))
  assert.ok(html.indexOf('Première') < html.indexOf('Seconde'))
  assert.match(html, /\[B\][\s\S]*contre[\s\S]*Train/)
  assert.match(html, /https:\/\/storage\.example\/thumbnail\.webp/)
  assert.ok(html.indexOf('Quand l’utiliser') < html.indexOf('id="prompt-main-title"'))
  assert.match(html, /2 éléments à personnaliser/)
  assert.match(html, /data-prompt-placeholder="A"/)
  assert.match(html, /data-prompt-placeholder="B"/)
  assert.match(html, /<strong>\[B\]<\/strong>/)
  assert.match(html, /<strong>Train\nexpress<\/strong>/)
})

test('masque toutes les sections facultatives et montre le fallback sans valeurs visibles invalides', () => {
  const html = render({ promptTemplate: 'Prompt minimal', variables: [], contexts: [], category: 'unknown', level: 'unknown' })
  for (const absent of ['À personnaliser', 'Quand l’utiliser', 'Exemple rempli', 'Conseil', 'Version rapide', 'Limite / précision', 'undefined', '>null<']) assert.doesNotMatch(html, new RegExp(absent))
  assert.match(html, />Prompt</)
  assert.match(html, /Fallback Prompt/)
  assert.match(html, /Copier le prompt/)
  assert.doesNotMatch(html, /élément à personnaliser/)
})

test('ne met pas en évidence un crochet inconnu et compte une variable répétée une seule fois', () => {
  const html = render({
    promptTemplate: 'Explique [SUJET] à [PUBLIC], puis reformule [SUJET].',
    variables: [{ key: 'SUJET', label: 'Sujet' }],
  })
  assert.match(html, /1 élément à personnaliser/)
  assert.equal((html.match(/data-prompt-placeholder="SUJET"/g) || []).length, 2)
  assert.doesNotMatch(html, /data-prompt-placeholder="PUBLIC"/)
  assert.match(html, /\[PUBLIC\]/)
})

test('masque un exemple incomplet et conserve les variables sans description ou exemple', () => {
  const html = render({
    promptTemplate: 'Comparer [A] et [B]',
    variables: [{ key: 'A', label: 'Option A', example: 'Train' }, { key: 'B', label: 'Option B' }],
  })
  assert.match(html, /Option A/)
  assert.match(html, /Option B/)
  assert.doesNotMatch(html, /Exemple rempli/)
})

test('met en gras seulement les valeurs injectées dans l’exemple rempli', () => {
  const html = render({
    promptTemplate: 'Valeur naturelle.\n[TEXTE]\nContexte : [CONTEXTE]\nRappel : [TEXTE]',
    variables: [
      { key: 'TEXTE', example: 'Valeur naturelle.' },
      { key: 'CONTEXTE', example: '- coût\n- flexibilité' },
    ],
  })
  assert.match(html, /<span>Valeur naturelle\.\n<\/span><strong>Valeur naturelle\.<\/strong>/)
  assert.equal((html.match(/<strong>Valeur naturelle\.<\/strong>/g) || []).length, 2)
  assert.match(html, /<strong>- coût\n- flexibilité<\/strong>/)
})

test('échappe le HTML d’une valeur injectée au lieu de l’interpréter', () => {
  const html = render({
    promptTemplate: 'Analyse [TEXTE].',
    variables: [{ key: 'TEXTE', example: '<script>alert("x")</script>' }],
  })
  assert.match(html, /<strong>&lt;script&gt;alert\(&quot;x&quot;\)&lt;\/script&gt;<\/strong>/)
  assert.doesNotMatch(html, /<strong><script>/)
})

test('un prompt absent n’offre aucun bouton de copie actif', () => {
  const html = render({ promptTemplate: '   ' })
  assert.match(html, /Contenu indisponible/)
  assert.doesNotMatch(html, /<button/)
})

test('offre la personnalisation seulement sur la page publique et garde les champs initialement masqués', () => {
  const prompt = {
    promptTemplate: 'Explique [SUJET], puis répète [SUJET].',
    variables: [
      { key: 'SUJET', label: 'Sujet', example: 'Les embeddings' },
      { key: 'INUTILE', label: 'Inutile', example: 'Non utilisée' },
    ],
  }
  const publicHtml = render(prompt, null, true)
  const previewHtml = render(prompt)

  assert.match(publicHtml, />Personnaliser</)
  assert.match(publicHtml, /aria-expanded="false"/)
  assert.doesNotMatch(publicHtml, /<textarea/)
  assert.equal((publicHtml.match(/data-prompt-placeholder="SUJET"/g) || []).length, 2)
  assert.doesNotMatch(previewHtml, />Personnaliser</)
})

function render(prompt, thumbnailUrl = null, allowCustomization = false) {
  return renderToStaticMarkup(React.createElement(PromptContent, { allowCustomization, prompt, thumbnailUrl, t }))
}
