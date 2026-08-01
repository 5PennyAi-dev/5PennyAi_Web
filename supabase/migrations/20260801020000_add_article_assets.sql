-- Ressources IA — MVP 2.0, increment 2
-- Review, then apply through the normal Supabase migration workflow.

alter table public.articles
  add column if not exists cover_path text;

create table if not exists public.article_media_assets (
  id uuid primary key default gen_random_uuid(),
  article_id uuid not null references public.articles(id) on delete cascade,
  media_key text not null check (media_key ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  storage_path text not null,
  file_metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (article_id, media_key)
);

create index if not exists article_media_assets_article_id_idx
  on public.article_media_assets (article_id);

create or replace function public.set_article_media_assets_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists article_media_assets_set_updated_at on public.article_media_assets;
create trigger article_media_assets_set_updated_at
  before update on public.article_media_assets
  for each row
  execute function public.set_article_media_assets_updated_at();

alter table public.article_media_assets enable row level security;

drop policy if exists "Resources admin can manage article media assets"
  on public.article_media_assets;
create policy "Resources admin can manage article media assets"
  on public.article_media_assets
  for all
  to authenticated
  using (public.is_resources_admin())
  with check (public.is_resources_admin());

revoke all on table public.article_media_assets from anon;
grant select, insert, update, delete on table public.article_media_assets to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'article-assets',
  'article-assets',
  false,
  5242880,
  array['image/png', 'image/jpeg', 'image/webp']
)
on conflict (id) do update
set public = false,
    file_size_limit = case
      when storage.buckets.file_size_limit is null then excluded.file_size_limit
      else least(storage.buckets.file_size_limit, excluded.file_size_limit)
    end,
    allowed_mime_types = case
      when storage.buckets.allowed_mime_types is null then excluded.allowed_mime_types
      else array(
        select mime_type
        from unnest(storage.buckets.allowed_mime_types) as mime_type
        where mime_type = any (array['image/png', 'image/jpeg', 'image/webp']::text[])
      )
    end;

drop policy if exists "Resources admin can manage article files" on storage.objects;
drop policy if exists "Resources admin can read article files" on storage.objects;
drop policy if exists "Resources admin can insert article files" on storage.objects;
drop policy if exists "Resources admin can update article files" on storage.objects;
drop policy if exists "Resources admin can delete article files" on storage.objects;

create policy "Resources admin can read article files"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'article-assets'
    and public.is_resources_admin()
    and (storage.foldername(name))[1] = 'articles'
  );

create policy "Resources admin can insert article files"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'article-assets'
    and public.is_resources_admin()
    and (storage.foldername(name))[1] = 'articles'
  );

create policy "Resources admin can update article files"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'article-assets'
    and public.is_resources_admin()
    and (storage.foldername(name))[1] = 'articles'
  )
  with check (
    bucket_id = 'article-assets'
    and public.is_resources_admin()
    and (storage.foldername(name))[1] = 'articles'
  );

create policy "Resources admin can delete article files"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'article-assets'
    and public.is_resources_admin()
    and (storage.foldername(name))[1] = 'articles'
  );
