import React, { useState, useEffect } from 'react';
import PageShell from '@/workspace/PageShell';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { 
    Server, 
    Globe, 
    Github, 
    Cloud, 
    Database, 
    ExternalLink,
    Search,
    Filter,
    MoreHorizontal,
    Plus,
    Loader2,
    Trash2,
    LayoutList,
    LayoutGrid,
    ArrowUpDown,
    RefreshCw,
    X,
    Save,
    Check
} from 'lucide-react';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/shared/ui/dialog";
import { CmdbService } from '@/services/cmdbService';
import { useAuth } from '@/context/AuthContext';

const SEED_METADATA = {
    'jishnunath.com': {
        app_id: 'APP-001',
        name: 'Jishnunath',
        status: 'Active',
        tier: 'Production',
        hosting: 'Netlify'
    },
    'cloudbaud.com': {
        app_id: 'APP-002',
        name: 'Cloudbaud',
        status: 'Active',
        tier: 'Production',
        hosting: 'Netlify'
    },
    'rudrajabrahmins.org': {
        app_id: 'APP-003',
        name: 'Rudrajabrahmins',
        status: 'Active',
        tier: 'Production',
        hosting: 'Netlify'
    },
    'legalbench.in': {
        app_id: 'APP-004',
        name: 'Legalbench',
        status: 'Active',
        tier: 'Production',
        hosting: 'Netlify'
    },
    'mergers365.in': {
        app_id: 'APP-005',
        name: 'Mergers365',
        status: 'Development',
        tier: 'Staging',
        hosting: 'Netlify'
    },
    'systemsdesign.tech': {
        app_id: 'APP-006',
        name: 'Systemsdesign',
        status: 'Development',
        tier: 'Staging',
        hosting: 'Netlify'
    },
    'synolic.tech': {
        app_id: 'APP-007',
        name: 'Synolic',
        status: 'Development',
        tier: 'Staging',
        hosting: 'Netlify'
    },
    'sqlhealth.pro': {
        app_id: 'APP-008',
        name: 'Sqlhealth',
        status: 'Development',
        tier: 'Staging',
        hosting: 'Netlify'
    },
    'seattletechnical.com': {
        app_id: 'APP-009',
        name: 'Seattletechnical',
        status: 'Development',
        tier: 'Staging',
        hosting: 'Netlify'
    },
    'rudinsholding.com': {
        app_id: 'APP-010',
        name: 'Rudinsholding',
        status: 'Development',
        tier: 'Staging',
        hosting: 'Netlify'
    },
    'rudinsacademy.com': {
        app_id: 'APP-011',
        name: 'Rudinsacademy',
        status: 'Development',
        tier: 'Staging',
        hosting: 'Netlify'
    },
    'rudinsstart.com': {
        app_id: 'APP-012',
        name: 'Rudinsstart',
        status: 'Development',
        tier: 'Staging',
        hosting: 'Netlify'
    },
    'rudinsreach.com': {
        app_id: 'APP-013',
        name: 'Rudinsreach',
        status: 'Development',
        tier: 'Staging',
        hosting: 'Netlify'
    },
    'fifasocial.live': {
        app_id: 'APP-014',
        name: 'Fifasocial',
        status: 'Development',
        tier: 'Staging',
        hosting: 'Netlify'
    },
    'ageless.lifestyle': {
        app_id: 'APP-015',
        name: 'Ageless',
        status: 'Development',
        tier: 'Staging',
        hosting: 'Netlify'
    },
    'famloop.com': {
        app_id: 'APP-016',
        name: 'Famloop',
        status: 'Development',
        tier: 'Staging',
        hosting: 'Netlify'
    },
    'usjobs.tech': {
        app_id: 'APP-017',
        name: 'Usjobs',
        status: 'Development',
        tier: 'Staging',
        hosting: 'Netlify'
    },
    'NRIEssentials.com': {
        app_id: 'APP-018',
        name: 'NRIEssentials',
        status: 'Development',
        tier: 'Staging',
        hosting: 'Netlify'
    },
};

