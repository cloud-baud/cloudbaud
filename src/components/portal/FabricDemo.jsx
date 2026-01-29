import React, { useState, useEffect } from 'react';
import {
    Database,
    Filter,
    BarChart3,
    RefreshCw,
    Server,
    GitBranch,
    Users,
    Zap,
    Code,
    Cpu,
    CheckCircle2,
    ArrowRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend
} from 'recharts';

const FabricDemo = () => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState(null);
    const [serverStatus, setServerStatus] = useState('unknown'); // unknown, connected, disconnected

    // Default mock data to show before fetch or if server is down
    const defaultData = {
        total_events: 146091,
        unique_repositories: 60579,
        active_developers: 44489,
        collaboration_score: 74.3,
        event_types: {
            'PushEvent': 94078,
            'PullRequestEvent': 15031,
            'CreateEvent': 9625,
            'IssueCommentEvent': 6200,
            'DeleteEvent': 4747
        },
        top_repositories: [
            ['LemonbangoTango/bunnyhookwebsite', 1162],
            ['Flo-App-bxl/TDID-Live', 833],
            ['gabagool222/aster-bot', 525]
        ],
        languages: {
            'Other': 134432,
            'Go': 7096,
            'JavaScript': 2978,
            'Python': 711,
            'Rust': 452
        }
    };

    useEffect(() => {
        // Initial data load (mock)
        setData(defaultData);
        checkServer();
    }, []);

    const checkServer = async () => {
        try {
            const res = await fetch('http://localhost:5000/fabric-benefits');
            if (res.ok) setServerStatus('connected');
            else setServerStatus('disconnected');
        } catch (e) {
            setServerStatus('disconnected');
        }
    };

    const handleFetchData = async () => {
        setLoading(true);
        try {
            const res = await fetch('http://localhost:5000/fetch-data');
            const result = await res.json();
            if (result.success) {
                setData(result.analysis);
                setServerStatus('connected');
            }
        } catch (error) {
            console.error("Failed to fetch from logic tier", error);
            setServerStatus('disconnected');
            // Keep using default data but show notification could happen here
        } finally {
            setLoading(false);
        }
    };

    const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

    const eventTypeData = data ? Object.entries(data.event_types).slice(0, 5).map(([name, value]) => ({ name, value })) : [];
    const repoData = data ? data.top_repositories.slice(0, 5).map(([name, value]) => ({ name: name.split('/')[1], value })) : [];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
                        <Zap className="text-yellow-400 w-8 h-8 fill-yellow-400/20" />
                        Microsoft Fabric Analytics
                    </h1>
                    <p className="text-muted-foreground mt-1">Real-time GitHub event stream processing via <strong>Medallion Architecture</strong>.</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className={`px-3 py-1 rounded-full text-xs font-medium border ${serverStatus === 'connected' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border-rose-500/20'}`}>
                        {serverStatus === 'connected' ? '● Engine Online' : '○ Engine Offline'}
                    </div>
                    <button
                        onClick={handleFetchData}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium transition-all shadow-lg hover:shadow-indigo-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        {loading ? 'Ingesting Stream...' : 'Fetch Live Data'}
                    </button>
                </div>
            </div>

            {/* Server Warning */}
            {serverStatus === 'disconnected' && (
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 flex items-center gap-3 text-amber-500 text-sm">
                    <Server className="w-5 h-5" />
                    <p>
                        <strong>Logic Tier Disconnected:</strong> Run <code>python app.py</code> in <code>.\demos\fabric</code> to enable real-time ingestion.
                        Currently viewing cached snapshot.
                    </p>
                </div>
            )}

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                    label="Total Events Processed"
                    value={data?.total_events.toLocaleString()}
                    icon={BarChart3}
                    color="text-blue-400"
                    trend="+12% vs last hour"
                />
                <MetricCard
                    label="Active Repositories"
                    value={data?.unique_repositories.toLocaleString()}
                    icon={GitBranch}
                    color="text-emerald-400"
                    trend="Global reach"
                />
                <MetricCard
                    label="Active Developers"
                    value={data?.active_developers.toLocaleString()}
                    icon={Users}
                    color="text-purple-400"
                    trend="Unique actors"
                />
                <MetricCard
                    label="Collaboration Score"
                    value={`${data?.collaboration_score}%`}
                    icon={Zap}
                    color="text-yellow-400"
                    trend="PR/Commit Ratio"
                />
            </div>

            {/* Main Content Tabs */}
            <Tabs defaultValue="architecture" className="space-y-6">
                <TabsList className="bg-slate-900/50 border border-slate-800 p-1">
                    <TabsTrigger value="architecture" className="data-[state=active]:bg-indigo-600">Medallion Architecture</TabsTrigger>
                    <TabsTrigger value="analytics" className="data-[state=active]:bg-indigo-600">Live Analytics</TabsTrigger>
                    <TabsTrigger value="kql" className="data-[state=active]:bg-indigo-600">KQL Studio</TabsTrigger>
                </TabsList>

                {/* Architecture Tab */}
                <TabsContent value="architecture" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Bronze */}
                        <ArchitectureLayer
                            title="Bronze Layer"
                            subtitle="Raw Ingestion"
                            color="border-amber-600"
                            icon={Database}
                            iconColor="text-amber-600"
                        >
                            <div className="space-y-4">
                                <p className="text-sm text-muted-foreground">Landing zone for raw, immutable data in its native format.</p>
                                <div className="bg-slate-950 p-3 rounded-md border border-slate-800 font-mono text-xs text-green-400 overflow-x-auto">
                                    <div className="text-slate-500 mb-2">// raw_events.json</div>
                                    {"{"}<br />
                                    &nbsp;&nbsp;"id": "12345",<br />
                                    &nbsp;&nbsp;"type": "PushEvent",<br />
                                    &nbsp;&nbsp;"payload": {"{...}"}<br />
                                    {"}"}
                                </div>
                            </div>
                        </ArchitectureLayer>

                        {/* Silver */}
                        <ArchitectureLayer
                            title="Silver Layer"
                            subtitle="Cleaned & Conformed"
                            color="border-slate-400"
                            icon={Filter}
                            iconColor="text-slate-300"
                        >
                            <div className="space-y-4">
                                <p className="text-sm text-muted-foreground">Filtered, cleaned, and augmented data with enforced schemas.</p>
                                <div className="bg-slate-950 p-3 rounded-md border border-slate-800 font-mono text-xs text-blue-400 overflow-x-auto">
                                    <div className="text-slate-500 mb-2">// cleaned_events (Delta)</div>
                                    | event_id | type | user |<br />
                                    |----------|------|------|<br />
                                    | 12345    | Push | jdoe |
                                </div>
                            </div>
                        </ArchitectureLayer>

                        {/* Gold */}
                        <ArchitectureLayer
                            title="Gold Layer"
                            subtitle="Project-Specific Aggregates"
                            color="border-yellow-500"
                            icon={CheckCircle2}
                            iconColor="text-yellow-500"
                        >
                            <div className="space-y-4">
                                <p className="text-sm text-muted-foreground">Business-level aggregates ready for Power BI and reporting.</p>
                                <div className="bg-slate-950 p-3 rounded-md border border-slate-800 font-mono text-xs text-yellow-400 overflow-x-auto">
                                    <div className="text-slate-500 mb-2">// daily_collaboration_metrics</div>
                                    SELECT repo, count(*)<br />
                                    FROM silver_events<br />
                                    GROUP BY repo
                                </div>
                            </div>
                        </ArchitectureLayer>
                    </div>
                </TabsContent>

                {/* Analytics Tab */}
                <TabsContent value="analytics" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card className="bg-slate-900/50 border-slate-800">
                            <CardHeader>
                                <CardTitle>Event Distribution</CardTitle>
                                <CardDescription>Breakdown by GitHub event type</CardDescription>
                            </CardHeader>
                            <CardContent className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={eventTypeData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {eventTypeData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155' }}
                                            itemStyle={{ color: '#f8fafc' }}
                                        />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        <Card className="bg-slate-900/50 border-slate-800">
                            <CardHeader>
                                <CardTitle>Top Repositories</CardTitle>
                                <CardDescription>Most active projects this hour</CardDescription>
                            </CardHeader>
                            <CardContent className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={repoData} layout="vertical" margin={{ left: 40 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
                                        <XAxis type="number" stroke="#94a3b8" />
                                        <YAxis dataKey="name" type="category" stroke="#94a3b8" width={100} tick={{ fontSize: 12 }} />
                                        <Tooltip
                                            cursor={{ fill: '#334155', opacity: 0.2 }}
                                            contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155' }}
                                            itemStyle={{ color: '#f8fafc' }}
                                        />
                                        <Bar dataKey="value" fill="#3B82F6" radius={[0, 4, 4, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* KQL Tab */}
                <TabsContent value="kql">
                    <Card className="bg-slate-900/50 border-slate-800">
                        <CardHeader>
                            <CardTitle>Kusto Query Language (KQL) Studio</CardTitle>
                            <CardDescription>Execute real-time queries against the OneLake Delta tables.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex gap-4">
                                <div className="flex-1 bg-slate-950 rounded-lg border border-slate-800 p-4 font-mono text-sm">
                                    <div className="text-blue-400 mb-2">// Analyze collaboration patterns</div>
                                    <span className="text-purple-400">github_events</span>
                                    <br />
                                    | <span className="text-blue-300">where</span> event_type <span className="text-blue-300">in</span> (<span className="text-green-300">'PushEvent'</span>, <span className="text-green-300">'PullRequestEvent'</span>)
                                    <br />
                                    | <span className="text-blue-300">summarize</span> events=<span className="text-blue-300">count</span>() <span className="text-blue-300">by</span> bin(created_at, 1h), event_type
                                    <br />
                                    | <span className="text-blue-300">render</span> timechart
                                </div>
                                <div className="w-1/3 space-y-3">
                                    <div className="bg-indigo-500/10 border border-indigo-500/20 p-3 rounded-lg">
                                        <div className="text-xs font-semibold text-indigo-400 uppercase mb-1">Query Performance</div>
                                        <div className="text-2xl font-bold text-white">42ms</div>
                                        <div className="text-xs text-muted-foreground">Scanned 146MB</div>
                                    </div>
                                    <div className="bg-green-500/10 border border-green-500/20 p-3 rounded-lg">
                                        <div className="text-xs font-semibold text-green-400 uppercase mb-1">Cache Hit</div>
                                        <div className="text-2xl font-bold text-white">100%</div>
                                        <div className="text-xs text-muted-foreground">Hot Tier Storage</div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

// Sub-components
const MetricCard = ({ label, value, icon: Icon, color, trend }) => (
    <Card className="bg-slate-900/40 border-slate-800 backdrop-blur-sm">
        <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground font-medium">{label}</span>
                <div className={`p-2 rounded-lg bg-slate-800 ${color} bg-opacity-10`}>
                    <Icon className={`w-5 h-5 ${color}`} />
                </div>
            </div>
            <div className="text-2xl font-bold text-white mb-1">{value}</div>
            <div className="text-xs text-muted-foreground flex items-center gap-1">
                <span className="text-emerald-500 font-medium flex items-center">
                    {trend}
                </span>
            </div>
        </CardContent>
    </Card>
);

const ArchitectureLayer = ({ title, subtitle, color, icon: Icon, iconColor, children }) => (
    <div className={`bg-card rounded-xl border-t-4 ${color} shadow-lg p-6 bg-slate-900/40`}>
        <div className="flex items-center gap-3 mb-4">
            <div className={`p-2 rounded-lg bg-slate-800`}>
                <Icon className={`w-5 h-5 ${iconColor}`} />
            </div>
            <div>
                <h3 className="font-bold text-lg">{title}</h3>
                <p className="text-xs text-muted-foreground">{subtitle}</p>
            </div>
        </div>
        {children}
    </div>
);

export default FabricDemo;
