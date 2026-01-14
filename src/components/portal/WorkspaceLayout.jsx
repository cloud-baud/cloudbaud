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
    MoreHorizontal
} from 'lucide-react';
import { ScrollArea } from '@radix-ui/react-scroll-area';
import { Avatar, AvatarImage, AvatarFallback } from '@radix-ui/react-avatar';
import { Separator } from '@radix-ui/react-separator';
import { cn } from '@/lib/utils';

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
    return (
        <div className="flex h-screen bg-background font-sans text-foreground overflow-hidden">
            {/* Sidebar */}
            <aside className="w-[280px] flex-shrink-0 border-r border-border bg-card/30 flex flex-col pt-4">
                {/* Brand / Switcher */}
                <div className="px-4 mb-6 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2 font-semibold text-lg hover:opacity-80 transition-opacity">
                        <div className="size-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
                            <span className="font-bold">C</span>
                        </div>
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

                {/* User Profile */}
                <div className="p-4 border-t border-border mt-auto">
                    <div className="flex items-center gap-3 hover:bg-accent p-2 rounded-md cursor-pointer transition-colors">
                        <div className="size-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-medium text-xs">
                            JD
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <div className="text-sm font-medium truncate">John Doe</div>
                            <div className="text-xs text-muted-foreground truncate">john@cloudbaud.com</div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 overflow-auto bg-background/50 relative">
                <Outlet />
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
