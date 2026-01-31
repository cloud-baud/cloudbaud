-- Create the Assessments table for tracking discovery wizard submissions
create table if not exists public.assessments (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_email text not null,
  user_name text,
  organization text,
  industry text,
  status text default 'pending'::text, -- 'pending', 'reviewed', 'contacted'
  data jsonb not null, -- Stores the full form payload
  type text not null -- e.g., 'microsoft-fabric', 'azure-databricks'
);

-- Enable RLS
alter table public.assessments enable row level security;

-- Policy: Allow authenticated users to insert their own assessments
-- (Or allow anon if public discovery is allowed, assuming anon key usage)
create policy "Allow insert for all users"
on public.assessments
for insert
with check (true);

-- Policy: Allow users to view their own assessments (based on email match or auth.uid())
-- Assuming email matching for now since auth might be loose
create policy "Allow select for own email"
on public.assessments
for select
using (auth.uid() = id); -- This is placeholder, real policy depends on auth setup.
-- If using anon key without auth, we might just allow insert and select by ID if known.

-- For admin dashboard (service role will bypass RLS), but for client dashboard:
create policy "Allow read for own records"
on public.assessments
for select
using (true); -- TEMPORARY: Allow reading all (for demo dashboard simplicity)
--Ideally: auth.uid() = user_id if we store user_id.

-- Add user_id column if linking to auth.users
alter table public.assessments add column if not exists user_id uuid references auth.users(id);

-- Update policy to use user_id if available
drop policy if exists "Allow read for own records" on public.assessments;
create policy "Allow read for own records"
on public.assessments
for select
using (auth.uid() = user_id);
