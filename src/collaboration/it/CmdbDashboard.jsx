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
    Trash2
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

    return (
        <PageShell
            title="CMDB"
            subtitle="Configuration Management Database - Application Inventory"
            actions={
                <div className="flex gap-2">
                    <Button variant="outline" className="gap-2">
                        <Filter className="size-4" />
                        Filter
                    </Button>
                    
                    {isAdmin && (
                        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                            <DialogTrigger asChild>
                                <Button className="bg-brand-blue hover:bg-brand-blue/90 gap-2">
                                    <Plus className="size-4" />
                                    Add Application
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
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <StatCard label="Total Applications" value={apps.length} icon={Database} />
                <StatCard label="Production" value={apps.filter(a => a.tier === 'Production').length} icon={Globe} color="text-emerald-500" />
                <StatCard label="Netlify Hosted" value={apps.filter(a => a.hosting === 'Netlify').length} icon={Cloud} color="text-blue-400" />
                <StatCard label="Development" value={apps.filter(a => a.tier !== 'Production').length} icon={Server} color="text-amber-500" />
            </div>

            {/* Main Table Card */}
            <Card className="bg-card border-border">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-lg font-medium">Application Registry</CardTitle>
                    <div className="relative w-64">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search apps or domains..."
                            className="pl-9 bg-secondary/50 border-border"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border border-border overflow-hidden">
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
                                ) : filteredApps.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="text-center py-8 text-muted-foreground">No applications found.</td>
                                    </tr>
                                ) : (
                                    filteredApps.map((app) => (
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
                </CardContent>
            </Card>
        </PageShell>
    );
};

const StatCard = ({ label, value, icon: LucideIcon, color = "text-brand-blue" }) => (
    <Card className="bg-card border-border">
        <CardContent className="p-6 flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-muted-foreground">{label}</p>
                <h3 className="text-2xl font-bold mt-1 text-foreground">{value}</h3>
            </div>
            <div className={`p-3 rounded-full bg-secondary/50 ${color}`}>
                <LucideIcon className="size-5" />
            </div>
        </CardContent>
    </Card>
);

export default CmdbDashboard;
