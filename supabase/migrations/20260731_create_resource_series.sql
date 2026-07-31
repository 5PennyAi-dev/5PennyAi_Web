-- Ressources IA — MVP 1.2, increment 3
-- Apply locally or through the normal Supabase migration workflow before validation.

create table if not exists public.resource_series (
  slug text primary key,
  name text not null,
  thumbnail_path text,
  thumbnail_generated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_resource_series_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists resource_series_set_updated_at on public.resource_series;
create trigger resource_series_set_updated_at
  before update on public.resource_series
  for each row
  execute function public.set_resource_series_updated_at();

alter table public.resource_series enable row level security;

drop policy if exists "Public can read resource series thumbnails"
  on public.resource_series;
create policy "Public can read resource series thumbnails"
  on public.resource_series
  for select
  to anon
  using (true);

drop policy if exists "Authenticated can manage resource series"
  on public.resource_series;
create policy "Authenticated can manage resource series"
  on public.resource_series
  for all
  to authenticated
  using (true)
  with check (true);

revoke all on table public.resource_series from anon;
grant select (slug, thumbnail_path) on table public.resource_series to anon;
grant select, insert, update, delete on table public.resource_series to authenticated;
