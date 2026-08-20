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
import TaxRibbon from './components/TaxRibbon';
import Form1040ReturnPane from './components/Form1040ReturnPane';

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
    openReviewPanel,
    isDocsCollapsed,
    setIsDocsCollapsed,
    isFormCollapsed,
    setIsFormCollapsed
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
        isDocsCollapsed={isDocsCollapsed}
        setIsDocsCollapsed={setIsDocsCollapsed}
        isFormCollapsed={isFormCollapsed}
        setIsFormCollapsed={setIsFormCollapsed}
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
   PANE 3: FORM 1040 RETURN PANE (ACCORDION & PDF VIEWER)
   ======================================================== */
function Form1040Pane() {
  const { 
    selectedCat, 
    setSelectedFormLine, 
    setSelectedCat, 
    accounts,
    entries,
    threads,
    openReviewPanel,
    year,
    isFormCollapsed,
    setIsFormCollapsed
  } = useWorkbench();

  return (
    <Form1040ReturnPane
      year={year}
      accounts={accounts}
      entries={entries}
      selectedCat={selectedCat}
      setSelectedCat={setSelectedCat}
      setSelectedFormLine={setSelectedFormLine}
      threads={threads}
      openReviewPanel={openReviewPanel}
      isFormCollapsed={isFormCollapsed}
      setIsFormCollapsed={setIsFormCollapsed}
    />
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
            { id: 'form', label: '1040 Return', count: null },
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

        {/* FULL-WIDTH RIBBON — Spans across all 3 panes */}
        <div className="w-full shrink-0 border-b border-white/10">
          <TaxRibbon
            activeYear={year}
            years={[2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017]}
            viewMode="three_pane"
            onYearChange={(newYear) => {
              if (newYear && newYear !== 'summary') {
                setYear(parseInt(newYear, 10));
              }
            }}
            onDocPreview={(fileUrl) => {
              const fileName = fileUrl.split('/').pop();
              const found = docs.find(d => d.name === fileName) || { name: fileName, hasFile: true, type: 'PDF' };
              setSelectedDoc(found);
            }}
            onSave={() => {
              console.log('Worksheet and documents saved.');
            }}
          />
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

            {/* Pane 3: Form 1040 Return (Accordion & PDF Preview) */}
            <div className={`h-full overflow-hidden transition-all duration-300 ${
              isFormCollapsed ? 'w-11 shrink-0' :
              isDocsCollapsed ? 'flex-[1.6] min-w-[320px]' :
              'flex-[1.2] min-w-[320px]'
            }`}>
              <Form1040Pane />
            </div>
          </div>

          {/* MOBILE VIEW */}
          <div className="md:hidden flex-1 overflow-hidden">
            {activeTab === 'worksheet' && <WorksheetPane onSelectAndSwitch={setActiveTab} />}
            {activeTab === 'docs' && <DocsPane onSelectAndSwitch={setActiveTab} />}
            {activeTab === 'form' && <Form1040Pane />}
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
