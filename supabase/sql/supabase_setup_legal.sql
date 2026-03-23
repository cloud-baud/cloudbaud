-- Setup Legal/IP tables for CloudBaud
CREATE TABLE IF NOT EXISTS public.provisional_patents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    title TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Draft generated',
    description TEXT,
    claims_count INTEGER DEFAULT 0,
    security_tier TEXT,
    user_id UUID REFERENCES auth.users(id)
);
-- Turn on Row Level Security
ALTER TABLE public.provisional_patents ENABLE ROW LEVEL SECURITY;
-- Create Policies
CREATE POLICY "Users can view their own patents" ON public.provisional_patents FOR
SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own patents" ON public.provisional_patents FOR
INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own patents" ON public.provisional_patents FOR
UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own patents" ON public.provisional_patents FOR DELETE USING (auth.uid() = user_id);
-- Create a generic trigger to keep updated_at in sync
CREATE OR REPLACE FUNCTION public.handle_updated_at() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS set_patents_updated_at ON public.provisional_patents;
CREATE TRIGGER set_patents_updated_at BEFORE
UPDATE ON public.provisional_patents FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
-- Insert Sample Data for the agent user (optional, modify user_id to match your auth user)
-- INSERT INTO public.provisional_patents (title, status, description, claims_count, security_tier) 
-- VALUES
-- ('Dynamic Tenant Routing Architecture', 'Draft generated', 'System for dynamically routing tenant database requests without predefined schemas.', 12, 'Deterministic');