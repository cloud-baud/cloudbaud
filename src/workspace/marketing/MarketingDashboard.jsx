
import React, { useState } from 'react';
import {
  LayoutDashboard, 
  Megaphone, 
  Target, 
  Mail, 
  Share2, 
  BarChart, 
  Search, 
  Settings, 
  RefreshCw, 
  ChevronDown, 
  ArrowUpRight,
  TrendingUp,
  Users,
  Layers,
  FileEdit,
  CheckCircle,
  Globe,
  Filter,
  Plus
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart as RechartsBarChart,
  Bar,
  Legend
} from 'recharts';
import { cn } from '@/lib/utils';
import { Button } from '@/shared/components/button';
import { Input } from '@/shared/components/input';
import { Badge } from '@/shared/components/badge';

/* --- CMS / Publishing View (The ECM Engine) --- */
const CmsPublishingView = () => (
    <div className="space-y-6">
        <div className="flex items-center justify-between">
            <div>
                <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Content Staging Area</h2>
                <p className="text-sm text-slate-500">Manage the lifecycle of public assets from Draft to Production.</p>
            </div>
            <div className="flex gap-2">
                <Button variant="outline" size="sm"><Filter className="w-4 h-4 mr-2" /> Filter</Button>
                <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-white"><Plus className="w-4 h-4 mr-2" /> Create Content</Button>
            </div>
        </div>

        {/* Pipeline Layout (Kitchen -> Pass -> Restaurant) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-280px)] min-h-[500px]">
            
            {/* COLUMN 1: DRAFTS (The Kitchen) */}
            <CmsColumn 
                title="Drafts & Concepts" 
                count={3} 
                icon={FileEdit}
                color="bg-slate-100 dark:bg-slate-800"
                borderColor="border-slate-200 dark:border-slate-700"
            >
                 <CmsCard 
                    title="Healthcare AI V2" 
                    type="Case Study"
                    author="Jishnu N." 
                    updated="2h ago"
                    status="Draft"
                />
                 <CmsCard 
                    title="Fabric ETL Demo Script" 
                    type="Technical Asset"
                    author="Consulting Team" 
                    updated="1d ago"
                    status="Raw"
                />
                <CmsCard 
                    title="Q1 Financial Report" 
                    type="Blog Post"
                    author="Finance Ops" 
                    updated="3d ago"
                    status="Draft"
                />
            </CmsColumn>

            {/* COLUMN 2: STAGING (The Pass) */}
            <CmsColumn 
                title="Staging & Review" 
                count={2} 
                icon={CheckCircle}
                color="bg-indigo-50/50 dark:bg-indigo-900/10"
                borderColor="border-indigo-200 dark:border-indigo-800"
            >
                 <CmsCard 
                    title="Supply Chain IoT Map" 
                    type="Interactive Demo"
                    author="Marketing" 
                    updated="5h ago"
                    status="Review"
                    badge="Needs Approval"
                />
                 <CmsCard 
                    title="Azure Migration Guide" 
                    type="Whitepaper (Gated)"
                    author="Jishnu N." 
                    updated="2d ago"
                    status="Staged"
                />
            </CmsColumn>

            {/* COLUMN 3: LIVE (The Restaurant) */}
            <CmsColumn 
                title="Production (Live)" 
                count={6} 
                icon={Globe}
                color="bg-emerald-50/50 dark:bg-emerald-900/10"
                borderColor="border-emerald-200 dark:border-emerald-800"
            >
                {[
                    'Algorithmic Risk Platform',
                    'HIPAA Data Lake',
                    'Education LMS Scale',
                    'GovTech Portal'
                ].map((item, i) => (
                     <CmsCard 
                        key={i}
                        title={item}
                        type="Public Portfolio"
                        author="System" 
                        updated="Live"
                        status="Published"
                        isLive
                    />
                ))}
            </CmsColumn>

        </div>
    </div>
);

const CmsColumn = ({ title, count, icon: Icon, children, color, borderColor }) => (
    <div className={`flex flex-col rounded-xl border ${borderColor} ${color} h-full`}>
        <div className="p-4 border-b border-inherit flex items-center justify-between">
            <h3 className="font-semibold flex items-center gap-2 text-slate-800 dark:text-slate-100">
                <Icon className="w-4 h-4" /> {title}
            </h3>
            <Badge variant="secondary" className="bg-white/50 dark:bg-black/20">{count}</Badge>
        </div>
        <div className="p-4 flex-1 overflow-y-auto space-y-3">
            {children}
        </div>
    </div>
);

