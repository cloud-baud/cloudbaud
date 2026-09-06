-- ============================================================
-- Hierarchical Workspace Security Schema
-- SharePoint-inspired: Hub → Site Collection → Site
-- with inheritance-based access control
-- ============================================================

-- 1. WORKSPACES REGISTRY (the hierarchy tree)
CREATE TABLE IF NOT EXISTS public.workspaces (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    parent_id uuid REFERENCES public.workspaces(id),
    type text NOT NULL CHECK (type IN ('hub', 'collection', 'site')),
    name text NOT NULL,
    slug text NOT NULL UNIQUE,
    icon text,                -- emoji or lucide icon name
    route text,               -- frontend route path
    sort_order int DEFAULT 0,
    created_by uuid REFERENCES auth.users(id),
    created_at timestamptz DEFAULT now()
);

ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;

-- Everyone can read the workspace tree (it's structural, not data)
CREATE POLICY "Workspace tree is readable by authenticated users"
    ON public.workspaces FOR SELECT
    USING (auth.role() = 'authenticated');

-- Only admins/owners create workspaces
CREATE POLICY "Workspace creation by authenticated users"
    ON public.workspaces FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE INDEX IF NOT EXISTS idx_workspaces_parent ON public.workspaces(parent_id);
CREATE INDEX IF NOT EXISTS idx_workspaces_slug ON public.workspaces(slug);
CREATE INDEX IF NOT EXISTS idx_workspaces_type ON public.workspaces(type);

-- 2. MIGRATE workspace_members TO USE UUID REFERENCES
-- Drop the old text-based workspace_id column and add UUID reference
ALTER TABLE public.workspace_members
    DROP CONSTRAINT IF EXISTS workspace_members_workspace_id_user_id_key;

ALTER TABLE public.workspace_members
    ALTER COLUMN workspace_id TYPE uuid USING NULL;

ALTER TABLE public.workspace_members
    ADD CONSTRAINT workspace_members_workspace_fk
    FOREIGN KEY (workspace_id) REFERENCES public.workspaces(id);

ALTER TABLE public.workspace_members
    ADD CONSTRAINT workspace_members_workspace_user_unique
    UNIQUE (workspace_id, user_id);

-- 3. INHERITANCE FUNCTION
-- Checks if a user has access to a workspace via direct membership
-- or membership at any ancestor level
CREATE OR REPLACE FUNCTION public.is_workspace_member(ws_id uuid, uid uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
    WITH RECURSIVE ancestors AS (
        -- Start with the target workspace
        SELECT id, parent_id FROM public.workspaces WHERE id = ws_id
        UNION ALL
        -- Walk up to parent
        SELECT w.id, w.parent_id FROM public.workspaces w
        JOIN ancestors a ON w.id = a.parent_id
    )
    SELECT EXISTS (
        SELECT 1 FROM public.workspace_members wm
        WHERE wm.user_id = uid
        AND wm.status = 'active'
        AND wm.workspace_id IN (SELECT id FROM ancestors)
    );
$$;

-- 4. UPDATE RLS POLICIES ON workspace_messages TO USE INHERITANCE
DROP POLICY IF EXISTS "Members can read workspace messages" ON public.workspace_messages;
DROP POLICY IF EXISTS "Members can send workspace messages" ON public.workspace_messages;

-- Messages: readable if you're a member (with inheritance)
CREATE POLICY "Members can read workspace messages (inherited)"
    ON public.workspace_messages FOR SELECT
    USING (
        public.is_workspace_member(workspace_id::uuid, auth.uid())
        OR sender_id = auth.uid()
    );

-- Messages: writable if you're a member (with inheritance)
CREATE POLICY "Members can send workspace messages (inherited)"
    ON public.workspace_messages FOR INSERT
    WITH CHECK (
        sender_id = auth.uid()
        AND public.is_workspace_member(workspace_id::uuid, auth.uid())
    );

-- Also migrate workspace_messages.workspace_id to UUID
ALTER TABLE public.workspace_messages
    ALTER COLUMN workspace_id TYPE uuid USING NULL;

-- 5. SEED THE WORKSPACE HIERARCHY
-- Hub (root)
INSERT INTO public.workspaces (id, parent_id, type, name, slug, icon, route, sort_order)
VALUES
    ('a0000000-0000-0000-0000-000000000001', NULL, 'hub', 'CloudBaud', 'cloudbaud', '🌐', '/', 0)
ON CONFLICT (slug) DO NOTHING;

-- Site Collections (top-level sidebar items)
INSERT INTO public.workspaces (id, parent_id, type, name, slug, icon, route, sort_order)
VALUES
    ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'collection', 'Finance',    'finance',    '📊', '/workspace/finance',    1),
    ('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'collection', 'Marketing',  'marketing',  '📢', '/workspace/marketing',  2),
    ('b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'collection', 'Sales',      'sales',      '🚀', '/workspace/sales',      3),
    ('b0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 'collection', 'CRM',        'crm',        '👥', '/workspace/crm',        4),
    ('b0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001', 'collection', 'IT',         'it',         '🖥️', '/workspace/it',          5),
    ('b0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000001', 'collection', 'Consulting', 'consulting', '💼', '/workspace/consulting', 6),
    ('b0000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000001', 'collection', 'HR',         'hr',         '👤', '/workspace/hr',          7),
    ('b0000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000001', 'collection', 'Support',    'support',    '🛟', '/workspace/support',    8)
ON CONFLICT (slug) DO NOTHING;

-- Sites under Finance
INSERT INTO public.workspaces (id, parent_id, type, name, slug, icon, route, sort_order)
VALUES
    ('c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'site', 'Tax',         'finance/tax',         '🧾', '/workspace/finance/taxes',       1),
    ('c0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000001', 'site', 'Bookkeeping', 'finance/bookkeeping',  '📒', '/workspace/finance/bookkeeping', 2),
    ('c0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000001', 'site', 'Accounting',  'finance/accounting',   '📑', '/workspace/finance/accounting',  3),
    ('c0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000001', 'site', 'Consulting',  'finance/consulting',   '💼', '/workspace/finance/consulting',  4),
    ('c0000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000001', 'site', 'Investments', 'finance/investments',  '📈', '/workspace/finance/investments', 5)
ON CONFLICT (slug) DO NOTHING;

-- Done!
