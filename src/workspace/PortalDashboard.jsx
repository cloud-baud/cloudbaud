
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
    Clock,
    ArrowRight,
    Loader2,
    CheckCircle2,
    Star,
    Lock,
    Users,
    Activity,
    Bell,
    Settings,
    Grid,
    Search,
    Plus,
    Mail
} from 'lucide-react';
import { Badge } from '@/shared/ui/badge';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';


const QuickAction = ({ icon, label, sublabel, onClick }) => {
    const Icon = icon;
    return (
        <button onClick={onClick} className="flex items-center gap-3 group text-left hover:bg-accent/40 p-2 rounded-lg transition-colors w-full">
            <div className="p-2.5 bg-background border border-border rounded-lg shadow-sm group-hover:border-primary/50 group-hover:shadow-md transition-all">
                <Icon className="size-5 text-foreground/80 group-hover:text-primary" />
            </div>
            <div className="flex flex-col">
                <div className="font-semibold text-sm group-hover:text-primary transition-colors whitespace-nowrap">{label}</div>
                <div className="text-xs text-muted-foreground whitespace-nowrap">{sublabel}</div>
            </div>
        </button>
    );
};

const ContentCard = ({ title, status, date, category, icon = FileText, accent = "indigo", onClick }) => {
    const Icon = icon;
    return (
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
            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors mb-1 truncate">{title}</h3>
            <div className="flex items-center justify-between mt-4 text-xs text-muted-foreground">
                <span>{category}</span>
                <span>{date}</span>
            </div>
        </div>
    );
};

