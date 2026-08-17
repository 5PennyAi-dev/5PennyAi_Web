begin;

-- Published resources must already be classified. Draft resources are allowed
-- to have no Topic; their legacy theme values are deliberately not migrated.
do $migration$
declare
  dependency_names text;
  articles_total integer;
  articles_published integer;
  infographics_total integer;
  infographics_published integer;
  topics_total integer;
  topic_memberships_total integer;
  series_total integer;
  series_memberships_total integer;
begin
  if to_regclass('public.resource_topics') is null
    or to_regclass('public.resource_topic_memberships') is null
    or to_regclass('public.resource_series') is null
    or to_regclass('public.resource_series_memberships') is null then
    raise exception 'Theme removal precondition failed: canonical Topic or Series tables are missing.';
  end if;

  if exists (
    select 1
    from public.articles article
    where article.status = 'published'
      and not exists (
        select 1
        from public.resource_topic_memberships membership
        where membership.article_id = article.id
      )
  ) then
    raise exception 'Theme removal precondition failed: a published Article has no Topic membership.';
  end if;

  if exists (
    select 1
    from public.infographics infographic
    where infographic.status = 'published'
      and not exists (
        select 1
        from public.resource_topic_memberships membership
        where membership.infographic_id = infographic.id
      )
  ) then
    raise exception 'Theme removal precondition failed: a published Infographic has no Topic membership.';
  end if;

  if exists (
    select 1
    from public.resource_topic_memberships membership
    left join public.resource_topics topic on topic.id = membership.topic_id
    left join public.articles article on article.id = membership.article_id
    left join public.infographics infographic on infographic.id = membership.infographic_id
    where topic.id is null
      or num_nonnulls(membership.article_id, membership.infographic_id) <> 1
      or (membership.article_id is not null and article.id is null)
      or (membership.infographic_id is not null and infographic.id is null)
  ) then
    raise exception 'Theme removal precondition failed: an invalid or orphaned Topic membership exists.';
  end if;

  select string_agg(indexrelid::regclass::text, ', ')
  into dependency_names
  from pg_index index_definition
  join pg_attribute attribute
    on attribute.attrelid = index_definition.indrelid
   and attribute.attnum = any(index_definition.indkey)
  where index_definition.indrelid in ('public.articles'::regclass, 'public.infographics'::regclass)
    and attribute.attname = 'theme';

  if dependency_names is not null then
    raise exception 'Theme removal precondition failed: indexes still depend on legacy columns: %', dependency_names;
  end if;

  select string_agg(constraint_name, ', ')
  into dependency_names
  from information_schema.constraint_column_usage
  where table_schema = 'public'
    and table_name in ('articles', 'infographics')
    and column_name = 'theme';

  if dependency_names is not null then
    raise exception 'Theme removal precondition failed: constraints still depend on legacy columns: %', dependency_names;
  end if;

  select string_agg(schemaname || '.' || viewname, ', ')
  into dependency_names
  from pg_views
  where schemaname = 'public'
    and definition ~* '\\mtheme\\M';

  if dependency_names is not null then
    raise exception 'Theme removal precondition failed: views still reference legacy columns: %', dependency_names;
  end if;

  select string_agg(oid::regprocedure::text, ', ')
  into dependency_names
  from pg_proc
  where pronamespace = 'public'::regnamespace
    and pg_get_functiondef(oid) ~* '\\mtheme\\M';

  if dependency_names is not null then
    raise exception 'Theme removal precondition failed: functions still reference legacy columns: %', dependency_names;
  end if;

  select string_agg(trigger_name, ', ')
  into dependency_names
  from information_schema.triggers
  where event_object_schema = 'public'
    and event_object_table in ('articles', 'infographics')
    and action_statement ~* '\\mtheme\\M';

  if dependency_names is not null then
    raise exception 'Theme removal precondition failed: triggers still reference legacy columns: %', dependency_names;
  end if;

  select string_agg(schemaname || '.' || tablename || '.' || policyname, ', ')
  into dependency_names
  from pg_policies
  where schemaname = 'public'
    and tablename in ('articles', 'infographics')
    and (coalesce(qual, '') || ' ' || coalesce(with_check, '')) ~* '\\mtheme\\M';

  if dependency_names is not null then
    raise exception 'Theme removal precondition failed: policies still reference legacy columns: %', dependency_names;
  end if;

  select
    (select count(*) from public.articles),
    (select count(*) from public.articles where status = 'published'),
    (select count(*) from public.infographics),
    (select count(*) from public.infographics where status = 'published'),
    (select count(*) from public.resource_topics),
    (select count(*) from public.resource_topic_memberships),
    (select count(*) from public.resource_series),
    (select count(*) from public.resource_series_memberships)
  into
    articles_total,
    articles_published,
    infographics_total,
    infographics_published,
    topics_total,
    topic_memberships_total,
    series_total,
    series_memberships_total;

  -- A prior interrupted SQL-editor run can already have removed one or both
  -- legacy columns. The postcondition below still requires both to be absent.
  execute 'alter table public.articles drop column if exists theme';
  execute 'alter table public.infographics drop column if exists theme';

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name in ('articles', 'infographics')
      and column_name = 'theme'
  ) then
    raise exception 'Theme removal validation failed: a legacy theme column still exists.';
  end if;

  if to_regclass('public.resource_topics') is null
    or to_regclass('public.resource_topic_memberships') is null
    or to_regclass('public.resource_series') is null
    or to_regclass('public.resource_series_memberships') is null then
    raise exception 'Theme removal validation failed: canonical Topic or Series tables were altered unexpectedly.';
  end if;

  if articles_total <> (select count(*) from public.articles)
    or articles_published <> (select count(*) from public.articles where status = 'published')
    or infographics_total <> (select count(*) from public.infographics)
    or infographics_published <> (select count(*) from public.infographics where status = 'published')
    or topics_total <> (select count(*) from public.resource_topics)
    or topic_memberships_total <> (select count(*) from public.resource_topic_memberships)
    or series_total <> (select count(*) from public.resource_series)
    or series_memberships_total <> (select count(*) from public.resource_series_memberships) then
    raise exception 'Theme removal validation failed: resource, publication, Topic, membership, or Series counts changed unexpectedly.';
  end if;

  if exists (
    select 1
    from public.articles article
    where article.status = 'published'
      and not exists (
        select 1
        from public.resource_topic_memberships membership
        where membership.article_id = article.id
      )
    union all
    select 1
    from public.infographics infographic
    where infographic.status = 'published'
      and not exists (
        select 1
        from public.resource_topic_memberships membership
        where membership.infographic_id = infographic.id
      )
  ) then
    raise exception 'Theme removal validation failed: a published resource has no Topic membership.';
  end if;
end
$migration$;

commit;
