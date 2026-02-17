-- =====================================================
-- FINANCE SCHEMA DEPLOYMENT - PRIVATE SCHEMA PATTERN
-- For TEST DATABASE
-- =====================================================
-- All finance data (COA, taxes, documents, ledgers) in FINANCE SCHEMA
-- API functions in PUBLIC SCHEMA with SECURITY DEFINER
-- Direct access to finance schema is REVOKED
-- =====================================================

BEGIN;

-- =====================================================
-- STEP 1: CREATE FINANCE SCHEMA
-- =====================================================
CREATE SCHEMA IF NOT EXISTS finance;

-- =====================================================
-- STEP 2: DROP EXISTING TABLES (Clean slate)
-- =====================================================
DROP TABLE IF EXISTS finance.entry_evidence CASCADE;
DROP TABLE IF EXISTS finance.tax_cell_references CASCADE;
DROP TABLE IF EXISTS finance.tax_audit_log CASCADE;
DROP TABLE IF EXISTS finance.tax_entries CASCADE;
DROP TABLE IF EXISTS finance.tax_documents CASCADE;
DROP TABLE IF EXISTS finance.chart_of_accounts CASCADE;

-- Also drop from public if they exist there (migration)
DROP TABLE IF EXISTS public.entry_evidence CASCADE;
DROP TABLE IF EXISTS public.tax_cell_references CASCADE;
DROP TABLE IF EXISTS public.tax_audit_log CASCADE;
DROP TABLE IF EXISTS public.tax_entries CASCADE;
DROP TABLE IF EXISTS public.tax_documents CASCADE;
DROP TABLE IF EXISTS public.chart_of_accounts CASCADE;

-- =====================================================
-- STEP 3: CREATE TABLES IN FINANCE SCHEMA
-- =====================================================

-- Chart of Accounts
CREATE TABLE finance.chart_of_accounts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    name TEXT NOT NULL,
    code TEXT,
    type TEXT NOT NULL, -- 'INCOME', 'EXPENSE', 'ASSET', 'LIABILITY'
    section TEXT, -- 'w2', 'biz', 'rental', 'ira', 'deductions', 'taxes'
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Tax Entries (The Values)
CREATE TABLE finance.tax_entries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    account_id UUID REFERENCES finance.chart_of_accounts(id) NOT NULL,
    year INTEGER NOT NULL,
    amount NUMERIC(15, 2) DEFAULT 0,
    notes TEXT,
    status TEXT DEFAULT 'DRAFT',
    updated_by UUID REFERENCES auth.users(id),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, account_id, year)
);

-- Tax Documents
CREATE TABLE finance.tax_documents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    filename TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    file_size_bytes BIGINT,
    mime_type TEXT,
    year INTEGER,
    doc_type TEXT, -- 'ROW_ATTACHMENT', 'RETURN', 'SUPPORTING', 'W2', etc.
    extracted_text TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Tax Cell References (for cell-level document links)
CREATE TABLE finance.tax_cell_references (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    section_id TEXT NOT NULL,
    row_index INTEGER NOT NULL,
    col_key TEXT NOT NULL,
    document_id UUID REFERENCES finance.tax_documents(id) ON DELETE CASCADE NOT NULL,
    page_number INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, section_id, row_index, col_key)
);

