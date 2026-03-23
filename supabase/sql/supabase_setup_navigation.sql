-- Create Site Navigation Table
create table if not exists public.site_navigation (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  label text not null,
  path text not null,
  order_index integer default 0,
  is_active boolean default true,
  parent_id uuid references public.site_navigation(id),
  icon text -- Optional icon override
);

-- Enable RLS
alter table public.site_navigation enable row level security;

-- Policy: Public read
drop policy if exists "Public read access" on public.site_navigation;
create policy "Public read access"
on public.site_navigation for select
using (true);

-- Policy: Admin write (Restrict to jish.nath@cloudbaud.com)
-- Note: 'auth.jwt()' retrieves the JSON Web Token. verify 'email' claim.
drop policy if exists "Admin write access" on public.site_navigation;
create policy "Admin write access"
on public.site_navigation for all
using (auth.jwt() ->> 'email' = 'jish.nath@cloudbaud.com')
with check (auth.jwt() ->> 'email' = 'jish.nath@cloudbaud.com');

-- Initial Seed (Idempotent)
insert into public.site_navigation (label, path, order_index)
select 'Data Engineering', '/capabilities/data-engineering', 1
where not exists (select 1 from public.site_navigation where path = '/capabilities/data-engineering');

insert into public.site_navigation (label, path, order_index)
select 'AI Engineering', '/ai-engineering', 2
where not exists (select 1 from public.site_navigation where path = '/ai-engineering');

insert into public.site_navigation (label, path, order_index)
select 'App Dev', '/capabilities/custom-applications', 3
where not exists (select 1 from public.site_navigation where path = '/capabilities/custom-applications');

insert into public.site_navigation (label, path, order_index)
select 'Platforms', '/capabilities/devops-infrastructure', 4
where not exists (select 1 from public.site_navigation where path = '/capabilities/devops-infrastructure');
