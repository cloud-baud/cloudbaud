import React, { useState, useEffect } from 'react';
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
import { cn } from '@/shared/lib/utils';
import CloudBaudLogo from '@/components/common/CloudBaudLogo';
import { useAuth } from '@/shared/contexts/AuthContext';
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
import { Sparkles } from 'lucide-react'; // Import icon for the trigger button

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
    { icon: FileText, label: 'My tasks', href: '/collaboration/tasks' },
    { icon: Users, label: 'Pitch Deck (Series A)', href: '/collaboration/deck' },
];

const people = [
    { name: 'Matt R. Horn', avatar: 'https://i.pravatar.cc/150?u=matt' },
    { name: 'Mason and Elle', avatar: 'https://i.pravatar.cc/150?u=mason' },
    { name: 'Cliff Weathers', avatar: 'https://i.pravatar.cc/150?u=cliff' },
];

const suggested = [
    { icon: Calendar, label: 'Interview Cara Bina', href: '/collaboration/interview' },
    { icon: Briefcase, label: 'Fundraising', href: '/collaboration/fundraising' },
    { icon: Settings, label: 'Engineering', href: '/collaboration/engineering' },
];

const operationsApps = [
    {
        icon: MessageSquare,
        label: 'Inbox',
        href: '/collaboration/inbox'
    },
    {
        icon: PieChart,
        label: 'Finance',
        href: '/collaboration/finance'
    },
    {
        icon: Megaphone,
        label: 'Marketing',
        href: '/collaboration/marketing'
    },
    {
        icon: Rocket,
        label: 'Sales',
        href: '/collaboration/sales'
    },
    {
        icon: Users, // Using Users for HR
        label: 'HR',
        href: '/collaboration/hr'
    },
    {
        icon: Server, // Using Server for IT
        label: 'IT',
        href: '/collaboration/it',
        children: [
            { label: 'CMDB', href: '/collaboration/it/cmdb' },
            { label: 'Trusted Domains', href: '/collaboration/admin/access' }
        ]
    }
];

const WorkspaceLayout = () => {
    const { user, signOut } = useAuth();
    const [isChatOpen, setIsChatOpen] = useState(false); // State for chat panel
    const location = useLocation();
    const isInboxRoute = location.pathname === '/collaboration/inbox';

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
            { id: '2', label: 'Documents', href: '/collaboration/sites/consulting/docs', icon: 'FileText' },
            { id: '3', label: 'Team', href: '/collaboration/sites/consulting/team', icon: 'Users' }
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
                        onClick={() => setIsChatOpen(!isChatOpen)}
                        className={cn(
                            "w-9 h-9 rounded-lg flex items-center justify-center transition-colors relative",
                            isChatOpen
                                ? "bg-brand-blue text-white shadow-lg shadow-brand-blue/20"
                                : "hover:bg-white/10 text-slate-400 hover:text-white"
                        )}
                        title="Toggle CloudBot"
                    >
                        <Sparkles className="size-4" />
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

                            <DropdownMenuItem onClick={() => window.location.href = '/collaboration/settings'}>
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
                        "flex-shrink-0 flex flex-col pt-6 pb-4 pl-4 lg:pl-6 bg-transparent h-full transition-all duration-300 ease-in-out overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]",
                        isSidebarCollapsed ? "w-[88px]" : "w-[280px]"
                    )}
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
                                <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-brand-blue hover:bg-brand-blue/90 rounded-lg shadow-sm shadow-brand-blue/20 transition-all group">
                                    <Plus className="size-4" />
                                    <span>Create New</span>
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
                                <SidebarLink icon={Calendar} label="Calendar" href="/collaboration/calendar" collapsed={isSidebarCollapsed} onExpand={() => setIsSidebarCollapsed(false)} />
                                <SidebarLink icon={Users} label="My Network" href="/portal/network" collapsed={isSidebarCollapsed} onExpand={() => setIsSidebarCollapsed(false)} />
                            </Section>

                            <Section title="Operations" collapsed={isSidebarCollapsed}>
                                {operationsApps.map((item) => (
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

                            <Section title="People" collapsed={isSidebarCollapsed}>
                                {people.map((person) => (
                                    <div key={person.name} className={cn(
                                        "flex items-center gap-3 py-2 px-3 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white rounded-lg cursor-pointer transition-all duration-200 group",
                                        isSidebarCollapsed && "justify-center px-1"
                                    )}>
                                        <div className="size-7 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700 group-hover:border-brand-blue/50 transition-colors shrink-0">
                                            <img src={person.avatar} alt={person.name} className="h-full w-full object-cover" />
                                        </div>
                                        {!isSidebarCollapsed && <span className="truncate font-medium">{person.name}</span>}
                                    </div>
                                ))}
                            </Section>

                            <Section title="Suggested" collapsed={isSidebarCollapsed}>
                                {suggested.map((item) => (
                                    <SidebarLink key={item.label} {...item} collapsed={isSidebarCollapsed} />
                                ))}
                            </Section>
                        </div>
                    </div>
                </aside>

                {/* Page Content */}
                <main className={cn(
                    "flex-1 flex flex-col overflow-auto relative",
                    isInboxRoute ? "p-1.5 lg:p-2" : "p-4 lg:p-6"
                )}>
                    <div className="flex-1 bg-card rounded-xl border border-border shadow-sm overflow-hidden flex flex-col relative">
                        <Outlet />
                    </div>
                </main>

                {/* Docked Persistent CloudBot Panel */}
                <aside
                    className={cn(
                        "flex-shrink-0 flex flex-col pt-6 pb-4 pr-4 lg:pr-6 bg-transparent h-full transition-all duration-300 ease-in-out overflow-hidden",
                        isChatOpen ? "w-[400px]" : "w-[88px]"
                    )}
                >
                    <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden flex-1 flex flex-col relative ml-2">
                        <OllamaChatPanel 
                            isOpen={true} 
                            isCollapsed={!isChatOpen}
                            onToggleCollapse={() => setIsChatOpen(!isChatOpen)}
                            variant="docked" 
                        />
                    </div>
                </aside>
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

