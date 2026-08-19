import React, { useState, useRef, useEffect } from 'react';
import {
  CheckCircle2, Clock, ChevronDown,
  FileText, Search, FilePen, Shield, MessageSquareMore, ClipboardCheck,
  Send, BadgeCheck, CalendarClock, Users, X, Eye, Check
} from 'lucide-react';
import { useViewAs } from '../ViewAsContext';

// ─────────────────────────────────────────────────────────────────────────────
// WORKFLOW STAGES — 8 Steps of the Tax Filing Lifecycle
// ─────────────────────────────────────────────────────────────────────────────
const STAGES = [
  {
    id: 'collection',
    label: 'Doc Collection',
    shortLabel: 'Collect',
    icon: FileText,
    deadline: 'Feb 1',
    owner: 'Jishnu + Deepika',
    checklist: [
      { id: 'w2', label: 'W-2 from all employers uploaded', done: true },
      { id: '1099b', label: '1099-B Fidelity ••9414 uploaded', done: true },
      { id: '1099div', label: '1099-DIV uploaded', done: false },
      { id: 'schc', label: 'Schedule C business expense ledger', done: false },
      { id: '1098', label: '1098 Mortgage Interest', done: true },
      { id: 'proptax', label: 'Property tax statements (all 4 properties)', done: false },
    ]
  },
  {
    id: 'extraction',
    label: 'Data Extraction',
    shortLabel: 'Extract',
    icon: Search,
    deadline: 'Feb 15',
    owner: 'CloudBot / AI',
    checklist: [
      { id: 'parse_w2', label: 'W-2 Box 1 & Box 2 parsed', done: true },
      { id: 'parse_1099b', label: '1099-B cost basis extracted', done: true },
      { id: 'parse_schc', label: 'Schedule C totals auto-populated', done: false },
      { id: 'parse_mort', label: 'Mortgage interest auto-populated', done: true },
    ]
  },
  {
    id: 'forms',
    label: 'Forms Populated',
    shortLabel: 'Forms',
    icon: FilePen,
    deadline: 'Mar 1',
    owner: 'Jishnu',
    checklist: [
      { id: 'f1040_1a', label: '1040 Line 1a – W2 wages verified', done: true },
      { id: 'f1040_7', label: '1040 Line 7 – Cap gains confirmed', done: false },
      { id: 'fschc_net', label: 'Sched C net profit/loss confirmed', done: false },
      { id: 'fschd', label: 'Schedule D reconciled with 1099-B', done: false },
    ]
  },
  {
    id: 'cpa_audit',
    label: 'CPA Audit',
    shortLabel: 'Audit',
    icon: Shield,
    deadline: 'Mar 15',
    owner: 'David Ramsey CPA',
    checklist: [
      { id: 'qbi', label: 'Section 199A QBI deduction reviewed', done: false },
      { id: 'sep', label: 'SEP-IRA contribution verified', done: false },
      { id: 'homeoff', label: 'Home office deduction substantiated', done: false },
      { id: 'matpart', label: 'Comfort Foods material participation confirmed', done: false },
    ]
  },
  {
    id: 'qa',
    label: 'Q&A / Responses',
    shortLabel: 'Q&A',
    icon: MessageSquareMore,
    deadline: 'Mar 22',
    owner: 'Jishnu + Deepika',
    checklist: [
      { id: 'qa_comfort', label: 'Comfort Foods loss documentation responded', done: false },
      { id: 'qa_cb', label: 'CloudBaud LLC wages paid clarified', done: false },
      { id: 'qa_estpay', label: 'Estimated payment history confirmed', done: false },
    ]
  },
  {
    id: 'audit_complete',
    label: 'Audit Complete',
    shortLabel: 'Signed Off',
    icon: ClipboardCheck,
    deadline: 'Apr 1',
    owner: 'David Ramsey CPA',
    checklist: [
      { id: 'sign_jishnu', label: 'Jishnu signature obtained', done: false },
      { id: 'sign_deepika', label: 'Deepika signature obtained', done: false },
      { id: 'cpa_final', label: 'CPA final review sign-off', done: false },
    ]
  },
  {
    id: 'filing',
    label: 'IRS Filing',
    shortLabel: 'E-File',
    icon: Send,
    deadline: 'Apr 15',
    owner: 'David Ramsey CPA',
    checklist: [
      { id: 'efile', label: '1040 e-filed via IRS MeF', done: false },
      { id: 'state', label: 'State return filed', done: false },
      { id: 'payment', label: 'Balance due / refund initiated', done: false },
    ]
  },
  {
    id: 'accepted',
    label: 'IRS Accepted',
    shortLabel: 'Accepted',
    icon: BadgeCheck,
    deadline: 'Apr 21',
    owner: 'System',
    checklist: [
      { id: 'irs_ack', label: 'IRS acknowledgement received', done: false },
      { id: 'state_ack', label: 'State acknowledgement received', done: false },
      { id: 'archive', label: 'Return archived in document vault', done: false },
    ]
  },
];

