-- =====================================================
-- TAX DOCUMENT & ROW ATTACHMENT DEPLOYMENT
-- For TEST DATABASE
-- =====================================================
-- This script adds document management capabilities to the existing tax dashboard
-- Run this in your Supabase SQL Editor (TEST Database)

BEGIN;

-- =====================================================
-- STEP 1: Ensure tax_documents table exists with all needed columns
-- =====================================================
-- This table may already exist from tax_deploy_master.sql
-- We'll add any missing columns if needed

DO $$ 
BEGIN
    -- Add doc_type column if it doesn't exist (for backwards compatibility)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'tax_documents' 
        AND column_name = 'doc_type'
    ) THEN
        ALTER TABLE public.tax_documents ADD COLUMN doc_type TEXT;
    END IF;
END $$;

-- =====================================================
-- STEP 2: Ensure tax_cell_references table exists (for legacy linking)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.tax_cell_references (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  section_id TEXT NOT NULL,
  row_index INTEGER NOT NULL,
  col_key TEXT NOT NULL,
  document_id UUID NOT NULL REFERENCES public.tax_documents(id) ON DELETE CASCADE,
  page_number INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, section_id, row_index, col_key)
);

-- Enable RLS if not already enabled
ALTER TABLE public.tax_cell_references ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists, then recreate
DROP POLICY IF EXISTS "Users can manage their own cell references" ON public.tax_cell_references;
CREATE POLICY "Users can manage their own cell references"
ON public.tax_cell_references
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- STEP 3: API FUNCTIONS FOR DOCUMENT MANAGEMENT
-- =====================================================

-- Helper function for auth
CREATE OR REPLACE FUNCTION public.get_auth_user_id() 
RETURNS uuid AS $$
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  RETURN auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- API: Register Tax Document
CREATE OR REPLACE FUNCTION public.api_register_tax_document(
    p_filename text,
    p_storage_path text,
    p_year integer DEFAULT NULL,
    p_doc_type text DEFAULT 'SUPPORTING'
) 
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_user_id uuid;
  v_new_doc record;
BEGIN
  v_user_id := public.get_auth_user_id();
  
  INSERT INTO public.tax_documents (
    user_id, 
    filename, 
    storage_path, 
    year, 
    doc_type
  )
  VALUES (
    v_user_id,
    p_filename,
    p_storage_path,
    p_year,
    p_doc_type
  )
  RETURNING * INTO v_new_doc;
  
  RETURN to_jsonb(v_new_doc);
END;
$$;

-- API: Get Tax Documents
CREATE OR REPLACE FUNCTION public.api_get_tax_documents(
    p_year integer DEFAULT NULL
) 
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_user_id uuid;
BEGIN
  v_user_id := public.get_auth_user_id();
  
  RETURN (
    SELECT coalesce(jsonb_agg(t), '[]'::jsonb) FROM (
      SELECT 
        id,
        filename,
        storage_path,
        year,
        doc_type,
        created_at
      FROM public.tax_documents 
      WHERE user_id = v_user_id
        AND (p_year IS NULL OR year = p_year)
      ORDER BY created_at DESC
    ) t
  );
END;
$$;

-- API: Get Row Attachments
CREATE OR REPLACE FUNCTION public.api_get_row_attachments() 
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_user_id uuid;
BEGIN
  v_user_id := public.get_auth_user_id();
  
  RETURN (
    SELECT coalesce(jsonb_agg(t), '[]'::jsonb) FROM (
      SELECT 
        id,
        filename,
        storage_path,
        doc_type,
        created_at
      FROM public.tax_documents 
      WHERE user_id = v_user_id
        AND doc_type = 'ROW_ATTACHMENT'
      ORDER BY created_at DESC
    ) t
  );
END;
$$;

-- API: Link Document to Cell
CREATE OR REPLACE FUNCTION public.api_link_document_to_cell(
    p_section_id text,
    p_row_index integer,
    p_col_key text,
    p_doc_id uuid,
    p_page integer DEFAULT 1
) 
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_user_id uuid;
  v_link_rec record;
BEGIN
  v_user_id := public.get_auth_user_id();
  
  INSERT INTO public.tax_cell_references (
    user_id,
    section_id,
    row_index,
    col_key,
    document_id,
    page_number
  )
  VALUES (
    v_user_id,
    p_section_id,
    p_row_index,
    p_col_key,
    p_doc_id,
    p_page
  )
  ON CONFLICT (user_id, section_id, row_index, col_key) 
  DO UPDATE SET 
    document_id = p_doc_id,
    page_number = p_page
  RETURNING * INTO v_link_rec;
  
  RETURN to_jsonb(v_link_rec);
END;
$$;

-- API: Get Cell Links
CREATE OR REPLACE FUNCTION public.api_get_cell_links() 
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_user_id uuid;
BEGIN
  v_user_id := public.get_auth_user_id();
  
  RETURN (
    SELECT coalesce(jsonb_agg(t), '[]'::jsonb) FROM (
      SELECT 
        cr.section_id,
        cr.row_index,
        cr.col_key,
        cr.page_number,
        cr.document_id,
        jsonb_build_object(
          'id', d.id,
          'filename', d.filename,
          'storage_path', d.storage_path,
          'year', d.year,
          'doc_type', d.doc_type
        ) as document
      FROM public.tax_cell_references cr
      JOIN public.tax_documents d ON cr.document_id = d.id
      WHERE cr.user_id = v_user_id
      ORDER BY cr.created_at DESC
    ) t
  );
END;
$$;

-- =====================================================
-- STEP 4: GRANT PERMISSIONS
-- =====================================================
GRANT EXECUTE ON FUNCTION public.get_auth_user_id TO authenticated;
GRANT EXECUTE ON FUNCTION public.api_register_tax_document TO authenticated;
GRANT EXECUTE ON FUNCTION public.api_get_tax_documents TO authenticated;
GRANT EXECUTE ON FUNCTION public.api_get_row_attachments TO authenticated;
GRANT EXECUTE ON FUNCTION public.api_link_document_to_cell TO authenticated;
GRANT EXECUTE ON FUNCTION public.api_get_cell_links TO authenticated;

COMMIT;

-- =====================================================
-- DEPLOYMENT COMPLETE
-- =====================================================
-- ✅ tax_documents table verified/updated
-- ✅ tax_cell_references table created
-- ✅ API functions created in public schema
-- ✅ RLS policies enabled
-- ✅ Permissions granted to authenticated users
-- =====================================================

-- Verify the deployment
SELECT 'Deployment successful! Functions created:' as message;
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name LIKE 'api_%document%' 
OR routine_name LIKE 'api_%attachment%'
OR routine_name LIKE 'api_%cell%';