const CmsCard = ({ title, type, author, updated, status, badge, isLive }) => (
    <div className="group bg-white dark:bg-[#1a1a1a] p-3 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all cursor-move">
        <div className="flex justify-between items-start mb-2">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">{type}</span>
            {isLive ? (
                <div className="flex items-center gap-1 text-[10px] text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-1.5 py-0.5 rounded font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live
                </div>
            ) : (
                <MoreHorizontal className="w-4 h-4 text-slate-300 hover:text-slate-600" />
            )}
        </div>
        <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-1 group-hover:text-purple-600 transition-colors">{title}</h4>
        
        {badge && (
            <Badge variant="outline" className="text-[10px] h-5 px-1.5 mb-2 border-amber-200 bg-amber-50 text-amber-700">
                {badge}
            </Badge>
        )}

        <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-50 dark:border-slate-800">
            <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-[9px] font-bold text-slate-500">
                    {author.charAt(0)}
                </div>
                <span className="text-xs text-slate-500">{author}</span>
            </div>
            <span className="text-[10px] text-slate-400">{updated}</span>
        </div>
    </div>
);

const TABS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'cms', label: 'Content CMS', icon: Layers }, 
  { id: 'campaigns', label: 'Campaigns', icon: Megaphone },
  { id: 'leads', label: 'Leads', icon: Target },
  { id: 'email', label: 'Email', icon: Mail },
  { id: 'social', label: 'Social', icon: Share2 },
  { id: 'analytics', label: 'Analytics', icon: BarChart },
];

const COLORS = ['#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#6366f1'];

const MarketingDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="flex flex-col h-full bg-[#f3f4f6] dark:bg-[#0f0f0f] text-slate-900 dark:text-slate-100 font-sans">
      {/* Marketing Cloud Header */}
      <div className="bg-white dark:bg-[#1a1a1a] border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10">
        <div className="flex items-center px-4 h-12 shadow-sm relative">
          {/* Brand */}
          <div className="flex items-center gap-3 mr-6">
            <div className="w-8 h-8 bg-purple-600 rounded-md flex items-center justify-center text-white shadow-sm shadow-purple-500/20">
              <Megaphone className="w-5 h-5" />
            </div>
            <span className="font-semibold text-lg tracking-tight hidden md:block text-slate-800 dark:text-slate-100">
              Marketing Cloud
            </span>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1 h-full overflow-x-auto no-scrollbar">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex items-center gap-2 px-3 h-full border-b-2 text-sm font-medium transition-all whitespace-nowrap",
                    isActive 
                      ? "border-purple-600 text-purple-600" 
                      : "border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5"
                  )}
                >
                  <Icon className={cn("w-4 h-4", isActive ? "text-purple-600" : "text-slate-400")} />
                  {tab.label}
                </button>
              );
            })}
          </nav>

          {/* Global Actions */}
          <div className="ml-auto flex items-center gap-2">
            <div className="relative w-48 hidden lg:block">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search Campaigns..." 
                className="w-full h-8 pl-8 pr-3 bg-slate-50 dark:bg-[#252525] border border-slate-200 dark:border-slate-700 rounded text-xs focus:outline-none focus:ring-1 focus:ring-purple-600"
              />
            </div>
            <Button className="h-8 bg-purple-600 hover:bg-purple-700 text-white shadow-sm gap-2">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Create Campaign</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto p-4 lg:p-6 bg-slate-50 dark:bg-[#0f0f0f]">
        {activeTab === 'overview' && <OverviewView />}
        {activeTab === 'cms' && <CmsPublishingView />}
        {activeTab === 'campaigns' && <CampaignsView />}
        {activeTab !== 'overview' && activeTab !== 'cms' && activeTab !== 'campaigns' && (
          <div className="flex flex-col items-center justify-center h-[400px] text-slate-500">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
              <Settings className="w-8 h-8 opacity-50" />
            </div>
            <h3 className="text-lg font-medium mb-1">Under Construction</h3>
            <p className="text-sm">The {activeTab} module is coming soon.</p>
          </div>
        )}
      </div>
    </div>
  );
};

/* --- Sub Components --- */

