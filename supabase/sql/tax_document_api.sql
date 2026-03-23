-- =====================================================
-- TAX DOCUMENT API FUNCTIONS
-- =====================================================
-- Secure API functions for managing tax documents and row attachments
-- Run this in your Supabase SQL Editor

BEGIN;

-- ---------------------------------------------------------------------------
-- API: Register Tax Document
-- ---------------------------------------------------------------------------
-- Called after file upload to storage to create database record
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
  -- Get authenticated user
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN 
    RAISE EXCEPTION 'Not authenticated'; 
  END IF;
  
  -- Insert document record
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

GRANT EXECUTE ON FUNCTION public.api_register_tax_document TO authenticated;

-- ---------------------------------------------------------------------------
-- API: Get Tax Documents
-- ---------------------------------------------------------------------------
-- Retrieve all tax documents for the authenticated user
-- Optionally filter by year
CREATE OR REPLACE FUNCTION public.api_get_tax_documents(
    p_year integer DEFAULT NULL
) 
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_user_id uuid;
BEGIN
  -- Get authenticated user
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN 
    RAISE EXCEPTION 'Not authenticated'; 
  END IF;
  
  -- Return documents
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

GRANT EXECUTE ON FUNCTION public.api_get_tax_documents TO authenticated;

-- ---------------------------------------------------------------------------
-- API: Get Row Attachments
-- ---------------------------------------------------------------------------
-- Retrieve all row attachments for the authenticated user
-- Returns documents with doc_type = 'ROW_ATTACHMENT'
CREATE OR REPLACE FUNCTION public.api_get_row_attachments() 
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_user_id uuid;
BEGIN
  -- Get authenticated user
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN 
    RAISE EXCEPTION 'Not authenticated'; 
  END IF;
  
  -- Return row attachments
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

GRANT EXECUTE ON FUNCTION public.api_get_row_attachments TO authenticated;

-- ---------------------------------------------------------------------------
-- API: Link Document to Cell (Legacy V1)
-- ---------------------------------------------------------------------------
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
  -- Get authenticated user
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN 
    RAISE EXCEPTION 'Not authenticated'; 
  END IF;
  
  -- Insert or update cell link
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

GRANT EXECUTE ON FUNCTION public.api_link_document_to_cell TO authenticated;

-- ---------------------------------------------------------------------------
-- API: Get Cell Links
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.api_get_cell_links() 
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_user_id uuid;
BEGIN
  -- Get authenticated user
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN 
    RAISE EXCEPTION 'Not authenticated'; 
  END IF;
  
  -- Return cell links with joined document info
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

GRANT EXECUTE ON FUNCTION public.api_get_cell_links TO authenticated;

COMMIT;

-- =====================================================
-- DEPLOYMENT COMPLETE
-- =====================================================
-- ✅ API functions created for tax documents
-- ✅ Functions secured with SECURITY DEFINER
-- ✅ Permissions granted to authenticated users
-- =====================================================
