
-- ---------------------------------------------------------------------------
-- SECURE FINANCE API LAYER
-- Implements the "Private Schema" pattern.
-- 1. Locks down the 'finance' schema completely.
-- 2. Exposes strict 'SECURITY DEFINER' functions in 'public' schema as the only access point.
-- ---------------------------------------------------------------------------

BEGIN;

-- ---------------------------------------------------------------------------
-- 1. LOCK DOWN (REVOKE ACCESS)
-- ---------------------------------------------------------------------------
-- Prevent ANY role (anon or authenticated) from seeing the 'finance' schema or its tables
REVOKE ALL ON SCHEMA finance FROM anon, authenticated;
REVOKE ALL ON ALL TABLES IN SCHEMA finance FROM anon, authenticated;

-- ---------------------------------------------------------------------------
-- 2. HELPER FUNCTIONS
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_auth_user_id() RETURNS uuid AS $$
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  RETURN auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ---------------------------------------------------------------------------
-- 3. API FUNCTIONS (READS)
-- ---------------------------------------------------------------------------

-- API: Get Chart of Accounts
-- Replaces: select * from chart_of_accounts
CREATE OR REPLACE FUNCTION public.api_get_chart_of_accounts() 
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER AS $$
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

-- API: Get Client Categories
-- Replaces: select * from client_input_categories
CREATE OR REPLACE FUNCTION public.api_get_client_categories() 
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN (
    SELECT coalesce(jsonb_agg(t), '[]'::jsonb) FROM (
      SELECT * FROM finance.client_input_categories 
      WHERE user_id = public.get_auth_user_id()
      ORDER BY sort_order ASC
    ) t
  );
END;
$$;

-- API: Get Tax Entries for Year
-- Replaces: select *, category(*) from client_input_values
CREATE OR REPLACE FUNCTION public.api_get_tax_entries(p_year int) 
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN (
    SELECT coalesce(jsonb_agg(t), '[]'::jsonb) FROM (
        SELECT v.*, to_jsonb(c) as category
        FROM finance.client_input_values v
        JOIN finance.client_input_categories c ON v.category_id = c.id
        WHERE v.user_id = public.get_auth_user_id() AND v.year = p_year
    ) t
  );
END;
$$;

-- API: Get User Tax State (UI Persistence)
CREATE OR REPLACE FUNCTION public.api_get_user_tax_state() 
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  result jsonb;
BEGIN
  SELECT to_jsonb(s.*) INTO result
  FROM finance.user_tax_state s
  WHERE user_id = public.get_auth_user_id();
  
  RETURN result;
END;
$$;

-- API: Get Tax Documents
CREATE OR REPLACE FUNCTION public.api_get_tax_documents(p_year int DEFAULT NULL) 
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN (
    SELECT coalesce(jsonb_agg(t), '[]'::jsonb) FROM (
      SELECT * 
      FROM finance.tax_documents 
      WHERE user_id = public.get_auth_user_id()
      AND (p_year IS NULL OR year = p_year)
      ORDER BY created_at DESC
    ) t
  );
END;
$$;

-- API: Get Cell Links (Visual Evidence references)
CREATE OR REPLACE FUNCTION public.api_get_cell_links() 
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN (
    SELECT coalesce(jsonb_agg(t), '[]'::jsonb) FROM (
      SELECT r.*, to_jsonb(d) as document
      FROM finance.tax_cell_references r
      JOIN finance.tax_documents d ON r.document_id = d.id
      WHERE r.user_id = public.get_auth_user_id()
    ) t
  );
END;
$$;


-- ---------------------------------------------------------------------------
-- 4. API FUNCTIONS (WRITES)
-- ---------------------------------------------------------------------------

