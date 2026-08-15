-- Ressources IA — series architecture, increment 1
-- Add a stable series identity and backfill explicit Article/Infographic memberships.

begin;

-- Keep immutable snapshots for the post-migration assertions below.
create temporary table resource_series_before_increment_1
on commit drop
as
select slug, name, thumbnail_path, thumbnail_generated_at
from public.resource_series;

create temporary table resource_series_legacy_before_increment_1
on commit drop
as
select 'article'::text as resource_type, id, series_name, episode_number
from public.articles
union all
select 'infographic'::text as resource_type, id, series_name, episode_number
from public.infographics;

do $$
declare
  unexpected_values text;
  duplicate_positions text;
  missing_slugs text;
  current_primary_key_columns text[];
begin
  if to_regclass('public.resource_series_memberships') is not null then
    raise exception 'Increment 1 precondition failed: public.resource_series_memberships already exists.';
  end if;

  select array_agg(att.attname order by key_column.ordinality)
  into current_primary_key_columns
  from pg_constraint con
  cross join lateral unnest(con.conkey) with ordinality as key_column(attnum, ordinality)
  join pg_attribute att
    on att.attrelid = con.conrelid
   and att.attnum = key_column.attnum
  where con.conrelid = 'public.resource_series'::regclass
    and con.contype = 'p';

  if current_primary_key_columns is distinct from array['slug']::text[] then
    raise exception
      'Increment 1 precondition failed: resource_series primary key must be exactly (slug), found %.',
      coalesce(current_primary_key_columns::text, 'none');
  end if;

  if exists (
    select 1
    from public.articles
    where series_name in ('Test', 'Les mots de l’IA générative')
    union all
    select 1
    from public.infographics
    where series_name in ('Test', 'Les mots de l’IA générative')
  ) then
    raise exception
      'Increment 1 precondition failed: a resource still uses legacy series Test or Les mots de l’IA générative.';
  end if;

  with legacy_values as (
    select series_name, count(*) as resource_count
    from resource_series_legacy_before_increment_1
    where series_name is not null
    group by series_name
  )
  select string_agg(format('%L (%s resources)', series_name, resource_count), ', ' order by series_name)
  into unexpected_values
  from legacy_values
  where series_name not in (
    'Les fondamentaux de l’IA générative',
    'Le vocabulaire de l''IA générative',
    'Le vocabulaire de l’IA générative',
    'Développer avec les assistants IA',
    'Bien débuter avec l’IA',
    'Avant et après les LLM : comment l’IA générative a changé la donne'
  );

  if unexpected_values is not null then
    raise exception
      'Increment 1 precondition failed: unmapped legacy series values: %.',
      unexpected_values;
  end if;

  if exists (
    select 1
    from resource_series_legacy_before_increment_1
    where series_name is not null
      and episode_number is not null
      and episode_number <= 0
  ) then
    raise exception
      'Increment 1 precondition failed: a recognized legacy membership has a non-positive episode_number.';
  end if;

  with canonical_legacy as (
    select
      case
        when series_name = 'Les fondamentaux de l’IA générative'
          then 'les-fondamentaux-de-l-ia-generative'
        when series_name in (
          'Le vocabulaire de l''IA générative',
          'Le vocabulaire de l’IA générative'
        ) then 'le-vocabulaire-de-l-ia-generative'
        when series_name = 'Développer avec les assistants IA'
          then 'developper-avec-les-assistants-ia'
        when series_name = 'Bien débuter avec l’IA'
          then 'bien-debuter-avec-l-ia'
        when series_name = 'Avant et après les LLM : comment l’IA générative a changé la donne'
          then 'avant-et-apres-les-llm-comment-l-ia-generative-a-change-la-donne'
      end as series_slug,
      episode_number
    from resource_series_legacy_before_increment_1
    where series_name is not null
  ), conflicts as (
    select series_slug, episode_number, count(*) as resource_count
    from canonical_legacy
    where episode_number is not null
    group by series_slug, episode_number
    having count(*) > 1
  )
  select string_agg(
    format('%s position %s (%s resources)', series_slug, episode_number, resource_count),
    ', '
    order by series_slug, episode_number
  )
  into duplicate_positions
  from conflicts;

  if duplicate_positions is not null then
    raise exception
      'Increment 1 precondition failed: duplicate canonical series positions: %.',
      duplicate_positions;
  end if;

  with required_slugs(slug) as (
    values
      ('les-fondamentaux-de-l-ia-generative'),
      ('le-vocabulaire-de-l-ia-generative'),
      ('developper-avec-les-assistants-ia'),
      ('bien-debuter-avec-l-ia')
  )
  select string_agg(required_slugs.slug, ', ' order by required_slugs.slug)
  into missing_slugs
  from required_slugs
  left join public.resource_series existing using (slug)
  where existing.slug is null;

  if missing_slugs is not null then
    raise exception
      'Increment 1 precondition failed: expected persisted series slugs are missing: %.',
      missing_slugs;
  end if;
