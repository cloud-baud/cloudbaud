
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
    Plus
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';


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
        { id: 1, title: 'Q1 Financial Report', status: 'Draft', date: '2h ago', category: 'Finance', icon: FileText, accent: 'blue' },
        { id: 2, title: 'Project Alpha Spec', status: 'Published', date: '5h ago', category: 'Engineering', icon: LayoutTemplate, accent: 'purple' },
        { id: 3, title: 'Client Onboarding', status: 'In Review', date: '1d ago', category: 'Sales', icon: Users, accent: 'green' },
        { id: 4, title: 'System Architecture', status: 'Live', date: '2d ago', category: 'IT', icon: Globe, accent: 'orange' },
    ];

    return (
        <div className="flex flex-col gap-6 p-6 md:p-8 max-w-7xl mx-auto w-full animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight mb-1">
                        {greeting}, <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                            {(() => {
                                const fullName = user?.user_metadata?.full_name || user?.user_metadata?.name;
                                if (fullName) return fullName.trim().split(' ')[0];
                                return user?.email ? user.email.split('@')[0] : 'Guest';
                            })()}
                        </span>
                    </h1>
                    <p className="text-muted-foreground">Here's what's happening in your workspace today.</p>
                </div>
                
                <div className="flex items-center gap-2">
                    <button className="p-2 hover:bg-accent rounded-full transition-colors relative">
                        <Bell className="size-5" />
                        <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full border-2 border-background"></span>
                    </button>
                    <button onClick={() => navigate('/collaboration/settings')} className="p-2 hover:bg-accent rounded-full transition-colors">
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
                <StatCard label="Active Projects" value="12" trend="+2.5%" icon={Grid} trendUp={true} />
                <StatCard label="Pending Tasks" value="8" trend="-4.1%" icon={CheckCircle2} trendUp={true} />
                <StatCard label="Team Members" value="24" trend="+1" icon={Users} trendUp={true} />
                <StatCard label="System Status" value="99.9%" trend="Stable" icon={Activity} trendUp={true} />
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
                                    onClick={() => navigate(`/collaboration/docs/${doc.id}`)}
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
                                onClick={() => navigate('/collaboration/docs/new')}
                            />
                            <QuickAction 
                                icon={Users} 
                                label="Add Member" 
                                sublabel="Team management" 
                                onClick={() => navigate('/collaboration/admin/access')}
                            />
                            <QuickAction 
                                icon={LayoutTemplate} 
                                label="Create Board" 
                                sublabel="Project tracking" 
                                onClick={() => navigate('/collaboration/projects/new')}
                            />
                             <QuickAction 
                                icon={Activity} 
                                label="System Status" 
                                sublabel="View health" 
                                onClick={() => navigate('/collaboration/system-status')}
                            />
                             <QuickAction 
                                icon={LayoutTemplate} 
                                label="Fabric Demo" 
                                sublabel="Sales tool" 
                                onClick={() => navigate('/collaboration/fabric-demo')}
                            />
                             <QuickAction 
                                icon={Star} 
                                label="Favorites" 
                                sublabel="Access saved" 
                                onClick={() => navigate('/collaboration/favorites')}
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

                     {/* Upcoming Events (Static for now) */}
                     <div className="bg-card border border-border rounded-xl p-5">
                        <h3 className="font-semibold mb-4 flex items-center gap-2">
                            <Clock className="size-4" /> Upcoming
                        </h3>
                        <div className="space-y-4">
                            <div className="flex gap-3 items-start">
                                <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 p-2 rounded-lg text-xs font-bold text-center min-w-[3rem]">
                                    <div>FEB</div>
                                    <div className="text-lg">14</div>
                                </div>
                                <div>
                                    <h4 className="font-medium text-sm">Team Sync</h4>
                                    <p className="text-xs text-muted-foreground">10:00 AM - 11:00 AM</p>
                                </div>
                            </div>
                            <div className="flex gap-3 items-start">
                                <div className="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 p-2 rounded-lg text-xs font-bold text-center min-w-[3rem]">
                                    <div>FEB</div>
                                    <div className="text-lg">15</div>
                                </div>
                                <div>
                                    <h4 className="font-medium text-sm">Project Review</h4>
                                    <p className="text-xs text-muted-foreground">2:00 PM - 3:30 PM</p>
                                </div>
                            </div>
                        </div>
                        <button className="w-full mt-4 text-xs text-muted-foreground hover:text-primary transition-colors flex items-center justify-center gap-1">
                            View Calendar <ArrowRight className="size-3" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PortalDashboard;
