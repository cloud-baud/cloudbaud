import React, { useEffect, useState, createContext, useContext, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Calculator, 
  FileText, 
  FileCheck, 
  MessageSquare, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Plus,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
  Maximize2,
  Minimize2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { getChartOfAccounts, getTaxEntries, getMyDocuments } from './api/taxService';
import AnnotationReviewPanel from './components/AnnotationReviewPanel';
import { useViewAs } from './ViewAsContext';

const WorkbenchContext = createContext(null);
const useWorkbench = () => useContext(WorkbenchContext);

const DEFAULT_SAMPLE_THREADS = {
  'th_worksheet_row_Comfort Foods_2020': {
    id: 'th_worksheet_row_Comfort Foods_2020',
    targetType: 'worksheet_row',
    targetId: 'Comfort Foods',
    targetTitle: 'Biz Income - Comfort Foods (-$44,581.92)',
    year: 2020,
    status: 'pending',
    comments: [
      {
        id: 'c1',
        authorName: 'David Ramsey',
        authorRole: 'CPA (External)',
        authorInitials: 'DR',
        text: 'Please provide the 1099-K and expense summary for Comfort Foods to substantiate the active loss offset against W-2 wages.',
        createdAt: '2026-08-18T08:30:00Z',
        decision: null
      },
      {
        id: 'c2',
        authorName: 'Jishnu',
        authorRole: 'Owner',
        authorInitials: 'JN',
        text: 'Uploaded the Q4 expense ledger and 1099 statement to Supporting Docs. Material participation confirmed >500 hrs.',
        createdAt: '2026-08-18T09:15:00Z',
        decision: null
      }
    ]
  },
  'th_document_doc_w2_2020': {
    id: 'th_document_doc_w2_2020',
    targetType: 'document',
    targetId: 'doc_w2_2020',
    targetTitle: 'Form W-2 Wages Statement (2020)',
    year: 2020,
    status: 'accepted',
    comments: [
      {
        id: 'c3',
        authorName: 'David Ramsey',
        authorRole: 'CPA (External)',
        authorInitials: 'DR',
        text: 'Box 1 ($69,549.66) and Box 2 Federal Withholdings verified against draft 1040 Line 1a.',
        createdAt: '2026-08-18T09:20:00Z',
        decision: 'accepted'
      }
    ]
  },
  'th_form_line_CloudBaud LLC_2020': {
    id: 'th_form_line_CloudBaud LLC_2020',
    targetType: 'form_line',
    targetId: 'CloudBaud LLC',
    targetTitle: 'Form 1040 Line 8 - CloudBaud LLC ($365,772.34)',
    year: 2020,
    status: 'pending',
    comments: [
      {
        id: 'c4',
        authorName: 'David Ramsey',
        authorRole: 'CPA (External)',
        authorInitials: 'DR',
        text: 'Reviewing Section 199A QBI deduction calculations. Need confirmation on wages paid from LLC.',
        createdAt: '2026-08-18T09:25:00Z',
        decision: null
      }
    ]
  }
};

import ExcelWorksheetGrid from './components/ExcelWorksheetGrid';
import TaxWorkflowProgressBar from './components/TaxWorkflowProgressBar';

/* ========================================================
   PANE 1: WORKSHEET PANE (EXCEL RIBBON + SPREADSHEET GRID)
   ======================================================== */
function WorksheetPane({ onSelectAndSwitch }) {
  const { 
    year,
    setYear,
    accounts, 
    entries, 
    selectedCat, 
    setSelectedCat, 
    setSelectedDoc, 
    setSelectedFormLine, 
    threads, 
    openReviewPanel
  } = useWorkbench();

  return (
    <div className="h-full flex flex-col bg-[#0b0f19] text-white text-xs border-r border-white/10 overflow-hidden">
      <ExcelWorksheetGrid
        year={year}
        onYearChange={setYear}
        accounts={accounts}
        entries={entries}
        selectedCat={selectedCat}
        setSelectedCat={setSelectedCat}
        setSelectedDoc={setSelectedDoc}
        setSelectedFormLine={setSelectedFormLine}
        onSelectAndSwitch={onSelectAndSwitch}
        threads={threads}
        openReviewPanel={openReviewPanel}
      />
    </div>
  );
}

import SupportingDocsViewerPane from './components/SupportingDocsViewerPane';

/* ========================================================
   PANE 2: SUPPORTING DOCS & PDF VIEWER PANE
   ======================================================== */
function DocsPane({ onSelectAndSwitch }) {
  const { 
    selectedCat, 
    setSelectedCat, 
    selectedDoc, 
    setSelectedDoc, 
    threads,
    openReviewPanel,
    year,
    isDocsCollapsed,
    setIsDocsCollapsed
  } = useWorkbench();

  return (
    <SupportingDocsViewerPane
      year={year}
      selectedCat={selectedCat}
      setSelectedCat={setSelectedCat}
      selectedDoc={selectedDoc}
      setSelectedDoc={setSelectedDoc}
      threads={threads}
      openReviewPanel={openReviewPanel}
      isDocsCollapsed={isDocsCollapsed}
      setIsDocsCollapsed={setIsDocsCollapsed}
      onSelectAndSwitch={onSelectAndSwitch}
    />
  );
}

/* ========================================================
   PANE 3: WIP (DRAFT) 1040 RETURN PANE
   ======================================================== */
function WIPFormPane() {
  const { 
    selectedCat, 
    setSelectedFormLine, 
    setSelectedCat, 
    accounts,
    threads,
    openReviewPanel,
    year,
    isFormCollapsed,
    setIsFormCollapsed
  } = useWorkbench();

  const { activePersona, isViewingAs } = useViewAs();

  const formLines = [
    { line: 'W2 Wages (Line 1a)', amount: 69549.66, cat: 'W2 Wages' },
    { line: 'Biz Income - Comfort Foods (Sch C)', amount: -44581.92, cat: 'Comfort Foods' },
    { line: 'CloudBaud LLC Pass-Through (Sch E)', amount: 365772.34, cat: 'CloudBaud LLC' },
    { line: 'Total Adjusted Gross Income (AGI)', amount: 390740.08, total: true },
    { line: 'Estimated Tax Due / Refund', amount: 4000.00, cat: 'Estimated Refund', total: true, refund: true },
  ];

  // Render Slim Collapsed Strip
  if (isFormCollapsed) {
    return (
      <div 
        onClick={() => setIsFormCollapsed(false)}
        className="w-11 h-full border-l border-white/10 bg-[#0a0f1d] hover:bg-[#11192e] cursor-pointer flex flex-col items-center py-4 justify-between transition group select-none shrink-0"
        title="Click to expand WIP 1040 Return"
      >
        <div className="flex flex-col items-center gap-3">
          <button className="p-1 rounded hover:bg-white/10 text-purple-400 group-hover:scale-110 transition">
            <PanelRightOpen className="size-4" />
          </button>
          <FileCheck className="size-4 text-purple-400/80" />
        </div>

        <span className="[writing-mode:vertical-rl] rotate-180 text-[11px] font-semibold text-white/60 tracking-wider whitespace-nowrap">
          WIP (DRAFT) 1040 Return
        </span>

        <span className="text-[10px] text-purple-400 font-bold bg-purple-500/20 px-1.5 py-0.5 rounded">
          $390k
        </span>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-[#0b0f19] text-white text-xs overflow-hidden">
      {/* Header */}
      <div className="bg-[#121829] p-3 font-semibold border-b border-white/10 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-2">
          <FileCheck className="size-4 text-purple-400" />
          <span className="font-bold text-sm tracking-tight">WIP Federal 1040 (Draft)</span>
          <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
            CPA Review Stage
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-[11px] text-white/50 hidden sm:block">
            Reviewer: <b className="text-white">{isViewingAs ? activePersona.name : 'Me (Owner)'}</b>
          </div>

          {/* Collapse Button */}
          <button
            onClick={() => setIsFormCollapsed(true)}
            className="p-1.5 rounded hover:bg-white/10 text-slate-400 hover:text-white transition"
            title="Collapse WIP 1040 Return"
          >
            <PanelRightClose className="size-3.5" />
          </button>
        </div>
      </div>

      {/* Form Breakdown */}
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {selectedCat && (
          <div className="bg-blue-950/40 border border-blue-500/30 rounded-lg p-2.5 text-[11px] text-blue-200 flex items-center justify-between">
            <span>📌 Focused Line: <b>{selectedCat.name}</b></span>
            <button 
              onClick={() => openReviewPanel('form_line', selectedCat.name, `Form 1040 - ${selectedCat.name}`)}
              className="text-xs font-bold text-blue-400 hover:text-blue-200 underline"
            >
              Open Line Review
            </button>
          </div>
        )}

        {/* 1040 Line Items */}
        <div className="border border-white/10 rounded-xl overflow-hidden divide-y divide-white/5 bg-[#0e1424]">
          {formLines.map((fl, i) => {
            const isHighlight = selectedCat && fl.cat && selectedCat.name.includes(fl.cat.split(' ')[0]);
            const threadKey = `th_form_line_${fl.cat || fl.line}_${year}`;
            const lineThread = threads[threadKey];
            const status = lineThread?.status || 'pending';
            const commentCount = lineThread?.comments?.length || 0;

            return (
              <div 
                key={i} 
                onClick={() => {
                  if (fl.cat) {
                    setSelectedFormLine(fl.cat);
                    const match = accounts.find(a => a.name.includes(fl.cat));
                    if (match) setSelectedCat(match);
                  }
                }}
                className={`p-3.5 flex items-center justify-between cursor-pointer transition ${
                  isHighlight ? 'bg-blue-600/25 text-white font-semibold' : 'hover:bg-white/5'
                } ${fl.total ? 'bg-white/5 font-bold border-t border-white/10' : ''}`}
              >
                <div className="flex items-center gap-2">
                  <span className={fl.refund ? 'text-emerald-400' : 'text-white/90'}>{fl.line}</span>
                  {fl.cat && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openReviewPanel('form_line', fl.cat, `Form 1040 Line: ${fl.line}`);
                      }}
                      className={`size-5 rounded-full flex items-center justify-center text-[10px] border transition ${
                        status === 'accepted' ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300' :
                        status === 'rejected' ? 'bg-red-500/20 border-red-500/40 text-red-300' :
                        commentCount > 0 ? 'bg-amber-500/20 border-amber-500/40 text-amber-300' :
                        'bg-white/5 border-white/10 text-white/40 hover:text-white'
                      }`}
                      title="Line Review Thread"
                    >
                      <MessageSquare className="size-2.5" />
                    </button>
                  )}
                </div>

                <span className={`font-mono text-xs ${fl.refund ? 'text-emerald-400 font-bold text-sm' : 'text-white'}`}>
                  ${fl.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
            );
          })}
        </div>

        {/* 1040 Form PDF Draft Canvas */}
        <div className="border border-white/10 rounded-xl p-6 bg-[#070b14] flex flex-col items-center justify-center text-center space-y-3 min-h-[220px]">
          <FileCheck className="size-10 text-blue-400 opacity-60" />
          <div className="space-y-1">
            <h4 className="font-bold text-sm text-white">Form 1040 Draft Preview</h4>
            <p className="text-[11px] text-white/40 max-w-[280px]">
              David Ramsey CPA review version • Reconciled against {accounts.length} categories and supporting docs.
            </p>
          </div>
          <div className="flex gap-2 pt-2">
            <button 
              onClick={() => openReviewPanel('form_line', 'Form 1040 Complete Return', 'Full 1040 Draft Review')}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 rounded font-semibold text-xs text-white transition flex items-center gap-1.5"
            >
              <MessageSquare className="size-3" />
              <span>Review & Make Decision</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const TAX_YEAR_ENTRIES_MAP = {
  2025: [
    { category_id: '1', amount: 0 },
    { category_id: '2', amount: 0 },
    { category_id: '3', amount: 0 },
    { category_id: '4', amount: 0 },
    { category_id: '5', amount: 0 }
  ],
  2024: [
    { category_id: '1', amount: 0 },
    { category_id: '2', amount: 0 },
    { category_id: '3', amount: 153952.00 },
    { category_id: '4', amount: 9200.00 },
    { category_id: '5', amount: 5000.00 }
  ],
  2023: [
    { category_id: '1', amount: 59110.59 },
    { category_id: '2', amount: 0 },
    { category_id: '3', amount: 38376.00 },
    { category_id: '4', amount: 8800.00 },
    { category_id: '5', amount: 3500.00 }
  ],
  2022: [
    { category_id: '1', amount: 0 },
    { category_id: '2', amount: 0 },
    { category_id: '3', amount: 365772.34 },
    { category_id: '4', amount: 8600.00 },
    { category_id: '5', amount: 4800.00 }
  ],
  2021: [
    { category_id: '1', amount: 49793.32 },
    { category_id: '2', amount: 0 },
    { category_id: '3', amount: 67285.01 },
    { category_id: '4', amount: 8500.00 },
    { category_id: '5', amount: 4600.00 }
  ],
  2020: [
    { category_id: '1', amount: 69549.66 },
    { category_id: '2', amount: -44581.92 },
    { category_id: '3', amount: 365772.34 },
    { category_id: '4', amount: 8450.00 },
    { category_id: '5', amount: 4500.00 }
  ],
  2019: [
    { category_id: '1', amount: 84444.89 },
    { category_id: '2', amount: -12500.00 },
    { category_id: '3', amount: 79825.51 },
    { category_id: '4', amount: 7600.00 },
    { category_id: '5', amount: 3800.00 }
  ],
  2018: [
    { category_id: '1', amount: 70399.57 },
    { category_id: '2', amount: -8400.00 },
    { category_id: '3', amount: 485019.41 },
    { category_id: '4', amount: 6200.00 },
    { category_id: '5', amount: 3200.00 }
  ],
  2017: [
    { category_id: '1', amount: 63132.46 },
    { category_id: '2', amount: -44581.92 },
    { category_id: '3', amount: 334565.42 },
    { category_id: '4', amount: 5800.00 },
    { category_id: '5', amount: 2900.00 }
  ]
};

/* ========================================================
   MAIN COMPONENT: FINANCE THREE PANE
   ======================================================== */
export default function FinanceThreePane() {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlYear = searchParams.get('year');
  
  // Persisted Active Tax Year (defaults to 2022 instead of 2020)
  const [year, setYearState] = useState(() => {
    if (urlYear) {
      const parsed = parseInt(urlYear, 10);
      if (!isNaN(parsed)) return parsed;
    }
    try {
      const savedYear = localStorage.getItem('cloudbaud_tax_active_year');
      if (savedYear) {
        const parsed = parseInt(savedYear, 10);
        if (!isNaN(parsed)) return parsed;
      }
    } catch (err) {
      console.debug('Storage access:', err);
    }
    return 2022;
  });

  // Sync URL search query if missing on initial load
  useEffect(() => {
    if (!urlYear && year) {
      setSearchParams(prev => {
        const next = new URLSearchParams(prev);
        next.set('year', String(year));
        return next;
      }, { replace: true });
    }
  }, [urlYear, year, setSearchParams]);

  // Sync state if URL search query changes
  useEffect(() => {
    if (urlYear) {
      const parsed = parseInt(urlYear, 10);
      if (!isNaN(parsed) && parsed !== year) {
        setYearState(parsed);
        try {
          localStorage.setItem('cloudbaud_tax_active_year', String(parsed));
        } catch (err) {
          console.debug('Storage access:', err);
        }
      }
    }
  }, [urlYear, year]);

  const setYear = (newYear) => {
    setYearState(newYear);
    try {
      localStorage.setItem('cloudbaud_tax_active_year', String(newYear));
    } catch (err) {
      console.debug('Storage access:', err);
    }
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      next.set('year', String(newYear));
      return next;
    });
  };

  const [accounts, setAccounts] = useState([
    { id: '1', name: 'W2 Wages', type: 'INCOME' },
    { id: '2', name: 'Comfort Foods', type: 'EXPENSE' },
    { id: '3', name: 'CloudBaud LLC', type: 'INCOME' },
    { id: '4', name: 'Home Office & Utilities', type: 'EXPENSE' },
    { id: '5', name: 'Professional Services / CPA', type: 'EXPENSE' }
  ]);
  const [entries, setEntries] = useState(() => TAX_YEAR_ENTRIES_MAP[year] || TAX_YEAR_ENTRIES_MAP[2022]);
  const [docs, setDocs] = useState([
    { id: 'doc_w2_2020', name: 'Form W-2 Wage Statement.pdf', file_name: 'W2_Wages_2020.pdf', type: 'PDF', created_at: '2026-08-18' },
    { id: 'doc_1099_comfort', name: 'Comfort Foods 1099-K & Ledger.pdf', file_name: 'ComfortFoods_Q4.pdf', type: 'PDF', created_at: '2026-08-18' },
    { id: 'doc_cloudbaud_sch_e', name: 'CloudBaud LLC K-1 & Profit Loss.pdf', file_name: 'CloudBaud_K1_2020.pdf', type: 'PDF', created_at: '2026-08-18' }
  ]);

  const [selectedCat, setSelectedCat] = useState(null);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [selectedFormLine, setSelectedFormLine] = useState(null);
  
  // Persisted Active Tab
  const [activeTab, setActiveTabState] = useState(() => {
    try {
      return localStorage.getItem('cloudbaud_tax_active_tab') || 'worksheet';
    } catch (err) {
      console.debug('Storage access:', err);
      return 'worksheet';
    }
  });

  const setActiveTab = (tab) => {
    setActiveTabState(tab);
    try {
      localStorage.setItem('cloudbaud_tax_active_tab', tab);
    } catch (err) {
      console.debug('Storage access:', err);
    }
  };

  // Persisted Expand / Collapse State for Desktop Panes
  const [isDocsCollapsed, setIsDocsCollapsedState] = useState(() => {
    try {
      return localStorage.getItem('cloudbaud_tax_docs_collapsed') === 'true';
    } catch (err) {
      console.debug('Storage access:', err);
      return false;
    }
  });

  const setIsDocsCollapsed = (val) => {
    setIsDocsCollapsedState(val);
    try {
      localStorage.setItem('cloudbaud_tax_docs_collapsed', String(val));
    } catch (err) {
      console.debug('Storage access:', err);
    }
  };

  const [isFormCollapsed, setIsFormCollapsedState] = useState(() => {
    try {
      return localStorage.getItem('cloudbaud_tax_form_collapsed') === 'true';
    } catch (err) {
      console.debug('Storage access:', err);
      return false;
    }
  });

  const setIsFormCollapsed = (val) => {
    setIsFormCollapsedState(val);
    try {
      localStorage.setItem('cloudbaud_tax_form_collapsed', String(val));
    } catch (err) {
      console.debug('Storage access:', err);
    }
  };

  // Annotation & Review Threads State with localStorage Persistence
  const [threads, setThreads] = useState(() => {
    try {
      const saved = localStorage.getItem(`finance_tax_threads_${year}`);
      return saved ? JSON.parse(saved) : DEFAULT_SAMPLE_THREADS;
    } catch {
      return DEFAULT_SAMPLE_THREADS;
    }
  });

  // Active Review Drawer Target
  const [activeReviewTarget, setActiveReviewTarget] = useState(null);

  // Sync with Supabase API or local multi-year baseline
  useEffect(() => {
    (async () => {
      try {
        const accs = await getChartOfAccounts();
        if (accs && accs.length > 0) setAccounts(accs);
        const ents = await getTaxEntries(year);
        if (ents && ents.length > 0) {
          setEntries(ents);
        } else {
          setEntries(TAX_YEAR_ENTRIES_MAP[year] || TAX_YEAR_ENTRIES_MAP[2022]);
        }
        const myDocs = await getMyDocuments(year);
        if (myDocs && myDocs.length > 0) setDocs(myDocs);
      } catch (e) {
        console.warn('Using local finance baseline data for year', year, e);
        setEntries(TAX_YEAR_ENTRIES_MAP[year] || TAX_YEAR_ENTRIES_MAP[2022]);
      }
    })();
  }, [year]);

  // Save Threads to localStorage
  const handleSaveThread = (updatedThread) => {
    setThreads(prev => {
      const next = { ...prev, [updatedThread.id]: updatedThread };
      localStorage.setItem(`finance_tax_threads_${year}`, JSON.stringify(next));
      return next;
    });
  };

  const openReviewPanel = (targetType, targetId, targetTitle) => {
    setActiveReviewTarget({ targetType, targetId, targetTitle, year });
  };

  const activeReviewThread = useMemo(() => {
    if (!activeReviewTarget) return null;
    const threadKey = `th_${activeReviewTarget.targetType}_${activeReviewTarget.targetId}_${year}`;
    return threads[threadKey] || {
      id: threadKey,
      targetType: activeReviewTarget.targetType,
      targetId: activeReviewTarget.targetId,
      targetTitle: activeReviewTarget.targetTitle,
      year,
      status: 'pending',
      comments: []
    };
  }, [activeReviewTarget, threads, year]);

  const ctx = {
    year,
    setYear,
    accounts,
    entries,
    docs,
    selectedCat,
    setSelectedCat,
    selectedDoc,
    setSelectedDoc,
    selectedFormLine,
    setSelectedFormLine,
    threads,
    openReviewPanel,
    isDocsCollapsed,
    setIsDocsCollapsed,
    isFormCollapsed,
    setIsFormCollapsed
  };

  return (
    <WorkbenchContext.Provider value={ctx}>
      <div className="h-screen w-full flex flex-col bg-[#050811] overflow-hidden">
        {/* MOBILE TABS */}
        <div className="md:hidden flex border-b border-white/10 bg-[#0f172a] text-white text-[13px] shrink-0">
          {[
            { id: 'worksheet', label: 'Worksheet', count: accounts.length },
            { id: 'docs', label: 'Supporting Docs', count: docs.length },
            { id: 'form', label: '1040 Draft', count: null },
          ].map(t => (
            <button 
              key={t.id} 
              onClick={() => setActiveTab(t.id)} 
              className={`flex-1 py-3 relative transition ${
                activeTab === t.id ? 'font-bold border-b-2 border-blue-400 text-white' : 'opacity-60 hover:opacity-100'
              }`}
            >
              {t.label} {t.count !== null && <span className="text-[10px] ml-1 opacity-70">({t.count})</span>}
            </button>
          ))}
        </div>

        {/* WORKFLOW PROGRESS BAR — always visible, hover for audit checklist */}
        <TaxWorkflowProgressBar year={year} onYearChange={setYear} />

        {/* MAIN 3-PANE WORKBENCH */}
        <div className="flex-1 flex overflow-hidden relative">
          {/* DESKTOP: 3 FLEXIBLE / COLLAPSIBLE COLUMNS */}
          <div className="hidden md:flex flex-1 overflow-hidden">
            {/* Pane 1: Worksheet (Expands dynamically when other panes collapse) */}
            <div className={`h-full overflow-hidden transition-all duration-300 ${
              isDocsCollapsed && isFormCollapsed ? 'flex-[3]' :
              isDocsCollapsed || isFormCollapsed ? 'flex-[1.8]' :
              'flex-[1.1] min-w-[280px]'
            }`}>
              <WorksheetPane />
            </div>

            {/* Pane 2: Supporting Docs */}
            <div className={`h-full overflow-hidden transition-all duration-300 ${
              isDocsCollapsed ? 'w-11 shrink-0' :
              isFormCollapsed ? 'flex-[1.5] min-w-[280px]' :
              'flex-[0.9] min-w-[260px]'
            }`}>
              <DocsPane />
            </div>

            {/* Pane 3: WIP (DRAFT) 1040 Return */}
            <div className={`h-full overflow-hidden transition-all duration-300 ${
              isFormCollapsed ? 'w-11 shrink-0' :
              isDocsCollapsed ? 'flex-[1.6] min-w-[320px]' :
              'flex-[1.2] min-w-[320px]'
            }`}>
              <WIPFormPane />
            </div>
          </div>

          {/* MOBILE VIEW */}
          <div className="md:hidden flex-1 overflow-hidden">
            {activeTab === 'worksheet' && <WorksheetPane onSelectAndSwitch={setActiveTab} />}
            {activeTab === 'docs' && <DocsPane onSelectAndSwitch={setActiveTab} />}
            {activeTab === 'form' && <WIPFormPane />}
          </div>

          {/* SLIDE-OUT CPA ANNOTATION & REVIEW PANEL */}
          {activeReviewTarget && (
            <div className="absolute right-0 top-0 bottom-0 w-full sm:w-[420px] z-50 shadow-2xl">
              <AnnotationReviewPanel
                targetType={activeReviewTarget.targetType}
                targetId={activeReviewTarget.targetId}
                targetTitle={activeReviewTarget.targetTitle}
                year={year}
                thread={activeReviewThread}
                onSaveThread={handleSaveThread}
                onClose={() => setActiveReviewTarget(null)}
              />
            </div>
          )}
        </div>
      </div>
    </WorkbenchContext.Provider>
  );
}