const OverviewView = () => (
  <div className="space-y-6 max-w-7xl mx-auto">
    {/* KPI Cards */}
    {/* Compact Ticker Style KPIs */}
    <div className="flex items-center gap-4 mb-6 overflow-x-auto pb-1 scrollbar-hide">
      <CompactStatCard label="Active Campaigns" value="12" icon={Megaphone} color="text-purple-600" />
      <div className="h-6 w-px bg-border/60 shrink-0 hidden md:block" />
      <CompactStatCard label="Total MQLs" value="1,240" icon={Users} color="text-blue-500" />
      <div className="h-6 w-px bg-border/60 shrink-0 hidden md:block" />
      <CompactStatCard label="Avg. Click Rate" value="3.2%" icon={Target} color="text-pink-500" />
      <div className="h-6 w-px bg-border/60 shrink-0 hidden md:block" />
      <CompactStatCard label="Marketing ROI" value="285%" icon={TrendingUp} color="text-emerald-500" />
    </div>

    {/* Charts Row */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 bg-white dark:bg-[#1a1a1a] p-5 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
        <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-6">Lead Generation Trend</h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={[
              { name: 'Jan', value: 400 }, { name: 'Feb', value: 300 }, { name: 'Mar', value: 550 },
              { name: 'Apr', value: 480 }, { name: 'May', value: 690 }, { name: 'Jun', value: 800 },
            ]}>
              <defs>
                <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
              <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
              <Tooltip contentStyle={{ borderRadius: '8px', border: 'none' }} cursor={{ stroke: '#8b5cf6' }} />
              <Area type="monotone" dataKey="value" stroke="#8b5cf6" strokeWidth={2} fillOpacity={1} fill="url(#colorLeads)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white dark:bg-[#1a1a1a] p-5 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
        <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-6">Campaign Performance</h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RechartsBarChart layout="vertical" data={[
              { name: 'Spring Promo', value: 85 },
              { name: 'Webinar Series', value: 65 },
              { name: 'Product Launch', value: 92 },
              { name: 'Newsletter', value: 45 },
            ]}>
              <XAxis type="number" hide />
              <YAxis dataKey="name" type="category" width={100} axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
              <Tooltip cursor={{fill: 'transparent'}} />
              <Bar dataKey="value" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={20} />
            </RechartsBarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  </div>
);


const CompactStatCard = ({ label, value, icon: LucideIcon, color = "text-brand-blue" }) => (
  <div className="flex items-center gap-3 px-3 py-1.5 rounded-lg bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-slate-800 shadow-sm min-w-fit">
      <div className={`p-1 rounded-md bg-slate-100 dark:bg-slate-800 ${color}`}>
          <LucideIcon className="size-3.5" />
      </div>
      <div className="flex items-baseline gap-2">
          <span className="text-sm font-bold text-slate-900 dark:text-white">{value}</span>
          <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">{label}</span>
      </div>
  </div>
);

const CampaignsView = () => (
  <div className="space-y-4 max-w-[1600px] mx-auto">
    <div className="bg-white dark:bg-[#1a1a1a] rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      <table className="w-full text-sm text-left">
        <thead className="text-xs text-slate-500 bg-slate-50 dark:bg-slate-900/50 uppercase border-b border-slate-200 dark:border-slate-800">
          <tr>
            <th className="px-6 py-3">Campaign Name</th>
            <th className="px-6 py-3">Status</th>
            <th className="px-6 py-3">Type</th>
            <th className="px-6 py-3">Start Date</th>
            <th className="px-6 py-3">Budget</th>
            <th className="px-6 py-3">ROI</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {[
            { name: 'Q1 Product Launch', status: 'Active', type: 'Email', date: 'Jan 15, 2024', budget: '$5,000', roi: '340%' },
            { name: 'Spring Webinar Series', status: 'Scheduled', type: 'Event', date: 'Mar 01, 2024', budget: '$2,500', roi: '-' },
            { name: 'LinkedIn Brand Awareness', status: 'Active', type: 'Social', date: 'Feb 10, 2024', budget: '$12,000', roi: '180%' },
            { name: 'Customer Retargeting', status: 'Paused', type: 'Ads', date: 'Jan 05, 2024', budget: '$3,500', roi: '210%' },
          ].map((camp, idx) => (
            <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
              <td className="px-6 py-4 font-medium text-purple-600 hover:underline cursor-pointer">{camp.name}</td>
              <td className="px-6 py-4"><Badge variant="outline" className={cn(camp.status === 'Active' ? 'bg-green-50 text-green-700 border-green-200' : 'text-slate-500')}>{camp.status}</Badge></td>
              <td className="px-6 py-4">{camp.type}</td>
              <td className="px-6 py-4 text-slate-500">{camp.date}</td>
              <td className="px-6 py-4">{camp.budget}</td>
              <td className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">{camp.roi}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export default MarketingDashboard;
