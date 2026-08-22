import React, { useState, useEffect, useMemo } from 'react';
import {
    Users,
    Shield,
    Key,
    UserPlus,
    Mail,
    Search,
    Filter,
    CheckCircle2,
    Clock,
    AlertTriangle,
    Trash2,
    Copy,
    RefreshCw,
    ExternalLink,
    Lock,
    Unlock,
    Check,
    X,
    Sliders,
    Globe,
    FileText,
    Activity,
    ChevronDown,
    Building,
    MoreHorizontal,
    Plus,
    Download
} from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Badge } from '@/shared/ui/badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/shared/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/shared/ui/dropdown-menu';
import { toast } from 'sonner';
import {
    SYSTEM_ROLES,
    SYSTEM_MODULES,
    getMembers,
    updateMemberRole,
    toggleMemberStatus,
    removeMember,
    inviteMember,
    getInvitations,
    revokeInvitation,
    getAllowedAccessRules,
    addAccessRule,
    deleteAccessRule,
    getPermissionsMatrix,
    updatePermission,
    getAuditLogs
} from './services/teamsAuthService';
import InviteMemberModal from './components/InviteMemberModal';
import { useAuth } from '@/shared/contexts/AuthContext';

export const TeamsAuthorizationDashboard = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('members');
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');

    // Data states
    const [members, setMembers] = useState([]);
    const [invitations, setInvitations] = useState([]);
    const [accessRules, setAccessRules] = useState([]);
    const [permissionsMatrix, setPermissionsMatrix] = useState({});
    const [auditLogs, setAuditLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modal state
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

    // New Domain Rule form state
    const [newPattern, setNewPattern] = useState('');
    const [newDescription, setNewDescription] = useState('');
    const [isAddingRule, setIsAddingRule] = useState(false);

    // Load all data
    const loadData = async () => {
        try {
            setLoading(true);
            const [m, inv, rules, matrix, logs] = await Promise.all([
                getMembers(),
                getInvitations(),
                getAllowedAccessRules(),
                getPermissionsMatrix(),
                getAuditLogs()
            ]);
            setMembers(m);
            setInvitations(inv);
            setAccessRules(rules);
            setPermissionsMatrix(matrix);
            setAuditLogs(logs);
        } catch (err) {
            console.error('Failed to load teams auth data:', err);
            toast.error('Failed to load authorization data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();

        const handleUpdate = () => {
            loadData();
        };

        window.addEventListener('cb-teams-update', handleUpdate);
        return () => window.removeEventListener('cb-teams-update', handleUpdate);
    }, []);

    // Handlers
    const handleRoleChange = async (memberId, newRole) => {
        try {
            const updated = await updateMemberRole(memberId, newRole, user?.email || 'admin@cloudbaud.com');
            setMembers(updated);
            toast.success(`Role updated to ${newRole.toUpperCase()}`);
        } catch (err) {
            toast.error(err.message || 'Failed to update role');
        }
    };

    const handleToggleStatus = async (memberId) => {
        try {
            const updated = await toggleMemberStatus(memberId, user?.email || 'admin@cloudbaud.com');
            setMembers(updated);
            toast.success('Member status changed');
        } catch (err) {
            toast.error(err.message || 'Failed to toggle status');
        }
    };

    const handleRemoveMember = async (memberId) => {
        if (!window.confirm('Are you sure you want to revoke all access for this member?')) return;
        try {
            const updated = await removeMember(memberId, user?.email || 'admin@cloudbaud.com');
            setMembers(updated);
            toast.success('Member removed from workspace');
        } catch (err) {
            toast.error(err.message || 'Failed to remove member');
        }
    };

    const handleInviteSuccess = async (inviteData) => {
        await inviteMember(inviteData, user?.email || 'admin@cloudbaud.com');
        toast.success(`Invitation generated for ${inviteData.email}`);
        loadData();
    };

    const handleRevokeInvite = async (inviteId) => {
        try {
            const updated = await revokeInvitation(inviteId, user?.email || 'admin@cloudbaud.com');
            setInvitations(updated);
            toast.success('Invitation revoked');
            loadData();
        } catch (err) {
            toast.error(err.message || 'Failed to revoke invite');
        }
    };

    const handleCopyInviteLink = (token) => {
        const link = `${window.location.origin}/invite/${token}`;
        navigator.clipboard.writeText(link);
        toast.success('Invitation link copied to clipboard!');
    };

    const handleAddRule = async (e) => {
        e.preventDefault();
        let pattern = (newPattern || '').trim();
        if (!pattern) {
            toast.error('Pattern is required (e.g. @domain.com or user@gmail.com)');
            return;
        }

        // Normalize if missing .com on common domains
        if (pattern.includes('@gmail') && !pattern.includes('@gmail.')) {
            pattern = pattern.replace('@gmail', '@gmail.com');
        }

        try {
            setIsAddingRule(true);
            const updated = await addAccessRule(pattern, newDescription || 'External CPA / Test Account', user?.email || 'admin@cloudbaud.com');
            setAccessRules(updated);
            setNewPattern('');
            setNewDescription('');
            toast.success(`Access rule added for ${pattern}`);
            await loadData();
        } catch (err) {
            toast.error(err.message || 'Failed to add rule');
        } finally {
            setIsAddingRule(false);
        }
    };

    const handleDeleteRule = async (ruleId, pattern) => {
        if (!window.confirm(`Revoke allowed access pattern ${pattern}?`)) return;
        try {
            const updated = await deleteAccessRule(ruleId, pattern, user?.email || 'admin@cloudbaud.com');
            setAccessRules(updated);
            toast.success(`Revoked rule: ${pattern}`);
        } catch (err) {
            toast.error(err.message || 'Failed to delete rule');
        }
    };

    const handleTogglePermission = async (roleId, moduleId, capability) => {
        if (roleId === 'owner') {
            toast.info('Owner privileges are permanent and immutable');
            return;
        }

        const currentValue = permissionsMatrix[roleId]?.[moduleId]?.[capability] ?? false;
        try {
            const updated = await updatePermission(roleId, moduleId, capability, !currentValue, user?.email || 'admin@cloudbaud.com');
            setPermissionsMatrix(updated);
            toast.success(`Permission updated`);
        } catch (err) {
            toast.error(err.message || 'Failed to update permission');
        }
    };

    // Filtered Members
    const filteredMembers = useMemo(() => {
        return members.filter(m => {
            const matchesSearch = !searchQuery || 
                m.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                m.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (m.department && m.department.toLowerCase().includes(searchQuery.toLowerCase()));
            const matchesRole = roleFilter === 'all' || m.role === roleFilter;
            return matchesSearch && matchesRole;
        });
    }, [members, searchQuery, roleFilter]);

    // KPI computations
    const totalMembersCount = members.length;
    const activeMembersCount = members.filter(m => m.status === 'active').length;
    const pendingInvitesCount = invitations.filter(i => i.status === 'pending').length;
    const rulesCount = accessRules.length;

    return (
        <div className="flex flex-col h-full bg-background text-foreground overflow-y-auto">
            {/* Header & Sub-Navigation */}
            <div className="border-b border-border bg-card/60 backdrop-blur sticky top-0 z-20 px-6 py-4">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Module Title */}
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-brand-blue/10 border border-brand-blue/30 text-brand-blue shadow-sm">
                            <Shield className="size-6" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-xl font-bold tracking-tight">Teams & Authorization</h1>
                                <Badge variant="outline" className="text-[10px] bg-brand-blue/10 text-brand-blue border-brand-blue/30 px-1.5 py-0.5">
                                    RBAC v2.4
                                </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                Role-based access control, multi-tenant permissions matrix, domain allowlists, and audit logs.
                            </p>
                        </div>
                    </div>

                    {/* Global Actions */}
                    <div className="flex items-center gap-2.5">
                        <Button
                            onClick={() => setIsInviteModalOpen(true)}
                            className="bg-brand-blue hover:bg-brand-blue/90 text-white font-medium text-xs h-9 gap-1.5 shadow-sm shadow-brand-blue/20"
                        >
                            <UserPlus className="size-3.5" />
                            <span>Invite Member</span>
                        </Button>
                    </div>
                </div>

                {/* Tabs Navigation */}
                <div className="flex items-center gap-2 mt-5 border-b border-border/40 pb-0 overflow-x-auto no-scrollbar">
                    <TabButton
                        id="members"
                        label="Member Roster"
                        badge={totalMembersCount}
                        icon={Users}
                        active={activeTab === 'members'}
                        onClick={() => setActiveTab('members')}
                    />
                    <TabButton
                        id="roles"
                        label="Roles & Permissions Matrix"
                        badge={SYSTEM_ROLES.length}
                        icon={Key}
                        active={activeTab === 'roles'}
                        onClick={() => setActiveTab('roles')}
                    />
                    <TabButton
                        id="domains"
                        label="Domain & Email Access"
                        badge={rulesCount}
                        icon={Globe}
                        active={activeTab === 'domains'}
                        onClick={() => setActiveTab('domains')}
                    />
                    <TabButton
                        id="invitations"
                        label="Invitations & Tokens"
                        badge={pendingInvitesCount}
                        icon={Mail}
                        active={activeTab === 'invitations'}
                        onClick={() => setActiveTab('invitations')}
                    />
                    <TabButton
                        id="audit"
                        label="Security & Audit Logs"
                        icon={Activity}
                        active={activeTab === 'audit'}
                        onClick={() => setActiveTab('audit')}
                    />
                </div>
            </div>

            {/* Main Content Area */}
            <div className="p-6 space-y-6 flex-1">
                {/* Top Metrics Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <StatCard
                        label="Active Members"
                        value={`${activeMembersCount} / ${totalMembersCount}`}
                        sub="Verified workspace users"
                        icon={Users}
                        accent="blue"
                    />
                    <StatCard
                        label="Defined Roles"
                        value={SYSTEM_ROLES.length}
                        sub="RBAC hierarchy levels"
                        icon={Shield}
                        accent="purple"
                    />
                    <StatCard
                        label="Domain Rules"
                        value={rulesCount}
                        sub="Trusted pattern matches"
                        icon={Globe}
                        accent="emerald"
                    />
                    <StatCard
                        label="Pending Invites"
                        value={pendingInvitesCount}
                        sub="Awaiting user token intake"
                        icon={Clock}
                        accent="amber"
                    />
                </div>

                {/* TAB 1: MEMBERS ROSTER */}
                {activeTab === 'members' && (
                    <div className="space-y-4">
                        {/* Search & Filter Bar */}
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-card p-3 rounded-xl border border-border">
                            <div className="relative w-full sm:w-80">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search by name, email, department..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="bg-secondary/40 border-border pl-9 text-xs h-9"
                                />
                            </div>

                            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Filter className="size-3.5" /> Role:
                                </span>
                                <select
                                    value={roleFilter}
                                    onChange={(e) => setRoleFilter(e.target.value)}
                                    className="bg-secondary/40 border border-border text-foreground text-xs rounded-md px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary"
                                >
                                    <option value="all">All Roles ({members.length})</option>
                                    {SYSTEM_ROLES.map(r => (
                                        <option key={r.id} value={r.id}>{r.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Members Table */}
                        <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs border-collapse">
                                    <thead>
                                        <tr className="border-b border-border bg-secondary/30 text-muted-foreground uppercase text-[11px] font-semibold tracking-wider">
                                            <th className="py-3.5 px-4">Member</th>
                                            <th className="py-3.5 px-4">Role & Level</th>
                                            <th className="py-3.5 px-4">Department</th>
                                            <th className="py-3.5 px-4">Status</th>
                                            <th className="py-3.5 px-4">Last Active</th>
                                            <th className="py-3.5 px-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/60">
                                        {filteredMembers.map((member) => {
                                            const roleObj = SYSTEM_ROLES.find(r => r.id === member.role) || SYSTEM_ROLES[2];
                                            return (
                                                <tr key={member.id} className="hover:bg-secondary/20 transition-colors group">
                                                    {/* User info */}
                                                    <td className="py-3.5 px-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className={cn(
                                                                "size-9 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-sm bg-gradient-to-br shrink-0",
                                                                member.avatarColor || "from-blue-600 to-indigo-600"
                                                            )}>
                                                                {member.initials || member.name.substring(0, 2).toUpperCase()}
                                                            </div>
                                                            <div className="flex flex-col min-w-0">
                                                                <div className="font-semibold text-foreground text-sm flex items-center gap-1.5">
                                                                    <span>{member.name}</span>
                                                                    {member.isPrimary && (
                                                                        <Badge className="bg-purple-500/20 text-purple-400 border border-purple-500/30 text-[9px] px-1 py-0 font-mono">
                                                                            Primary Owner
                                                                        </Badge>
                                                                    )}
                                                                </div>
                                                                <span className="text-muted-foreground text-xs truncate">{member.email}</span>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    {/* Role Dropdown */}
                                                    <td className="py-3.5 px-4">
                                                        {member.isPrimary ? (
                                                            <span className={cn("px-2 py-1 rounded-md text-xs font-semibold border inline-flex items-center gap-1.5", roleObj.badgeColor)}>
                                                                <Shield className="size-3" />
                                                                {roleObj.name}
                                                            </span>
                                                        ) : (
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <button className={cn(
                                                                        "px-2.5 py-1 rounded-md text-xs font-semibold border flex items-center gap-1.5 transition-all hover:opacity-85 focus:outline-none",
                                                                        roleObj.badgeColor
                                                                    )}>
                                                                        <Shield className="size-3" />
                                                                        <span>{roleObj.name}</span>
                                                                        <ChevronDown className="size-3 opacity-60" />
                                                                    </button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="start" className="w-56 bg-card border-border">
                                                                    <DropdownMenuLabel className="text-xs text-muted-foreground">
                                                                        Change Assigned Role
                                                                    </DropdownMenuLabel>
                                                                    <DropdownMenuSeparator />
                                                                    {SYSTEM_ROLES.filter(r => r.id !== 'owner').map((r) => (
                                                                        <DropdownMenuItem
                                                                            key={r.id}
                                                                            onClick={() => handleRoleChange(member.id, r.id)}
                                                                            className={cn(
                                                                                "flex items-center justify-between text-xs py-2 cursor-pointer",
                                                                                r.id === member.role && "bg-brand-blue/10 text-brand-blue font-semibold"
                                                                            )}
                                                                        >
                                                                            <div className="flex flex-col">
                                                                                <span>{r.name}</span>
                                                                                <span className="text-[10px] text-muted-foreground">Level {r.level}</span>
                                                                            </div>
                                                                            {r.id === member.role && <Check className="size-3.5 text-brand-blue" />}
                                                                        </DropdownMenuItem>
                                                                    ))}
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        )}
                                                    </td>

                                                    {/* Department */}
                                                    <td className="py-3.5 px-4 text-foreground/90 font-medium">
                                                        <div className="flex items-center gap-1.5">
                                                            <Building className="size-3.5 text-muted-foreground" />
                                                            <span>{member.department || 'General'}</span>
                                                        </div>
                                                    </td>

                                                    {/* Status */}
                                                    <td className="py-3.5 px-4">
                                                        <span className={cn(
                                                            "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold border",
                                                            member.status === 'active' 
                                                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                                                : member.status === 'invited'
                                                                ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                                                : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                                                        )}>
                                                            <span className={cn(
                                                                "size-1.5 rounded-full",
                                                                member.status === 'active' ? "bg-emerald-400" : member.status === 'invited' ? "bg-amber-400" : "bg-rose-400"
                                                            )} />
                                                            <span className="capitalize">{member.status}</span>
                                                        </span>
                                                    </td>

                                                    {/* Last Active */}
                                                    <td className="py-3.5 px-4 text-muted-foreground">
                                                        {member.lastActive}
                                                    </td>

                                                    {/* Actions */}
                                                    <td className="py-3.5 px-4 text-right">
                                                        {!member.isPrimary && (
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground">
                                                                        <MoreHorizontal className="size-4" />
                                                                    </Button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end" className="w-48 bg-card border-border">
                                                                    <DropdownMenuItem
                                                                        onClick={() => handleToggleStatus(member.id)}
                                                                        className="text-xs cursor-pointer"
                                                                    >
                                                                        {member.status === 'active' ? 'Suspend Account' : 'Activate Account'}
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuSeparator />
                                                                    <DropdownMenuItem
                                                                        onClick={() => handleRemoveMember(member.id)}
                                                                        className="text-xs text-rose-500 focus:text-rose-500 cursor-pointer"
                                                                    >
                                                                        <Trash2 className="size-3.5 mr-2" />
                                                                        Revoke Access
                                                                    </DropdownMenuItem>
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* TAB 2: ROLES & PERMISSIONS MATRIX */}
                {activeTab === 'roles' && (
                    <div className="space-y-6">
                        <div className="bg-card p-4 rounded-xl border border-border flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h3 className="text-sm font-bold text-foreground">Interactive RBAC Capability Matrix</h3>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    Click any capability pill to toggle access permissions. Owner roles have permanent root access.
                                </p>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1"><span className="size-2 rounded-full bg-emerald-400" /> Granted</span>
                                <span className="flex items-center gap-1"><span className="size-2 rounded-full bg-border" /> Restricted</span>
                            </div>
                        </div>

                        {/* Matrix Grid */}
                        <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs border-collapse">
                                    <thead>
                                        <tr className="border-b border-border bg-secondary/30 text-muted-foreground uppercase text-[11px] font-semibold">
                                            <th className="py-3.5 px-4 min-w-[200px]">System Module</th>
                                            {SYSTEM_ROLES.map((r) => (
                                                <th key={r.id} className="py-3.5 px-4 text-center min-w-[140px]">
                                                    <div className="flex flex-col items-center">
                                                        <span className="text-foreground">{r.name}</span>
                                                        <span className="text-[10px] font-normal text-muted-foreground">Level {r.level}</span>
                                                    </div>
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/60">
                                        {SYSTEM_MODULES.map((mod) => (
                                            <tr key={mod.id} className="hover:bg-secondary/15 transition-colors">
                                                {/* Module Info */}
                                                <td className="py-3.5 px-4">
                                                    <div className="flex flex-col">
                                                        <span className="font-semibold text-foreground text-sm">{mod.name}</span>
                                                        <span className="text-[11px] text-muted-foreground">{mod.description}</span>
                                                        <Badge variant="outline" className="w-fit text-[9px] mt-1 px-1.5 py-0 bg-secondary/50">
                                                            {mod.category}
                                                        </Badge>
                                                    </div>
                                                </td>

                                                {/* Role Capabilities */}
                                                {SYSTEM_ROLES.map((role) => {
                                                    const perms = permissionsMatrix[role.id]?.[mod.id] || { read: false, write: false, delete: false, admin: false };
                                                    const isOwner = role.id === 'owner';

                                                    return (
                                                        <td key={role.id} className="py-3.5 px-4 text-center align-middle">
                                                            <div className="flex flex-wrap justify-center gap-1.5 max-w-[160px] mx-auto">
                                                                <PermissionPill
                                                                    label="Read"
                                                                    active={perms.read}
                                                                    disabled={isOwner}
                                                                    onClick={() => handleTogglePermission(role.id, mod.id, 'read')}
                                                                />
                                                                <PermissionPill
                                                                    label="Write"
                                                                    active={perms.write}
                                                                    disabled={isOwner}
                                                                    onClick={() => handleTogglePermission(role.id, mod.id, 'write')}
                                                                />
                                                                <PermissionPill
                                                                    label="Delete"
                                                                    active={perms.delete}
                                                                    disabled={isOwner}
                                                                    onClick={() => handleTogglePermission(role.id, mod.id, 'delete')}
                                                                />
                                                                <PermissionPill
                                                                    label="Admin"
                                                                    active={perms.admin}
                                                                    disabled={isOwner}
                                                                    onClick={() => handleTogglePermission(role.id, mod.id, 'admin')}
                                                                />
                                                            </div>
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* TAB 3: DOMAIN & EMAIL ACCESS RULES */}
                {activeTab === 'domains' && (
                    <div className="space-y-6">
                        {/* Add Rule Form */}
                        <Card className="bg-card border-border">
                            <CardHeader className="p-4 pb-2">
                                <CardTitle className="text-sm font-bold flex items-center gap-2">
                                    <Globe className="size-4 text-brand-blue" />
                                    <span>Register Domain or Email Allowlist Pattern</span>
                                </CardTitle>
                                <CardDescription className="text-xs">
                                    Users logging in with emails matching these patterns or domains will automatically be granted workspace access.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-4 pt-2">
                                <form onSubmit={handleAddRule} className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-foreground/90">Email or Domain Pattern *</label>
                                        <Input
                                            placeholder="e.g. @cloudbaud.com or user@partner.com"
                                            value={newPattern}
                                            onChange={(e) => setNewPattern(e.target.value)}
                                            className="bg-secondary/40 border-border text-xs h-9"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-foreground/90">Description / Partner Name</label>
                                        <Input
                                            placeholder="e.g. Core Engineering Team / External Tax Auditor"
                                            value={newDescription}
                                            onChange={(e) => setNewDescription(e.target.value)}
                                            className="bg-secondary/40 border-border text-xs h-9"
                                        />
                                    </div>
                                    <Button
                                        type="submit"
                                        disabled={isAddingRule}
                                        className="bg-brand-blue hover:bg-brand-blue/90 text-white text-xs h-9 font-semibold gap-1.5"
                                    >
                                        <Plus className="size-4" />
                                        {isAddingRule ? 'Adding Rule...' : 'Add Allowed Pattern'}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>

                        {/* Allowed Rules List */}
                        <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
                            <div className="p-4 border-b border-border flex items-center justify-between">
                                <h3 className="text-sm font-bold text-foreground">Active Allowed Access Rules</h3>
                                <Badge variant="outline" className="text-xs bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                                    {accessRules.length} Active Rules
                                </Badge>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs border-collapse">
                                    <thead>
                                        <tr className="border-b border-border bg-secondary/30 text-muted-foreground uppercase text-[11px] font-semibold">
                                            <th className="py-3.5 px-4">Pattern / Domain</th>
                                            <th className="py-3.5 px-4">Description</th>
                                            <th className="py-3.5 px-4">Created Date</th>
                                            <th className="py-3.5 px-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/60">
                                        {accessRules.map((rule) => {
                                            const isPrimaryDomain = rule.email_pattern === '@cloudbaud.com';
                                            return (
                                                <tr key={rule.id} className="hover:bg-secondary/15 transition-colors">
                                                    <td className="py-3.5 px-4">
                                                        <div className="flex items-center gap-2">
                                                            <Globe className="size-3.5 text-brand-blue" />
                                                            <span className="font-mono font-semibold text-brand-blue text-sm">
                                                                {rule.email_pattern}
                                                            </span>
                                                            {isPrimaryDomain && (
                                                                <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-[9px] px-1 py-0">
                                                                    Primary Domain
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="py-3.5 px-4 text-foreground/90 font-medium">
                                                        {rule.description}
                                                    </td>
                                                    <td className="py-3.5 px-4 text-muted-foreground">
                                                        {new Date(rule.created_at).toLocaleDateString()}
                                                    </td>
                                                    <td className="py-3.5 px-4 text-right">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            disabled={isPrimaryDomain}
                                                            onClick={() => handleDeleteRule(rule.id, rule.email_pattern)}
                                                            className="text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 h-8 px-2.5"
                                                            title={isPrimaryDomain ? "Cannot delete primary organization domain" : "Revoke Pattern"}
                                                        >
                                                            <Trash2 className="size-3.5" />
                                                        </Button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* TAB 4: INVITATIONS & TOKENS */}
                {activeTab === 'invitations' && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between bg-card p-4 rounded-xl border border-border">
                            <div>
                                <h3 className="text-sm font-bold text-foreground">Pending Workspace Invitations</h3>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    Track, resend, or copy cryptographic invitation tokens for pending members.
                                </p>
                            </div>
                            <Button
                                onClick={() => setIsInviteModalOpen(true)}
                                className="bg-brand-blue hover:bg-brand-blue/90 text-white text-xs h-9 gap-1.5 font-medium"
                            >
                                <Plus className="size-3.5" />
                                New Invitation
                            </Button>
                        </div>

                        <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs border-collapse">
                                    <thead>
                                        <tr className="border-b border-border bg-secondary/30 text-muted-foreground uppercase text-[11px] font-semibold">
                                            <th className="py-3.5 px-4">Invitee Email</th>
                                            <th className="py-3.5 px-4">Role Preset</th>
                                            <th className="py-3.5 px-4">Department</th>
                                            <th className="py-3.5 px-4">Invited By</th>
                                            <th className="py-3.5 px-4">Expires In</th>
                                            <th className="py-3.5 px-4 text-right">Token Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/60">
                                        {invitations.length === 0 ? (
                                            <tr>
                                                <td colSpan="6" className="py-8 text-center text-muted-foreground">
                                                    No pending invitations at this time.
                                                </td>
                                            </tr>
                                        ) : (
                                            invitations.map((inv) => {
                                                const roleObj = SYSTEM_ROLES.find(r => r.id === inv.role) || SYSTEM_ROLES[2];
                                                return (
                                                    <tr key={inv.id} className="hover:bg-secondary/15 transition-colors">
                                                        <td className="py-3.5 px-4">
                                                            <div className="flex items-center gap-2">
                                                                <Mail className="size-3.5 text-muted-foreground" />
                                                                <span className="font-semibold text-foreground text-sm">{inv.email}</span>
                                                            </div>
                                                        </td>
                                                        <td className="py-3.5 px-4">
                                                            <span className={cn("px-2 py-0.5 rounded text-[11px] font-medium border", roleObj.badgeColor)}>
                                                                {roleObj.name}
                                                            </span>
                                                        </td>
                                                        <td className="py-3.5 px-4 text-muted-foreground">
                                                            {inv.department}
                                                        </td>
                                                        <td className="py-3.5 px-4 text-muted-foreground">
                                                            {inv.invitedBy}
                                                        </td>
                                                        <td className="py-3.5 px-4">
                                                            <span className="text-amber-400 flex items-center gap-1 font-medium">
                                                                <Clock className="size-3" />
                                                                {new Date(inv.expiresAt).toLocaleDateString()}
                                                            </span>
                                                        </td>
                                                        <td className="py-3.5 px-4 text-right">
                                                            <div className="flex items-center justify-end gap-1.5">
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => handleCopyInviteLink(inv.token)}
                                                                    className="h-7 text-[11px] gap-1 px-2 border-border"
                                                                    title="Copy Token URL"
                                                                >
                                                                    <Copy className="size-3" />
                                                                    Copy Link
                                                                </Button>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => handleRevokeInvite(inv.id)}
                                                                    className="h-7 text-[11px] text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 px-2"
                                                                    title="Cancel Invitation"
                                                                >
                                                                    Revoke
                                                                </Button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* TAB 5: SECURITY & AUDIT LOGS */}
                {activeTab === 'audit' && (
                    <div className="space-y-4">
                        <div className="bg-card p-4 rounded-xl border border-border flex items-center justify-between">
                            <div>
                                <h3 className="text-sm font-bold text-foreground">Authorization Security Event Log</h3>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    Chronological audit trail of all role assignments, domain rules, and masquerade sessions.
                                </p>
                            </div>
                            <Badge variant="outline" className="text-xs bg-brand-blue/10 text-brand-blue border-brand-blue/30">
                                {auditLogs.length} Events Tracked
                            </Badge>
                        </div>

                        <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
                            <div className="divide-y divide-border/60">
                                {auditLogs.map((log) => (
                                    <div key={log.id} className="p-4 hover:bg-secondary/15 transition-colors flex items-start gap-3.5 text-xs">
                                        <div className={cn(
                                            "p-2 rounded-lg shrink-0 mt-0.5 border",
                                            log.severity === 'warning'
                                                ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                                                : "bg-brand-blue/10 text-brand-blue border-brand-blue/30"
                                        )}>
                                            {log.severity === 'warning' ? <AlertTriangle className="size-4" /> : <Activity className="size-4" />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-2">
                                                <span className="font-semibold text-foreground text-sm font-mono tracking-tight">
                                                    {log.action}
                                                </span>
                                                <span className="text-[11px] text-muted-foreground font-mono">
                                                    {new Date(log.timestamp).toLocaleString()}
                                                </span>
                                            </div>
                                            <p className="text-foreground/90 mt-1">{log.details}</p>
                                            <div className="flex items-center gap-3 mt-2 text-[11px] text-muted-foreground">
                                                <span><strong>Actor:</strong> {log.actor} ({log.actorEmail})</span>
                                                <span>•</span>
                                                <span><strong>Target:</strong> {log.target}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Invite Member Modal */}
            <InviteMemberModal
                isOpen={isInviteModalOpen}
                onClose={() => setIsInviteModalOpen(false)}
                onInviteSuccess={handleInviteSuccess}
            />
        </div>
    );
};

// Subcomponents
const TabButton = ({ label, icon: Icon, badge, active, onClick }) => (
    <button
        onClick={onClick}
        className={cn(
            "flex items-center gap-2 px-4 py-2.5 border-b-2 text-xs font-semibold transition-all whitespace-nowrap",
            active
                ? "border-brand-blue text-brand-blue bg-brand-blue/5"
                : "border-transparent text-muted-foreground hover:text-foreground hover:bg-secondary/40"
        )}
    >
        <Icon className={cn("size-4", active ? "text-brand-blue" : "text-muted-foreground")} />
        <span>{label}</span>
        {badge !== undefined && (
            <span className={cn(
                "px-1.5 py-0.2 rounded-full text-[10px] font-mono",
                active ? "bg-brand-blue text-white" : "bg-secondary text-muted-foreground"
            )}>
                {badge}
            </span>
        )}
    </button>
);

const StatCard = ({ label, value, sub, icon: Icon, accent }) => {
    const accentColors = {
        blue: "text-brand-blue bg-brand-blue/10 border-brand-blue/20",
        purple: "text-purple-400 bg-purple-500/10 border-purple-500/20",
        emerald: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
        amber: "text-amber-400 bg-amber-500/10 border-amber-500/20"
    };

    return (
        <div className="p-4 bg-card rounded-xl border border-border shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground font-medium">{label}</span>
                <div className={cn("p-1.5 rounded-lg border", accentColors[accent] || accentColors.blue)}>
                    <Icon className="size-4" />
                </div>
            </div>
            <div>
                <div className="text-xl font-bold tracking-tight text-foreground">{value}</div>
                <div className="text-[10px] text-muted-foreground mt-0.5 truncate">{sub}</div>
            </div>
        </div>
    );
};

const PermissionPill = ({ label, active, disabled, onClick }) => (
    <button
        type="button"
        disabled={disabled}
        onClick={onClick}
        className={cn(
            "px-2 py-0.5 rounded text-[10px] font-medium border transition-all cursor-pointer select-none",
            active
                ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/25"
                : "bg-secondary/40 text-muted-foreground border-border/60 hover:border-border hover:text-foreground",
            disabled && "cursor-not-allowed opacity-80"
        )}
        title={disabled ? "Owner permissions are locked" : `Click to toggle ${label}`}
    >
        {label}
    </button>
);

export default TeamsAuthorizationDashboard;
