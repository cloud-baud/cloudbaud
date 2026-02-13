
import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  TrendingUp, 
  Briefcase, 
  CheckCircle, 
  Phone, 
  Calendar, 
  BarChart2,
  Plus, 
  Search, 
  Settings, 
  Filter, 
  Users,
  DollarSign
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  Cell
} from 'recharts';
import { cn } from '@/lib/utils';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Badge } from '@/shared/ui/badge';

const TABS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'opportunities', label: 'Opportunities', icon: Briefcase },
  { id: 'tasks', label: 'My Tasks', icon: CheckCircle },
  { id: 'calls', label: 'Calls', icon: Phone },
  { id: 'forecast', label: 'Forecast', icon: TrendingUp },
];

const SalesDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="flex flex-col h-full bg-[#f3f4f6] dark:bg-[#0f0f0f] text-slate-900 dark:text-slate-100 font-sans">
      {/* Sales Cloud Header */}
      <div className="bg-white dark:bg-[#1a1a1a] border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10">
        <div className="flex items-center px-4 h-12 shadow-sm relative">
          {/* Brand */}
          <div className="flex items-center gap-3 mr-6">
            <div className="w-8 h-8 bg-emerald-600 rounded-md flex items-center justify-center text-white shadow-sm shadow-emerald-500/20">
              <DollarSign className="w-5 h-5" />
            </div>
            <span className="font-semibold text-lg tracking-tight hidden md:block text-slate-800 dark:text-slate-100">
              Sales Cloud
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
                      ? "border-emerald-600 text-emerald-600" 
                      : "border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5"
                  )}
                >
                  <Icon className={cn("w-4 h-4", isActive ? "text-emerald-600" : "text-slate-400")} />
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
                placeholder="Search Deals..." 
                className="w-full h-8 pl-8 pr-3 bg-slate-50 dark:bg-[#252525] border border-slate-200 dark:border-slate-700 rounded text-xs focus:outline-none focus:ring-1 focus:ring-emerald-600"
              />
            </div>
            <Button className="h-8 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm gap-2">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">New Deal</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto p-4 lg:p-6 bg-slate-50 dark:bg-[#0f0f0f]">
        {activeTab === 'overview' && <SalesOverview />}
        {activeTab === 'opportunities' && <OpportunitiesView />}
        {activeTab === 'forecast' && <ForecastView />}
        {activeTab !== 'overview' && activeTab !== 'opportunities' && activeTab !== 'forecast' && (
          <div className="flex flex-col items-center justify-center h-[400px] text-slate-500">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
              <Settings className="w-8 h-8 opacity-50" />
            </div>
            <h3 className="text-lg font-medium mb-1">Coming Soon</h3>
            <p className="text-sm">The {activeTab} view is under development.</p>
          </div>
        )}
      </div>
    </div>
  );
};

/* --- Sub Components --- */

