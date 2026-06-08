// Single source of truth for content formats and article types.
// Imported by both src/ (front-end) and api/ (serverless) via relative paths.

export const DEFAULT_FORMAT = 'article'
export const DEFAULT_ARTICLE_TYPE = 'explainer'

export const ARTICLE_TYPES = [
  'explainer',
  'cheatsheet',
  'news',
  'comparison',
  'tutorial',
  'mythbusting',
  'glossary',
  'list',
]

// Labels for each article type (used by the API prompt and by the admin UI).
export const ARTICLE_TYPE_LABELS = {
  explainer:   { fr: 'Vulgarisation',         en: 'Explainer' },
  cheatsheet:  { fr: 'Aide-mémoire',          en: 'Cheat sheet' },
  news:        { fr: 'Actualité IA',          en: 'AI news' },
  comparison:  { fr: "Comparaison d'outils",  en: 'Tool comparison' },
  tutorial:    { fr: 'Tutoriel pratique',      en: 'Tutorial' },
  mythbusting: { fr: 'Démystification',        en: 'Myth busting' },
  glossary:    { fr: 'Définition',             en: 'Glossary' },
  list:        { fr: 'Liste utile',            en: 'Useful list' },
}

// Format definitions — used by badge UI (steps 0.2+) and normalisation logic.
export const FORMATS = [
  {
    id: 'article',
    i18nKey: 'format.article',
    badgeColor: 'bg-navy/10 text-navy',
    iconName: 'FileText',
    defaultArticleType: 'explainer',
  },
  {
    id: 'news',
    i18nKey: 'format.news',
    badgeColor: 'bg-steel/20 text-steel-dark',
    iconName: 'Newspaper',
    defaultArticleType: 'news',
  },
  {
    id: 'cheatsheet',
    i18nKey: 'format.cheatsheet',
    badgeColor: 'bg-teal-100 text-teal-700',
    iconName: 'ClipboardList',
    defaultArticleType: 'cheatsheet',
  },
  {
    id: 'infographic',
    i18nKey: 'format.infographic',
    badgeColor: 'bg-violet-100 text-violet-700',
    iconName: 'BarChart2',
    defaultArticleType: null,
  },
]

const LEGACY_TYPE_MAP = {
  caseStudy: 'explainer',
  myth: 'mythbusting',
}

const LABEL_TYPE_MAP = {
  'Liste (X façons de...)': 'list',
  'Guide pratique': 'tutorial',
  'Comparaison': 'comparison',
  'Étude de cas': 'explainer',
  'Opinion / Éditorial': 'news',
  'Tutoriel pas-à-pas': 'tutorial',
}

/**
 * Consolidates normalizeArticleType (api/generate-article.js) and
 * mapArticleType (ArticleGenerator.jsx) into a single function.
 *
 * Handles: null/empty → default, legacy codes, already-valid codes,
 * French label map, fuzzy substring matching.
 */
export function normalizeType(input) {
  if (!input) return DEFAULT_ARTICLE_TYPE

  if (ARTICLE_TYPES.includes(input)) return input

  if (LEGACY_TYPE_MAP[input]) return LEGACY_TYPE_MAP[input]

  if (LABEL_TYPE_MAP[input]) return LABEL_TYPE_MAP[input]

  const n = String(input).toLowerCase()
  if (n.includes('cheat') || n.includes('aide-mém')) return 'cheatsheet'
  if (n.includes('compar')) return 'comparison'
  if (n.includes('tutoriel') || n.includes('tutorial') || n.includes('guide')) return 'tutorial'
  if (n.includes('démystif') || n.includes('myth')) return 'mythbusting'
  if (n.includes('glossair') || n.includes('définition') || n.includes('glossary')) return 'glossary'
  if (n.includes('actualité') || n.includes('news') || n.includes('opinion')) return 'news'
  if (n.includes('liste') || n.includes('list')) return 'list'

  return DEFAULT_ARTICLE_TYPE
}