// Which stage index is currently "active"
const ACTIVE_STAGE = 3; // 0-indexed → CPA Audit

function getStageStatus(index) {
  if (index < ACTIVE_STAGE) return 'done';
  if (index === ACTIVE_STAGE) return 'active';
  return 'upcoming';
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function TaxWorkflowProgressBar({ year = 2020, onYearChange }) {
  const [openStageId, setOpenStageId] = useState(null);
  const [showPeopleDropdown, setShowPeopleDropdown] = useState(false);
  const flyoutRef = useRef(null);

  const { personas, activePersona, setViewAs } = useViewAs();
  const overallPct = Math.round((ACTIVE_STAGE / (STAGES.length - 1)) * 100);

  // Close flyouts on outside click
  useEffect(() => {
    const handleOutside = (e) => {
      if (flyoutRef.current && !flyoutRef.current.contains(e.target)) {
        setOpenStageId(null);
        setShowPeopleDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  return (
    <div className="relative shrink-0 bg-[#0c1220] border-b border-white/10" ref={flyoutRef}>
      {/* ── BAR ── */}
      <div className="flex items-stretch min-h-[52px] px-3 gap-0 overflow-x-auto">

        {/* Left label & Year Selector */}
        <div className="flex items-center gap-2 pr-4 border-r border-white/10 shrink-0 mr-1">
          <CalendarClock className="size-4 text-blue-400 shrink-0" />
          <div className="leading-tight">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold text-white whitespace-nowrap">Tax Return</span>
              <select
                value={year}
                onChange={(e) => onYearChange?.(Number(e.target.value))}
                className="bg-[#182238] border border-white/20 rounded px-1.5 py-0.5 text-[11px] font-bold text-emerald-400 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                title="Switch Tax Year"
              >
                {[2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017].map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
            <div className="text-[10px] text-white/40 whitespace-nowrap">{overallPct}% complete</div>
          </div>
        </div>

        {/* Stages */}
        {STAGES.map((stage, i) => {
          const status = getStageStatus(i);
          const Icon = stage.icon;
          const isOpen = openStageId === stage.id;
          const checkDone = stage.checklist.filter(c => c.done).length;
          const checkTotal = stage.checklist.length;
          const isDue = status === 'active';
          const isPast = status === 'done';

          return (
            <button
              key={stage.id}
              onClick={() => {
                setShowPeopleDropdown(false);
                setOpenStageId(isOpen ? null : stage.id);
              }}
              className={`relative flex items-center gap-1.5 px-3 py-2 shrink-0 transition border-r border-white/5 last:border-r-0 group
                ${isPast
                  ? 'text-emerald-400 hover:bg-emerald-500/5'
                  : isDue
                  ? 'text-white bg-blue-600/10 hover:bg-blue-600/20 border-l-2 border-blue-500'
                  : 'text-white/40 hover:bg-white/5 hover:text-white/70'}
              `}
              title={`${stage.label} — Due: ${stage.deadline} — Owner: ${stage.owner}`}
            >
              {/* Status icon */}
              {isPast ? (
                <CheckCircle2 className="size-3.5 text-emerald-400 shrink-0" />
              ) : isDue ? (
                <Clock className="size-3.5 text-blue-400 animate-pulse shrink-0" />
              ) : (
                <Icon className="size-3.5 shrink-0" />
              )}

              {/* Label + deadline */}
              <div className="text-left leading-tight">
                <div className={`text-[11px] font-semibold whitespace-nowrap ${isDue ? 'text-white' : ''}`}>
                  {stage.shortLabel}
                </div>
                <div className={`text-[9px] whitespace-nowrap ${
                  isDue ? 'text-blue-300' : isPast ? 'text-emerald-500/70' : 'text-white/25'
                }`}>
                  {isDue ? `Due ${stage.deadline}` : isPast ? `✓ ${stage.deadline}` : stage.deadline}
                </div>
              </div>

              {/* Mini checklist progress badge (active stage only) */}
              {isDue && (
                <span className="ml-1 text-[9px] bg-blue-500/20 border border-blue-500/30 text-blue-300 px-1 rounded font-mono">
                  {checkDone}/{checkTotal}
                </span>
              )}

              {/* Chevron hint */}
              <ChevronDown className={`size-3 ml-0.5 shrink-0 opacity-40 transition-transform ${isOpen ? 'rotate-180' : ''}`} />

              {/* Connector line between steps */}
              {i < STAGES.length - 1 && (
                <div className={`absolute right-0 top-1/2 -translate-y-1/2 w-px h-4 ${
                  isPast ? 'bg-emerald-500/40' : 'bg-white/10'
                }`} />
              )}
            </button>
          );
        })}

        {/* Right: Real Authorized Participants Section */}
        <div className="ml-auto pl-3 flex items-center gap-2 shrink-0 relative">
          <button
            onClick={() => {
              setOpenStageId(null);
              setShowPeopleDropdown(!showPeopleDropdown);
            }}
            className="flex items-center gap-1.5 p-1 px-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition text-left"
            title="View Authorized Filing Team (Click to switch persona or view permissions)"
          >
            <Users className="size-3.5 text-blue-400" />
            <div className="hidden lg:flex flex-col">
              <span className="text-[10px] text-white/50 leading-none">Authorized Team</span>
              <span className="text-[11px] font-semibold text-white leading-tight truncate max-w-[90px]">
                {activePersona?.name || 'Authorized'}
              </span>
            </div>
            <div className="flex -space-x-1.5 ml-1">
              {personas.filter(p => p.id !== '').map((p) => (
                <div
                  key={p.id || p.name}
                  title={`${p.name} (${p.role})`}
                  className={`size-6 rounded-full border-2 border-[#0c1220] flex items-center justify-center text-[9px] font-bold shadow-sm ${p.color} text-white`}
                >
                  {p.initials}
                </div>
              ))}
            </div>
            <ChevronDown className={`size-3 text-white/40 transition-transform ${showPeopleDropdown ? 'rotate-180' : ''}`} />
          </button>

          {/* People Dropdown Flyout */}
          {showPeopleDropdown && (
            <div className="absolute right-0 top-full mt-1 w-72 bg-[#0d1525] border border-white/15 rounded-xl shadow-2xl z-50 p-3 text-white">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10">
                <span className="text-xs font-bold flex items-center gap-1.5">
                  <Users className="size-3.5 text-blue-400" />
                  <span>Authorized Tax Team</span>
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-medium">
                  {personas.length} Members
                </span>
              </div>

              <div className="space-y-1.5">
                {personas.map((p) => {
                  const isSelected = activePersona?.id === p.id;
                  return (
                    <div
                      key={p.id || p.name}
                      onClick={() => {
                        setViewAs(p.id);
                        setShowPeopleDropdown(false);
                      }}
                      className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition ${
                        isSelected ? 'bg-blue-600/20 border border-blue-500/40 text-white' : 'hover:bg-white/5 text-white/80'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={`size-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-sm ${p.color}`}>
                          {p.initials}
                        </div>
                        <div>
                          <div className="text-xs font-semibold flex items-center gap-1.5">
                            <span>{p.name}</span>
                            {isSelected && <span className="text-[9px] bg-blue-500 text-white px-1 rounded font-normal">Active</span>}
                          </div>
                          <div className="text-[10px] text-white/50">{p.role}</div>
                        </div>
                      </div>
                      <button
                        className="text-[10px] px-2 py-1 rounded bg-white/5 hover:bg-white/15 text-white/70 hover:text-white flex items-center gap-1 border border-white/10"
                        title={`View As ${p.name}`}
                      >
                        <Eye className="size-2.5 text-blue-400" />
                        <span>View</span>
                      </button>
                    </div>
                  );
                })}
              </div>

              <div className="mt-3 pt-2 border-t border-white/10 text-[10px] text-white/40 text-center">
                Access Level: <b>Full Joint Filing & Review Permissions</b>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── THIN PROGRESS FILL LINE ── */}
      <div className="h-[2px] bg-white/5 w-full">
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-emerald-400 transition-all duration-700"
          style={{ width: `${overallPct}%` }}
        />
      </div>

      {/* ── HOVER-DOWN AUDIT CHECKLIST FLYOUT ── */}
      {openStageId && (() => {
        const stage = STAGES.find(s => s.id === openStageId);
        if (!stage) return null;
        const status = getStageStatus(STAGES.indexOf(stage));
        const doneCount = stage.checklist.filter(c => c.done).length;

        return (
          <div className="absolute top-full left-0 right-0 z-50 bg-[#0d1525] border border-white/15 shadow-2xl shadow-black/60">
            {/* Flyout Header */}
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/10 bg-[#0b101c]">
              <div className="flex items-center gap-2">
                <stage.icon className={`size-4 ${
                  status === 'done' ? 'text-emerald-400' :
                  status === 'active' ? 'text-blue-400' :
                  'text-white/40'
                }`} />
                <span className="text-sm font-bold text-white">{stage.label}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                  status === 'done' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' :
                  status === 'active' ? 'bg-blue-500/15 text-blue-300 border border-blue-500/30' :
                  'bg-white/5 text-white/30 border border-white/10'
                }`}>
                  {status === 'done' ? 'Completed' : status === 'active' ? 'In Progress' : 'Upcoming'}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-[11px] text-white/50">
                  <span className="text-white/80 font-semibold">Owner:</span> {stage.owner}
                </div>
                <div className={`text-[11px] font-semibold flex items-center gap-1 ${
                  status === 'active' ? 'text-amber-400' : status === 'done' ? 'text-emerald-400' : 'text-white/30'
                }`}>
                  <CalendarClock className="size-3.5" />
                  Deadline: {stage.deadline}
                </div>
                <div className="text-[11px] text-white/50">
                  {doneCount}/{stage.checklist.length} done
                </div>
                <button
                  onClick={() => setOpenStageId(null)}
                  className="p-1 rounded hover:bg-white/10 text-white/40 hover:text-white transition"
                >
                  <X className="size-3.5" />
                </button>
              </div>
            </div>

            {/* Checklist Items */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-0 divide-x divide-y divide-white/5">
              {stage.checklist.map((item) => (
                <div
                  key={item.id}
                  className={`flex items-start gap-2.5 px-4 py-3 transition ${
                    item.done ? 'opacity-60' : 'hover:bg-white/[0.03]'
                  }`}
                >
                  <div className={`mt-0.5 size-4 rounded border flex items-center justify-center shrink-0 ${
                    item.done
                      ? 'bg-emerald-500/20 border-emerald-500/50'
                      : 'border-white/20 bg-white/5'
                  }`}>
                    {item.done && <CheckCircle2 className="size-3 text-emerald-400" />}
                  </div>
                  <span className={`text-[12px] leading-snug ${
                    item.done ? 'line-through text-white/30' : 'text-white/80'
                  }`}>
                    {item.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Mini progress bar in flyout */}
            <div className="px-4 py-2 border-t border-white/10 flex items-center gap-3">
              <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-emerald-400 rounded-full transition-all"
                  style={{ width: `${Math.round((doneCount / stage.checklist.length) * 100)}%` }}
                />
              </div>
              <span className="text-[10px] text-white/40 shrink-0">
                {Math.round((doneCount / stage.checklist.length) * 100)}% of this step
              </span>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
