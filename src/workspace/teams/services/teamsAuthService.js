import { supabase } from '@/shared/lib/supabase';
import { VIEW_AS_PERSONAS } from '@/workspace/finance/ViewAsContext';

// Storage keys
const STORAGE_KEYS = {
    MEMBERS: 'cb_teams_members',
    ROLES: 'cb_teams_roles',
    PERMISSIONS: 'cb_teams_permissions_matrix',
    INVITATIONS: 'cb_teams_invitations',
    AUDIT_LOGS: 'cb_teams_audit_logs',
    ALLOWED_ACCESS: 'cb_teams_allowed_access'
};

// Default System Roles
export const SYSTEM_ROLES = [
    {
        id: 'owner',
        name: 'Owner',
        badgeColor: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
        description: 'Full root administrative access to all workspace services, finances, and security controls.',
        level: 100,
        isSystem: true
    },
    {
        id: 'admin',
        name: 'Administrator',
        badgeColor: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
        description: 'Can manage workspace members, configure integrations, and oversee all operational modules.',
        level: 80,
        isSystem: true
    },
    {
        id: 'member',
        name: 'Team Member',
        badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
        description: 'Standard collaborator access to assigned projects, documents, and department tools.',
        level: 50,
        isSystem: true
    },
    {
        id: 'cpa',
        name: 'External CPA / Preparer',
        badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
        description: 'Specialized financial access for tax preparation, bookkeeping review, and audit reconciliation.',
        level: 40,
        isSystem: false
    },
    {
        id: 'auditor',
        name: 'Compliance Auditor',
        badgeColor: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
        description: 'Read-only access across all logs, legal patents, NDAs, and CMDB inventory for compliance.',
        level: 30,
        isSystem: false
    },
    {
        id: 'viewer',
        name: 'Viewer',
        badgeColor: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
        description: 'Read-only guest access limited to shared public documents and workspace feeds.',
        level: 10,
        isSystem: true
    }
];

// System Modules & Capabilities
export const SYSTEM_MODULES = [
    { id: 'finances', name: 'Finances & Accounting', category: 'Financial', description: 'Financial statements, general ledger, and reconciliation' },
    { id: 'taxes', name: 'Tax Workpapers & W-2s', category: 'Financial', description: 'Tax returns, named ranges, 1040/1120 schedules, and doc storage' },
    { id: 'cmdb', name: 'IT CMDB & Applications', category: 'Infrastructure', description: 'Hostinger domains, application catalog, and server assets' },
    { id: 'legal', name: 'Legal & Provisional Patents', category: 'Operations', description: 'NDA generators, prior art search, and patent submissions' },
    { id: 'crm', name: 'CRM & Pipeline', category: 'Sales & Growth', description: 'Client contact directory, deal pipeline, and communications' },
    { id: 'marketing', name: 'Marketing & Brand Assets', category: 'Sales & Growth', description: 'Campaigns, social asset management, and whitepapers' },
    { id: 'auth_admin', name: 'Authorization & Team Access', category: 'Security', description: 'Role assignments, domain allowlists, and audit logs' },
    { id: 'settings', name: 'Workspace & Appearance Settings', category: 'System', description: 'Custom logos, navigation bar, typography, and API keys' },
    { id: 'ai_bot', name: 'CloudBot AI Intelligence', category: 'AI Tools', description: 'Ollama local models, autonomous agents, and RAG analysis' }
];

