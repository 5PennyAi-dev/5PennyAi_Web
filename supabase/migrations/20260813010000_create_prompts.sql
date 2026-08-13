-- Ressources IA — MVP 6.0, increment 1
-- Specialized prompt drafts, permissive editorial data, and private thumbnails.

create table if not exists public.prompts (
  id uuid primary key default gen_random_uuid(),
  schema_version integer,
  content_type text,
  language text,
  title text,
  summary text,
  category text,
  level text,
  contexts jsonb not null default '[]'::jsonb
    check (jsonb_typeof(contexts) = 'array'),
  result_types jsonb not null default '[]'::jsonb
    check (jsonb_typeof(result_types) = 'array'),
  when_to_use text,
  prompt_template text,
  variables jsonb not null default '[]'::jsonb
    check (jsonb_typeof(variables) = 'array'),
  tip text,
  quick_template text,
  caution text,
  editorial_objective text,
  thumbnail jsonb not null default '{}'::jsonb
    check (jsonb_typeof(thumbnail) = 'object'),
  keywords jsonb not null default '[]'::jsonb
    check (jsonb_typeof(keywords) = 'array'),
  seo jsonb not null default '{}'::jsonb
    check (jsonb_typeof(seo) = 'object'),
  slug text unique,
  status text not null default 'draft'
    check (status in ('draft', 'published')),
  thumbnail_path text,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists prompts_updated_at_idx
  on public.prompts (updated_at desc);

create index if not exists prompts_status_published_at_idx
  on public.prompts (status, published_at desc);

create or replace function public.set_prompts_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists prompts_set_updated_at on public.prompts;
create trigger prompts_set_updated_at
  before update on public.prompts
  for each row
  execute function public.set_prompts_updated_at();

alter table public.prompts enable row level security;

drop policy if exists "Public can read published prompts" on public.prompts;
create policy "Public can read published prompts"
  on public.prompts
  for select
  to anon
  using (status = 'published');

drop policy if exists "Authenticated can read published prompts" on public.prompts;
create policy "Authenticated can read published prompts"
  on public.prompts
  for select
  to authenticated
  using (status = 'published');

drop policy if exists "Resources admin can manage prompts" on public.prompts;
create policy "Resources admin can manage prompts"
  on public.prompts
  for all
  to authenticated
  using (public.is_resources_admin())
  with check (public.is_resources_admin());

grant select on table public.prompts to anon;
grant select, insert, update, delete on table public.prompts to authenticated;

drop policy if exists "Resources admin can read prompt thumbnails" on storage.objects;
create policy "Resources admin can read prompt thumbnails"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'article-assets'
    and public.is_resources_admin()
    and (storage.foldername(name))[1] = 'prompts'
    and nullif((storage.foldername(name))[2], '') is not null
    and (storage.foldername(name))[3] = 'thumbnail'
  );

drop policy if exists "Resources admin can insert prompt thumbnails" on storage.objects;
create policy "Resources admin can insert prompt thumbnails"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'article-assets'
    and public.is_resources_admin()
    and (storage.foldername(name))[1] = 'prompts'
    and nullif((storage.foldername(name))[2], '') is not null
    and (storage.foldername(name))[3] = 'thumbnail'
  );

drop policy if exists "Resources admin can update prompt thumbnails" on storage.objects;
create policy "Resources admin can update prompt thumbnails"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'article-assets'
    and public.is_resources_admin()
    and (storage.foldername(name))[1] = 'prompts'
    and nullif((storage.foldername(name))[2], '') is not null
    and (storage.foldername(name))[3] = 'thumbnail'
  )
  with check (
    bucket_id = 'article-assets'
    and public.is_resources_admin()
    and (storage.foldername(name))[1] = 'prompts'
    and nullif((storage.foldername(name))[2], '') is not null
    and (storage.foldername(name))[3] = 'thumbnail'
  );

drop policy if exists "Resources admin can delete prompt thumbnails" on storage.objects;
create policy "Resources admin can delete prompt thumbnails"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'article-assets'
    and public.is_resources_admin()
    and (storage.foldername(name))[1] = 'prompts'
    and nullif((storage.foldername(name))[2], '') is not null
    and (storage.foldername(name))[3] = 'thumbnail'
  );

drop policy if exists "Public can read published prompt thumbnails" on storage.objects;
create policy "Public can read published prompt thumbnails"
  on storage.objects
  for select
  to anon, authenticated
  using (
    bucket_id = 'article-assets'
    and (storage.foldername(name))[1] = 'prompts'
    and nullif((storage.foldername(name))[2], '') is not null
    and (storage.foldername(name))[3] = 'thumbnail'
    and exists (
      select 1
      from public.prompts
      where prompts.id::text = (storage.foldername(name))[2]
        and prompts.status = 'published'
    )
  );

grant select on table storage.objects to anon, authenticated;