const NETLIFY_METADATA = {
    'cloudbaud.com': {
        siteId: '54b07907-6ac7-4209-8e9a-b6df1a3457f6',
        adminUrl: 'https://app.netlify.com/projects/cloudbaud',
        buildStatus: 'Ready',
        lastDeploy: '2026-02-13T01:15:00Z',
        repoUrl: 'https://github.com/jishnath/cloudbaud.com',
        screenshot: '/cmdb-thumbnails/cloudbaud-thumb.png' 
    },
    'systemsdesign.pro': {
        siteId: '80497b07-75d5-41e0-a8e2-5409544dc3a7',
        adminUrl: 'https://app.netlify.com/sites/systemsdesign/overview',
        buildStatus: 'Ready',
        lastDeploy: '2026-02-10T14:20:00Z',
        repoUrl: 'https://github.com/jishnath/systems-design-platform',
        screenshot: '/cmdb-thumbnails/systemsdesign-thumb.png'
    },
    'jishnunath.com': {
        siteId: '4783a135-9b8d-46fc-8be5-ab209c5dfd0d',
        adminUrl: 'https://app.netlify.com/sites/jishnunath/overview',
        buildStatus: 'Ready',
        lastDeploy: '2026-01-10T03:47:00Z',
        repoUrl: 'https://github.com/jishnath/portfolio',
        screenshot: '/cmdb-thumbnails/jishnunath-thumb.png'
    },
    'kampuz.online': {
        siteId: '614566d4-cd99-4d34-b8d8-88ec5fbbfc8e',
        adminUrl: 'https://app.netlify.com/sites/lucky-crepe-7f79dc/overview',
        buildStatus: 'Ready',
        lastDeploy: '2025-12-28T18:26:00Z',
        repoUrl: 'https://github.com/jishnath/kampuz-web',
        screenshot: '/cmdb-thumbnails/kampuz-thumb.png'
    }
};