// Initial Permissions Matrix (Role -> Module -> Permissions)
const DEFAULT_PERMISSIONS_MATRIX = {
    owner: {
        finances: { read: true, write: true, delete: true, admin: true },
        taxes: { read: true, write: true, delete: true, admin: true },
        cmdb: { read: true, write: true, delete: true, admin: true },
        legal: { read: true, write: true, delete: true, admin: true },
        crm: { read: true, write: true, delete: true, admin: true },
        marketing: { read: true, write: true, delete: true, admin: true },
        auth_admin: { read: true, write: true, delete: true, admin: true },
        settings: { read: true, write: true, delete: true, admin: true },
        ai_bot: { read: true, write: true, delete: true, admin: true }
    },
    admin: {
        finances: { read: true, write: true, delete: false, admin: false },
        taxes: { read: true, write: true, delete: false, admin: false },
        cmdb: { read: true, write: true, delete: true, admin: true },
        legal: { read: true, write: true, delete: false, admin: true },
        crm: { read: true, write: true, delete: true, admin: true },
        marketing: { read: true, write: true, delete: true, admin: true },
        auth_admin: { read: true, write: true, delete: false, admin: true },
        settings: { read: true, write: true, delete: false, admin: true },
        ai_bot: { read: true, write: true, delete: true, admin: true }
    },
    member: {
        finances: { read: false, write: false, delete: false, admin: false },
        taxes: { read: false, write: false, delete: false, admin: false },
        cmdb: { read: true, write: false, delete: false, admin: false },
        legal: { read: true, write: true, delete: false, admin: false },
        crm: { read: true, write: true, delete: false, admin: false },
        marketing: { read: true, write: true, delete: false, admin: false },
        auth_admin: { read: false, write: false, delete: false, admin: false },
        settings: { read: true, write: false, delete: false, admin: false },
        ai_bot: { read: true, write: true, delete: false, admin: false }
    },
    cpa: {
        finances: { read: true, write: true, delete: false, admin: false },
        taxes: { read: true, write: true, delete: false, admin: false },
        cmdb: { read: false, write: false, delete: false, admin: false },
        legal: { read: false, write: false, delete: false, admin: false },
        crm: { read: false, write: false, delete: false, admin: false },
        marketing: { read: false, write: false, delete: false, admin: false },
        auth_admin: { read: false, write: false, delete: false, admin: false },
        settings: { read: false, write: false, delete: false, admin: false },
        ai_bot: { read: true, write: false, delete: false, admin: false }
    },
    auditor: {
        finances: { read: true, write: false, delete: false, admin: false },
        taxes: { read: true, write: false, delete: false, admin: false },
        cmdb: { read: true, write: false, delete: false, admin: false },
        legal: { read: true, write: false, delete: false, admin: false },
        crm: { read: true, write: false, delete: false, admin: false },
        marketing: { read: true, write: false, delete: false, admin: false },
        auth_admin: { read: true, write: false, delete: false, admin: false },
        settings: { read: true, write: false, delete: false, admin: false },
        ai_bot: { read: true, write: false, delete: false, admin: false }
    },
    viewer: {
        finances: { read: false, write: false, delete: false, admin: false },
        taxes: { read: false, write: false, delete: false, admin: false },
        cmdb: { read: false, write: false, delete: false, admin: false },
        legal: { read: false, write: false, delete: false, admin: false },
        crm: { read: false, write: false, delete: false, admin: false },
        marketing: { read: true, write: false, delete: false, admin: false },
        auth_admin: { read: false, write: false, delete: false, admin: false },
        settings: { read: false, write: false, delete: false, admin: false },
        ai_bot: { read: true, write: false, delete: false, admin: false }
    }
};

// Initial Seed Members Roster
const DEFAULT_MEMBERS = [
    {
        id: 'usr-owner-001',
        name: 'Jishnu Nath',
        email: 'jish.nath@cloudbaud.com',
        role: 'owner',
        department: 'Executive / Engineering',
        status: 'active',
        initials: 'JN',
        avatarColor: 'from-blue-600 to-indigo-600',
        joinedAt: '2024-01-15T09:00:00Z',
        lastActive: 'Just now',
        isPrimary: true
    },
    {
        id: 'usr-mem-002',
        name: 'Deepika Nath',
        email: 'deepika.nath@gmail.com',
        role: 'admin',
        department: 'Operations & Finance',
        status: 'active',
        initials: 'DN',
        avatarColor: 'from-pink-600 to-rose-600',
        joinedAt: '2024-02-01T10:30:00Z',
        lastActive: '12 mins ago'
    },
    {
        id: 'usr-cpa-003',
        name: 'David Ramsey',
        email: 'david.ramsey.cpa@gmail.com',
        role: 'cpa',
        department: 'External CPA / Advisory',
        status: 'active',
        initials: 'DR',
        avatarColor: 'from-emerald-600 to-teal-600',
        joinedAt: '2024-03-10T14:15:00Z',
        lastActive: '2 hours ago'
    },
    {
        id: 'usr-aud-004',
        name: 'Cliff Weathers',
        email: 'cliff.weathers@auditpro.com',
        role: 'auditor',
        department: 'Compliance Audit',
        status: 'active',
        initials: 'CW',
        avatarColor: 'from-cyan-600 to-blue-600',
        joinedAt: '2024-05-18T11:00:00Z',
        lastActive: 'Yesterday'
    },
    {
        id: 'usr-mem-005',
        name: 'Matt R. Horn',
        email: 'matt.horn@cloudbaud.com',
        role: 'member',
        department: 'Engineering',
        status: 'active',
        initials: 'MH',
        avatarColor: 'from-violet-600 to-purple-600',
        joinedAt: '2024-06-01T08:45:00Z',
        lastActive: '3 days ago'
    }
];

