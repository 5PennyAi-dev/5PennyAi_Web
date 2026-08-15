export const MIXED_SERIES_NAME = 'Parcours IA mixte'

export const mixedPublicSeriesFixture = {
  infographics: [
    {
      id: 'infographic-1',
      status: 'published',
      title: 'Fondations visuelles',
      published_at: '2026-01-01T12:00:00Z',
      image_path: 'infographic-1/original.webp',
      thumbnail_path: 'thumbnails/infographics/infographic-1/card.webp',
      level: 'beginner',
    },
    {
      id: 'infographic-3',
      status: 'published',
      title: 'Mise en pratique visuelle',
      published_at: '2026-01-03T12:00:00Z',
      image_path: 'infographic-3/original.webp',
      level: 'beginner',
    },
  ],
  articles: [
    {
      id: 'article-2',
      status: 'published',
      slug: 'comprendre-le-parcours',
      title: 'Comprendre le parcours',
      published_at: '2026-01-02T12:00:00Z',
      cover_path: 'articles/article-2/cover/card.webp',
      content_markdown: 'Un contenu pédagogique court.',
      level: 'beginner',
    },
    {
      id: 'article-extra',
      status: 'published',
      slug: 'aller-plus-loin',
      title: 'Aller plus loin',
      published_at: '2026-01-04T12:00:00Z',
      content_markdown: 'Une ressource complémentaire.',
      level: 'beginner',
    },
    {
      id: 'article-draft',
      status: 'draft',
      slug: 'brouillon-invisible',
      title: 'Brouillon invisible',
      published_at: '2026-01-05T12:00:00Z',
      content_markdown: 'Ce brouillon ne doit jamais être public.',
      level: 'beginner',
    },
  ],
  memberships: [
    { id: 'membership-info-1', series_id: 'series-mixed', infographic_id: 'infographic-1', position: 1 },
    { id: 'membership-article-2', series_id: 'series-mixed', article_id: 'article-2', position: 2 },
    { id: 'membership-info-3', series_id: 'series-mixed', infographic_id: 'infographic-3', position: 3 },
    { id: 'membership-article-extra', series_id: 'series-mixed', article_id: 'article-extra', position: null },
    { id: 'membership-article-draft', series_id: 'series-mixed', article_id: 'article-draft', position: 4 },
  ],
}
