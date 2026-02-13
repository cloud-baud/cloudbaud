
import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Megaphone, 
  Target, 
  Mail, 
  Share2, 
  BarChart, 
  Plus, 
  Search, 
  Settings, 
  Filter, 
  RefreshCw, 
  ChevronDown, 
  ArrowUpRight,
  TrendingUp,
  Users
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
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Badge } from '@/shared/ui/badge';

const TABS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
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
        {activeTab === 'campaigns' && <CampaignsView />}
        {activeTab !== 'overview' && activeTab !== 'campaigns' && (
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <KPICard label="Active Campaigns" value="12" change="+2" type="positive" />
      <KPICard label="Total Leads (MQL)" value="1,240" change="+15%" type="positive" />
      <KPICard label="Avg. Click Rate" value="3.2%" change="-0.4%" type="negative" />
      <KPICard label="Marketing ROI" value="285%" change="+12%" type="positive" />
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

const KPICard = ({ label, value, change, type }) => (
  <div className="bg-white dark:bg-[#1a1a1a] p-4 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
    <div className="absolute top-0 left-0 w-1 h-full bg-purple-600 opacity-0 group-hover:opacity-100 transition-opacity" />
    <div className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{label}</div>
    <div className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{value}</div>
    <div className={cn("text-xs font-semibold flex items-center gap-1", type === 'positive' ? 'text-green-600' : 'text-red-500')}>
      {type === 'positive' ? <ArrowUpRight className="h-3 w-3" /> : <ArrowUpRight className="h-3 w-3 rotate-180" />}
      {change} <span className="text-slate-400 font-normal">vs last month</span>
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
