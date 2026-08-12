import { createSeriesSlug } from './resourceSeries.js'

export const RESOURCE_TOPIC_GROUPS = Object.freeze([
  {
    key: 'ia-generative',
    label: 'IA générative',
    labelKey: 'resourcesAi.topics.iaGenerative',
    themeValues: ['IA générative', 'Utilisation de l’IA générative'],
  },
  {
    key: 'prompting',
    label: 'Prompting',
    labelKey: 'resourcesAi.topics.prompting',
    themeValues: ['Prompting', 'Prompt engineering'],
  },
])

const GROUPED_THEME_VALUES = new Set(
  RESOURCE_TOPIC_GROUPS.flatMap(({ themeValues }) => themeValues),
)

export function getAvailableResourceTopics(resources) {
  const themeCounts = new Map()

  for (const resource of Array.isArray(resources) ? resources : []) {
    const theme = cleanTheme(resource?.theme)
    if (theme) themeCounts.set(theme, (themeCounts.get(theme) || 0) + 1)
  }

  const groupedTopics = RESOURCE_TOPIC_GROUPS.flatMap((group) => {
    const count = group.themeValues.reduce((total, theme) => total + (themeCounts.get(theme) || 0), 0)
    return count > 0 ? [{ ...group, count }] : []
  })

  const directTopics = [...themeCounts]
    .filter(([theme]) => !GROUPED_THEME_VALUES.has(theme))
    .map(([theme, count]) => ({
      key: createSeriesSlug(theme),
      label: theme,
      themeValues: [theme],
      count,
    }))

  return [...groupedTopics, ...directTopics].sort((left, right) =>
    left.label.localeCompare(right.label, 'fr', { sensitivity: 'base' }),
  )
}

export function findResourceTopic(resources, topicKey) {
  if (typeof topicKey !== 'string' || !topicKey) return null
  return getAvailableResourceTopics(resources).find(({ key }) => key === topicKey) || null
}

export function matchesResourceTopic(resource, topicKey) {
  if (typeof topicKey !== 'string' || !topicKey) return true

  const theme = cleanTheme(resource?.theme)
  if (!theme) return false

  const groupedTopic = RESOURCE_TOPIC_GROUPS.find(({ key }) => key === topicKey)
  return groupedTopic
    ? groupedTopic.themeValues.includes(theme)
    : createSeriesSlug(theme) === topicKey && !GROUPED_THEME_VALUES.has(theme)
}

function cleanTheme(value) {
  return typeof value === 'string' ? value.trim() : ''
}
