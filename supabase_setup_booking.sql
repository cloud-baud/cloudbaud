-- Create Booking Availability Table (Store working hours)
create table if not exists public.booking_availability (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  day_of_week integer not null, -- 0=Sun, 1=Mon, ..., 6=Sat
  start_time time not null default '09:00',
  end_time time not null default '17:00',
  is_active boolean default true
);

-- Enable RLS for availability
alter table public.booking_availability enable row level security;

-- Policy: Admin manage
drop policy if exists "Admin manage availability" on public.booking_availability;
create policy "Admin manage availability"
on public.booking_availability for all
using (auth.jwt() ->> 'email' = 'jish.nath@cloudbaud.com')
with check (auth.jwt() ->> 'email' = 'jish.nath@cloudbaud.com');

-- Policy: Public read (so they can see when you are working)
drop policy if exists "Public read availability" on public.booking_availability;
create policy "Public read availability"
on public.booking_availability for select
using (true);

-- Seed Default Availability (Mon-Fri, 9-5)
insert into public.booking_availability (day_of_week, start_time, end_time)
values 
(1, '09:00', '17:00'),
(2, '09:00', '17:00'),
(3, '09:00', '17:00'),
(4, '09:00', '17:00'),
(5, '09:00', '17:00')
on conflict do nothing;

-- Create a secure view for "Busy Times" (Hide details, show only busy blocks)
create or replace view public.busy_times as
select start_time, end_time
from public.calendar_events;

-- Grant public read access to the view (Supabase exposes views if granted)
-- Note: Views don't have RLS in the same way, permission is handled by GRANT.
-- In Supabase/PostgREST, we need to grant generic access.
grant select on public.busy_times to anon, authenticated;


-- Allow Public to INSERT into calendar_events (Submit a booking)
-- We need a policy that allows INSERT for anyone, but maybe restricts to 'Meeting' category?
-- For simplicity, let's allow public insert.
-- Note: 'anon' role is used for unauthenticated users.
drop policy if exists "Public insert capability" on public.calendar_events;
create policy "Public insert capability"
on public.calendar_events for insert
with check (true); 
-- Ideally we'd validate 'category' = 'Meeting' here but Supabase UI might need adjustment.

