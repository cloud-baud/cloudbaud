import React, { useState } from 'react';
import { Reorder } from 'framer-motion';
import { toast } from 'sonner';
import { User, Bell, Shield, Palette, Globe, Layers, Users as UsersIcon, LayoutGrid, PaintBucket, Lock, ChevronRight, ChevronDown, Check, Plus, MoveVertical, Puzzle, ZoomIn, X, Trash2, Pencil, Type, Image as ImageIcon } from 'lucide-react';
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

        // Show toast confirmation
        // We use a small debounce or check to prevent toast spam during rapid reordering if needed,
        // but for now, we'll rely on the user's discrete actions (Add/Remove).
        // For reorder, it might fire repeatedly, so we might want to check if the change was significant or just silence it for reorder?
        // Actually, keeping it simple: triggering toast on "significant" actions (Add/Remove) manually is better than in useEffect.
        // But for consistency:
        // toast.success("Navigation updated"); // Moving this to handlers to avoid spam during hydration


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
            toast.success("Added to Global Navigation");
        } else {
            setAvailableLinks([...availableLinks, item]);
            setNavItems(navItems.filter(i => i.id !== item.id));
            toast.info("Removed from Global Navigation");
        }
    };

    // Appearance State (Hydrated from user metadata)
    const [themeColor, setThemeColor] = useState(user?.user_metadata?.theme_color || '#00d2ff');
    const [fontFamily, setFontFamily] = useState(user?.user_metadata?.font_family || 'Inter');
    const [customLogo, setCustomLogo] = useState(user?.user_metadata?.custom_logo_url || '');
    const [siteName, setSiteName] = useState(user?.user_metadata?.site_name || 'CloudBaud');

    // File Upload State
    const [isUploading, setIsUploading] = useState(false);
    const [previewAvatar, setPreviewAvatar] = useState(''); // For immediate visual feedback

    // Reset preview when tab opens or user changes
    React.useEffect(() => {
        setPreviewAvatar('');
    }, [activeTab]);

    // Profile Form State (Controlled)
    const [profileForm, setProfileForm] = useState({
        full_name: user?.user_metadata?.full_name || '',
        job_title: user?.user_metadata?.job_title || '',
        avatar_url: user?.user_metadata?.avatar_url || ''
    });

    // Update form when user data loads initially
    React.useEffect(() => {
        if (user) {
            setProfileForm({
                full_name: user.user_metadata?.full_name || '',
                job_title: user.user_metadata?.job_title || '',
                avatar_url: user.user_metadata?.avatar_url || ''
            });
        }
    }, [user, activeTab]);

    const uploadAvatar = async (event) => {
        try {
            setIsUploading(true);
            const file = event.target.files?.[0];
            if (!file) return;

            // 1. Instant Preview
            const objectUrl = URL.createObjectURL(file);
            setPreviewAvatar(objectUrl);

            // 2. Upload
            const fileExt = file.name.split('.').pop();
            const fileName = `${user.id}-${Date.now()}.${fileExt}`;
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(fileName, file, { upsert: true });

            if (uploadError) throw uploadError;

            // 3. Get URL & Update State
            const { data } = supabase.storage.from('avatars').getPublicUrl(fileName);
            setProfileForm(prev => ({ ...prev, avatar_url: data.publicUrl }));

            toast.success("Image uploaded!");
        } catch (error) {
            console.error('Upload error:', error);
            toast.error(`Upload failed: ${error.message || 'Check connection/permissions'}`);
            // We keep the preview so they see what they picked, but warn them it didn't save to cloud
        } finally {
            setIsUploading(false);
        }
    };

    const handleSaveProfile = async () => {
        const { error } = await supabase.auth.updateUser({
            data: {
                full_name: profileForm.full_name,
                job_title: profileForm.job_title,
                avatar_url: profileForm.avatar_url
            }
        });

        if (error) {
            toast.error("Failed to save profile");
        } else {
            toast.success("Profile updated successfully");
            window.location.reload();
        }
    };

    // Apply aesthetics live
    React.useEffect(() => {
        const root = document.documentElement;
        if (themeColor) root.style.setProperty('--color-primary', themeColor);
        if (fontFamily === 'Inter') root.style.setProperty('--font-sans', '"Inter", sans-serif');
        if (fontFamily === 'Mono') root.style.setProperty('--font-sans', 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace');
        // Add more font logic as needed
    }, [themeColor, fontFamily]);

    const handleSaveAppearance = async () => {
        const { error } = await supabase.auth.updateUser({
            data: {
                theme_color: themeColor,
                font_family: fontFamily,
                custom_logo_url: customLogo,
                site_name: siteName
            }
        });
        if (error) toast.error("Failed to save appearance");
        else {
            toast.success("Appearance updated");
            window.location.reload(); // Reload to ensure Layout picks up new Logo/Name
        }
    };

    // Custom Link Management
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingLink, setEditingLink] = useState(null); // { id, label, href } or null for new
    const [tempLabel, setTempLabel] = useState('');
    const [tempHref, setTempHref] = useState('');

    // Sub-item management state
    const [tempSubItems, setTempSubItems] = useState([]);
    const [subLabel, setSubLabel] = useState('');
    const [subHref, setSubHref] = useState('');

    const handleAddSubItem = () => {
        if (!subLabel || !subHref) return;
        const newSub = {
            id: crypto.randomUUID(), // Local temporary ID
            label: subLabel,
            href: subHref
        };
        setTempSubItems([...tempSubItems, newSub]);
        setSubLabel('');
        setSubHref('');
    };

    const handleRemoveSubItem = (subId) => {
        setTempSubItems(tempSubItems.filter(s => s.id !== subId));
    };

    const openAddDialog = () => {
        setEditingLink(null);
        setTempLabel('');
        setTempHref('');
        setTempSubItems([]);
        setSubLabel('');
        setSubHref('');
        setIsDialogOpen(true);
    };

    const openEditDialog = (link) => {
        setEditingLink(link);
        setTempLabel(link.label);
        setTempHref(link.href);
        setTempSubItems(link.subItems || []);
        setSubLabel('');
        setSubHref('');
        setIsDialogOpen(true);
    };

    const handleSaveLink = () => {
        if (!tempLabel || !tempHref) return;

        if (editingLink) {
            // Edit existing
            const updateList = (list) => list.map(item => item.id === editingLink.id ? { ...item, label: tempLabel, href: tempHref, subItems: tempSubItems } : item);
            setNavItems(updateList(navItems));
            setAvailableLinks(updateList(availableLinks));
        } else {
            // Add new
            const newLink = {
                id: Date.now().toString(36) + Math.random().toString(36).substring(2),
                label: tempLabel,
                href: tempHref,
                subItems: tempSubItems
            };
            setAvailableLinks([...availableLinks, newLink]);
            toast.success("Link Created");
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
            case 'profile':
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <Card>
                            <CardHeader>
                                <CardTitle>Public Profile</CardTitle>
                                <CardDescription>Manage how you appear to other users across the CloudBaud workspace.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="flex flex-col md:flex-row gap-8 items-start">
                                    {/* Avatar Preview */}
                                    <div className="flex flex-col items-center gap-3">
                                        <div
                                            className="h-24 w-24 rounded-full overflow-hidden border-4 border-slate-100 dark:border-slate-800 shadow-lg bg-slate-200 relative group cursor-pointer hover:border-brand-blue transition-colors"
                                            onClick={() => document.getElementById('avatar-upload').click()}
                                        >
                                            {/* Show Preview if exists, else User Metadata */}
                                            {(previewAvatar || user?.user_metadata?.avatar_url) ? (
                                                <img
                                                    src={previewAvatar || user.user_metadata.avatar_url}
                                                    alt="Profile"
                                                    className="h-full w-full object-cover transition-opacity duration-300"
                                                />
                                            ) : (
                                                <div className="h-full w-full bg-gradient-to-br from-brand-blue to-purple-600 flex items-center justify-center text-white text-3xl font-bold uppercase">
                                                    {user?.email?.[0] || 'U'}
                                                </div>
                                            )}

                                            {/* Edit Overlay Hint */}
                                            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                                <Pencil className="text-white size-6" />
                                            </div>
                                        </div>
                                        <div className="text-xs text-muted-foreground text-center max-w-[150px]">
                                            Click to upload image<br />
                                            <span className="opacity-70 text-[10px]">(Rec: 400x400px)</span>
                                        </div>
                                    </div>

                                    {/* Edit Form */}
                                    <div className="flex-1 space-y-4 w-full">
                                        <div className="grid gap-2">
                                            <Label>Full Name</Label>
                                            <Input
                                                value={profileForm.full_name}
                                                onChange={(e) => setProfileForm({ ...profileForm, full_name: e.target.value })}
                                                placeholder="e.g. Jane Doe"
                                            />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label>Job Title</Label>
                                            <Input
                                                value={profileForm.job_title}
                                                onChange={(e) => setProfileForm({ ...profileForm, job_title: e.target.value })}
                                                placeholder="e.g. Senior Platform Consultant"
                                            />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label>Avatar Image</Label>
                                            <div className="flex flex-col gap-3">
                                                {/* File Upload Input */}
                                                <div className="flex items-center gap-2">
                                                    <Input
                                                        type="file"
                                                        id="avatar-upload"
                                                        accept="image/*"
                                                        onChange={uploadAvatar}
                                                        disabled={isUploading}
                                                        className="cursor-pointer file:cursor-pointer file:text-brand-blue file:font-medium"
                                                    />
                                                    {isUploading && <span className="text-xs text-brand-blue animate-pulse font-medium">Uploading...</span>}
                                                </div>

                                                <div className="relative">
                                                    <div className="absolute inset-0 flex items-center">
                                                        <span className="w-full border-t" />
                                                    </div>
                                                    <div className="relative flex justify-center text-xs uppercase">
                                                        <span className="bg-background px-2 text-muted-foreground">Or use URL</span>
                                                    </div>
                                                </div>

                                                <Input
                                                    value={profileForm.avatar_url}
                                                    onChange={(e) => {
                                                        setProfileForm({ ...profileForm, avatar_url: e.target.value });
                                                        setPreviewAvatar(e.target.value); // Update preview if manually typing URL
                                                    }}
                                                    placeholder="https://..."
                                                />
                                            </div>
                                            <p className="text-[10px] text-muted-foreground">
                                                Supported formats: JPG, PNG, GIF. Max size 2MB.
                                            </p>
                                        </div>

                                        <div className="pt-2 flex justify-end">
                                            <Button onClick={handleSaveProfile} disabled={isUploading}>
                                                {isUploading ? 'Uploading...' : 'Save Changes'}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                );
            case 'general':
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        {/* Hub Inheritance Indicator */}
                        {/* Hub Inheritance Indicator - "The Banner" */}
                        <div className="relative overflow-hidden bg-gradient-to-r from-blue-50 to-white dark:from-blue-950/40 dark:to-slate-950 border border-blue-100 dark:border-blue-900/50 p-5 rounded-xl shadow-sm flex items-start gap-4 mb-6">
                            <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />
                            <div className="bg-blue-100 dark:bg-blue-900/50 p-2.5 rounded-lg shadow-inner">
                                <Layers className="size-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div className="flex-1 z-10">
                                <h4 className="font-semibold text-base text-slate-900 dark:text-slate-100">
                                    Hub Association: <span className="text-blue-600 dark:text-blue-400">CloudBaud Enterprise</span>
                                </h4>
                                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                                    The <strong>{currentCollection.name}</strong> collection inherits navigation, theme, and compliance policies from the CloudBaud Hub.
                                </p>
                            </div>
                            {/* Decorative Background Blob */}
                            <div className="absolute -right-6 -top-6 w-24 h-24 bg-blue-400/10 rounded-full blur-2xl pointer-events-none" />
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
                                <CardTitle>Global Branding</CardTitle>
                                <CardDescription>Customize the visual identity of your workspace.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-8">

                                {/* Color Scheme */}
                                <div>
                                    <label className="text-sm font-medium mb-3 flex items-center gap-2">
                                        <Palette className="size-4" /> Theme Colors
                                    </label>
                                    <div className="flex flex-wrap gap-4">
                                        {[
                                            { name: 'Tech Blue', val: '#00d2ff' },
                                            { name: 'Neon Purple', val: '#8b5cf6' },
                                            { name: 'Emerald', val: '#10b981' },
                                            { name: 'Sunset', val: '#f59e0b' },
                                            { name: 'Crimson', val: '#e11d48' }
                                        ].map(color => (
                                            <div
                                                key={color.val}
                                                className={`cursor-pointer rounded-lg p-1 border-2 transition-all ${themeColor === color.val ? 'border-foreground scale-110' : 'border-transparent hover:border-border'}`}
                                                onClick={() => setThemeColor(color.val)}
                                            >
                                                <div className="w-12 h-12 rounded-md shadow-sm flex items-center justify-center" style={{ backgroundColor: color.val }}>
                                                    {themeColor === color.val && <Check className="text-white drop-shadow-md" />}
                                                </div>
                                                <div className="text-[10px] text-center mt-1 font-medium text-muted-foreground">{color.name}</div>
                                            </div>
                                        ))}
                                        <div className="space-y-2">
                                            <div className="w-12 h-12 rounded-md border-2 border-dashed border-input flex items-center justify-center bg-slate-50 dark:bg-slate-900">
                                                <input
                                                    type="color"
                                                    value={themeColor}
                                                    onChange={(e) => setThemeColor(e.target.value)}
                                                    className="w-8 h-8 opacity-0 absolute cursor-pointer"
                                                />
                                                <Palette className="size-5 text-muted-foreground" />
                                            </div>
                                            <div className="text-[10px] text-center font-medium text-muted-foreground">Custom</div>
                                        </div>
                                    </div>
                                </div>

                                <Separator />

                                {/* Typography */}
                                <div>
                                    <label className="text-sm font-medium mb-3 flex items-center gap-2">
                                        <Type className="size-4" /> Typography
                                    </label>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div
                                            className={`p-4 border rounded-lg cursor-pointer transition-all ${fontFamily === 'Inter' ? 'border-primary bg-primary/5' : 'hover:border-primary/50'}`}
                                            onClick={() => setFontFamily('Inter')}
                                        >
                                            <div className="font-sans text-lg font-semibold">Inter (System)</div>
                                            <div className="text-sm text-muted-foreground">Clean, modern, and legible. The default choice for UI.</div>
                                        </div>
                                        <div
                                            className={`p-4 border rounded-lg cursor-pointer transition-all font-mono ${fontFamily === 'Mono' ? 'border-primary bg-primary/5' : 'hover:border-primary/50'}`}
                                            onClick={() => setFontFamily('Mono')}
                                        >
                                            <div className="text-lg font-semibold">JetBrains Mono</div>
                                            <div className="text-sm text-muted-foreground">Technical, precise, and code-friendly.</div>
                                        </div>
                                    </div>
                                </div>

                                <Separator />

                                {/* Logo & Naming */}
                                <div className="space-y-4">
                                    <label className="text-sm font-medium flex items-center gap-2">
                                        <ImageIcon className="size-4" /> Brand Assets
                                    </label>
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label>Site Name</Label>
                                            <Input value={siteName} onChange={(e) => setSiteName(e.target.value)} placeholder="CloudBaud" />
                                            <p className="text-[10px] text-muted-foreground">Appears in the top-left header.</p>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Custom Logo URL</Label>
                                            <Input value={customLogo} onChange={(e) => setCustomLogo(e.target.value)} placeholder="https://..." />
                                            <p className="text-[10px] text-muted-foreground">Recommended: Transparent PNG, 40px height.</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4 flex justify-end">
                                    <Button onClick={handleSaveAppearance}>Save Branding</Button>
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
                                            <Reorder.Group axis="y" values={navItems} onReorder={setNavItems} className="space-y-2">
                                                {navItems.map((item, idx) => (
                                                    <Reorder.Item key={item.id} value={item} whileDrag={{ scale: 1.02, boxShadow: "0 5px 15px rgba(0,0,0,0.1)" }} className="relative z-10">
                                                        <div className="flex items-center justify-between bg-white dark:bg-slate-800 p-2 border rounded shadow-sm group cursor-move">
                                                            <div className="flex items-center gap-2 overflow-hidden pointer-events-none">
                                                                {/* pointer-events-none on content ensures drag isn't blocked, but we set cursor-move on parent */}
                                                                <MoveVertical className="size-4 text-slate-400 flex-shrink-0" />
                                                                <div className="flex flex-col min-w-0">
                                                                    <span className="text-sm font-medium truncate">{item.label}</span>
                                                                    <span className="text-[10px] text-muted-foreground truncate">{item.href}</span>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => { e.stopPropagation(); openEditDialog(item); }}>
                                                                    <Pencil className="size-3" />
                                                                </Button>
                                                                <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20" onClick={(e) => { e.stopPropagation(); moveItem(item, 'remove'); }}>
                                                                    <span className="sr-only">Remove</span>
                                                                    &times;
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </Reorder.Item>
                                                ))}
                                            </Reorder.Group>
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

                                            <Separator className="my-2" />

                                            {/* Sub-Navigation Section */}
                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <Label>Sub-Links (Dropdown)</Label>
                                                    <span className="text-xs text-muted-foreground">{tempSubItems.length} items</span>
                                                </div>

                                                {/* List of Subs */}
                                                {tempSubItems.length > 0 && (
                                                    <div className="bg-slate-50 dark:bg-slate-900/50 rounded-md p-2 space-y-1 max-h-[150px] overflow-y-auto">
                                                        {tempSubItems.map(sub => (
                                                            <div key={sub.id} className="flex items-center justify-between text-sm bg-white dark:bg-slate-800 p-2 rounded border shadow-sm">
                                                                <div className="flex flex-col">
                                                                    <span className="font-medium">{sub.label}</span>
                                                                    <span className="text-[10px] text-muted-foreground">{sub.href}</span>
                                                                </div>
                                                                <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500 hover:bg-red-50" onClick={() => handleRemoveSubItem(sub.id)}>
                                                                    <X className="size-3" />
                                                                </Button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                {/* Add New Sub Inputs */}
                                                <div className="grid grid-cols-12 gap-2 items-end">
                                                    <div className="col-span-5 grid gap-1.5">
                                                        <Label htmlFor="sub-label" className="text-xs">Label</Label>
                                                        <Input id="sub-label" value={subLabel} onChange={e => setSubLabel(e.target.value)} placeholder="Sub Item" className="h-8 text-sm" />
                                                    </div>
                                                    <div className="col-span-5 grid gap-1.5">
                                                        <Label htmlFor="sub-href" className="text-xs">URL</Label>
                                                        <Input id="sub-href" value={subHref} onChange={e => setSubHref(e.target.value)} placeholder="/page" className="h-8 text-sm" />
                                                    </div>
                                                    <div className="col-span-2">
                                                        <Button size="sm" variant="secondary" className="w-full h-8" onClick={handleAddSubItem} disabled={!subLabel || !subHref}>
                                                            <Plus className="size-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <DialogFooter>
                                            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                                            <Button onClick={handleSaveLink} disabled={!tempLabel.trim() || !tempHref.trim()}>Save Link</Button>
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
                        <h3 className="mb-3 px-4 text-sm font-semibold text-primary">
                            My Personal Settings
                        </h3>
                        <nav className="flex flex-col space-y-1">
                            <Button
                                variant={activeTab === 'profile' ? 'secondary' : 'ghost'}
                                className="justify-start gap-2"
                                onClick={() => setActiveTab('profile')}
                            >
                                <User className="size-4" /> My Profile
                            </Button>
                            <Button variant="ghost" className="justify-start gap-2 text-muted-foreground hover:text-foreground">
                                <Bell className="size-4" /> My Notifications
                            </Button>
                        </nav>
                    </div>

                    <div>
                        <h3 className="mb-3 px-4 text-sm font-semibold text-primary">
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
                        <h3 className="mb-3 px-4 text-sm font-semibold text-primary">
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
