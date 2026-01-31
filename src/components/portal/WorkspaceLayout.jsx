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
    MoreHorizontal,
    LogOut,
    User
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
        const saved = localStorage.getItem('portal_nav_active');
        return saved ? JSON.parse(saved) : [
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
    React.useEffect(() => {
        if (user?.user_metadata?.portal_nav_active) {
            setNavItems(user.user_metadata.portal_nav_active);
            localStorage.setItem('portal_nav_active', JSON.stringify(user.user_metadata.portal_nav_active));
        }
    }, [user]);

    return (
        <div className="flex h-screen bg-background font-sans text-foreground overflow-hidden">
            {/* Sidebar */}
            <aside className="w-[280px] flex-shrink-0 border-r border-border bg-card/30 flex flex-col pt-4">
                {/* Brand / Switcher */}
                <div className="px-4 mb-6 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2 font-semibold text-lg hover:opacity-80 transition-opacity">
                        <CloudBaudLogo className="size-8" />
                        <span>CloudBaud</span>
                    </Link>
                </div>

                {/* Primary Nav */}
                <nav className="px-2 space-y-1 mb-6">
                    <NavItem to="/portal" icon={Home} label="Home" exact />
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
                        {/* Favorites */}
                        <Section title="Favorites">
                            {favorites.map((item) => (
                                <SidebarLink key={item.label} {...item} />
                            ))}
                        </Section>

                        {/* People */}
                        <Section title="People">
                            {people.map((person) => (
                                <div key={person.name} className="flex items-center gap-3 py-1.5 px-2 text-sm text-muted-foreground hover:bg-accent/50 hover:text-foreground rounded-md cursor-pointer transition-colors">
                                    <div className="size-6 rounded-full overflow-hidden bg-muted">
                                        <img src={person.avatar} alt={person.name} className="h-full w-full object-cover" />
                                    </div>
                                    <span className="truncate">{person.name}</span>
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
                                <Link
                                    key={item.id}
                                    to={item.href}
                                    className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    {item.label}
                                </Link>
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

                    <div className="flex items-center gap-4">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <div className="flex items-center gap-3 cursor-pointer hover:bg-accent/50 p-2 rounded-md transition-colors">
                                    <div className="text-right hidden sm:block">
                                        <div className="text-sm font-medium">
                                            {user?.user_metadata?.full_name || user?.user_metadata?.name || user?.user_metadata?.first_name || 'User'}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            {user?.email}
                                            <span className="opacity-50 ml-1">({user?.app_metadata?.provider || 'email'})</span>
                                        </div>
                                    </div>
                                    <div className="size-9 rounded-full bg-gradient-to-br from-brand-blue to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-md uppercase">
                                        {(user?.email ? user.email[0] : 'U')}
                                    </div>
                                    <ChevronRight className="rotate-90 text-muted-foreground w-4 h-4 ml-1" />
                                </div>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => window.location.href = '/portal/settings'}>
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
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200",
                isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
            )
        }
    >
        <Icon className="size-5" />
        <span>{label}</span>
    </NavLink>
);

const SidebarLink = ({ icon: Icon, label, href }) => (
    <Link to={href} className="flex items-center gap-3 py-1.5 px-2 text-sm text-muted-foreground hover:bg-accent/50 hover:text-foreground rounded-md transition-colors">
        {Icon && <Icon className="size-4 opacity-70" />}
        <span className="truncate">{label}</span>
    </Link>
);

const Section = ({ title, children }) => (
    <div className="space-y-1">
        <h3 className="px-2 text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider mb-2">{title}</h3>
        {children}
    </div>
);

export default WorkspaceLayout;
