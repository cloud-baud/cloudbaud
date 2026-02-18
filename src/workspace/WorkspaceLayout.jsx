import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Outlet, NavLink, Link } from 'react-router-dom';
import {
    Home,
    Search,
    Bell,
    Plus,
    FileText,
    Users,
    MessageSquare,
    Briefcase,
    Calendar,
    Settings,
    ChevronRight,
    ChevronDown,
    MoreHorizontal,
    LogOut,
    User,
    PieChart,
    LifeBuoy,
    TrendingUp,
    PanelLeftClose,
    PanelLeftOpen,
    LayoutDashboard,
    Megaphone,
    Rocket,
    Server
} from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { ScrollArea } from '@radix-ui/react-scroll-area';
import { Avatar, AvatarImage, AvatarFallback } from '@radix-ui/react-avatar';
import { Separator } from '@radix-ui/react-separator';
import { cn } from '@/lib/utils';
import CloudBaudLogo from '@/components/common/CloudBaudLogo';
import { useAuth } from '@/context/AuthContext';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/shared/ui/dropdown-menu';
import ThemeToggle from '@/components/layout/ThemeToggle';
import OllamaChatPanel from './OllamaChatPanel';
import WorkspaceChat from './WorkspaceChat';
import { Sparkles, MessageCircle } from 'lucide-react'; 
import { isFinanceAuthorized } from '@/components/auth/FinanceGuard'; // Import permission check

// Icon Mapping for Dynamic Navigation
const ICON_MAP = {
    Home,
    FileText,
    Users,
    Briefcase,
    Calendar,
    Settings,
    PieChart,
    MessageSquare,
    Bell,
    User,
    Megaphone,
    Layer: MoreHorizontal // Fallback/Generic
};

// Mock Data for Sidebar
// Mock Data for Sidebar
const favorites = [
    { icon: FileText, label: 'My tasks', href: '/workspace/tasks' },
    { icon: Users, label: 'Pitch Deck (Series A)', href: '/workspace/deck' },
];

const people = [
    { name: 'Matt R. Horn', avatar: 'https://i.pravatar.cc/150?u=matt' },
    { name: 'Mason and Elle', avatar: 'https://i.pravatar.cc/150?u=mason' },
    { name: 'Cliff Weathers', avatar: 'https://i.pravatar.cc/150?u=cliff' },
];

const suggested = [
    { icon: Calendar, label: 'Interview Cara Bina', href: '/workspace/interview' },
    { icon: Briefcase, label: 'Fundraising', href: '/workspace/fundraising' },
    { icon: Settings, label: 'Engineering', href: '/workspace/engineering' },
];

const operationsApps = [
    {
        icon: PieChart,
        label: 'Finance',
        href: '/workspace/finance'
    },
    {
        icon: Megaphone,
        label: 'Marketing',
        href: '/workspace/marketing'
    },
    {
        icon: Rocket,
        label: 'Sales',
        href: '/workspace/sales'
    },
    {
        icon: LayoutDashboard,
        label: 'CRM',
        href: '/workspace/crm'
    },
    {
        icon: LifeBuoy,
        label: 'Support',
        href: '/workspace/support'
    },
    {
        icon: Users, // Using Users for HR
        label: 'HR',
        href: '/workspace/hr'
    },
    {
        icon: Server, // Using Server for IT
        label: 'IT',
        href: '/workspace/it',
        children: [
            { label: 'CMDB', href: '/workspace/it/cmdb' },
            { label: 'Trusted Domains', href: '/workspace/admin/access' }
        ]
    }
];

const RIGHT_PANEL_TABS = [
    { id: 'ai-chat', label: 'AI Chat', icon: Sparkles },
    { id: 'people', label: 'People', icon: MessageCircle },
    { id: 'resources', label: 'Resources', icon: FileText },
];