// Initial Invitations
const DEFAULT_INVITATIONS = [
    {
        id: 'inv-9821',
        email: 'sarah.connor@cybersec.io',
        role: 'auditor',
        department: 'Security Review',
        invitedBy: 'jish.nath@cloudbaud.com',
        invitedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
        expiresAt: new Date(Date.now() + 5 * 86400000).toISOString(),
        token: 'cb_inv_' + Math.random().toString(36).substring(2, 15),
        status: 'pending'
    },
    {
        id: 'inv-4103',
        email: 'alex.morgan@financepartner.com',
        role: 'cpa',
        department: 'Tax Audit',
        invitedBy: 'jish.nath@cloudbaud.com',
        invitedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
        expiresAt: new Date(Date.now() + 6 * 86400000).toISOString(),
        token: 'cb_inv_' + Math.random().toString(36).substring(2, 15),
        status: 'pending'
    }
];

// Default Initial Audit Logs
const DEFAULT_AUDIT_LOGS = [
    {
        id: 'log-101',
        action: 'ROLE_MODIFIED',
        actor: 'Jishnu Nath',
        actorEmail: 'jish.nath@cloudbaud.com',
        target: 'Deepika Nath (deepika.nath@gmail.com)',
        details: 'Promoted role from Team Member to Administrator',
        timestamp: new Date(Date.now() - 45 * 60000).toISOString(),
        severity: 'info'
    },
    {
        id: 'log-102',
        action: 'DOMAIN_RULE_ADDED',
        actor: 'Jishnu Nath',
        actorEmail: 'jish.nath@cloudbaud.com',
        target: '@cloudbaud.com',
        details: 'Added trusted auto-login domain pattern with standard Member role',
        timestamp: new Date(Date.now() - 3 * 3600000).toISOString(),
        severity: 'info'
    },
    {
        id: 'log-103',
        action: 'INVITATION_SENT',
        actor: 'Jishnu Nath',
        actorEmail: 'jish.nath@cloudbaud.com',
        target: 'alex.morgan@financepartner.com',
        details: 'Generated single-use invite token with CPA role',
        timestamp: new Date(Date.now() - 24 * 3600000).toISOString(),
        severity: 'info'
    },
    {
        id: 'log-104',
        action: 'MASQUERADE_SESSION',
        actor: 'Jishnu Nath',
        actorEmail: 'jish.nath@cloudbaud.com',
        target: 'David Ramsey (CPA)',
        details: 'Initiated "View As" session for tax schedule review',
        timestamp: new Date(Date.now() - 48 * 3600000).toISOString(),
        severity: 'warning'
    }
];

// =========================================================================
// SERVICE METHODS
// =========================================================================

/**
 * Get Team Members with Local & Supabase sync
 */
export async function getMembers() {
    try {
        const local = localStorage.getItem(STORAGE_KEYS.MEMBERS);
        if (local) return JSON.parse(local);
    } catch (e) {
        console.warn('Failed to parse local members', e);
    }
    localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(DEFAULT_MEMBERS));
    return DEFAULT_MEMBERS;
}

/**
 * Update a member's role
 */
export async function updateMemberRole(memberId, newRole, actorEmail = 'jish.nath@cloudbaud.com') {
    const members = await getMembers();
    const targetMember = members.find(m => m.id === memberId);
    if (!targetMember) throw new Error('Member not found');

    const oldRole = targetMember.role;
    const updated = members.map(m => m.id === memberId ? { ...m, role: newRole } : m);
    localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(updated));

    // Append to audit log
    await recordAuditLog({
        action: 'ROLE_MODIFIED',
        actor: 'Admin User',
        actorEmail,
        target: `${targetMember.name} (${targetMember.email})`,
        details: `Changed role from ${oldRole.toUpperCase()} to ${newRole.toUpperCase()}`,
        severity: 'info'
    });

    window.dispatchEvent(new CustomEvent('cb-teams-update', { detail: { type: 'MEMBERS' } }));
    return updated;
}

/**
 * Update a member's status (active / suspended)
 */
