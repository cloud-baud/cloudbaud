-- ---------------------------------------------------------------------------
-- FINANCE SCHEMA MIGRATION
-- Moves all financial related tables to a dedicated 'finance' schema
-- ---------------------------------------------------------------------------

BEGIN;

-- 1. Create the new schema
create schema if not exists finance;

-- 2. Safely move tables using PL/pgSQL
DO $$
DECLARE
    -- List of tables to move
    tables text[] := ARRAY[
        'universal_coa', 'chart_of_accounts', 'account_tags', 
        'ledger_entries', 'ledger_lines', 'tax_entries', 
        'tax_documents', 'entry_evidence', 'tax_audit_log', 
        'user_tax_state', 'tax_cell_references',
        'client_input_categories', 'client_input_values', 
        'irs_form_definitions', 'cpa_mappings', 'tax_evidence_links'
    ];
    t text;
BEGIN
    FOREACH t IN ARRAY tables LOOP
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = t) THEN
            EXECUTE format('ALTER TABLE public.%I SET SCHEMA finance', t);
            RAISE NOTICE 'Moved table % to finance schema', t;
        ELSE
            RAISE NOTICE 'Table % not found in public schema, skipping', t;
        END IF;
    END LOOP;
END $$;

-- 3. Safely move Views
DO $$
DECLARE
    views text[] := ARRAY['view_tax_dashboard_grid', 'view_cpa_review_queue'];
    v text;
BEGIN
    FOREACH v IN ARRAY views LOOP
        IF EXISTS (SELECT 1 FROM information_schema.views WHERE table_schema = 'public' AND table_name = v) THEN
             EXECUTE format('ALTER VIEW public.%I SET SCHEMA finance', v);
             RAISE NOTICE 'Moved view % to finance schema', v;
        END IF;
    END LOOP;
END $$;

-- 4. Safely move Functions
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_proc JOIN pg_namespace ON pg_proc.pronamespace = pg_namespace.oid WHERE proname = 'update_tax_cell' AND nspname = 'public') THEN
        ALTER FUNCTION public.update_tax_cell(uuid, integer, numeric, text) SET SCHEMA finance;
        RAISE NOTICE 'Moved function update_tax_cell to finance schema';
    END IF;
END $$;

-- 5. Grant Permissions
grant usage on schema finance to authenticated;
grant usage on schema finance to anon;
grant all on all tables in schema finance to authenticated;
grant all on all sequences in schema finance to authenticated;
grant all on all routines in schema finance to authenticated;

COMMIT;
