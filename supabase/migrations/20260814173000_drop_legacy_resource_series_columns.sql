begin;

do $migration$
declare
  missing_columns text;
  legacy_index_definition text;
begin
  select string_agg(expected.table_name || '.' || expected.column_name, ', ')
  into missing_columns
  from (
    values
      ('articles', 'series_name'),
      ('articles', 'episode_number'),
      ('infographics', 'series_name'),
      ('infographics', 'episode_number')
  ) as expected(table_name, column_name)
  where not exists (
    select 1
    from information_schema.columns actual
    where actual.table_schema = 'public'
      and actual.table_name = expected.table_name
      and actual.column_name = expected.column_name
  );

  if missing_columns is not null then
    raise exception 'Increment 5 precondition failed: expected legacy columns are missing: %', missing_columns;
  end if;

  if to_regclass('public.resource_series') is null
    or to_regclass('public.resource_series_memberships') is null then
    raise exception 'Increment 5 precondition failed: canonical series tables are missing.';
  end if;

  select indexdef
  into legacy_index_definition
  from pg_indexes
  where schemaname = 'public'
    and indexname = 'articles_series_order_idx';

  if legacy_index_definition is null then
    raise exception 'Increment 5 precondition failed: articles_series_order_idx is missing.';
  end if;
  if legacy_index_definition not ilike '%(series_name, episode_number, published_at)%' then
    raise exception 'Increment 5 precondition failed: articles_series_order_idx has an unexpected definition: %', legacy_index_definition;
  end if;
end
$migration$;

drop index if exists public.articles_series_order_idx;

alter table public.articles
  drop column series_name,
  drop column episode_number;

alter table public.infographics
  drop column series_name,
  drop column episode_number;

do $migration$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name in ('articles', 'infographics')
      and column_name in ('series_name', 'episode_number')
  ) then
    raise exception 'Increment 5 validation failed: at least one legacy column still exists.';
  end if;

  if to_regclass('public.resource_series') is null
    or to_regclass('public.resource_series_memberships') is null then
    raise exception 'Increment 5 validation failed: canonical series tables were altered unexpectedly.';
  end if;
end
$migration$;

commit;
