import { supabase } from '@/shared/lib/supabase';

// --- Auth Helper ---
async function getUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) throw new Error('Not authenticated');
    return user;
}

// ============================================================
// WORKSPACE TREE
// ============================================================

/**
 * Get the full workspace hierarchy tree.
 * Returns flat list ordered for tree rendering.
 */
export async function getWorkspaceTree() {
    await getUser();
    const { data, error } = await supabase
        .from('workspaces')
        .select('*')
        .order('sort_order', { ascending: true });

    if (error) throw error;
    return data || [];
}

/**
 * Build a nested tree from flat workspace list.
 * @param {Array} workspaces - flat list from getWorkspaceTree()
 * @returns {Object} nested tree with children arrays
 */
export function buildTree(workspaces) {
    const map = {};
    const roots = [];

    workspaces.forEach(ws => {
        map[ws.id] = { ...ws, children: [] };
    });

    workspaces.forEach(ws => {
        if (ws.parent_id && map[ws.parent_id]) {
            map[ws.parent_id].children.push(map[ws.id]);
        } else if (!ws.parent_id) {
            roots.push(map[ws.id]);
        }
    });

    return roots;
}

/**
 * Resolve a workspace UUID from a route path.
 * e.g. "/workspace/finance/taxes" → UUID of the Tax site
 */
export async function resolveWorkspaceFromRoute(routePath) {
    await getUser();
    const { data, error } = await supabase
        .from('workspaces')
        .select('id, name, type, slug, route')
        .eq('route', routePath)
        .single();

    if (error) {
        // Try partial match — strip trailing slashes and query params
        const cleanPath = routePath.split('?')[0].replace(/\/$/, '');
        const { data: fallback } = await supabase
            .from('workspaces')
            .select('id, name, type, slug, route')
            .eq('route', cleanPath)
            .single();
        return fallback || null;
    }
    return data;
}

// ============================================================
// WORKSPACE MEMBERS
// ============================================================

/**
 * Invite a CRM contact to a workspace.
 * @param {string} workspaceId - UUID of the workspace
 * @param {string} contactId - UUID of the CRM contact
 * @param {string} role - 'viewer' | 'editor' | 'admin'
 */
export async function inviteContact(workspaceId, contactId, role = 'viewer') {
    const user = await getUser();
    const { data, error } = await supabase
        .from('workspace_members')
        .insert({
            workspace_id: workspaceId,
            contact_id: contactId,
            invited_by: user.id,
            role,
            status: 'pending',
        })
        .select()
        .single();

    if (error) throw error;
    return data;
}

/**
 * Get all members of a workspace.
 * Joins with contacts table to get names.
 */
export async function getWorkspaceMembers(workspaceId) {
    await getUser();
    const { data, error } = await supabase
        .from('workspace_members')
        .select(`
            *,
            contact:contacts(id, name, email, company, title)
        `)
        .eq('workspace_id', workspaceId)
        .in('status', ['pending', 'active'])
        .order('invited_at', { ascending: false });

    if (error) throw error;
    return data || [];
}

/**
 * Accept an invitation (called by the invited user).
 */
export async function acceptInvite(memberId) {
    const user = await getUser();
    const { data, error } = await supabase
        .from('workspace_members')
        .update({ status: 'active', user_id: user.id, accepted_at: new Date().toISOString() })
        .eq('id', memberId)
        .select()
        .single();

    if (error) throw error;
    return data;
}

/**
 * Revoke access for a member.
 */
export async function revokeAccess(memberId) {
    await getUser();
    const { data, error } = await supabase
        .from('workspace_members')
        .update({ status: 'revoked' })
        .eq('id', memberId)
        .select()
        .single();

    if (error) throw error;
    return data;
}

// ============================================================
// WORKSPACE MESSAGES
// ============================================================

/**
 * Get messages for a workspace (with pagination).
 * @param {string} workspaceId - UUID
 * @param {number} limit - default 50
 * @param {number} offset - default 0
 */
export async function getWorkspaceMessages(workspaceId, limit = 50, offset = 0) {
    await getUser();
    const { data, error } = await supabase
        .from('workspace_messages')
        .select('*')
        .eq('workspace_id', workspaceId)
        .order('created_at', { ascending: true })
        .range(offset, offset + limit - 1);

    if (error) throw error;
    return data || [];
}

/**
 * Send a message to a workspace.
 */
export async function sendMessage(workspaceId, content, messageType = 'text') {
    const user = await getUser();
    const { data, error } = await supabase
        .from('workspace_messages')
        .insert({
            workspace_id: workspaceId,
            sender_id: user.id,
            content,
            message_type: messageType,
        })
        .select()
        .single();

    if (error) throw error;
    return data;
}

/**
 * Subscribe to real-time messages for a workspace.
 * Returns a channel that can be unsubscribed.
 */
export function subscribeToMessages(workspaceId, onMessage) {
    const channel = supabase
        .channel(`workspace-${workspaceId}`)
        .on(
            'postgres_changes',
            {
                event: 'INSERT',
                schema: 'public',
                table: 'workspace_messages',
                filter: `workspace_id=eq.${workspaceId}`,
            },
            (payload) => {
                onMessage(payload.new);
            }
        )
        .subscribe();

    return channel;
}

/**
 * Unsubscribe from a workspace channel.
 */
export function unsubscribeFromMessages(channel) {
    if (channel) {
        supabase.removeChannel(channel);
    }
}
