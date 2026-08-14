
-- ... (Previous ID/User setup)

-- 1. Master Concepts (The "Grid" Rows - Normalized for comparison)
-- These are stable concepts like "W2 Wages", "CloudBaud Income"
create table public.chart_of_accounts (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) not null,
    name text not null, -- "W2 Wages"
    type text not null, -- 'INCOME', etc.
    section text, -- 'w2', 'biz'
    sort_order integer default 0,
    created_at timestamptz default now()
);

-- 2. Year-Specific Schema (The "Tax Form" Reality)
-- Handles the fact that 2022 form is different from 2023
create table public.tax_year_schema_defs (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) not null,
    year integer not null,
    
    -- Integration: Maps this year's specific line to the Master Concept
    account_id uuid references public.chart_of_accounts(id),
    
    form_number text, -- '1040', 'Schedule C'
    line_number text, -- '1a', 'Line 31'
    line_description text, -- "Wages, salaries, tips" (changes by year)
    
    is_active boolean default true, -- Did this apply this year?
    
    unique(user_id, year, form_number, line_number)
);

-- 3. Tax Entries (Values) linked to the MASTER Concept (for grid) 
-- BUT we can also link to the specific Schema Def if needed
create table public.tax_entries (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) not null,
    
    account_id uuid references public.chart_of_accounts(id) not null, -- The stable concept
    year integer not null,
    
    amount numeric(15, 2),
    notes text,
    
    -- Optional: Link to specific form line definition for that year
    schema_def_id uuid references public.tax_year_schema_defs(id),
    
    updated_by uuid references auth.users(id),
    updated_at timestamptz default now(),
    
    unique(user_id, account_id, year)
);

-- ... (Rest of tables: documents, evidence, audit_log remain same)

-- Updated Function to handle the join
create or replace function public.get_tax_grid(p_year integer)
returns table (
    account_name text,
    section text,
    amount numeric,
    form_ref text -- Returns "1040 Line 1a" for the requested year
) language sql security definer as $$
    select 
        c.name, 
        c.section, 
        e.amount, 
        (s.form_number || ' ' || s.line_number) as form_ref
    from public.chart_of_accounts c
    left join public.tax_entries e on c.id = e.account_id and e.year = p_year
    left join public.tax_year_schema_defs s on c.id = s.account_id and s.year = p_year
    where c.user_id = auth.uid();
$$;