end;
$$;

alter table public.resource_series
  add column id uuid default gen_random_uuid(),
  add column description text,
  add column objective text;

alter table public.resource_series
  alter column id set not null;

-- Create only the one certain missing series, and only while its exact legacy value exists.
insert into public.resource_series (
  slug,
  name,
  description,
  objective,
  thumbnail_path,
  thumbnail_generated_at
)
select
  'avant-et-apres-les-llm-comment-l-ia-generative-a-change-la-donne',
  'Avant et après les LLM : comment l’IA générative a changé la donne',
  null,
  null,
  null,
  null
where exists (
  select 1
  from resource_series_legacy_before_increment_1
  where series_name = 'Avant et après les LLM : comment l’IA générative a changé la donne'
)
and not exists (
  select 1
  from public.resource_series
  where slug = 'avant-et-apres-les-llm-comment-l-ia-generative-a-change-la-donne'
);

do $$
declare
  missing_targets text;
begin
  with required_targets(slug) as (
    select distinct
      case
        when series_name = 'Les fondamentaux de l’IA générative'
          then 'les-fondamentaux-de-l-ia-generative'
        when series_name in (
          'Le vocabulaire de l''IA générative',
          'Le vocabulaire de l’IA générative'
        ) then 'le-vocabulaire-de-l-ia-generative'
        when series_name = 'Développer avec les assistants IA'
          then 'developper-avec-les-assistants-ia'
        when series_name = 'Bien débuter avec l’IA'
          then 'bien-debuter-avec-l-ia'
        when series_name = 'Avant et après les LLM : comment l’IA générative a changé la donne'
          then 'avant-et-apres-les-llm-comment-l-ia-generative-a-change-la-donne'
      end
    from resource_series_legacy_before_increment_1
    where series_name is not null
  )
  select string_agg(required_targets.slug, ', ' order by required_targets.slug)
  into missing_targets
  from required_targets
  left join public.resource_series target using (slug)
  where target.slug is null;

  if missing_targets is not null then
    raise exception
      'Increment 1 precondition failed: canonical target series are missing: %.',
      missing_targets;
  end if;
end;
$$;

alter table public.resource_series
  drop constraint resource_series_pkey,
  alter column slug set not null,
  add constraint resource_series_pkey primary key (id),
  add constraint resource_series_slug_key unique (slug);

create table public.resource_series_memberships (
  id uuid primary key default gen_random_uuid(),
  series_id uuid not null
    references public.resource_series(id) on delete cascade,
  article_id uuid
    references public.articles(id) on delete cascade,
  infographic_id uuid
    references public.infographics(id) on delete cascade,
  position integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint resource_series_memberships_exactly_one_resource_check
    check (num_nonnulls(article_id, infographic_id) = 1),
  constraint resource_series_memberships_positive_position_check
    check (position is null or position > 0)
);

create unique index resource_series_memberships_series_article_uidx
  on public.resource_series_memberships (series_id, article_id)
  where article_id is not null;

create unique index resource_series_memberships_series_infographic_uidx
  on public.resource_series_memberships (series_id, infographic_id)
  where infographic_id is not null;

create unique index resource_series_memberships_series_position_uidx
  on public.resource_series_memberships (series_id, position)
  where position is not null;

create index resource_series_memberships_series_position_idx
  on public.resource_series_memberships (series_id, position);

create index resource_series_memberships_article_id_idx
  on public.resource_series_memberships (article_id)
  where article_id is not null;

create index resource_series_memberships_infographic_id_idx
  on public.resource_series_memberships (infographic_id)
  where infographic_id is not null;

create or replace function public.set_resource_series_memberships_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger resource_series_memberships_set_updated_at
  before update on public.resource_series_memberships
  for each row
  execute function public.set_resource_series_memberships_updated_at();

