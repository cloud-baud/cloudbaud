import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
    PieChart,
    Calculator,
    BookOpen,
    Landmark,
    TrendingUp,
    PanelLeftClose,
    PanelLeftOpen,
    ChevronDown,
    ChevronRight
} from 'lucide-react';
import { Card } from "@/shared/ui/card";

// Context specific sub-navigation data
const SUB_NAVS = {
    'finance': [
        {
            label: 'Taxes',
            href: '/collaboration/finance/taxes',
            icon: Calculator,
            children: [
                { label: '2024', href: '/collaboration/finance/taxes?year=2024' },
                { label: '2023', href: '/collaboration/finance/taxes?year=2023' },
                { label: '2022', href: '/collaboration/finance/taxes?year=2022' },
                { label: '2021', href: '/collaboration/finance/taxes?year=2021' },
                { label: '2020', href: '/collaboration/finance/taxes?year=2020' },
                { label: '2019', href: '/collaboration/finance/taxes?year=2019' },
                { label: '2018', href: '/collaboration/finance/taxes?year=2018' },
                { label: '2017', href: '/collaboration/finance/taxes?year=2017' }
            ]
        },
        { label: 'Bookkeeping', href: '/collaboration/finance/bookkeeping', icon: BookOpen },
        { label: 'Accounting', href: '/collaboration/finance/accounting', icon: PieChart },
        { label: 'Investments', href: '/collaboration/finance/investments', icon: TrendingUp },
    ],
    // Add other contexts here as needed (e.g. 'crm', 'sales')
};

const ContextLink = ({ href, label, icon: Icon, children }) => {
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false);

    const hasChildren = children && children.length > 0;

    // Normalize paths ensuring no trailing slash issues or query param mismatches
    // Active if current path starts with href (parent) OR matches exactly
    // For Taxes: href=/collaboration/finance. location=/collaboration/finance?year=2024. Match.
    const isParentActive = location.pathname === href.split('?')[0];
    const isChildActive = children && children.some(child => (location.pathname + location.search) === child.href);

    const isActive = isParentActive || isChildActive;

    // Auto-expand if active
    useEffect(() => {
        if (isActive) {
            setIsOpen(true);
        }
    }, [isActive]);

    return (
        <div className="flex flex-col">
            <Link
                to={href}
                className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all group whitespace-nowrap select-none",
                    isActive && !hasChildren
                        ? "bg-brand-blue/10 text-brand-blue"
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white"
                )}
                onClick={(e) => {
                    if (hasChildren) {
                        // User wants to navigate and toggle.
                        // Navigation is handled by Link.
                        // Toggle is handled here.
                        setIsOpen(!isOpen);
                    }
                }}
            >
                {Icon && <Icon className="size-4" />}
                <div className="flex-1 flex items-center justify-between">
                    <span>{label}</span>
                    {hasChildren && (
                        <div className="text-slate-400">
                            {isOpen ? <ChevronDown className="size-3" /> : <ChevronRight className="size-3" />}
                        </div>
                    )}
                </div>
            </Link>

            {/* Children */}
            {hasChildren && isOpen && (
                <div className="flex flex-col mt-0.5 ml-7 space-y-0.5 border-l border-slate-200 dark:border-slate-800 pl-2">
                    {children.map(child => {
                        const isNodeActive = (location.pathname + location.search) === child.href;
                        return (
                            <Link
                                key={child.label}
                                to={child.href}
                                className={cn(
                                    "block py-1.5 px-3 text-xs rounded-md transition-colors",
                                    isNodeActive
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

const ContextLayout = () => {
    const location = useLocation();
    const [isCollapsed, setIsCollapsed] = useState(false);

    // Determine current context based on path
    let activeContext = null;
    if (location.pathname.includes('/collaboration/finance')) {
        activeContext = 'finance';
    }
    // Add other checks here

    const subNavItems = activeContext ? SUB_NAVS[activeContext] : [];

    if (!activeContext || !subNavItems.length) {
        return <Outlet />; // If no sub-nav context, just render the content vertically
    }

    return (
        <div className="flex flex-1 h-full overflow-hidden">
            {/* Middle Nav - Context Specific */}
            <div className={cn(
                "flex-shrink-0 flex flex-col border-r border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-black/20 backdrop-blur-sm transition-all duration-300 ease-in-out relative",
                isCollapsed ? "w-0 border-r-0 opacity-0 overflow-hidden" : "w-64 opacity-100 py-6 px-4"
            )}>
                <div className="mb-6 px-2 flex items-center justify-between">
                    <div className="overflow-hidden whitespace-nowrap">
                        <h2 className="text-lg font-bold flex items-center gap-2">
                            {activeContext === 'finance' && <Landmark className="size-5 text-brand-blue" />}
                            <span className="capitalize">{activeContext}</span>
                        </h2>
                        <p className="text-xs text-slate-500 font-medium mt-1">Context Menu</p>
                    </div>
                    <button
                        onClick={() => setIsCollapsed(true)}
                        className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md transition-colors"
                        title="Collapse Menu"
                    >
                        <PanelLeftClose className="size-4 text-slate-500" />
                    </button>
                </div>

                <nav className="space-y-1 min-w-[200px]"> {/* min-w forces text stability during transition */}
                    {subNavItems.map((item) => (
                        <ContextLink key={item.label} {...item} />
                    ))}
                </nav>
            </div>

            {/* Main Content Area - Renders the specific page */}
            <main className="flex-1 overflow-y-auto overflow-x-hidden p-6 relative">
                {isCollapsed && (
                    <div className="absolute top-2 left-0 z-10 transition-opacity duration-300 animate-in fade-in slide-in-from-left-2">
                        <button
                            onClick={() => setIsCollapsed(false)}
                            className="p-1.5 bg-white dark:bg-slate-800 border border-l-0 border-slate-200 dark:border-slate-700 shadow-sm rounded-r-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors group"
                            title="Expand Menu"
                        >
                            <PanelLeftOpen className="size-4 text-slate-500 group-hover:text-brand-blue" />
                        </button>
                    </div>
                )}
                <Outlet />
            </main>
        </div>
    );
};

export default ContextLayout;
