begin;

-- This increment establishes an explicit, controlled topic taxonomy. It does
-- not alter the public catalog, theme metadata, or the existing series model.
create temporary table resource_topic_backfill (
  resource_type text not null check (resource_type in ('article', 'infographic')),
  resource_id uuid not null,
  expected_title text not null,
  topic_slug text not null,
  primary key (resource_type, resource_id)
) on commit preserve rows;

insert into resource_topic_backfill (
  resource_type,
  resource_id,
  expected_title,
  topic_slug
)
values
  ('article', 'a3c084c7-585e-4b1f-80b5-0726920029a9', 'Qu’est-ce qu’un prompt?', 'prompting-interaction'),
  ('article', 'e4aef491-bfa3-48af-960e-6b486e37e3c9', 'Qu’est-ce que l’IA générative?', 'fondamentaux-ia'),
  ('article', '1b4a1226-5a55-4023-91e7-4ac876cc281d', 'Qu’est-ce qu’un modèle de fondation?', 'fondamentaux-ia'),
  ('article', '85eafced-6806-4e5a-95ac-13bf0f965dde', 'Qu’est-ce qu’un token en IA générative?', 'modeles-de-langage'),
  ('article', 'ec3b6625-56c5-4a9b-925e-0da5d0a0c439', 'Qu’est-ce qu’une fenêtre de contexte en IA générative?', 'modeles-de-langage'),
  ('article', '7029b480-cf2a-4c77-9fa4-e39c99e5b373', 'Qu’est-ce qu’un grand modèle de langage (LLM)?', 'modeles-de-langage'),
  ('article', '0c144de1-8016-4e5a-a905-c60b00edfb05', 'Que contient réellement le contexte fourni à un LLM?', 'modeles-de-langage'),
  ('article', '839a26f0-7573-40f1-af34-39ce3814578f', 'Qu’est-ce qu’une fenêtre de contexte?', 'modeles-de-langage'),
  ('article', 'ef641032-2c9e-4e91-b799-8f4c032f6915', 'À quoi sert le mécanisme d’attention dans un modèle de langage?', 'modeles-de-langage'),
  ('article', '0e6c9c46-32c5-47eb-bb80-bd3f286289ef', 'Comment un LLM construit-il une réponse, un token à la fois?', 'modeles-de-langage'),
  ('article', 'ba3128cf-f071-4ba6-aa95-804b142df08e', 'Que représentent les probabilités de tokens produites par un modèle de langage?', 'modeles-de-langage'),
  ('article', '6d8b546f-154a-4f25-85d5-f191db415f9a', 'Comment choisir le prochain token?', 'modeles-de-langage'),
  ('article', 'f9465319-6d9d-4d52-9b92-a332775c33fa', 'Que change la température lors de la génération d’un modèle de langage?', 'modeles-de-langage'),
  ('article', '90cf0e12-0489-4c7b-84c7-2b7e7cff8706', 'Qu’est-ce qu’une hallucination en IA?', 'fiabilite-evaluation'),
  ('article', '19688df8-2b66-4605-a8f2-c5c0e31fc904', 'Pourquoi l’IA se trompe-t-elle parfois?', 'fiabilite-evaluation'),
  ('article', '7480366b-d05e-4d46-83ad-a2ac89464af0', 'Peut-on faire confiance à une réponse générée par une IA?', 'fiabilite-evaluation'),
  ('article', 'b7c42948-394c-4e84-8826-819a1ea3d748', 'Qu’est-ce qu’un embedding en IA?', 'rag-recherche-semantique'),
  ('article', 'e5577e0d-119f-4724-bb7b-6be9668f1c18', 'Qu’est-ce que le RAG en IA générative?', 'rag-recherche-semantique'),
  ('article', '91588912-4d5f-4cab-9e2d-98614f7f2fce', 'Qu’est-ce qu’un agent IA?', 'agents-outils'),
  ('article', '9543b9eb-abcf-484f-9a5e-793b14a9c4a2', 'Appel d’outil en IA : comment un modèle utilise-t-il un outil?', 'agents-outils'),
  ('article', '2a016e09-6be4-41e7-8efe-72ced245d98f', 'Qu’est-ce que le réglage fin (fine-tuning) d’un modèle?', 'entrainement-adaptation'),
  ('infographic', 'e2ec91c5-ad42-4141-bc37-608285da6602', 'IA, apprentissage automatique et IA générative : comment s’y retrouver?', 'fondamentaux-ia'),
  ('infographic', '043ad67b-b32e-4719-99b4-23cc2d9e32d2', 'Hallucinations et fiabilité : pourquoi vérifier une réponse générée?', 'fiabilite-evaluation'),
  ('infographic', 'bf180548-159f-4400-a57c-fd05edc3aa06', 'Comment fonctionne le RAG ?', 'rag-recherche-semantique'),
  ('infographic', 'b8988dfa-e0a2-4ec8-a23a-83ee0d85d86c', 'Embeddings : représenter le sens pour retrouver l’information', 'rag-recherche-semantique'),
  ('infographic', 'e0aefb90-97fd-40c4-a694-1c589b7cc912', 'Qu’est-ce que la recherche sémantique?', 'rag-recherche-semantique'),
  ('infographic', 'f2c90e96-e386-44fa-8261-c6f193397cc9', 'Prompt, instructions et contexte : ce que reçoit réellement le modèle', 'prompting-interaction'),
  ('infographic', '7bd1a811-78ce-46b4-a908-2fc1c7c0046a', '10 structures de prompts utiles', 'prompting-interaction'),
  ('infographic', 'f0d00c67-efbd-4b20-9a27-1b40a2e873a2', 'Quel format demander à l’IA?', 'prompting-interaction'),
  ('infographic', 'da02b8ac-7938-4f94-b63a-bcedd6488bb7', 'Comment bien parler à une IA?', 'prompting-interaction'),
  ('infographic', 'e5994815-0034-44b9-88d5-0e768e7a1598', 'Que peut-on demander à une IA générative ?', 'prompting-interaction'),
  ('infographic', 'a9e73ab7-f29f-469b-843a-519a9e58897c', 'Comment un modèle de langage génère-t-il une réponse?', 'modeles-de-langage'),
  ('infographic', '6cc56e0a-ffb5-4c11-93c0-1785b24e0ccf', 'Entraînement et inférence : les deux phases d’un modèle d’IA', 'entrainement-adaptation'),
  ('infographic', 'fa671799-c4ea-4f8c-af1b-8e2953d7df77', 'Codex CLI — les commandes essentielles', 'assistants-programmation'),
  ('infographic', 'cbb693d0-ffec-4f65-a7ff-8bd0ca162850', 'Claude Code — les commandes essentielles', 'assistants-programmation'),
  ('infographic', 'db485d7c-f2da-498d-9f78-bf1fb569a2e2', 'GitHub Copilot CLI — les commandes essentielles', 'assistants-programmation'),
  ('infographic', '01b18d07-16d6-4faf-8ad4-159e2051c95d', 'Codex vs Claude Code — retrouver la même fonction', 'assistants-programmation'),
  ('infographic', 'f8b84d2a-93a4-46ae-b750-601fe85696d7', 'Qu’est-ce qu’un modèle multimodal?', 'multimodalite');

