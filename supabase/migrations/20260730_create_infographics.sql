-- Ressources IA — phase 1, increment 1
-- Run this file in the Supabase SQL Editor.

create table if not exists public.infographics (
  id uuid primary key default gen_random_uuid(),
  status text not null default 'draft'
    check (status in ('draft', 'published')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz,
  image_path text,
  image_metadata jsonb,

  title text,
  subtitle text,
  summary text,
  introduction text,
  image_alt text,
  theme text,
  level text,
  reading_time_minutes integer,
  series_name text,
  episode_number integer,
  key_points jsonb,
  takeaway text,
  keywords jsonb,
  sources jsonb
);

create index if not exists infographics_status_idx
  on public.infographics (status);

create or replace function public.set_infographics_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists infographics_set_updated_at on public.infographics;
create trigger infographics_set_updated_at
  before update on public.infographics
  for each row
  execute function public.set_infographics_updated_at();

alter table public.infographics enable row level security;

drop policy if exists "Public can read published infographics"
  on public.infographics;
create policy "Public can read published infographics"
  on public.infographics
  for select
  to anon
  using (status = 'published');

drop policy if exists "Authenticated can manage infographics"
  on public.infographics;
create policy "Authenticated can manage infographics"
  on public.infographics
  for all
  to authenticated
  using (true)
  with check (true);

grant select on table public.infographics to anon;
grant select, insert, update, delete on table public.infographics to authenticated;

insert into storage.buckets (id, name, public)
values ('infographics', 'infographics', true)
on conflict (id) do update
set public = excluded.public;

drop policy if exists "Public can read infographic files"
  on storage.objects;
create policy "Public can read infographic files"
  on storage.objects
  for select
  to public
  using (bucket_id = 'infographics');

drop policy if exists "Authenticated can manage infographic files"
  on storage.objects;
create policy "Authenticated can manage infographic files"
  on storage.objects
  for all
  to authenticated
  using (bucket_id = 'infographics')
  with check (bucket_id = 'infographics');
