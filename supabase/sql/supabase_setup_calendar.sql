-- Create Calendar Events Table
create table if not exists public.calendar_events (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  title text not null,
  description text,
  start_time timestamp with time zone not null,
  end_time timestamp with time zone not null,
  category text default 'General', -- Business, Personal, Deadline, Meeting
  is_all_day boolean default false,
  user_email text, -- For simple ownership tracking
  color text -- Hex code for category color override
);

-- Enable RLS
alter table public.calendar_events enable row level security;

-- Policy: Read access for authenticated users
drop policy if exists "Authenticated read access" on public.calendar_events;
create policy "Authenticated read access"
on public.calendar_events for select
using (auth.role() = 'authenticated');

-- Policy: Insert/Update/Delete for now: Open to authenticated (collab site)
-- In a real app, you might restrict this to owner or admin. 
-- For this demo, let's allow all authenticated users to manage events.
drop policy if exists "Authenticated write access" on public.calendar_events;
create policy "Authenticated write access"
on public.calendar_events for all
using (auth.role() = 'authenticated')
with check (auth.role() = 'authenticated');

-- Seed Data
insert into public.calendar_events (title, start_time, end_time, category, user_email, description)
values 
('Quarterly Business Review', now() + interval '2 days', now() + interval '2 days' + interval '2 hours', 'Business', 'jish.nath@cloudbaud.com', 'Reviewing Q1 performance.'),
('Team Lunch', now() + interval '5 days', now() + interval '5 days' + interval '1 hour', 'Social', 'jish.nath@cloudbaud.com', 'Monthly team bonding.'),
('Project Deadline', now() + interval '10 days', now() + interval '10 days' + interval '1 day', 'Deadline', 'jish.nath@cloudbaud.com', 'Final delivery of MVP.'),
('Client Meeting - Acme Corp', now() - interval '1 day', now() - interval '1 day' + interval '1 hour', 'Meeting', 'jish.nath@cloudbaud.com', 'Sync updates.');