-- Entry Evidence (links tax entries to documents)
CREATE TABLE finance.entry_evidence (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    entry_id UUID REFERENCES finance.tax_entries(id) ON DELETE CASCADE NOT NULL,
    document_id UUID REFERENCES finance.tax_documents(id) ON DELETE CASCADE NOT NULL,
    page_number INTEGER DEFAULT 1,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Audit Log
CREATE TABLE finance.tax_audit_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    table_name TEXT NOT NULL,
    record_id UUID NOT NULL,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    action TEXT NOT NULL,
    old_value JSONB,
    new_value JSONB,
    timestamp TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- STEP 4: ENABLE ROW LEVEL SECURITY
-- =====================================================
ALTER TABLE finance.chart_of_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance.tax_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance.tax_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance.tax_cell_references ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance.entry_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance.tax_audit_log ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
CREATE POLICY "Users manage own COA" ON finance.chart_of_accounts FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own entries" ON finance.tax_entries FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own docs" ON finance.tax_documents FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own cell refs" ON finance.tax_cell_references FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own evidence" ON finance.entry_evidence FOR ALL USING (
    EXISTS (SELECT 1 FROM finance.tax_entries WHERE id = entry_evidence.entry_id AND user_id = auth.uid())
);
CREATE POLICY "Users view own audit" ON finance.tax_audit_log FOR SELECT USING (auth.uid() = user_id);

-- =====================================================
-- STEP 5: REVOKE DIRECT ACCESS TO FINANCE SCHEMA
-- =====================================================
-- Users cannot directly query finance schema tables
REVOKE ALL ON SCHEMA finance FROM anon, authenticated;
REVOKE ALL ON ALL TABLES IN SCHEMA finance FROM anon, authenticated;

-- =====================================================
-- STEP 6: DROP EXISTING API FUNCTIONS (if any)
-- =====================================================
-- Clean up any existing functions to avoid signature conflicts
DROP FUNCTION IF EXISTS public.get_auth_user_id();
DROP FUNCTION IF EXISTS public.api_get_chart_of_accounts();
DROP FUNCTION IF EXISTS public.api_get_client_categories();
DROP FUNCTION IF EXISTS public.api_get_tax_entries(INTEGER);
DROP FUNCTION IF EXISTS public.api_update_tax_cell(UUID, INTEGER, NUMERIC, TEXT);
DROP FUNCTION IF EXISTS public.api_register_tax_document(TEXT, TEXT, INTEGER, TEXT);
DROP FUNCTION IF EXISTS public.api_get_tax_documents(INTEGER);
DROP FUNCTION IF EXISTS public.api_get_row_attachments();
DROP FUNCTION IF EXISTS public.api_link_document_to_cell(TEXT, INTEGER, TEXT, UUID, INTEGER);
DROP FUNCTION IF EXISTS public.api_get_cell_links();
DROP FUNCTION IF EXISTS public.populate_default_coa();

-- =====================================================
-- STEP 7: CREATE PUBLIC API FUNCTIONS (SECURITY DEFINER)
-- =====================================================
-- These are the ONLY way to access finance schema

-- Helper: Get authenticated user ID
CREATE OR REPLACE FUNCTION public.get_auth_user_id() 
RETURNS UUID AS $$
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  RETURN auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- API: Get Chart of Accounts
CREATE OR REPLACE FUNCTION public.api_get_chart_of_accounts() 
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN (
    SELECT coalesce(jsonb_agg(t), '[]'::jsonb) FROM (
      SELECT * FROM finance.chart_of_accounts 
      WHERE user_id = public.get_auth_user_id()
      ORDER BY sort_order ASC
    ) t
  );
END;
$$;

-- API: Get Tax Entries (all years)
CREATE OR REPLACE FUNCTION public.api_get_tax_entries(p_year INTEGER DEFAULT NULL) 
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN (
    SELECT coalesce(jsonb_agg(t), '[]'::jsonb) FROM (
      SELECT * FROM finance.tax_entries 
      WHERE user_id = public.get_auth_user_id()
        AND (p_year IS NULL OR year = p_year)
      ORDER BY year DESC, updated_at DESC
    ) t
  );
END;
$$;

-- API: Update Tax Cell (with audit logging)
CREATE OR REPLACE FUNCTION public.api_update_tax_cell(
    p_account_id UUID,
    p_year INTEGER,
    p_amount NUMERIC,
    p_notes TEXT DEFAULT NULL
) RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_user_id UUID;
    v_entry_id UUID;
    v_old_data JSONB;
    v_new_data JSONB;
BEGIN
    v_user_id := public.get_auth_user_id();

    -- Verify account ownership
    IF NOT EXISTS (SELECT 1 FROM finance.chart_of_accounts WHERE id = p_account_id AND user_id = v_user_id) THEN
        RAISE EXCEPTION 'Account not found or access denied';
    END IF;

    -- Get old data for audit
    SELECT to_jsonb(t.*) INTO v_old_data 
    FROM finance.tax_entries t 
    WHERE account_id = p_account_id AND year = p_year AND user_id = v_user_id;

    -- Upsert entry
    INSERT INTO finance.tax_entries (user_id, account_id, year, amount, notes, updated_by, updated_at)
    VALUES (v_user_id, p_account_id, p_year, p_amount, p_notes, v_user_id, now())
    ON CONFLICT (user_id, account_id, year) 
    DO UPDATE SET 
        amount = p_amount, 
        notes = COALESCE(p_notes, finance.tax_entries.notes), 
        updated_by = v_user_id, 
        updated_at = now()
    RETURNING id, to_jsonb(finance.tax_entries.*) INTO v_entry_id, v_new_data;

    -- Audit log
    INSERT INTO finance.tax_audit_log (table_name, record_id, user_id, action, old_value, new_value)
    VALUES ('tax_entries', v_entry_id, v_user_id, 
            CASE WHEN v_old_data IS NULL THEN 'INSERT' ELSE 'UPDATE' END, 
            v_old_data, v_new_data);

    RETURN v_new_data;
END;
$$;

-- API: Register Tax Document
CREATE OR REPLACE FUNCTION public.api_register_tax_document(
    p_filename TEXT,
    p_storage_path TEXT,
    p_year INTEGER DEFAULT NULL,
    p_doc_type TEXT DEFAULT 'SUPPORTING'
) 
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_user_id UUID;
  v_new_doc RECORD;
BEGIN
  v_user_id := public.get_auth_user_id();
  
  INSERT INTO finance.tax_documents (user_id, filename, storage_path, year, doc_type)
  VALUES (v_user_id, p_filename, p_storage_path, p_year, p_doc_type)
  RETURNING * INTO v_new_doc;
  
  RETURN to_jsonb(v_new_doc);
END;
$$;

-- API: Get Tax Documents
CREATE OR REPLACE FUNCTION public.api_get_tax_documents(p_year INTEGER DEFAULT NULL) 
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_user_id UUID;
BEGIN
  v_user_id := public.get_auth_user_id();
  
  RETURN (
    SELECT coalesce(jsonb_agg(t), '[]'::jsonb) FROM (
      SELECT id, filename, storage_path, year, doc_type, created_at
      FROM finance.tax_documents 
      WHERE user_id = v_user_id
        AND (p_year IS NULL OR year = p_year)
      ORDER BY created_at DESC
    ) t
  );
END;
$$;

-- API: Get Row Attachments
CREATE OR REPLACE FUNCTION public.api_get_row_attachments() 
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_user_id UUID;
BEGIN
  v_user_id := public.get_auth_user_id();
  
  RETURN (
    SELECT coalesce(jsonb_agg(t), '[]'::jsonb) FROM (
      SELECT id, filename, storage_path, doc_type, created_at
      FROM finance.tax_documents 
      WHERE user_id = v_user_id AND doc_type = 'ROW_ATTACHMENT'
      ORDER BY created_at DESC
    ) t
  );
END;
$$;

-- API: Link Document to Cell
CREATE OR REPLACE FUNCTION public.api_link_document_to_cell(
    p_section_id TEXT,
    p_row_index INTEGER,
    p_col_key TEXT,
    p_doc_id UUID,
    p_page INTEGER DEFAULT 1
) 
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_user_id UUID;
  v_link_rec RECORD;
BEGIN
  v_user_id := public.get_auth_user_id();
  
  INSERT INTO finance.tax_cell_references (user_id, section_id, row_index, col_key, document_id, page_number)
  VALUES (v_user_id, p_section_id, p_row_index, p_col_key, p_doc_id, p_page)
  ON CONFLICT (user_id, section_id, row_index, col_key) 
  DO UPDATE SET document_id = p_doc_id, page_number = p_page
  RETURNING * INTO v_link_rec;
  
  RETURN to_jsonb(v_link_rec);
END;
$$;

-- API: Get Cell Links
CREATE OR REPLACE FUNCTION public.api_get_cell_links() 
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_user_id UUID;
BEGIN
  v_user_id := public.get_auth_user_id();
  
  RETURN (
    SELECT coalesce(jsonb_agg(t), '[]'::jsonb) FROM (
      SELECT 
        cr.section_id, cr.row_index, cr.col_key, cr.page_number, cr.document_id,
        jsonb_build_object(
          'id', d.id, 'filename', d.filename, 'storage_path', d.storage_path,
          'year', d.year, 'doc_type', d.doc_type
        ) as document
      FROM finance.tax_cell_references cr
      JOIN finance.tax_documents d ON cr.document_id = d.id
      WHERE cr.user_id = v_user_id
      ORDER BY cr.created_at DESC
    ) t
  );
END;
$$;

-- API: Populate Default COA
CREATE OR REPLACE FUNCTION public.populate_default_coa() 
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_user_id UUID;
BEGIN
    v_user_id := public.get_auth_user_id();
    
    -- W2
    INSERT INTO finance.chart_of_accounts (user_id, name, type, section, sort_order) VALUES
    (v_user_id, 'W2 Wages', 'INCOME', 'w2', 10),
    (v_user_id, 'Taxes Withheld', 'EXPENSE', 'w2', 20);

    -- Business
    INSERT INTO finance.chart_of_accounts (user_id, name, type, section, sort_order) VALUES
    (v_user_id, '1. Comfort Foods (dba Robertos Pizza)', 'INCOME', 'biz', 10),
    (v_user_id, '2. CloudBaud LLC', 'INCOME', 'biz', 20),
    (v_user_id, '3. Teaching Income', 'INCOME', 'biz', 30);

    -- Rental
    INSERT INTO finance.chart_of_accounts (user_id, name, type, section, sort_order) VALUES
    (v_user_id, '1. Olympic Court', 'INCOME', 'rental', 10),
    (v_user_id, '2. Cherry Crest', 'INCOME', 'rental', 20),
    (v_user_id, '3. Woodridge', 'INCOME', 'rental', 30);

    -- IRA
    INSERT INTO finance.chart_of_accounts (user_id, name, type, section, sort_order) VALUES
    (v_user_id, 'Jishnu Roth IRA', 'ASSET', 'ira', 10),
    (v_user_id, 'Deepika ROTH IRA', 'ASSET', 'ira', 20),
    (v_user_id, 'SEP IRA', 'ASSET', 'ira', 30);

    -- Deductions
    INSERT INTO finance.chart_of_accounts (user_id, name, type, section, sort_order) VALUES
    (v_user_id, 'Real Estate Interest Woodridge', 'EXPENSE', 'deductions', 10),
    (v_user_id, 'Real Estate Interest Lake Hills', 'EXPENSE', 'deductions', 20);

    -- Taxes
    INSERT INTO finance.chart_of_accounts (user_id, name, type, section, sort_order) VALUES
    (v_user_id, 'Real Estate Taxes Woodridge', 'EXPENSE', 'taxes', 10),
    (v_user_id, 'Real Estate Taxes Cherry Crest', 'EXPENSE', 'taxes', 20);
END;
$$;

-- =====================================================
-- STEP 8: GRANT EXECUTE PERMISSIONS
-- =====================================================
GRANT EXECUTE ON FUNCTION public.get_auth_user_id TO authenticated;
GRANT EXECUTE ON FUNCTION public.api_get_chart_of_accounts TO authenticated;
GRANT EXECUTE ON FUNCTION public.api_get_tax_entries TO authenticated;
GRANT EXECUTE ON FUNCTION public.api_update_tax_cell TO authenticated;
GRANT EXECUTE ON FUNCTION public.api_register_tax_document TO authenticated;
GRANT EXECUTE ON FUNCTION public.api_get_tax_documents TO authenticated;
GRANT EXECUTE ON FUNCTION public.api_get_row_attachments TO authenticated;
GRANT EXECUTE ON FUNCTION public.api_link_document_to_cell TO authenticated;
GRANT EXECUTE ON FUNCTION public.api_get_cell_links TO authenticated;
GRANT EXECUTE ON FUNCTION public.populate_default_coa TO authenticated;

COMMIT;

-- =====================================================
-- DEPLOYMENT COMPLETE
-- =====================================================
-- ✅ Finance schema created
-- ✅ All tables in FINANCE schema (not public)
-- ✅ Direct access to finance schema REVOKED
-- ✅ API functions in PUBLIC schema with SECURITY DEFINER
-- ✅ RLS policies enabled
-- ✅ Permissions granted
-- =====================================================

SELECT 'Finance schema deployment successful!' as message;
SELECT 'Tables created in finance schema:' as info;
SELECT tablename FROM pg_tables WHERE schemaname = 'finance' ORDER BY tablename;
