
-- MASTER DEPLOYMENT SCRIPT FOR TAX DASHBOARD
-- Combined Schema (V2 + V3), Functions, RLS, and Seed Data.
-- Run this to reset and initialize the Tax DB.

BEGIN;

-- 1. CLEANUP (Drop existing to ensure fresh state)
drop table if exists public.tax_evidence_links cascade;
drop table if exists public.cpa_mappings cascade;
drop table if exists public.client_input_values cascade;
drop table if exists public.client_input_categories cascade;
drop table if exists public.irs_form_definitions cascade;
drop table if exists public.entry_evidence cascade;
drop table if exists public.tax_documents cascade;
drop table if exists public.tax_audit_log cascade;
drop table if exists public.tax_entries cascade;
drop table if exists public.tax_year_schema_defs cascade;
drop table if exists public.chart_of_accounts cascade;
drop table if exists public.user_tax_state cascade; -- Legacy V1

-- 2. EXTENSIONS
create extension if not exists "uuid-ossp";

-- 3. TABLES (V2 + V3 merged)

-- Stable Concepts (The Grid Rows)
create table public.chart_of_accounts (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) not null,
    name text not null, 
    type text not null, -- 'INCOME', 'EXPENSE', 'ASSET', 'LIABILITY'
    section text, -- 'w2', 'biz', 'rental', 'ira', 'deductions', 'taxes'
    sort_order integer default 0,
    created_at timestamptz default now()
);

-- Year-Specific Form Definitions
create table public.tax_year_schema_defs (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) not null,
    year integer not null,
    account_id uuid references public.chart_of_accounts(id),
    form_number text, 
    line_number text, 
    line_description text,
    is_active boolean default true,
    unique(user_id, year, form_number, line_number)
);

-- Tax Entries (The Values)
create table public.tax_entries (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) not null,
    account_id uuid references public.chart_of_accounts(id) not null,
    year integer not null,
    amount numeric(15, 2) default 0,
    notes text,
    status text default 'DRAFT',
    updated_by uuid references auth.users(id),
    updated_at timestamptz default now(),
    unique(user_id, account_id, year)
);

-- Documents
create table public.tax_documents (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) not null,
    filename text not null,
    storage_path text not null,
    file_size_bytes bigint,
    mime_type text,
    year integer,
    doc_type text, 
    extracted_text text,
    created_at timestamptz default now()
);

-- Evidence Links
create table public.entry_evidence (
    id uuid default gen_random_uuid() primary key,
    entry_id uuid references public.tax_entries(id) on delete cascade not null,
    document_id uuid references public.tax_documents(id) on delete cascade not null,
    page_number integer default 1,
    notes text,
    created_at timestamptz default now()
);

-- Audit Log
create table public.tax_audit_log (
    id uuid default gen_random_uuid() primary key,
    table_name text not null,
    record_id uuid not null,
    user_id uuid references auth.users(id) not null,
    action text not null,
    old_value jsonb,
    new_value jsonb,
    timestamp timestamptz default now()
);

-- 4. RLS POLICIES
alter table public.chart_of_accounts enable row level security;
alter table public.tax_entries enable row level security;
alter table public.tax_documents enable row level security;
alter table public.entry_evidence enable row level security;
alter table public.tax_audit_log enable row level security;

create policy "Users manage own COA" on public.chart_of_accounts for all using (auth.uid() = user_id);
create policy "Users manage own entries" on public.tax_entries for all using (auth.uid() = user_id);
create policy "Users manage own docs" on public.tax_documents for all using (auth.uid() = user_id);
create policy "Users manage own evidence" on public.entry_evidence for all using (exists (select 1 from public.tax_entries where id = entry_evidence.entry_id and user_id = auth.uid()));
create policy "Users view own audit" on public.tax_audit_log for select using (auth.uid() = user_id);

-- 5. FUNCTIONS

-- RPC: Update Tax Cell (Transactional with Audit)
create or replace function public.update_tax_cell(
    p_account_id uuid,
    p_year integer,
    p_amount numeric,
    p_notes text default null
) returns jsonb language plpgsql security definer as $$
declare
    v_user_id uuid;
    v_entry_id uuid;
    v_old_data jsonb;
    v_new_data jsonb;
