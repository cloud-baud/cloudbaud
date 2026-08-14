-- ============================================================================
-- TAX DASHBOARD: MULTI-SCHEMA ARCHITECTURE
-- ============================================================================
-- PUBLIC SCHEMA: Stable, cross-year entities (COA, Categories, Documents)
-- YEAR SCHEMAS: Year-specific data (tax_2017, tax_2018, etc.)
-- Each year has its own schema because IRS requirements change annually
-- ============================================================================

BEGIN;

-- ============================================================================
-- STEP 1: CLEANUP - Drop existing schemas and tables
-- ============================================================================

-- Drop year-specific schemas (2017-2024)
DROP SCHEMA IF EXISTS tax_2024 CASCADE;
DROP SCHEMA IF EXISTS tax_2023 CASCADE;
DROP SCHEMA IF EXISTS tax_2022 CASCADE;
DROP SCHEMA IF EXISTS tax_2021 CASCADE;
DROP SCHEMA IF EXISTS tax_2020 CASCADE;
DROP SCHEMA IF EXISTS tax_2019 CASCADE;
DROP SCHEMA IF EXISTS tax_2018 CASCADE;
DROP SCHEMA IF EXISTS tax_2017 CASCADE;

-- Drop public tables
DROP TABLE IF EXISTS public.tax_evidence_links CASCADE;
DROP TABLE IF EXISTS public.cpa_mappings CASCADE;
DROP TABLE IF EXISTS public.client_input_values CASCADE;
DROP TABLE IF EXISTS public.client_input_categories CASCADE;
DROP TABLE IF EXISTS public.irs_form_definitions CASCADE;
DROP TABLE IF EXISTS public.tax_documents CASCADE;
DROP TABLE IF EXISTS public.chart_of_accounts CASCADE;

-- ============================================================================
-- STEP 2: EXTENSIONS
-- ============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- STEP 3: PUBLIC SCHEMA - Stable Tables
-- ============================================================================

-- Chart of Accounts (Stable across years)
CREATE TABLE public.chart_of_accounts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    name TEXT NOT NULL,
    code TEXT, -- Added for Universal Access ID (e.g. "CHK-001")
    type TEXT NOT NULL, -- 'INCOME', 'EXPENSE', 'ASSET', 'LIABILITY'
    section TEXT, -- 'w2', 'biz', 'rental', 'ira', 'deductions', 'taxes'
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, code) -- Prevent duplicate codes for the same user
);

-- Client Input Categories (Your personal categories - stable)
CREATE TABLE public.client_input_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    name TEXT NOT NULL, -- "Comfort Foods Income", "Woodridge Rent"
    section TEXT, -- 'biz', 'rental', 'w2' (UI Grouping)
    is_recurring BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Tax Documents (Evidence - shared across years)
CREATE TABLE public.tax_documents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    filename TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    file_size_bytes BIGINT,
    mime_type TEXT,
    year INTEGER,
    doc_type TEXT, -- 'W2', 'RETURN', 'SUPPORTING', '1099', etc.
    extracted_text TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- STEP 4: CREATE YEAR-SPECIFIC SCHEMAS (2017-2024)
-- ============================================================================

-- Function to create a year schema with all required tables
CREATE OR REPLACE FUNCTION create_tax_year_schema(p_year INTEGER) 
RETURNS VOID AS $$
DECLARE
    schema_name TEXT := 'tax_' || p_year;
