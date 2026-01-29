import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FileText,
    CheckSquare,
    Share2,
    MessageCircle,
    MoreHorizontal,
    ThumbsUp,
    MessageSquare as CommentIcon,
    Smile,
    Link as LinkIcon,
    Upload,
    Download,
    Globe,
    LayoutTemplate
} from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import OutlookWidget from './OutlookWidget';

// Inline Card components if not available globally yet, to ensure self-contained demo
const SimpleCard = ({ children, className = "" }) => (
    <div className={`bg-card text-card-foreground rounded-xl border border-border shadow-sm ${className}`}>{children}</div>
);

const PortalDashboard = () => {
    const navigate = useNavigate();

    return (
        <div className="max-w-6xl mx-auto p-8 pt-12">

            {/* Top Action Bar */}
            <div className="flex items-center justify-between mb-12">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight mb-2">Sanity CMS Cockpit</h1>
                    <p className="text-muted-foreground">Manage your content, deployment, and assets.</p>
                </div>

                {/* Quick Actions */}
                <div className="flex gap-6">
                    <QuickAction icon={LinkIcon} label="Share Link" sublabel="Copy URL" />
                    <QuickAction icon={Upload} label="Upload" sublabel="Add assets" />
                    <QuickAction icon={Download} label="Download" sublabel="Backup data" />
                </div>
            </div>

            {/* Outlook / Productivity Widget */}
            <OutlookWidget />

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* Case Studies Column */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold flex items-center gap-2">
                            <FileText className="size-5 text-indigo-500" />
                            All Case Studies
                        </h2>
                        <button className="text-sm text-primary hover:underline">View All</button>
                    </div>

                    <div className="grid gap-4">
                        <ContentCard
                            title="FinTech Transformation"
                            status="Published"
                            date="Updated 2 days ago"
                            category="Finance"
                        />
                        <ContentCard
                            title="Healthcare AI Integration"
                            status="Draft"
                            date="Updated 5 hours ago"
                            category="Healthcare"
                        />
                        <ContentCard
                            title="Global Logistics Overhaul"
                            status="Published"
                            date="Updated 1 week ago"
                            category="Logistics"
                        />
                        <ContentCard
                            title="Retail Data Pipeline"
                            status="In Review"
                            date="Updated yesterday"
                            category="Retail"
                        />
                    </div>
                </div>

                {/* Demos Column */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold flex items-center gap-2">
                            <LayoutTemplate className="size-5 text-rose-500" />
                            All Demos
                        </h2>
                        <button className="text-sm text-primary hover:underline">View All</button>
                    </div>

                    <div className="grid gap-4">
                        <ContentCard
                            title="Interactive Analytics Dashboard"
                            status="Live"
                            date="Deployed 1 hour ago"
                            category="React/Next.js"
                            icon={Globe}
                            accent="rose"
                            onClick={() => navigate('/portal/fabric-demo')}
                        />
                        <ContentCard
                            title="Mobile App Prototype"
                            status="Staging"
                            date="Updated 3 days ago"
                            category="Flutter"
                            icon={Globe}
                            accent="rose"
                        />
                        <ContentCard
                            title="Corporate Portal v2"
                            status="Development"
                            date="Updated just now"
                            category="Web"
                            icon={Globe}
                            accent="rose"
                        />
                    </div>
                </div>

            </div>
        </div>
    );
};

// Components
const QuickAction = ({ icon: Icon, label, sublabel }) => (
    <button className="flex items-center gap-3 group text-left hover:bg-accent/40 p-2 rounded-lg transition-colors">
        <div className="p-2.5 bg-background border border-border rounded-lg shadow-sm group-hover:border-primary/50 group-hover:shadow-md transition-all">
            <Icon className="size-5 text-foreground/80 group-hover:text-primary" />
        </div>
        <div className="hidden md:block">
            <div className="font-semibold text-sm group-hover:text-primary transition-colors whitespace-nowrap">{label}</div>
            <div className="text-xs text-muted-foreground whitespace-nowrap">{sublabel}</div>
        </div>
    </button>
);

const ContentCard = ({ title, status, date, category, icon: Icon = FileText, accent = "indigo", onClick }) => (
    <div onClick={onClick} className="p-4 bg-card border border-border rounded-xl hover:shadow-md transition-all cursor-pointer group hover:border-primary/20">
        <div className="flex items-start justify-between mb-3">
            <div className={`p-2 rounded-lg bg-${accent}-500/10 text-${accent}-500`}>
                <Icon className="size-5" />
            </div>
            <span className={`px-2 py-1 rounded-full text-xs font-medium 
                ${status === 'Published' || status === 'Live' ? 'bg-emerald-500/10 text-emerald-500' :
                    status === 'Draft' ? 'bg-slate-500/10 text-slate-500' : 'bg-amber-500/10 text-amber-500'}`}>
                {status}
            </span>
        </div>
        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">{title}</h3>
        <div className="flex items-center justify-between mt-4 text-xs text-muted-foreground">
            <span>{category}</span>
            <span>{date}</span>
        </div>
    </div>
);

const Avatar = ({ children, className }) => (
    <div className={className}>{children}</div>
);

export default PortalDashboard;
