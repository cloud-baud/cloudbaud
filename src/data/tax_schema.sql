
-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Table: tax_documents
-- Stores metadata about uploaded/linked PDF documents
create table public.tax_documents (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) not null,
    filename text not null,
    year integer,
    doc_type text, -- e.g., 'W2', '1099', '1040', 'RETURN', 'BANK_STATEMENT'
    storage_path text, -- Path in Supabase Storage bucket 'tax-docs'
    local_ref text, -- For local-only usage (if supported)
    extracted_text text, -- Text content extracted by OCR/PDF.js for Ollama
    created_at timestamptz default now()
);

-- Table: user_tax_state
-- Persists the entire dashboard state (Excel Grid) per user
create table public.user_tax_state (
    user_id uuid references auth.users(id) primary key,
    years jsonb not null default '[]'::jsonb,
    tax_data jsonb not null default '[]'::jsonb,
    col_widths jsonb,
    row_heights jsonb,
    updated_at timestamptz default now()
);

-- Table: tax_cell_references
-- Links a specific cell in the grid to a document justification
create table public.tax_cell_references (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) not null,
    section_id text not null, -- e.g., 'biz', 'w2'
    row_index integer not null, -- 0-based index of the row
    col_key text not null, -- '2022', '2023', etc.
    document_id uuid references public.tax_documents(id) on delete cascade,
    page_number integer default 1,
    source_snippet text, -- The specific text/number extracted
    confidence_score float,
    created_at timestamptz default now(),
    
    unique(user_id, section_id, row_index, col_key)
);

-- Row Level Security (RLS)
alter table public.tax_documents enable row level security;
alter table public.user_tax_state enable row level security;
alter table public.tax_cell_references enable row level security;

create policy "Users can view own documents" on public.tax_documents for select using (auth.uid() = user_id);
create policy "Users can insert own documents" on public.tax_documents for insert with check (auth.uid() = user_id);
create policy "Users can update own documents" on public.tax_documents for update using (auth.uid() = user_id);
create policy "Users can delete own documents" on public.tax_documents for delete using (auth.uid() = user_id);

create policy "Users can view own state" on public.user_tax_state for select using (auth.uid() = user_id);
create policy "Users can insert own state" on public.user_tax_state for insert with check (auth.uid() = user_id);
create policy "Users can update own state" on public.user_tax_state for update using (auth.uid() = user_id);

create policy "Users can view own refs" on public.tax_cell_references for select using (auth.uid() = user_id);
create policy "Users can insert own refs" on public.tax_cell_references for insert with check (auth.uid() = user_id);
create policy "Users can update own refs" on public.tax_cell_references for update using (auth.uid() = user_id);
create policy "Users can delete own refs" on public.tax_cell_references for delete using (auth.uid() = user_id);

-- Storage Bucket Policy (Note: You must create a bucket named 'tax-docs' in Supabase Dashboard)
-- insert into storage.buckets (id, name, public) values ('tax-docs', 'tax-docs', false);