-- Backfill with an explicit mapping. Do not slugify or normalize arbitrary legacy strings.
insert into public.resource_series_memberships (series_id, article_id, position)
select target.id, article.id, article.episode_number
from public.articles article
join public.resource_series target
  on target.slug = case
    when article.series_name = 'Les fondamentaux de l’IA générative'
      then 'les-fondamentaux-de-l-ia-generative'
    when article.series_name in (
      'Le vocabulaire de l''IA générative',
      'Le vocabulaire de l’IA générative'
    ) then 'le-vocabulaire-de-l-ia-generative'
    when article.series_name = 'Développer avec les assistants IA'
      then 'developper-avec-les-assistants-ia'
    when article.series_name = 'Bien débuter avec l’IA'
      then 'bien-debuter-avec-l-ia'
    when article.series_name = 'Avant et après les LLM : comment l’IA générative a changé la donne'
      then 'avant-et-apres-les-llm-comment-l-ia-generative-a-change-la-donne'
  end
where article.series_name in (
  'Les fondamentaux de l’IA générative',
  'Le vocabulaire de l''IA générative',
  'Le vocabulaire de l’IA générative',
  'Développer avec les assistants IA',
  'Bien débuter avec l’IA',
  'Avant et après les LLM : comment l’IA générative a changé la donne'
);

insert into public.resource_series_memberships (series_id, infographic_id, position)
select target.id, infographic.id, infographic.episode_number
from public.infographics infographic
join public.resource_series target
  on target.slug = case
    when infographic.series_name = 'Les fondamentaux de l’IA générative'
      then 'les-fondamentaux-de-l-ia-generative'
    when infographic.series_name in (
      'Le vocabulaire de l''IA générative',
      'Le vocabulaire de l’IA générative'
    ) then 'le-vocabulaire-de-l-ia-generative'
    when infographic.series_name = 'Développer avec les assistants IA'
      then 'developper-avec-les-assistants-ia'
    when infographic.series_name = 'Bien débuter avec l’IA'
      then 'bien-debuter-avec-l-ia'
    when infographic.series_name = 'Avant et après les LLM : comment l’IA générative a changé la donne'
      then 'avant-et-apres-les-llm-comment-l-ia-generative-a-change-la-donne'
  end
where infographic.series_name in (
  'Les fondamentaux de l’IA générative',
  'Le vocabulaire de l''IA générative',
  'Le vocabulaire de l’IA générative',
  'Développer avec les assistants IA',
  'Bien débuter avec l’IA',
  'Avant et après les LLM : comment l’IA générative a changé la donne'
);

alter table public.resource_series_memberships enable row level security;

drop policy if exists "Public can read resource series thumbnails"
  on public.resource_series;
drop policy if exists "Authenticated can manage resource series"
  on public.resource_series;

create policy "Public can read published resource series"
  on public.resource_series
  for select
  to anon, authenticated
  using (
    exists (
      select 1
      from public.resource_series_memberships membership
      where membership.series_id = resource_series.id
        and (
          (
            membership.article_id is not null
            and exists (
              select 1
              from public.articles article
              where article.id = membership.article_id
                and article.status = 'published'
            )
          )
          or
          (
            membership.infographic_id is not null
            and exists (
              select 1
              from public.infographics infographic
              where infographic.id = membership.infographic_id
                and infographic.status = 'published'
            )
          )
        )
    )
  );

create policy "Resources admin can manage resource series"
  on public.resource_series
  for all
  to authenticated
  using (public.is_resources_admin())
  with check (public.is_resources_admin());

create policy "Public can read published resource series memberships"
  on public.resource_series_memberships
  for select
  to anon, authenticated
  using (
    (
      article_id is not null
      and exists (
        select 1
        from public.articles article
        where article.id = resource_series_memberships.article_id
          and article.status = 'published'
      )
    )
    or
    (
      infographic_id is not null
      and exists (
        select 1
        from public.infographics infographic
        where infographic.id = resource_series_memberships.infographic_id
          and infographic.status = 'published'
      )
    )
  );

create policy "Resources admin can manage resource series memberships"
  on public.resource_series_memberships
  for all
  to authenticated
  using (public.is_resources_admin())
  with check (public.is_resources_admin());

revoke all on table public.resource_series from anon;
grant select (id, slug, name, description, objective, thumbnail_path)
  on table public.resource_series to anon;
grant select, insert, update, delete
  on table public.resource_series to authenticated;

revoke all on table public.resource_series_memberships from anon, authenticated;
grant select (id, series_id, article_id, infographic_id, position)
  on table public.resource_series_memberships to anon;
grant select, insert, update, delete
  on table public.resource_series_memberships to authenticated;

