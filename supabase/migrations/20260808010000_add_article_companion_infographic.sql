alter table public.articles
  add column if not exists infographic_path text,
  add column if not exists infographic_alt_text text;