const WorkspaceLayout = () => {
    const { user, signOut } = useAuth();
    const [isRightPanelOpen, setIsRightPanelOpen] = useState(false);
    const [rightPanelTab, setRightPanelTab] = useState('ai-chat');
    const [ollamaOnline, setOllamaOnline] = useState(null); // null=checking, true=online, false=offline

    // Resizable pane widths with persistence
    const [sidebarWidth, setSidebarWidth] = useState(() => {
        return parseInt(localStorage.getItem('sidebar_width')) || 280;
    });
    const [rightPanelWidth, setRightPanelWidth] = useState(() => {
        return parseInt(localStorage.getItem('right_panel_width')) || 340;
    });
    const isResizingRef = useRef(null); // 'sidebar' | 'right-panel' | null

    // Drag-to-resize handler
    useEffect(() => {
        const handleMouseMove = (e) => {
            if (!isResizingRef.current) return;
            e.preventDefault();
            if (isResizingRef.current === 'sidebar') {
                const newWidth = Math.max(200, Math.min(500, e.clientX));
                setSidebarWidth(newWidth);
                localStorage.setItem('sidebar_width', newWidth);
            } else if (isResizingRef.current === 'right-panel') {
                const newWidth = Math.max(280, Math.min(600, window.innerWidth - e.clientX - 40)); // 40 = handle strip
                setRightPanelWidth(newWidth);
                localStorage.setItem('right_panel_width', newWidth);
            }
        };
        const handleMouseUp = () => {
            isResizingRef.current = null;
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
        };
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, []);

    // Ollama health check
    useEffect(() => {
        const check = async () => {
            try {
                const res = await fetch('http://localhost:11434/api/tags', { signal: AbortSignal.timeout(3000) });
                setOllamaOnline(res.ok);
            } catch {
                setOllamaOnline(false);
            }
        };
        check();
        const interval = setInterval(check, 15000);
        return () => clearInterval(interval);
    }, []);

    // Sidebar collapse state with persistence
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
        const saved = localStorage.getItem('portal_sidebar_collapsed');
        return saved === 'true';
    });

    const toggleSidebar = () => {
        const newState = !isSidebarCollapsed;
        setIsSidebarCollapsed(newState);
        localStorage.setItem('portal_sidebar_collapsed', newState);
    };

    // Global Navigation State
    const [navItems, setNavItems] = useState(() => {
        try {
            const saved = localStorage.getItem('portal_nav_active');
            const parsed = saved ? JSON.parse(saved) : null;
            // Fallback if null or empty array to ensure nav doesn't disappear
            if (parsed && Array.isArray(parsed) && parsed.length > 0) {
                return parsed;
            }
        } catch (e) {
            console.error("Failed to parse nav", e);
        }
        return [
            { id: 'consulting', label: 'Consulting', href: '/workspace/consulting', icon: 'Briefcase' },
            { id: 'teaching', label: 'Teaching', href: '/workspace/teaching', icon: 'FileText' },
            { id: 'realestate', label: 'Real Estate', href: '/workspace/realestate', icon: 'Home' },
            { id: 'products', label: 'Products', href: '/workspace/products', icon: 'Layers' }
        ];
    });

    // Listen for updates from Settings Page
    useEffect(() => {
        const handleNavUpdate = () => {
            const saved = localStorage.getItem('portal_nav_active');
            if (saved) setNavItems(JSON.parse(saved));
        };

        window.addEventListener('portal-nav-update', handleNavUpdate);
        window.addEventListener('storage', handleNavUpdate); // For cross-tab updates

        return () => {
            window.removeEventListener('portal-nav-update', handleNavUpdate);
            window.removeEventListener('storage', handleNavUpdate);
        };
    }, []);

    // Sync with User Profile on Load (only if local is empty)
    useEffect(() => {
        const localData = localStorage.getItem('portal_nav_active');
        if (!localData && user?.user_metadata?.portal_nav_active) {
            setNavItems(user.user_metadata.portal_nav_active);
            localStorage.setItem('portal_nav_active', JSON.stringify(user.user_metadata.portal_nav_active));
        }
    }, [user]);

    return (
        <div className="flex flex-col h-screen font-sans text-foreground overflow-hidden">
            {/* Top Navigation Bar - Full Width, Persistent Dark Mode */}
            <header
                className="relative flex-none h-[70px] flex items-center justify-between px-4 lg:px-8 border-b border-border z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
            >
                {/* Left: Brand + Search */}
                <div className="flex items-center gap-6">
                    <Link to="/portal" className="flex items-center gap-3 font-semibold text-xl hover:opacity-90 transition-opacity text-white shrink-0">
                        {user?.user_metadata?.custom_logo_url ? (
                            <img src={user.user_metadata.custom_logo_url} alt="Logo" className="h-8 w-auto object-contain" />
                        ) : (
                            <CloudBaudLogo className="size-8 text-brand-blue" />
                        )}
                        <span className="tracking-tight hidden xl:block">{user?.user_metadata?.site_name || 'CloudBaud'}</span>
                    </Link>

                    {/* Prominent Search Bar (Next to Logo) */}
                    <div className="relative w-64 hidden md:block">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search..."
                            className="w-full bg-secondary/50 border border-border rounded-md pl-10 pr-4 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all placeholder:text-muted-foreground"
                        />
                    </div>
                </div>

                {/* Center: Global Navigation Links */}
                <nav className="hidden lg:flex items-center gap-1 xl:gap-2 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                    {user?.email === 'jishnunath@gmail.com' && (
                        <TopNavItem to="/finances" icon={PieChart} label="Finances" />
                    )}

                    {/* Dynamic Nav Items */}
                    {navItems.map(item => {
                        const ItemIcon = ICON_MAP[item.icon] || Briefcase;

                        return item.subItems && item.subItems.length > 0 ? (
                            <DropdownMenu key={item.id}>
                                <DropdownMenuTrigger className="flex flex-col items-center justify-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-white/10 transition-all focus:outline-none data-[state=open]:text-white data-[state=open]:bg-white/10 h-[58px] min-w-[70px]">
                                    <div className="relative">
                                        <ItemIcon className="size-5 mb-0.5" />
                                        <ChevronDown className="absolute -right-3 top-1/2 -translate-y-1/2 size-2.5 opacity-70" />
                                    </div>
                                    <span>{item.label}</span>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    {item.subItems.map(sub => (
                                        <DropdownMenuItem key={sub.id} asChild>
                                            <Link to={sub.href} className="w-full cursor-pointer">
                                                {sub.label}
                                            </Link>
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <TopNavItem
                                key={item.id}
                                to={item.href}
                                icon={ItemIcon}
                                label={item.label}
                            />
                        );
                    })}
                </nav>

                {/* Right: Actions & Profile */}
                <div className="flex items-center gap-3">
                    <Link 
                        to="/" 
                        className="text-slate-400 hover:text-white font-medium text-sm transition-colors border border-slate-700 px-3 py-1.5 rounded-md hover:border-slate-500"
                    >
                        Public Website
                    </Link>

                    {/* AI Assistant Toggle */}
                    <button
                        onClick={() => {
                            if (isRightPanelOpen && rightPanelTab === 'ai-chat') {
                                setIsRightPanelOpen(false);
                            } else {
                                setRightPanelTab('ai-chat');
                                setIsRightPanelOpen(true);
                            }
                        }}
                        className={cn(
                            "w-9 h-9 rounded-lg flex items-center justify-center transition-colors relative",
                            isRightPanelOpen && rightPanelTab === 'ai-chat'
                                ? "bg-brand-blue text-white shadow-lg shadow-brand-blue/20"
                                : "hover:bg-white/10 text-slate-400 hover:text-white"
                        )}
                        title="Toggle AI Assistant"
                    >
                        <Sparkles className="size-4" />
                        <span className={cn(
                            "absolute bottom-1 right-1 size-2 rounded-full border-2 border-[#0f0f0f]",
                            ollamaOnline === null ? "bg-amber-500 animate-pulse" :
                            ollamaOnline ? "bg-emerald-500" : "bg-red-500"
                        )} />
                    </button>

                    {/* Notifications Bell */}
                    <button className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-white/10 text-slate-400 hover:text-white transition-colors relative">
                        <Bell className="size-4" />
                        <span className="absolute top-2.5 right-2.5 size-1.5 bg-red-500 rounded-full border-2 border-[#0f0f0f]"></span>
                    </button>

                    <ThemeToggle />

                    <div className="h-6 w-px bg-border mx-1" />

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <div className="flex items-center gap-3 cursor-pointer hover:bg-white/10 p-1.5 pr-2 rounded-full transition-colors border border-transparent">
                                {user?.user_metadata?.avatar_url ? (
                                    <div className="size-8 rounded-full overflow-hidden border border-slate-700">
                                        <img src={user.user_metadata.avatar_url} alt="User" className="h-full w-full object-cover" />
                                    </div>
                                ) : (
                                    <div className="size-8 rounded-full bg-gradient-to-br from-brand-blue to-purple-600 flex items-center justify-center text-white font-bold text-xs shadow-md uppercase">
                                        {(() => {
                                            const fullName = user?.user_metadata?.full_name || user?.user_metadata?.name;
                                            if (fullName) {
                                                const parts = fullName.trim().split(' ');
                                                return parts.length > 1 ? `${parts[0][0]}${parts[parts.length - 1][0]}` : parts[0][0];
                                            }
                                            return user?.email ? user.email[0] : 'U';
                                        })()}
                                    </div>
                                )}
                                <div className="text-left hidden sm:block">
                                    <div className="text-sm font-semibold leading-none text-slate-200">
                                        {user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'User'}
                                    </div>
                                </div>
                                <ChevronRight className="rotate-90 text-slate-500 w-3.5 h-3.5 ml-0.5" />
                            </div>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuLabel>My Account</DropdownMenuLabel>
                            <DropdownMenuSeparator />

                            <DropdownMenuItem onClick={() => window.location.href = '/workspace/settings'}>
                                <Settings className="mr-2 h-4 w-4" />
                                <span>Settings</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={signOut} className="text-red-500 focus:text-red-500">
                                <LogOut className="mr-2 h-4 w-4" />
                                <span>Sign Out</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </header>

            {/* Main Content Area: Sidebar + Page */}
            <div className="flex-1 flex overflow-hidden">
                {/* Secondary Sidebar (Contextual) */}
                <aside
                    className={cn(
                        "flex-shrink-0 flex flex-col pt-6 pb-4 pl-4 lg:pl-6 bg-transparent h-full transition-all duration-300 ease-in-out overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] relative",
                        isSidebarCollapsed && "!w-[88px]"
                    )}
                    style={!isSidebarCollapsed ? { width: sidebarWidth } : undefined}
                >
                    {/* Card 1: Navigation & Actions */}
                    <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden mb-4 mr-2 flex flex-col shrink-0">
                        {/* Header: Collapse + Create */}
                        <div className={cn("p-4 pb-2 flex items-center gap-2", isSidebarCollapsed && "flex-col-reverse px-2")}>
                            <button
                                onClick={toggleSidebar}
                                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg transition-colors"
                            >
                                {isSidebarCollapsed ? <PanelLeftOpen className="size-4" /> : <PanelLeftClose className="size-4" />}
                            </button>

                            {!isSidebarCollapsed ? (
                                <button className="w-10 h-10 flex items-center justify-center text-white bg-brand-blue hover:bg-brand-blue/90 rounded-lg shadow-sm shadow-brand-blue/20 transition-all" title="Create New">
                                    <Plus className="size-5" />
                                </button>
                            ) : (
                                <button className="w-10 h-10 flex items-center justify-center text-white bg-brand-blue hover:bg-brand-blue/90 rounded-lg shadow-sm shadow-brand-blue/20 transition-all">
                                    <Plus className="size-5" />
                                </button>
                            )}
                        </div>

                        <div className="px-2 pb-4 pt-2 space-y-6">
                            <Section title="Overview" collapsed={isSidebarCollapsed}>
                                <SidebarLink icon={FileText} label="My Feed" href="/portal" active collapsed={isSidebarCollapsed} onExpand={() => setIsSidebarCollapsed(false)} />
                                <SidebarLink icon={Calendar} label="Calendar" href="/workspace/calendar" collapsed={isSidebarCollapsed} onExpand={() => setIsSidebarCollapsed(false)} />
                                <SidebarLink icon={Users} label="My Network" href="/portal/network" collapsed={isSidebarCollapsed} onExpand={() => setIsSidebarCollapsed(false)} />
                            </Section>

                            <Section title="Operations" collapsed={isSidebarCollapsed}>
                                {operationsApps
                                    .filter(app => app.label !== 'Finance' || isFinanceAuthorized(user)) // Hide Finance if not authorized
                                    .map((item) => (
                                    <SidebarLink key={item.label} {...item} collapsed={isSidebarCollapsed} onExpand={() => setIsSidebarCollapsed(false)} />
                                ))}
                            </Section>
                        </div>
                    </div>

                    {/* Card 2: Network & People */}
                    <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden mb-4 mr-2 flex flex-col shrink-0">
                        <div className="px-2 py-4 space-y-6">
                            <Section title="Favorites" collapsed={isSidebarCollapsed}>
                                {favorites.map((item) => (
                                    <SidebarLink key={item.label} {...item} collapsed={isSidebarCollapsed} />
                                ))}
                            </Section>
                        </div>
                    </div>
                    {/* Sidebar Resize Handle */}
                    {!isSidebarCollapsed && (
                        <div
                            className="absolute top-0 right-0 w-1 h-full cursor-col-resize group z-10 hover:bg-brand-blue/30 transition-colors"
                            onMouseDown={(e) => {
                                e.preventDefault();
                                isResizingRef.current = 'sidebar';
                                document.body.style.cursor = 'col-resize';
                                document.body.style.userSelect = 'none';
                            }}
                        >
                            <div className="absolute top-1/2 -translate-y-1/2 left-0 w-1 h-8 rounded-full bg-slate-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                    )}
                </aside>

                {/* Page Content */}
                <main className="flex-1 flex flex-col overflow-auto relative p-4 lg:p-6">
                    <div className="flex-1 bg-card rounded-xl border border-border shadow-sm overflow-hidden flex flex-col relative">
                        <Outlet />
                    </div>
                </main>

                {/* Right Panel - Always-visible handle */}
                <div className="flex flex-shrink-0 h-full">
                    {/* Expanded Panel */}
                    <div
                        className={cn(
                            "flex flex-col border-l border-border bg-card transition-all duration-300 ease-in-out overflow-hidden relative",
                            !isRightPanelOpen && "!w-0 opacity-0"
                        )}
                        style={isRightPanelOpen ? { width: rightPanelWidth, opacity: 1 } : undefined}
                    >
                        {/* Right Panel Resize Handle */}
                        <div
                            className="absolute top-0 left-0 w-1 h-full cursor-col-resize group z-10 hover:bg-brand-blue/30 transition-colors"
                            onMouseDown={(e) => {
                                e.preventDefault();
                                isResizingRef.current = 'right-panel';
                                document.body.style.cursor = 'col-resize';
                                document.body.style.userSelect = 'none';
                            }}
                        >
                            <div className="absolute top-1/2 -translate-y-1/2 left-0 w-1 h-8 rounded-full bg-slate-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        {/* Panel Content */}
                        <div className="flex-1 overflow-hidden flex flex-col">
                            {rightPanelTab === 'ai-chat' && (
                                <OllamaChatPanel isOpen={true} onClose={() => setIsRightPanelOpen(false)} variant="embedded" />
                            )}
                            {rightPanelTab === 'people' && (
                                <WorkspaceChat
                                    className="flex-1"
                                    workspaceId={(() => {
                                        const seg = window.location.pathname.split('/').filter(Boolean);
                                        return seg[1] || 'finance';
                                    })()}
                                />
                            )}
                            {rightPanelTab === 'resources' && (
                                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                                    <FileText className="size-10 text-slate-500 mb-3" />
                                    <h3 className="text-sm font-semibold text-slate-300 mb-1">Resources</h3>
                                    <p className="text-xs text-slate-500">Pinned docs, links, and reference materials will appear here.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Handle - Always Visible */}
                    <div className="flex flex-col items-center py-4 gap-3 w-10 bg-background border-l border-border shrink-0">
                        {RIGHT_PANEL_TABS.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => {
                                    if (isRightPanelOpen && rightPanelTab === tab.id) {
                                        setIsRightPanelOpen(false);
                                    } else {
                                        setRightPanelTab(tab.id);
                                        setIsRightPanelOpen(true);
                                    }
                                }}
                                className={cn(
                                    "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                                    isRightPanelOpen && rightPanelTab === tab.id
                                        ? "bg-brand-blue text-white shadow-lg shadow-brand-blue/20"
                                        : "text-slate-500 hover:text-slate-200 hover:bg-white/10"
                                )}
                                title={tab.label}
                            >
                                <tab.icon className="size-4" />
                            </button>
                        ))}

                        {/* Spacer */}
                        <div className="flex-1" />

                        {/* Gear → opens AI Control Plane */}
                        <button
                            onClick={() => {
                                setRightPanelTab('ai-chat');
                                setIsRightPanelOpen(true);
                                // Trigger settings inside OllamaChatPanel via a tiny delay
                                setTimeout(() => {
                                    document.querySelector('[data-ai-settings]')?.click();
                                }, 100);
                            }}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-200 hover:bg-white/10 transition-colors"
                            title="AI Settings"
                        >
                            <Settings className="size-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Helper Components
const TopNavItem = ({ to, icon: Icon, label, exact }) => (
    <NavLink
        to={to}
        end={exact}
        className={({ isActive }) =>
            cn(
                "flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 group min-w-[70px] h-full min-h-[58px]",
                isActive
                    ? "text-white bg-white/5 shadow-sm shadow-white/5"
                    : "text-slate-400 hover:text-white hover:bg-white/10"
            )
        }
    >
        {({ isActive }) => (
            <>
                <Icon className={cn("size-5 mb-0.5 transition-colors", isActive ? "text-brand-blue" : "text-slate-400 group-hover:text-white")} />
                <span className="whitespace-nowrap">{label}</span>
                {isActive && <div className="absolute bottom-0 h-0.5 w-[20px] bg-brand-blue rounded-t-full opacity-80" />}
            </>
        )}
    </NavLink>
);

const SidebarLink = ({ icon: Icon, label, href, active, collapsed, children, onExpand }) => {
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false);

    // Auto-expand if child or parent is active
    useEffect(() => {
        const isChildActive = children && children.some(child => (location.pathname + location.search).includes(child.href));
        const isParentActive = location.pathname === href;
        if (isChildActive || isParentActive) {
            setIsOpen(true);
        }
    }, [children, location, href]);

    const hasChildren = children && children.length > 0;
    const isActive = active || location.pathname === href || (hasChildren && children.some(child => (location.pathname + location.search).includes(child.href)));

    return (
        <div className="flex flex-col">
            <Link
                to={href}
                className={cn(
                    "flex items-center gap-3 py-2 px-3 text-sm rounded-lg transition-all duration-200 group relative select-none",
                    isActive && !hasChildren
                        ? "bg-brand-blue/10 text-brand-blue font-medium"
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white",
                    collapsed && "justify-center px-1"
                )}
                title={collapsed ? label : undefined}
                onClick={(e) => {
                    if (hasChildren) {
                        e.preventDefault(); // Prevent navigation on parent if it behaves as a folder
                        if (collapsed) {
                             if (onExpand) onExpand();
                             setIsOpen(true); // Also ensure it opens internally
                        } else {
                            setIsOpen(!isOpen);
                        }
                    }
                }}
            >
                {isActive && !hasChildren && <div className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-r-full bg-brand-blue" />}
                {Icon && <Icon className={cn("size-4 transition-colors shrink-0", isActive ? "text-brand-blue" : "opacity-70 group-hover:opacity-100 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300")} />}
                {!collapsed && (
                    <div className="flex items-center justify-between flex-1 overflow-hidden">
                        <span className="truncate">{label}</span>
                        {hasChildren && (
                            <div className="text-slate-400">
                                {isOpen ? <ChevronDown className="size-3" /> : <ChevronRight className="size-3" />}
                            </div>
                        )}
                    </div>
                )}
            </Link>

            {/* Child Links (Tree View) */}
            {hasChildren && isOpen && !collapsed && (
                <div className="flex flex-col mt-0.5 space-y-0.5">
                    {children.map(child => {
                        const isChildActive = location.search === child.href.split('?')[0] + '?' + child.href.split('?')[1] || (location.pathname + location.search) === child.href;

                        return (
                            <Link
                                key={child.label}
                                to={child.href}
                                className={cn(
                                    "flex items-center py-1.5 pl-10 pr-3 text-xs rounded-md transition-colors",
                                    isChildActive
                                        ? "text-brand-blue font-medium bg-brand-blue/5"
                                        : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5"
                                )}
                            >
                                {child.label}
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

const Section = ({ title, children, collapsed }) => (
    <div className="space-y-1">
        <h3 className={cn(
            "px-3 text-xs font-semibold text-slate-400 dark:text-slate-500 mb-2 font-mono uppercase tracking-widest opacity-80",
            collapsed && "text-center text-[10px] px-0"
        )}>
            {collapsed ? title.slice(0, 3) : title}
        </h3>
        {children}
    </div>
);

export default WorkspaceLayout;