do $$
declare
  expected_memberships integer;
  actual_memberships integer;
  count_mismatches text;
begin
  select count(*)
  into expected_memberships
  from resource_series_legacy_before_increment_1
  where series_name is not null;

  select count(*)
  into actual_memberships
  from public.resource_series_memberships;

  if actual_memberships <> expected_memberships then
    raise exception
      'Increment 1 validation failed: expected % memberships, created %.',
      expected_memberships,
      actual_memberships;
  end if;

  with legacy_counts as (
    select
      case
        when series_name = 'Les fondamentaux de l’IA générative'
          then 'les-fondamentaux-de-l-ia-generative'
        when series_name in (
          'Le vocabulaire de l''IA générative',
          'Le vocabulaire de l’IA générative'
        ) then 'le-vocabulaire-de-l-ia-generative'
        when series_name = 'Développer avec les assistants IA'
          then 'developper-avec-les-assistants-ia'
        when series_name = 'Bien débuter avec l’IA'
          then 'bien-debuter-avec-l-ia'
        when series_name = 'Avant et après les LLM : comment l’IA générative a changé la donne'
          then 'avant-et-apres-les-llm-comment-l-ia-generative-a-change-la-donne'
      end as series_slug,
      count(*) as resource_count
    from resource_series_legacy_before_increment_1
    where series_name is not null
    group by 1
  ), membership_counts as (
    select series.slug as series_slug, count(*) as membership_count
    from public.resource_series_memberships membership
    join public.resource_series series on series.id = membership.series_id
    group by series.slug
  )
  select string_agg(
    format(
      '%s legacy=%s memberships=%s',
      coalesce(legacy_counts.series_slug, membership_counts.series_slug),
      coalesce(legacy_counts.resource_count, 0),
      coalesce(membership_counts.membership_count, 0)
    ),
    ', '
  )
  into count_mismatches
  from legacy_counts
  full join membership_counts using (series_slug)
  where coalesce(legacy_counts.resource_count, 0)
    <> coalesce(membership_counts.membership_count, 0);

  if count_mismatches is not null then
    raise exception
      'Increment 1 validation failed: per-series membership count mismatches: %.',
      count_mismatches;
  end if;

  if exists (select 1 from public.resource_series where id is null) then
    raise exception 'Increment 1 validation failed: a resource_series row has no id.';
  end if;

  if exists (
    select 1
    from resource_series_before_increment_1 before_row
    left join public.resource_series after_row using (slug)
    where after_row.slug is null
      or before_row.name is distinct from after_row.name
      or before_row.thumbnail_path is distinct from after_row.thumbnail_path
      or before_row.thumbnail_generated_at is distinct from after_row.thumbnail_generated_at
  ) then
    raise exception
      'Increment 1 validation failed: an existing series slug, name, or thumbnail reference changed.';
  end if;

  if exists (
    select 1
    from public.resource_series after_row
    left join resource_series_before_increment_1 before_row using (slug)
    where before_row.slug is null
      and after_row.slug <> 'avant-et-apres-les-llm-comment-l-ia-generative-a-change-la-donne'
  ) then
    raise exception 'Increment 1 validation failed: an unexpected series was created.';
  end if;

  if exists (
    select 1
    from resource_series_legacy_before_increment_1 before_row
    left join (
      select 'article'::text as resource_type, id, series_name, episode_number
      from public.articles
      union all
      select 'infographic'::text as resource_type, id, series_name, episode_number
      from public.infographics
    ) after_row using (resource_type, id)
    where after_row.id is null
      or before_row.series_name is distinct from after_row.series_name
      or before_row.episode_number is distinct from after_row.episode_number
  ) then
    raise exception
      'Increment 1 validation failed: a legacy series_name or episode_number changed.';
  end if;

  if exists (
    select 1
    from public.resource_series_memberships
    where series_id is null
      or num_nonnulls(article_id, infographic_id) <> 1
      or (position is not null and position <= 0)
  ) then
    raise exception 'Increment 1 validation failed: an invalid membership was created.';
  end if;

  if exists (
    select 1
    from public.resource_series_memberships membership
    left join public.resource_series series on series.id = membership.series_id
    left join public.articles article on article.id = membership.article_id
    left join public.infographics infographic on infographic.id = membership.infographic_id
    where series.id is null
      or (membership.article_id is not null and article.id is null)
      or (membership.infographic_id is not null and infographic.id is null)
  ) then
    raise exception 'Increment 1 validation failed: an orphan membership was created.';
  end if;
end;
$$;

commit;
