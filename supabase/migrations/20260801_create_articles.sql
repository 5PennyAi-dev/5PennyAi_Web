-- Ressources IA — MVP 2.0, increment 1
-- Apply through the normal Supabase migration workflow before validating draft CRUD.
-- Existing broader authenticated policies on infographics, resource_series, and Storage
-- are intentionally left unchanged; aligning them is a separate security debt.

create or replace function public.is_resources_admin()
returns boolean
language sql
stable
set search_path = ''
as $$
  select coalesce(auth.jwt() ->> 'email', '') = 'christian.couillard@5pennyai.com';
$$;

revoke all on function public.is_resources_admin() from public;
grant execute on function public.is_resources_admin() to authenticated;

create table if not exists public.articles (
  id uuid primary key default gen_random_uuid(),
  schema_version integer,
  content_type text,
  language text,
  title text,
  subtitle text,
  summary text,
  theme text,
  level text,
  series_name text,
  episode_number integer,
  learning_objectives jsonb not null default '[]'::jsonb,
  prerequisites jsonb not null default '[]'::jsonb,
  takeaway text,
  content_markdown text,
  media jsonb not null default '[]'::jsonb,
  cover jsonb not null default '{}'::jsonb,
  keywords jsonb not null default '[]'::jsonb,
  sources jsonb not null default '[]'::jsonb,
  seo jsonb not null default '{}'::jsonb,
  slug text unique,
  status text not null default 'draft'
    check (status in ('draft', 'published')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz
);

create index if not exists articles_updated_at_idx
  on public.articles (updated_at desc);

create index if not exists articles_status_published_at_idx
  on public.articles (status, published_at desc);

create index if not exists articles_series_order_idx
  on public.articles (series_name, episode_number, published_at);

create or replace function public.set_articles_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists articles_set_updated_at on public.articles;
create trigger articles_set_updated_at
  before update on public.articles
  for each row
  execute function public.set_articles_updated_at();

alter table public.articles enable row level security;

drop policy if exists "Public can read published articles"
  on public.articles;
create policy "Public can read published articles"
  on public.articles
  for select
  to anon
  using (status = 'published');

drop policy if exists "Resources admin can manage articles"
  on public.articles;
create policy "Resources admin can manage articles"
  on public.articles
  for all
  to authenticated
  using (public.is_resources_admin())
  with check (public.is_resources_admin());

grant select on table public.articles to anon;
grant select, insert, update, delete on table public.articles to authenticated;
