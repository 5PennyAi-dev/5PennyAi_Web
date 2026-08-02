-- Ressources IA — MVP 2.0, increment 3
-- Keep article-assets private. Public rendering continues to use short-lived signed URLs.

drop policy if exists "Public can read published article media assets"
  on public.article_media_assets;
create policy "Public can read published article media assets"
  on public.article_media_assets
  for select
  to anon
  using (
    exists (
      select 1
      from public.articles
      where articles.id = article_media_assets.article_id
        and articles.status = 'published'
    )
  );

drop policy if exists "Authenticated can read published article media assets"
  on public.article_media_assets;
create policy "Authenticated can read published article media assets"
  on public.article_media_assets
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.articles
      where articles.id = article_media_assets.article_id
        and articles.status = 'published'
    )
  );

grant select on table public.article_media_assets to anon, authenticated;

drop policy if exists "Public can read published article files" on storage.objects;
create policy "Public can read published article files"
  on storage.objects
  for select
  to anon, authenticated
  using (
    bucket_id = 'article-assets'
    and (storage.foldername(name))[1] = 'articles'
    and nullif((storage.foldername(name))[2], '') is not null
    and exists (
      select 1
      from public.articles
      where articles.id::text = (storage.foldername(name))[2]
        and articles.status = 'published'
    )
  );

grant select on table storage.objects to anon, authenticated;
