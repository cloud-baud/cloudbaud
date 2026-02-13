
import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Briefcase, 
  Users, 
  Mic, 
  Trophy, 
  FileText, 
  Plus, 
  Search, 
  Settings, 
  MoreHorizontal,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Badge } from '@/shared/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from '@/shared/ui/dropdown-menu';

const TABS = [
  { id: 'projects', label: 'Projects', icon: Briefcase },
  { id: 'staffing', label: 'Staffing', icon: Users },
  { id: 'speaking', label: 'Speaking', icon: Mic },
  { id: 'hackathons', label: 'Hackathons', icon: Trophy },
  { id: 'patents', label: 'Patents', icon: FileText },
];

const ConsultingDashboard = () => {
  const [activeTab, setActiveTab] = useState('projects');

  return (
    <div className="flex flex-col h-full bg-[#f3f4f6] dark:bg-[#0f0f0f] text-slate-900 dark:text-slate-100 font-sans">
      {/* Consulting Header */}
      <div className="bg-white dark:bg-[#1a1a1a] border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10">
        <div className="flex items-center px-4 h-12 shadow-sm relative">
          {/* Brand */}
          <div className="flex items-center gap-3 mr-6">
            <div className="w-8 h-8 bg-indigo-600 rounded-md flex items-center justify-center text-white shadow-sm shadow-indigo-500/20">
              <Briefcase className="w-5 h-5" />
            </div>
            <span className="font-semibold text-lg tracking-tight hidden md:block text-slate-800 dark:text-slate-100">
              Consulting
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
                      ? "border-indigo-600 text-indigo-600" 
                      : "border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5"
                  )}
                >
                  <Icon className={cn("w-4 h-4", isActive ? "text-indigo-600" : "text-slate-400")} />
                  {tab.label}
                </button>
              );
            })}
          </nav>

          {/* Global Actions */}
          <div className="ml-auto flex items-center gap-2">
            <Button className="h-8 bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm gap-2">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">New Engagement</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto p-4 lg:p-6 bg-slate-50 dark:bg-[#0f0f0f]">
        
        {/* Compact Ticker Style KPIs (Context-Aware) */}
        <ConsultingKPIs activeTab={activeTab} />

        {/* Content Views */}
        {activeTab === 'projects' && <ProjectsView />}
        {activeTab === 'hackathons' && <HackathonsView />}
        {activeTab === 'speaking' && <SpeakingView />}
        {activeTab === 'patents' && <PatentsView />}
        {activeTab === 'staffing' && <StaffingView />}
      </div>
    </div>
  );
};

/* --- KPI Component --- */
const ConsultingKPIs = ({ activeTab }) => {
    // Dynamic KPIs based on tab
    const kpis = {
        projects: [
            { label: 'Billable Utilization', value: '85%', icon: Clock, color: 'text-emerald-500' },
            { label: 'Active Projects', value: '4', icon: Briefcase, color: 'text-indigo-500' },
            { label: 'Revenue QTD', value: '$320k', icon: CheckCircle, color: 'text-blue-500' }
        ],
        hackathons: [
            { label: 'Participating', value: '2', icon: Trophy, color: 'text-amber-500' },
            { label: 'Wins Since 2024', value: '3', icon: CheckCircle, color: 'text-emerald-500' },
            { label: 'Prize Total', value: '$45k', icon: Calendar, color: 'text-purple-500' }
        ],
        speaking: [
            { label: 'Upcoming Talks', value: '3', icon: Mic, color: 'text-rose-500' },
            { label: 'Audience Reach', value: '2.5k', icon: Users, color: 'text-blue-500' }
        ],
        patents: [
            { label: 'Filed', value: '2', icon: FileText, color: 'text-indigo-500' },
            { label: 'Granted', value: '1', icon: CheckCircle, color: 'text-emerald-500' }
        ],
         staffing: [
            { label: 'Utilization', value: '92%', icon: Clock, color: 'text-emerald-500' },
            { label: 'Bench', value: '1', icon: Users, color: 'text-amber-500' }
        ]
    };

    const currentKPIs = kpis[activeTab] || kpis.projects;

    return (
        <div className="flex items-center gap-4 mb-6 overflow-x-auto pb-1 scrollbar-hide">
            {currentKPIs.map((kpi, idx) => (
                <React.Fragment key={idx}>
                    <CompactStatCard {...kpi} />
                    {idx < currentKPIs.length - 1 && <div className="h-6 w-px bg-border/60 shrink-0 hidden md:block" />}
                </React.Fragment>
            ))}
        </div>
    );
};

