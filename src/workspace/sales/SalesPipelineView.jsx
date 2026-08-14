import React, { useState } from 'react';
import {
  Search,
  Target,
  ClipboardCheck,
  GitMerge,
  Lightbulb,
  ShieldCheck,
  Handshake,
  HeartHandshake,
  ChevronRight,
  DollarSign,
  Building2,
  User,
  Calendar,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Clock,
  Star,
  Plus,
  MoreHorizontal,
  ArrowRight,
  Zap,
  BarChart2,
} from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { ResponsiveContainer, FunnelChart, Funnel, LabelList, Tooltip } from 'recharts';

// ─────────────────────────────────────────────
//  Stage Config
// ─────────────────────────────────────────────
const STAGES = [
  {
    id: 'prospect',
    label: 'Prospect',
    icon: Search,
    color: 'from-blue-500 to-blue-600',
    lightColor: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    accent: '#3b82f6',
    shortDesc: 'Identify ideal-fit leads',
    description:
      'Identify potential customers who align with your Ideal Customer Profile (ICP), including company size, industry, and decision-maker roles.',
    actions: [
      'Research target accounts via LinkedIn & industry reports',
      'Cold outreach via email / call sequences',
      'Nurture via content & events',
      'Add to CRM and assign owner',
    ],
    goal: 'Build a qualified top-of-funnel lead list',
    keyMethod: 'ICP Targeting',
    conv: 40,
  },
  {
    id: 'qualify',
    label: 'Qualify',
    icon: ClipboardCheck,
    color: 'from-indigo-500 to-indigo-600',
    lightColor: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
    accent: '#6366f1',
    shortDesc: 'Validate BANT criteria',
    description:
      'Assess whether the prospect has the Budget, Authority, Need, and Timeline (BANT) to become a viable customer.',
    actions: [
      'Run BANT / MEDDIC discovery call',
      'Identify economic buyer & influencers',
      'Score and rank opportunities',
      'Disqualify poor-fit leads early',
    ],
    goal: 'Ensure only high-potential deals advance',
    keyMethod: 'BANT / MEDDIC',
    conv: 65,
  },
  {
    id: 'develop',
    label: 'Develop',
    icon: GitMerge,
    color: 'from-violet-500 to-violet-600',
    lightColor: 'bg-violet-500/10 text-violet-400 border-violet-500/30',
    accent: '#8b5cf6',
    shortDesc: 'Deep needs analysis',
    description:
      'Deepen the relationship through structured discovery. Align your capabilities to specific pain points and business goals.',
    actions: [
      'Multi-stakeholder discovery sessions',
      'Document current-state pain points',
      'Map feature-to-benefit alignment',
      'Draft initial proposal outline',
    ],
    goal: 'Build a detailed requirements map',
    keyMethod: 'Discovery Workshops',
    conv: 70,
  },
  {
    id: 'solution',
    label: 'Solution',
    icon: Lightbulb,
    color: 'from-amber-500 to-orange-500',
    lightColor: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    accent: '#f59e0b',
    shortDesc: 'Tailored presentation',
    description:
      'Present a customized solution that directly addresses each pain point uncovered during development. No generic pitches.',
    actions: [
      'Custom-build demo environment',
      'Tie each slide to a stated pain point',
      'Include ROI calculator / business case',
      'Involve all stakeholders in presentation',
    ],
    goal: 'Make the value proposition undeniable',
    keyMethod: 'Value-Based Selling',
    conv: 75,
  },
  {
    id: 'proof',
    label: 'Proof',
    icon: ShieldCheck,
    color: 'from-cyan-500 to-teal-500',
    lightColor: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
    accent: '#06b6d4',
    shortDesc: 'Validate & handle objections',
    description:
      'Provide validated evidence — case studies, pilot programs, testimonials — to de-risk the purchase and overcome objections.',
    actions: [
      'Share industry-specific case studies',
      'Offer a time-boxed pilot / POC',
      'Address price & competitor objections',
      'Deliver quantified ROI report',
    ],
    goal: 'Eliminate risk from the buyer\'s perspective',
    keyMethod: 'Social Proof + POC',
    conv: 80,
  },
  {
    id: 'close',
    label: 'Close',
    icon: Handshake,
    color: 'from-emerald-500 to-green-500',
    lightColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    accent: '#10b981',
    shortDesc: 'Finalize & sign',
    description:
      'Finalize negotiation, secure contract signature, and confirm payment terms. Drive urgency and consensus across all stakeholders.',
    actions: [
      'Negotiate pricing & contract terms',
      'Use assumptive / urgency close techniques',
      'Get procurement & legal buy-in',
      'Confirm implementation kick-off date',
    ],
    goal: 'Signed contract and cleared payment',
    keyMethod: 'Assumptive Close',
    conv: 90,
  },
  {
    id: 'postsale',
    label: 'Post-Sale',
    icon: HeartHandshake,
    color: 'from-rose-500 to-pink-500',
    lightColor: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    accent: '#f43f5e',
    shortDesc: 'Nurture & expand',
    description:
      'Ensure successful onboarding and satisfaction. Lay the groundwork for expansion deals, renewal, and referrals.',
    actions: [
      'Structured 30/60/90-day check-ins',
      'Identify upsell / cross-sell opportunities',
      'Collect NPS & testimonial',
      'Request referrals from champions',
    ],
    goal: 'Maximize LTV and generate referrals',
    keyMethod: 'Customer Success',
    conv: 95,
  },
];

