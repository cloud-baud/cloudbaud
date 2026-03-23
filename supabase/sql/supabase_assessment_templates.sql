-- Create table for Assessment Templates (Schema/Questions)
create table if not exists public.assessment_templates (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  slug text not null, -- e.g., 'data-engineering'
  version integer not null default 1,
  title text not null,
  description text,
  content jsonb not null, -- Stores the 'steps' and 'fields' array
  is_active boolean default false,
  
  -- Ensure unique version per slug
  unique(slug, version)
);

-- Enable RLS
alter table public.assessment_templates enable row level security;

-- Policy: Allow public/anon to read active templates
drop policy if exists "Allow public read of active templates" on public.assessment_templates;
create policy "Allow public read of active templates"
on public.assessment_templates
for select
using (is_active = true);

-- Policy: Allow authenticated/admins to CRUD (simplified for now)
drop policy if exists "Allow internal management" on public.assessment_templates;
create policy "Allow internal management"
on public.assessment_templates
for all
using (auth.role() = 'authenticated') -- Adjust if you have specific admin roles
with check (auth.role() = 'authenticated');
