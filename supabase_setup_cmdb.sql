-- Create CMDB Applications Table
create table if not exists public.cmdb_applications (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  app_id text not null, -- Manual ID like 'APP-001'
  name text not null,
  domain text,
  hosting text, -- Netlify, Vercel, AWS, Azure, etc.
  github_repo text,
  status text default 'Active', -- Active, Development, Maintenance, In Development
  tier text default 'Production' -- Production, Staging
);

-- Enable RLS
alter table public.cmdb_applications enable row level security;

-- Policy: Read access for all authenticated users (Internal tool)
drop policy if exists "Authenticated read access" on public.cmdb_applications;
create policy "Authenticated read access"
on public.cmdb_applications for select
using (auth.role() = 'authenticated');

-- Policy: Admin write access (Jishnu only for now, or via role)
drop policy if exists "Admin write access" on public.cmdb_applications;
create policy "Admin write access"
on public.cmdb_applications for all
using (auth.jwt() ->> 'email' = 'jish.nath@cloudbaud.com')
with check (auth.jwt() ->> 'email' = 'jish.nath@cloudbaud.com');


-- Initial Seed Data
insert into public.cmdb_applications (app_id, name, domain, hosting, github_repo, status, tier)
values 
('APP-001', 'CloudBaud', 'cloudbaud.com', 'Netlify', 'cloudbaud-platform', 'Active', 'Production'),
('APP-002', 'Jishnu Nath Portfolio', 'jishnunath.com', 'Netlify', 'portfolio-v3', 'Active', 'Production'),
('APP-003', 'Synolic Tech', 'synolic.tech', 'Vercel', 'synolic-web', 'Active', 'Production'),
('APP-004', 'Systems Design Pro', 'systemsdesign.pro', 'Netlify', 'systems-design-pro', 'Active', 'Production'),
('APP-005', 'Mergers 360', 'mergers360.in', 'AWS', 'mergers360', 'In Development', 'Staging'),
('APP-006', 'LegalBench', 'legalbench.in', 'Azure', 'legalbench-core', 'Maintenance', 'Production'),
('APP-007', 'NRI Essentials', 'nriessentials.com', 'Netlify', 'nri-essentials', 'Active', 'Production'),
('APP-008', 'FIFA Social', 'fifasocial.live', 'Vercel', 'fifa-social-hub', 'Active', 'Production'),
('APP-009', 'Vloggers Own', 'vloggersown.in', 'Netlify', 'vloggers-own', 'Active', 'Production'),
('APP-010', 'Seattle Technical', 'seattletechnical.com', 'Netlify', 'seattle-tech-lms', 'Active', 'Production'),
('APP-011', 'Rudins Academy', 'rudinsacademy.com', 'AWS', 'rudins-lms', 'Active', 'Production'),
('APP-012', 'RealWiz Tech', 'realwiz.tech', 'Vercel', 'realwiz-platform', 'Development', 'Staging'),
('APP-013', 'Rudraja Brahmins', 'rudrajabrahmins.org', 'Netlify', 'rudraja-community', 'Active', 'Production')
on conflict do nothing; -- Simple conflict handling, though no unique constraint on name/app_id yet besides PK
