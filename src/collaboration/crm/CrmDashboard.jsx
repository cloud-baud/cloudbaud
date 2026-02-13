
import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Briefcase, 
  Building2, 
  Calendar, 
  Settings, 
  Plus, 
  Search, 
  Filter, 
  ChevronDown, 
  MoreHorizontal,
  ArrowUpRight,
  RefreshCw,
  Download,
  Trash2,
  Edit,
  Eye,
  CheckCircle2,
  AlertCircle,
  Clock,
  Menu
} from 'lucide-react';
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
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';
import { leads, accounts, opportunities, contacts, dashboardMetrics } from './mockData';
import { cn } from '@/lib/utils';
import { Separator } from '@/shared/ui/separator';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Badge } from '@/shared/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/shared/ui/dropdown-menu';

const TABS = [
  { id: 'home', label: 'Home', icon: LayoutDashboard },
  { id: 'leads', label: 'Leads', icon: Users },
  { id: 'accounts', label: 'Accounts', icon: Building2 },
  { id: 'contacts', label: 'Contacts', icon: Users },
  { id: 'opportunities', label: 'Opportunities', icon: Briefcase },
  { id: 'calendar', label: 'Calendar', icon: Calendar },
  { id: 'reports', label: 'Reports', icon: BarChart },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const CrmDashboard = () => {
  const [activeTab, setActiveTab] = useState('home');

  return (
    <div className="flex flex-col h-full bg-[#f3f4f6] dark:bg-[#0f0f0f] text-slate-900 dark:text-slate-100 font-sans">
      {/* CRM App Header (Salesforce Style) */}
      <div className="bg-white dark:bg-[#1a1a1a] border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10">
        <div className="flex items-center px-4 h-12 shadow-sm relative">
          {/* App Launcher / Brand */}
          <div className="flex items-center gap-3 mr-6">
            <div className="w-8 h-8 bg-[#0176D3] rounded-md flex items-center justify-center text-white shadow-sm shadow-blue-500/20">
              <span className="font-bold text-xs tracking-tighter">CRM</span>
            </div>
            <span className="font-semibold text-lg tracking-tight hidden md:block text-slate-800 dark:text-slate-100">
              Customer Database
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
                      ? "border-[#0176D3] text-[#0176D3]" 
                      : "border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5"
                  )}
                >
                  <Icon className={cn("w-4 h-4", isActive ? "text-[#0176D3]" : "text-slate-400")} />
                  {tab.label}
                  {isActive && <ChevronDown className="w-3 h-3 ml-1 opacity-50" />}
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
                placeholder="Search CRM..." 
                className="w-full h-8 pl-8 pr-3 bg-slate-50 dark:bg-[#252525] border border-slate-200 dark:border-slate-700 rounded text-xs focus:outline-none focus:ring-1 focus:ring-[#0176D3]"
              />
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500">
              <Plus className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto p-4 lg:p-6 bg-slate-50 dark:bg-[#0f0f0f]">
        {activeTab === 'home' && <HomeView />}
        {activeTab === 'leads' && <ListView type="leads" data={leads} columns={['Name', 'Company', 'Email', 'Status', 'Source']} />}
        {activeTab === 'accounts' && <ListView type="accounts" data={accounts} columns={['Name', 'Industry', 'Type', 'Website', 'Owner']} />}
        {activeTab === 'contacts' && <ListView type="contacts" data={contacts} columns={['Name', 'Account', 'Title', 'Email', 'Phone']} />}
        {activeTab === 'opportunities' && <ListView type="opportunities" data={opportunities} columns={['Name', 'Account', 'Stage', 'Amount', 'Close Date']} />}
      </div>
    </div>
  );
};

/* --- Sub Components --- */

