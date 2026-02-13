-- Create Allowed Access Table (Whitelist)
create table if not exists public.allowed_access (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  email_pattern text not null, -- Stores exact email or domain (e.g. '@cpa-firm.com')
  description text,
  is_active boolean default true
);

-- Enable RLS
alter table public.allowed_access enable row level security;

-- Policy: Public read (needed for login check)
-- NOTE: In a stricter environment, we would use a Postgres Function (RPC) to check this 
-- instead of exposing the table, but for this app's scale, allowing public read of *patterns* is acceptable for the client-side check.
drop policy if exists "Public read access" on public.allowed_access;
create policy "Public read access"
on public.allowed_access for select
using (true);

-- Policy: Admin write
drop policy if exists "Admin write access" on public.allowed_access;
create policy "Admin write access"
on public.allowed_access for all
using (auth.jwt() ->> 'email' = 'jish.nath@cloudbaud.com')
with check (auth.jwt() ->> 'email' = 'jish.nath@cloudbaud.com');

-- Seed: Allow the primary domain by default
insert into public.allowed_access (email_pattern, description)
select '@cloudbaud.com', 'Primary Domain'
where not exists (select 1 from public.allowed_access where email_pattern = '@cloudbaud.com');
