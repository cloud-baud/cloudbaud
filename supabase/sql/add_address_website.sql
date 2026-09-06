-- Add address and website columns to contacts table
ALTER TABLE public.contacts ADD COLUMN IF NOT EXISTS address text DEFAULT '';
ALTER TABLE public.contacts ADD COLUMN IF NOT EXISTS website text DEFAULT '';
