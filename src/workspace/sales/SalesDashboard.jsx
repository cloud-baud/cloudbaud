
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
  DollarSign,
  GitMerge
} from 'lucide-react';
import SalesPipelineView from './SalesPipelineView';
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
import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Badge } from '@/shared/ui/badge';

const TABS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'pipeline', label: 'Pipeline', icon: GitMerge, highlight: true },
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
                    "flex items-center gap-2 px-3 h-full border-b-2 text-sm font-medium transition-all whitespace-nowrap relative",
                    isActive 
                      ? "border-emerald-600 text-emerald-600" 
                      : "border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5"
                  )}
                >
                  <Icon className={cn("w-4 h-4", isActive ? "text-emerald-600" : "text-slate-400")} />
                  {tab.label}
                  {tab.highlight && !isActive && (
                    <span className="absolute top-1.5 right-1 w-1.5 h-1.5 bg-amber-400 rounded-full" />
                  )}
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
      <div className={cn(
        "flex-1 overflow-auto bg-slate-50 dark:bg-[#0f0f0f]",
        activeTab === 'pipeline' ? '' : 'p-4 lg:p-6'
      )}>
        {activeTab === 'overview' && <SalesOverview />}
        {activeTab === 'pipeline' && <SalesPipelineView />}
        {activeTab === 'opportunities' && <OpportunitiesView />}
        {activeTab === 'forecast' && <ForecastView />}
        {activeTab !== 'overview' && activeTab !== 'pipeline' && activeTab !== 'opportunities' && activeTab !== 'forecast' && (
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
    {/* Compact Ticker Style KPIs */}
    <div className="flex items-center gap-4 mb-6 overflow-x-auto pb-1 scrollbar-hide">
      <CompactStatCard label="Pipeline" value="$2.1M" icon={Briefcase} color="text-brand-blue" />
      <div className="h-6 w-px bg-border/60 shrink-0 hidden md:block" />
      <CompactStatCard label="Win Rate" value="32%" icon={CheckCircle} color="text-emerald-500" />
      <div className="h-6 w-px bg-border/60 shrink-0 hidden md:block" />
      <CompactStatCard label="Avg. Deal" value="$18.5k" icon={DollarSign} color="text-amber-500" />
      <div className="h-6 w-px bg-border/60 shrink-0 hidden md:block" />
      <CompactStatCard label="Forecast" value="$450k" icon={TrendingUp} color="text-purple-500" />
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

const OpportunitiesView = () => (
  <div className="h-full overflow-x-auto pb-4">
    <div className="flex gap-4 min-w-[1200px] h-full">
      {/* Column: Qualification */}
      <KanbanColumn title="Qualification" count={3} total="$145k">
        <KanbanCard title="Acme Corp Renewal" value="$120k" company="Acme Corp" days="12 days" color="bg-blue-500" />
        <KanbanCard title="StartUp Expansion" value="$25k" company="StartUp Inc" days="2 days" color="bg-blue-500" />
      </KanbanColumn>
      
      {/* Column: Probable */}
      <KanbanColumn title="Probable (60%)" count={2} total="$450k">
        <KanbanCard title="Global Tech Deal" value="$450k" company="Global Tech" days="5 days" color="bg-amber-500" />
        <KanbanCard title="Logistics Upgrade" value="$80k" company="FastShip LLC" days="8 days" color="bg-amber-500" />
      </KanbanColumn>

      {/* Column: Negotiation */}
      <KanbanColumn title="Negotiation" count={1} total="$120k">
         <KanbanCard title="Enterprise License" value="$120k" company="BigBank Corp" days="15 days" color="bg-purple-500" />
      </KanbanColumn>

      {/* Column: Closed Won */}
      <KanbanColumn title="Closed Won" count={5} total="$850k">
        <KanbanCard title="Q1 Service Contract" value="$200k" company="RetailGiant" days="Closed" color="bg-emerald-500" />
      </KanbanColumn>
    </div>
  </div>
);

const KanbanColumn = ({ title, count, total, children }) => (
  <div className="flex-1 min-w-[280px] bg-slate-100 dark:bg-[#1a1a1a]/50 rounded-lg p-3 flex flex-col h-full border border-slate-200 dark:border-slate-800">
    <div className="flex items-center justify-between mb-3 px-1">
      <div className="flex items-center gap-2">
        <h3 className="font-semibold text-sm text-slate-700 dark:text-slate-300">{title}</h3>
        <span className="bg-white dark:bg-slate-800 text-xs px-2 py-0.5 rounded-full text-slate-500 font-medium border border-slate-200 dark:border-slate-700">{count}</span>
      </div>
      <span className="text-xs font-mono text-slate-500">{total}</span>
    </div>
    <div className="flex-1 space-y-3 overflow-y-auto pr-1">
      {children}
    </div>
  </div>
);

const KanbanCard = ({ title, value, company, days, color }) => (
  <div className="bg-white dark:bg-[#1a1a1a] p-3 rounded-md border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing border-l-4" style={{ borderLeftColor: 'transparent' }}>
    <div className="flex justify-between items-start mb-2">
       <div className={`w-8 h-1 rounded-full ${color} mb-2`}></div>
       <span className="text-[10px] text-slate-400 font-medium px-1.5 py-0.5 bg-slate-50 dark:bg-slate-800 rounded">{days}</span>
    </div>
    <h4 className="font-medium text-sm text-slate-900 dark:text-slate-100 mb-0.5">{title}</h4>
    <p className="text-xs text-slate-500 mb-2">{company}</p>
    <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
      <span className="font-bold text-sm text-slate-700 dark:text-slate-300">{value}</span>
      <div className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-500">
          {company.charAt(0)}
      </div>
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