const CmdbDashboard = () => {
    const { user } = useAuth();

    const [viewMode, setViewMode] = useState('card');
    const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });
    const [apps, setApps] = useState([]);
    const [appTypeFilter, setAppTypeFilter] = useState('all');
    const [loading, setLoading] = useState(true);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [selectedApp, setSelectedApp] = useState(null);
    const [editForm, setEditForm] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10; // Default page size

    // Column Visibility State
    const [visibleColumns, setVisibleColumns] = useState({
        appName: true,
        appId: true,
        domain: true,
        hosting: true,
        repo: true,
        status: true,
        tier: false,
        lastDeploy: false,
        buildStatus: false,
        siteId: false
    });

    // New App Form State
    const [newApp, setNewApp] = useState({
        name: '',
        domain: '',
        hosting: 'Netlify',
        github_repo: '',
        status: 'Active',
        tier: 'Production',
        app_id: ''
    });

    const isAdmin = user?.email?.toLowerCase() === 'jish.nath@cloudbaud.com';
    const canManageCmdb = Boolean(user);

    const fetchApps = React.useCallback(async () => {
        try {
            setLoading(true);
            const data = await CmdbService.getApps();
            
            // Enrich with NETLIFY_METADATA if DB fields are missing
            const enrichedData = (data || []).map(app => {
                const meta = NETLIFY_METADATA[app.domain?.toLowerCase()] || {};
                return {
                    ...app, // Spread DB fields first
                    // Map DB snake_case to component camelCase if DB has it, else use meta
                    screenshot: app.screenshot_url || meta.screenshot || null,
                    adminUrl: app.admin_url || meta.adminUrl || null,
                    siteId: app.site_id || meta.siteId || null,
                    lastDeploy: app.last_deploy_at || meta.lastDeploy || null,
                    buildStatus: app.build_status || meta.buildStatus || null,
                    
                    // Fallbacks for core fields
                    github_repo: app.github_repo || meta.repoUrl || '', 
                    app_id: app.app_id || meta.siteId?.substring(0, 8).toUpperCase() || ''
                };
            });

            setApps(enrichedData);
        } catch (err) {
            console.error('Error fetching apps:', err);
        } finally {
            setLoading(false);
        }
    }, [])

    useEffect(() => {
        fetchApps();
    }, [fetchApps]);

    const handleSelectApp = (app) => {
        setSelectedApp(app);
        setEditForm({ ...app });
    };

    const handleClosePanel = () => {
        setSelectedApp(null);
        setEditForm(null);
    };

    const handleSaveApp = async () => {
        if (!editForm || !editForm.id) return;
        setIsSaving(true);
        try {
            await CmdbService.updateApp(editForm.id, {
                name: editForm.name,
                domain: editForm.domain,
                hosting: editForm.hosting,
                github_repo: editForm.github_repo,
                status: editForm.status,
                tier: editForm.tier,
                app_id: editForm.app_id
            });
            await fetchApps();
            // Re-select app from fetched list so metadata updates
            // (done via a side-effect effectively by fetchApps changing apps list, 
            // but we can just leave it selected if they want to keep editing)
            alert('Application updated successfully!');
            handleClosePanel();
        } catch(e) {
            console.error(e);
            alert('Failed to update application details.');
        } finally {
            setIsSaving(false);
        }
    };



    const handleSyncMetadata = async () => {
        if (!confirm('This will sync local Netlify metadata to the Supabase database. Continue?')) return;
        
        try {
            setLoading(true);
            let updateCount = 0;
            
            // Iterate over hardcoded metadata and upsert to DB
            for (const [domain, meta] of Object.entries({...SEED_METADATA, ...NETLIFY_METADATA})) {
                const dbPayload = {
                    domain: domain,
                    ...(meta.name && { name: meta.name }),
                    ...(meta.app_id && { app_id: meta.app_id }),
                    ...(meta.status && { status: meta.status }),
                    ...(meta.tier && { tier: meta.tier }),
                    ...(meta.hosting && { hosting: meta.hosting }),
                    ...(meta.screenshot && { screenshot_url: meta.screenshot }),
                    ...(meta.adminUrl && { admin_url: meta.adminUrl }),
                    ...(meta.siteId && { site_id: meta.siteId }),
                    ...(meta.lastDeploy && { last_deploy_at: meta.lastDeploy }),
                    ...(meta.buildStatus && { build_status: meta.buildStatus }),
                    ...(meta.repoUrl && { github_repo: meta.repoUrl })
                };

                await CmdbService.upsertAppByDomain(domain, dbPayload);
                updateCount++;
            }
            
            alert(`Successfully synced ${updateCount} apps to Supabase.`);
            fetchApps(); // Refresh to show DB data
        } catch (err) {
            console.error('Error syncing metadata:', err);
            alert('Failed to sync metadata to Supabase.');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateApp = async (e) => {
        e.preventDefault();
        try {
            // Auto-generate App ID if empty (Simple increment logic or random)
            // For now, let's just use a timestamp-based suffix if empty or let user input
            const appPayload = {
                ...newApp,
                app_id: newApp.app_id || `APP-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`
            };

            await CmdbService.createApp(appPayload);

            setIsCreateOpen(false);
            setNewApp({
                name: '',
                domain: '',
                hosting: 'Netlify',
                github_repo: '',
                status: 'Active',
                tier: 'Production',
                app_id: ''
            });
            fetchApps();
        } catch (err) {
            console.error('Error creating app:', err);
            alert('Failed to create application.');
        }
    };

    const handleDeleteApp = async (id) => {
        if (!confirm('Are you sure you want to delete this application?')) return;
        
        try {
            await CmdbService.deleteApp(id);
            fetchApps();
        } catch (err) {
            console.error('Error deleting app:', err);
            alert('Failed to delete application.');
        }
    };

    // Enterprise/Consumer filter logic (simple domain-based for demo; adjust as needed)
    const isEnterprise = (app) => {
        // Example: treat .com, .pro, .tech as enterprise, .org/.live/.lifestyle as consumer
        if (!app.domain) return false;
        return /\.(com|pro|tech)$/i.test(app.domain);
    };
    const isConsumer = (app) => {
        if (!app.domain) return false;
        return /\.(org|live|lifestyle)$/i.test(app.domain);
    };

    const filteredApps = apps.filter(app => {
        if (appTypeFilter === 'enterprise') return isEnterprise(app);
        if (appTypeFilter === 'consumer') return isConsumer(app);
        return true;
    });

    const sortedApps = [...filteredApps].sort((a, b) => {
        const aValue = a[sortConfig.key]?.toString().toLowerCase() || '';
        const bValue = b[sortConfig.key]?.toString().toLowerCase() || '';
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
    });

    // Pagination logic
    const totalPages = Math.ceil(sortedApps.length / pageSize);
    const pagedApps = sortedApps.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    // Reset to first page if filter/sort changes
    useEffect(() => {
        setCurrentPage(1);
    }, [appTypeFilter, sortConfig, apps]);

    return (
        <PageShell
            title="CMDB"
            subtitle="Configuration Management Database - Application Inventory"
            maxWidth="max-w-full"
            actions={
                <div className="flex items-center gap-3">
                    {/* Removed redundant Search Input */}


                    {/* 2. Filter Button */}
                    <Button variant="outline" className="gap-2 bg-card">
                        <Filter className="size-4" />
                        Filter
                    </Button>

                    {/* 3. Sort Dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="gap-2 bg-card">
                                <ArrowUpDown className="size-3.5" />
                                Sort
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Sort by</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => setSortConfig({ key: 'name', direction: 'asc' })}>
                                Name (A-Z)
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setSortConfig({ key: 'name', direction: 'desc' })}>
                                Name (Z-A)
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setSortConfig({ key: 'status', direction: 'asc' })}>
                                Status
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setSortConfig({ key: 'tier', direction: 'asc' })}>
                                Tier
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* 4. View Toggles */}
                    <div className="flex items-center gap-1 bg-card border border-input p-1 rounded-md h-10">
                         <Button 
                            variant={viewMode === 'list' ? 'secondary' : 'ghost'} 
                            size="icon" 
                            className="h-7 w-7"
                            onClick={() => setViewMode('list')}
                            title="List View"
                        >
                            <LayoutList className="size-4" />
                        </Button>
                        <Button 
                            variant={viewMode === 'card' ? 'secondary' : 'ghost'} 
                            size="icon" 
                            className="h-7 w-7"
                            onClick={() => setViewMode('card')}
                            title="Card View"
                        >
                            <LayoutGrid className="size-4" />
                        </Button>
                    </div>

                    {/* 4.5 Columns Toggle */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="gap-2 bg-card ml-1">
                                <LayoutList className="size-3.5" />
                                Columns
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuLabel>Toggle Columns</DropdownMenuLabel>
                            {Object.keys(visibleColumns).map(col => (
                                <DropdownMenuItem 
                                    key={col} 
                                    onSelect={(e) => {
                                        e.preventDefault();
                                        setVisibleColumns(prev => ({...prev, [col]: !prev[col]}));
                                    }}
                                >
                                    <div className="flex items-center gap-2">
                                        <div className={`w-4 h-4 rounded border flex items-center justify-center ${visibleColumns[col] ? 'bg-brand-blue border-brand-blue text-black' : 'border-slate-500'}`}>
                                            {visibleColumns[col] && <Check className="size-3" />}
                                        </div>
                                        {col.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                                    </div>
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* 5. Actions (CRUD for authenticated users, metadata sync for admin only) */}
                    {canManageCmdb && (
                        <div className="flex gap-2">
                            {isAdmin && (
                                <Button 
                                    variant="outline" 
                                    className="gap-2 bg-card text-muted-foreground hover:text-brand-blue"
                                    onClick={handleSyncMetadata}
                                    title="Sync local metadata to Supabase"
                                >
                                    <RefreshCw className="size-4" />
                                </Button>
                            )}

                            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                                <DialogTrigger asChild>
                                    <Button className="bg-brand-blue hover:bg-brand-blue/90 gap-2">
                                        <Plus className="size-4" />
                                        Add App
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="bg-slate-900 border-slate-800 text-white sm:max-w-2xl">
                                    <DialogHeader>
                                        <DialogTitle>Add New Application</DialogTitle>
                                    </DialogHeader>
                                    <form onSubmit={handleCreateApp} className="grid gap-4 py-4">
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="name" className="text-right">Name</Label>
                                        <Input 
                                            id="name" 
                                            value={newApp.name}
                                            onChange={(e) => setNewApp({...newApp, name: e.target.value})}
                                            className="col-span-3 bg-slate-950 border-slate-700" 
                                            required
                                        />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="domain" className="text-right">Domain</Label>
                                        <Input 
                                            id="domain" 
                                            value={newApp.domain}
                                            onChange={(e) => setNewApp({...newApp, domain: e.target.value})}
                                            className="col-span-3 bg-slate-950 border-slate-700" 
                                            required
                                        />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="hosting" className="text-right">Hosting</Label>
                                        <Input 
                                            id="hosting" 
                                            value={newApp.hosting}
                                            onChange={(e) => setNewApp({...newApp, hosting: e.target.value})}
                                            className="col-span-3 bg-slate-950 border-slate-700" 
                                        />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="repo" className="text-right">GitHub</Label>
                                        <Input 
                                            id="repo" 
                                            value={newApp.github_repo}
                                            onChange={(e) => setNewApp({...newApp, github_repo: e.target.value})}
                                            className="col-span-3 bg-slate-950 border-slate-700" 
                                        />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="status" className="text-right">Status</Label>
                                        <select 
                                            id="status"
                                            className="col-span-3 flex h-10 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 disabled:cursor-not-allowed disabled:opacity-50"
                                            value={newApp.status}
                                            onChange={(e) => setNewApp({...newApp, status: e.target.value})}
                                        >
                                            <option value="Active">Active</option>
                                            <option value="Development">Development</option>
                                            <option value="Maintenance">Maintenance</option>
                                            <option value="In Development">In Development</option>
                                        </select>
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="tier" className="text-right">Tier</Label>
                                        <select 
                                            id="tier"
                                            className="col-span-3 flex h-10 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 disabled:cursor-not-allowed disabled:opacity-50"
                                            value={newApp.tier}
                                            onChange={(e) => setNewApp({...newApp, tier: e.target.value})}
                                        >
                                            <option value="Production">Production</option>
                                            <option value="Staging">Staging</option>
                                        </select>
                                    </div>
                                    <Button type="submit" className="ml-auto bg-brand-blue hover:bg-brand-blue/90">
                                        Create App
                                    </Button>
                                </form>
                            </DialogContent>
                        </Dialog>
                        </div>
                    )}
                </div>
            }
        >

            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-2 mt-1">
                <div className="flex flex-col items-end gap-1">
                    <div className="flex gap-2">
                        <StatCard label="Total" value={apps.length} icon={Database} />
                        <StatCard label="Prod" value={apps.filter(a => a.tier === 'Production').length} icon={Globe} color="text-emerald-500" />
                        <StatCard label="Netlify" value={apps.filter(a => a.hosting === 'Netlify').length} icon={Cloud} color="text-blue-400" />
                        <StatCard label="Dev" value={apps.filter(a => a.tier !== 'Production').length} icon={Server} color="text-amber-500" />
                    </div>
                    <div className="mt-1">
                        <label className="text-xs text-muted-foreground mr-2">App Type:</label>
                        <select
                            className="rounded border border-border bg-card px-2 py-1 text-xs text-foreground focus:outline-none"
                            value={appTypeFilter}
                            onChange={e => setAppTypeFilter(e.target.value)}
                        >
                            <option value="all">All</option>
                            <option value="enterprise">Enterprise</option>
                            <option value="consumer">Consumer</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Main Content (Grid or Table) */}
            <div className="flex flex-col xl:flex-row gap-4 items-start h-full pb-4">
                <div
                    className={`flex-1 min-w-0 transition-all ${selectedApp ? 'hidden xl:block' : 'w-full'} w-full`}
                    style={{ maxWidth: selectedApp ? undefined : '100vw' }}
                >
                    <Card className="bg-transparent border-none shadow-none">
                        <CardContent className="p-0">
                    {viewMode === 'list' ? (
                        <div className="rounded-md border border-border overflow-x-auto bg-card">
                            <table className="w-full text-sm text-left min-w-150 md:min-w-0">
                                <thead className="bg-muted/50 text-muted-foreground font-medium uppercase text-xs">
                                    <tr>
                                        {visibleColumns.appName && <th className="px-4 py-3 whitespace-nowrap">App Name</th>}
                                        {visibleColumns.appId && <th className="px-4 py-3 whitespace-nowrap">App ID</th>}
                                        {visibleColumns.domain && <th className="px-4 py-3 whitespace-nowrap">Domain</th>}
                                        {visibleColumns.hosting && <th className="px-4 py-3 whitespace-nowrap">Hosting</th>}
                                        {visibleColumns.repo && <th className="px-4 py-3 whitespace-nowrap">Repo</th>}
                                        {visibleColumns.status && <th className="px-4 py-3 whitespace-nowrap">Status</th>}
                                        {visibleColumns.tier && <th className="px-4 py-3 whitespace-nowrap">Tier</th>}
                                        {visibleColumns.lastDeploy && <th className="px-4 py-3 whitespace-nowrap">Last Deploy</th>}
                                        {visibleColumns.buildStatus && <th className="px-4 py-3 whitespace-nowrap">Build Status</th>}
                                        {visibleColumns.siteId && <th className="px-4 py-3 whitespace-nowrap">Site ID</th>}
                                        {visibleColumns.supabaseEnv && <th className="px-4 py-3 whitespace-nowrap">Supabase DB</th>}
                                        <th className="px-4 py-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {loading ? (
                                        <tr>
                                            <td colSpan={7} className="text-center py-8 text-muted-foreground">
                                                <div className="flex items-center justify-center gap-2">
                                                    <Loader2 className="animate-spin size-4" />
                                                    Loading...
                                                </div>
                                            </td>
                                        </tr>
                                    ) : pagedApps.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="text-center py-8 text-muted-foreground">No applications found.</td>
                                        </tr>
                                    ) : (
                                        pagedApps.map((app) => (
                                            <tr key={app.id} onClick={() => handleSelectApp(app)} className={`hover:bg-muted/30 transition-colors group cursor-pointer ${selectedApp?.id === app.id ? "bg-brand-blue/5 border-l-2 border-l-brand-blue" : ""}`}>
                                                {visibleColumns.appName && (
                                                    <td className="px-4 py-3 font-medium text-foreground">
                                                        <div className="flex items-center gap-2">
                                                            <div className="size-8 rounded bg-brand-blue/10 flex items-center justify-center text-brand-blue border border-brand-blue/20 shrink-0">
                                                                {app.name.charAt(0)}
                                                            </div>
                                                            <div className="truncate min-w-0">{app.name}</div>
                                                        </div>
                                                    </td>
                                                )}
                                                {visibleColumns.appId && <td className="px-4 py-3 text-muted-foreground font-mono text-xs">{app.app_id}</td>}
                                                {visibleColumns.domain && (
                                                    <td className="px-4 py-3">
                                                        <a 
                                                            href={`https://${app.domain}`} 
                                                            target="_blank" 
                                                            rel="noopener noreferrer"
                                                            className="text-blue-400 hover:underline flex items-center gap-1 max-w-xs truncate"
                                                            onClick={(e) => e.stopPropagation()}
                                                        >
                                                            <span className="truncate">{app.domain}</span>
                                                            <ExternalLink className="size-3 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                                                        </a>
                                                    </td>
                                                )}
                                                {visibleColumns.hosting && (
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-1.5 whitespace-nowrap">
                                                            {app.hosting === 'Netlify' ? <Cloud className="size-3 text-teal-400" /> : <Server className="size-3 text-slate-400" />}
                                                            {app.hosting}
                                                        </div>
                                                    </td>
                                                )}
                                                {visibleColumns.repo && (
                                                    <td className="px-4 py-3 text-muted-foreground">
                                                        <div className="flex items-center gap-1 max-w-xs truncate">
                                                            <Github className="size-3 shrink-0" />
                                                            <span className="truncate">{app.github_repo}</span>
                                                        </div>
                                                    </td>
                                                )}
                                                {visibleColumns.status && (
                                                    <td className="px-4 py-3">
                                                        <Badge variant={app.status === 'Active' ? 'success' : 'secondary'} className={`whitespace-nowrap ${
                                                            app.status === 'Active' ? 'bg-emerald-500/15 text-emerald-500 hover:bg-emerald-500/25 border-emerald-500/20' : 
                                                            app.status === 'Development' ? 'bg-amber-500/15 text-amber-500 hover:bg-amber-500/25 border-amber-500/20' : ''
                                                        }`}>
                                                            {app.status}
                                                        </Badge>
                                                    </td>
                                                )}
                                                {visibleColumns.tier && (
                                                    <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">
                                                        {app.tier || '-'}
                                                    </td>
                                                )}
                                                {visibleColumns.lastDeploy && (
                                                    <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">
                                                        {app.lastDeploy ? new Date(app.lastDeploy).toLocaleString() : '-'}
                                                    </td>
                                                )}
                                                {visibleColumns.buildStatus && (
                                                    <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">
                                                        {app.buildStatus || '-'}
                                                    </td>
                                                )}
                                                {visibleColumns.siteId && (
                                                    <td className="px-4 py-3 text-muted-foreground font-mono text-xs max-w-xs truncate">
                                                        {app.siteId || '-'}
                                                    </td>
                                                )}
                                                {visibleColumns.supabaseEnv && (
                                                    <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">
                                                        {app.supabase_env ? app.supabase_env.charAt(0).toUpperCase() + app.supabase_env.slice(1) : '-'}
                                                    </td>
                                                )}
                                                <td className="px-4 py-3 text-right">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                            <DropdownMenuItem onClick={() => handleSelectApp(app)}>View Details</DropdownMenuItem>
                                                            {canManageCmdb && (
                                                                <>
                                                                    <DropdownMenuItem onClick={() => handleSelectApp(app)}>Edit Configuration</DropdownMenuItem>
                                                                    <DropdownMenuItem 
                                                                        className="text-red-500 focus:text-red-500 focus:bg-red-500/10"
                                                                        onClick={() => handleDeleteApp(app.id)}
                                                                    >
                                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                                        Delete
                                                                    </DropdownMenuItem>
                                                                </>
                                                            )}
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 md:gap-6">
                            {loading ? (
                                <div className="col-span-full flex items-center justify-center p-12 text-muted-foreground">
                                    <Loader2 className="animate-spin size-6 mr-2" />
                                    Loading apps...
                                </div>
                            ) : pagedApps.length === 0 ? (
                                <div className="col-span-full text-center p-12 text-muted-foreground border border-dashed border-border rounded-lg">
                                    No applications match your search.
                                </div>
                            ) : (
                                pagedApps.map((app) => (
                                    <div
                                        key={app.id}
                                        className={`group relative bg-card border ${selectedApp?.id === app.id ? 'border-brand-blue ring-1 ring-brand-blue' : 'border-border'} rounded-xl p-4 md:p-5 hover:shadow-lg hover:border-brand-blue/30 transition-all duration-300 flex flex-col h-full cursor-pointer`}
                                        onClick={() => handleSelectApp(app)}
                                        style={{ minWidth: 0 }}
                                    >
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="size-12 md:size-16 rounded-lg bg-slate-100 dark:bg-slate-800 border border-border shadow-sm relative overflow-hidden shrink-0 group-hover:border-brand-blue/50 transition-colors">
                                                    {app.screenshot ? (
                                                        <img 
                                                            src={app.screenshot} 
                                                            alt={`${app.name} thumbnail`} 
                                                            className="w-full h-full object-cover object-top hover:scale-110 transition-transform duration-500"
                                                            onError={(e) => {
                                                                e.currentTarget.style.display = 'none';
                                                                e.currentTarget.nextSibling.style.display = 'flex';
                                                            }}
                                                        />
                                                    ) : null}
                                                    <div className="absolute inset-0 flex items-center justify-center bg-slate-100 dark:bg-slate-800" style={{ display: app.screenshot ? 'none' : 'flex' }}>
                                                        <span className="font-bold text-lg text-slate-400">{app.name.charAt(0)}</span>
                                                    </div>
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-foreground group-hover:text-brand-blue transition-colors flex items-center gap-2 text-base md:text-lg">
                                                        {app.name}
                                                        {app.buildStatus && (
                                                            <div className="size-2 rounded-full bg-emerald-500 animate-pulse" title={`Build Status: ${app.buildStatus}`} />
                                                        )}
                                                    </h3>
                                                    <div className="flex items-center gap-2 mt-0.5 text-xs md:text-sm">
                                                        <div className="text-xs text-muted-foreground font-mono bg-muted/50 px-1.5 py-0.5 rounded w-fit">
                                                            {app.app_id}
                                                        </div>
                                                        {app.lastDeploy && (
                                                            <span className="text-[10px] text-muted-foreground">
                                                                Deployed: {new Date(app.lastDeploy).toLocaleDateString()}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleSelectApp(app); }}>View Details</DropdownMenuItem>
                                                    {app.adminUrl && (
                                                        <DropdownMenuItem asChild>
                                                            <a href={app.adminUrl} target="_blank" rel="noopener noreferrer" className="flex items-center">
                                                                <ExternalLink className="mr-2 h-4 w-4" />
                                                                Manage on Netlify
                                                            </a>
                                                        </DropdownMenuItem>
                                                    )}
                                                    {canManageCmdb && (
                                                        <DropdownMenuItem 
                                                            className="text-red-500 focus:text-red-500 focus:bg-red-500/10"
                                                            onClick={() => handleDeleteApp(app.id)}
                                                        >
                                                            Delete
                                                        </DropdownMenuItem>
                                                    )}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>

                                        <div className="space-y-2 md:space-y-3 mb-4 md:mb-6 flex-1">
                                            <div className="flex items-center justify-between text-xs md:text-sm">
                                                <span className="text-muted-foreground flex items-center gap-2">
                                                    <Globe className="size-3.5" /> Domain
                                                </span>
                                                <a href={`https://${app.domain}`} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline truncate max-w-xs">
                                                    {app.domain}
                                                </a>
                                            </div>
                                            <div className="flex items-center justify-between text-xs md:text-sm">
                                                <span className="text-muted-foreground flex items-center gap-2">
                                                    {app.hosting === 'Netlify' ? <Cloud className="size-3.5 text-teal-400" /> : <Server className="size-3.5" />} Hosting
                                                </span>
                                                <span className="text-foreground">{app.hosting}</span>
                                            </div>
                                             <div className="flex items-center justify-between text-xs md:text-sm">
                                                <span className="text-muted-foreground flex items-center gap-2">
                                                    <Github className="size-3.5" /> Repo
                                                </span>
                                                {app.repoUrl ? (
                                                    <a href={app.repoUrl} target="_blank" rel="noopener noreferrer" className="text-xs hover:underline text-foreground truncate max-w-xs">
                                                        {app.repoUrl.replace('https://github.com/', '')}
                                                    </a>
                                                ) : (
                                                    <span className="text-foreground text-xs truncate max-w-xs">{app.github_repo || '-'}</span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between pt-3 md:pt-4 border-t border-border/50">
                                            <Badge variant="outline" className={
                                                app.status === 'Active' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 
                                                'bg-amber-500/10 text-amber-500 border-amber-500/20'
                                            }>
                                                <div className={`size-1.5 rounded-full mr-1.5 ${app.status === 'Active' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                                                {app.status}
                                            </Badge>
                                            
                                                <span className="text-xs text-muted-foreground bg-secondary/50 px-2 py-1 rounded">
                                                    {app.tier}
                                                </span>
                                                <span className="ml-2 text-xs text-blue-500 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded border border-blue-200 dark:border-blue-800" title="Supabase DB">
                                                    {app.supabase_env ? app.supabase_env.charAt(0).toUpperCase() + app.supabase_env.slice(1) : '-'}
                                                </span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        {/* Pagination Controls */}
        <div className="flex justify-center items-center gap-2 mt-6">
            <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
            >
                Prev
            </Button>
            {Array.from({ length: totalPages }, (_, i) => (
                <Button
                    key={i + 1}
                    variant={currentPage === i + 1 ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => setCurrentPage(i + 1)}
                >
                    {i + 1}
                </Button>
            ))}
            <Button
                variant="outline"
                size="sm"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
            >
                Next
            </Button>
        </div>
        </div>

        {/* Right Panel Detail Editor */}
        {selectedApp && editForm && (
            <div
                className="w-full sm:w-[90vw] md:w-100 bg-card border border-border shadow-md rounded-xl p-4 md:p-5 flex flex-col gap-4 shrink-0 overflow-y-auto max-h-[85vh] fixed xl:sticky top-0 left-0 right-0 mx-auto xl:top-4 xl:left-auto xl:right-auto z-30"
                style={{ maxWidth: '100vw' }}
            >
                <div className="flex items-center justify-between border-b border-border pb-2 md:pb-3">
                    <h3 className="font-bold text-lg text-foreground truncate pl-1">Edit {selectedApp?.name}</h3>
                    <Button variant="ghost" size="icon" onClick={handleClosePanel} className="h-8 w-8 text-muted-foreground hover:text-white shrink-0">
                        <X className="size-4" />
                    </Button>
                </div>
                
                <div className="space-y-3 md:space-y-4 flex-1">
                    <div>
                        <Label className="text-xs text-muted-foreground font-semibold">App Name</Label>
                        <Input value={editForm.name || ''} onChange={(e) => setEditForm({...editForm, name: e.target.value})} className="mt-1 bg-background" />
                    </div>
                    <div>
                        <Label className="text-xs text-muted-foreground font-semibold">App ID</Label>
                        <Input value={editForm.app_id || ''} onChange={(e) => setEditForm({...editForm, app_id: e.target.value})} className="mt-1 bg-background" />
                    </div>
                    <div>
                        <Label className="text-xs text-muted-foreground font-semibold">Domain / Namespace</Label>
                        <Input value={editForm.domain || ''} onChange={(e) => setEditForm({...editForm, domain: e.target.value})} className="mt-1 bg-background" />
                    </div>
                    <div>
                        <Label className="text-xs text-muted-foreground font-semibold">Hosting Provider</Label>
                        <Input value={editForm.hosting || ''} onChange={(e) => setEditForm({...editForm, hosting: e.target.value})} className="mt-1 bg-background" />
                    </div>
                    <div>
                        <Label className="text-xs text-muted-foreground font-semibold">Source Repository</Label>
                        <Input value={editForm.github_repo || ''} onChange={(e) => setEditForm({...editForm, github_repo: e.target.value})} className="mt-1 bg-background" />
                    </div>
                    <div>
                        <Label className="text-xs text-muted-foreground font-semibold">Operational Status</Label>
                        <select 
                            className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
                            value={editForm.status || ''}
                            onChange={(e) => setEditForm({...editForm, status: e.target.value})}
                        >
                            <option value="Active">Active</option>
                            <option value="Development">Development</option>
                            <option value="Maintenance">Maintenance</option>
                            <option value="In Development">In Development</option>
                        </select>
                    </div>
                    <div>
                        <Label className="text-xs text-muted-foreground font-semibold">Service Tier</Label>
                        <select 
                            className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
                            value={editForm.tier || ''}
                            onChange={(e) => setEditForm({...editForm, tier: e.target.value})}
                        >
                            <option value="Production">Production</option>
                            <option value="Staging">Staging</option>
                            <option value="Development">Development</option>
                        </select>
                    </div>
                    
                    {/* Read Only Meta */}
                    {(editForm.siteId || editForm.buildStatus || editForm.lastDeploy) && (
                        <div className="bg-muted/30 border border-border/50 p-3 rounded-lg mt-4 space-y-2">
                            <div className="text-xs text-muted-foreground uppercase font-bold flex items-center gap-1.5 pb-1"><Globe className="size-3" /> External Agent Metadata</div>
                            {editForm.siteId && <div className="text-sm"><span className="text-muted-foreground">Origin ID:</span> <span className="font-mono text-xs text-foreground bg-black/20 px-1 rounded ml-1">{editForm.siteId}</span></div>}
                            {editForm.buildStatus && <div className="text-sm flex items-center gap-1.5"><span className="text-muted-foreground">Build Pipeline:</span> <Badge variant="secondary" className="bg-black/30 text-xs px-1.5 py-0 font-mono text-emerald-400 border-none">{editForm.buildStatus}</Badge></div>}
                            {editForm.lastDeploy && <div className="text-sm"><span className="text-muted-foreground">Last Telemetry:</span> <span className="text-foreground ml-1">{new Date(editForm.lastDeploy).toLocaleString()}</span></div>}
                        </div>
                    )}
                </div>

                <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2 md:gap-3 pt-3 md:pt-4 mt-3 md:mt-4 border-t border-border bg-card py-2">
                    {canManageCmdb && selectedApp?.id && (
                        <Button
                            variant="destructive"
                            className="flex-1 gap-2"
                            onClick={() => handleDeleteApp(selectedApp.id)}
                            disabled={isSaving}
                        >
                            <Trash2 className="size-4" />
                            Delete App
                        </Button>
                    )}
                    <Button variant="outline" className="flex-1" onClick={handleClosePanel}>Discard</Button>
                    <Button className="flex-1 bg-brand-blue hover:bg-brand-blue/90 text-black font-bold gap-2" onClick={handleSaveApp} disabled={isSaving}>
                        {isSaving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                        Commit Change
                    </Button>
                </div>
            </div>
        )}
    </div>
</PageShell>
    );
};

const StatCard = ({ label, value, icon, color = "text-brand-blue" }) => {
    const Icon = icon;
    return (
        <div className="flex items-center gap-3 px-3 py-1.5 rounded-lg bg-card/40 border border-border/50 hover:bg-card hover:border-border transition-colors group min-w-fit">
            <div className={`p-1 rounded-md bg-secondary/30 ${color} group-hover:bg-secondary/50 transition-colors`}>
                <Icon className="size-3.5" />
            </div>
            <div className="flex items-baseline gap-2">
                <span className="text-sm font-bold text-foreground">{value}</span>
                <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">{label}</span>
            </div>
        </div>
    );
};

export default CmdbDashboard;
