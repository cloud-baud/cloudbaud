import React, { useState, useEffect } from 'react';
import PageShell from '@/collaboration/PageShell';
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
    ArrowUpDown
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

const CmdbDashboard = () => {
    const { user } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState('card'); // Default to Card view for visual appeal
    const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });
    const [apps, setApps] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    
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

    useEffect(() => {
        fetchApps();
    }, []);

    const fetchApps = async () => {
        try {
            setLoading(true);
            const data = await CmdbService.getApps();
            setApps(data || []);
        } catch (err) {
            console.error('Error fetching apps:', err);
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

    const filteredApps = apps.filter(app => 
        app.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (app.domain && app.domain.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const sortedApps = [...filteredApps].sort((a, b) => {
        const aValue = a[sortConfig.key]?.toString().toLowerCase() || '';
        const bValue = b[sortConfig.key]?.toString().toLowerCase() || '';
        
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
    });

    return (
        <PageShell
            title="CMDB"
            subtitle="Configuration Management Database - Application Inventory"
            maxWidth="max-w-full"
            actions={
                <div className="flex items-center gap-3">


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

                    {/* 5. Add Button (Admin Only) */}
                    {isAdmin && (
                        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                            <DialogTrigger asChild>
                                <Button className="bg-brand-blue hover:bg-brand-blue/90 gap-2">
                                    <Plus className="size-4" />
                                    Add App
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="bg-slate-900 border-slate-800 text-white sm:max-w-[425px]">
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
                    )}
                </div>
            }
        >
            {/* Stats Overview - Single Line Compact Bar */}
            <div className="flex items-center gap-4 mb-4 overflow-x-auto pb-1 scrollbar-hide">
                <StatCard label="Total Apps" value={apps.length} icon={Database} />
                <div className="h-6 w-px bg-border/60 shrink-0 hidden md:block" />
                <StatCard label="Production" value={apps.filter(a => a.tier === 'Production').length} icon={Globe} color="text-emerald-500" />
                <div className="h-6 w-px bg-border/60 shrink-0 hidden md:block" />
                <StatCard label="Netlify" value={apps.filter(a => a.hosting === 'Netlify').length} icon={Cloud} color="text-blue-400" />
                <div className="h-6 w-px bg-border/60 shrink-0 hidden md:block" />
                <StatCard label="Dev" value={apps.filter(a => a.tier !== 'Production').length} icon={Server} color="text-amber-500" />
            </div>

            {/* Main Content (Grid or Table) */}
            <Card className="bg-transparent border-none shadow-none">
                <CardContent className="p-0">
                    {viewMode === 'list' ? (
                        <div className="rounded-md border border-border overflow-hidden bg-card">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-muted/50 text-muted-foreground font-medium uppercase text-xs">
                                    <tr>
                                        <th className="px-4 py-3">App Name</th>
                                        <th className="px-4 py-3">App ID</th>
                                        <th className="px-4 py-3">Domain</th>
                                        <th className="px-4 py-3">Hosting</th>
                                        <th className="px-4 py-3">Repo</th>
                                        <th className="px-4 py-3">Status</th>
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
                                    ) : sortedApps.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="text-center py-8 text-muted-foreground">No applications found.</td>
                                        </tr>
                                    ) : (
                                        sortedApps.map((app) => (
                                            <tr key={app.id} className="hover:bg-muted/30 transition-colors group">
                                                <td className="px-4 py-3 font-medium text-foreground flex items-center gap-2">
                                                    <div className="size-8 rounded bg-brand-blue/10 flex items-center justify-center text-brand-blue border border-brand-blue/20">
                                                        {app.name.charAt(0)}
                                                    </div>
                                                    {app.name}
                                                </td>
                                                <td className="px-4 py-3 text-muted-foreground font-mono text-xs">{app.app_id}</td>
                                                <td className="px-4 py-3">
                                                    <a 
                                                        href={`https://${app.domain}`} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        className="text-blue-400 hover:underline flex items-center gap-1"
                                                    >
                                                        {app.domain}
                                                        <ExternalLink className="size-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                    </a>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-1.5">
                                                        {app.hosting === 'Netlify' ? <Cloud className="size-3 text-teal-400" /> : <Server className="size-3 text-slate-400" />}
                                                        {app.hosting}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-muted-foreground flex items-center gap-1">
                                                    <Github className="size-3" />
                                                    {app.github_repo}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <Badge variant={app.status === 'Active' ? 'success' : 'secondary'} className={
                                                        app.status === 'Active' ? 'bg-emerald-500/15 text-emerald-500 hover:bg-emerald-500/25 border-emerald-500/20' : 
                                                        app.status === 'Development' ? 'bg-amber-500/15 text-amber-500 hover:bg-amber-500/25 border-amber-500/20' : ''
                                                    }>
                                                        {app.status}
                                                    </Badge>
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                            <DropdownMenuItem>View Details</DropdownMenuItem>
                                                            {isAdmin && (
                                                                <>
                                                                    <DropdownMenuItem>Edit Configuration</DropdownMenuItem>
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
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                            {loading ? (
                                <div className="col-span-full flex items-center justify-center p-12 text-muted-foreground">
                                    <Loader2 className="animate-spin size-6 mr-2" />
                                    Loading apps...
                                </div>
                            ) : sortedApps.length === 0 ? (
                                <div className="col-span-full text-center p-12 text-muted-foreground border border-dashed border-border rounded-lg">
                                    No applications match your search.
                                </div>
                            ) : (
                                sortedApps.map((app) => (
                                    <div key={app.id} className="group relative bg-card border border-border rounded-xl p-5 hover:shadow-lg hover:border-brand-blue/30 transition-all duration-300 flex flex-col h-full">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="size-10 rounded-lg bg-gradient-to-br from-brand-blue/10 to-purple-500/10 flex items-center justify-center text-brand-blue border border-brand-blue/20 shadow-sm">
                                                    {app.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-foreground group-hover:text-brand-blue transition-colors">{app.name}</h3>
                                                    <div className="text-xs text-muted-foreground font-mono bg-muted/50 px-1.5 py-0.5 rounded w-fit mt-0.5">
                                                        {app.app_id}
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
                                                    <DropdownMenuItem>View Details</DropdownMenuItem>
                                                    {isAdmin && (
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

                                        <div className="space-y-3 mb-6 flex-1">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-muted-foreground flex items-center gap-2">
                                                    <Globe className="size-3.5" /> Domain
                                                </span>
                                                <a href={`https://${app.domain}`} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline truncate max-w-[150px]">
                                                    {app.domain}
                                                </a>
                                            </div>
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-muted-foreground flex items-center gap-2">
                                                    {app.hosting === 'Netlify' ? <Cloud className="size-3.5" /> : <Server className="size-3.5" />} Hosting
                                                </span>
                                                <span className="text-foreground">{app.hosting}</span>
                                            </div>
                                             <div className="flex items-center justify-between text-sm">
                                                <span className="text-muted-foreground flex items-center gap-2">
                                                    <Github className="size-3.5" /> Repo
                                                </span>
                                                <span className="text-foreground truncate max-w-[150px]">{app.github_repo || '-'}</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between pt-4 border-t border-border/50">
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
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </PageShell>
    );
};

const StatCard = ({ label, value, icon: LucideIcon, color = "text-brand-blue" }) => (
    <div className="flex items-center gap-3 px-3 py-1.5 rounded-lg bg-card/40 border border-border/50 hover:bg-card hover:border-border transition-colors group min-w-fit">
        <div className={`p-1 rounded-md bg-secondary/30 ${color} group-hover:bg-secondary/50 transition-colors`}>
            <LucideIcon className="size-3.5" />
        </div>
        <div className="flex items-baseline gap-2">
            <span className="text-sm font-bold text-foreground">{value}</span>
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">{label}</span>
        </div>
    </div>
);

export default CmdbDashboard;
