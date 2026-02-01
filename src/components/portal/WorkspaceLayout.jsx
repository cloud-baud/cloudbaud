import React, { useState } from 'react';
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
    PieChart
} from 'lucide-react';
import { ScrollArea } from '@radix-ui/react-scroll-area';
import { Avatar, AvatarImage, AvatarFallback } from '@radix-ui/react-avatar';
import { Separator } from '@radix-ui/react-separator';
import { cn } from '@/lib/utils';
import CloudBaudLogo from '../CloudBaudLogo';
import { useAuth } from '../../context/AuthContext';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import ThemeToggle from '../ThemeToggle';

// Mock Data for Sidebar
const favorites = [
    { icon: FileText, label: 'My tasks', href: '/portal/tasks' },
    { icon: Users, label: 'Pitch Deck (Series A)', href: '/portal/deck' },
];

const people = [
    { name: 'Matt R. Horn', avatar: 'https://i.pravatar.cc/150?u=matt' },
    { name: 'Mason and Elle', avatar: 'https://i.pravatar.cc/150?u=mason' },
    { name: 'Cliff Weathers', avatar: 'https://i.pravatar.cc/150?u=cliff' },
];

const suggested = [
    { icon: Calendar, label: 'Interview Cara Bina', href: '/portal/interview' },
    { icon: Briefcase, label: 'Fundraising', href: '/portal/fundraising' },
    { icon: Settings, label: 'Engineering', href: '/portal/engineering' },
];

