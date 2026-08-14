-- =====================================================
-- TAX COLUMNS SPLIT MIGRATION
-- =====================================================
-- Alters constraint and updates RPC functions to split Jishnu (Draft) and David (CPA) columns.
-- =====================================================

BEGIN;

-- 1. Ensure source column is present, set NOT NULL and default to 'MANUAL'
ALTER TABLE finance.tax_entries ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'MANUAL';
UPDATE finance.tax_entries SET source = 'MANUAL' WHERE source IS NULL;
ALTER TABLE finance.tax_entries ALTER COLUMN source SET DEFAULT 'MANUAL';
ALTER TABLE finance.tax_entries ALTER COLUMN source SET NOT NULL;

-- 2. Alter unique constraint to include source
ALTER TABLE finance.tax_entries DROP CONSTRAINT IF EXISTS tax_entries_user_id_account_id_year_key;
ALTER TABLE finance.tax_entries DROP CONSTRAINT IF EXISTS tax_entries_user_id_account_id_year_source_key;
ALTER TABLE finance.tax_entries ADD CONSTRAINT tax_entries_user_id_account_id_year_source_key UNIQUE (user_id, account_id, year, source);

-- 3. Redefine api_get_tax_line_items
DROP FUNCTION IF EXISTS public.api_get_tax_line_items(INTEGER);

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
        
        -- Backwards compatibility fields
        COALESCE(
          (SELECT amount FROM finance.tax_entries WHERE account_id = a.id AND year = p_year AND user_id = v_user_id AND source IN ('MANUAL', 'AI_EXTRACTED') ORDER BY CASE WHEN source = 'MANUAL' THEN 1 ELSE 2 END LIMIT 1),
          0
        ) AS amount,
        (SELECT notes FROM finance.tax_entries WHERE account_id = a.id AND year = p_year AND user_id = v_user_id AND source IN ('MANUAL', 'AI_EXTRACTED') ORDER BY CASE WHEN source = 'MANUAL' THEN 1 ELSE 2 END LIMIT 1) AS notes,
        (SELECT status FROM finance.tax_entries WHERE account_id = a.id AND year = p_year AND user_id = v_user_id AND source IN ('MANUAL', 'AI_EXTRACTED') ORDER BY CASE WHEN source = 'MANUAL' THEN 1 ELSE 2 END LIMIT 1) AS status,
        COALESCE(
          (SELECT verified FROM finance.tax_entries WHERE account_id = a.id AND year = p_year AND user_id = v_user_id AND source = 'CPA_VERIFIED' LIMIT 1),
          false
        ) AS verified,
        (SELECT verified_at FROM finance.tax_entries WHERE account_id = a.id AND year = p_year AND user_id = v_user_id AND source = 'CPA_VERIFIED' LIMIT 1) AS verified_at,
        'MANUAL'::text AS source,

        -- Split fields: Draft (Jishnu)
        COALESCE(
          (SELECT amount FROM finance.tax_entries WHERE account_id = a.id AND year = p_year AND user_id = v_user_id AND source IN ('MANUAL', 'AI_EXTRACTED') ORDER BY CASE WHEN source = 'MANUAL' THEN 1 ELSE 2 END LIMIT 1),
          0
        ) AS amount_draft,
        (SELECT notes FROM finance.tax_entries WHERE account_id = a.id AND year = p_year AND user_id = v_user_id AND source IN ('MANUAL', 'AI_EXTRACTED') ORDER BY CASE WHEN source = 'MANUAL' THEN 1 ELSE 2 END LIMIT 1) AS notes_draft,
        (SELECT status FROM finance.tax_entries WHERE account_id = a.id AND year = p_year AND user_id = v_user_id AND source IN ('MANUAL', 'AI_EXTRACTED') ORDER BY CASE WHEN source = 'MANUAL' THEN 1 ELSE 2 END LIMIT 1) AS status_draft,
        
        -- Split fields: CPA (David)
        COALESCE(
          (SELECT amount FROM finance.tax_entries WHERE account_id = a.id AND year = p_year AND user_id = v_user_id AND source = 'CPA_VERIFIED' LIMIT 1),
          0
        ) AS amount_cpa,
        (SELECT notes FROM finance.tax_entries WHERE account_id = a.id AND year = p_year AND user_id = v_user_id AND source = 'CPA_VERIFIED' LIMIT 1) AS notes_cpa,
        (SELECT status FROM finance.tax_entries WHERE account_id = a.id AND year = p_year AND user_id = v_user_id AND source = 'CPA_VERIFIED' LIMIT 1) AS status_cpa,
        COALESCE(
          (SELECT verified FROM finance.tax_entries WHERE account_id = a.id AND year = p_year AND user_id = v_user_id AND source = 'CPA_VERIFIED' LIMIT 1),
          false
        ) AS verified_cpa,
        (SELECT verified_at FROM finance.tax_entries WHERE account_id = a.id AND year = p_year AND user_id = v_user_id AND source = 'CPA_VERIFIED' LIMIT 1) AS verified_at_cpa,

        -- Gather linked documents for either draft or cpa
        (
          SELECT coalesce(jsonb_agg(jsonb_build_object(
            'id', d.id,
            'filename', d.filename,
            'storage_path', d.storage_path,
            'doc_type', d.doc_type
          )), '[]'::jsonb)
          FROM finance.entry_evidence ev
          JOIN finance.tax_documents d ON ev.document_id = d.id
          WHERE ev.entry_id IN (
            SELECT id FROM finance.tax_entries 
            WHERE account_id = a.id AND year = p_year AND user_id = v_user_id
          )
        ) AS docs
      FROM finance.chart_of_accounts a
      WHERE a.user_id = v_user_id
      ORDER BY a.section, a.sort_order
    ) t
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.api_get_tax_line_items TO authenticated;

-- 4. Redefine api_update_tax_cell to accept p_source
DROP FUNCTION IF EXISTS public.api_update_tax_cell(UUID, INTEGER, NUMERIC, TEXT);

CREATE OR REPLACE FUNCTION public.api_update_tax_cell(
    p_account_id UUID,
    p_year INTEGER,
    p_amount NUMERIC,
    p_notes TEXT DEFAULT NULL,
    p_source TEXT DEFAULT 'MANUAL'
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
    WHERE account_id = p_account_id AND year = p_year AND user_id = v_user_id AND source = p_source;

    -- Upsert entry
    INSERT INTO finance.tax_entries (user_id, account_id, year, amount, notes, source, updated_by, updated_at)
    VALUES (v_user_id, p_account_id, p_year, p_amount, p_notes, p_source, v_user_id, now())
    ON CONFLICT (user_id, account_id, year, source) 
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

GRANT EXECUTE ON FUNCTION public.api_update_tax_cell TO authenticated;

COMMIT;
