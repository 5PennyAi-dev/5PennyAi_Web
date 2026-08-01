-- Authenticated non-admin users must retain the same read access to published
-- articles as anonymous visitors. The original policy targets anon only.

drop policy if exists "Authenticated can read published articles"
  on public.articles;
create policy "Authenticated can read published articles"
  on public.articles
  for select
  to authenticated
  using (status = 'published');