const CompactStatCard = ({ label, value, icon: LucideIcon, color = "text-indigo-500" }) => (
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

/* --- Views --- */

const ProjectsView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <ProjectCard 
            title="SaaS Platform Migration" 
            client="TechGiant Inc." 
            status="Active" 
            progress={65} 
            team={['JN', 'MH']}
            endDate="Mar 15, 2024"
        />
        <ProjectCard 
            title="AI Capability Assessment" 
            client="FinServe Co." 
            status="Starting" 
            progress={10} 
            team={['JN']}
            endDate="Apr 30, 2024"
        />
    </div>
);

const ProjectCard = ({ title, client, status, progress, team, endDate }) => (
    <div className="bg-white dark:bg-[#1a1a1a] p-4 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start mb-3">
            <div>
                <h3 className="font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
                <p className="text-sm text-slate-500">{client}</p>
            </div>
            <Badge variant="outline" className={cn(
                status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
                status === 'Starting' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-slate-100 text-slate-600'
            )}>{status}</Badge>
        </div>
        
        <div className="space-y-1 mb-4">
            <div className="flex justify-between text-xs text-slate-500 mb-1">
                <span>Progress</span>
                <span>{progress}%</span>
            </div>
            <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${progress}%` }} />
            </div>
        </div>

        <div className="flex justify-between items-center pt-3 border-t border-slate-100 dark:border-slate-800">
            <div className="flex -space-x-2">
                {team.map((member, i) => (
                    <div key={i} className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 border-2 border-white dark:border-[#1a1a1a] flex items-center justify-center text-[10px] font-bold text-slate-600 dark:text-slate-300">
                        {member}
                    </div>
                ))}
            </div>
            <span className="text-xs text-slate-400 font-medium">Due {endDate}</span>
        </div>
    </div>
);

const HackathonsView = () => (
    <div className="space-y-6">
        <div className="bg-white dark:bg-[#1a1a1a] rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
             <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 bg-slate-50 dark:bg-slate-900/50 uppercase border-b border-slate-200 dark:border-slate-800">
                    <tr>
                        <th className="px-6 py-3">Event Name</th>
                        <th className="px-6 py-3">Theme/Focus</th>
                        <th className="px-6 py-3">Status</th>
                        <th className="px-6 py-3">Dates</th>
                        <th className="px-6 py-3 text-right">Prize Pool</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {[
                        { name: 'Devpost AI Challenge', theme: 'Generative AI', status: 'In Progress', dates: 'Feb 1 - Feb 28', prize: '$50,000' },
                        { name: 'Global FinTech Hack', theme: 'Open Banking', status: 'Registered', dates: 'Mar 15 - Mar 17', prize: '$25,000' },
                        { name: 'Cloud Native Summit', theme: 'Kubernetes', status: 'Completed', dates: 'Jan 20 - Jan 22', prize: '$10,000' }
                    ].map((hack, idx) => (
                        <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                            <td className="px-6 py-4 font-medium text-indigo-600 hover:underline cursor-pointer">{hack.name}</td>
                            <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{hack.theme}</td>
                            <td className="px-6 py-4">
                                <Badge variant="outline" className={cn(
                                    hack.status === 'In Progress' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                    hack.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
                                    'bg-blue-50 text-blue-700 border-blue-200'
                                )}>{hack.status}</Badge>
                            </td>
                            <td className="px-6 py-4 text-slate-500 font-mono text-xs">{hack.dates}</td>
                            <td className="px-6 py-4 text-right font-medium">{hack.prize}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
);

const SpeakingView = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-[#1a1a1a] p-5 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-500" /> Upcoming Talks
            </h3>
            <div className="space-y-4">
                 {[
                    { event: 'React Summit 2024', topic: 'Agentic UI Patters', date: 'Apr 12, 2024', location: 'Amsterdam', status: 'Confirmed' },
                    { event: 'AI Engineering Conf', topic: 'RAG Architecture', date: 'May 20, 2024', location: 'San Francisco', status: 'Pending' }
                ].map((talk, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-md bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-slate-800">
                        <div className="w-10 h-10 rounded bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold shrink-0">
                            {talk.date.split(' ')[0]}
                        </div>
                        <div className="flex-1">
                            <div className="flex justify-between">
                                <h4 className="font-medium text-sm text-slate-900 dark:text-slate-100">{talk.event}</h4>
                                <Badge variant="secondary" className="text-[10px] h-5">{talk.status}</Badge>
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5">{talk.topic} • {talk.location}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
        
         <div className="bg-white dark:bg-[#1a1a1a] p-5 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
                <Mic className="w-4 h-4 text-rose-500" /> Past Engagements
            </h3>
            <div className="space-y-4">
                <div className="p-3 rounded-md border border-slate-100 dark:border-slate-800">
                    <h4 className="font-medium text-sm">Building Cloud Native Platforms</h4>
                    <p className="text-xs text-slate-500 mt-1">DevOps Days 2023 • Seattle, WA</p>
                    <div className="mt-2 flex gap-2">
                        <Button variant="outline" size="sm" className="h-6 text-xs">Watch Video</Button>
                        <Button variant="outline" size="sm" className="h-6 text-xs">View Slides</Button>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

const PatentsView = () => (
    <div className="bg-white dark:bg-[#1a1a1a] rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <div>
                <h3 className="font-semibold text-lg">Intellectual Property</h3>
                <p className="text-sm text-slate-500">Track patent filings and provisional applications.</p>
            </div>
             <Button variant="outline" size="sm">File New IP</Button>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
             {[
                { title: 'System and Method for agentic context retrieval in RAG', status: 'Provisional Filed', number: 'US-2024-00123', date: 'Jan 15, 2024' },
                { title: 'Automated Compliance enforcement in multi-tenant cloud', status: 'Granted', number: 'US-9876543', date: 'Dec 10, 2023' }
            ].map((patent, i) => (
                <div key={i} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                    <div className="flex items-start gap-3">
                        <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded text-slate-500">
                            <FileText className="w-5 h-5" />
                        </div>
                        <div>
                            <h4 className="font-medium text-slate-900 dark:text-slate-100">{patent.title}</h4>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs font-mono text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 rounded">{patent.number}</span>
                                <span className="text-xs text-slate-400">• Filed {patent.date}</span>
                            </div>
                        </div>
                    </div>
                <Badge className={cn(
                    patent.status === 'Granted' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                )}>{patent.status}</Badge>
                </div>
            ))}
        </div>
    </div>
);

const StaffingView = () => (
    <div className="text-center py-12 text-slate-500 bg-white dark:bg-[#1a1a1a] rounded-lg border border-dashed border-slate-300 dark:border-slate-700">
        <Users className="w-12 h-12 mx-auto mb-4 text-slate-300" />
        <h3 className="text-lg font-medium">Resource Management</h3>
        <p className="text-sm max-w-md mt-2 mx-auto">Track team utilization, bench status, and hiring pipeline.</p>
    </div>
);

export default ConsultingDashboard;
