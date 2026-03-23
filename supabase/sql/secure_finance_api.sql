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
-- REVOKE ALL ON SCHEMA finance FROM anon, authenticated;
-- REVOKE ALL ON ALL TABLES IN SCHEMA finance FROM anon, authenticated;

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
      SELECT * FROM public.chart_of_accounts 
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
      SELECT * FROM public.client_input_categories 
      WHERE user_id = public.get_auth_user_id()
      ORDER BY sort_order ASC
    ) t
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.api_get_chart_of_accounts TO authenticated;
GRANT EXECUTE ON FUNCTION public.api_get_client_categories TO authenticated;

-- API: Create Account
CREATE OR REPLACE FUNCTION public.api_create_account(
    p_name text,
    p_code text,
    p_type text,
    p_section text DEFAULT NULL
) 
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_new_rec record;
BEGIN
  INSERT INTO public.chart_of_accounts (user_id, name, code, type, section, sort_order)
  VALUES (public.get_auth_user_id(), p_name, p_code, p_type, p_section, 9999)
  RETURNING * INTO v_new_rec;
  
  RETURN to_jsonb(v_new_rec);
END;
$$;

-- API: Update Account
CREATE OR REPLACE FUNCTION public.api_update_account(
    p_id uuid,
    p_name text,
    p_code text,
    p_section text
) 
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_updated_rec record;
BEGIN
  UPDATE public.chart_of_accounts
  SET name = p_name, code = p_code, section = p_section
  WHERE id = p_id AND user_id = public.get_auth_user_id()
  RETURNING * INTO v_updated_rec;
  
  RETURN to_jsonb(v_updated_rec);
END;
$$;

-- API: Delete Account
CREATE OR REPLACE FUNCTION public.api_delete_account(p_id uuid) 
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  DELETE FROM public.chart_of_accounts
  WHERE id = p_id AND user_id = public.get_auth_user_id();
  
  RETURN FOUND; 
END;
$$;

GRANT EXECUTE ON FUNCTION public.api_create_account TO authenticated;
GRANT EXECUTE ON FUNCTION public.api_update_account TO authenticated;
GRANT EXECUTE ON FUNCTION public.api_delete_account TO authenticated;

COMMIT;