do $$
declare
  actual_published_articles integer;
  actual_published_infographics integer;
  actual_mappings integer;
begin
  if to_regclass('public.articles') is null
    or to_regclass('public.infographics') is null then
    raise exception 'Resource topics precondition failed: articles and infographics tables must exist.';
  end if;

  if to_regclass('public.resource_topics') is not null
    or to_regclass('public.resource_topic_memberships') is not null then
    raise exception 'Resource topics precondition failed: topic tables must not already exist.';
  end if;

  select count(*) into actual_published_articles
  from public.articles
  where status = 'published';

  select count(*) into actual_published_infographics
  from public.infographics
  where status = 'published';

  select count(*) into actual_mappings
  from resource_topic_backfill;

  if actual_published_articles <> 21 or actual_published_infographics <> 17 then
    raise exception
      'Resource topics precondition failed: expected 21 published articles and 17 published infographics, found % and %.',
      actual_published_articles,
      actual_published_infographics;
  end if;

  if actual_mappings <> 38 then
    raise exception
      'Resource topics precondition failed: expected 38 explicit mappings, found %.',
      actual_mappings;
  end if;

  if exists (
    select 1
    from resource_topic_backfill mapping
    left join (
      select 'article'::text as resource_type, id, title, status
      from public.articles
      union all
      select 'infographic'::text as resource_type, id, title, status
      from public.infographics
    ) resource
      on resource.resource_type = mapping.resource_type
      and resource.id = mapping.resource_id
    where resource.id is null
      or resource.status <> 'published'
      or resource.title is distinct from mapping.expected_title
  ) then
    raise exception 'Resource topics precondition failed: an explicit mapping no longer matches its published resource id and title.';
  end if;

  if exists (
    select 1
    from (
      select 'article'::text as resource_type, id
      from public.articles
      where status = 'published'
      union all
      select 'infographic'::text as resource_type, id
      from public.infographics
      where status = 'published'
    ) resource
    left join resource_topic_backfill mapping
      on mapping.resource_type = resource.resource_type
      and mapping.resource_id = resource.id
    where mapping.resource_id is null
  ) then
    raise exception 'Resource topics precondition failed: a published resource has no explicit mapping.';
  end if;
end
$$;

