import React from 'react';
import {
    LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, ReferenceLine
} from 'recharts';
import { Activity, Server, DollarSign, ShieldCheck, Zap, Database } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/ui/card';

const dataPerformance = [
    { time: '00:00', jobs: 240, latency: 45 },
    { time: '04:00', jobs: 180, latency: 42 },
    { time: '08:00', jobs: 890, latency: 55 },
    { time: '12:00', jobs: 1200, latency: 68 },
    { time: '16:00', jobs: 950, latency: 50 },
    { time: '20:00', jobs: 400, latency: 40 },
    { time: '23:59', jobs: 200, latency: 38 },
];

const dataCost = [
    { month: 'Jan', usage: 100, cost: 100 },
    { month: 'Feb', usage: 120, cost: 105 },
    { month: 'Mar', usage: 150, cost: 110 },
    { month: 'Apr', usage: 180, cost: 115 },
    { month: 'May', usage: 220, cost: 90 }, // Optimization kicks in
    { month: 'Jun', usage: 250, cost: 85 },
];

const PlatformDashboard = () => {
    return (
        <div className="w-full space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-400">
                            Platform Uptime
                        </CardTitle>
                        <Activity className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-emerald-500">99.99%</div>
                        <p className="text-xs text-slate-500">+120 days without incident</p>
                    </CardContent>
                </Card>
                <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-400">
                            Active Clusters
                        </CardTitle>
                        <Server className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-500">24/32</div>
                        <p className="text-xs text-slate-500">Auto-scaling enabled</p>
                    </CardContent>
                </Card>
                <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-400">
                            Monthly Savings
                        </CardTitle>
                        <DollarSign className="h-4 w-4 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-amber-500">$12.5k</div>
                        <p className="text-xs text-slate-500">-22% vs forecasted</p>
                    </CardContent>
                </Card>
                <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-400">
                            Governance Score
                        </CardTitle>
                        <ShieldCheck className="h-4 w-4 text-indigo-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-indigo-500">98/100</div>
                        <p className="text-xs text-slate-500">Unity Catalog Enforced</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-slate-900/40 border-slate-800">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-foreground">
                            <Zap className="h-5 w-5 text-yellow-500" />
                            Job Performance & Latency
                        </CardTitle>
                        <CardDescription>Real-time monitoring of Spark jobs vs execution time</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={dataPerformance}>
                                <defs>
                                    <linearGradient id="colorJobs" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                                <XAxis dataKey="time" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                                    itemStyle={{ color: '#e2e8f0' }}
                                />
                                <Area type="monotone" dataKey="jobs" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorJobs)" />
                                <Line type="monotone" dataKey="latency" stroke="#f43f5e" strokeWidth={2} dot={false} strokeDasharray="5 5" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card className="bg-slate-900/40 border-slate-800">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-foreground">
                            <Database className="h-5 w-5 text-emerald-500" />
                            Cost Optimization Impact
                        </CardTitle>
                        <CardDescription>Separating compute usage from cost via spot instances & strict auto-termination</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={dataCost}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip
                                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                                    itemStyle={{ color: '#e2e8f0' }}
                                />
                                <Legend />
                                <Bar dataKey="usage" name="Compute Usage" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="cost" name="Incurred Cost" fill="#10b981" radius={[4, 4, 0, 0]} />
                                <ReferenceLine x="May" stroke="#ef4444" label={{ value: 'Optimization', fill: '#ef4444', fontSize: 12 }} strokeDasharray="3 3" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default PlatformDashboard;