const WorkspaceLayout = () => {
    const { user, signOut } = useAuth();

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
            { id: '1', label: 'Home', href: '/sites/consulting' },
            { id: '2', label: 'Documents', href: '/sites/consulting/docs' },
            { id: '3', label: 'Team', href: '/sites/consulting/team' }
        ];
    });

    // Listen for updates from Settings Page
    React.useEffect(() => {
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

    // Sync with User Profile on Load
    // Sync with User Profile on Load (only if local is empty)
    React.useEffect(() => {
        const localData = localStorage.getItem('portal_nav_active');
        if (!localData && user?.user_metadata?.portal_nav_active) {
            setNavItems(user.user_metadata.portal_nav_active);
            localStorage.setItem('portal_nav_active', JSON.stringify(user.user_metadata.portal_nav_active));
        }
    }, [user]);

    return (
        <div className="flex h-screen bg-background font-sans text-foreground overflow-hidden">
            {/* Sidebar */}
            <aside className="w-[280px] flex-shrink-0 border-r border-border bg-card/30 flex flex-col pt-4">
                {/* Brand / Switcher */}
                <div className="px-6 mb-8 mt-2 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-3 font-semibold text-xl hover:opacity-90 transition-opacity">
                        {user?.user_metadata?.custom_logo_url ? (
                            <img src={user.user_metadata.custom_logo_url} alt="Logo" className="h-8 w-auto object-contain" />
                        ) : (
                            <CloudBaudLogo className="size-8 text-brand-blue" />
                        )}
                        <span className="tracking-tight">{user?.user_metadata?.site_name || 'CloudBaud'}</span>
                    </Link>
                </div>

                {/* Primary Nav */}
                <nav className="px-2 space-y-1 mb-6">
                    <NavItem to="/portal" icon={Home} label="Home" exact />
                    <NavItem to="/portal/finances" icon={PieChart} label="Finances" />
                    <NavItem to="/portal/search" icon={Search} label="Search" />
                    <NavItem to="/portal/notifications" icon={Bell} label="Notifications" />
                    <div className="pt-2">
                        <button className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground rounded-md transition-colors group">
                            <Plus className="size-5 text-muted-foreground group-hover:text-foreground" />
                            <span>Create</span>
                        </button>
                    </div>
                </nav>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto px-4 custom-scrollbar">
                    <div className="space-y-6">
                        <Section title="Favorites">
                            {favorites.map((item) => (
                                <SidebarLink key={item.label} {...item} />
                            ))}
                        </Section>

                        {/* People */}
                        <Section title="People">
                            {people.map((person) => (
                                <div key={person.name} className="flex items-center gap-3 py-2 px-3 text-sm text-slate-600 dark:text-slate-400 hover:bg-white/60 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white rounded-lg cursor-pointer transition-all duration-200 group">
                                    <div className="size-7 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700 group-hover:border-brand-blue/50 transition-colors">
                                        <img src={person.avatar} alt={person.name} className="h-full w-full object-cover" />
                                    </div>
                                    <span className="truncate font-medium">{person.name}</span>
                                </div>
                            ))}
                        </Section>

                        {/* Suggested */}
                        <Section title="Suggested">
                            {suggested.map((item) => (
                                <SidebarLink key={item.label} {...item} />
                            ))}
                        </Section>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col overflow-hidden bg-background/50 relative">
                {/* Header: Search & User Profile */}
                <header className="h-16 flex items-center justify-between px-8 border-b border-border/50 bg-background/50 backdrop-blur-sm sticky top-0 z-10">
                    <div className="flex items-center gap-6 flex-1">
                        {/* Global Navigation Links */}
                        <nav className="hidden md:flex items-center gap-4 mr-auto">
                            {navItems.map(item => (
                                item.subItems && item.subItems.length > 0 ? (
                                    <DropdownMenu key={item.id}>
                                        <DropdownMenuTrigger className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors focus:outline-none data-[state=open]:text-foreground">
                                            {item.label}
                                            <ChevronDown className="size-3 opacity-70" />
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
                                    <Link
                                        key={item.id}
                                        to={item.href}
                                        className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        {item.label}
                                    </Link>
                                )
                            ))}
                        </nav>

                        <div className="relative w-full max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Search..."
                                className="w-full bg-accent/20 border border-border/50 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <ThemeToggle />

                        <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 mx-1" />

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <div className="flex items-center gap-3 cursor-pointer hover:bg-accent/50 p-1.5 pr-2 rounded-full transition-colors border border-transparent hover:border-border/50">
                                    {user?.user_metadata?.avatar_url ? (
                                        <div className="size-8 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700">
                                            <img src={user.user_metadata.avatar_url} alt="User" className="h-full w-full object-cover" />
                                        </div>
                                    ) : (
                                        <div className="size-8 rounded-full bg-gradient-to-br from-brand-blue to-purple-600 flex items-center justify-center text-white font-bold text-xs shadow-md uppercase">
                                            {(user?.email ? user.email[0] : 'U')}
                                        </div>
                                    )}
                                    <div className="text-left hidden sm:block">
                                        <div className="text-sm font-semibold leading-none">
                                            {user?.user_metadata?.full_name || 'User'}
                                        </div>
                                        {/* Email hidden per request */}
                                    </div>
                                    <ChevronRight className="rotate-90 text-muted-foreground w-3.5 h-3.5 ml-0.5" />
                                </div>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => window.location.href = '/portal/settings?tab=profile'}>
                                    <User className="mr-2 h-4 w-4" />
                                    <span>Profile</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => window.location.href = '/portal/settings'}>
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

                <div className="flex-1 overflow-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

// Helper Components
const NavItem = ({ to, icon: Icon, label, exact }) => (
    <NavLink
        to={to}
        end={exact}
        className={({ isActive }) =>
            cn(
                "flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 relative group overflow-hidden",
                isActive
                    ? "bg-white dark:bg-white/10 text-brand-blue shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white"
            )
        }
    >
        {({ isActive }) => (
            <>
                {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full bg-brand-blue" />}
                <Icon className={cn("size-5 transition-colors", isActive ? "text-brand-blue" : "text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300")} />
                <span>{label}</span>
            </>
        )}
    </NavLink>
);

const SidebarLink = ({ icon: Icon, label, href }) => (
    <Link to={href} className="flex items-center gap-3 py-2 px-3 text-sm text-slate-600 dark:text-slate-400 hover:bg-white/60 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white rounded-lg transition-all duration-200 group">
        {Icon && <Icon className="size-4 opacity-70 group-hover:opacity-100 transition-opacity text-slate-400 group-hover:text-brand-blue" />}
        <span className="truncate">{label}</span>
    </Link>
);

const Section = ({ title, children }) => (
    <div className="space-y-1 mb-6">
        <h3 className="px-3 text-xs font-semibold text-slate-400 dark:text-slate-500 mb-2 font-mono uppercase tracking-widest opacity-80">{title}</h3>
        {children}
    </div>
);

export default WorkspaceLayout;