create table public.resource_topics (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name_fr text not null,
  name_en text not null,
  description_fr text,
  description_en text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.resource_topic_memberships (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid not null
    references public.resource_topics(id) on delete cascade,
  article_id uuid
    references public.articles(id) on delete cascade,
  infographic_id uuid
    references public.infographics(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint resource_topic_memberships_exactly_one_resource_check
    check (num_nonnulls(article_id, infographic_id) = 1)
);

create unique index resource_topic_memberships_topic_article_uidx
  on public.resource_topic_memberships (topic_id, article_id)
  where article_id is not null;

create unique index resource_topic_memberships_topic_infographic_uidx
  on public.resource_topic_memberships (topic_id, infographic_id)
  where infographic_id is not null;

create index resource_topic_memberships_topic_id_idx
  on public.resource_topic_memberships (topic_id);

create index resource_topic_memberships_article_id_idx
  on public.resource_topic_memberships (article_id)
  where article_id is not null;

create index resource_topic_memberships_infographic_id_idx
  on public.resource_topic_memberships (infographic_id)
  where infographic_id is not null;

create or replace function public.set_resource_topics_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.set_resource_topic_memberships_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger resource_topics_set_updated_at
  before update on public.resource_topics
  for each row
  execute function public.set_resource_topics_updated_at();

create trigger resource_topic_memberships_set_updated_at
  before update on public.resource_topic_memberships
  for each row
  execute function public.set_resource_topic_memberships_updated_at();

insert into public.resource_topics (
  slug,
  name_fr,
  name_en,
  description_fr,
  description_en
)
values
  ('fondamentaux-ia', 'Fondamentaux de l’IA', 'AI fundamentals', 'Notions panoramiques sur l’IA, l’apprentissage automatique et l’IA générative.', 'Overview concepts for AI, machine learning, and generative AI.'),
  ('modeles-de-langage', 'Modèles de langage', 'Language models', 'LLM, tokens, contexte, attention et génération de texte.', 'LLMs, tokens, context, attention, and text generation.'),
  ('prompting-interaction', 'Prompting et interaction', 'Prompting & interaction', 'Formulation des demandes, instructions, formats de sortie et interaction avec une IA.', 'Requests, instructions, output formats, and interaction with AI.'),
  ('rag-recherche-semantique', 'RAG et recherche sémantique', 'RAG & semantic search', 'RAG, embeddings, recherche sémantique, recherche vectorielle et récupération documentaire.', 'RAG, embeddings, semantic search, vector search, and document retrieval.'),
  ('agents-outils', 'Agents et outils', 'AI agents & tools', 'Agents IA, appels d’outils, connecteurs et outils utilisés par un modèle.', 'AI agents, tool calls, connectors, and tools used by a model.'),
  ('fiabilite-evaluation', 'Fiabilité et évaluation', 'Reliability & evaluation', 'Hallucinations, erreurs, vérification, fiabilité et évaluation.', 'Hallucinations, errors, verification, reliability, and evaluation.'),
  ('entrainement-adaptation', 'Entraînement et adaptation', 'Training & adaptation', 'Entraînement, inférence, paramètres, réglage fin et adaptation des modèles.', 'Training, inference, parameters, fine-tuning, and model adaptation.'),
  ('assistants-programmation', 'Assistants de programmation', 'Coding assistants', 'Assistants IA, CLI et pratiques de développement assisté.', 'AI assistants, CLIs, and AI-assisted development practices.'),
  ('multimodalite', 'Multimodalité', 'Multimodality', 'Modèles et interactions combinant texte, image, audio et vidéo.', 'Models and interactions combining text, images, audio, and video.');

insert into public.resource_topic_memberships (topic_id, article_id)
select topic.id, mapping.resource_id
from resource_topic_backfill mapping
join public.resource_topics topic on topic.slug = mapping.topic_slug
where mapping.resource_type = 'article';

insert into public.resource_topic_memberships (topic_id, infographic_id)
select topic.id, mapping.resource_id
from resource_topic_backfill mapping
join public.resource_topics topic on topic.slug = mapping.topic_slug
where mapping.resource_type = 'infographic';

alter table public.resource_topics enable row level security;
alter table public.resource_topic_memberships enable row level security;

create policy "Public can read resource topics"
  on public.resource_topics
  for select
  to anon, authenticated
  using (true);

create policy "Resources admin can manage resource topics"
  on public.resource_topics
  for all
  to authenticated
  using (public.is_resources_admin())
  with check (public.is_resources_admin());

create policy "Public can read published resource topic memberships"
  on public.resource_topic_memberships
  for select
  to anon, authenticated
  using (
    (
      article_id is not null
      and exists (
        select 1
        from public.articles article
        where article.id = resource_topic_memberships.article_id
          and article.status = 'published'
      )
    )
    or
    (
      infographic_id is not null
      and exists (
        select 1
        from public.infographics infographic
        where infographic.id = resource_topic_memberships.infographic_id
          and infographic.status = 'published'
      )
    )
  );

create policy "Resources admin can manage resource topic memberships"
  on public.resource_topic_memberships
  for all
  to authenticated
  using (public.is_resources_admin())
  with check (public.is_resources_admin());

revoke all on table public.resource_topics from anon, authenticated;
grant select (id, slug, name_fr, name_en, description_fr, description_en)
  on table public.resource_topics to anon;
grant select, insert, update, delete
  on table public.resource_topics to authenticated;

revoke all on table public.resource_topic_memberships from anon, authenticated;
grant select (id, topic_id, article_id, infographic_id)
  on table public.resource_topic_memberships to anon;
grant select, insert, update, delete
  on table public.resource_topic_memberships to authenticated;

do $$
declare
  expected_memberships integer := 38;
  actual_topics integer;
  actual_memberships integer;
  actual_published_resources integer;
  count_mismatches text;
begin
  select count(*) into actual_topics
  from public.resource_topics;

  if actual_topics <> 9 then
    raise exception 'Resource topics validation failed: expected 9 topics, found %.', actual_topics;
  end if;

  select count(*) into actual_memberships
  from public.resource_topic_memberships;

  if actual_memberships <> expected_memberships then
    raise exception 'Resource topics validation failed: expected % memberships, found %.', expected_memberships, actual_memberships;
  end if;

  select count(*) into actual_published_resources
  from (
    select id from public.articles where status = 'published'
    union all
    select id from public.infographics where status = 'published'
  ) published_resources;

  if actual_published_resources <> expected_memberships then
    raise exception 'Resource topics validation failed: expected % published resources, found %.', expected_memberships, actual_published_resources;
  end if;

  if exists (
    select 1
    from public.resource_topic_memberships
    where topic_id is null
      or num_nonnulls(article_id, infographic_id) <> 1
  ) then
    raise exception 'Resource topics validation failed: invalid membership resource shape.';
  end if;

  if exists (
    select 1
    from public.resource_topic_memberships membership
    left join public.resource_topics topic on topic.id = membership.topic_id
    left join public.articles article on article.id = membership.article_id
    left join public.infographics infographic on infographic.id = membership.infographic_id
    where topic.id is null
      or (membership.article_id is not null and article.id is null)
      or (membership.infographic_id is not null and infographic.id is null)
  ) then
    raise exception 'Resource topics validation failed: membership references a missing topic or resource.';
  end if;

  if exists (
    select 1
    from public.articles article
    left join public.resource_topic_memberships membership
      on membership.article_id = article.id
    where article.status = 'published'
    group by article.id
    having count(membership.id) <> 1
  ) or exists (
    select 1
    from public.infographics infographic
    left join public.resource_topic_memberships membership
      on membership.infographic_id = infographic.id
    where infographic.status = 'published'
    group by infographic.id
    having count(membership.id) <> 1
  ) then
    raise exception 'Resource topics validation failed: each published resource must have exactly one initial membership.';
  end if;

  with expected_counts(slug, resource_count) as (
    values
      ('fondamentaux-ia', 3),
      ('modeles-de-langage', 11),
      ('prompting-interaction', 6),
      ('rag-recherche-semantique', 5),
      ('agents-outils', 2),
      ('fiabilite-evaluation', 4),
      ('entrainement-adaptation', 2),
      ('assistants-programmation', 4),
      ('multimodalite', 1)
  ), actual_counts as (
    select topic.slug, count(membership.id)::integer as resource_count
    from public.resource_topics topic
    left join public.resource_topic_memberships membership on membership.topic_id = topic.id
    group by topic.slug
  )
  select string_agg(
    format('%s expected %s got %s', expected_counts.slug, expected_counts.resource_count, coalesce(actual_counts.resource_count, 0)),
    '; '
    order by expected_counts.slug
  )
  into count_mismatches
  from expected_counts
  left join actual_counts using (slug)
  where coalesce(actual_counts.resource_count, 0) <> expected_counts.resource_count;

  if count_mismatches is not null then
    raise exception 'Resource topics validation failed: %.', count_mismatches;
  end if;

  if exists (
    select 1
    from resource_topic_backfill mapping
    join public.resource_topics topic on topic.slug = mapping.topic_slug
    left join public.resource_topic_memberships membership
      on membership.topic_id = topic.id
      and (
        (mapping.resource_type = 'article' and membership.article_id = mapping.resource_id)
        or (mapping.resource_type = 'infographic' and membership.infographic_id = mapping.resource_id)
      )
    where membership.id is null
  ) then
    raise exception 'Resource topics validation failed: an explicit mapping has no matching membership.';
  end if;
end
$$;

drop table resource_topic_backfill;

commit;
