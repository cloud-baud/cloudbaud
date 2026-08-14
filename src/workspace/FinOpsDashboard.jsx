import React, { useState } from 'react';
import {
    LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import {
    TrendingDown, TrendingUp, DollarSign, AlertTriangle, CheckCircle2,
    PieChart as PieIcon, LayoutDashboard, Download, Filter
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/card';
import { Button } from '@/shared/components/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/shared/components/tabs';
import { Progress } from '@/shared/components/progress';

// --- MOCK DATA ---

const trendData = [
    { name: 'Jan', actual: 45000, budget: 50000, forecast: 45000 },
    { name: 'Feb', actual: 48000, budget: 50000, forecast: 48000 },
    { name: 'Mar', actual: 52000, budget: 50000, forecast: 52000 },
    { name: 'Apr', actual: 49000, budget: 52000, forecast: 49000 },
    { name: 'May', actual: 55000, budget: 52000, forecast: 55000 },
    { name: 'Jun', actual: 42000, budget: 55000, forecast: 42000 }, // Optimization applied
    { name: 'Jul', actual: null, budget: 55000, forecast: 43000 },
    { name: 'Aug', actual: null, budget: 55000, forecast: 44000 },
];

const costByBU = [
    { name: 'Engineering', value: 18500, color: '#3b82f6' },
    { name: 'Product', value: 12000, color: '#10b981' },
    { name: 'Marketing', value: 5000, color: '#f59e0b' },
    { name: 'Data Science', value: 8500, color: '#8b5cf6' },
    { name: 'Sales', value: 3000, color: '#ec4899' },
];

const optimizationData = [
    { name: 'Idle VMs', savings: 4500, impact: 'High' },
    { name: 'Right-Sizing', savings: 3200, impact: 'Medium' },
    { name: 'Storage Tiers', savings: 1800, impact: 'Low' },
    { name: 'Orphaned Disks', savings: 900, impact: 'Low' },
    { name: 'Spot Instances', savings: 5500, impact: 'High' },
];

const topDrivers = [
    { resource: 'aks-prod-cluster-01', type: 'Kubernetes', cost: 4200, trend: '+12%' },
    { resource: 'sql-dw-analytics', type: 'Synapse SQL', cost: 3800, trend: '-5%' },
    { resource: 'vm-build-agent-pool', type: 'Virtual Machine', cost: 2100, trend: '+8%' },
    { resource: 'storage-logs-archive', type: 'Blob Storage', cost: 1500, trend: '+2%' },
    { resource: 'app-service-marketing', type: 'App Service', cost: 1200, trend: '0%' },
];

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

import PageShell from './PageShell';

const FinOpsDashboard = () => {
    const [activeTab, setActiveTab] = useState('executive');

    return (
        <PageShell
            title="FinOps Intelligence"
            subtitle="Real-time cost visibility and optimization insights."
            actions={
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="gap-2">
                        <Filter className="w-4 h-4" /> Filter
                    </Button>
                    <Button variant="outline" size="sm" className="gap-2">
                        <Download className="w-4 h-4" /> Export Report
                    </Button>
                </div>
            }
        >
            <div className="w-full bg-muted/50 p-6 rounded-xl border border-border shadow-sm">

                {/* --- EXECUTIVE SUMMARY (KPIs) --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <Card className="bg-card border-l-4 border-l-brand-blue shadow-sm">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Current Month Spend</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-foreground">$42,350</div>
                            <div className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                                <span className="text-red-500 font-medium">+5%</span> vs last month
                            </div>
                            <Progress value={78} className="h-1.5 mt-3 bg-secondary" indicatorclassname="bg-brand-blue" />
                            <div className="text-xs text-muted-foreground mt-1 text-right">78% of Budget</div>
                        </CardContent>
                    </Card>

                    <Card className="bg-card border-l-4 border-l-amber-500 shadow-sm">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Forecasted EOM</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-foreground">$54,100</div>
                            <div className="text-sm text-slate-500 mt-1 flex items-center gap-1">
                                <span className="text-green-500 font-medium">-2%</span> under budget
                            </div>
                            <div className="mt-3 flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded-md">
                                <AlertTriangle className="w-4 h-4" />
                                <span>Risk: Production DB scaling</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-card border-l-4 border-l-green-500 shadow-sm">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Savings Realized</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-foreground">$12,450</div>
                            <div className="text-sm text-slate-500 mt-1">Total YTD Optimization</div>
                            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                                <div className="bg-green-50 dark:bg-green-900/20 p-1 rounded text-center text-green-700 dark:text-green-300">
                                    <span className="block font-bold">RIs</span> $8.2k
                                </div>
                                <div className="bg-green-50 dark:bg-green-900/20 p-1 rounded text-center text-green-700 dark:text-green-300">
                                    <span className="block font-bold">Rightsizing</span> $4.2k
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-card border-l-4 border-l-purple-500 shadow-sm">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Governance Score</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-foreground">92/100</div>
                            <div className="text-sm text-muted-foreground mt-1">Policy Compliance</div>
                            <div className="w-full bg-secondary rounded-full h-2.5 mt-3">
                                <div className="bg-purple-600 h-2.5 rounded-full" style={{ width: '92%' }}></div>
                            </div>
                            <div className="text-xs text-slate-400 mt-1 flex justify-between">
                                <span>Tagging: 98%</span>
                                <span>Security: 85%</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* --- MAIN TABS --- */}
                <Tabs defaultValue="overview" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="optimization">Optimization</TabsTrigger>
                        <TabsTrigger value="drilldown">Cost Drilldown</TabsTrigger>
                    </TabsList>

                    {/* TAB: OVERVIEW */}
                    <TabsContent value="overview" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Cost Trend Chart */}
                            <Card className="lg:col-span-2 bg-card shadow-sm">
                                <CardHeader>
                                    <CardTitle>Cost Trend Analysis</CardTitle>
                                    <CardDescription>Actual spend vs Budget & Forecast (6 Month View)</CardDescription>
                                </CardHeader>
                                <CardContent className="h-[300px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={trendData}>
                                            <defs>
                                                <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} tickFormatter={(value) => `$${value / 1000}k`} />
                                            <Tooltip
                                                contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                                                formatter={(value) => [`$${value}`, 'Amount']}
                                            />
                                            <Legend />
                                            <Area type="monotone" dataKey="actual" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorActual)" name="Actual Spend" />
                                            <Line type="dashed" dataKey="budget" stroke="#94a3b8" strokeWidth={2} name="Budget" dot={false} />
                                            <Line type="monotone" dataKey="forecast" stroke="#f59e0b" strokeWidth={2} strokeDasharray="5 5" name="Forecast" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>

                            {/* Cost by Business Unit */}
                            <Card className="bg-card shadow-sm">
                                <CardHeader>
                                    <CardTitle>Spend by Business Unit</CardTitle>
                                    <CardDescription>Current Month Allocation</CardDescription>
                                </CardHeader>
                                <CardContent className="h-[300px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={costByBU}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={90}
                                                paddingAngle={5}
                                                dataKey="value"
                                            >
                                                {costByBU.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip formatter={(value) => `$${value}`} />
                                            <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Top Drivers Table */}
                        <Card className="bg-card shadow-sm">
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle>Top Cost Drivers</CardTitle>
                                    <CardDescription>Resources with highest m/m variance</CardDescription>
                                </div>
                                <Button variant="ghost" className="text-brand-blue text-sm">View All</Button>
                            </CardHeader>
                            <CardContent>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left">
                                        <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                                            <tr>
                                                <th className="px-4 py-3 rounded-l-lg">Resource Name</th>
                                                <th className="px-4 py-3">Type</th>
                                                <th className="px-4 py-3">Cost (MTD)</th>
                                                <th className="px-4 py-3 rounded-r-lg">Trend</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                            {topDrivers.map((driver, idx) => (
                                                <tr key={idx} className="hover:bg-muted/50 transition-colors">
                                                    <td className="px-4 py-3 font-medium text-foreground">{driver.resource}</td>
                                                    <td className="px-4 py-3 text-muted-foreground">{driver.type}</td>
                                                    <td className="px-4 py-3 font-mono text-foreground">${driver.cost}</td>
                                                    <td className="px-4 py-3">
                                                        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${driver.trend.startsWith('+')
                                                            ? 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                                                            : 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                                                            }`}>
                                                            {driver.trend.startsWith('+') ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                                                            {driver.trend}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* TAB: OPTIMIZATION */}
                    <TabsContent value="optimization" className="space-y-6 animate-in fade-in slide-in-from-right-2 duration-300">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Card className="bg-card shadow-sm border-l-4 border-l-green-500">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                                        Recommendation Summary
                                    </CardTitle>
                                    <CardDescription>Potential Monthly Savings: <span className="text-foreground font-bold">$15,900</span></CardDescription>
                                </CardHeader>
                                <CardContent className="h-[350px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart layout="vertical" data={optimizationData} margin={{ left: 20 }}>
                                            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0" />
                                            <XAxis type="number" hide />
                                            <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12 }} />
                                            <Tooltip cursor={{ fill: 'transparent' }} formatter={(value) => `$${value}`} />
                                            <Bar dataKey="savings" fill="#10b981" radius={[0, 4, 4, 0]} barSize={20}>
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>

                            <div className="space-y-4">
                                {optimizationData.map((item, i) => (
                                    <Card key={i} className="hover:border-brand-blue transition-colors cursor-pointer">
                                        <CardContent className="p-4 flex items-center justify-between">
                                            <div className="flex items-start gap-3">
                                                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600">
                                                    <DollarSign className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold text-slate-900 dark:text-white">{item.name}</h4>
                                                    <p className="text-sm text-slate-500">
                                                        {item.name === 'Idle VMs' ? 'Shutdown 5 unused instances' :
                                                            item.name === 'Right-Sizing' ? 'Resize 12 underutilized VMs' :
                                                                item.name === 'Spot Instances' ? 'Migrate batch workloads to Spot' : 'Cleanup unattached resources'}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-bold text-green-600 dark:text-green-400">${item.savings}</div>
                                                <div className="text-xs text-slate-400">/month</div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                                <Button className="w-full bg-brand-blue hover:bg-brand-blue/90 text-black">
                                    Auto-Apply High Impact Fixes
                                </Button>
                            </div>
                        </div>
                    </TabsContent>

                    {/* TAB: DRILLDOWN (Placeholder) */}
                    <TabsContent value="drilldown" className="space-y-6 animate-in fade-in slide-in-from-right-2 duration-300">
                        <Card className="bg-muted/50 border-dashed border-2 border-border min-h-[300px] flex items-center justify-center">
                            <div className="text-center">
                                <Filter className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-foreground">Detailed Transaction Logs</h3>
                                <p className="text-muted-foreground max-w-sm mx-auto mt-2">
                                    Use the filters above to drill down into specific resource groups, tags, or subscription IDs.
                                </p>
                                <Button variant="outline" className="mt-4">
                                    Configure Filters
                                </Button>
                            </div>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </PageShell>
    );
};

export default FinOpsDashboard;
