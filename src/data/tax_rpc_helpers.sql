-- ============================================================================
-- HELPER FUNCTIONS FOR MULTI-SCHEMA TAX QUERIES
-- ============================================================================
-- These RPC functions allow the frontend to query year-specific schemas
-- ============================================================================

-- Function to get tax values for a specific year
CREATE OR REPLACE FUNCTION public.get_tax_values_for_year(
    p_year INTEGER,
    p_user_id UUID
) RETURNS TABLE (
    id UUID,
    user_id UUID,
    category_id UUID,
    amount NUMERIC,
    user_notes TEXT,
    data_status TEXT,
    evidence_status TEXT,
    updated_at TIMESTAMPTZ,
    category_name TEXT,
    category_section TEXT
) AS $$
DECLARE
    schema_name TEXT := 'tax_' || p_year;
BEGIN
    RETURN QUERY EXECUTE format('
        SELECT 
            v.id,
            v.user_id,
            v.category_id,
            v.amount,
            v.user_notes,
            v.data_status,
            v.evidence_status,
            v.updated_at,
            c.name as category_name,
            c.section as category_section
        FROM %I.client_input_values v
        LEFT JOIN public.client_input_categories c ON v.category_id = c.id
        WHERE v.user_id = $1
        ORDER BY c.sort_order
    ', schema_name)
    USING p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update a tax value for a specific year
CREATE OR REPLACE FUNCTION public.update_tax_value(
    p_year INTEGER,
    p_category_id UUID,
    p_amount NUMERIC,
    p_notes TEXT DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
    v_user_id UUID;
    v_entry_id UUID;
    v_result JSONB;
    schema_name TEXT := 'tax_' || p_year;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN 
        RAISE EXCEPTION 'Not authenticated'; 
    END IF;

    -- Upsert the value
    EXECUTE format('
        INSERT INTO %I.client_input_values (user_id, category_id, amount, user_notes, updated_at)
        VALUES ($1, $2, $3, $4, now())
        ON CONFLICT (user_id, category_id) 
        DO UPDATE SET 
            amount = $3,
            user_notes = COALESCE($4, %I.client_input_values.user_notes),
            updated_at = now()
        RETURNING id, to_jsonb(%I.client_input_values.*) as result
    ', schema_name, schema_name, schema_name)
    INTO v_entry_id, v_result
    USING v_user_id, p_category_id, p_amount, p_notes;

    RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
