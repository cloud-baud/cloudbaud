
-- ---------------------------------------------------------------------------
-- TAX DASHBOARD V3: THREE-PERSPECTIVE ARCHITECTURE
-- 1. Jishnu (Client): Provides Raw Inputs & Evidence
-- 2. David (CPA): Maps Inputs and Reviews Compliance
-- 3. IRS (Government): Defines the Formatting Requirements per Year
-- ---------------------------------------------------------------------------

-- 1. JISHNU'S INPUT LAYER (User-Friendly Buckets)
-- This is what drives the Excel-Grid in the Dashboard.
-- Examples: "Amazon Sales", "Uber Expenses", "Woodridge Rent"
create table public.client_input_categories (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) not null,
    name text not null, -- "Comfort Foods Income"
    section text, -- 'biz', 'rental', 'w2' (UI Grouping)
    is_recurring boolean default true,
    sort_order integer default 0,
    created_at timestamptz default now()
);

-- The actual numbers Jishnu provides + Evidence Links
create table public.client_input_values (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) not null,
    category_id uuid references public.client_input_categories(id),
    year integer not null,
    amount numeric(15, 2),
    user_notes text, -- "Check deposit from Jan 4th"
    
    -- Status of Jishnu's work
    data_status text default 'DRAFT', -- DRAFT, COMPLETE
    evidence_status text default 'MISSING', -- MISSING, ATTACHED
    
    updated_at timestamptz default now(),
    unique(user_id, category_id, year)
);

-- 2. IRS LAYER (Compliance Definitions)
-- The Target format. Forms change every year.
-- This table can be seeded with standard IRS lines (e.g., "Sch C Line 1")
create table public.irs_form_definitions (
    id uuid default gen_random_uuid() primary key,
    year integer not null,
    form_number text not null, -- "1040", "Schedule C", "Schedule E"
    line_number text not null, -- "1", "1a", "21"
    description text, -- "Gross receipts or sales"
    
    -- Metadata limits (for validation)
    requires_attachment boolean default false,
    
    unique(year, form_number, line_number)
);

-- 3. DAVID'S LAYER ( The Bridge / Mapping )
-- This is where the CPA allows Jishnu's chaos to become IRS order.
create table public.cpa_mappings (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) not null,
    year integer not null,
    
    -- The Bridge
    client_category_id uuid references public.client_input_categories(id),
    target_irs_line_id uuid references public.irs_form_definitions(id),
    
    -- Logic
    allocation_percentage numeric(5,2) default 100.00, -- Handle splits (e.g. Home Office Internet 50%)
    cpa_notes text, -- "Reclassified as advertising"
    
    -- Workflow Status
    review_status text default 'PENDING', -- PENDING, APPROVED, FLAGGED
    
    created_at timestamptz default now()
);

-- 4. Shared Evidence (The "Source of Truth" Documents)
-- Links to specific Client Values 
create table public.tax_evidence_links (
    id uuid default gen_random_uuid() primary key,
    input_value_id uuid references public.client_input_values(id),
    document_id uuid references public.tax_documents(id), -- From previous schema
    page_number integer,
    created_at timestamptz default now()
);

-- VIEWS for Reporting

-- View for David: "Review Queue"
-- Shows Jishnu's inputs and their mapping status
create or replace view view_cpa_review_queue as
select 
    v.year,
    c.name as client_category,
    v.amount as client_amount,
    v.user_notes,
    v.evidence_status,
    m.review_status,
    irs.form_number as mapped_form,
    irs.line_number as mapped_line
from public.client_input_values v
join public.client_input_categories c on v.category_id = c.id
left join public.cpa_mappings m on c.id = m.client_category_id and v.year = m.year
left join public.irs_form_definitions irs on m.target_irs_line_id = irs.id;