// ─────────────────────────────────────────────
//  Sample Deals (Battery Network context)
// ─────────────────────────────────────────────
const DEALS = [
  { id: 1, name: 'Battery Network - MSP Engagement', stage: 'develop',  value: 180000, owner: 'Rob', company: 'Battery Network', age: 14, priority: 'high' },
  { id: 2, name: 'Grid Dynamics - Cloud Migration',  stage: 'solution',  value: 250000, owner: 'Sarah J.', company: 'Grid Dynamics', age: 8, priority: 'high' },
  { id: 3, name: 'NovaPower - AI Analytics',          stage: 'qualify',   value: 95000,  owner: 'Mike T.', company: 'NovaPower', age: 21, priority: 'medium' },
  { id: 4, name: 'VoltEdge - Fabric Platform',        stage: 'proof',     value: 320000, owner: 'Sarah J.', company: 'VoltEdge', age: 5, priority: 'high' },
  { id: 5, name: 'EnergyCorp - Security Audit',       stage: 'prospect',  value: 60000,  owner: 'David R.', company: 'EnergyCorp', age: 30, priority: 'low' },
  { id: 6, name: 'SolarTech - Data Warehouse',        stage: 'close',     value: 410000, owner: 'Jessica L.', company: 'SolarTech', age: 3, priority: 'high' },
  { id: 7, name: 'AmperaBio – Digital Ops',           stage: 'postsale',  value: 130000, owner: 'Mike T.', company: 'AmperaBio', age: 45, priority: 'medium' },
];

