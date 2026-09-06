-- Create organizations table
CREATE TABLE IF NOT EXISTS public.organizations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    legal_name text,
    tax_id text,
    website text,
    contact_email text,
    contact_phone text,
    description text,
    logo_url text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Create locations table
CREATE TABLE IF NOT EXISTS public.locations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE,
    name text NOT NULL,
    address text NOT NULL,
    city text NOT NULL,
    state text NOT NULL,
    zip text NOT NULL,
    country text NOT NULL DEFAULT 'USA',
    phone text,
    email text,
    is_headquarters boolean DEFAULT false,
    is_active boolean DEFAULT true,
    timezone text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Add organization_id to profiles for reference (tenant association)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES public.organizations(id);

-- Enable RLS
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;

-- Policies (Simplified for now - admin only)
CREATE POLICY "Admins can manage organization" ON public.organizations
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND (profiles.role = 'tenant_admin' OR profiles.role = 'client_admin' OR profiles.role = 'tenant-admin')
        )
    );

CREATE POLICY "Admins can manage locations" ON public.locations
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND (profiles.role = 'tenant_admin' OR profiles.role = 'client_admin' OR profiles.role = 'tenant-admin')
        )
    );

CREATE POLICY "Users can view their organization" ON public.organizations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.organization_id = organizations.id
        )
    );

CREATE POLICY "Users can view their locations" ON public.locations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.organization_id = locations.organization_id
        )
    );
