
-- ---------------------------------------------------------------------------
-- UNIVERSAL ACCOUNTING SCHEMA (The "Higher Level Stuff")
-- Shared by Tax, Bookkeeping, FinOps, and Invoicing
-- ---------------------------------------------------------------------------

BEGIN;

-- 1. UNIVERSAL CHART OF ACCOUNTS (UCOA)
-- This is the master list. Not just for taxes.
create table public.universal_coa (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) not null,
    
    -- The Standard Code (e.g., "4110")
    code text not null, 
    
    -- The Name (e.g., "Cloud Consulting Fees")
    name text not null,
    
    -- The Type (Standard Accounting Types)
    type text not null check (type in ('ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE')),
    
    -- Hierarchy support (Optional parent-child)
    parent_id uuid references public.universal_coa(id),
    
    -- For reporting (UI grouping)
    category text, -- 'Current Assets', 'Operating Expense', 'Professional Services'
    
    description text,
    is_active boolean default true,
    
    created_at timestamptz default now(),
    unique(user_id, code) -- Ensure unique codes per user
);

-- 2. TAGGING & CONTEXT (The Association Layer)
-- Allows a single account to be "tagged" for different purposes
create table public.account_tags (
    id uuid default gen_random_uuid() primary key,
    account_id uuid references public.universal_coa(id) not null,
    tag_name text not null, -- 'tax-deductible', 'startup-cost', 'project-alpha', 'personal'
    tag_value text, -- Optional value
    unique(account_id, tag_name)
);

-- 3. LEDGER ENTRIES (The "General Ledger")
-- A true double-entry potential, or simple single-entry if preferred
create table public.ledger_entries (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) not null,
    
    transaction_date date not null,
    description text not null, -- "Payment from Client X"
    
    -- Source Reference (Invoice #, Stripe ID, etc.)
    reference_source text,
    reference_id text,

    created_at timestamptz default now()
);

-- 4. LEDGER LINES (The Splits)
create table public.ledger_lines (
    id uuid default gen_random_uuid() primary key,
    entry_id uuid references public.ledger_entries(id) not null,
    account_id uuid references public.universal_coa(id) not null,
    
    debit numeric(15,2) default 0,
    credit numeric(15,2) default 0,
    
    -- For Tax Dashboard Views (The "Year" context is derived from transaction_date)
    memo text
);

-- 5. VIEW: TAX DASHBOARD VIEW
-- This view simulates the "Tax Grid" by aggregating the General Ledger
-- This is how we "associate" the High Level Stuff to the specific Tax View
create or replace view view_tax_dashboard_grid as
select 
    c.id as account_id,
    c.name as account_name,
    c.code as account_code,
    extract(year from e.transaction_date) as tax_year,
    sum(l.credit - l.debit) as net_amount -- Simply Net for now (Revenue - Expense)
from public.universal_coa c
left join public.ledger_lines l on c.id = l.account_id
left join public.ledger_entries e on l.entry_id = e.id
where c.type in ('REVENUE', 'EXPENSE') -- Tax dashboard cares mostly about P&L
group by c.id, c.name, c.code, tax_year;

COMMIT;