BEGIN
    -- Create schema
    EXECUTE format('CREATE SCHEMA IF NOT EXISTS %I', schema_name);
    
    -- IRS Form Definitions (Year-specific because forms change)
    EXECUTE format('
        CREATE TABLE %I.irs_form_definitions (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            form_number TEXT NOT NULL,
            line_number TEXT NOT NULL,
            description TEXT,
            requires_attachment BOOLEAN DEFAULT false,
            created_at TIMESTAMPTZ DEFAULT now(),
            UNIQUE(form_number, line_number)
        )', schema_name);
    
    -- Client Input Values (Your actual numbers for this year)
    EXECUTE format('
        CREATE TABLE %I.client_input_values (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID REFERENCES auth.users(id) NOT NULL,
            category_id UUID REFERENCES public.client_input_categories(id),
            amount NUMERIC(15, 2),
            user_notes TEXT,
            data_status TEXT DEFAULT ''DRAFT'',
            evidence_status TEXT DEFAULT ''MISSING'',
            updated_at TIMESTAMPTZ DEFAULT now(),
            UNIQUE(user_id, category_id)
        )', schema_name);
    
    -- CPA Mappings (Bridge between your inputs and IRS forms)
    EXECUTE format('
        CREATE TABLE %I.cpa_mappings (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID REFERENCES auth.users(id) NOT NULL,
            client_category_id UUID REFERENCES public.client_input_categories(id),
            target_irs_line_id UUID REFERENCES %I.irs_form_definitions(id),
            allocation_percentage NUMERIC(5,2) DEFAULT 100.00,
            cpa_notes TEXT,
            review_status TEXT DEFAULT ''PENDING'',
            created_at TIMESTAMPTZ DEFAULT now()
        )', schema_name, schema_name);
    
    -- Evidence Links (Links your values to documents)
    EXECUTE format('
        CREATE TABLE %I.tax_evidence_links (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            input_value_id UUID REFERENCES %I.client_input_values(id),
            document_id UUID REFERENCES public.tax_documents(id),
            page_number INTEGER,
            created_at TIMESTAMPTZ DEFAULT now()
        )', schema_name, schema_name);
    
    -- Audit Log (Track all changes for this year)
    EXECUTE format('
        CREATE TABLE %I.tax_audit_log (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            table_name TEXT NOT NULL,
            record_id UUID NOT NULL,
            user_id UUID REFERENCES auth.users(id) NOT NULL,
            action TEXT NOT NULL,
            old_value JSONB,
            new_value JSONB,
            timestamp TIMESTAMPTZ DEFAULT now()
        )', schema_name);

END;
$$ LANGUAGE plpgsql;

-- Create schemas for years 2017-2024
SELECT create_tax_year_schema(2017);
SELECT create_tax_year_schema(2018);
SELECT create_tax_year_schema(2019);
SELECT create_tax_year_schema(2020);
SELECT create_tax_year_schema(2021);
SELECT create_tax_year_schema(2022);
SELECT create_tax_year_schema(2023);
SELECT create_tax_year_schema(2024);

-- ============================================================================
-- STEP 5: ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Public tables
ALTER TABLE public.chart_of_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_input_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tax_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own COA" ON public.chart_of_accounts FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own categories" ON public.client_input_categories FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own docs" ON public.tax_documents FOR ALL USING (auth.uid() = user_id);

-- Enable RLS for each year schema (2017-2024)
DO $$
DECLARE
    y INTEGER;
    schema_name TEXT;
BEGIN
    FOR y IN 2017..2024 LOOP
        schema_name := 'tax_' || y;
        
        EXECUTE format('ALTER TABLE %I.client_input_values ENABLE ROW LEVEL SECURITY', schema_name);
        EXECUTE format('ALTER TABLE %I.cpa_mappings ENABLE ROW LEVEL SECURITY', schema_name);
        EXECUTE format('ALTER TABLE %I.tax_audit_log ENABLE ROW LEVEL SECURITY', schema_name);
        
        EXECUTE format('CREATE POLICY "Users manage own values" ON %I.client_input_values FOR ALL USING (auth.uid() = user_id)', schema_name);
        EXECUTE format('CREATE POLICY "Users manage own mappings" ON %I.cpa_mappings FOR ALL USING (auth.uid() = user_id)', schema_name);
        EXECUTE format('CREATE POLICY "Users view own audit" ON %I.tax_audit_log FOR SELECT USING (auth.uid() = user_id)', schema_name);
    END LOOP;
END $$;

-- ============================================================================
-- STEP 6: SEED DATA - Chart of Accounts & Categories
-- ============================================================================

DO $$
DECLARE
    v_user_id UUID;
BEGIN
    -- Get the most recent user
    SELECT id INTO v_user_id FROM auth.users ORDER BY created_at DESC LIMIT 1;
    
    IF v_user_id IS NULL THEN
        RAISE NOTICE 'No user found. Skipping seed data.';
        RETURN;
    END IF;

    -- Seed Client Input Categories (Your personal categories)
    INSERT INTO public.client_input_categories (user_id, name, section, sort_order) VALUES
    -- W2
    (v_user_id, 'W2 Wages', 'w2', 10),
    (v_user_id, 'Taxes Withheld', 'w2', 20),
    
    -- Business
    (v_user_id, '1. Comfort Foods (dba Robertos Pizza)', 'biz', 10),
    (v_user_id, '2. CloudBaud LLC', 'biz', 20),
    (v_user_id, '3. Teaching Income', 'biz', 30),
    (v_user_id, '4. Canada Condo Sale', 'biz', 40),
    
    -- Rental
    (v_user_id, '1. Olympic Court', 'rental', 10),
    (v_user_id, '2. Cherry Crest', 'rental', 20),
    (v_user_id, '3. Woodridge', 'rental', 30),
    
    -- IRA
    (v_user_id, 'Jishnu Roth IRA', 'ira', 10),
    (v_user_id, 'Deepika ROTH IRA', 'ira', 20),
    (v_user_id, 'SEP IRA', 'ira', 30),
    (v_user_id, '1099-R', 'ira', 40),
    (v_user_id, 'Child Education Fund', 'ira', 50),
    
    -- Deductions
    (v_user_id, 'Real Estate Interest Woodridge', 'deductions', 10),
    (v_user_id, 'Real Estate Interest Lake Hills', 'deductions', 20),
    (v_user_id, 'Real Estate Interest Olympic Court', 'deductions', 30),
    
    -- Taxes
    (v_user_id, 'Real Estate Taxes Woodridge', 'taxes', 10),
    (v_user_id, 'Real Estate Taxes Cherry Crest', 'taxes', 20),
    (v_user_id, 'Real Estate Taxes Lake Hills', 'taxes', 30),
    (v_user_id, 'Real Estate Taxes Olympic Court', 'taxes', 40),
    (v_user_id, 'Real Estate Taxes Rudins Lounge', 'taxes', 50);

END $$;

COMMIT;

-- ============================================================================
-- DEPLOYMENT COMPLETE
-- ============================================================================
-- ✅ Public schema created with stable tables
-- ✅ Year schemas created: tax_2017 through tax_2024
-- ✅ RLS policies enabled
-- ✅ Seed data loaded
-- ============================================================================
