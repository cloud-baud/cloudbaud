
-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Chart of Accounts (COA)
-- Defines the structure of the financial data (Rows in the grid)
create table public.chart_of_accounts (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) not null,
    code text, -- distinct code (optional for simple users, but good practice)
    name text not null, -- "W2 Wages", "Comfort Foods", etc.
    type text not null check (type in ('INCOME', 'EXPENSE', 'ASSET', 'LIABILITY', 'EQUITY')),
    parent_id uuid references public.chart_of_accounts(id), -- Hierarchy support
    section text, -- UI grouping key: 'w2', 'biz', 'rental', 'deductions'
    sort_order integer default 0,
    created_at timestamptz default now()
);

-- 2. Tax Entries (The actual cell values)
-- Normalized: One row per cell (Account + Year)
create table public.tax_entries (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) not null,
    account_id uuid references public.chart_of_accounts(id) on delete cascade not null,
    year integer not null, -- Calendar Year (Column in grid)
    amount numeric(15, 2) default 0, -- The value
    notes text,
    status text default 'DRAFT', -- DRAFT, REVIEW, FINAL
    updated_by uuid references auth.users(id), -- Last person to touch it
    updated_at timestamptz default now(),
    
    unique(user_id, account_id, year) -- One entry per account per year
);

-- 3. Tax Documents (Files)
-- Metadata for uploaded PDFs
create table public.tax_documents (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) not null,
    filename text not null,
    storage_path text not null, -- Path in 'tax-docs' bucket
    file_size_bytes bigint,
    mime_type text,
    year integer, -- Optional: If associated generally with a tax year
    doc_type text, -- 'W2', '1099', 'RECEIPT', 'RETURN'
    extracted_text text, -- OCR/LLM extracted content
    created_at timestamptz default now()
);

-- 4. Entry Evidence (Linking Cells to Docs)
-- Many-to-Many: One cell can have multiple docs, one doc can support multiple cells
create table public.entry_evidence (
    id uuid default gen_random_uuid() primary key,
    entry_id uuid references public.tax_entries(id) on delete cascade not null,
    document_id uuid references public.tax_documents(id) on delete cascade not null,
    page_number integer default 1,
    notes text,
    created_at timestamptz default now()
);

-- 5. Audit Log (Versioning)
-- Immutable record of every change
create table public.tax_audit_log (
    id uuid default gen_random_uuid() primary key,
    table_name text not null, -- 'tax_entries', 'chart_of_accounts'
    record_id uuid not null,
    user_id uuid references auth.users(id) not null, -- Who did it
    action text not null, -- 'INSERT', 'UPDATE', 'DELETE'
    old_value jsonb, -- Snapshot before change
    new_value jsonb, -- Snapshot after change
    timestamp timestamptz default now()
);

-- RLS Policies
-- Simple ownership model: Users see their own data
alter table public.chart_of_accounts enable row level security;
alter table public.tax_entries enable row level security;
alter table public.tax_documents enable row level security;
alter table public.entry_evidence enable row level security;
alter table public.tax_audit_log enable row level security;

-- COA Policies
create policy "Users manage own COA" on public.chart_of_accounts for all using (auth.uid() = user_id);

-- Entry Policies
create policy "Users manage own entries" on public.tax_entries for all using (auth.uid() = user_id);

-- Document Policies
create policy "Users manage own docs" on public.tax_documents for all using (auth.uid() = user_id);

-- Evidence Policies
create policy "Users manage own evidence" on public.entry_evidence for all using (
    exists (select 1 from public.tax_entries where id = entry_evidence.entry_id and user_id = auth.uid())
);

-- Audit Log (Read Only for Users, Insert via Trigger/Function)
create policy "Users view own audit" on public.tax_audit_log for select using (auth.uid() = user_id);

-- FUNCTIONS (The "API Layer" inside Postgres)

-- Function: update_tax_cell
-- Transactionally updates a cell and logs the audit trail
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
    -- Get current user
    v_user_id := auth.uid();
    if v_user_id is null then raise exception 'Not authenticated'; end if;

    -- Verify Account ownership
    if not exists (select 1 from public.chart_of_accounts where id = p_account_id and user_id = v_user_id) then
        raise exception 'Account not found or access denied';
    end if;

    -- Get existing entry (if any) for Audit
    select to_jsonb(t.*) into v_old_data from public.tax_entries t 
    where account_id = p_account_id and year = p_year and user_id = v_user_id;

    -- Upsert Entry
    insert into public.tax_entries (user_id, account_id, year, amount, notes, updated_by, updated_at)
    values (v_user_id, p_account_id, p_year, p_amount, p_notes, v_user_id, now())
    on conflict (user_id, account_id, year) 
    do update set amount = p_amount, notes = coalesce(p_notes, tax_entries.notes), updated_by = v_user_id, updated_at = now()
    returning id, to_jsonb(tax_entries.*) into v_entry_id, v_new_data;

    -- Audit Log
    insert into public.tax_audit_log (table_name, record_id, user_id, action, old_value, new_value)
    values ('tax_entries', v_entry_id, v_user_id, 
            case when v_old_data is null then 'INSERT' else 'UPDATE' end, 
            v_old_data, v_new_data);

    return v_new_data;
end;
$$;
