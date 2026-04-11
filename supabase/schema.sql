-- 5PennyAi blog schema
-- Run this in the Supabase SQL editor (https://supabase.com/dashboard → your project → SQL Editor).

create table posts (
  id uuid default gen_random_uuid() primary key,
  slug text unique not null,
  status text default 'draft' check (status in ('draft', 'published', 'archived')),

  -- FR content
  title_fr text not null,
  excerpt_fr text,
  content_fr text not null,

  -- EN content
  title_en text,
  excerpt_en text,
  content_en text,

  -- Media
  cover_image text, -- Public URL from the Storage bucket

  -- Metadata
  tags text[] default '{}',
  author text default 'Christian Couillard',
  reading_time_minutes int,

  -- SEO
  meta_title_fr text,
  meta_description_fr text,
  meta_title_en text,
  meta_description_en text,

  -- Dates
  published_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Indexes for frequent queries
create index idx_posts_status on posts(status);
create index idx_posts_published_at on posts(published_at desc);
create index idx_posts_slug on posts(slug);

-- Auto-update updated_at on every row change
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger posts_updated_at
  before update on posts
  for each row
  execute function update_updated_at();

-- Row level security
alter table posts enable row level security;

-- Public can only read published posts
create policy "Public can read published posts"
  on posts for select
  using (status = 'published');

-- Service role (server-side, e.g. n8n workflows) has full access
create policy "Service role full access"
  on posts for all
  using (auth.role() = 'service_role');

-- Authenticated users can manage posts (admin UI in the site uses supabase.auth)
-- The frontend still gates the UI by email (see src/components/admin/AdminGuard.jsx),
-- so this policy is scoped to any authenticated session.
create policy "Authenticated can manage posts"
  on posts for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- =============================================================================
-- STORAGE BUCKET — manual setup in the Supabase Dashboard
-- =============================================================================
-- 1. Storage → New bucket → name: "blog-images", public: true.
-- 2. Policies on the bucket:
--    a) Public read:
--       create policy "Public read blog-images"
--         on storage.objects for select
--         using (bucket_id = 'blog-images');
--    b) Authenticated upload (used by the admin UI):
--       create policy "Authenticated upload blog-images"
--         on storage.objects for insert
--         with check (bucket_id = 'blog-images' and auth.role() = 'authenticated');
-- 3. The n8n workflow uses the service_role key and bypasses RLS.
-- 4. Public URL format:
--    https://[PROJECT_ID].supabase.co/storage/v1/object/public/blog-images/[filename]
