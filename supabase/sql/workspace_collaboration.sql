-- ============================================================
-- Workspace Collaboration Schema
-- Creates tables for workspace members and real-time messaging
-- ============================================================

-- 1. WORKSPACE MEMBERS
-- Tracks which users are invited to which workspaces
CREATE TABLE IF NOT EXISTS public.workspace_members (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    workspace_id text NOT NULL,                         -- e.g. 'finance', 'marketing', 'crm'
    user_id uuid REFERENCES auth.users(id),             -- invited user (after sign-up)
    contact_id uuid REFERENCES public.contacts(id),     -- linked CRM contact
    invited_by uuid REFERENCES auth.users(id) NOT NULL, -- who sent the invite
    role text DEFAULT 'viewer' CHECK (role IN ('viewer', 'editor', 'admin')),
    status text DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'revoked')),
    invited_at timestamptz DEFAULT now(),
    accepted_at timestamptz,
    UNIQUE(workspace_id, user_id)
);

ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;

-- Owner can see all members they invited
CREATE POLICY "Owner can manage workspace members"
    ON public.workspace_members
    FOR ALL
    USING (invited_by = auth.uid());

-- Members can see other members in their workspaces
CREATE POLICY "Members can see coworkers"
    ON public.workspace_members
    FOR SELECT
    USING (workspace_id IN (
        SELECT wm.workspace_id FROM public.workspace_members wm
        WHERE wm.user_id = auth.uid() AND wm.status = 'active'
    ));

-- Active members can see their own membership
CREATE POLICY "Users can see own membership"
    ON public.workspace_members
    FOR SELECT
    USING (user_id = auth.uid());


-- 2. WORKSPACE MESSAGES
-- Stores real-time and async chat messages scoped to a workspace
CREATE TABLE IF NOT EXISTS public.workspace_messages (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    workspace_id text NOT NULL,
    sender_id uuid REFERENCES auth.users(id) NOT NULL,
    content text NOT NULL,
    message_type text DEFAULT 'text' CHECK (message_type IN ('text', 'system', 'file')),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.workspace_messages ENABLE ROW LEVEL SECURITY;

-- Members can read messages in their workspaces
CREATE POLICY "Members can read workspace messages"
    ON public.workspace_messages
    FOR SELECT
    USING (
        workspace_id IN (
            SELECT wm.workspace_id FROM public.workspace_members wm
            WHERE wm.user_id = auth.uid() AND wm.status = 'active'
        )
        OR sender_id = auth.uid()
    );

-- Members can insert messages in their workspaces
CREATE POLICY "Members can send workspace messages"
    ON public.workspace_messages
    FOR INSERT
    WITH CHECK (
        sender_id = auth.uid()
        AND workspace_id IN (
            SELECT wm.workspace_id FROM public.workspace_members wm
            WHERE wm.user_id = auth.uid() AND wm.status = 'active'
        )
    );

-- Enable realtime for workspace_messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.workspace_messages;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_workspace_members_workspace ON public.workspace_members(workspace_id);
CREATE INDEX IF NOT EXISTS idx_workspace_members_user ON public.workspace_members(user_id);
CREATE INDEX IF NOT EXISTS idx_workspace_messages_workspace ON public.workspace_messages(workspace_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_workspace_messages_sender ON public.workspace_messages(sender_id);