const SalesOverview = () => (
  <div className="space-y-6 max-w-7xl mx-auto">
    {/* KPI Cards */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <KPICard label="Closed Revenue" value="$450k" change="+12%" type="positive" />
      <KPICard label="Open Pipeline" value="$2.1M" change="+5%" type="positive" />
      <KPICard label="Win Rate" value="32%" change="-1.5%" type="negative" />
      <KPICard label="Avg. Deal Size" value="$18.5k" change="+3%" type="positive" />
    </div>

    {/* Charts Row */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 bg-white dark:bg-[#1a1a1a] p-5 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
        <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-6">Revenue Forecast vs Target</h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={[
              { name: 'Q1', target: 500, actual: 450 },
              { name: 'Q2', target: 600, actual: 620 },
              { name: 'Q3', target: 750, actual: 500 },
              { name: 'Q4', target: 900, actual: null },
            ]}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
              <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
              <Tooltip cursor={{fill: 'transparent'}} />
              <Bar dataKey="actual" fill="#10b981" radius={[4, 4, 0, 0]} barSize={40} name="Actual" />
              <Bar dataKey="target" fill="#e2e8f0" radius={[4, 4, 0, 0]} barSize={40} name="Target" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white dark:bg-[#1a1a1a] p-5 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
        <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-6">Leaderboard</h3>
        <div className="space-y-4">
          {[
            { name: 'Sarah J.', amount: '$125k', percent: 85 },
            { name: 'Mike T.', amount: '$98k', percent: 65 },
            { name: 'Jessica L.', amount: '$145k', percent: 92 },
            { name: 'David R.', amount: '$45k', percent: 30 },
          ].map((rep, idx) => (
            <div key={idx} className="flex items-center gap-3">
               <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-300">
                 {rep.name.charAt(0)}
               </div>
               <div className="flex-1">
                 <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-slate-700 dark:text-slate-200">{rep.name}</span>
                    <span className="font-bold text-slate-900 dark:text-white">{rep.amount}</span>
                 </div>
                 <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${rep.percent}%` }} />
                 </div>
               </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const KPICard = ({ label, value, change, type }) => (
  <div className="bg-white dark:bg-[#1a1a1a] p-4 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
    <div className="absolute top-0 left-0 w-1 h-full bg-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity" />
    <div className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{label}</div>
    <div className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{value}</div>
    <div className={cn("text-xs font-semibold flex items-center gap-1", type === 'positive' ? 'text-green-600' : 'text-red-500')}>
      {type === 'positive' ? <ArrowUpRight className="h-3 w-3" /> : <ArrowUpRight className="h-3 w-3 rotate-180" />}
      {change} <span className="text-slate-400 font-normal">vs last quarter</span>
    </div>
  </div>
);

const OpportunitiesView = () => (
  <div className="space-y-4 max-w-[1600px] mx-auto">
    <div className="bg-white dark:bg-[#1a1a1a] rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      <table className="w-full text-sm text-left">
        <thead className="text-xs text-slate-500 bg-slate-50 dark:bg-slate-900/50 uppercase border-b border-slate-200 dark:border-slate-800">
          <tr>
            <th className="px-6 py-3">Opportunity Name</th>
            <th className="px-6 py-3">Account</th>
            <th className="px-6 py-3">Stage</th>
            <th className="px-6 py-3">Amount</th>
            <th className="px-6 py-3">Close Date</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {[
            { name: 'Acme Corp Renewal', account: 'Acme Corp', stage: 'Negotiation', amount: '$120,000', date: 'Feb 28, 2024' },
            { name: 'Global Tech Expansion', account: 'Global Tech', stage: 'Proposal', amount: '$450,000', date: 'Mar 15, 2024' },
            { name: 'StartUp Inc Seed', account: 'StartUp Inc', stage: 'Discovery', amount: '$25,000', date: 'Feb 10, 2024' },
          ].map((op, idx) => (
            <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
              <td className="px-6 py-4 font-medium text-emerald-600 hover:underline cursor-pointer">{op.name}</td>
              <td className="px-6 py-4">{op.account}</td>
              <td className="px-6 py-4"><Badge variant="outline" className="border-emerald-200 text-emerald-700 bg-emerald-50">{op.stage}</Badge></td>
              <td className="px-6 py-4 font-semibold">{op.amount}</td>
              <td className="px-6 py-4 text-slate-500">{op.date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const ForecastView = () => (
    <div className="flex items-center justify-center p-12 text-slate-500 bg-white dark:bg-[#1a1a1a] rounded-lg border border-dashed border-slate-300 dark:border-slate-700">
        <div className="text-center">
            <TrendingUp className="w-12 h-12 mx-auto mb-4 text-slate-300" />
            <h3 className="text-lg font-medium">Forecast Module</h3>
            <p className="text-sm max-w-md mt-2">Advanced forecasting with AI prediction is currently being configured.</p>
        </div>
    </div>
);

export default SalesDashboard;