begin
    v_user_id := auth.uid();
    if v_user_id is null then raise exception 'Not authenticated'; end if;

    if not exists (select 1 from public.chart_of_accounts where id = p_account_id and user_id = v_user_id) then
        raise exception 'Account not found or access denied';
    end if;

    select to_jsonb(t.*) into v_old_data from public.tax_entries t 
    where account_id = p_account_id and year = p_year and user_id = v_user_id;

    insert into public.tax_entries (user_id, account_id, year, amount, notes, updated_by, updated_at)
    values (v_user_id, p_account_id, p_year, p_amount, p_notes, v_user_id, now())
    on conflict (user_id, account_id, year) 
    do update set amount = p_amount, notes = coalesce(p_notes, tax_entries.notes), updated_by = v_user_id, updated_at = now()
    returning id, to_jsonb(tax_entries.*) into v_entry_id, v_new_data;

    insert into public.tax_audit_log (table_name, record_id, user_id, action, old_value, new_value)
    values ('tax_entries', v_entry_id, v_user_id, 
            case when v_old_data is null then 'INSERT' else 'UPDATE' end, 
            v_old_data, v_new_data);

    return v_new_data;
end;
$$;

-- 6. SEED DATA (For the Primary User)
DO $$
DECLARE
    v_user_id uuid;
BEGIN
    -- Attempt to find the user.
    -- If running as Service Role, auth.uid() is null. We need a fallback.
    -- We'll take the most recently created user as the "Owner".
    select id into v_user_id from auth.users order by created_at desc limit 1;
    
    IF v_user_id IS NULL THEN
        RAISE NOTICE 'No user found in auth.users. Skipping seed data.';
        RETURN;
    END IF;

    -- 1. W2
    insert into public.chart_of_accounts (user_id, name, type, section, sort_order) values
    (v_user_id, 'W2 Wages', 'INCOME', 'w2', 10),
    (v_user_id, 'Taxes Withheld', 'EXPENSE', 'w2', 20);

    -- 2. Business
    insert into public.chart_of_accounts (user_id, name, type, section, sort_order) values
    (v_user_id, '1. Comfort Foods (dba Robertos Pizza)', 'INCOME', 'biz', 10),
    (v_user_id, '2. CloudBaud LLC', 'INCOME', 'biz', 20),
    (v_user_id, '3. Teaching Income', 'INCOME', 'biz', 30),
    (v_user_id, '4. Canada Condo Sale', 'INCOME', 'biz', 40);

    -- 3. Rental
    insert into public.chart_of_accounts (user_id, name, type, section, sort_order) values
    (v_user_id, '1. Olympic Court', 'INCOME', 'rental', 10),
    (v_user_id, '2. Cherry Crest', 'INCOME', 'rental', 20),
    (v_user_id, '3. Woodridge', 'INCOME', 'rental', 30);

    -- 4. IRA
    insert into public.chart_of_accounts (user_id, name, type, section, sort_order) values
    (v_user_id, 'Jishnu Roth IRA', 'ASSET', 'ira', 10),
    (v_user_id, 'Deepika ROTH IRA', 'ASSET', 'ira', 20),
    (v_user_id, 'SEP IRA', 'ASSET', 'ira', 30),
    (v_user_id, '1099-R', 'INCOME', 'ira', 40),
    (v_user_id, 'Child Education Fund', 'ASSET', 'ira', 50);

    -- 5. Deductions
    insert into public.chart_of_accounts (user_id, name, type, section, sort_order) values
    (v_user_id, 'Real Estate Interest Woodridge', 'EXPENSE', 'deductions', 10),
    (v_user_id, 'Real Estate Interest Lake Hills', 'EXPENSE', 'deductions', 20),
    (v_user_id, 'Real Estate Interest Olympic Court', 'EXPENSE', 'deductions', 30);

    -- 6. Taxes
    insert into public.chart_of_accounts (user_id, name, type, section, sort_order) values
    (v_user_id, 'Real Estate Taxes Woodridge', 'EXPENSE', 'taxes', 10),
    (v_user_id, 'Real Estate Taxes Cherry Crest', 'EXPENSE', 'taxes', 20),
    (v_user_id, 'Real Estate Taxes Lake Hills', 'EXPENSE', 'taxes', 30),
    (v_user_id, 'Real Estate Taxes Olympic Court', 'EXPENSE', 'taxes', 40),
    (v_user_id, 'Real Estate Taxes Rudins Lounge', 'EXPENSE', 'taxes', 50);

END $$;

COMMIT;
