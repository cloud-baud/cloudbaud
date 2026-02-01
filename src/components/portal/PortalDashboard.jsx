import React, { useState, useEffect } from 'react';
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
    LayoutTemplate,
    Rocket,
    Clock,
    ArrowRight,
    Loader2,
    CheckCircle2
} from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import OutlookWidget from './OutlookWidget';
import PageShell from './PageShell';

// Inline Card components if not available globally yet, to ensure self-contained demo
const SimpleCard = ({ children, className = "" }) => (
    <div className={`bg-card text-card-foreground rounded-xl border border-border shadow-sm ${className}`}>{children}</div>
);

const PortalDashboard = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [activeEngagements, setActiveEngagements] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchAssessments() {
            if (!user?.email) {
                // Fallback to local storage for demo if not logged in
                const stored = localStorage.getItem('fabric_discovery_status');
                if (stored) {
                    const localData = JSON.parse(stored);
                    setActiveEngagements([{
                        id: 'local',
                        type: localData.type,
                        created_at: localData.date,
                        status: localData.stage || 'Pending Review'
                    }]);
                }
                setLoading(false);
                return;
            }

            try {
                const { data, error } = await supabase
                    .from('assessments')
                    .select('*')
                    .eq('user_email', user.email)
                    .order('created_at', { ascending: false });

                if (error) throw error;
                setActiveEngagements(data || []);
            } catch (err) {
                console.error("Error fetching assessments:", err);
            } finally {
                setLoading(false);
            }
        }

        fetchAssessments();
    }, [user]);

    return (
        <PageShell
            title="Client Portal"
            subtitle="Manage your strategic initiatives and view project status."
            actions={
                <div className="flex gap-6">
                    <QuickAction icon={LinkIcon} label="Share Link" sublabel="Copy URL" />
                    <QuickAction icon={Upload} label="Upload" sublabel="Add assets" />
                    <QuickAction icon={Download} label="Download" sublabel="Backup data" />
                </div>
            }
        >

            {/* Outlook / Productivity Widget */}
            <OutlookWidget />

            {/* Active Engagements (Dynamic from Supabase) */}
            <div className="mt-8 mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
                <h2 className="text-xl font-semibold flex items-center gap-2 mb-4 text-slate-900 dark:text-white">
                    <Rocket className="size-5 text-blue-500" />
                    Active Engagements
                </h2>

                {loading ? (
                    <div className="flex items-center gap-2 text-slate-500">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Loading assessments...
                    </div>
                ) : activeEngagements.length === 0 ? (
                    <div className="p-8 text-center border border-dashed border-slate-300 dark:border-slate-700 rounded-xl">
                        <p className="text-slate-500">No active engagements found.</p>
                        <button onClick={() => navigate('/capabilities')} className="text-blue-500 hover:underline mt-2">Start a new assessment</button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6">
                        {activeEngagements.map((assessment, idx) => (
                            <div key={assessment.id || idx} className="bg-slate-900 border border-slate-800 rounded-xl p-6 relative overflow-hidden group shadow-lg">
                                {/* Glow effect */}
                                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>

                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="bg-blue-500/20 text-blue-400 border border-blue-500/30 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
                                                {assessment.type || 'Consulting'}
                                            </span>
                                            <span className="text-slate-400 text-sm flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                Submitted {new Date(assessment.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <h3 className="text-2xl font-bold text-white mb-2">
                                            {assessment.type === 'microsoft-fabric' ? 'Fabric Architecture Assessment' :
                                                assessment.type === 'finops-optimization' ? 'FinOps Efficiency Review' :
                                                    'Strategic Discovery Session'}
                                        </h3>
                                        <p className="text-slate-400 max-w-xl">
                                            {assessment.status === 'pending'
                                                ? "Your discovery data has been submitted. Our Principal Architect is currently reviewing your compliance and workload requirements."
                                                : "Assessment is in progress. Check back for the roadmap artifact."}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-4 bg-slate-950/50 p-4 rounded-lg border border-slate-800 backdrop-blur-sm min-w-[280px]">
                                        <div className="h-10 w-10 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
                                            {assessment.status === 'pending' ? <Loader2 className="w-5 h-5 text-blue-400 animate-spin" /> : <CheckCircle2 className="w-5 h-5 text-green-400" />}
                                        </div>
                                        <div>
                                            <div className="text-sm text-slate-400 uppercase tracking-wide font-medium">Current Status</div>
                                            <div className="text-white font-semibold">
                                                {assessment.status === 'pending' ? 'Architect Review' : assessment.status}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Progress Bar (Visual Flair) */}
                                <div className="mt-8 h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                                    <div className={`h-full bg-gradient-to-r from-blue-500 to-cyan-400 animate-pulse ${assessment.status === 'pending' ? 'w-1/3' : 'w-2/3'}`}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">

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
        </PageShell>
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
