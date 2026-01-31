import React, { useState } from 'react';
import { User, Bell, Shield, Palette, Globe, Layers, Users as UsersIcon, LayoutGrid, PaintBucket, Lock, ChevronRight, ChevronDown, Check, Plus, MoveVertical, Puzzle, ZoomIn, X, Trash2, Pencil } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from '@/context/AuthContext';
import { useMsal } from "@azure/msal-react";
import { loginRequest } from "@/lib/authConfig";
import { graphService } from "@/services/graphService";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { AUTH_CONFIG_CHANGE_EVENT } from '@/components/DynamicMsalProvider';
import { supabase } from "@/lib/supabase";

const collections = [
    { id: 'consulting', name: 'Consulting', type: 'collection', description: 'Client deliverables, engagement letters, and strategy documents.' },
    { id: 'real-estate', name: 'Real Estate', type: 'collection', description: 'Property assets, acquisition pipelines, and portfolio management.' },
    { id: 'lifestyle', name: 'Lifestyle', type: 'collection', description: 'Personal branding, travel logs, and wellness tracking.' },
    { id: 'marketing', name: 'Marketing', type: 'collection', description: 'Campaign assets, SEO data, and social media calendars.' }
];

const SettingsPage = () => {
    const { user } = useAuth();
    const { instance, accounts } = useMsal();
    const [graphData, setGraphData] = useState(null);
    const [activeTab, setActiveTab] = useState('general');
    const [currentCollection, setCurrentCollection] = useState(collections[0]);
    const [expandedImage, setExpandedImage] = useState(null);

    // Integrations State (Moved to top level)
    const [clientId, setClientId] = useState(localStorage.getItem('azure_client_id') || '');
    const [isEditingConfig, setIsEditingConfig] = useState(!localStorage.getItem('azure_client_id') && !import.meta.env.VITE_AZURE_CLIENT_ID);

    const saveConfiguration = () => {
        localStorage.setItem('azure_client_id', clientId);
        window.dispatchEvent(new CustomEvent(AUTH_CONFIG_CHANGE_EVENT));
        setIsEditingConfig(false);
    };

    const clearConfiguration = () => {
        localStorage.removeItem('azure_client_id');
        setClientId('');
        window.dispatchEvent(new CustomEvent(AUTH_CONFIG_CHANGE_EVENT));
        setIsEditingConfig(false);
    };

    const handleConnectMicrosoft = async () => {
        try {
            await instance.loginPopup(loginRequest);
            // After login, try to fetch profile immediately
            const profile = await graphService.getProfile();
            setGraphData(profile);
        } catch (e) {
            console.error("Microsoft Login Failed", e);
        }
    };

    const handleTestGraph = async () => {
        try {
            const profile = await graphService.getProfile();
            setGraphData(profile);
        } catch (e) {
            console.error("Graph Test Failed", e);
            setGraphData({ error: e.message });
        }
    };

    // Navigation Customization State
    const [navItems, setNavItems] = useState(() => {
        // Priority: Local Storage -> Default
        // We sync with Supabase in useEffect once user is loaded
        const saved = localStorage.getItem('portal_nav_active');
        return saved ? JSON.parse(saved) : [
            { id: '1', label: 'Home', href: '/sites/consulting' },
            { id: '2', label: 'Documents', href: '/sites/consulting/docs' },
            { id: '3', label: 'Team', href: '/sites/consulting/team' }
        ];
    });

    const [availableLinks, setAvailableLinks] = useState(() => {
        const saved = localStorage.getItem('portal_nav_available');
        return saved ? JSON.parse(saved) : [
            { id: '4', label: 'Analytics', href: '/sites/analytics' },
            { id: '5', label: 'Sales', href: '/sites/sales' },
            { id: '6', label: 'OneDrive', href: '/onedrive' },
            { id: '7', label: 'Outlook', href: '/outlook' }
        ];
    });

    // Hydrate from Supabase when user loads
    React.useEffect(() => {
        if (user?.user_metadata?.portal_nav_active) {
            const cloudItems = user.user_metadata.portal_nav_active;
            // Only update if different to avoid constant re-renders/loops
            if (JSON.stringify(cloudItems) !== JSON.stringify(navItems)) {
                console.log("Syncing active nav from cloud profile");
                setNavItems(cloudItems);
            }
        }
        if (user?.user_metadata?.portal_nav_available) {
            const cloudAvailable = user.user_metadata.portal_nav_available;
            if (JSON.stringify(cloudAvailable) !== JSON.stringify(availableLinks)) {
                console.log("Syncing available nav from cloud profile");
                setAvailableLinks(cloudAvailable);
            }
        }
    }, [user?.id]); // Only run when user ID changes (login/load)

    // Persist navigation changes to LocalStorage AND Supabase
    React.useEffect(() => {
        localStorage.setItem('portal_nav_active', JSON.stringify(navItems));
        window.dispatchEvent(new CustomEvent('portal-nav-update'));

        // Sync to Supabase if user is logged in
        if (user) {
            // Check if update is needed to avoid loop
            if (JSON.stringify(user.user_metadata?.portal_nav_active) !== JSON.stringify(navItems)) {
                const debounceTimer = setTimeout(() => {
                    supabase.auth.updateUser({
                        data: { portal_nav_active: navItems }
                    }).catch(err => console.error("Failed to sync nav to cloud:", err));
                }, 1000); // 1s debounce
                return () => clearTimeout(debounceTimer);
            }
        }
    }, [navItems, user]);

    React.useEffect(() => {
        localStorage.setItem('portal_nav_available', JSON.stringify(availableLinks));

        // Sync to Supabase if user is logged in
        if (user) {
            if (JSON.stringify(user.user_metadata?.portal_nav_available) !== JSON.stringify(availableLinks)) {
                const debounceTimer = setTimeout(() => {
                    supabase.auth.updateUser({
                        data: { portal_nav_available: availableLinks }
                    }).catch(err => console.error("Failed to sync available nav to cloud:", err));
                }, 1000);
                return () => clearTimeout(debounceTimer);
            }
        }
    }, [availableLinks, user]);

    const moveItem = (item, direction) => {
        if (direction === 'add') {
            setNavItems([...navItems, item]);
            setAvailableLinks(availableLinks.filter(i => i.id !== item.id));
        } else {
            setAvailableLinks([...availableLinks, item]);
            setNavItems(navItems.filter(i => i.id !== item.id));
        }
    };

    // Custom Link Management
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingLink, setEditingLink] = useState(null); // { id, label, href } or null for new
    const [tempLabel, setTempLabel] = useState('');
    const [tempHref, setTempHref] = useState('');

    const openAddDialog = () => {
        setEditingLink(null);
        setTempLabel('');
        setTempHref('');
        setIsDialogOpen(true);
    };

    const openEditDialog = (link) => {
        setEditingLink(link);
        setTempLabel(link.label);
        setTempHref(link.href);
        setIsDialogOpen(true);
    };

    const handleSaveLink = () => {
        if (!tempLabel || !tempHref) return;

        if (editingLink) {
            // Edit existing
            const updateList = (list) => list.map(item => item.id === editingLink.id ? { ...item, label: tempLabel, href: tempHref } : item);
            setNavItems(updateList(navItems));
            setAvailableLinks(updateList(availableLinks));
        } else {
            // Add new
            const newLink = {
                id: crypto.randomUUID(),
                label: tempLabel,
                href: tempHref
            };
            setAvailableLinks([...availableLinks, newLink]);
        }
        setIsDialogOpen(false);
    };

    const handleDeleteLink = (id) => {
        setNavItems(navItems.filter(i => i.id !== id));
        setAvailableLinks(availableLinks.filter(i => i.id !== id));
    };

    // Mock data based on collection context
    const getContextData = (collectionId) => {
        if (collectionId === 'consulting') {
            return {
                owners: 2,
                members: 14,
                visitors: 'Enabled',
                theme: 'Enterprise Light'
            };
        }
        if (collectionId === 'real-estate') {
            return {
                owners: 1,
                members: 4,
                visitors: 'Disabled',
                theme: 'Dark Nebula'
            };
        }
        return { owners: 1, members: 1, visitors: 'Disabled', theme: 'Standard' };
    };

    const ctxData = getContextData(currentCollection.id);

    const renderContent = () => {
        switch (activeTab) {
            case 'general':
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        {/* Hub Inheritance Indicator */}
                        <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 p-4 rounded-lg flex items-start gap-3 mb-6">
                            <Layers className="size-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                            <div>
                                <h4 className="font-medium text-blue-900 dark:text-blue-100">Hub Association: CloudBaud Enterprise</h4>
                                <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                                    The <strong>{currentCollection.name}</strong> collection inherits navigation, theme, and compliance policies from the CloudBaud Hub.
                                </p>
                            </div>
                        </div>

                        <Card>
                            <CardHeader>
                                <CardTitle>Site Information</CardTitle>
                                <CardDescription>Manage attributes for the <strong>{currentCollection.name}</strong> site collection.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-2">
                                    <label className="text-sm font-medium">Site Name</label>
                                    <input
                                        type="text"
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus:ring-2 focus:ring-primary"
                                        value={currentCollection.name}
                                        readOnly
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <label className="text-sm font-medium">Description</label>
                                    <textarea
                                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus:ring-2 focus:ring-primary"
                                        value={currentCollection.description}
                                        readOnly
                                    />
                                </div>
                                <div className="flex items-center justify-between pt-2">
                                    <div>
                                        <div className="font-medium text-sm">Web Address</div>
                                        <div className="text-xs text-muted-foreground font-mono">https://cloudbaud.com/sites/{currentCollection.id}</div>
                                    </div>
                                    <Button variant="outline" size="sm">Edit</Button>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Regional Settings</CardTitle>
                                <CardDescription>Locale and time zone defaults for this workspace.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <label className="text-sm font-medium">Language</label>
                                        <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                                            <option>English (United States)</option>
                                            <option>Spanish (Mexico)</option>
                                        </select>
                                    </div>
                                    <div className="grid gap-2">
                                        <label className="text-sm font-medium">Time Zone</label>
                                        <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                                            <option>(UTC-08:00) Pacific Time (US & Canada)</option>
                                            <option>(UTC-05:00) Eastern Time (US & Canada)</option>
                                        </select>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                );
            case 'permissions':
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <Card>
                            <CardHeader>
                                <CardTitle>Site Permissions ({currentCollection.name})</CardTitle>
                                <CardDescription>Manage who can access this specific collection. These rules apply to your business associates.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full">
                                            <UsersIcon className="size-5 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <div>
                                            <div className="font-medium">{currentCollection.name} Owners</div>
                                            <div className="text-xs text-muted-foreground">Full Control - Manage Settings & Access</div>
                                        </div>
                                    </div>
                                    <div className="text-sm text-slate-500">{ctxData.owners} Users</div>
                                </div>
                                <Separator />
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-emerald-100 dark:bg-emerald-900/30 p-2 rounded-full">
                                            <UsersIcon className="size-5 text-emerald-600 dark:text-emerald-400" />
                                        </div>
                                        <div>
                                            <div className="font-medium">{currentCollection.name} Members</div>
                                            <div className="text-xs text-muted-foreground">Edit - Add & Edit Documents</div>
                                        </div>
                                    </div>
                                    <div className="text-sm text-slate-500">{ctxData.members} Associates</div>
                                </div>
                                {ctxData.visitors !== 'Disabled' && (
                                    <>
                                        <Separator />
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded-full">
                                                    <UsersIcon className="size-5 text-slate-600" />
                                                </div>
                                                <div>
                                                    <div className="font-medium">{currentCollection.name} Visitors</div>
                                                    <div className="text-xs text-muted-foreground">Read Only - View Documents</div>
                                                </div>
                                            </div>
                                            <div className="text-sm text-slate-500">External Sharing Enabled</div>
                                        </div>
                                    </>
                                )}
                                <div className="pt-4">
                                    <Button className="w-full sm:w-auto">Invite Associates to {currentCollection.name}</Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                );
            case 'appearance':
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <Card>
                            <CardHeader>
                                <CardTitle>Change the Look ({currentCollection.name})</CardTitle>
                                <CardDescription>Customize how this specific collection appears to you and your teams.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div>
                                    <label className="text-sm font-medium mb-3 block">Theme Selection</label>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className={`border-2 ${ctxData.theme === 'Dark Nebula' ? 'border-primary' : 'border-transparent'} rounded-lg p-1 cursor-pointer`}>
                                            <div className="h-20 bg-slate-950 rounded-md flex items-center justify-center relative overflow-hidden">
                                                <div className="absolute top-0 left-0 w-full h-2 bg-brand-blue"></div>
                                                <span className="text-xs text-white">Dark Nebula</span>
                                            </div>
                                        </div>
                                        <div className={`border-2 ${ctxData.theme === 'Enterprise Light' ? 'border-primary' : 'border-transparent'} rounded-lg p-1 cursor-pointer`}>
                                            <div className="h-20 bg-white border border-slate-100 rounded-md flex items-center justify-center relative overflow-hidden">
                                                <div className="absolute top-0 left-0 w-full h-2 bg-blue-600"></div>
                                                <span className="text-xs text-slate-900">Enterprise Light</span>
                                            </div>
                                        </div>
                                        <div className="border border-input hover:border-primary/50 rounded-lg p-1 cursor-pointer transition-colors">
                                            <div className="h-20 bg-emerald-950 rounded-md flex items-center justify-center relative overflow-hidden">
                                                <div className="absolute top-0 left-0 w-full h-2 bg-emerald-500"></div>
                                                <span className="text-xs text-white">FinOps Focus</span>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-2">
                                        Current Theme: <strong>{ctxData.theme}</strong>. Changes apply only to the {currentCollection.name} site.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                );
            case 'navigation':
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <Card>
                            <CardHeader>
                                <CardTitle>Global Navigation</CardTitle>
                                <CardDescription>Customize the links that appear in the top bar of <strong>{currentCollection.name}</strong>.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {/* Active Links */}
                                    <div className="border rounded-md p-4 bg-slate-50 dark:bg-slate-900/50">
                                        <h4 className="font-medium mb-3 text-sm flex items-center justify-between">
                                            <span>Active Top Bar Links</span>
                                            <span className="text-xs text-muted-foreground">{navItems.length} items</span>
                                        </h4>
                                        <div className="space-y-2">
                                            {navItems.map((item, idx) => (
                                                <div key={item.id} className="flex items-center justify-between bg-white dark:bg-slate-800 p-2 border rounded shadow-sm group">
                                                    <div className="flex items-center gap-2 overflow-hidden">
                                                        <MoveVertical className="size-4 text-slate-400 cursor-grab flex-shrink-0" />
                                                        <div className="flex flex-col min-w-0">
                                                            <span className="text-sm font-medium truncate">{item.label}</span>
                                                            <span className="text-[10px] text-muted-foreground truncate">{item.href}</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => openEditDialog(item)}>
                                                            <Pencil className="size-3" />
                                                        </Button>
                                                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20" onClick={() => moveItem(item, 'remove')}>
                                                            <span className="sr-only">Remove</span>
                                                            &times;
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                            {navItems.length === 0 && (
                                                <div className="text-center py-4 text-sm text-muted-foreground italic">No links in top bar</div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Available Links */}
                                    <div className="border rounded-md p-4">
                                        <h4 className="font-medium mb-3 text-sm">Available Hub Links</h4>
                                        <div className="space-y-2">
                                            {availableLinks.map(item => (
                                                <div key={item.id} className="flex items-center justify-between p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors group">
                                                    <div className="flex flex-col min-w-0">
                                                        <span className="text-sm font-medium truncate">{item.label}</span>
                                                        <span className="text-[10px] text-muted-foreground truncate">{item.href}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => openEditDialog(item)}>
                                                                <Pencil className="size-3" />
                                                            </Button>
                                                            <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500 hover:bg-red-50" onClick={() => handleDeleteLink(item.id)}>
                                                                <Trash2 className="size-3" />
                                                            </Button>
                                                        </div>
                                                        <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => moveItem(item, 'add')}>
                                                            Add
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="mt-4 pt-4 border-t">
                                            <Button variant="ghost" className="w-full justify-start gap-2 text-blue-600" size="sm" onClick={openAddDialog}>
                                                <Plus className="size-3" /> Add Custom Link
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>{editingLink ? 'Edit Link' : 'Add Custom Link'}</DialogTitle>
                                            <DialogDescription>
                                                {editingLink ? 'Update the details for this navigation link.' : 'Create a new link for your global navigation bar.'}
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="grid gap-4 py-4">
                                            <div className="grid gap-2">
                                                <Label htmlFor="link-label">Display Label</Label>
                                                <Input
                                                    id="link-label"
                                                    value={tempLabel}
                                                    onChange={(e) => setTempLabel(e.target.value)}
                                                    placeholder="e.g. My Dashboard"
                                                />
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="link-href">URL Destination</Label>
                                                <Input
                                                    id="link-href"
                                                    value={tempHref}
                                                    onChange={(e) => setTempHref(e.target.value)}
                                                    placeholder="e.g. /sites/marketing OR https://google.com"
                                                />
                                            </div>
                                        </div>
                                        <DialogFooter>
                                            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                                            <Button onClick={handleSaveLink}>Save Link</Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            </CardContent>
                        </Card>
                    </div>
                );
            case 'integrations':
                const isAuthenticated = accounts.length > 0;
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <Card>
                            <CardHeader>
                                <CardTitle>Microsoft 365 Integration</CardTitle>
                                <CardDescription>Connect your workflow to Microsoft Graph to access files, people, and calendar events.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Configuration Section */}
                                <div className="p-4 border border-blue-100 dark:border-blue-900 rounded-lg bg-blue-50 dark:bg-blue-900/10">
                                    <div className="flex items-center justify-between mb-4">
                                        <h4 className="font-semibold text-blue-900 dark:text-blue-100 flex items-center gap-2">
                                            <Shield className="size-4" /> App Configuration
                                        </h4>
                                        {!isEditingConfig && (
                                            <Button variant="ghost" size="sm" onClick={() => setIsEditingConfig(true)}>Configure</Button>
                                        )}
                                    </div>

                                    {isEditingConfig ? (
                                        <div className="space-y-3">
                                            <div className="grid gap-2">
                                                <label className="text-sm font-medium">Application (Client) ID</label>
                                                <input
                                                    type="text"
                                                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                                    placeholder="e.g. b4c9e2c7-1c4c..."
                                                    value={clientId}
                                                    onChange={(e) => setClientId(e.target.value)}
                                                />
                                                <p className="text-xs text-muted-foreground">
                                                    Enter the Application ID from your Azure App Registration. Ensure functionality for <strong>Single Page Applications (SPA)</strong> is enabled with redirect URI: <code className="bg-slate-200 dark:bg-slate-800 px-1 rounded">{window.location.origin}/portal/settings</code>
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Button size="sm" onClick={saveConfiguration} disabled={!clientId}>
                                                    Save & Reload
                                                </Button>
                                                {localStorage.getItem('azure_client_id') && (
                                                    <Button variant="outline" size="sm" onClick={() => setIsEditingConfig(false)}>Cancel</Button>
                                                )}
                                                <Button variant="ghost" size="sm" className="ml-auto text-red-500 hover:text-red-600 hover:bg-red-50" onClick={clearConfiguration}>
                                                    Reset
                                                </Button>
                                            </div>

                                            {/* Visual Setup Guide */}
                                            <div className="mt-6 border-t pt-4">
                                                <h5 className="text-xs font-semibold mb-3 text-muted-foreground uppercase tracking-wider">Quick Setup Guide (Click to Expand)</h5>
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                    <div className="space-y-2 group cursor-pointer" onClick={() => setExpandedImage("/images/tutorials/azure-setup/step1.png")}>
                                                        <div className="aspect-video bg-slate-900 rounded-md overflow-hidden border border-slate-200 dark:border-slate-800 relative">
                                                            <img src="/images/tutorials/azure-setup/step1.png" alt="Search App Registrations" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                                                                <ZoomIn className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                                            </div>
                                                        </div>
                                                        <p className="text-xs text-muted-foreground">1. Search for <strong>App Registrations</strong> in Azure Portal.</p>
                                                    </div>
                                                    <div className="space-y-2 group cursor-pointer" onClick={() => setExpandedImage("/images/tutorials/azure-setup/step2.png")}>
                                                        <div className="aspect-video bg-slate-900 rounded-md overflow-hidden border border-slate-200 dark:border-slate-800 relative">
                                                            <img src="/images/tutorials/azure-setup/step2.png" alt="Copy Client ID" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                                                                <ZoomIn className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                                            </div>
                                                        </div>
                                                        <p className="text-xs text-muted-foreground">2. Copy the <strong>Application (client) ID</strong> from Overview.</p>
                                                    </div>
                                                    <div className="space-y-2 group cursor-pointer" onClick={() => setExpandedImage("/images/tutorials/azure-setup/step3.png")}>
                                                        <div className="aspect-video bg-slate-900 rounded-md overflow-hidden border border-slate-200 dark:border-slate-800 relative">
                                                            <img src="/images/tutorials/azure-setup/step3.png" alt="Add Redirect URI" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                                                                <ZoomIn className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                                            </div>
                                                        </div>
                                                        <p className="text-xs text-muted-foreground">3. Add SPA Redirect URI: <code className="bg-slate-200 dark:bg-slate-800 px-1 rounded break-all">{window.location.origin}/portal/settings</code></p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-sm text-blue-800 dark:text-blue-200">
                                            Using custom Configuration ID: <span className="font-mono">{clientId}</span>
                                        </div>
                                    )}
                                </div>

                                <Separator />

                                <div className="flex items-center justify-between p-4 border rounded-lg bg-slate-50 dark:bg-slate-900/50">
                                    <div className="flex items-center gap-4">
                                        <div className="bg-blue-600 p-2 rounded-lg text-white">
                                            <LayoutGrid className="size-6" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold">Microsoft Graph Connection</h4>
                                            <p className="text-sm text-muted-foreground">
                                                {isAuthenticated
                                                    ? `Connected as ${accounts[0].name} (${accounts[0].username})`
                                                    : "Not connected"}
                                            </p>
                                        </div>
                                    </div>
                                    <Button
                                        variant={isAuthenticated ? "outline" : "default"}
                                        onClick={isAuthenticated ? handleTestGraph : handleConnectMicrosoft}
                                        disabled={!clientId && !import.meta.env.VITE_AZURE_CLIENT_ID}
                                    >
                                        {isAuthenticated ? "Test Connection" : "Connect Account"}
                                    </Button>
                                </div>

                                {graphData && (
                                    <div className="rounded-md border bg-slate-950 text-slate-50 p-4 font-mono text-xs overflow-auto max-h-60">
                                        <pre>{JSON.stringify(graphData, null, 2)}</pre>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                );
            default: return null;
        }
    }

    return (
        <div className="max-w-6xl mx-auto p-8 pt-10 min-h-screen">
            {/* Hub Breadcrumb Header */}
            <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                        <span className="font-semibold text-brand-blue">CloudBaud Hub</span>
                        <ChevronRight className="size-4" />
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="flex items-center gap-1 hover:text-foreground transition-colors font-medium">
                                    {currentCollection.name}
                                    <ChevronDown className="size-3" />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start">
                                {collections.map(c => (
                                    <DropdownMenuItem key={c.id} onClick={() => setCurrentCollection(c)}>
                                        {currentCollection.id === c.id && <Check className="mr-2 size-4" />}
                                        <span className={currentCollection.id === c.id ? "font-semibold" : "ml-6"}>{c.name}</span>
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <ChevronRight className="size-4" />
                        <span>Site Settings</span>
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                        {currentCollection.name} Settings
                    </h1>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                {/* Sidebar */}
                <div className="md:col-span-3 space-y-6">
                    <div>
                        <h3 className="mb-2 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            My Personal Settings
                        </h3>
                        <nav className="flex flex-col space-y-1">
                            <Button variant="ghost" className="justify-start gap-2 text-muted-foreground hover:text-foreground">
                                <User className="size-4" /> My Profile
                            </Button>
                            <Button variant="ghost" className="justify-start gap-2 text-muted-foreground hover:text-foreground">
                                <Bell className="size-4" /> My Notifications
                            </Button>
                        </nav>
                    </div>

                    <div>
                        <h3 className="mb-2 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            {currentCollection.name} Administration
                        </h3>
                        {/* Navigation Items */}
                        <nav className="flex flex-col space-y-1">
                            <Button
                                variant={activeTab === 'general' ? 'secondary' : 'ghost'}
                                className="justify-start gap-2"
                                onClick={() => setActiveTab('general')}
                            >
                                <Globe className="size-4" /> Site Information
                            </Button>
                            <Button
                                variant={activeTab === 'permissions' ? 'secondary' : 'ghost'}
                                className="justify-start gap-2"
                                onClick={() => setActiveTab('permissions')}
                            >
                                <Lock className="size-4" /> Site Permissions
                            </Button>
                            <Button
                                variant={activeTab === 'appearance' ? 'secondary' : 'ghost'}
                                className="justify-start gap-2"
                                onClick={() => setActiveTab('appearance')}
                            >
                                <PaintBucket className="size-4" /> Change the Look
                            </Button>
                            <Button
                                variant={activeTab === 'navigation' ? 'secondary' : 'ghost'}
                                className="justify-start gap-2"
                                onClick={() => setActiveTab('navigation')}
                            >
                                <LayoutGrid className="size-4" /> Global Navigation
                            </Button>
                        </nav>
                    </div>

                    <div>
                        <h3 className="mb-2 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Site Collection Admin
                        </h3>
                        <nav className="flex flex-col space-y-1">
                            <Button variant="ghost" className="justify-start gap-2 text-muted-foreground hover:text-foreground">
                                <Layers className="size-4" /> Hub Association
                            </Button>
                            <Button
                                variant={activeTab === 'integrations' ? 'secondary' : 'ghost'}
                                className="justify-start gap-2"
                                onClick={() => setActiveTab('integrations')}
                            >
                                <Puzzle className="size-4" /> Integrations
                            </Button>
                            <Button variant="ghost" className="justify-start gap-2 text-muted-foreground hover:text-foreground">
                                <LayoutGrid className="size-4" /> Site Features
                            </Button>
                        </nav>
                    </div>
                </div>

                <div className="md:col-span-9">
                    {renderContent()}
                </div>
            </div>
            {/* Image Expansion Modal */}
            {expandedImage && (
                <div
                    className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 animate-in fade-in duration-200"
                    onClick={() => setExpandedImage(null)}
                >
                    <div className="relative max-w-5xl w-full max-h-[90vh] flex flex-col items-center">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-2 right-2 md:-top-10 md:-right-10 text-white hover:bg-white/20 rounded-full"
                            onClick={() => setExpandedImage(null)}
                        >
                            <X className="w-6 h-6" />
                        </Button>
                        <img
                            src={expandedImage}
                            alt="Expanded tutorial step"
                            className="max-w-full max-h-[85vh] rounded-lg shadow-2xl border border-white/10"
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default SettingsPage;