const PRIORITY_CONFIG = {
  high:   { label: 'High',   class: 'bg-rose-500/15 text-rose-400 border-rose-500/30' },
  medium: { label: 'Medium', class: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
  low:    { label: 'Low',    class: 'bg-slate-500/15 text-slate-400 border-slate-500/30' },
};

const fmt = (n) =>
  n >= 1000000
    ? `$${(n / 1000000).toFixed(1)}M`
    : `$${(n / 1000).toFixed(0)}k`;

// ─────────────────────────────────────────────
//  Main View
// ─────────────────────────────────────────────
const SalesPipelineView = () => {
  const [activeStage, setActiveStage] = useState(STAGES[0].id);
  const [view, setView] = useState('pipeline'); // 'pipeline' | 'funnel' | 'deals'
  const [selectedDeal, setSelectedDeal] = useState(null);

  const stage = STAGES.find((s) => s.id === activeStage);
  const stageDeals = DEALS.filter((d) => d.stage === activeStage);
  const allDealsTotal = DEALS.reduce((s, d) => s + d.value, 0);

  return (
    <div className="flex flex-col h-full">
      {/* Sub-header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1a1a1a]">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5">
            {(['pipeline', 'funnel', 'deals']).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={cn(
                  'px-3 py-1.5 rounded-md text-xs font-semibold transition-all capitalize',
                  view === v
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                )}
              >
                {v}
              </button>
            ))}
          </div>
          <span className="text-xs text-slate-400 font-medium hidden sm:block">
            Pipeline total: <span className="text-emerald-500 font-bold">{fmt(allDealsTotal)}</span>
          </span>
        </div>
        <Button size="sm" className="h-7 bg-emerald-600 hover:bg-emerald-700 text-white gap-1">
          <Plus className="w-3.5 h-3.5" />
          <span className="text-xs">Add Deal</span>
        </Button>
      </div>

      {/* Pipeline Stage Rail */}
      {view === 'pipeline' && (
        <div className="flex-1 overflow-hidden flex flex-col">
          {/* Stage Selector */}
          <div className="px-4 pt-4 pb-0">
            <div className="flex items-center gap-0 overflow-x-auto no-scrollbar relative">
              {STAGES.map((s, idx) => {
                const Icon = s.icon;
                const isActive = activeStage === s.id;
                const dealCount = DEALS.filter((d) => d.stage === s.id).length;
                return (
                  <React.Fragment key={s.id}>
                    <button
                      onClick={() => setActiveStage(s.id)}
                      className={cn(
                        'group flex-1 min-w-[100px] flex flex-col items-center gap-1 px-2 py-2.5 rounded-t-lg transition-all border-b-2 relative',
                        isActive
                          ? 'border-b-0 bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-slate-700'
                          : 'border-transparent hover:bg-slate-100/70 dark:hover:bg-white/5'
                      )}
                    >
                      <div
                        className={cn(
                          'w-8 h-8 rounded-full flex items-center justify-center transition-all',
                          isActive ? `bg-gradient-to-br ${s.color} text-white shadow-md` : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                        )}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className={cn('text-[11px] font-semibold whitespace-nowrap', isActive ? 'text-slate-900 dark:text-white' : 'text-slate-500')}>
                        {s.label}
                      </span>
                      {dealCount > 0 && (
                        <span className={cn('text-[10px] font-bold px-1.5 py-0 rounded-full border', s.lightColor)}>
                          {dealCount}
                        </span>
                      )}
                      {/* Step connector arrow */}
                      {idx < STAGES.length - 1 && (
                        <ChevronRight className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 dark:text-slate-700 z-10 hidden md:block" />
                      )}
                    </button>
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* Stage Detail Panel */}
          {stage && (
            <div className="flex-1 overflow-auto p-4 bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-slate-700 rounded-b-lg rounded-r-lg mx-4 mb-4">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
                {/* Left: Stage Info */}
                <div className="lg:col-span-1 space-y-4">
                  {/* Stage Header */}
                  <div className={cn('rounded-xl p-4 border', stage.lightColor)}>
                    <div className="flex items-center gap-3 mb-3">
                      <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br shadow-lg', stage.color, 'text-white')}>
                        <stage.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 dark:text-white text-base">{stage.label}</h3>
                        <span className="text-xs opacity-80">{stage.keyMethod}</span>
                      </div>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{stage.description}</p>
                  </div>

                  {/* Goal */}
                  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Target className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="text-xs font-semibold text-emerald-500 uppercase tracking-wide">Stage Goal</span>
                    </div>
                    <p className="text-sm text-slate-700 dark:text-slate-200 font-medium">{stage.goal}</p>
                  </div>

                  {/* Actions */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="w-3.5 h-3.5 text-amber-500" />
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Key Actions</span>
                    </div>
                    {stage.actions.map((action, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                        <span className={cn('mt-0.5 text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shrink-0 bg-gradient-to-br', stage.color, 'text-white')}>
                          {i + 1}
                        </span>
                        {action}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right: Deals in this Stage */}
                <div className="lg:col-span-2 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <BarChart2 className="w-4 h-4 text-slate-400" />
                      <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                        Active Deals
                      </span>
                      <span className={cn('text-xs font-bold px-2 py-0.5 rounded-full border', stage.lightColor)}>
                        {stageDeals.length}
                      </span>
                    </div>
                    {stageDeals.length > 0 && (
                      <span className="text-xs text-slate-400 font-mono">
                        {fmt(stageDeals.reduce((a, d) => a + d.value, 0))} total
                      </span>
                    )}
                  </div>

                  {stageDeals.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl text-slate-400">
                      <stage.icon className="w-8 h-8 mb-2 opacity-30" />
                      <p className="text-sm font-medium">No active deals at this stage</p>
                      <button className="mt-3 text-xs text-emerald-500 hover:text-emerald-400 flex items-center gap-1 font-medium">
                        <Plus className="w-3.5 h-3.5" /> Add Deal
                      </button>
                    </div>
                  ) : (
                    <div className="grid gap-3 sm:grid-cols-2">
                      {stageDeals.map((deal) => (
                        <DealCard
                          key={deal.id}
                          deal={deal}
                          stage={stage}
                          onClick={() => setSelectedDeal(deal)}
                          isSelected={selectedDeal?.id === deal.id}
                        />
                      ))}
                    </div>
                  )}

                  {/* Conversion Indicator */}
                  <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-slate-500 font-medium">Stage Conversion Rate</span>
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{stage.conv}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className={cn('h-full rounded-full bg-gradient-to-r', stage.color)}
                        style={{ width: `${stage.conv}%`, transition: 'width 0.6s ease' }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                      <span>Avg. industry: 45%</span>
                      <span className="text-emerald-500 font-semibold">+{stage.conv - 45}% above avg</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Funnel View */}
      {view === 'funnel' && (
        <div className="flex-1 overflow-auto p-4 space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            {/* Funnel Visual */}
            <div className="lg:col-span-3 bg-white dark:bg-[#1a1a1a] rounded-xl border border-slate-200 dark:border-slate-800 p-6">
              <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-4 text-sm">Pipeline Funnel — Value by Stage</h3>
              <div className="space-y-2">
                {STAGES.map((s, idx) => {
                  const stageVal = DEALS.filter((d) => d.stage === s.id).reduce((a, d) => a + d.value, 0);
                  const maxW = 100 - idx * 4;
                  return (
                    <button
                      key={s.id}
                      onClick={() => { setActiveStage(s.id); setView('pipeline'); }}
                      className="w-full group"
                    >
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-[11px] font-semibold text-slate-500 w-20 text-right">{s.label}</span>
                        <div className="flex-1 flex items-center gap-2">
                          <div
                            className={cn('h-7 rounded-md bg-gradient-to-r transition-all group-hover:opacity-90', s.color)}
                            style={{ width: `${maxW}%`, minWidth: stageVal > 0 ? '60px' : '20px' }}
                          >
                            <span className="text-white text-[10px] font-bold px-2 flex items-center h-full">
                              {stageVal > 0 ? fmt(stageVal) : '—'}
                            </span>
                          </div>
                          <ArrowRight className="w-3 h-3 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Stage Summary Cards */}
            <div className="lg:col-span-2 space-y-2">
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm px-1">Stage Summary</h3>
              {STAGES.map((s) => {
                const count = DEALS.filter((d) => d.stage === s.id).length;
                const val = DEALS.filter((d) => d.stage === s.id).reduce((a, d) => a + d.value, 0);
                return (
                  <button
                    key={s.id}
                    onClick={() => { setActiveStage(s.id); setView('pipeline'); }}
                    className={cn(
                      'w-full flex items-center gap-3 p-2.5 rounded-lg border transition-all hover:shadow-sm text-left',
                      'bg-white dark:bg-[#1a1a1a] border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-600'
                    )}
                  >
                    <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center bg-gradient-to-br shrink-0', s.color, 'text-white')}>
                      <s.icon className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">{s.label}</span>
                        <span className="text-xs font-bold text-slate-900 dark:text-white font-mono">{val > 0 ? fmt(val) : '—'}</span>
                      </div>
                      <span className="text-[10px] text-slate-400">{count} deal{count !== 1 ? 's' : ''} · {s.conv}% conv.</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* All Deals View */}
      {view === 'deals' && (
        <div className="flex-1 overflow-auto p-4">
          <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800">
                  {['Deal', 'Company', 'Stage', 'Value', 'Owner', 'Days', 'Priority'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {DEALS.map((deal) => {
                  const s = STAGES.find((st) => st.id === deal.stage);
                  const pri = PRIORITY_CONFIG[deal.priority];
                  return (
                    <tr
                      key={deal.id}
                      onClick={() => { setActiveStage(deal.stage); setView('pipeline'); setSelectedDeal(deal); }}
                      className="hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer transition-colors"
                    >
                      <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-100 max-w-[200px] truncate">
                        {deal.id === 1 && <Star className="w-3.5 h-3.5 text-amber-400 inline mr-1.5" />}
                        {deal.name}
                      </td>
                      <td className="px-4 py-3 text-slate-500">
                        <div className="flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 shrink-0" />
                          {deal.company}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {s && (
                          <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-full border', s.lightColor)}>
                            {s.label}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 font-bold text-slate-800 dark:text-slate-100 font-mono text-right">
                        {fmt(deal.value)}
                      </td>
                      <td className="px-4 py-3 text-slate-500">
                        <div className="flex items-center gap-1.5">
                          <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[9px] font-bold">
                            {deal.owner.charAt(0)}
                          </div>
                          {deal.owner}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-500">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {deal.age}d
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full border', pri.class)}>
                          {pri.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────
//  Deal Card sub-component
// ─────────────────────────────────────────────
const DealCard = ({ deal, onClick, isSelected }) => {
  const pri = PRIORITY_CONFIG[deal.priority];
  const isBatteryNetwork = deal.id === 1;

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full text-left p-3.5 rounded-xl border transition-all hover:shadow-md',
        isSelected
          ? 'border-emerald-500/50 bg-emerald-500/5 shadow-md'
          : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0f0f0f] hover:border-slate-300 dark:hover:border-slate-600',
        isBatteryNetwork && 'ring-1 ring-amber-400/50'
      )}
    >
      {isBatteryNetwork && (
        <div className="flex items-center gap-1 text-amber-400 text-[10px] font-bold mb-2">
          <Star className="w-3 h-3 fill-amber-400" /> Featured Opportunity
        </div>
      )}
      <div className="flex items-start justify-between gap-2 mb-2">
        <h4 className="font-semibold text-sm text-slate-800 dark:text-slate-100 leading-tight">{deal.name}</h4>
        <span className={cn('text-[10px] font-bold px-1.5 py-0.5 rounded-full border shrink-0', pri.class)}>
          {pri.label}
        </span>
      </div>
      <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-3">
        <Building2 className="w-3 h-3" />
        <span>{deal.company}</span>
      </div>
      <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-700">
        <span className="font-bold text-slate-800 dark:text-white font-mono text-sm">{fmt(deal.value)}</span>
        <div className="flex items-center gap-3 text-[11px] text-slate-400">
          <span className="flex items-center gap-1"><User className="w-3 h-3" />{deal.owner}</span>
          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{deal.age}d</span>
        </div>
      </div>
    </button>
  );
};

export default SalesPipelineView;