export async function toggleMemberStatus(memberId, actorEmail = 'jish.nath@cloudbaud.com') {
    const members = await getMembers();
    const targetMember = members.find(m => m.id === memberId);
    if (!targetMember) throw new Error('Member not found');
    if (targetMember.isPrimary) throw new Error('Cannot suspend primary owner');

    const nextStatus = targetMember.status === 'active' ? 'suspended' : 'active';
    const updated = members.map(m => m.id === memberId ? { ...m, status: nextStatus } : m);
    localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(updated));

    await recordAuditLog({
        action: nextStatus === 'suspended' ? 'MEMBER_SUSPENDED' : 'MEMBER_ACTIVATED',
        actor: 'Admin User',
        actorEmail,
        target: `${targetMember.name} (${targetMember.email})`,
        details: `Account status updated to ${nextStatus.toUpperCase()}`,
        severity: nextStatus === 'suspended' ? 'warning' : 'info'
    });

    window.dispatchEvent(new CustomEvent('cb-teams-update', { detail: { type: 'MEMBERS' } }));
    return updated;
}

/**
 * Remove a member from the workspace
 */
export async function removeMember(memberId, actorEmail = 'jish.nath@cloudbaud.com') {
    const members = await getMembers();
    const targetMember = members.find(m => m.id === memberId);
    if (!targetMember) throw new Error('Member not found');
    if (targetMember.isPrimary) throw new Error('Cannot remove primary owner');

    const updated = members.filter(m => m.id !== memberId);
    localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(updated));

    await recordAuditLog({
        action: 'MEMBER_REMOVED',
        actor: 'Admin User',
        actorEmail,
        target: `${targetMember.name} (${targetMember.email})`,
        details: `Revoked all workspace access and deleted membership`,
        severity: 'warning'
    });

    window.dispatchEvent(new CustomEvent('cb-teams-update', { detail: { type: 'MEMBERS' } }));
    return updated;
}

/**
 * Invite a new member
 */
export async function inviteMember(inviteData, actorEmail = 'jish.nath@cloudbaud.com') {
    const { email, role, department, name } = inviteData;
    if (!email) throw new Error('Email is required');

    const invites = await getInvitations();
    const existing = invites.find(i => i.email.toLowerCase() === email.toLowerCase() && i.status === 'pending');
    if (existing) throw new Error('An active invitation for this email already exists');

    const newInvite = {
        id: 'inv-' + Math.floor(1000 + Math.random() * 9000),
        name: name || email.split('@')[0],
        email: email.trim().toLowerCase(),
        role: role || 'member',
        department: department || 'General',
        invitedBy: actorEmail,
        invitedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 7 * 86400000).toISOString(),
        token: 'cb_inv_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36),
        status: 'pending'
    };

    const updatedInvites = [newInvite, ...invites];
    localStorage.setItem(STORAGE_KEYS.INVITATIONS, JSON.stringify(updatedInvites));

    // Also add to members list as invited
    const members = await getMembers();
    const newMember = {
        id: 'usr-' + Math.random().toString(36).substring(2, 9),
        name: name || email.split('@')[0],
        email: email.trim().toLowerCase(),
        role: role || 'member',
        department: department || 'General',
        status: 'invited',
        initials: (name ? name.split(' ').map(n => n[0]).join('').substring(0, 2) : email.substring(0, 2)).toUpperCase(),
        avatarColor: 'from-indigo-600 to-cyan-600',
        joinedAt: new Date().toISOString(),
        lastActive: 'Invitation Pending'
    };

    localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify([...members, newMember]));

    await recordAuditLog({
        action: 'INVITATION_SENT',
        actor: 'Admin User',
        actorEmail,
        target: `${email} (${role.toUpperCase()})`,
        details: `Sent invitation token with role ${role.toUpperCase()} in ${department}`,
        severity: 'info'
    });

    // Also auto-register in allowed access rules
    try {
        await addAccessRule(email.trim().toLowerCase(), `${role.toUpperCase()} (Invited by ${actorEmail})`, actorEmail);
    } catch (e) {
        console.warn('Failed to auto-register in allowed access', e);
    }

    window.dispatchEvent(new CustomEvent('cb-teams-update', { detail: { type: 'INVITATIONS' } }));
    return newInvite;
}

/**
 * Get all invitations
 */
export async function getInvitations() {
    try {
        const local = localStorage.getItem(STORAGE_KEYS.INVITATIONS);
        if (local) return JSON.parse(local);
    } catch (e) {
        console.warn('Failed to parse local invitations', e);
    }
    localStorage.setItem(STORAGE_KEYS.INVITATIONS, JSON.stringify(DEFAULT_INVITATIONS));
    return DEFAULT_INVITATIONS;
}

