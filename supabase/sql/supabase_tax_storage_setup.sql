-- =====================================================
-- TAX DASHBOARD STORAGE SETUP
-- =====================================================
-- This script creates the storage bucket and policies for tax documents
-- Run this in your Supabase SQL Editor

-- 1. Create the storage bucket for tax documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('tax-docs', 'tax-docs', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Set up storage policies for the tax-docs bucket

-- Policy: Allow authenticated users to upload their own files
CREATE POLICY "Users can upload their own tax documents"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'tax-docs' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Allow authenticated users to read their own files
CREATE POLICY "Users can read their own tax documents"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'tax-docs' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Allow authenticated users to update their own files
CREATE POLICY "Users can update their own tax documents"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'tax-docs' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Allow authenticated users to delete their own files
CREATE POLICY "Users can delete their own tax documents"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'tax-docs' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- =====================================================
-- TAX DASHBOARD DATABASE TABLES
-- =====================================================

-- Table: tax_documents (metadata for uploaded files)
CREATE TABLE IF NOT EXISTS public.tax_documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  year INTEGER,
  doc_type TEXT NOT NULL DEFAULT 'SUPPORTING', -- 'RETURN' | 'SUPPORTING' | 'W2' | etc.
  storage_path TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on tax_documents
ALTER TABLE public.tax_documents ENABLE ROW LEVEL SECURITY;

-- Policy: Users can insert their own documents
CREATE POLICY "Users can insert their own tax documents"
ON public.tax_documents
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can read their own documents
CREATE POLICY "Users can read their own tax documents"
ON public.tax_documents
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Policy: Users can update their own documents
CREATE POLICY "Users can update their own tax documents"
ON public.tax_documents
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Policy: Users can delete their own documents
CREATE POLICY "Users can delete their own tax documents"
ON public.tax_documents
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Table: tax_cell_references (links between cells and documents)
CREATE TABLE IF NOT EXISTS public.tax_cell_references (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  section_id TEXT NOT NULL,
  row_index INTEGER NOT NULL,
  col_key TEXT NOT NULL,
  document_id UUID NOT NULL REFERENCES public.tax_documents(id) ON DELETE CASCADE,
  page_number INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, section_id, row_index, col_key)
);

-- Enable RLS on tax_cell_references
ALTER TABLE public.tax_cell_references ENABLE ROW LEVEL SECURITY;

-- Policy: Users can manage their own cell references
CREATE POLICY "Users can manage their own cell references"
ON public.tax_cell_references
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_tax_documents_user_year ON public.tax_documents(user_id, year);
CREATE INDEX IF NOT EXISTS idx_tax_documents_doc_type ON public.tax_documents(user_id, doc_type);
CREATE INDEX IF NOT EXISTS idx_tax_cell_references_user ON public.tax_cell_references(user_id);
CREATE INDEX IF NOT EXISTS idx_tax_cell_references_document ON public.tax_cell_references(document_id);

-- =====================================================
-- NOTES
-- =====================================================
-- After running this script:
-- 1. The 'tax-docs' storage bucket will be created (public for now)
-- 2. Users can only access files in folders matching their user_id
-- 3. All database tables have Row Level Security enabled
-- 4. Users can only see/modify their own tax data
--
-- To make the bucket private (recommended for production):
-- UPDATE storage.buckets SET public = false WHERE id = 'tax-docs';
-- Then use signed URLs instead of public URLs in the application
