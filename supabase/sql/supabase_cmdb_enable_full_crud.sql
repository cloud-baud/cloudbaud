-- Enable full CRUD for authenticated users on CMDB applications
-- Run this in Supabase SQL editor for existing environments.

alter table if exists public.cmdb_applications enable row level security;

drop policy if exists "Admin write access" on public.cmdb_applications;
drop policy if exists "Authenticated write access" on public.cmdb_applications;

create policy "Authenticated write access"
on public.cmdb_applications for all
using (auth.role() = 'authenticated')
with check (auth.role() = 'authenticated');