-- API: Save Tax State
CREATE OR REPLACE FUNCTION public.api_save_user_tax_state(
    p_years jsonb, 
    p_tax_data jsonb, 
    p_col_widths jsonb, 
    p_row_heights jsonb
) 
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_uid uuid := public.get_auth_user_id();
BEGIN
  INSERT INTO finance.user_tax_state (user_id, years, tax_data, col_widths, row_heights, updated_at)
  VALUES (v_uid, p_years, p_tax_data, p_col_widths, p_row_heights, now())
  ON CONFLICT (user_id) DO UPDATE 
  SET years = p_years, tax_data = p_tax_data, col_widths = p_col_widths, row_heights = p_row_heights, updated_at = now();
END;
$$;

-- API: Register Document (After Storage Upload)
CREATE OR REPLACE FUNCTION public.api_register_tax_document(
    p_filename text,
    p_storage_path text,
    p_year int,
    p_doc_type text
) 
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_new_rec record;
BEGIN
  INSERT INTO finance.tax_documents (user_id, filename, storage_path, year, doc_type, created_at)
  VALUES (public.get_auth_user_id(), p_filename, p_storage_path, p_year, p_doc_type, now())
  RETURNING * INTO v_new_rec;
  
  RETURN to_jsonb(v_new_rec);
END;
$$;

-- API: Update Tax Cell (Transactional)
-- Wrapper only, logic is the same but points to finance schema explicitly
CREATE OR REPLACE FUNCTION public.api_update_tax_cell(
    p_account_id uuid,
    p_year integer,
    p_amount numeric,
    p_notes text
) 
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_user_id uuid;
    v_entry_id uuid;
    v_new_data jsonb;
BEGIN
    v_user_id := public.get_auth_user_id();

    -- Verify Account ownership in FINANCE schema
    IF NOT EXISTS (SELECT 1 FROM finance.chart_of_accounts WHERE id = p_account_id AND user_id = v_user_id) THEN
        RAISE EXCEPTION 'Account not found or access denied';
    END IF;

    -- Update Logic
    INSERT INTO finance.tax_entries (user_id, account_id, year, amount, notes, updated_by, updated_at)
    VALUES (v_user_id, p_account_id, p_year, p_amount, p_notes, v_user_id, now())
    ON CONFLICT (user_id, account_id, year) 
    DO UPDATE SET amount = p_amount, notes = coalesce(p_notes, tax_entries.notes), updated_by = v_user_id, updated_at = now()
    RETURNING id, to_jsonb(tax_entries.*) INTO v_entry_id, v_new_data;

    return v_new_data;
END;
$$;

-- API: Link Document to Cell
CREATE OR REPLACE FUNCTION public.api_link_document_to_cell(
    p_section_id text,
    p_row_index int,
    p_col_key text,
    p_doc_id uuid,
    p_page int
) 
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    INSERT INTO finance.tax_cell_references (user_id, section_id, row_index, col_key, document_id, page_number)
    VALUES (public.get_auth_user_id(), p_section_id, p_row_index, p_col_key, p_doc_id, p_page)
    ON CONFLICT (user_id, section_id, row_index, col_key) 
    DO UPDATE SET document_id = p_doc_id, page_number = p_page;
END;
$$;


-- ---------------------------------------------------------------------------
-- 5. GRANTS
-- ---------------------------------------------------------------------------
-- Grant execute permission on the API functions to authenticated users
GRANT EXECUTE ON FUNCTION public.api_get_chart_of_accounts TO authenticated;
GRANT EXECUTE ON FUNCTION public.api_get_client_categories TO authenticated;
GRANT EXECUTE ON FUNCTION public.api_get_tax_entries TO authenticated;
GRANT EXECUTE ON FUNCTION public.api_get_user_tax_state TO authenticated;
GRANT EXECUTE ON FUNCTION public.api_get_tax_documents TO authenticated;
GRANT EXECUTE ON FUNCTION public.api_get_cell_links TO authenticated;
GRANT EXECUTE ON FUNCTION public.api_save_user_tax_state TO authenticated;
GRANT EXECUTE ON FUNCTION public.api_register_tax_document TO authenticated;
GRANT EXECUTE ON FUNCTION public.api_update_tax_cell TO authenticated;
GRANT EXECUTE ON FUNCTION public.api_link_document_to_cell TO authenticated;

COMMIT;