/**
 * Revoke an invitation
 */
export async function revokeInvitation(inviteId, actorEmail = 'jish.nath@cloudbaud.com') {
    const invites = await getInvitations();
    const target = invites.find(i => i.id === inviteId);
    if (!target) throw new Error('Invitation not found');

    const updated = invites.filter(i => i.id !== inviteId);
    localStorage.setItem(STORAGE_KEYS.INVITATIONS, JSON.stringify(updated));

    await recordAuditLog({
        action: 'INVITATION_REVOKED',
        actor: 'Admin User',
        actorEmail,
        target: target.email,
        details: `Revoked pending invitation token for ${target.email}`,
        severity: 'warning'
    });

    window.dispatchEvent(new CustomEvent('cb-teams-update', { detail: { type: 'INVITATIONS' } }));
    return updated;
}

/**
 * Get Allowed Access Rules (Supabase + Local fallback with robust merging)
 */
export async function getAllowedAccessRules() {
    let supabaseRules = [];
    try {
        const { data, error } = await supabase
            .from('allowed_access')
            .select('*')
            .order('created_at', { ascending: false });

        if (!error && Array.isArray(data)) {
            supabaseRules = data;
        }
    } catch (err) {
        console.warn('Supabase allowed_access fetch failed, using fallback', err);
    }

    let localRules = [];
    try {
        const local = localStorage.getItem(STORAGE_KEYS.ALLOWED_ACCESS);
        if (local) localRules = JSON.parse(local);
    } catch (e) {}

    const defaultRules = [
        { id: 'rule-1', email_pattern: '@cloudbaud.com', description: 'Internal CloudBaud organization domain (Auto-login enabled)', created_at: new Date().toISOString() },
        { id: 'rule-2', email_pattern: 'deepika.nath@gmail.com', description: 'Executive Co-Filer & Administrator', created_at: new Date().toISOString() },
        { id: 'rule-3', email_pattern: 'david.ramsey.cpa@gmail.com', description: 'External CPA / Financial Advisor', created_at: new Date().toISOString() },
        { id: 'rule-4', email_pattern: 'cloud9baud@gmail.com', description: 'CPA Access Test Account', created_at: new Date().toISOString() }
    ];

    const map = new Map();
    [...defaultRules, ...localRules, ...supabaseRules].forEach(rule => {
        if (rule && rule.email_pattern) {
            map.set(rule.email_pattern.toLowerCase().trim(), rule);
        }
    });

    const combined = Array.from(map.values());
    localStorage.setItem(STORAGE_KEYS.ALLOWED_ACCESS, JSON.stringify(combined));
    return combined;
}

/**
 * Add an Allowed Access Rule
 */
export async function addAccessRule(pattern, description, actorEmail = 'jish.nath@cloudbaud.com') {
    if (!pattern) throw new Error('Pattern is required');
    const cleanPattern = pattern.trim().toLowerCase();

    // 1. Update local storage first so UI receives it immediately
    let currentRules = [];
    try {
        const local = localStorage.getItem(STORAGE_KEYS.ALLOWED_ACCESS);
        if (local) currentRules = JSON.parse(local);
    } catch (e) {}

    const newRule = {
        id: 'rule-' + Math.random().toString(36).substring(2, 9),
        email_pattern: cleanPattern,
        description: description || 'Authorized via Teams Console',
        created_at: new Date().toISOString()
    };

    const updated = [newRule, ...currentRules.filter(r => r.email_pattern?.toLowerCase().trim() !== cleanPattern)];
    localStorage.setItem(STORAGE_KEYS.ALLOWED_ACCESS, JSON.stringify(updated));

    // 2. Attempt Supabase sync
    try {
        const { error } = await supabase
            .from('allowed_access')
            .insert([{ email_pattern: cleanPattern, description: description || 'Authorized via Teams Console' }]);

        if (error) {
            console.warn('Supabase allowed_access notice:', error.message);
        }
    } catch (err) {
        console.warn('Supabase insert failed, saved to local access policy', err);
    }

    await recordAuditLog({
        action: 'DOMAIN_RULE_ADDED',
        actor: 'Admin User',
        actorEmail,
        target: cleanPattern,
        details: `Allowed access pattern registered: ${cleanPattern} (${description || 'No description'})`,
        severity: 'info'
    });

    window.dispatchEvent(new CustomEvent('cb-teams-update', { detail: { type: 'ACCESS_RULES' } }));
    return updated;
}

