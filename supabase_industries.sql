-- Create the Industries table
create table if not exists public.industries (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  slug text not null unique,
  name text not null,
  icon text, -- Lucide icon name
  description text,
  content jsonb default '{}'::jsonb, -- Stores arrays like challenges, solutions, and nested objects like caseStudy
  is_active boolean default true
);

-- Enable RLS
alter table public.industries enable row level security;

-- Policy: Allow public read access (for the website)
drop policy if exists "Allow public read of industries" on public.industries;
create policy "Allow public read of industries"
on public.industries
for select
using (true);

-- Policy: Allow authenticated/internal users to manage
drop policy if exists "Allow internal management of industries" on public.industries;
create policy "Allow internal management of industries"
on public.industries
for all
using (auth.role() = 'authenticated')
with check (auth.role() = 'authenticated');