const HomeView = () => (
  <div className="space-y-6 max-w-7xl mx-auto">
    <div className="flex items-center justify-between">
      <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Quarterly Performance</h1>
      <div className="text-sm text-slate-500 font-medium">Last updated: Just now</div>
    </div>

    {/* KPI Cards */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {dashboardMetrics.map((metric, idx) => (
        <div key={idx} className="bg-white dark:bg-[#1a1a1a] p-4 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="absolute top-0 left-0 w-1 h-full bg-[#0176D3] opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{metric.label}</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{metric.value}</div>
          <div className={cn("text-xs font-semibold flex items-center gap-1", metric.type === 'positive' ? 'text-green-600' : metric.type === 'negative' ? 'text-red-500' : 'text-slate-500')}>
            {metric.type === 'positive' ? <ArrowUpRight className="h-3 w-3" /> : metric.type === 'negative' ? <ArrowUpRight className="h-3 w-3 rotate-180" /> : null}
            {metric.change} <span className="text-slate-400 font-normal">vs last quarter</span>
          </div>
        </div>
      ))}
    </div>

    {/* Charts Row 1 */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 bg-white dark:bg-[#1a1a1a] p-5 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-semibold text-slate-800 dark:text-slate-100">Revenue Pipeline</h3>
          <Button variant="ghost" size="sm" className="h-8 text-xs text-[#0176D3]">View Report</Button>
        </div>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={[
              { name: 'Jan', value: 4000 },
              { name: 'Feb', value: 3000 },
              { name: 'Mar', value: 2000 },
              { name: 'Apr', value: 2780 },
              { name: 'May', value: 1890 },
              { name: 'Jun', value: 2390 },
              { name: 'Jul', value: 3490 },
            ]}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0176D3" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#0176D3" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
              <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} tickFormatter={(value) => `$${value}`} />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                cursor={{ stroke: '#0176D3', strokeWidth: 1, strokeDasharray: '4 4' }}
              />
              <Area type="monotone" dataKey="value" stroke="#0176D3" strokeWidth={2} fillOpacity={1} fill="url(#colorValue)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white dark:bg-[#1a1a1a] p-5 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
        <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-6">Stage Distribution</h3>
        <div className="h-[300px] w-full relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={[
                  { name: 'Prospecting', value: 400 },
                  { name: 'Qualification', value: 300 },
                  { name: 'Proposal', value: 300 },
                  { name: 'Negotiation', value: 200 },
                ]}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {COLORS.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry} strokeWidth={0} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
            <div className="text-2xl font-bold">1,200</div>
            <div className="text-xs text-slate-500">Total Deals</div>
          </div>
        </div>
      </div>
    </div>

    {/* Recent Items Section */}
    <div className="bg-white dark:bg-[#1a1a1a] rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <h3 className="font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-400" />
                Recent Records
            </h3>
            <Button variant="ghost" size="sm" className="h-7 text-xs">View All</Button>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {leads.slice(0, 3).map((lead) => (
                <div key={lead.id} className="p-3 hover:bg-slate-50 dark:hover:bg-white/5 flex items-center justify-between group cursor-pointer transition-colors">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 flex items-center justify-center">
                            <Users className="w-4 h-4" />
                        </div>
                        <div>
                            <div className="text-sm font-medium text-slate-900 dark:text-slate-100 group-hover:text-[#0176D3]">{lead.name}</div>
                            <div className="text-xs text-slate-500">{lead.company} • {lead.status}</div>
                        </div>
                    </div>
                    <div className="text-xs text-slate-400">Viewed just now</div>
                </div>
            ))}
        </div>
    </div>
  </div>
);


const getColorForType = (type) => {
  switch(type) {
    case 'leads': return 'text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-500/20';
    case 'accounts': return 'text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-500/20';
    case 'contacts': return 'text-indigo-600 bg-indigo-100 dark:text-indigo-400 dark:bg-indigo-500/20';
    case 'opportunities': return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-500/20';
    default: return 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-500/20';
  }
};

const ListView = ({ type, data, columns }) => (
  <div className="space-y-4 h-full flex flex-col max-w-[1600px] mx-auto">
    <div className="flex items-center justify-between bg-white dark:bg-[#1a1a1a] p-4 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
      <div className="flex items-center gap-3">
        <div className={cn("p-2 rounded-md", getColorForType(type))}>
            {type === 'leads' && <Users className="w-5 h-5" />}
            {type === 'accounts' && <Building2 className="w-5 h-5" />}
            {type === 'contacts' && <Users className="w-5 h-5" />}
            {type === 'opportunities' && <Briefcase className="w-5 h-5" />}
        </div>
        <div>
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 capitalize">{type}</h2>
          <div className="text-xs text-slate-500 flex items-center gap-1 cursor-pointer hover:text-[#0176D3]">
             All {type} <ChevronDown className="w-3 h-3" />
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input className="pl-9 h-9 w-64 bg-slate-50 border-slate-200" placeholder={`Search this list...`} />
        </div>
        <Button variant="outline" size="icon" className="h-9 w-9"><Filter className="h-4 w-4" /></Button>
        <Button variant="outline" size="icon" className="h-9 w-9"><RefreshCw className="h-4 w-4" /></Button>
        <Button className="h-9 bg-[#0176D3] hover:bg-[#0176D3]/90 text-white shadow-sm font-semibold">New</Button>
      </div>
    </div>

    {/* Table Container */}
    <div className="bg-white dark:bg-[#1a1a1a] rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm flex-1 overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 bg-slate-50 dark:bg-slate-900/50 uppercase border-b border-slate-200 dark:border-slate-800 font-semibold tracking-wider">
                    <tr>
                        <th className="p-4 w-10">
                            <input type="checkbox" className="rounded border-slate-300" />
                        </th>
                        {columns.map((col) => (
                            <th key={col} className="px-4 py-3 cursor-pointer hover:bg-slate-100 dark:hover:bg-white/5 transition-colors group">
                                <div className="flex items-center gap-1">
                                    {col}
                                    <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-50 transition-opacity" />
                                </div>
                            </th>
                        ))}
                        <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {data.map((item, idx) => (
                        <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
                            <td className="p-4">
                                <input type="checkbox" className="rounded border-slate-300" />
                            </td>
                            {columns.map((col) => {
                                const key = col.toLowerCase().replace(' ', '');
                                const val = item[key] || item[key.replace('date', '')] || '-';
                                // Special formatting for status/stage
                                if (key === 'status' || key === 'stage') {
                                    return (
                                        <td key={col} className="px-4 py-3">
                                            <Badge variant="secondary" className="font-normal bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300">
                                                {val}
                                            </Badge>
                                        </td>
                                    )
                                }
                                if (key === 'name') {
                                    return (
                                        <td key={col} className="px-4 py-3 font-medium text-[#0176D3] hover:underline cursor-pointer">
                                            {val}
                                        </td>
                                    )
                                }
                                return (
                                    <td key={col} className="px-4 py-3 text-slate-600 dark:text-slate-300">
                                        {val}
                                    </td>
                                );
                            })}
                            <td className="px-4 py-3 text-right">
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-[#0176D3] opacity-0 group-hover:opacity-100 transition-opacity">
                                    <ChevronDown className="h-4 w-4" />
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 bg-slate-50/50 dark:bg-black/20 mt-auto">
             <div>Showing {data.length} items • Sorted by Name</div>
             <div className="flex gap-2">
                <Button variant="outline" size="sm" className="h-7 text-xs" disabled>Previous</Button>
                <Button variant="outline" size="sm" className="h-7 text-xs" disabled>Next</Button>
             </div>
        </div>
    </div>
  </div>
);

export default CrmDashboard;