const StatCard = ({ label, value, trend, icon, trendUp }) => {
    const Icon = icon;
    return (
        <div className="p-4 bg-card border border-border rounded-xl">
            <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">{label}</span>
                <Icon className="size-4 text-muted-foreground" />
            </div>
            <div className="flex items-end justify-between">
                <div className="text-2xl font-bold">{value}</div>
                <div className={`text-xs flex items-center gap-1 ${trendUp ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {trend}
                    {trendUp ? <Activity className="size-3" /> : <Activity className="size-3 rotate-180" />}
                </div>
            </div>
        </div>
    );
};


const PortalDashboard = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [greeting, setGreeting] = useState('');

    useEffect(() => {
        const hour = new Date().getHours();
        if (hour < 12) setGreeting('Good morning');
        else if (hour < 18) setGreeting('Good afternoon');
        else setGreeting('Good evening');
    }, []);

    const recentDocs = [
        { id: 1, title: 'Fabric ETL Pipeline.ipynb', status: 'Draft', date: '2h ago', category: 'Demo / Engineering', icon: FileText, accent: 'blue' },
        { id: 2, title: 'Schedule C (Business) 2025', status: 'Review', date: '5h ago', category: 'Taxes / Finance', icon: LayoutTemplate, accent: 'purple' },
        { id: 3, title: 'Project Alpha Proposal.docx', status: 'In Review', date: '1d ago', category: 'Sales / RFP', icon: Users, accent: 'green' },
        { id: 4, title: 'CFP: O\'Reilly Architecture', status: 'Drafting', date: '2d ago', category: 'Consulting / Speaking', icon: Globe, accent: 'orange' },
    ];

    return (
        <div className="flex flex-col gap-6 p-6 md:p-8 max-w-7xl mx-auto w-full animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight mb-1">
                        {greeting}, <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                            {user?.user_metadata?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'User'}
                        </span>
                    </h1>
                    <p className="text-muted-foreground">Here's what's happening in your workspace today.</p>
                </div>
                
                <div className="flex items-center gap-2">
                    <button className="p-2 hover:bg-accent rounded-full transition-colors relative">
                        <Bell className="size-5" />
                        <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full border-2 border-background"></span>
                    </button>
                    <button onClick={() => navigate('/workspace/settings')} className="p-2 hover:bg-accent rounded-full transition-colors">
                        <Settings className="size-5" />
                    </button>
                    <button className="flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm">
                        <Plus className="size-4" />
                        <span>New Project</span>
                    </button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="Active Deadlines" value="3" trend="Critical" icon={Clock} trendUp={false} />
                <StatCard label="Open RFPs" value="$1.2M" trend="Pipeline" icon={Grid} trendUp={true} />
                <StatCard label="Speaking Gigs" value="2" trend="Upcoming" icon={Users} trendUp={true} />
                <StatCard label="Tax Status" value="Filings" trend="On Track" icon={Activity} trendUp={true} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content Area */}
                <div className="lg:col-span-2 flex flex-col gap-6">
                    {/* Recent Documents Section */}
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold flex items-center gap-2">
                                <Clock className="size-5 text-primary" />
                                Recent Activity
                            </h2>
                            <button className="text-sm text-primary hover:underline">View all</button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {recentDocs.map((doc) => (
                                <ContentCard 
                                    key={doc.id}
                                    {...doc}
                                    onClick={() => navigate(`/workspace/docs/${doc.id}`)}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Quick Launch Section */}
                    <div className="bg-card border border-border rounded-xl p-6">
                         <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold">Quick Launch</h2>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <QuickAction 
                                icon={FileText} 
                                label="New Document" 
                                sublabel="Create content" 
                                onClick={() => navigate('/workspace/docs/new')}
                            />
                            <QuickAction 
                                icon={Users} 
                                label="Add Member" 
                                sublabel="Team management" 
                                onClick={() => navigate('/workspace/admin/access')}
                            />
                            <QuickAction 
                                icon={LayoutTemplate} 
                                label="Create Board" 
                                sublabel="Project tracking" 
                                onClick={() => navigate('/workspace/projects/new')}
                            />
                             <QuickAction 
                                icon={Activity} 
                                label="System Status" 
                                sublabel="View health" 
                                onClick={() => navigate('/workspace/system-status')}
                            />
                             <QuickAction 
                                icon={LayoutTemplate} 
                                label="Fabric Demo" 
                                sublabel="Sales tool" 
                                onClick={() => navigate('/workspace/fabric-demo')}
                            />
                             <QuickAction 
                                icon={Star} 
                                label="Favorites" 
                                sublabel="Access saved" 
                                onClick={() => navigate('/workspace/favorites')}
                            />
                        </div>
                    </div>
                </div>

                {/* Sidebar / Secondary Area */}
                <div className="flex flex-col gap-6">
                    {/* Workspace Summary */}
                    <div className="bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/10 rounded-xl p-6">
                        <h3 className="font-semibold mb-2">Workspace Status</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                            Your team has completed 15 tasks this week. Keep up the momentum!
                        </p>
                        <div className="w-full bg-background/50 h-2 rounded-full overflow-hidden mb-2">
                            <div className="bg-primary h-full w-[75%] rounded-full" />
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Weekly Goal</span>
                            <span>75%</span>
                        </div>
                    </div>

                     {/* Upcoming Events (Unified Calendar) */}
                     <div className="bg-card border border-border rounded-xl p-5">
                        <h3 className="font-semibold mb-4 flex items-center justify-between">
                            <span className="flex items-center gap-2"><Clock className="size-4" /> Unified Calendar</span>
                            <span className="text-xs text-muted-foreground font-normal">jish.nath@cloudbaud.com</span>
                        </h3>
                        <div className="space-y-4">
                            <div className="flex gap-3 items-start group hover:bg-slate-50 dark:hover:bg-slate-800/50 p-2 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-slate-100 dark:hover:border-slate-700">
                                <div className="bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 p-2 rounded-lg text-xs font-bold text-center min-w-[3rem]">
                                    <div>FEB</div>
                                    <div className="text-lg">14</div>
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-medium text-sm">RFP Submission Due</h4>
                                        <Badge className="bg-rose-100 text-rose-700 border-rose-200 h-4 px-1 text-[10px]">Critical</Badge>
                                    </div>
                                    <p className="text-xs text-muted-foreground">Project Alpha (Global SaaS)</p>
                                    <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1"><Mail className="w-3 h-3"/> Sales Calendar</p>
                                </div>
                            </div>

                            <div className="flex gap-3 items-start group hover:bg-slate-50 dark:hover:bg-slate-800/50 p-2 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-slate-100 dark:hover:border-slate-700">
                                <div className="bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 p-2 rounded-lg text-xs font-bold text-center min-w-[3rem]">
                                    <div>FEB</div>
                                    <div className="text-lg">28</div>
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-medium text-sm">CFP Deadline</h4>
                                    </div>
                                    <p className="text-xs text-muted-foreground">O'Reilly Software Architecture</p>
                                    <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1"><Globe className="w-3 h-3"/> Speaking Calendar</p>
                                </div>
                            </div>

                            <div className="flex gap-3 items-start group hover:bg-slate-50 dark:hover:bg-slate-800/50 p-2 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-slate-100 dark:hover:border-slate-700">
                                <div className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 p-2 rounded-lg text-xs font-bold text-center min-w-[3rem]">
                                    <div>APR</div>
                                    <div className="text-lg">15</div>
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-medium text-sm">Tax Filing (IRS)</h4>
                                    </div>
                                    <p className="text-xs text-muted-foreground">Q1 Estimated Payments</p>
                                    <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1"><Activity className="w-3 h-3"/> Finance Calendar</p>
                                </div>
                            </div>
                        </div>
                        <button 
                            onClick={() => toast.info("Microsoft integrations have been discontinued for this workspace.")}
                            className="w-full mt-4 text-xs text-muted-foreground hover:text-rose-500 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                        >
                            <LinkIcon className="size-3" /> Sync Outlook Calendar (Discontinued)
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PortalDashboard;