/**
 * Delete an Allowed Access Rule
 */
export async function deleteAccessRule(ruleId, pattern, actorEmail = 'jish.nath@cloudbaud.com') {
    const cleanPattern = (pattern || '').toLowerCase().trim();
    if (cleanPattern === '@cloudbaud.com') {
        throw new Error('Cannot delete primary organizational domain @cloudbaud.com');
    }

    try {
        if (ruleId && !ruleId.startsWith('rule-')) {
            await supabase
                .from('allowed_access')
                .delete()
                .eq('id', ruleId);
        } else if (cleanPattern) {
            await supabase
                .from('allowed_access')
                .delete()
                .eq('email_pattern', cleanPattern);
        }
    } catch (err) {
        console.warn('Supabase delete failed', err);
    }

    let currentRules = [];
    try {
        const local = localStorage.getItem(STORAGE_KEYS.ALLOWED_ACCESS);
        if (local) currentRules = JSON.parse(local);
    } catch (e) {}

    const updated = currentRules.filter(r => r.email_pattern?.toLowerCase().trim() !== cleanPattern && r.id !== ruleId);
    localStorage.setItem(STORAGE_KEYS.ALLOWED_ACCESS, JSON.stringify(updated));

    await recordAuditLog({
        action: 'DOMAIN_RULE_DELETED',
        actor: 'Admin User',
        actorEmail,
        target: pattern || ruleId,
        details: `Revoked access pattern: ${pattern}`,
        severity: 'warning'
    });

    window.dispatchEvent(new CustomEvent('cb-teams-update', { detail: { type: 'ACCESS_RULES' } }));
    return updated;
}

/**
 * Get Permissions Matrix
 */
export async function getPermissionsMatrix() {
    try {
        const local = localStorage.getItem(STORAGE_KEYS.PERMISSIONS);
        if (local) return JSON.parse(local);
    } catch (e) {}
    localStorage.setItem(STORAGE_KEYS.PERMISSIONS, JSON.stringify(DEFAULT_PERMISSIONS_MATRIX));
    return DEFAULT_PERMISSIONS_MATRIX;
}

/**
 * Update Permission Flag in Matrix
 */
export async function updatePermission(roleId, moduleId, capability, value, actorEmail = 'jish.nath@cloudbaud.com') {
    if (roleId === 'owner') {
        throw new Error('Owner permissions are immutable system privileges');
    }

    const matrix = await getPermissionsMatrix();
    if (!matrix[roleId]) matrix[roleId] = {};
    if (!matrix[roleId][moduleId]) matrix[roleId][moduleId] = { read: false, write: false, delete: false, admin: false };

    matrix[roleId][moduleId][capability] = Boolean(value);
    localStorage.setItem(STORAGE_KEYS.PERMISSIONS, JSON.stringify(matrix));

    await recordAuditLog({
        action: 'PERMISSION_OVERRIDDEN',
        actor: 'Admin User',
        actorEmail,
        target: `${roleId.toUpperCase()} -> ${moduleId}`,
        details: `Updated ${capability.toUpperCase()} to ${value ? 'GRANTED' : 'REVOKED'}`,
        severity: 'info'
    });

    window.dispatchEvent(new CustomEvent('cb-teams-update', { detail: { type: 'PERMISSIONS' } }));
    return matrix;
}

/**
 * Get Security Audit Logs
 */
export async function getAuditLogs() {
    try {
        const local = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
        if (local) return JSON.parse(local);
    } catch (e) {}
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(DEFAULT_AUDIT_LOGS));
    return DEFAULT_AUDIT_LOGS;
}

/**
 * Record an audit log entry
 */
export async function recordAuditLog(entry) {
    try {
        const currentLogs = await getAuditLogs();
        const newLog = {
            id: 'log-' + Math.floor(1000 + Math.random() * 9000),
            timestamp: new Date().toISOString(),
            severity: 'info',
            ...entry
        };
        const updated = [newLog, ...currentLogs].slice(0, 100); // keep last 100
        localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(updated));
        window.dispatchEvent(new CustomEvent('cb-teams-update', { detail: { type: 'AUDIT_LOGS' } }));
        return newLog;
    } catch (e) {
        console.warn('Failed to record audit log', e);
    }
}
