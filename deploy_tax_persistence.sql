-- =====================================================
-- TAX DATA PERSISTENCE — SCHEMA ADDITIONS
-- =====================================================
-- Extends the existing finance schema with:
-- 1. COA enrichment columns (form_line, return_schedule, parent_id, etc.)
-- 2. tax_carryforwards table for multi-year loss/credit tracking
-- 3. New API functions
-- =====================================================

BEGIN;

-- =====================================================
-- STEP 1: EXTEND chart_of_accounts
-- =====================================================
ALTER TABLE finance.chart_of_accounts
  ADD COLUMN IF NOT EXISTS form_line TEXT,
  ADD COLUMN IF NOT EXISTS return_schedule TEXT,
  ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES finance.chart_of_accounts(id),
  ADD COLUMN IF NOT EXISTS is_computed BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS category TEXT,
  ADD COLUMN IF NOT EXISTS is_expandable BOOLEAN DEFAULT false;

-- =====================================================
-- STEP 2: CREATE tax_carryforwards TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS finance.tax_carryforwards (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    carry_type TEXT NOT NULL,           -- 'CAPITAL_LOSS', 'NOL', 'AMT_CREDIT'
    origin_year INTEGER NOT NULL,       -- Year the loss/credit originated
    original_amount NUMERIC(15,2),      -- Total amount (e.g., -76555)
    applied_year INTEGER NOT NULL,      -- Year it was applied
    applied_amount NUMERIC(15,2),       -- Amount used that year (e.g., -3000)
    remaining NUMERIC(15,2),            -- Balance after application
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, carry_type, origin_year, applied_year)
);

-- Enable RLS
ALTER TABLE finance.tax_carryforwards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own carryforwards" 
ON finance.tax_carryforwards FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- STEP 3: ADD verified + verified_at TO tax_entries
-- =====================================================
ALTER TABLE finance.tax_entries
  ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS verified_by UUID REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS source TEXT;  -- 'MANUAL', 'AI_EXTRACTED', 'CPA_VERIFIED'

-- =====================================================
-- STEP 4: NEW API FUNCTIONS
-- =====================================================

-- Drop existing if signature conflicts
DROP FUNCTION IF EXISTS public.api_get_tax_line_items(INTEGER);
DROP FUNCTION IF EXISTS public.api_upsert_carryforward(TEXT, INTEGER, NUMERIC, INTEGER, NUMERIC, NUMERIC, TEXT);
DROP FUNCTION IF EXISTS public.api_get_carryforwards(TEXT, INTEGER);

-- API: Get Tax Line Items (enriched COA + entries for a tax year)
-- Returns the full structure needed by the Tax Dashboard viewer
CREATE OR REPLACE FUNCTION public.api_get_tax_line_items(p_year INTEGER)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_user_id UUID;
BEGIN
  v_user_id := public.get_auth_user_id();

  RETURN (
    SELECT coalesce(jsonb_agg(t), '[]'::jsonb) FROM (
      SELECT 
        a.id,
        a.name AS label,
        a.code,
        a.type,
        a.section,
        a.form_line,
        a.return_schedule,
        a.parent_id,
        a.is_computed,
        a.is_expandable,
        a.category,
        a.sort_order,
        e.amount,
        e.notes,
        e.status,
        e.verified,
        e.verified_at,
        e.source,
        -- Gather linked documents
        (
          SELECT coalesce(jsonb_agg(jsonb_build_object(
            'id', d.id,
            'filename', d.filename,
            'storage_path', d.storage_path,
            'doc_type', d.doc_type
          )), '[]'::jsonb)
          FROM finance.entry_evidence ev
          JOIN finance.tax_documents d ON ev.document_id = d.id
          WHERE ev.entry_id = e.id
        ) AS docs
      FROM finance.chart_of_accounts a
      LEFT JOIN finance.tax_entries e 
        ON e.account_id = a.id 
        AND e.year = p_year 
        AND e.user_id = v_user_id
      WHERE a.user_id = v_user_id
      ORDER BY a.section, a.sort_order
    ) t
  );
END;
$$;

-- API: Upsert Carryforward
CREATE OR REPLACE FUNCTION public.api_upsert_carryforward(
    p_carry_type TEXT,
    p_origin_year INTEGER,
    p_original_amount NUMERIC,
    p_applied_year INTEGER,
    p_applied_amount NUMERIC,
    p_remaining NUMERIC,
    p_notes TEXT DEFAULT NULL
)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_user_id UUID;
  v_rec RECORD;
BEGIN
  v_user_id := public.get_auth_user_id();

  INSERT INTO finance.tax_carryforwards 
    (user_id, carry_type, origin_year, original_amount, applied_year, applied_amount, remaining, notes)
  VALUES 
    (v_user_id, p_carry_type, p_origin_year, p_original_amount, p_applied_year, p_applied_amount, p_remaining, p_notes)
  ON CONFLICT (user_id, carry_type, origin_year, applied_year)
  DO UPDATE SET
    original_amount = EXCLUDED.original_amount,
    applied_amount = EXCLUDED.applied_amount,
    remaining = EXCLUDED.remaining,
    notes = COALESCE(EXCLUDED.notes, finance.tax_carryforwards.notes)
  RETURNING * INTO v_rec;

  RETURN to_jsonb(v_rec);
END;
$$;

-- API: Get Carryforwards
CREATE OR REPLACE FUNCTION public.api_get_carryforwards(
    p_carry_type TEXT DEFAULT NULL,
    p_year INTEGER DEFAULT NULL
)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_user_id UUID;
BEGIN
  v_user_id := public.get_auth_user_id();

  RETURN (
    SELECT coalesce(jsonb_agg(t), '[]'::jsonb) FROM (
      SELECT *
      FROM finance.tax_carryforwards
      WHERE user_id = v_user_id
        AND (p_carry_type IS NULL OR carry_type = p_carry_type)
        AND (p_year IS NULL OR applied_year = p_year)
      ORDER BY origin_year, applied_year
    ) t
  );
END;
$$;

-- =====================================================
-- STEP 5: GRANT PERMISSIONS
-- =====================================================
GRANT EXECUTE ON FUNCTION public.api_get_tax_line_items TO authenticated;
GRANT EXECUTE ON FUNCTION public.api_upsert_carryforward TO authenticated;
GRANT EXECUTE ON FUNCTION public.api_get_carryforwards TO authenticated;

COMMIT;

-- =====================================================
-- DEPLOYMENT VERIFICATION
-- =====================================================
SELECT 'Tax persistence schema additions deployed!' AS message;

-- Verify new columns on chart_of_accounts
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'finance' AND table_name = 'chart_of_accounts'
ORDER BY ordinal_position;

-- Verify carryforwards table exists
SELECT tablename FROM pg_tables WHERE schemaname = 'finance' ORDER BY tablename;
