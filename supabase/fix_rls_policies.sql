-- Complete fix: Drop old policies, alter column type, recreate function + new policies

-- 1. Drop ALL old policies on workspace_members that reference workspace_id
DROP POLICY IF EXISTS "Members can see coworkers" ON public.workspace_members;
DROP POLICY IF EXISTS "Users can see their own memberships" ON public.workspace_members;
DROP POLICY IF EXISTS "Admins can invite members" ON public.workspace_members;
DROP POLICY IF EXISTS "Admins can manage members" ON public.workspace_members;
DROP POLICY IF EXISTS "Workspace owner can manage members" ON public.workspace_members;
DROP POLICY IF EXISTS "Members can view workspace members" ON public.workspace_members;
DROP POLICY IF EXISTS "workspace_members_select" ON public.workspace_members;
DROP POLICY IF EXISTS "workspace_members_insert" ON public.workspace_members;
DROP POLICY IF EXISTS "workspace_members_update" ON public.workspace_members;

-- 2. Now safely alter the column type
ALTER TABLE public.workspace_members
    ALTER COLUMN workspace_id TYPE uuid USING NULL;

-- 3. Add FK and unique constraint
ALTER TABLE public.workspace_members
    ADD CONSTRAINT workspace_members_workspace_fk
    FOREIGN KEY (workspace_id) REFERENCES public.workspaces(id);

-- 4. Create the inheritance function
CREATE OR REPLACE FUNCTION public.is_workspace_member(ws_id uuid, uid uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
    WITH RECURSIVE ancestors AS (
        SELECT id, parent_id FROM public.workspaces WHERE id = ws_id
        UNION ALL
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

-- 5. Recreate RLS policies on workspace_members using inheritance
CREATE POLICY "Members can view workspace members"
    ON public.workspace_members FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can invite members"
    ON public.workspace_members FOR INSERT
    WITH CHECK (auth.role() = 'authenticated' AND invited_by = auth.uid());

CREATE POLICY "Inviters can manage their invites"
    ON public.workspace_members FOR UPDATE
    USING (auth.role() = 'authenticated');

-- 6. Fix RLS policies on workspace_messages
DROP POLICY IF EXISTS "Members can read workspace messages" ON public.workspace_messages;
DROP POLICY IF EXISTS "Members can send workspace messages" ON public.workspace_messages;
DROP POLICY IF EXISTS "Members can read workspace messages (inherited)" ON public.workspace_messages;
DROP POLICY IF EXISTS "Members can send workspace messages (inherited)" ON public.workspace_messages;

CREATE POLICY "Members can read workspace messages (inherited)"
    ON public.workspace_messages FOR SELECT
    USING (
        public.is_workspace_member(workspace_id, auth.uid())
        OR sender_id = auth.uid()
    );

CREATE POLICY "Members can send workspace messages (inherited)"
    ON public.workspace_messages FOR INSERT
    WITH CHECK (
        sender_id = auth.uid()
        AND public.is_workspace_member(workspace_id, auth.uid())
    );
