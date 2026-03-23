-- =============================================
-- Unified Contacts Table
-- Single store for Business, Tax Prep, Career, Personal contacts
-- =============================================

create table if not exists public.contacts (
    id         uuid primary key default gen_random_uuid(),
    user_id    uuid not null references auth.users(id) on delete cascade,
    name       text not null,
    company    text,
    title      text,
    email      text,
    phone      text,
    category   text not null default 'business'
               check (category in ('business', 'tax-prep', 'career', 'personal')),
    tags       text[] default '{}',
    notes      text,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- Index for fast category-scoped queries
create index if not exists idx_contacts_user_category
    on public.contacts (user_id, category);

-- =============================================
-- Row Level Security
-- =============================================
alter table public.contacts enable row level security;

-- Users can only see their own contacts
create policy "Users see own contacts"
    on public.contacts for select
    using (auth.uid() = user_id);

-- Users can insert their own contacts
create policy "Users insert own contacts"
    on public.contacts for insert
    with check (auth.uid() = user_id);

-- Users can update their own contacts
create policy "Users update own contacts"
    on public.contacts for update
    using (auth.uid() = user_id);

-- Users can delete their own contacts
create policy "Users delete own contacts"
    on public.contacts for delete
    using (auth.uid() = user_id);

-- =============================================
-- Auto-update updated_at on row change
-- =============================================
create or replace function public.handle_contacts_updated_at()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

create trigger trigger_contacts_updated_at
    before update on public.contacts
    for each row execute function public.handle_contacts_updated_at();

-- =============================================
-- Seed Demo Contacts (callable from app)
-- =============================================
create or replace function public.seed_demo_contacts()
returns void as $$
declare
    uid uuid := auth.uid();
begin
    -- Only seed if user has no contacts yet
    if exists (select 1 from public.contacts where user_id = uid limit 1) then
        return;
    end if;

    insert into public.contacts (user_id, name, company, title, email, phone, category, tags) values
    -- Business contacts
    (uid, 'Sarah Mitchell',   'Contoso Ltd',        'VP Engineering',     'sarah.m@contoso.com',      '206-555-0101', 'business',  '{client, enterprise}'),
    (uid, 'James Park',       'Northwind Traders',  'CTO',                'jpark@northwind.io',       '425-555-0102', 'business',  '{prospect}'),
    (uid, 'Priya Sharma',     'Fabrikam Inc',       'Director of IT',     'priya@fabrikam.com',       '206-555-0103', 'business',  '{client, partner}'),
    (uid, 'Michael Chen',     'Adventure Works',    'Data Platform Lead', 'mchen@adventureworks.com', '425-555-0104', 'business',  '{prospect, referral}'),
    (uid, 'Lisa Rodriguez',   'Tailspin Toys',      'Head of Analytics',  'lisa.r@tailspin.com',      '206-555-0105', 'business',  '{client}'),

    -- Tax Prep contacts
    (uid, 'Robert Kim',       'Kim & Associates',   'CPA',                'rkim@kimcpa.com',          '425-555-0201', 'tax-prep',  '{cpa, primary}'),
    (uid, 'Amanda Foster',    'TurboTax Pro',       'Tax Advisor',        'afoster@intuit.com',       '800-555-0202', 'tax-prep',  '{advisor}'),

    -- Career contacts
    (uid, 'David Nguyen',     'TechRecruiters Pro', 'Senior Recruiter',   'dnguyen@techrecruit.com',  '206-555-0301', 'career',    '{recruiter, active}'),
    (uid, 'Emily Watson',     'Microsoft',          'Hiring Manager',     'emwatson@microsoft.com',   '425-555-0302', 'career',    '{hiring-manager}'),

    -- Personal contacts
    (uid, 'Dr. Karen Lee',    'Seattle Medical',    'Physician',          'klee@seattlemed.org',      '206-555-0401', 'personal',  '{doctor, primary}'),
    (uid, 'Tom Bradley',      'State Farm',         'Insurance Agent',    'tbradley@statefarm.com',   '425-555-0402', 'personal',  '{insurance}');
end;
$$ language plpgsql security definer;
