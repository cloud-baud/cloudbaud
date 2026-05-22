import React, { useState } from 'react';
import { Reorder } from 'framer-motion';
import { toast } from 'sonner';
import {
    User, Bell, Shield, Palette, Globe, Layers, Users as UsersIcon, LayoutGrid, PaintBucket, Lock,
    ChevronRight, ChevronDown, Check, Plus, MoveVertical, Puzzle, ZoomIn, X, Trash2, Pencil, Type,
    Image as ImageIcon, Sparkles, Search
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { useAuth } from '@/context/AuthContext';
import { useMsal } from "@azure/msal-react";
import { loginRequest } from "@/lib/authConfig";
import { graphService } from "@/services/graphService";
import { Switch } from "@/shared/ui/switch";
import { Separator } from "@/shared/ui/separator";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '@/shared/ui/dropdown-menu';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/shared/ui/dialog";
import { Label } from "@/shared/ui/label";
import { Input } from "@/shared/ui/input";
import { AUTH_CONFIG_CHANGE_EVENT } from '@/components/auth/DynamicMsalProvider';
import { supabase, envInfo } from "@/lib/supabase";
import { hasHubAdminAccess } from '@/utils/rbac';
// import PageShell from './PageShell';
import { Database, ArrowRightLeft, Server } from 'lucide-react';
import ContentControl from '../ContentControl';

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
    const [activeTab, setActiveTab] = useState(() => {
        const params = new URLSearchParams(window.location.search);
        return params.get('tab') || 'general';
    });
    const [currentCollection, setCurrentCollection] = useState(collections[0]);
    
    // Track initial state for dirty detection
    const [initialState, setInitialState] = useState(null);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    // Allow editing current collection details locally in the UI
    const handleCollectionChange = (field, value) => {
        setCurrentCollection(prev => ({ ...prev, [field]: value }));
    };

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
            { id: '2', label: 'Documents', href: '/workspace/sites/consulting/docs' },
            { id: '3', label: 'Team', href: '/workspace/sites/consulting/team' }
        ];
    });

    // AI Settings State
    const [aiConfig, setAiConfig] = useState(() => {
        return {
            provider: localStorage.getItem('ai_provider') || 'ollama',
            model: localStorage.getItem('ai_model') || 'llama3',
            endpoint: localStorage.getItem('ai_endpoint') || 'http://localhost:11434/api/chat',
            sdk: localStorage.getItem('ai_sdk') || 'custom_bridge'
        };
    });

    const handleSaveAiConfig = () => {
        localStorage.setItem('ai_provider', aiConfig.provider);
        localStorage.setItem('ai_model', aiConfig.model);
        localStorage.setItem('ai_endpoint', aiConfig.endpoint);
        localStorage.setItem('ai_sdk', aiConfig.sdk);
        toast.success("AI settings updated. Refresh to apply.");
    };
    const [availableLinks, setAvailableLinks] = useState(() => {
        const saved = localStorage.getItem('portal_nav_available');
        return saved ? JSON.parse(saved) : [
            { id: '4', label: 'Analytics', href: '/workspace/sites/analytics' },
            { id: '5', label: 'Sales', href: '/workspace/sites/sales' },
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    const [searchboxBg, setSearchboxBg] = useState(user?.user_metadata?.searchbox_bg || '');

    // Sync Appearance from User Metadata when User loads (fix for reload issue)
    React.useEffect(() => {
        if (user?.user_metadata) {
            setThemeColor(user.user_metadata.theme_color || '#00d2ff');
            setFontFamily(user.user_metadata.font_family || 'Inter');
            setCustomLogo(user.user_metadata.custom_logo_url || '');
            setSiteName(user.user_metadata.site_name || 'CloudBaud');
            setSearchboxBg(user.user_metadata.searchbox_bg || '');
            
            // Capture initial state for dirty tracking
            setInitialState({
                themeColor: user.user_metadata.theme_color || '#00d2ff',
                fontFamily: user.user_metadata.font_family || 'Inter',
                customLogo: user.user_metadata.custom_logo_url || '',
                siteName: user.user_metadata.site_name || 'CloudBaud',
                searchboxBg: user.user_metadata.searchbox_bg || '',
                navItems: user.user_metadata.portal_nav_active || navItems,
                aiConfig: {
                    provider: localStorage.getItem('ai_provider') || 'ollama',
                    model: localStorage.getItem('ai_model') || 'llama3',
                    endpoint: localStorage.getItem('ai_endpoint') || 'http://localhost:11434/api/chat',
                    sdk: localStorage.getItem('ai_sdk') || 'custom_bridge'
                }
            });
        }
    }, [user]);

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

            if (uploadError) {
                // Check specifically for "Bucket not found"
                if (uploadError.message?.includes("Bucket not found")) {
                    throw new Error("Storage bucket 'avatars' missing. Please contact admin.");
                }
                throw uploadError;
            }

            // 3. Get URL & Update State
            const { data } = supabase.storage.from('avatars').getPublicUrl(fileName);
            setProfileForm(prev => ({ ...prev, avatar_url: data.publicUrl }));

            toast.success("Image uploaded!");
        } catch (error) {
            console.error('Upload error:', error);

            // Fallback: Convert to Base64 if bucket fails
            const file = event.target.files?.[0];

            // Limit fallback to 800KB
            if (file && file.size < 800 * 1024) {
                try {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        setProfileForm(prev => ({ ...prev, avatar_url: reader.result }));
                        toast.warning("Storage unavailable. Using inline image fallback. Record saved to profile.");
                    };
                    reader.readAsDataURL(file);
                    return; // Handled via fallback
                } catch (readErr) {
                    console.error("Fallback failed", readErr);
                }
            } else if (file) {
                toast.error(`Upload failed: Storage unavailable and file size (${(file.size / 1024).toFixed(0)}KB) exceeds inline limit (800KB).`);
                return;
            }

            toast.error(`Upload failed: ${error.message || 'Check connection/permissions'} `);
        } finally {
            setIsUploading(false);
        }
    };

    const handleLogoUpload = async (event) => {
        if (!user) {
            toast.error("You must be logged in to upload assets.");
            return;
        }

        try {
            setIsUploading(true);
            const file = event.target.files?.[0];
            if (!file) return;

            // 1. Upload to 'avatars' bucket 
            const fileExt = file.name.split('.').pop();
            const fileName = `logo-${user.id}-${Date.now()}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(fileName, file, { upsert: true });

            if (uploadError) {
                // Check specifically for "Bucket not found"
                if (uploadError.message?.includes("Bucket not found")) {
                    throw new Error("Storage bucket 'avatars' missing. Please contact admin.");
                }
                throw uploadError;
            }

            // 2. Get URL
            const { data } = supabase.storage.from('avatars').getPublicUrl(fileName);

            // 3. Update State
            setCustomLogo(data.publicUrl);
            toast.success("Logo uploaded! Click 'Save Branding' to persist.");
        } catch (error) {
            console.error('Logo upload error:', error);

            // Fallback: Convert to Base64 if bucket fails (common in dev/demo)
            const file = event.target.files?.[0];

            // Limit fallback to 800KB (increased from 100KB) to allow decent quality logos without external storage
            if (file && file.size < 800 * 1024) {
                try {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        setCustomLogo(reader.result);
                        toast.warning("Storage unavailable. Using inline image fallback. Click 'Save Branding' to persist.");
                    };
                    reader.readAsDataURL(file);
                    return; // Handled via fallback
                } catch (readErr) {
                    console.error("Fallback failed", readErr);
                }
            } else if (file) {
                toast.error(`Upload failed: Storage unavailable and file size (${(file.size / 1024).toFixed(0)}KB) exceeds inline limit (800KB).`);
                return;
            }

            toast.error(`Upload failed: ${error.message}`);
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

        // SearchBox background color
        if (searchboxBg) {
            root.style.setProperty('--searchbox-bg', searchboxBg);
        } else {
            root.style.removeProperty('--searchbox-bg');
        }

        switch (fontFamily) {
            case 'Inter':
                root.style.setProperty('--font-sans', '"Inter", sans-serif');
                break;
            case 'Roboto':
                root.style.setProperty('--font-sans', '"Roboto", sans-serif');
                break;
            case 'Poppins':
                root.style.setProperty('--font-sans', '"Poppins", sans-serif');
                break;
            case 'Lato':
                root.style.setProperty('--font-sans', '"Lato", sans-serif');
                break;
            case 'Playfair':
                // For serif, we might want to override sans too if it's the primary UI font
                root.style.setProperty('--font-sans', '"Playfair Display", serif');
                break;
            case 'Mono':
                root.style.setProperty('--font-sans', '"Fira Code", ui-monospace, monospace');
                break;
            default:
                root.style.setProperty('--font-sans', '"Inter", sans-serif');
        }
    }, [themeColor, fontFamily, searchboxBg]);

    const handleSaveAppearance = async () => {
        const { error } = await supabase.auth.updateUser({
            data: {
                theme_color: themeColor,
                font_family: fontFamily,
                custom_logo_url: customLogo,
                site_name: siteName,
                searchbox_bg: searchboxBg
            }
        });
        if (error) toast.error("Failed to save appearance");
        else {
            toast.success("Appearance updated");
            window.location.reload(); // Reload to ensure Layout picks up new Logo/Name
        }
    };

    // Detect changes across all settings
    React.useEffect(() => {
        if (!initialState) return;
        
        const hasChanges = 
            themeColor !== initialState.themeColor ||
            fontFamily !== initialState.fontFamily ||
            customLogo !== initialState.customLogo ||
            siteName !== initialState.siteName ||
            searchboxBg !== initialState.searchboxBg ||
            JSON.stringify(navItems) !== JSON.stringify(initialState.navItems) ||
            aiConfig.provider !== initialState.aiConfig.provider ||
            aiConfig.model !== initialState.aiConfig.model ||
            aiConfig.endpoint !== initialState.aiConfig.endpoint ||
            aiConfig.sdk !== initialState.aiConfig.sdk;
        
        setHasUnsavedChanges(hasChanges);
    }, [themeColor, fontFamily, customLogo, siteName, searchboxBg, navItems, aiConfig, initialState]);

    // Global Save All Changes
    const handleSaveAllChanges = async () => {
        try {
            // Save appearance settings
            await supabase.auth.updateUser({
                data: {
                    theme_color: themeColor,
                    font_family: fontFamily,
                    custom_logo_url: customLogo,
                    site_name: siteName,
                    searchbox_bg: searchboxBg,
                    portal_nav_active: navItems
                }
            });

            // Save AI config to localStorage
            localStorage.setItem('ai_provider', aiConfig.provider);
            localStorage.setItem('ai_model', aiConfig.model);
            localStorage.setItem('ai_endpoint', aiConfig.endpoint);
            localStorage.setItem('ai_sdk', aiConfig.sdk);

            // Update initial state to current state
            setInitialState({
                themeColor,
                fontFamily,
                customLogo,
                siteName,
                searchboxBg,
                navItems,
                aiConfig
            });

            toast.success("All settings saved successfully!");
            setHasUnsavedChanges(false);
            
            // Reload to ensure all components pick up changes
            setTimeout(() => window.location.reload(), 500);
        } catch (error) {
            console.error('Save error:', error);
            toast.error("Failed to save settings");
        }
    };

    // Global Discard Changes
    const handleDiscardChanges = () => {
        if (!initialState) return;
        
        setThemeColor(initialState.themeColor);
        setFontFamily(initialState.fontFamily);
        setCustomLogo(initialState.customLogo);
        setSiteName(initialState.siteName);
        setSearchboxBg(initialState.searchboxBg);
        setNavItems(initialState.navItems);
        setAiConfig(initialState.aiConfig);
        
        toast.info("Changes discarded");
        setHasUnsavedChanges(false);
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
                    <div className="space-y-6">
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
                    <div className="space-y-6">
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
                                        onChange={(e) => handleCollectionChange('name', e.target.value)}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <label className="text-sm font-medium">Description</label>
                                    <textarea
                                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus:ring-2 focus:ring-primary"
                                        value={currentCollection.description}
                                        onChange={(e) => handleCollectionChange('description', e.target.value)}
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
                    <div className="space-y-6">
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
                    <div className="space-y-6">
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
                                                <span className="text-xs font-medium mt-2 block text-center opacity-70">{color.name}</span>
                                            </div>
                                        ))}

                                        {/* Custom Color Picker */}
                                        <div className="cursor-pointer rounded-lg p-1 border-2 border-transparent hover:border-border transition-all">
                                            <div className="w-12 h-12 rounded-md border-2 border-dashed border-input flex items-center justify-center bg-slate-50 dark:bg-slate-900 relative">
                                                <input
                                                    type="color"
                                                    value={themeColor}
                                                    onChange={(e) => setThemeColor(e.target.value)}
                                                    className="w-full h-full opacity-0 absolute cursor-pointer top-0 left-0"
                                                />
                                                <Palette className="size-5 text-muted-foreground pointer-events-none" />
                                            </div>
                                            <span className="text-xs font-medium mt-2 block text-center opacity-70">Custom</span>
                                        </div>
                                    </div>
                                </div>

                                <Separator />

                                {/* Typography Selector */}
                                <div>
                                    <label className="text-sm font-medium mb-3 flex items-center gap-2">
                                        <Type className="size-4" /> Typography
                                    </label>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        {[
                                            { id: 'Inter', name: 'Inter (Default)', desc: 'Clean, Modern' },
                                            { id: 'Roboto', name: 'Roboto', desc: 'Geometric, Friendly' },
                                            { id: 'Poppins', name: 'Poppins', desc: 'Bold, Contemporary' },
                                            { id: 'Lato', name: 'Lato', desc: 'Humanist, Warm' },
                                            { id: 'Playfair', name: 'Playfair Display', desc: 'Elegant Serif' },
                                            { id: 'Mono', name: 'Fira Code', desc: 'Technical / Dev' }
                                        ].map(font => (
                                            <div
                                                key={font.id}
                                                className={`p-3 rounded-lg border-2 cursor-pointer transition-all flex flex-col items-start gap-1 ${fontFamily === font.id ? 'border-primary bg-primary/5' : 'border-transparent bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                                                onClick={() => setFontFamily(font.id)}
                                            >
                                                <span className="text-sm font-semibold">{font.name}</span>
                                                <span className="text-xs text-muted-foreground">{font.desc}</span>
                                                {/* Preview */}
                                                <div className="mt-2 text-xl font-bold opacity-80" style={{
                                                    fontFamily: font.id === 'Mono' ? '"Fira Code", monospace' :
                                                        font.id === 'Playfair' ? '"Playfair Display", serif' :
                                                            `"${font.id}", sans-serif`
                                                }}>
                                                    Aa
                                                </div>
                                            </div>
                                        ))}
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
                                        <div className="space-y-3">
                                            <Label>Custom Logo</Label>
                                            <div className="flex items-start gap-4">
                                                <div
                                                    className="w-24 h-24 border-2 border-dashed border-input rounded-lg flex items-center justify-center bg-slate-50 dark:bg-slate-900 overflow-hidden cursor-pointer hover:border-brand-blue transition-colors group relative"
                                                    onClick={() => document.getElementById('logo-upload').click()}
                                                >
                                                    {customLogo ? (
                                                        <img src={customLogo} alt="Logo" className="w-full h-full object-contain p-2" />
                                                    ) : (
                                                        <ImageIcon className="text-muted-foreground opacity-50" />
                                                    )}

                                                    {/* Hover Overlay */}
                                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Pencil className="text-white size-5" />
                                                    </div>
                                                </div>

                                                <div className="flex-1 space-y-2">
                                                    <Input
                                                        value={customLogo}
                                                        onChange={(e) => setCustomLogo(e.target.value)}
                                                        placeholder="https://... or upload image"
                                                    />
                                                    <div className="flex items-center gap-2">
                                                        <Button
                                                            type="button"
                                                            variant="secondary"
                                                            size="sm"
                                                            onClick={() => document.getElementById('logo-upload').click()}
                                                            disabled={isUploading}
                                                        >
                                                            {isUploading ? 'Uploading...' : 'Upload Image'}
                                                        </Button>
                                                        {customLogo && (
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="sm"
                                                                className="text-red-500 hover:bg-red-50"
                                                                onClick={() => setCustomLogo('')}
                                                            >
                                                                Remove
                                                            </Button>
                                                        )}
                                                    </div>
                                                    <p className="text-[10px] text-muted-foreground">
                                                        Recommended: Transparent PNG, max height 50px.
                                                    </p>
                                                    <input
                                                        type="file"
                                                        id="logo-upload"
                                                        className="hidden"
                                                        accept="image/*"
                                                        onChange={handleLogoUpload}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <Separator />

                                {/* SearchBox Background Color */}
                                <div>
                                    <label className="text-sm font-medium mb-3 flex items-center gap-2">
                                        <Search className="size-4" /> Search Bar Background
                                    </label>
                                    <p className="text-xs text-muted-foreground mb-3">
                                        Override the search bar background color. Leave empty to use the default theme color.
                                    </p>
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="w-10 h-10 rounded-lg border-2 border-input overflow-hidden relative cursor-pointer hover:ring-2 hover:ring-primary transition-all"
                                                style={{ background: searchboxBg || 'hsl(220 14% 20% / 0.5)' }}
                                            >
                                                <input
                                                    type="color"
                                                    value={searchboxBg || '#1e293b'}
                                                    onChange={(e) => setSearchboxBg(e.target.value)}
                                                    className="w-full h-full opacity-0 absolute cursor-pointer top-0 left-0"
                                                />
                                            </div>
                                            <Input
                                                value={searchboxBg}
                                                onChange={(e) => setSearchboxBg(e.target.value)}
                                                placeholder="e.g. #1e293b or rgba(0,0,0,0.3)"
                                                className="w-64 font-mono text-xs"
                                            />
                                        </div>
                                        {searchboxBg && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="text-red-500 hover:bg-red-50"
                                                onClick={() => setSearchboxBg('')}
                                            >
                                                Reset
                                            </Button>
                                        )}
                                    </div>
                                    {/* Live Preview */}
                                    <div className="mt-3 p-3 rounded-lg border border-border bg-slate-900/80">
                                        <p className="text-[10px] text-slate-400 mb-2">Preview</p>
                                        <div className="relative w-64">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                                            <input
                                                type="text"
                                                disabled
                                                placeholder="Search..."
                                                className="w-full rounded-md pl-10 pr-4 py-2 text-sm text-white border border-slate-700 placeholder:text-slate-400"
                                                style={{ background: searchboxBg || 'hsl(220 14% 20% / 0.5)' }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4 flex justify-end">
                                    <Button onClick={handleSaveAppearance}>Save Branding</Button>
                                </div>

                            </CardContent >
                        </Card >
                    </div >
                );
            case 'navigation':
                return (
                    <div className="space-y-6">
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
                                                {navItems.map((item) => (
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
                                                    className="text-foreground"
                                                    value={tempLabel}
                                                    onChange={(e) => setTempLabel(e.target.value)}
                                                    placeholder="e.g. My Dashboard"
                                                />
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="link-href">URL Destination</Label>
                                                <Input
                                                    id="link-href"
                                                    className="text-foreground"
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
            case 'integrations': {
                const isAuthenticated = accounts.length > 0;
                return (
                    <>
                        <div className="space-y-6">
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

                        {/* AI Integration Card */}
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500 delay-100">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Sparkles className="size-5 text-brand-blue" />
                                        AI Agent Configuration
                                    </CardTitle>
                                    <CardDescription>Configure your AI assistant's brain, model, and capabilities.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">AI Provider</label>
                                            {/* Locked to Ollama — no cloud LLM providers are used in this project */}
                                            <div className="flex h-9 w-full items-center gap-2 rounded-md border border-input bg-muted/50 px-3 py-1 text-sm cursor-not-allowed select-none">
                                                <span className="size-2 rounded-full bg-emerald-500 shrink-0" />
                                                <span className="font-medium">Ollama (Local)</span>
                                                <span className="ml-auto text-[10px] font-bold uppercase tracking-widest text-muted-foreground bg-muted px-1.5 py-0.5 rounded">Locked</span>
                                            </div>
                                            <p className="text-xs text-muted-foreground">All AI inference runs locally via Ollama. No cloud providers are used.</p>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Model Name</label>
                                            <Input
                                                value={aiConfig.model}
                                                onChange={(e) => setAiConfig({ ...aiConfig, model: e.target.value })}
                                                placeholder="e.g. llama3.2:3b, qwen2.5:7b, phi3.5:3.8b"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">API Endpoint</label>
                                            <Input
                                                value={aiConfig.endpoint}
                                                onChange={(e) => setAiConfig({ ...aiConfig, endpoint: e.target.value })}
                                                placeholder="http://localhost:11434/api/chat"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Agent SDK</label>
                                            <select
                                                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                                value={aiConfig.sdk}
                                                onChange={(e) => setAiConfig({ ...aiConfig, sdk: e.target.value })}
                                            >
                                                <option value="custom_bridge">Custom Bridge (Localhost)</option>
                                                <option value="copilot_kit">CopilotKit (Cloud)</option>
                                                <option value="langchain">LangChain (Node.js)</option>
                                            </select>
                                            <p className="text-xs text-muted-foreground">The "Hands" that execute filesystem changes.</p>
                                        </div>
                                    </div>
                                    <div className="flex justify-end">
                                        <Button onClick={handleSaveAiConfig}>Save AI Settings</Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </>
                );
            }
            case 'hub':
                return (
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Layers className="size-5 text-purple-600" />
                                    Hub Association Settings
                                </CardTitle>
                                <CardDescription>Manage how this site collection interacts with the parent Hub.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-4">
                                    <h4 className="font-medium text-sm">Parent Hub</h4>
                                    <div className="border rounded-md p-4 bg-purple-50 dark:bg-purple-900/10 border-purple-100 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-purple-100 dark:bg-purple-900/40 p-2 rounded-lg">
                                                <Globe className="size-5 text-purple-600 dark:text-purple-400" />
                                            </div>
                                            <div>
                                                <div className="font-semibold text-purple-900 dark:text-purple-100">CloudBaud Enterprise Hub</div>
                                                <div className="text-xs text-purple-600/80 dark:text-purple-400/80">https://hub.cloudbaud.com</div>
                                            </div>
                                        </div>
                                        <Button variant="outline" size="sm">Change Hub</Button>
                                    </div>
                                </div>

                                <Separator />

                                <div className="space-y-4">
                                    <h4 className="font-medium text-sm">Inheritance Policies</h4>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <div className="space-y-0.5">
                                                <label className="text-sm font-medium">Sync Navigation</label>
                                                <p className="text-xs text-muted-foreground">Automatically display Hub navigation links in this site's top bar.</p>
                                            </div>
                                            <Switch defaultChecked />
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="space-y-0.5">
                                                <label className="text-sm font-medium">Enforce Theme</label>
                                                <p className="text-xs text-muted-foreground">Override local site colors with the Hub's branding standards (Blue/Slate).</p>
                                            </div>
                                            <Switch defaultChecked />
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="space-y-0.5">
                                                <label className="text-sm font-medium">Search Scope</label>
                                                <p className="text-xs text-muted-foreground">Include this site's content in global Hub search results.</p>
                                            </div>
                                            <Switch defaultChecked />
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Cross-Site Content Sharing</CardTitle>
                                <CardDescription>Allow other sites in this Hub to reference content from <strong>{currentCollection.name}</strong>.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex items-center space-x-2 border p-3 rounded-md">
                                        <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded">
                                            <UsersIcon className="size-4" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium">Content Syndication</p>
                                            <p className="text-xs text-muted-foreground">"News" and "Events" published here will appear on the Hub Home.</p>
                                        </div>
                                        <Switch defaultChecked />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                );
            case 'hub-admin':
                if (!hasHubAdminAccess(user)) return null;
                return (
                    <div className="space-y-6">
                        <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 to-slate-800 border border-slate-700 p-6 rounded-xl shadow-lg text-white">
                            <div className="flex items-start justify-between relative z-10">
                                <div>
                                    <h3 className="text-lg font-bold flex items-center gap-2">
                                        <Shield className="size-5 text-red-500" /> Hub Administration
                                    </h3>
                                    <p className="text-slate-300 text-sm mt-1 max-w-lg">
                                        Restricted Access: You are viewing this because you are logged in as <strong>{user?.email}</strong>.
                                    </p>
                                </div>
                                <div className="px-3 py-1 bg-red-500/20 border border-red-500/50 rounded text-xs font-mono text-red-200">
                                    GOD MODE
                                </div>
                            </div>
                        </div>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Database className="size-5" /> Database Environment
                                </CardTitle>
                                <CardDescription>Manage data flow between Test and Production environments.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className={`p-4 rounded-lg border-2 ${envInfo.isLocalhost ? 'border-green-500 bg-green-500/5' : 'border-slate-200 dark:border-slate-800'}`}>
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="font-semibold flex items-center gap-2">
                                                <Server className="size-4" /> TEST Database
                                            </div>
                                            {envInfo.isLocalhost && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded font-bold">ACTIVE (Localhost)</span>}
                                        </div>
                                        <div className="text-xs font-mono text-muted-foreground break-all">
                                            {import.meta.env.VITE_SUPABASE_URL_TEST || 'Inheriting Base URL'}
                                        </div>
                                    </div>

                                    <div className={`p-4 rounded-lg border-2 ${!envInfo.isLocalhost ? 'border-blue-500 bg-blue-500/5' : 'border-slate-200 dark:border-slate-800'}`}>
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="font-semibold flex items-center gap-2">
                                                <Server className="size-4" /> PROD Database
                                            </div>
                                            {!envInfo.isLocalhost && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-bold">ACTIVE (Production)</span>}
                                        </div>
                                        <div className="text-xs font-mono text-muted-foreground break-all">
                                            {import.meta.env.VITE_SUPABASE_URL_PROD || 'Inheriting Base URL'}
                                        </div>
                                    </div>
                                </div>

                                <Separator />

                                <div className="bg-yellow-50 dark:bg-yellow-900/10 border-l-4 border-yellow-500 p-4">
                                    <div className="flex items-start">
                                        <ArrowRightLeft className="size-5 text-yellow-600 mt-0.5 mr-3" />
                                        <div>
                                            <h4 className="font-medium text-yellow-900 dark:text-yellow-200">Schema & Data Migration</h4>
                                            <p className="text-sm text-yellow-800 dark:text-yellow-300 mt-1">
                                                Migrate delta (schema changes + vital data) from <strong>TEST</strong> to <strong>PROD</strong>. This operation is irreversible.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="mt-4 flex gap-3">
                                        <Button variant="default" className="bg-yellow-600 hover:bg-yellow-700 text-white" onClick={() => toast.info("Migration Simulator: No changes moved (Safe Mode)")}>
                                            Dry Run
                                        </Button>
                                        <Button variant="destructive" onClick={() => toast.success("Migration Started: Moving delta to Production...")}>
                                            Migrate to Production
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                );

            case 'content':
                return (
                    <div className="space-y-6">
                        <ContentControl />
                    </div>
                );
            default: return null;
        }
    }

    return (
        <div className="p-8 max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-500 bg-white dark:bg-neutral-900 min-h-screen">
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
                            <Button
                                variant={activeTab === 'hub' ? 'secondary' : 'ghost'}
                                className="justify-start gap-2"
                                onClick={() => setActiveTab('hub')}
                            >
                                <Layers className="size-4" /> Hub Settings
                            </Button>
                            <Button
                                variant={activeTab === 'integrations' ? 'secondary' : 'ghost'}
                                className="justify-start gap-2"
                                onClick={() => setActiveTab('integrations')}
                            >
                                <Puzzle className="size-4" /> Integrations
                            </Button>
                            <Button
                                variant={activeTab === 'content' ? 'secondary' : 'ghost'}
                                className="justify-start gap-2"
                                onClick={() => setActiveTab('content')}
                            >
                                <LayoutGrid className="size-4" /> Content Control
                            </Button>
                            <Button variant="ghost" className="justify-start gap-2 text-muted-foreground hover:text-foreground">
                                <LayoutGrid className="size-4" /> Site Features
                            </Button>

                            {/* Hub Admin (Restricted) */}
                            {hasHubAdminAccess(user) && (
                                <Button
                                    variant={activeTab === 'hub-admin' ? 'secondary' : 'ghost'}
                                    className="justify-start gap-2 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-medium mt-4 border border-dashed border-red-200 dark:border-red-900"
                                    onClick={() => setActiveTab('hub-admin')}
                                >
                                    <Shield className="size-4" /> Hub Admin
                                </Button>
                            )}
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

            {/* Sticky Action Bar - Shows when there are unsaved changes */}
            {hasUnsavedChanges && (
                <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shadow-lg z-40 animate-in slide-in-from-bottom duration-300">
                    <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="h-2 w-2 bg-amber-500 rounded-full animate-pulse"></div>
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                You have unsaved changes
                            </span>
                        </div>
                        <div className="flex items-center gap-3">
                            <Button 
                                variant="outline" 
                                onClick={handleDiscardChanges}
                                className="min-w-[120px]"
                            >
                                Discard Changes
                            </Button>
                            <Button 
                                onClick={handleSaveAllChanges}
                                className="min-w-[140px] bg-blue-600 hover:bg-blue-700 text-white"
                            >
                                Save All Changes
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SettingsPage;


